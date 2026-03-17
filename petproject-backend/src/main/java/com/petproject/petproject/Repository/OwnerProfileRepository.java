package com.petproject.petproject.repository;

import com.petproject.petproject.entity.OwnerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OwnerProfileRepository extends JpaRepository<OwnerProfile, Long> {
    Optional<OwnerProfile> findByEmail(String email);
    Optional<OwnerProfile> findByUserId(Long userId);
}
