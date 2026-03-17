package com.petproject.petproject.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import com.petproject.petproject.entity.Reminder;
import com.petproject.petproject.repository.ReminderRepository;
import com.petproject.petproject.entity.Pet;
import com.petproject.petproject.repository.PetRepository;

@RestController
@RequestMapping("/api/reminders")
@CrossOrigin(origins = "http://localhost:3000")

public class ReminderController {

    @Autowired
    private ReminderRepository reminderRepository;

    @Autowired
    private PetRepository petRepository;

    @PostMapping
    public Reminder addReminder(@RequestBody com.petproject.petproject.entity.ReminderDTO r) {
        System.out.println("Received ReminderDTO: " + r); // Debugging log
        if (r.getPetId() == null) {
             throw new RuntimeException("Pet ID is required. Received DTO: " + r);
        }
        Pet pet = petRepository.findById(r.getPetId()).orElseThrow(() -> new RuntimeException("Pet not found"));
        
        Reminder reminder = new Reminder();
        reminder.setPet(pet);
        reminder.setType(r.getType());
        reminder.setDueDate(r.getDueDate().atStartOfDay());
        reminder.setRepeatRule(r.getRepeatRule());
        
        return reminderRepository.save(reminder);
    }

    // Support fetching all or by query param if needed, though typically frontend should use specific endpoint.
    // If frontend calls /api/reminders?petId=123
    @GetMapping
    public List<Reminder> getAllReminders(@RequestParam(required = false) Long petId) {
        if (petId != null) {
            return reminderRepository.findByPet_Id(petId);
        }
        return reminderRepository.findAll();
    }


    @PostMapping("/pet/{petId}")
    public Reminder addReminder(@PathVariable Long petId, @RequestBody Reminder r) {
        Pet pet = petRepository.findById(petId).orElseThrow(() -> new RuntimeException("Pet not found"));
        r.setPet(pet);
        return reminderRepository.save(r);
    }
    
    @GetMapping("/pet/{petId}")
    public List<Reminder> getRemindersByPet(@PathVariable Long petId) {
        return reminderRepository.findByPet_Id(petId);
    }

    @PutMapping("/{id}")
    public Reminder updateReminder(@PathVariable Long id,
                                   @RequestBody Reminder r) {

        Reminder rem = reminderRepository.findById(id).orElseThrow(() -> new RuntimeException("Reminder not found"));

        rem.setType(r.getType());
        rem.setDueDate(r.getDueDate());
        rem.setRepeatRule(r.getRepeatRule());

        return reminderRepository.save(rem);
    }

    @DeleteMapping("/{id}")
    public void deleteReminder(@PathVariable Long id) {
        reminderRepository.deleteById(id);
    }

    @Autowired
    private com.petproject.petproject.service.ReminderScheduler reminderScheduler;

    @PostMapping("/test-email")
    public String triggerManualCheck() {
        return reminderScheduler.checkReminders();
    }
}