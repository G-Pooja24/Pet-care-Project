package com.petproject.petproject.service;

import org.springframework.stereotype.Service;
import java.util.Random;

@Service
public class OtpService {

    public String generateOtp() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    public Long expiryTime() {
        return System.currentTimeMillis() + (5 * 60 * 1000); // 5 minutes
    }
}