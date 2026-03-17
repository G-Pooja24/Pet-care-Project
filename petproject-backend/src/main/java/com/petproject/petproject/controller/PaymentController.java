package com.petproject.petproject.controller;

import com.petproject.petproject.entity.Payment;
import com.petproject.petproject.entity.Cart;
import com.petproject.petproject.service.CartService;
import com.petproject.petproject.service.JwtService;
import com.petproject.petproject.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "http://localhost:3000") // Adjust as needed
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CartService cartService;

    @PostMapping("/create-order")
    public Payment createOrder(@RequestHeader("Authorization") String token, @RequestBody(required = false) Map<String, Object> data) {
        try {
            String email = jwtService.extractEmail(token.replace("Bearer ", ""));
            
            // Fix: Fetch amount from Cart instead of trusting frontend
            Cart cart = cartService.getCart(email);
            BigDecimal amount = cart.getTotalPrice();

            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                 cart.recalculateTotal();
                 amount = cart.getTotalPrice();
            }
            
            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Cart is empty or total is zero");
            }
            
            return paymentService.createOrder(email, amount);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error creating order: " + e.getMessage());
        }
    }

    @PostMapping("/verify")
    public Payment verifyPayment(@RequestBody Map<String, Object> data) {
        String orderId = (String) data.get("razorpay_order_id");
        String paymentId = (String) data.get("razorpay_payment_id");
        String signature = (String) data.get("razorpay_signature");

        return paymentService.verifyPayment(orderId, paymentId, signature);
    }
}
