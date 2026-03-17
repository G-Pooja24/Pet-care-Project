package com.petproject.petproject.repository;

import com.petproject.petproject.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    // Find appointments for a specific vet
    List<Appointment> findByVetId(Long vetId);

    // Find appointments for a specific pet owner
    List<Appointment> findByOwnerId(Long ownerId);
    
    // Find appointments by status (optional)
    List<Appointment> findByVetIdAndStatus(Long vetId, Appointment.Status status);

    @org.springframework.data.jpa.repository.Query("SELECT a FROM Appointment a WHERE a.slot.startTime >= :startTime AND a.slot.startTime < :endTime AND a.status = 'CONFIRMED' AND a.reminder24hSent = false")
    List<Appointment> findPending24hReminders(
        @org.springframework.data.repository.query.Param("startTime") java.time.LocalDateTime startTime,
        @org.springframework.data.repository.query.Param("endTime") java.time.LocalDateTime endTime
    );

    @org.springframework.data.jpa.repository.Query("SELECT a FROM Appointment a WHERE a.slot.startTime >= :startTime AND a.slot.startTime < :endTime AND a.status = 'CONFIRMED' AND a.reminder1hSent = false")
    List<Appointment> findPending1hReminders(
        @org.springframework.data.repository.query.Param("startTime") java.time.LocalDateTime startTime,
        @org.springframework.data.repository.query.Param("endTime") java.time.LocalDateTime endTime
    );

    boolean existsBySlotIdAndStatusIn(Long slotId, java.util.Collection<Appointment.Status> statuses);

    long countBySlotIdAndStatusIn(Long slotId, java.util.Collection<Appointment.Status> statuses);

    List<Appointment> findByStatusAndSlot_EndTimeBefore(Appointment.Status status, java.time.LocalDateTime dateTime);
}
