
package com.petproject.petproject.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String SECRET;  // Loaded from application.properties

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    }

    // Generate JWT
    public String generateToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24h
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Parse token safely
    private Jws<Claims> parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
    }

    // Extract all claims
    public Claims extractClaims(String token) {
        return parseToken(token).getBody();
    }

    // Extract email (subject)
    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    // Extract username for Spring Security
    public String extractUsername(String token) {
        return extractEmail(token);
    }

    // Validate token
    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}






















// package com.petproject.petproject.service;

// import io.jsonwebtoken.*;
// import io.jsonwebtoken.security.Keys;
// import org.springframework.stereotype.Service;

// import java.security.Key;
// import java.util.Date;

// @Service
// public class JwtService {

//     private static final String SECRET = "your-super-secret-key-change-this-your-super-secret-key-change-this";

//     private Key getSigningKey() {
//         return Keys.hmacShaKeyFor(SECRET.getBytes());
//     }

//     // Generate JWT
//     public String generateToken(String email, String role) {
//         return Jwts.builder()
//                 .setSubject(email)
//                 .claim("role", role)
//                 .setIssuedAt(new Date())
//                 .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24h
//                 .signWith(getSigningKey(), SignatureAlgorithm.HS256)
//                 .compact();
//     }

//     // Parse token
//     private Jws<Claims> parseToken(String token) {
//         return Jwts.parserBuilder()
//                 .setSigningKey(getSigningKey())
//                 .build()
//                 .parseClaimsJws(token);
//     }

//     // Extract all claims
//     public Claims extractClaims(String token) {
//         return parseToken(token).getBody();
//     }

//     // Extract email (subject)
//     public String extractEmail(String token) {
//         return extractClaims(token).getSubject();
//     }

//     // Extract username for Spring Security (same as email)
//     public String extractUsername(String token) {
//         return extractEmail(token);
//     }

//     // Validate token
//     public boolean validateToken(String token) {
//         try {
//             parseToken(token);
//             return true;
//         } catch (JwtException | IllegalArgumentException e) {
//             return false;
//         }
//     }
// }
