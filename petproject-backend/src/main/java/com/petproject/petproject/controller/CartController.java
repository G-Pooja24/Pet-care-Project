package com.petproject.petproject.controller;

import com.petproject.petproject.entity.Cart;
import com.petproject.petproject.service.CartService;
import com.petproject.petproject.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:3000")
public class CartController {

    @Autowired
    private CartService cartService;
    
    @Autowired
    private JwtService jwtService;

    // Helper to get email from token
    private String getEmailFromToken(String token) {
        return jwtService.extractEmail(token.substring(7));
    }

    @GetMapping
    public Cart getCart(@RequestHeader("Authorization") String token) {
        return cartService.getCart(getEmailFromToken(token));
    }

    @PostMapping("/add")
    public Cart addToCart(@RequestHeader("Authorization") String token, @RequestBody Map<String, Object> request) {
        Long productId = Long.valueOf(request.get("productId").toString());
        Integer quantity = Integer.valueOf(request.get("quantity").toString());
        return cartService.addToCart(getEmailFromToken(token), productId, quantity);
    }

    @DeleteMapping("/remove/{productId}")
    public Cart removeFromCart(@RequestHeader("Authorization") String token, @PathVariable Long productId) {
        return cartService.removeFromCart(getEmailFromToken(token), productId);
    }
    
    @PutMapping("/update")
    public Cart updateQuantity(@RequestHeader("Authorization") String token, @RequestBody Map<String, Object> request) {
         Long productId = Long.valueOf(request.get("productId").toString());
         Integer quantity = Integer.valueOf(request.get("quantity").toString());
         return cartService.updateQuantity(getEmailFromToken(token), productId, quantity);
    }

    @DeleteMapping
    public void clearCart(@RequestHeader("Authorization") String token) {
        cartService.clearCart(getEmailFromToken(token));
    }
}
