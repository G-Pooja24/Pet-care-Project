package com.petproject.petproject.service;




import com.petproject.petproject.entity.Pet;
import com.petproject.petproject.repository.PetRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class PetService {
    private final PetRepository petRepo;
    private final String UPLOAD_DIR = "uploads/";

    public PetService(PetRepository petRepo){ 
        this.petRepo = petRepo; 
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize upload directory", e);
        }
    }

    public Pet create(Pet pet, MultipartFile photo) { 
        if (photo != null && !photo.isEmpty()) {
            pet.setPhoto(savePhoto(photo));
        }
        return petRepo.save(pet); 
    }

    // Overload for backward compatibility / no file
    public Pet create(Pet pet) { return petRepo.save(pet); }

    public Pet update(Pet pet, MultipartFile photo) { 
        Pet existingPet = petRepo.findById(pet.getId()).orElse(null);
        if (existingPet == null) {
            return null;
        }

        // Update fields only if they are not null or empty
        if (pet.getName() != null && !pet.getName().trim().isEmpty()) {
            existingPet.setName(pet.getName());
        }
        if (pet.getSpecies() != null && !pet.getSpecies().trim().isEmpty()) {
            existingPet.setSpecies(pet.getSpecies());
        }
        if (pet.getBreed() != null && !pet.getBreed().trim().isEmpty()) {
            existingPet.setBreed(pet.getBreed());
        }
        if (pet.getDob() != null) {
            existingPet.setDob(pet.getDob());
        }
        if (pet.getGender() != null && !pet.getGender().trim().isEmpty()) {
            existingPet.setGender(pet.getGender());
        }
        if (pet.getMicrochipId() != null && !pet.getMicrochipId().trim().isEmpty()) {
            existingPet.setMicrochipId(pet.getMicrochipId());
        }
        if (pet.getNotes() != null && !pet.getNotes().trim().isEmpty()) {
            existingPet.setNotes(pet.getNotes());
        }
        
        // Update photo only if new one provided
        if (photo != null && !photo.isEmpty()) {
            existingPet.setPhoto(savePhoto(photo));
        }
        
        return petRepo.save(existingPet); 
    }
    
    // Overload for backward compatibility / no file
    public Pet update(Pet pet) { return petRepo.save(pet); }

    public Optional<Pet> getById(Long id){ return petRepo.findById(id); }
    public List<Pet> getByOwner(Long ownerId){ return petRepo.findByOwnerId(ownerId); }
    public List<Pet> getByOwnerIds(List<Long> ownerIds){ return petRepo.findByOwnerIdIn(ownerIds); }
    public void delete(Long id){ petRepo.deleteById(id); }
    public List<Pet> searchByName(String name){ return petRepo.findByNameContainingIgnoreCase(name); }

    private String savePhoto(MultipartFile file) {
        try {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path path = Paths.get(UPLOAD_DIR + fileName);
            Files.write(path, file.getBytes());
            return fileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }
}
