package com.petproject.petproject.entity;

import jakarta.persistence.*;
import java.time.LocalDate;


@Entity
@Table(name="medical_records")
public class MedicalRecord {
@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
private Long petId;
private LocalDate visitDate;
@Column(columnDefinition = "TEXT")
private String diagnosis;
@Column(columnDefinition = "TEXT")
private String treatment;
private String vetName;
@Column(columnDefinition = "TEXT")
private String prescriptions;
// getters & setters
}