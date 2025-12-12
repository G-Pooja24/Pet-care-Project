package com.petproject.petproject.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;


@Entity
@Table(name="reminders")
public class Reminder {
@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
private Long petId;
private String type;
private LocalDateTime dueDate;
private String repeatRule;
@Column(columnDefinition = "json")
private String metadata;
private Boolean notified = false;
}