package com.petproject.petproject.controller;

import com.petproject.petproject.entity.Pet;
import com.petproject.petproject.service.PetService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;
import org.springframework.http.MediaType;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/pets")
public class PetController {
    
    private final PetService petService;
    private final com.petproject.petproject.service.JwtService jwtService;
    private final com.petproject.petproject.repository.UserRepository userRepo;
    private final com.petproject.petproject.repository.OwnerProfileRepository ownerRepo;

    public PetController(PetService petService, 
                         com.petproject.petproject.service.JwtService jwtService,
                         com.petproject.petproject.repository.UserRepository userRepo,
                         com.petproject.petproject.repository.OwnerProfileRepository ownerRepo) {
        this.petService = petService;
        this.jwtService = jwtService;
        this.userRepo = userRepo;
        this.ownerRepo = ownerRepo;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Pet createPet(
            @RequestParam("ownerId") Long ownerId,
            @RequestParam("name") String name,
            @RequestParam("species") String species,
            @RequestParam("breed") String breed,
            @RequestParam("dob") String dob,
            @RequestParam("gender") String gender,
            @RequestParam("microchipId") String microchipId,
            @RequestParam(value = "notes", required = false) String notes,
            @RequestParam(value = "photo", required = false) Object photoObj
    ) {
        System.out.println("Create Pet Request: Name=" + name + ", DOB=" + dob + ", OwnerId=" + ownerId);
        
        // --- START FIX: Translate userId to ownerProfileId if needed ---
        if (!ownerRepo.existsById(ownerId)) {
            ownerRepo.findByUserId(ownerId).ifPresent(profile -> {
                System.out.println("Translating userId " + profile.getUserId() + " to ownerProfileId " + profile.getId());
                // We use the profile.id because of the DB constraint: pets (owner_id) -> owner_profile (id)
                // Note: We don't overwrite the parameter itself if we want to keep it, but here we need it for the entity.
            });
            // Re-fetch to be sure or just use the one from findByUserId
            ownerId = ownerRepo.findByUserId(ownerId)
                    .map(com.petproject.petproject.entity.OwnerProfile::getId)
                    .orElse(ownerId); // fallback to original if not found
        }
        // --- END FIX ---

        MultipartFile photo = null;
        if (photoObj instanceof MultipartFile) {
            photo = (MultipartFile) photoObj;
        } else if (photoObj != null) {
            System.out.println("Received photo as non-file type (likely String URL): " + photoObj.getClass().getName());
        }

        Pet pet = new Pet();
        pet.setOwnerId(ownerId);
        pet.setName(name);
        pet.setSpecies(species);
        pet.setBreed(breed);
        pet.setDob(parseDate(dob));
        pet.setGender(gender);
        pet.setMicrochipId(microchipId);
        pet.setNotes(notes);
        
        return petService.create(pet, photo); 
    }

    @GetMapping("/my-pets")
    public List<Pet> getMyPets(@RequestHeader("Authorization") String token) {
        String email = jwtService.extractEmail(token.replace("Bearer ", ""));
        
        com.petproject.petproject.entity.User user = userRepo.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        com.petproject.petproject.entity.OwnerProfile ownerProfile = ownerRepo.findByEmail(email)
            .orElse(null);

        // Collect all possible IDs (User ID and OwnerProfile ID)
        java.util.List<Long> possibleOwnerIds = new java.util.ArrayList<>();
        possibleOwnerIds.add(user.getId());
        if (ownerProfile != null) {
            possibleOwnerIds.add(ownerProfile.getId());
        }

        System.out.println("Fetching pets for possible IDs: " + possibleOwnerIds);
        return petService.getByOwnerIds(possibleOwnerIds);
    }

    @GetMapping("/owner/{ownerId}")
    public List<Pet> getByOwner(@PathVariable Long ownerId){ return petService.getByOwner(ownerId); }

    @GetMapping("/{id}")
    public org.springframework.http.ResponseEntity<Pet> getById(@PathVariable Long id) {
        return petService.getById(id)
                .map(org.springframework.http.ResponseEntity::ok)
                .orElse(org.springframework.http.ResponseEntity.notFound().build());
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Pet update(
            @PathVariable Long id,
            @RequestParam("ownerId") Long ownerId,
            @RequestParam("name") String name,
            @RequestParam("species") String species,
            @RequestParam("breed") String breed,
            @RequestParam("dob") String dob,
            @RequestParam("gender") String gender,
            @RequestParam("microchipId") String microchipId,
            @RequestParam(value = "notes", required = false) String notes,
            @RequestParam(value = "photo", required = false) Object photoObj
    ) {
        System.out.println("Update Pet Request: ID=" + id + ", Name=" + name + ", DOB=" + dob + ", OwnerId=" + ownerId);
        
        // --- START FIX: Translate userId to ownerProfileId if needed ---
        if (!ownerRepo.existsById(ownerId)) {
            ownerId = ownerRepo.findByUserId(ownerId)
                    .map(com.petproject.petproject.entity.OwnerProfile::getId)
                    .orElse(ownerId);
        }
        // --- END FIX ---

        MultipartFile photo = null;
        if (photoObj instanceof MultipartFile) {
            photo = (MultipartFile) photoObj;
            System.out.println("Photo received: " + photo.getOriginalFilename());
        } else if (photoObj != null) {
            System.out.println("Received photo as non-file type (likely String URL): " + photoObj.getClass().getName());
        }
        
        Pet pet = new Pet();
        pet.setId(id);
        pet.setOwnerId(ownerId);
        pet.setName(name);
        pet.setSpecies(species);
        pet.setBreed(breed);
        pet.setDob(parseDate(dob));
        pet.setGender(gender);
        pet.setMicrochipId(microchipId);
        pet.setNotes(notes);

        return petService.update(pet, photo);
    }

    private LocalDate parseDate(String dob) {
        if (dob == null || dob.trim().isEmpty() || dob.equalsIgnoreCase("dd-mm-yyyy")) {
            return null;
        }
        try {
            return LocalDate.parse(dob); // Try ISO (yyyy-MM-dd)
        } catch (Exception e) {
            try {
                // Try frontend format (dd-MM-yyyy)
                return LocalDate.parse(dob, DateTimeFormatter.ofPattern("dd-MM-yyyy"));
            } catch (Exception e2) {
                try {
                    // Try mixed format (dd-MM-yyyy with slashes or similar)
                    return LocalDate.parse(dob, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                } catch (Exception e3) {
                    System.err.println("Failed to parse date: " + dob);
                    return null;
                }
            }
        }
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id){ petService.delete(id); }

    @GetMapping("/search")
    public List<Pet> search(@RequestParam String q){ return petService.searchByName(q); }
}