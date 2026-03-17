package com.petproject.petproject.entity;

import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.HashMap;

public class HealthMeasurementDTO {
    
    @JsonAlias("pet_id")
    private Long petId;
    
    private BigDecimal weight;
    private BigDecimal temperature;
    private String notes;

    // Handle nested pet object { "pet": { "id": 123 } }
    @JsonProperty("pet")
    private void unpackPet(Map<String, Object> pet) {
        if (pet != null && pet.containsKey("id")) {
             this.petId = Long.valueOf(pet.get("id").toString());
        }
    }

    // Getters and Setters
    public Long getPetId() { return petId; }
    public void setPetId(Long petId) { this.petId = petId; }

    public BigDecimal getWeight() { return weight; }
    public void setWeight(BigDecimal weight) { this.weight = weight; }

    public BigDecimal getTemperature() { return temperature; }
    public void setTemperature(BigDecimal temperature) { this.temperature = temperature; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    // Debugging unknown fields
    private Map<String, Object> unknownFields = new HashMap<>();

    @JsonAnySetter
    public void add(String key, Object value) {
        unknownFields.put(key, value);
    }

    @Override
    public String toString() {
        return "HealthMeasurementDTO{petId=" + petId + ", weight=" + weight + ", temperature=" + temperature + ", notes='" + notes + "', unknownFields=" + unknownFields + "}";
    }
}
