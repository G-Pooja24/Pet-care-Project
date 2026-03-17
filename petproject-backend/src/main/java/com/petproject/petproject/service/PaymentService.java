package com.petproject.petproject.service;
import com.petproject.petproject.config.RazorpayConfig;
import com.petproject.petproject.entity.*;
import com.petproject.petproject.repository.OrderRepository;
import com.petproject.petproject.repository.PaymentRepository;
import com.petproject.petproject.repository.ProductRepository;
import com.petproject.petproject.repository.UserRepository;
import com.petproject.petproject.service.CartService;
import com.razorpay.RazorpayClient;
import jakarta.transaction.Transactional;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
//import jakarta.xml.bind.DatatypeConverter; // For hex conversion if needed, or use customized bytesToHex

import java.math.BigDecimal;
import java.security.SignatureException;
import java.util.ArrayList;
import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private RazorpayClient razorpayClient;

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private PaymentRepository paymentRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private CartService cartService;

    @Autowired
    private ProductRepository productRepo;

    @Value("${razorpay.key.secret}")
    private String razorpaySecret;

    @Transactional
    public Payment createOrder(String email, BigDecimal amount) throws Exception {
        User user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Cart cart = cartService.getCart(email);

        // 1. Create Order in Razorpay
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amount.multiply(new BigDecimal(100))); // Amount in paise
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

        com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);
        String rzpOrderId = razorpayOrder.get("id");

        // 2. Create Local Order WITH ITEMS
        Order order = new Order();
        order.setUser(user);
        order.setTotalAmount(amount);
        order.setRazorpayOrderId(rzpOrderId);
        order.setStatus(Order.OrderStatus.INITIATED);
        order.setUserName(user.getName() != null ? user.getName() : user.getEmail());
        // Set Payment Method as ONLINE since we are in PaymentService
        order.setPaymentMethod("ONLINE");

        // Transfer Items from Cart
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            
            // Stock Management
            Product product = cartItem.getProduct();
            // Refresh product from DB
            Product dbProduct = productRepo.findById(product.getId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + product.getId()));
            
            if (dbProduct.getStockQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + dbProduct.getTitle());
            }
            
            // Note: We decrement stock here to reserve it.
            dbProduct.setStockQuantity(dbProduct.getStockQuantity() - cartItem.getQuantity());
            productRepo.save(dbProduct);
            
            orderItem.setProduct(dbProduct);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getPrice());
            orderItems.add(orderItem);
        }
        order.setItems(orderItems);
        
        Order savedOrder = orderRepo.save(order);

        // 3. Create Local Payment Record
        Payment payment = new Payment();
        payment.setOrder(savedOrder);
        payment.setRazorpayOrderId(rzpOrderId);
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setAmount(amount);

        return paymentRepo.save(payment);
    }

    @Transactional
    public Payment verifyPayment(String razorpayOrderId, String razorpayPaymentId, String signature) {
        Payment payment = paymentRepo.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new RuntimeException("Payment record not found"));

        if (payment.getStatus() == Payment.PaymentStatus.SUCCESS) {
            return payment; // Already verified
        }

        try {
            // 1. Verify Signature
            String generatedSignature = calculateRFC2104HMAC(razorpayOrderId + "|" + razorpayPaymentId, razorpaySecret);
            if (!generatedSignature.equals(signature)) {
                // Signature mismatch - Mark as FAILED
                payment.setRazorpayPaymentId(razorpayPaymentId); // Still save the ID for reference
                payment.setRazorpaySignature(signature);
                payment.setStatus(Payment.PaymentStatus.FAILED);
                paymentRepo.save(payment);
                throw new RuntimeException("Payment signature verification failed");
            }

            // 2. Success - Update Payment Status
            payment.setRazorpayPaymentId(razorpayPaymentId);
            payment.setRazorpaySignature(signature);
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            Payment savedPayment = paymentRepo.save(payment);

            // 3. Update Order Status
            Order order = payment.getOrder();
            order.setStatus(Order.OrderStatus.PLACED);
            orderRepo.save(order);

            // 4. Clear Cart
            cartService.clearCart(order.getUser().getEmail());

            return savedPayment;

        } catch (Exception e) {
            // General failure during verification
            payment.setRazorpayPaymentId(razorpayPaymentId);
            payment.setStatus(Payment.PaymentStatus.FAILED);
            paymentRepo.save(payment);
            throw new RuntimeException("Error verifying payment: " + e.getMessage());
        }
    }

    private String calculateRFC2104HMAC(String data, String secret) throws java.security.NoSuchAlgorithmException, java.security.InvalidKeyException {
        String result;
        final String HMAC_SHA256_ALGORITHM = "HmacSHA256";
        SecretKeySpec signingKey = new SecretKeySpec(secret.getBytes(), HMAC_SHA256_ALGORITHM);
        Mac mac = Mac.getInstance(HMAC_SHA256_ALGORITHM);
        mac.init(signingKey);
        byte[] rawHmac = mac.doFinal(data.getBytes());
        
        // Convert to Hex
        StringBuilder hexString = new StringBuilder();
        for (byte b : rawHmac) {
            String hex = Integer.toHexString(0xff & b);
            if(hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
