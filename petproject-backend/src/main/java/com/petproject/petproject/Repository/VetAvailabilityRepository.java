package com.petproject.petproject.repository;

import com.petproject.petproject.entity.VetAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface VetAvailabilityRepository extends JpaRepository<VetAvailability, Long> {
    // Find all slots for a specific vet
    List<VetAvailability> findByVetId(Long vetId);

    // Find available slots (not booked) after a specific time (useful for fetching upcoming slots)
    List<VetAvailability> findByVetIdAndStartTimeAfter(Long vetId, LocalDateTime time);

    // Find ONLY unbooked slots for a specific vet after a specific time
    List<VetAvailability> findByVetIdAndIsBookedFalseAndStartTimeAfter(Long vetId, LocalDateTime time);
    
    // Find ALL available slots for search
    List<VetAvailability> findByIsBookedFalseAndStartTimeAfter(LocalDateTime time);
}
