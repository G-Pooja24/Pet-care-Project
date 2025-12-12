package com.petproject.petproject.entity;


import jakarta.persistence.*;
import java.time.LocalDate;


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
private String photoUrl;
private String microchipId;
@Column(columnDefinition = "TEXT")
private String notes;
// getters and setters
}