package com.petproject.petproject.controller;

import com.petproject.petproject.entity.Address;
import com.petproject.petproject.entity.Order;
import com.petproject.petproject.service.JwtService;
import com.petproject.petproject.service.OrderService;
import com.razorpay.RazorpayException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import com.petproject.petproject.dto.OrderRequest;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private JwtService jwtService;

    private String getEmailFromToken(String token) {
        return jwtService.extractEmail(token.substring(7));
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestHeader("Authorization") String token, @RequestBody OrderRequest request) {
        try {
            System.out.println("Received Order Request: " + request);
            if (request.getShippingAddress() != null) {
                System.out.println("Shipping Address: " + request.getShippingAddress().getCity());
            } else {
                System.out.println("Shipping Address is NULL");
            }
            Order order = orderService.createOrder(getEmailFromToken(token), request);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            System.err.println("Error during checkout: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        try {
            Order order = orderService.getOrderById(id);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
             return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> data) {
        try {
            Order order = orderService.verifyPayment(
                    data.get("razorpay_order_id"),
                    data.get("razorpay_payment_id"),
                    data.get("razorpay_signature")
            );
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Verification failed: " + e.getMessage());
        }
    }

    @GetMapping("/my-orders")
    public List<Order> getMyOrders(@RequestHeader("Authorization") String token) {
        return orderService.getUserOrders(getEmailFromToken(token));
    }
    
    // Admin: Get all orders
    @GetMapping("/admin/all")
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }
    
    // Admin: Update status
    // Admin: Update status
    @PutMapping("/{orderId}/status")
    public Order updateStatus(@PathVariable Long orderId, @RequestParam String status) {
        return orderService.updateOrderStatus(orderId, status);
    }
}
