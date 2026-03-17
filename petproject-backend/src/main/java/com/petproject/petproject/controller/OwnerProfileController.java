package com.petproject.petproject.controller;

import com.petproject.petproject.entity.OwnerProfile;
import com.petproject.petproject.repository.OwnerProfileRepository;
import com.petproject.petproject.repository.UserRepository;
import com.petproject.petproject.entity.User;
import com.petproject.petproject.service.JwtService;

import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
//import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;
// @CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/owner")
public class OwnerProfileController {

    @Autowired
    private OwnerProfileRepository ownerProfileRepo;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private com.petproject.petproject.service.OwnerProfileService profileService;

    @GetMapping("/profile")
    public OwnerProfile getProfile(@RequestHeader("Authorization") String token) {
        String email = jwtService.extractEmail(token.replace("Bearer ", ""));

        Optional<OwnerProfile> profileOpt = ownerProfileRepo.findByEmail(email);
        OwnerProfile profile = profileOpt.orElse(new OwnerProfile());

        // Self-Healing: Ensure Profile is linked to User
        if (profile.getUserId() == null) {
            User user = userRepo.findByEmail(email).orElse(null);
            if (user != null) {
                profile.setUserId(user.getId());
                profile.setEmail(user.getEmail()); // Ensure sync
                if (profile.getName() == null) profile.setName(user.getName()); // Sync name if empty
                profile = ownerProfileRepo.save(profile); // Save and re-assign to get generated ID if new
            }
        }
        return profile;
    }

    @PutMapping(value = "/profile", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public OwnerProfile updateProfile(
            @RequestHeader("Authorization") String token,
            @RequestParam("name") String name,
            @RequestParam("phone") String phone,
            @RequestParam("address") String address,
            @RequestParam(value = "photo", required = false) MultipartFile photo
    ) {
        String email = jwtService.extractEmail(token.replace("Bearer ", ""));
        return profileService.updateProfile(email, name, phone, address, photo);
    }


    @PutMapping(value = "/profile/photo", consumes = "multipart/form-data")
public OwnerProfile updatePhoto(
        @RequestHeader("Authorization") String token,
        @RequestParam("photo") MultipartFile photo
) {
    String email = jwtService.extractEmail(token.replace("Bearer ", ""));
    return profileService.updatePhoto(email, photo);
}
}
 //latest one
    // @PutMapping("/profile")
    // public OwnerProfile updateProfile(@RequestHeader("Authorization") String token,
    //                                   @RequestBody OwnerProfile profile) {
    //     String email = jwtService.extractEmail(token.replace("Bearer ", ""));
    //     profile.setEmail(email); // ensure it updates the correct user
    //     return ownerProfileRepo.save(profile);
    // }







/* *  @PutMapping("/profile")   

    public OwnerProfile updateProfile(@RequestHeader("Authorization") String token,
                                    @RequestBody OwnerProfile updated) {
        String email = jwtService.extractEmail(token.replace("Bearer ", ""));
        OwnerProfile existing = ownerProfileRepo.findByEmail(email)
            .orElse(new OwnerProfile());

        existing.setEmail(email);
        existing.setName(updated.getName());
        existing.setPhone(updated.getPhone());
        existing.setAddress(updated.getAddress());
        existing.setPhoto(updated.getPhoto());

        return ownerProfileRepo.save(existing);
}
}

*/

/* 

@PutMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public OwnerProfile updateProfile(
        @RequestHeader("Authorization") String token,
        @RequestPart("name") String name,
        @RequestPart("phone") String phone,
        @RequestPart("address") String address,
        @RequestPart(value = "photo", required = false) MultipartFile photo
) {
    String email = jwtService.extractEmail(token.replace("Bearer ", ""));
    OwnerProfile existing = ownerProfileRepo.findByEmail(email)
            .orElse(new OwnerProfile());

    existing.setEmail(email);
    existing.setName(name);
    existing.setPhone(phone);
    existing.setAddress(address);

    if (photo != null) {
        existing.setPhoto(photo.getOriginalFilename());
        // or save the file somewhere
    }

    return ownerProfileRepo.save(existing);
}
}

*/