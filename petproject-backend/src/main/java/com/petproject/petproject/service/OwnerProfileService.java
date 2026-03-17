package com.petproject.petproject.service;

import com.petproject.petproject.entity.OwnerProfile;
import com.petproject.petproject.repository.OwnerProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class OwnerProfileService {

    private final OwnerProfileRepository profileRepo;
    private final String UPLOAD_DIR = "uploads/";

    public OwnerProfileService(OwnerProfileRepository profileRepo) {
        this.profileRepo = profileRepo;
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize upload directory", e);
        }
    }

    public OwnerProfile updatePhoto(String email, MultipartFile photo) {
        OwnerProfile existing = profileRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Owner profile not found"));

        if (photo != null && !photo.isEmpty()) {
            String fileName = saveFile(photo);
            existing.setPhoto(fileName);
        }

        return profileRepo.save(existing);
    }

    public OwnerProfile updateProfile(String email, String name, String phone, String address, MultipartFile photo) {
        OwnerProfile existing = profileRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Owner profile not found"));

        if (name != null) existing.setName(name);
        if (phone != null) existing.setPhone(phone);
        if (address != null) existing.setAddress(address);

        if (photo != null && !photo.isEmpty()) {
            String fileName = saveFile(photo);
            existing.setPhoto(fileName);
        }

        return profileRepo.save(existing);
    }

    private String saveFile(MultipartFile file) {
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
