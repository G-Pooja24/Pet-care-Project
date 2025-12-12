package com.petproject.petproject.Repository;

import com.petproject.petproject.entity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;


public interface PetRepository extends JpaRepository<Pet, Long> {
List<Pet> findByOwnerId(Long ownerId);
List<Pet> findByNameContainingIgnoreCase(String name);
List<Pet> findBySpeciesIgnoreCase(String species);
}