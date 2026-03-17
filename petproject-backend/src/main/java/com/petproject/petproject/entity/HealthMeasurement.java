package com.petproject.petproject.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.sql.Timestamp;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "health_measurements")
public class HealthMeasurement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "pet_id")
    private Pet pet;

    private BigDecimal weight;
    private BigDecimal temperature;
    private String notes;

    @CreationTimestamp
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Kolkata")
    @Column(name = "measurement_date", updatable = false)
    private Timestamp measurementDate;

    public HealthMeasurement() {
    }

    public HealthMeasurement(Long id, Pet pet, BigDecimal weight, BigDecimal temperature, String notes, Timestamp measurementDate) {
        this.id = id;
        this.pet = pet;
        this.weight = weight;
        this.temperature = temperature;
        this.notes = notes;
        this.measurementDate = measurementDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Pet getPet() {
        return pet;
    }

    public void setPet(Pet pet) {
        this.pet = pet;
    }

    public BigDecimal getWeight() {
        return weight;
    }

    public void setWeight(BigDecimal weight) {
        this.weight = weight;
    }

    public BigDecimal getTemperature() {
        return temperature;
    }

    public void setTemperature(BigDecimal temperature) {
        this.temperature = temperature;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Timestamp getMeasurementDate() {
        return measurementDate;
    }

    public void setMeasurementDate(Timestamp measurementDate) {
        this.measurementDate = measurementDate;
    }
}
