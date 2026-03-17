package com.petproject.petproject.controller;

import com.petproject.petproject.entity.VetAvailability;
import com.petproject.petproject.entity.User;
import com.petproject.petproject.repository.VetAvailabilityRepository;
import com.petproject.petproject.repository.UserRepository;
import com.petproject.petproject.service.JwtService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/vets/slots")
public class VetAvailabilityController {

    @Autowired
    private VetAvailabilityRepository availabilityRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private JwtService jwtService;

    // 1. Create a Slot (Vet Only)
    // 1. Create a Slot (Vet Only)
    @PostMapping
    public VetAvailability createSlot(@RequestHeader("Authorization") String token,
                                      @RequestBody com.petproject.petproject.dto.VetSlotRequest request) {
        String email = jwtService.extractEmail(token.replace("Bearer ", ""));
        User vet = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("Vet not found"));

        // Parse Strings to LocalDateTime
        java.time.LocalDate datePart = java.time.LocalDate.parse(request.getDate()); // "2025-12-26"
        java.time.LocalTime startPart = java.time.LocalTime.parse(request.getStartTime()); // "10:00"
        java.time.LocalTime endPart = java.time.LocalTime.parse(request.getEndTime()); // "11:00"

        LocalDateTime startDateTime = LocalDateTime.of(datePart, startPart);
        LocalDateTime endDateTime = LocalDateTime.of(datePart, endPart);

        // Parse Mode (Smart Match)
        VetAvailability.Mode mode;
        if (request.getMode().equalsIgnoreCase("In-Clinic")) {
            mode = VetAvailability.Mode.CLINIC;
        } else if (request.getMode().equalsIgnoreCase("Video Call") || request.getMode().equalsIgnoreCase("Online")) {
            mode = VetAvailability.Mode.ONLINE;
        } else {
            mode = VetAvailability.Mode.valueOf(request.getMode().toUpperCase());
        }

        VetAvailability slot = new VetAvailability();
        slot.setVetId(vet.getId());
        slot.setStartTime(startDateTime);
        slot.setEndTime(endDateTime);
        slot.setMode(mode);
        slot.setCapacity(request.getCapacity() != null ? request.getCapacity() : 1);
        slot.setIsBooked(false);
        
        return availabilityRepo.save(slot);
    }

    // 2. Get My Slots (Vet Only)
    // Supports both /my-slots and root /
    @GetMapping({"", "/", "/my-slots"})
    public List<VetAvailability> getMySlots(@RequestHeader("Authorization") String token) {
        String email = jwtService.extractEmail(token.replace("Bearer ", ""));
        System.out.println("Fetching slots for email: " + email);
        
        User vet = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("Vet not found"));
        System.out.println("Vet ID: " + vet.getId());
        
        // Fetch all slots (could filter by future date)
        List<VetAvailability> slots = availabilityRepo.findByVetId(vet.getId());
        System.out.println("Slots found: " + slots.size());
        
        return slots;
    }

    @Autowired
    private com.petproject.petproject.repository.AppointmentRepository appointmentRepo;

    // 3. Get Slots for a specific Vet (Public/Owner)
    @GetMapping("/{vetId}")
    public List<VetAvailability> getSlotsForVet(@PathVariable Long vetId) {
        // Fetch ALL future slots to verify availability (Self-Healing Logic)
        List<VetAvailability> allFutureSlots = availabilityRepo.findByVetIdAndStartTimeAfter(vetId, LocalDateTime.now());
        
        // Filter and Auto-Correct
        return allFutureSlots.stream().filter(slot -> {
             long bookingCount = appointmentRepo.countBySlotIdAndStatusIn(slot.getId(), 
                 java.util.List.of(com.petproject.petproject.entity.Appointment.Status.CONFIRMED, 
                                   com.petproject.petproject.entity.Appointment.Status.PENDING));
             
             boolean isActuallyFull = bookingCount >= slot.getCapacity();
             
             // Auto-fix DB data if inconsistent
             if (isActuallyFull && !slot.getIsBooked()) {
                 slot.setIsBooked(true);
                 availabilityRepo.save(slot);
             } else if (!isActuallyFull && slot.getIsBooked()) {
                 slot.setIsBooked(false);
                 availabilityRepo.save(slot);
             }
             
             return !isActuallyFull;
        }).collect(java.util.stream.Collectors.toList());
    }

    // 4. Delete a Slot (Vet Only)
    @DeleteMapping("/{id}")
    public void deleteSlot(@RequestHeader("Authorization") String token,
                           @PathVariable Long id) {
        String email = jwtService.extractEmail(token.replace("Bearer ", ""));
        User vet = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("Vet not found"));

        VetAvailability slot = availabilityRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        if (!slot.getVetId().equals(vet.getId())) {
            throw new RuntimeException("Unauthorized to delete this slot");
        }
        
        if (slot.getIsBooked()) {
             throw new RuntimeException("Cannot delete a booked slot");
        }

        availabilityRepo.delete(slot);
    }
}
