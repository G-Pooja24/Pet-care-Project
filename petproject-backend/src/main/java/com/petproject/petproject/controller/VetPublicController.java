package com.petproject.petproject.controller;

import com.petproject.petproject.entity.VetProfile;
import com.petproject.petproject.repository.VetProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/vets")
public class VetPublicController {

    @Autowired
    private VetProfileRepository vetProfileRepo;

    @GetMapping({"", "/", "/search"})
    public List<VetProfile> searchVets(@RequestParam(required = false) String specialization,
                                       @RequestParam(required = false) String city) {
        
        if (specialization != null && !specialization.isEmpty() && city != null && !city.isEmpty()) {
            return vetProfileRepo.findBySpecializationContainingIgnoreCaseAndClinicAddressContainingIgnoreCase(specialization, city);
        } else if (specialization != null && !specialization.isEmpty()) {
            return vetProfileRepo.findBySpecializationContainingIgnoreCase(specialization);
        } else if (city != null && !city.isEmpty()) {
            return vetProfileRepo.findByClinicAddressContainingIgnoreCase(city);
        } else {
            return vetProfileRepo.findAll();
        }
    }

    @Autowired
    private com.petproject.petproject.repository.VetAvailabilityRepository availabilityRepo;

    @GetMapping("/{vetId}/slots")
    public List<com.petproject.petproject.entity.VetAvailability> getVetSlots(@PathVariable Long vetId) {
        System.out.println("DEBUG: Fetching slots for Public Vet ID: " + vetId);
        List<com.petproject.petproject.entity.VetAvailability> slots = availabilityRepo.findByVetIdAndStartTimeAfter(vetId, java.time.LocalDateTime.now());
        System.out.println("DEBUG: Slots found for public view: " + slots.size());
        return slots;
    }
}
