package com.petproject.petproject.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name="street", column=@Column(name="street")),
        @AttributeOverride(name="city", column=@Column(name="city")),
        @AttributeOverride(name="state", column=@Column(name="state")),
        @AttributeOverride(name="zipCode", column=@Column(name="zip_code")),
        @AttributeOverride(name="country", column=@Column(name="country"))
    })
    private Address shippingAddress;

    @Column(nullable = false)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.PLACED; // PLACED, SHIPPED, DELIVERED...

    private String razorpayOrderId; // From Razorpay
    
    private String paymentMethod; // "COD" or "ONLINE"

    private String userName; // For easier display

    private LocalDateTime orderDate = LocalDateTime.now();

    public enum OrderStatus {
        INITIATED, // Technical status: Payment started
        
        // User Lifecycle
        PLACED,
        PACKED,
        SHIPPED,
        OUT_FOR_DELIVERY,
        DELIVERED,
        RETURNED,
        
        CANCELLED
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }

    public Address getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(Address shippingAddress) { this.shippingAddress = shippingAddress; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
}
