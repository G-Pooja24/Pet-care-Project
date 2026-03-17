package com.petproject.petproject.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="vet_availability")
public class VetAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vet_id", nullable = false)
    private Long vetId; // Links to User(Vet)

    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(nullable = false)
    private LocalDateTime startTime;

    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(nullable = false)
    private LocalDateTime endTime;

    @Column(nullable = false)
    private Boolean isBooked = false;

    private Integer capacity = 1; // Default 1

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Mode mode; // ONLINE or CLINIC

    public enum Mode {
        ONLINE,
        CLINIC
    }

    public VetAvailability() {}

    public VetAvailability(Long vetId, LocalDateTime startTime, LocalDateTime endTime, Mode mode) {
        this.vetId = vetId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.mode = mode;
        this.isBooked = false;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getVetId() { return vetId; }
    public void setVetId(Long vetId) { this.vetId = vetId; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public Boolean getIsBooked() { return isBooked; }
    public void setIsBooked(Boolean booked) { isBooked = booked; }


    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public Mode getMode() { return mode; }
    public void setMode(Mode mode) { this.mode = mode; }
}
