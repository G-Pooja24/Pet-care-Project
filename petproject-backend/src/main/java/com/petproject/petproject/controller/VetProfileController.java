package com.petproject.petproject.controller;

import com.petproject.petproject.entity.VetProfile;
import com.petproject.petproject.repository.VetProfileRepository;
import com.petproject.petproject.service.JwtService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/vet")
public class VetProfileController {

    @Autowired
    private VetProfileRepository vetProfileRepo;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private com.petproject.petproject.repository.UserRepository userRepo;

    @GetMapping("/profile")
    public VetProfile getProfile(@RequestHeader("Authorization") String token) {
        String email = jwtService.extractEmail(token.replace("Bearer ", ""));
        
        // 1. Find the User logging in
        com.petproject.petproject.entity.User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Try to find Existing Profile by UserID (Best) or Email (Legacy)
        Optional<VetProfile> profileOpt = vetProfileRepo.findByUserId(user.getId());
        if (profileOpt.isEmpty()) {
            profileOpt = vetProfileRepo.findFirstByEmail(email);
        }

        VetProfile profile;
        if (profileOpt.isPresent()) {
            profile = profileOpt.get();
            // 3. Self-Healing: If link is missing, fix it now
            if (profile.getUserId() == null) {
                profile.setUserId(user.getId());
                vetProfileRepo.save(profile);
            }
        } else {
            // 4. Create New Profile linked to User
            profile = new VetProfile();
            profile.setEmail(email);
            profile.setUserId(user.getId());
            profile.setName(user.getName()); // Default name from User
            vetProfileRepo.save(profile);
        }
        
        return profile;
    }

    @PutMapping("/profile")
    public VetProfile updateProfile(@RequestHeader("Authorization") String token,
                                    @RequestBody VetProfile profile) {
        String email = jwtService.extractEmail(token.replace("Bearer ", ""));
        
        com.petproject.petproject.entity.User user = userRepo.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Ensure we are updating the correct profile
        VetProfile existing = vetProfileRepo.findByUserId(user.getId())
                .or(() -> vetProfileRepo.findFirstByEmail(email))
                .orElse(new VetProfile());

        existing.setUserId(user.getId()); // Ensure link
        existing.setName(profile.getName());
        existing.setClinicName(profile.getClinicName());
        existing.setSpecialization(profile.getSpecialization());
        existing.setPhone(profile.getPhone());
        existing.setClinicAddress(profile.getClinicAddress());
        existing.setEmail(email);

        return vetProfileRepo.save(existing);
    }
}
