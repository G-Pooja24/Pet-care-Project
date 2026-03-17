package com.petproject.petproject.controller;

import com.petproject.petproject.repository.MedicalRecordRepository;
import com.petproject.petproject.repository.PetRepository;
import com.petproject.petproject.entity.MedicalRecord;
import com.petproject.petproject.entity.Pet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/medical", "/medical"})
@CrossOrigin(origins = "http://localhost:3000")
public class MedicalRecordController {

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private PetRepository petRepository;

    @GetMapping("/pet/{petId}")
    public List<MedicalRecord> getMedicalRecordsByPet(@PathVariable Long petId) {
        System.out.println("Fetching medical records for petId: " + petId);
        return medicalRecordRepository.findByPet_Id(petId);
    }

    @PostMapping
    public MedicalRecord addMedicalRecord(@RequestBody MedicalRecord record) {
        System.out.println("Received request to save medical record: " + record);
        // If the frontend sends petId instead of a nested pet object, we handle it here
        if (record.getPet() != null && record.getPet().getId() != null) {
            Pet pet = petRepository.findById(record.getPet().getId())
                    .orElseThrow(() -> new RuntimeException("Pet not found with id: " + record.getPet().getId()));
            record.setPet(pet);
        }
        return medicalRecordRepository.save(record);
    }

    @PutMapping("/{id}")
    public MedicalRecord updateMedicalRecord(@PathVariable Long id, @RequestBody MedicalRecord updatedRecord) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical record not found with id: " + id));
        
        record.setVisitDate(updatedRecord.getVisitDate());
        record.setDiagnosis(updatedRecord.getDiagnosis());
        record.setTreatment(updatedRecord.getTreatment());
        record.setVetName(updatedRecord.getVetName());
        record.setPrescriptions(updatedRecord.getPrescriptions());
        record.setAttachments(updatedRecord.getAttachments());
        
        return medicalRecordRepository.save(record);
    }

    @DeleteMapping("/{id}")
    public void deleteMedicalRecord(@PathVariable Long id) {
        medicalRecordRepository.deleteById(id);
    }
}
