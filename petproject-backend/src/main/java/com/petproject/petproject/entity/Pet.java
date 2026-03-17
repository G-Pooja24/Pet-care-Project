package com.petproject.petproject.entity;


import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Entity
@Table(name="pets")
public class Pet {
@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
private Long ownerId;
private String name;
private String species;
private String breed;
private LocalDate dob;
private String gender;
    private String photo;
private String microchipId;
@Column(columnDefinition = "TEXT")
private String notes;

@Column(name = "created_at", updatable = false)
private LocalDateTime createdAt;

@PrePersist
protected void onCreate() {
    this.createdAt = LocalDateTime.now();
}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSpecies() { return species; }
    public void setSpecies(String species) { this.species = species; }

    public String getBreed() { return breed; }
    public void setBreed(String breed) { this.breed = breed; }

    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getPhoto() { return photo; }
    public void setPhoto(String photo) { this.photo = photo; }

    @Transient
    public String getPhotoUrl() {
        if (photo != null && !photo.isEmpty()) {
            return "http://localhost:8080/uploads/" + photo;
        }
        return null;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photo = photoUrl;
    }

    public String getMicrochipId() { return microchipId; }
    public void setMicrochipId(String microchipId) { this.microchipId = microchipId; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}