package com.petproject.petproject.controller;
import com.petproject.petproject.Repository.UserRepository;
import com.petproject.petproject.dto.AuthResponse;
import com.petproject.petproject.entity.Role;
import com.petproject.petproject.entity.User;
import com.petproject.petproject.service.EmailService;
import com.petproject.petproject.service.JwtService;
import com.petproject.petproject.service.OtpService;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
@CrossOrigin(origins = "http://localhost:3000")

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository repo;

    @Autowired
    private OtpService otpService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;
    

       // TEST EMAIL
    @GetMapping("/test-email")
    public String testEmail() {
        emailService.sendOtpEmail("gpooja241003@gmail.com", "123456");
        return "OTP Sent Successfully.";
    }

    @PostMapping("/send-otp")
public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {

    String name = request.get("name");
    String email = request.get("email");
    String roleStr = request.get("role");

    Role role;
    try {
        role = Role.valueOf(roleStr.toUpperCase());
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(Map.of("message", "Invalid role!"));
    }

    // 🔥 1️⃣ Check if user exists
    User user = repo.findByEmail(email);

    if (user == null) {
        // ❌ New user → do NOT send OTP → ask to register first
        return ResponseEntity.status(404).body(
            Map.of("message", "User not found! Please register first.")
        );
    }

    // 🔥 2️⃣ Existing user → update name + role (optional)
    user.setName(name);
    user.setRole(role);

    // 🔥 3️⃣ Generate OTP
    String otp = otpService.generateOtp();
    user.setOtp(otp);
    user.setOtpExpiry(otpService.expiryTime());

    repo.save(user);

     // 🔥 4️⃣ Send OTP with proper error handling
    try {
        emailService.sendOtpEmail(email, otp);
    } catch (Exception e) {
        return ResponseEntity.status(500).body(
            Map.of("message", "Failed to send OTP: " + e.getMessage())
        );
    }

    // 🔥 4️⃣ Send OTP
  //  emailService.sendOtpEmail(email, otp);

    return ResponseEntity.ok(Map.of("message", "OTP Sent Successfully!"));
}




@PostMapping("/send-otp-test")
public String test(@RequestParam String email){
    return "OK: " + email;
}

   @PostMapping("/verify-otp")
public ResponseEntity<?> verifyOtp(@RequestParam String email, @RequestParam String otp) {

    User user = repo.findByEmail(email);

    if(user == null) {
        return ResponseEntity.ok(new AuthResponse(null, "User not found!", null));
    }

    if(System.currentTimeMillis() > user.getOtpExpiry()) {
        return ResponseEntity.status(400).body(new AuthResponse(null, "OTP expired!", null));
    }

    if(!otp.equals(user.getOtp())) {
        return ResponseEntity.status(400).body(new AuthResponse(null, "Invalid OTP", null));
    }

    // OTP correct → generate JWT
    String token = jwtService.generateToken(user.getEmail(), user.getRole().name());

    // Optional: clear OTP after successful login
    user.setOtp(null);
    user.setOtpExpiry(null);
    repo.save(user);

//    return ResponseEntity.ok(new AuthResponse(token, "Login Successful!", user.getRole().name()));
    return ResponseEntity.ok(Map.of(
    "token", token,
    "message", "Login Successful!",
   // "role", user.getRole().name().replace("ROLE_", ""),  // removes ROLE_
    "role", user.getRole().name(),

    "name", user.getName()
));
}


/* 
    // Step 2: verify OTP (login / register)
    @PostMapping("/verify-otp")
    public String verifyOtp(@RequestParam String email, @RequestParam String otp) {

        User user = repo.findByEmail(email);

        if (user == null)
            return "User not found!";

        if (!user.getOtp().equals(otp))
            return "Invalid OTP!";

        if (System.currentTimeMillis() > user.getOtpExpiry())
            return "OTP expired!";

        return "Login Successful!";
    }
*/

    @PostMapping("/register")
public String register(@RequestBody Map<String, String> request) {

    String name = request.get("name");
    String email = request.get("email");
    String password = request.get("password");
    String roleStr = request.get("role");

    // Validate role
    Role role;
    try {
        role = Role.valueOf(roleStr.toUpperCase());
    } catch (Exception e) {
        return "Invalid role";
    }

    // Check if already exists
    if (repo.findByEmail(email) != null) {
        return "Email already registered!";
    }

    // Create user
    User user = new User();
    user.setName(name);
    user.setEmail(email);

    // ✅ Hash password before saving
    user.setPassword(passwordEncoder.encode(password));

    user.setRole(role);
    user.setCreatedAt(String.valueOf(System.currentTimeMillis()));

    // Save to DB
    repo.save(user);

    return "Registration successful!";
}

}