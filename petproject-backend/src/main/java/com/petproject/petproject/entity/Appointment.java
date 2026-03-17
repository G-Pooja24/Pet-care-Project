package com.petproject.petproject.entity;

import jakarta.persistence.*;

@Entity
@Table(name="appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_id", nullable = false)
    private Long ownerId; // User ID of Pet Owner

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", insertable = false, updatable = false)
    private User owner;

    @Column(name = "pet_id", nullable = false)
    private Long petId;

    @Column(name = "vet_id", nullable = false)
    private Long vetId; // User ID of Vet

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vet_id", insertable = false, updatable = false)
    private User vet;

    @ManyToOne
    @JoinColumn(name = "slot_id", nullable = false)
    private VetAvailability slot;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status; // PENDING, CONFIRMED, COMPLETED, CANCELLED

    private String meetingLink; // For ONLINE
    
    @Column(columnDefinition = "TEXT")
    private String consultationNotes;
    
    private String prescriptionUrl;

    @Column(nullable = false)
    private Boolean reminder24hSent = false;

    @Column(nullable = false)
    private Boolean reminder1hSent = false;

    @Column(nullable = false)
    private Boolean isNewForVet = true;

    @Transient
    private String vetName;

    @Transient
    private String ownerName;

    @Transient
    private String petName;

    public String getVetName() { return vetName; }
    public void setVetName(String vetName) { this.vetName = vetName; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getPetName() { return petName; }
    public void setPetName(String petName) { this.petName = petName; }

    public enum Status {
        PENDING,
        CONFIRMED,
        COMPLETED,
        CANCELLED
    }

    // Constructors
    public Appointment() {}

    public Appointment(Long ownerId, Long petId, Long vetId, VetAvailability slot, Status status) {
        this.ownerId = ownerId;
        this.petId = petId;
        this.vetId = vetId;
        this.slot = slot;
        this.status = status;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }

    public Long getPetId() { return petId; }
    public void setPetId(Long petId) { this.petId = petId; }

    public Long getVetId() { return vetId; }
    public void setVetId(Long vetId) { this.vetId = vetId; }

    public VetAvailability getSlot() { return slot; }
    public void setSlot(VetAvailability slot) { this.slot = slot; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public String getConsultationNotes() { return consultationNotes; }
    public void setConsultationNotes(String consultationNotes) { this.consultationNotes = consultationNotes; }

    public String getPrescriptionUrl() { return prescriptionUrl; }
    public void setPrescriptionUrl(String prescriptionUrl) { this.prescriptionUrl = prescriptionUrl; }

    public Boolean getReminder24hSent() { return reminder24hSent; }
    public void setReminder24hSent(Boolean reminder24hSent) { this.reminder24hSent = reminder24hSent; }

    public Boolean getReminder1hSent() { return reminder1hSent; }
    public void setReminder1hSent(Boolean reminder1hSent) { this.reminder1hSent = reminder1hSent; }

    public Boolean getIsNewForVet() { return isNewForVet; }
    public void setIsNewForVet(Boolean isNewForVet) { this.isNewForVet = isNewForVet; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }

    @Column(columnDefinition = "TEXT")
    private String prescription;

    public String getPrescription() { return prescription; }
    public void setPrescription(String prescription) { this.prescription = prescription; }

    public User getVet() { return vet; }
    public void setVet(User vet) { this.vet = vet; }
}
