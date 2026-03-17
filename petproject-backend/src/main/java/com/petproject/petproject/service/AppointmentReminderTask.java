package com.petproject.petproject.service;

import com.petproject.petproject.entity.Appointment;
import com.petproject.petproject.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class AppointmentReminderTask {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private EmailService emailService;

    // Runs every 5 minutes for faster testing and better reliability
    @Scheduled(cron = "0 */5 * * * *")
    @org.springframework.transaction.annotation.Transactional
    public void checkAndSendReminders() {
        LocalDateTime now = LocalDateTime.now();
        System.out.println("DEBUG: AppointmentReminderTask running at " + now);
        
        // --- 24-Hour Reminders ---
        // Look for appointments starting between 23 and 25 hours from now to be safe
        LocalDateTime tomorrowStart = now.plusHours(23);
        LocalDateTime tomorrowEnd = now.plusHours(25);
        List<Appointment> apps24h = appointmentRepository.findPending24hReminders(tomorrowStart, tomorrowEnd);
        System.out.println("DEBUG: Found " + apps24h.size() + " pending 24h reminders");
        
        for (Appointment app : apps24h) {
            if (app.getOwner() != null && app.getOwner().getEmail() != null) {
                try {
                    emailService.sendReminder(app.getOwner().getEmail(), "24 hours");
                    app.setReminder24hSent(true);
                    appointmentRepository.save(app);
                    System.out.println("LOG: 24h Reminder sent for appointment ID: " + app.getId());
                } catch (Exception e) {
                    System.err.println("ERROR 24h reminder: " + e.getMessage());
                }
            }
        }

        // --- 1-Hour Reminders ---
        // Look for appointments starting between 30 and 90 minutes from now
        LocalDateTime nextHourStart = now.plusMinutes(30);
        LocalDateTime nextHourEnd = now.plusMinutes(90);
        List<Appointment> apps1h = appointmentRepository.findPending1hReminders(nextHourStart, nextHourEnd);
        System.out.println("DEBUG: Found " + apps1h.size() + " pending 1h reminders");
        
        for (Appointment app : apps1h) {
            if (app.getOwner() != null && app.getOwner().getEmail() != null) {
                try {
                    emailService.sendReminder(app.getOwner().getEmail(), "1 hour");
                    app.setReminder1hSent(true);
                    appointmentRepository.save(app);
                    System.out.println("LOG: 1h Reminder sent for appointment ID: " + app.getId());
                } catch (Exception e) {
                    System.err.println("ERROR 1h reminder: " + e.getMessage());
                }
            }
        }
    }
}
