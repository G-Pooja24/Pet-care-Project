package com.petproject.petproject.repository;

import com.petproject.petproject.entity.VetProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface VetProfileRepository extends JpaRepository<VetProfile, Long> {
    Optional<VetProfile> findFirstByEmail(String email);
    Optional<VetProfile> findByUserId(Long userId);

    // Search methods
    List<VetProfile> findBySpecializationContainingIgnoreCase(String specialization);
    List<VetProfile> findByClinicAddressContainingIgnoreCase(String clinicAddress);
    List<VetProfile> findBySpecializationContainingIgnoreCaseAndClinicAddressContainingIgnoreCase(String specialization, String clinicAddress);
}
