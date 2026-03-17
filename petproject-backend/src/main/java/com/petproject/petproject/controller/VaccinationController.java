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

import com.petproject.petproject.repository.PetRepository;
import com.petproject.petproject.repository.VaccinationRepository;
import com.petproject.petproject.entity.Pet;
import com.petproject.petproject.entity.Vaccination;

@RestController
@RequestMapping("/api/vaccinations")
@CrossOrigin(origins = "http://localhost:3000")
public class VaccinationController {
    @Autowired
    private VaccinationRepository vaccinationRepository;

    @Autowired
    private PetRepository petRepository;

    @GetMapping("/pet/{petId}")
    public List<Vaccination> getVaccinations(@PathVariable Long petId) {
        try {
            return vaccinationRepository.findByPet_Id(petId);
        } catch (Exception e) {
            System.err.println("Error fetching vaccinations for petId: " + petId);
            e.printStackTrace();
            throw e;
        }
    }

    @PostMapping
    public Vaccination addVaccination(@RequestBody Vaccination v) {
        if (v.getPet() != null && v.getPet().getId() != null) {
            Pet pet = petRepository.findById(v.getPet().getId())
                .orElseThrow(() -> new RuntimeException("Pet not found with id: " + v.getPet().getId()));
            v.setPet(pet);
        }
        return vaccinationRepository.save(v);
    }

    @PutMapping("/{id}")
    public Vaccination updateVaccination(@PathVariable Long id, @RequestBody Vaccination v) {
        Vaccination vacc = vaccinationRepository.findById(id).orElseThrow();
        vacc.setVaccineName(v.getVaccineName());
        vacc.setDateGiven(v.getDateGiven());
        vacc.setNextDueDate(v.getNextDueDate());
        return vaccinationRepository.save(vacc);
    }

    @DeleteMapping("/{id}")
    public void deleteVaccination(@PathVariable Long id) {
        vaccinationRepository.deleteById(id);
    }
}
