package com.petproject.petproject.controller;

import com.petproject.petproject.entity.OwnerProfile;
import com.petproject.petproject.Repository.OwnerProfileRepository;
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

    @GetMapping("/profile")
    public OwnerProfile getProfile(@RequestHeader("Authorization") String token) {
        String email = jwtService.extractEmail(token.replace("Bearer ", ""));


        Optional<OwnerProfile> profile = ownerProfileRepo.findByEmail(email);
        return profile.orElse(new OwnerProfile());
    }

    @PutMapping("/profile")
public OwnerProfile updateProfile(@RequestHeader("Authorization") String token,
                                  @RequestBody OwnerProfile profile) {

    String email = jwtService.extractEmail(token.replace("Bearer ", ""));

    OwnerProfile existing = ownerProfileRepo.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("Owner profile not found"));

    existing.setName(profile.getName());
    existing.setPhone(profile.getPhone());
    existing.setAddress(profile.getAddress());
  //  existing.setPhoto(profile.getPhoto());

    return ownerProfileRepo.save(existing);
    }


    @PutMapping(value = "/profile/photo", consumes = "multipart/form-data")
public OwnerProfile updatePhoto(
        @RequestHeader("Authorization") String token,
        @RequestParam("photo") MultipartFile photo
) {
    String email = jwtService.extractEmail(token.replace("Bearer ", ""));

    OwnerProfile existing = ownerProfileRepo.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Owner not found"));

    // Fake save logic → replace with real file save later
    String fileName = photo.getOriginalFilename();
    existing.setPhoto(fileName);

    return ownerProfileRepo.save(existing);
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