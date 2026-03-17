package com.petproject.petproject.entity;

import jakarta.persistence.*;
import java.time.LocalDate;


@Entity
@Table(name="medical_records")
public class MedicalRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "pet_id")
    private Pet pet;

    private LocalDate visitDate;
    @Column(columnDefinition = "TEXT")
    private String diagnosis;
    @Column(columnDefinition = "TEXT")
    private String treatment;
    private String vetName;
    @Column(columnDefinition = "TEXT")
    private String prescriptions;
    @Column(columnDefinition = "TEXT")
    private String attachments; // Assuming this field exists based on error log "getAttachments"

    public MedicalRecord() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Pet getPet() { return pet; }
    public void setPet(Pet pet) { this.pet = pet; }

    // Helper for JSON serialization if needed, or backward compatibility
    public Long getPetId() { return pet != null ? pet.getId() : null; }
    // public void setPetId(Long petId) { this.petId = petId; } // Removed to force use of setPet

    public LocalDate getVisitDate() { return visitDate; }
    public void setVisitDate(LocalDate visitDate) { this.visitDate = visitDate; }

    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }

    public String getTreatment() { return treatment; }
    public void setTreatment(String treatment) { this.treatment = treatment; }

    public String getVetName() { return vetName; }
    public void setVetName(String vetName) { this.vetName = vetName; }

    public String getPrescriptions() { return prescriptions; }
    public void setPrescriptions(String prescriptions) { this.prescriptions = prescriptions; }

    public String getAttachments() { return attachments; }
    public void setAttachments(String attachments) { this.attachments = attachments; }
}