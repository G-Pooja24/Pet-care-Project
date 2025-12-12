package com.petproject.petproject.entity;

import jakarta.persistence.*;

@Entity
@Table(name="owner_profile")
public class OwnerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;   // ⭐ ADD THIS FIELD


    @Column(nullable = false)
    private String name;

    private String phone;
    private String address;
    private String photo; // store profile photo URL or path

    @Column(unique = true, nullable = false)
    private String email; // link to User table for authentication

    // ----- Constructors -----
    public OwnerProfile() {}

    public OwnerProfile(String name, String phone, String address, String photo, String email) {
        this.name = name;
        this.phone = phone;
        this.address = address;
        this.photo = photo;
        this.email = email;
    }

    // ----- Getters and Setters -----
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPhoto() { return photo; }
    public void setPhoto(String photo) { this.photo = photo; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
