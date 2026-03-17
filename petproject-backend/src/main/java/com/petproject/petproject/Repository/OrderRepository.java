package com.petproject.petproject.repository;

import com.petproject.petproject.entity.Order;
import com.petproject.petproject.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(User user);
    Order findByRazorpayOrderId(String razorpayOrderId);
}
