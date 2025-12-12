package com.petproject.petproject.service;




import com.petproject.petproject.entity.Pet;
import com.petproject.petproject.Repository.PetRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;


@Service
public class PetService {
private final PetRepository petRepo;
public PetService(PetRepository petRepo){ this.petRepo = petRepo; }
public Pet create(Pet pet){ return petRepo.save(pet); }
public Optional<Pet> getById(Long id){ return petRepo.findById(id); }
public List<Pet> getByOwner(Long ownerId){ return petRepo.findByOwnerId(ownerId); }
public Pet update(Pet pet){ return petRepo.save(pet); }
public void delete(Long id){ petRepo.deleteById(id); }
public List<Pet> searchByName(String name){ return petRepo.findByNameContainingIgnoreCase(name); }
}
