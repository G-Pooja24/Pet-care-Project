package com.petproject.petproject.service;

import com.petproject.petproject.repository.ReminderRepository;
import com.petproject.petproject.entity.Reminder;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.List;


@Component
public class ReminderScheduler {
    private final ReminderRepository reminderRepo;
    private final EmailService emailService;
    private final com.petproject.petproject.repository.OwnerProfileRepository ownerProfileRepo;
    
    public ReminderScheduler(ReminderRepository reminderRepo, EmailService emailService, com.petproject.petproject.repository.OwnerProfileRepository ownerProfileRepo){
        this.reminderRepo = reminderRepo; 
        this.emailService = emailService;
        this.ownerProfileRepo = ownerProfileRepo;
    }


    // Run daily at 18:35 (6:35 PM)
    @Scheduled(cron = "0 35 18 * * ?")
    public String checkReminders(){
        StringBuilder log = new StringBuilder();
        LocalDateTime now = LocalDateTime.now();
        log.append("Server Time: ").append(now).append("\n");
        
        // FEATURE: Notify 24 hours in advance of the Due Date
        LocalDateTime lookahead = now.plusDays(1);
        log.append("Checking for reminders due before: ").append(lookahead).append(" (24-Hour Advance Notice)\n");

        // Debug: Check all pending reminders to see status
        List<Reminder> allPending = reminderRepo.findByNotifiedFalse();
        log.append("Total Pending (Notified=false) Reminders in DB: ").append(allPending.size()).append("\n");
        
        for (Reminder p : allPending) {
             boolean isDue = p.getDueDate().isBefore(lookahead);
             log.append(" - ID:").append(p.getId())
                .append(" Due:").append(p.getDueDate())
                .append(" -> ").append(isDue ? "DUE (Within 24h)" : "FUTURE (More than 24h away)")
                .append("\n");
        }

        List<Reminder> due = reminderRepo.findByNotifiedFalseAndDueDateBefore(lookahead);
        log.append("Processing ").append(due.size()).append(" due reminders...\n");
        
        for(Reminder r: due){
            if (r.getPet() == null || r.getPet().getOwnerId() == null) {
                log.append("  [x] ID:").append(r.getId()).append(": Skipped (Missing Pet/Owner)\n");
                continue;
            }

            // User confirmed Pet.ownerId matches OwnerProfile.id
            Long ownerId = r.getPet().getOwnerId(); 
            com.petproject.petproject.entity.OwnerProfile profile = ownerProfileRepo.findById(ownerId).orElse(null);
            
            log.append("  [?] Processing Pet ID:").append(r.getPet().getId())
               .append(", OwnerID from Pet:").append(ownerId);

            if (profile == null) {
                 log.append(" -> ERROR: OwnerProfile NOT found for ID ").append(ownerId).append("\n");
            } else if (profile.getEmail() == null || profile.getEmail().isEmpty()) {
                 log.append(" -> ERROR: OwnerProfile found (ID ").append(profile.getId()).append(") but Email is NULL/Empty\n");
            } else {
                log.append(" -> Found Profile Email: ").append(profile.getEmail());
            }

            if (profile != null && profile.getEmail() != null && !profile.getEmail().isEmpty()) {
                log.append("  [>] ID:").append(r.getId()).append(": Sending email to ").append(profile.getEmail()).append(" (Owner Profile ID: ").append(profile.getId()).append(")...");
                try {
                    String subject = "Pet Reminder: " + r.getType() + " for " + r.getPet().getName();
                    String ownerName = (profile.getName() != null) ? profile.getName() : "Pet Owner";
                    String petName = r.getPet().getName();
                    String dueDate = r.getDueDate().toLocalDate().toString();
                    String notes = (r.getMetadata() != null && !r.getMetadata().isEmpty()) ? r.getMetadata() : r.getRepeatRule().toString();

                    String htmlBody = 
                        "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;\">" +
                        "  <h2 style=\"color: #4A90E2; text-align: center;\">🐾 Pet Reminder: " + r.getType() + "</h2>" +
                        "  <p>Hello <strong>" + ownerName + "</strong>,</p>" +
                        "  <p>This is a friendly reminder for your pet, <strong>" + petName + "</strong>.</p>" +
                        "  <div style=\"background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;\">" +
                        "    <p><strong>📅 Due Date:</strong> " + dueDate + "</p>" +
                        "    <p><strong>📌 Reminder Type:</strong> " + r.getType() + "</p>" +
                        "    <p><strong>📝 Notes:</strong> " + notes + "</p>" +
                        "  </div>" +
                        "  <p style=\"color: #666; font-size: 14px;\">Please mark this as complete in your dashboard once attended to.</p>" +
                        "  <hr style=\"border: 0; border-top: 1px solid #eee; margin: 20px 0;\">" +
                        "  <p style=\"text-align: center; color: #888; font-size: 12px;\">" +
                        "    Pet Care Assistant App<br>" +
                        "    <a href=\"http://localhost:3000\" style=\"color: #4A90E2;\">Open Dashboard</a>" +
                        "  </p>" +
                        "</div>";

                    emailService.sendHtmlEmail(profile.getEmail(), subject, htmlBody);
                    r.setNotified(true);
                    reminderRepo.save(r);
                    log.append(" Success!\n");
                } catch (Exception e) {
                    log.append(" Failed (").append(e.getMessage()).append(")\n");
                    e.printStackTrace();
                }
            } else {
                log.append("  [x] ID:").append(r.getId()).append(": Skipped (No Email found for Owner ID ").append(ownerId).append(")\n");
            }
        }
        return log.toString();
    }
}
