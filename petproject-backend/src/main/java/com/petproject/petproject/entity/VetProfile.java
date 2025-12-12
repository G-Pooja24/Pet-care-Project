package com.petproject.petproject.entity;

import jakarta.persistence.*;

@Entity
@Table(name="veterinarian_profile")
public class VetProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;   // ⭐ ADD THIS FIELD

    @Column(nullable = false)
    private String name;

    private String clinicName;
    private String specialization;
    private String phone;
    private String clinicAddress;

    @Column(unique = true, nullable = false)
    private String email; // link to User table

    // ----- Constructors -----
    public VetProfile() {}

    public VetProfile(String name, String clinicName, String specialization, String phone, String clinicAddress, String email) {
    //    this.userId = userId;
        this.name = name;
        this.clinicName = clinicName;
        this.specialization = specialization;
        this.phone = phone;
        this.clinicAddress = clinicAddress;
        this.email = email;
    }

    // ----- Getters and Setters -----
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }   // ⭐ REQUIRED

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getClinicName() { return clinicName; }
    public void setClinicName(String clinicName) { this.clinicName = clinicName; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getClinicAddress() { return clinicAddress; }
    public void setClinicAddress(String clinicAddress) { this.clinicAddress = clinicAddress; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
