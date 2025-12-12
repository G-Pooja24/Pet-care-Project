package com.petproject.petproject.Repository;

import com.petproject.petproject.entity.VetProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface VetProfileRepository extends JpaRepository<VetProfile, Long> {
    Optional<VetProfile> findByEmail(String email);
}
