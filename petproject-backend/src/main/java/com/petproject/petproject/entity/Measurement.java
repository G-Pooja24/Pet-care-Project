package com.petproject.petproject.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;


@Entity
@Table(name="measurements")
public class Measurement {
@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
private Long petId;
private LocalDateTime measureTime;
private Double weightKg;
private Double temperatureC;
@Column(columnDefinition = "TEXT")
private String notes;
}