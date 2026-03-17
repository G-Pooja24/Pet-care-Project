package com.petproject.petproject.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;


@Entity
@Table(name="reminders")
public class Reminder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id")
    private Pet pet;
    
    @Enumerated(EnumType.STRING)
    private ReminderType type;
    
    private LocalDateTime dueDate;
    
    @Enumerated(EnumType.STRING)
    private RepeatRule repeatRule;
    
    @Column(columnDefinition = "json")
    private String metadata;
    private Boolean notified = false;

    public Reminder() {}

    public Reminder(Pet pet, ReminderType type, LocalDateTime dueDate, RepeatRule repeatRule, String metadata, Boolean notified) {
        this.pet = pet;
        this.type = type;
        this.dueDate = dueDate;
        this.repeatRule = repeatRule;
        this.metadata = metadata;
        this.notified = notified;
    }

    public enum ReminderType {
        VACCINATION, MEDICATION, GROOMING, CHECKUP, OTHER
    }

    public enum RepeatRule {
        NONE, DAILY, WEEKLY, MONTHLY, YEARLY
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Pet getPet() { return pet; }
    public void setPet(Pet pet) { this.pet = pet; }
    
    public Long getPetId() { return pet != null ? pet.getId() : null; }

    public ReminderType getType() { return type; }
    public void setType(ReminderType type) { this.type = type; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public RepeatRule getRepeatRule() { return repeatRule; }
    public void setRepeatRule(RepeatRule repeatRule) { this.repeatRule = repeatRule; }

    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }

    public Boolean getNotified() { return notified; }
    public void setNotified(Boolean notified) { this.notified = notified; }
}