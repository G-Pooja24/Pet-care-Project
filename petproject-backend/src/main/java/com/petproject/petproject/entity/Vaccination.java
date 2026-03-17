package com.petproject.petproject.entity;
import jakarta.persistence.*;
import java.time.LocalDate;


@Entity
@Table(name="vaccinations")
public class Vaccination {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "pet_id")
    private Pet pet;

    private String vaccineName;
    private LocalDate dateGiven;
    private LocalDate nextDue; // Note: original field was nextDue, error log mentioned getNextDueDate, checking usage.
    
    // The error log said: symbol: method getNextDueDate() location: variable v of type com.petproject.petproject.entity.Vaccination
    // But the field in Vaccination.java is `nextDue`. I should verify if I should rename the field or the getter.
    // Usually code uses getter matches field. Code in controller seems to use getNextDueDate().
    // I will add getNextDueDate() that returns nextDue, or rename field. Let's rename getter.

    @Column(columnDefinition = "TEXT")
    private String notes;

    public Vaccination() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Pet getPet() { return pet; }
    public void setPet(Pet pet) { this.pet = pet; }
    
    public Long getPetId() { return pet != null ? pet.getId() : null; }

    public String getVaccineName() { return vaccineName; }
    public void setVaccineName(String vaccineName) { this.vaccineName = vaccineName; }

    public LocalDate getDateGiven() { return dateGiven; }
    public void setDateGiven(LocalDate dateGiven) { this.dateGiven = dateGiven; }

    public LocalDate getNextDueDate() { return nextDue; } // Mismatch resolutiion
    public void setNextDueDate(LocalDate nextDue) { this.nextDue = nextDue; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}