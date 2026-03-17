package com.petproject.petproject.controller;

import com.petproject.petproject.entity.Appointment;
import com.petproject.petproject.entity.VetAvailability;
import com.petproject.petproject.entity.User;
import com.petproject.petproject.repository.AppointmentRepository;
import com.petproject.petproject.repository.VetAvailabilityRepository;
import com.petproject.petproject.repository.UserRepository;
import com.petproject.petproject.service.JwtService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepo;

    @Autowired
    private VetAvailabilityRepository availabilityRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private com.petproject.petproject.repository.PetRepository petRepo;

    @Autowired
    private com.petproject.petproject.service.EmailService emailService;

    @Autowired
    private org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    // 1. Book an Appointment (Pet Owner)
    // Supports POST /api/appointments
    @PostMapping
    @Transactional // Ensure atomicity
    public Appointment bookAppointment(@RequestHeader("Authorization") String token,
                                       @RequestBody Map<String, Object> request) {
        String email = jwtService.extractEmail(token.replace("Bearer ", ""));
        User owner = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        System.out.println("DEBUG: Booking Request Data: " + request);

        if (request.get("slotId") == null || request.get("petId") == null) {
            throw new RuntimeException("Missing slotId or petId in request");
        }

        Long slotId = Long.valueOf(request.get("slotId").toString());
        Long petId = Long.valueOf(request.get("petId").toString());
        String notes = (String) request.get("notes");

        // Fetch Slot
        VetAvailability slot = availabilityRepo.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        System.out.println("DEBUG: Slot ID " + slotId + " isBooked state: " + slot.getIsBooked());

        // Check Capacity
        long currentBookings = appointmentRepo.countBySlotIdAndStatusIn(slotId, 
            java.util.List.of(Appointment.Status.CONFIRMED, Appointment.Status.PENDING));

        if (currentBookings >= slot.getCapacity()) {
            throw new RuntimeException("Slot is fully booked! Capacity reached.");
        }

        // Auto-correct isBooked flag if getting out of sync (optional safety)
        if (slot.getIsBooked() && currentBookings < slot.getCapacity()) {
             System.out.println("DEBUG: Slot ID " + slotId + " isBooked=true but capacity not reached. Proceeding...");
        }

        // Mark Slot as Booked ONLY if capacity is now reached
        if (currentBookings + 1 >= slot.getCapacity()) {
            slot.setIsBooked(true);
            availabilityRepo.save(slot);
        }

        // Create Appointment
        Appointment appointment = new Appointment();
        appointment.setOwnerId(owner.getId());
        appointment.setPetId(petId);
        appointment.setVetId(slot.getVetId());
        appointment.setSlot(slot);
        appointment.setStatus(Appointment.Status.PENDING); // Default to PENDING
        appointment.setConsultationNotes(notes);
        appointment.setIsNewForVet(true); // Flag for dashboard alert
        
        // If ONLINE, generate link (Mock) or use provided one
        if (slot.getMode() == VetAvailability.Mode.ONLINE) {
            if (request.containsKey("meetingLink") && request.get("meetingLink") != null) {
                appointment.setMeetingLink((String) request.get("meetingLink"));
            } else {
                appointment.setMeetingLink("https://meet.google.com/hoz-xwsa-sid");
            }
        }

        // Populate Vet Name for immediate use
        User vet = userRepo.findById(slot.getVetId()).orElseThrow(() -> new RuntimeException("Vet not found"));
        appointment.setVetName(vet.getName());

        Appointment savedApp = appointmentRepo.save(appointment);

        // --- Notifications ---
        try {
            // 1. WebSocket notification to Vet (New Request)
            messagingTemplate.convertAndSend("/topic/vet/" + vet.getId(), 
                (Object) Map.of("type", "NEW_APPOINTMENT", "message", "New appointment request for " + slot.getStartTime()));
            System.out.println("SUCCESS: WebSocket notification sent to Vet ID " + vet.getId());

        } catch (Exception e) {
            System.err.println("ERROR during notifications: " + e.getMessage());
        }

        return savedApp;
    }

    // 2. Get My Appointments (Owner)
    @GetMapping("/my-appointments")
    public List<Appointment> getMyAppointments(@RequestHeader("Authorization") String token) {
        String email = jwtService.extractEmail(token.replace("Bearer ", ""));
        User user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        List<Appointment> apps = appointmentRepo.findByOwnerId(user.getId());
        apps.forEach(app -> {
             userRepo.findById(app.getVetId()).ifPresent(vet -> app.setVetName(vet.getName()));
        });
        return apps;
    }

    // 3. Get Vet's Appointments (Vet)
    @GetMapping("/vet-appointments")
    public List<Appointment> getVetAppointments(@RequestHeader("Authorization") String token) {
        String email = jwtService.extractEmail(token.replace("Bearer ", ""));
        User vet = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("Vet not found"));
        
        List<Appointment> apps = appointmentRepo.findByVetId(vet.getId());
        apps.forEach(app -> {
             userRepo.findById(app.getOwnerId()).ifPresent(owner -> app.setOwnerName(owner.getName()));
             petRepo.findById(app.getPetId()).ifPresent(pet -> app.setPetName(pet.getName()));
        });
        return apps;
    }

    // 4. Update Status (Vet)
    @PutMapping("/{id}/status")
    @org.springframework.transaction.annotation.Transactional
    public Appointment updateStatus(@RequestHeader("Authorization") String token,
                                    @PathVariable Long id,
                                    @RequestParam String status) {
        return performStatusUpdate(token, id, status);
    }

    // Support for PATCH via Body (more flexible for some frontends)
    @PatchMapping("/{id}/status")
    @org.springframework.transaction.annotation.Transactional
    public Appointment patchStatus(@RequestHeader("Authorization") String token,
                                   @PathVariable Long id,
                                   @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return performStatusUpdate(token, id, status);
    }

    // 6. Confirm Appointment (Vet Only)
    @PutMapping("/{id}/confirm")
    @Transactional
    public Appointment confirmAppointment(@RequestHeader("Authorization") String token,
                                          @PathVariable Long id) {
        String email = jwtService.extractEmail(token.replace("Bearer ", ""));
        User vet = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("Vet not found"));

        Appointment appointment = appointmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appointment.getVetId().equals(vet.getId())) {
             throw new RuntimeException("Unauthorized: Only the assigned vet can confirm this appointment");
        }

        if (appointment.getStatus() != Appointment.Status.PENDING) {
             throw new RuntimeException("Appointment is not in PENDING state");
        }

        appointment.setStatus(Appointment.Status.CONFIRMED);
        Appointment saved = appointmentRepo.save(appointment);

        // --- Notifications (Moved here) ---
        try {
            // 1. Send Email Confirmation to Owner
            User owner = userRepo.findById(appointment.getOwnerId()).orElseThrow();
            String ownerName = owner.getName();
            
            // Get Pet Name
            String petName = "Your Pet"; // Default
            if (appointment.getPetId() != null) {
                 petName = petRepo.findById(appointment.getPetId())
                     .map(com.petproject.petproject.entity.Pet::getName).orElse("Your Pet");
            }

            String dateStr = appointment.getSlot().getStartTime().toLocalDate().toString();
            String timeStr = appointment.getSlot().getStartTime().toLocalTime().toString();
            String modeStr = appointment.getSlot().getMode().toString();
            String meetingLink = appointment.getMeetingLink();
            
            emailService.sendBookingConfirmation(owner.getEmail(), ownerName, petName, dateStr, timeStr, vet.getName(), modeStr, meetingLink);
            System.out.println("SUCCESS: Booking confirmation email sent to " + owner.getEmail());

            // 2. WebSocket Update (Optional - to refresh UI)
             messagingTemplate.convertAndSend("/topic/vet/" + vet.getId(), 
                (Object) Map.of("type", "APPOINTMENT_CONFIRMED", "id", id));

        } catch (Exception e) {
            System.err.println("ERROR during confirmation notifications: " + e.getMessage());
        }

        return saved;
    }

    private Appointment performStatusUpdate(String token, Long id, String status) {
        String email = jwtService.extractEmail(token.replace("Bearer ", ""));
        User user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        Appointment appointment = appointmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        Appointment.Status newStatus = Appointment.Status.valueOf(status.toUpperCase());
        Appointment.Status oldStatus = appointment.getStatus(); // Capture old status for comparison
        
        // Check Authorization Logic
        if (user.getId().equals(appointment.getVetId())) {
            // Vet can do anything logic (usually used for CANCEL or COMPLETED)
        } else if (user.getId().equals(appointment.getOwnerId())) {
            // Owner Logic
            if (newStatus == Appointment.Status.CANCELLED) {
                if (appointment.getStatus() != Appointment.Status.PENDING) {
                     throw new RuntimeException("Owners can only cancel PENDING appointments. Please contact the clinic.");
                }
            } else {
                 throw new RuntimeException("Unauthorized status change for Owner");
            }
        } else {
             throw new RuntimeException("Unauthorized");
        }

        System.out.println("DEBUG: Updating Appointment " + id + " to status: " + newStatus);
        
        // Fix Duplicate Emails: Check if status is actually changing
        boolean statusChangedToConfirmed = (oldStatus != Appointment.Status.CONFIRMED && newStatus == Appointment.Status.CONFIRMED);

        appointment.setStatus(newStatus);
        
        if (user.getId().equals(appointment.getVetId())) {
            appointment.setIsNewForVet(false); 
        }

        // If cancelled, release the slot
        if (newStatus == Appointment.Status.CANCELLED && appointment.getSlot() != null) {
            VetAvailability slot = appointment.getSlot();
            System.out.println("DEBUG: Releasing Slot ID " + slot.getId() + " because appointment was cancelled.");
            slot.setIsBooked(false);
            availabilityRepo.save(slot);
        }

        Appointment saved = appointmentRepo.save(appointment);
        System.out.println("DEBUG: Appointment status updated successfully.");

        // Send Email if Confirmed (Handling generic status update)
        // BUG FIX: Only send if status CHANGED to CONFIRMED
        if (statusChangedToConfirmed) {
            try {
                User owner = userRepo.findById(appointment.getOwnerId()).orElseThrow();
                User vet = userRepo.findById(appointment.getVetId()).orElseThrow();
                
                String ownerName = owner.getName();
                String petName = "Your Pet";
                if (appointment.getPetId() != null) {
                     petName = petRepo.findById(appointment.getPetId())
                         .map(com.petproject.petproject.entity.Pet::getName).orElse("Your Pet");
                }

                String dateStr = appointment.getSlot().getStartTime().toLocalDate().toString();
                String timeStr = appointment.getSlot().getStartTime().toLocalTime().toString();
                String modeStr = appointment.getSlot().getMode().toString();
                String meetingLink = appointment.getMeetingLink();
                
                emailService.sendBookingConfirmation(owner.getEmail(), ownerName, petName, dateStr, timeStr, vet.getName(), modeStr, meetingLink);
                System.out.println("SUCCESS: Booking confirmation email sent to " + owner.getEmail() + " (via status update)");
            } catch (Exception e) {
                System.err.println("ERROR sending confirmation email: " + e.getMessage());
            }
        }

        return saved;
    }

    // 7. Save Consultation Details (Vet Only)
    @PutMapping("/{id}/consultation")
    @Transactional
    public Appointment saveConsultationDetails(@RequestHeader("Authorization") String token,
                                               @PathVariable Long id,
                                               @RequestBody Map<String, String> body) {
        String email = jwtService.extractEmail(token.replace("Bearer ", ""));
        User vet = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("Vet not found"));

        Appointment appointment = appointmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appointment.getVetId().equals(vet.getId())) {
             throw new RuntimeException("Unauthorized: Only the assigned vet can add consultation details");
        }

        if (body.containsKey("consultationNotes")) {
            appointment.setConsultationNotes(body.get("consultationNotes"));
        }
        if (body.containsKey("prescription")) {
            appointment.setPrescription(body.get("prescription"));
        }

        return appointmentRepo.save(appointment);
    }

    // 5. Smart GET (Auto-detect logic for Frontend compliance)
    @GetMapping
    public List<Appointment> getAppointments(@RequestHeader("Authorization") String token) {
        String email = jwtService.extractEmail(token.replace("Bearer ", ""));
        User user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        List<Appointment> apps;
        if (user.getRole() == com.petproject.petproject.entity.Role.VETERINARIAN) {
             apps = appointmentRepo.findByVetId(user.getId());
             // Populate Owner & Pet Name for Vet
             apps.forEach(app -> {
                 userRepo.findById(app.getOwnerId()).ifPresent(owner -> app.setOwnerName(owner.getName()));
                 petRepo.findById(app.getPetId()).ifPresent(pet -> app.setPetName(pet.getName()));
             });
        } else {
             apps = appointmentRepo.findByOwnerId(user.getId());
             // Populate Vet Name for Owner
             apps.forEach(app -> {
                 userRepo.findById(app.getVetId()).ifPresent(vet -> app.setVetName(vet.getName()));
             });
        }
        
        return apps;
    }
}
