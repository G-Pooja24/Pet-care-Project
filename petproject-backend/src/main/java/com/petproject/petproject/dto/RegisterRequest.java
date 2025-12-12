package com.petproject.petproject.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String role;
    private String password;   // if you add password later
}
