package com.petproject.petproject.entity;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonAlias;
//import com.fasterxml.jackson.annotation.JsonProperty;

public class ReminderDTO {
    @JsonAlias("pet_id")
    private Long petId;
    
    private com.petproject.petproject.entity.Reminder.ReminderType type;
    private LocalDate dueDate;
    private com.petproject.petproject.entity.Reminder.RepeatRule repeatRule;

    // Getters and Setters
    public Long getPetId() { return petId; }
    public void setPetId(Long petId) { this.petId = petId; }

    public com.petproject.petproject.entity.Reminder.ReminderType getType() { return type; }
    public void setType(com.petproject.petproject.entity.Reminder.ReminderType type) { this.type = type; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public com.petproject.petproject.entity.Reminder.RepeatRule getRepeatRule() { return repeatRule; }
    public void setRepeatRule(com.petproject.petproject.entity.Reminder.RepeatRule repeatRule) { this.repeatRule = repeatRule; }

    @com.fasterxml.jackson.annotation.JsonProperty("pet")
    private void unpackPet(java.util.Map<String, Object> pet) {
        if (pet != null && pet.containsKey("id")) {
             this.petId = Long.valueOf(pet.get("id").toString());
        }
    }

    @Override
    public String toString() {
        return "ReminderDTO{petId=" + petId + ", type=" + type + ", dueDate=" + dueDate + ", repeatRule=" + repeatRule + ", unknownFields=" + unknownFields + "}";
    }

    private java.util.Map<String, Object> unknownFields = new java.util.HashMap<>();

    @com.fasterxml.jackson.annotation.JsonAnySetter
    public void add(String key, Object value) {
        unknownFields.put(key, value);
    }
}
