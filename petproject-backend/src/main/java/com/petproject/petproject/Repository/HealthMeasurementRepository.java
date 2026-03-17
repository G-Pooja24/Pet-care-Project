package com.petproject.petproject.repository;

import com.petproject.petproject.entity.HealthMeasurement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HealthMeasurementRepository extends JpaRepository<HealthMeasurement, Long> {
    List<HealthMeasurement> findByPet_IdOrderByMeasurementDateAsc(Long petId);
}
