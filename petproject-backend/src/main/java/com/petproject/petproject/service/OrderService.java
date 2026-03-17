package com.petproject.petproject.service;

import com.petproject.petproject.entity.*;
import com.petproject.petproject.dto.OrderRequest;
import com.petproject.petproject.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.ArrayList;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private UserRepository userRepo;
    
    @Autowired
    private CartService cartService;
    
    @Autowired
    private PaymentService paymentService;

    @Autowired
    private ProductRepository productRepo;

    @Transactional
    public Order createOrder(String email, OrderRequest request) throws Exception {
        // 1. Get User
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // 2. Get Cart and Total
        Cart cart = cartService.getCart(email);
        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }
        
        BigDecimal totalAmount = cart.getTotalPrice();
        if (totalAmount == null || totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
             // fallback calculation if total is not set
             cart.recalculateTotal();
             totalAmount = cart.getTotalPrice();
        }

        Order order;
        
        if ("COD".equalsIgnoreCase(request.getPaymentMethod())) {
            // Handle COD
            order = new Order();
            order.setUser(user);
            order.setUserName(user.getName() != null ? user.getName() : user.getEmail()); // Set userName
            order.setTotalAmount(totalAmount);
            order.setStatus(Order.OrderStatus.PLACED); // Directly PLACED
            order.setPaymentMethod("COD");
            order.setShippingAddress(request.getShippingAddress());
            order = orderRepo.save(order);
            

        } else {
             // Handle Online Payment (Razorpay)
            // 3. Initiate Payment (which creates the initial Order entity)
            // We defer to PaymentService to create the order structure compatible with Razorpay
            Payment payment = paymentService.createOrder(email, totalAmount);
            order = payment.getOrder();
            order.setUserName(user.getName() != null ? user.getName() : user.getEmail()); // Set userName
            order.setPaymentMethod("ONLINE");
            order.setShippingAddress(request.getShippingAddress());
        }
        
        // 5. Transfer Cart Items to Order Items
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            
            // Stock Management
            Product product = cartItem.getProduct();
            // Refresh product from DB to ensure latest stock
            Product dbProduct = productRepo.findById(product.getId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + product.getId()));
            
            System.out.println("DEBUG: Stock check for Product ID: " + dbProduct.getId());
            System.out.println("DEBUG: Available: " + dbProduct.getStockQuantity() + ", Requested: " + cartItem.getQuantity());

            if (dbProduct.getStockQuantity() < cartItem.getQuantity()) {
                System.out.println("DEBUG: Insufficient stock!");
                throw new RuntimeException("Insufficient stock for product: " + dbProduct.getTitle());
            }
            
            // Decrement Stock
            dbProduct.setStockQuantity(dbProduct.getStockQuantity() - cartItem.getQuantity());
            productRepo.save(dbProduct);
            
            orderItem.setProduct(dbProduct);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getPrice());
            orderItems.add(orderItem);
        }
        order.setItems(orderItems);
        
        // 6. Save Updated Order
        // 6. Save Updated Order
        Order savedOrder = orderRepo.save(order);

        // 7. Clear cart for COD orders
        if ("COD".equalsIgnoreCase(request.getPaymentMethod())) {
            cartService.clearCart(email);
        }

        return savedOrder;
    }
    
    @Transactional
    public Order verifyPayment(String razorpayOrderId, String razorpayPaymentId, String signature) {
        // Delegate verification to PaymentService
        Payment payment = paymentService.verifyPayment(razorpayOrderId, razorpayPaymentId, signature);
        
        // Clear Cart after successful payment
        if (payment.getStatus() == Payment.PaymentStatus.SUCCESS) {
             cartService.clearCart(payment.getOrder().getUser().getEmail());
        }
        
        return payment.getOrder();
    }
    
    public List<Order> getUserOrders(String email) {
        User user = userRepo.findByEmail(email).orElse(null);
        if (user == null) return List.of();
        return orderRepo.findByUser(user);
    }
    
    public List<Order> getAllOrders() {
        return orderRepo.findAll();
    }
    
    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(Order.OrderStatus.valueOf(status));
        return orderRepo.save(order);
    }

    public Order getOrderById(Long id) {
        return orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }
}
