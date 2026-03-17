package com.petproject.petproject.scheduler;

import com.petproject.petproject.entity.Appointment;
import com.petproject.petproject.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class AppointmentScheduler {

    @Autowired
    private AppointmentRepository appointmentRepo;

    // Check every minute
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void markCompletedAppointments() {
        LocalDateTime now = LocalDateTime.now();
        
        // Find appointments that are CONFIRMED and slot end time is in the past
        List<Appointment> pastAppointments = appointmentRepo.findByStatusAndSlot_EndTimeBefore(
                Appointment.Status.CONFIRMED, now);
        
        if (!pastAppointments.isEmpty()) {
            System.out.println("SCHEDULER: Found " + pastAppointments.size() + " appointments to auto-complete.");
            for (Appointment app : pastAppointments) {
                app.setStatus(Appointment.Status.COMPLETED);
                app.setIsNewForVet(false); // Clear alert flag if any
            }
            appointmentRepo.saveAll(pastAppointments);
            System.out.println("SCHEDULER: Marked " + pastAppointments.size() + " appointments as COMPLETED.");
        }
    }
}
