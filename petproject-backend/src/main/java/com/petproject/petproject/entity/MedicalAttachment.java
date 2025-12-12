package com.petproject.petproject.entity;

//package com.petproject.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;


@Entity
@Table(name="medical_attachments")
public class MedicalAttachment {
@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
private Long recordId;
private String fileName;
private String filePath;
private LocalDateTime uploadedAt;
// getters & setters
}