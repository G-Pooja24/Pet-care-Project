// package com.petproject.petproject.service;



// import com.petproject.petproject.Repository.ReminderRepository;
// import com.petproject.petproject.entity.Reminder;
// import org.springframework.scheduling.annotation.Scheduled;
// import org.springframework.stereotype.Component;
// import java.time.LocalDateTime;
// import java.util.List;


// @Component
// public class ReminderScheduler {
// private final ReminderRepository reminderRepo;
// private final EmailService emailService;
// public ReminderScheduler(ReminderRepository reminderRepo, EmailService emailService){
// this.reminderRepo = reminderRepo; this.emailService = emailService;
// }


// // run every minute (adjust for production)
// @Scheduled(fixedDelay = 60000)
// public void checkReminders(){
// LocalDateTime now = LocalDateTime.now();
// List<Reminder> due = reminderRepo.findByNotifiedFalseAndDueDateBefore(now.plusMinutes(1));
// for(Reminder r: due){
// // fetch owner email by pet->owner lookup (simplified)
// String ownerEmail = "owner@example.com"; // implement proper lookup
// emailService.sendSimpleEmail(ownerEmail, "Pet reminder: "+r.getType(), "Reminder due for pet id: "+r.getPetId());
// r.setNotified(true);
// reminderRepo.save(r);
// }
// }
// }