package com.petproject.petproject.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.petproject.petproject.repository.HealthMeasurementRepository;
import com.petproject.petproject.entity.HealthMeasurement;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "http://localhost:3000")
public class HealthMeasurementController {
    @Autowired
    private HealthMeasurementRepository healthRepository;

    @GetMapping("/pet/{petId}")
    public List<HealthMeasurement> getMeasurements(@PathVariable Long petId) {
        return healthRepository.findByPet_IdOrderByMeasurementDateAsc(petId);
    }

    @Autowired
    private com.petproject.petproject.repository.PetRepository petRepository;

    @PostMapping
    public HealthMeasurement addMeasurement(@RequestBody com.petproject.petproject.entity.HealthMeasurementDTO h) {
        System.out.println("Received HealthDTO: " + h);
        
        if (h.getPetId() == null) {
            throw new RuntimeException("Pet ID is required. Received: " + h);
        }

        com.petproject.petproject.entity.Pet pet = petRepository.findById(h.getPetId())
                .orElseThrow(() -> new RuntimeException("Pet not found with ID: " + h.getPetId()));

        HealthMeasurement hm = new HealthMeasurement();
        hm.setPet(pet);
        hm.setWeight(h.getWeight());
        hm.setTemperature(h.getTemperature());
        hm.setNotes(h.getNotes());

        return healthRepository.save(hm);
    }

    @PutMapping("/{id}")
    public HealthMeasurement updateMeasurement(@PathVariable Long id, @RequestBody HealthMeasurement h) {
        HealthMeasurement hm = healthRepository.findById(id).orElseThrow();
        hm.setWeight(h.getWeight());
        hm.setTemperature(h.getTemperature());
        hm.setNotes(h.getNotes());
        return healthRepository.save(hm);
    }

    @DeleteMapping("/{id}")
    public void deleteMeasurement(@PathVariable Long id) {
        healthRepository.deleteById(id);
    }
}
