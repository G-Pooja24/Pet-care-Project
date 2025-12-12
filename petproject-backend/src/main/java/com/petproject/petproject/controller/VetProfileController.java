package com.petproject.petproject.controller;

import com.petproject.petproject.entity.VetProfile;
import com.petproject.petproject.Repository.VetProfileRepository;
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

    @GetMapping("/profile")
    public VetProfile getProfile(@RequestHeader("Authorization") String token) {
        String email = jwtService.extractEmail(token.replace("Bearer ", ""));
        Optional<VetProfile> profile = vetProfileRepo.findByEmail(email);
        return profile.orElse(new VetProfile());
    }

    @PutMapping("/profile")
    public VetProfile updateProfile(@RequestHeader("Authorization") String token,
                                    @RequestBody VetProfile profile) {
        String email = jwtService.extractEmail(token.replace("Bearer ", ""));
        profile.setEmail(email); // ensure it updates the correct user
        return vetProfileRepo.save(profile);
    }
}
