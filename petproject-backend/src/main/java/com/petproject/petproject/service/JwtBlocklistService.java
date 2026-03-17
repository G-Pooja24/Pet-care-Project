package com.petproject.petproject.service;

import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class JwtBlocklistService {

    private final Set<String> blockedTokens = ConcurrentHashMap.newKeySet();

    public void blockToken(String token) {
        blockedTokens.add(token);
    }

    public boolean isTokenBlocked(String token) {
        return blockedTokens.contains(token);
    }
}
