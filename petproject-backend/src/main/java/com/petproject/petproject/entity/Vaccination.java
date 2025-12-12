package com.petproject.petproject.entity;
import jakarta.persistence.*;
import java.time.LocalDate;


@Entity
@Table(name="vaccinations")
public class Vaccination {
@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
private Long petId;
private String vaccineName;
private LocalDate dateGiven;
private LocalDate nextDue;
@Column(columnDefinition = "TEXT")
private String notes;
}