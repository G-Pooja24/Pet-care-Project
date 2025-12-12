package com.petproject.petproject.Repository;

import com.petproject.petproject.entity.OwnerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OwnerProfileRepository extends JpaRepository<OwnerProfile, Long> {
    Optional<OwnerProfile> findByEmail(String email);
}
