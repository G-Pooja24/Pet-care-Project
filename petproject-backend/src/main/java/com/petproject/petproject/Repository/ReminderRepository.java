package com.petproject.petproject.repository;



import com.petproject.petproject.entity.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {

    // Find reminders for a specific pet
    List<Reminder> findByPet_Id(Long petId);

    // Find all reminders that are due and not yet notified
    List<Reminder> findByNotifiedFalseAndDueDateBefore(LocalDateTime dateTime);

    // Find reminders for an owner (when you map pet->owner later)
    List<Reminder> findByPet_IdIn(List<Long> petIds);

    // Debugging: Find all pending reminders
    List<Reminder> findByNotifiedFalse();
}

