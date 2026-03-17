package com.petproject.petproject.service;

import com.petproject.petproject.entity.Cart;
import com.petproject.petproject.entity.CartItem;
import com.petproject.petproject.entity.Product;
import com.petproject.petproject.entity.User;
import com.petproject.petproject.repository.CartRepository;
import com.petproject.petproject.repository.ProductRepository;
import com.petproject.petproject.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepo;

    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private UserRepository userRepo;

    @Transactional
    public Cart getCart(String email) {
        User user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return cartRepo.findByUser(user).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUser(user);
            return cartRepo.save(newCart);
        });
    }

    @Transactional
    public Cart addToCart(String email, Long productId, Integer quantity) {
        Cart cart = getCart(email);
        Product product = productRepo.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));

        if (quantity > product.getStockQuantity()) {
             throw new RuntimeException("There are only " + product.getStockQuantity() + " products available");
        }

        // Check if item already exists
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + quantity;
            if (newQuantity > product.getStockQuantity()) {
                throw new RuntimeException("There are only " + product.getStockQuantity() + " products available");
            }
            item.setQuantity(newQuantity);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            newItem.setPrice(product.getPrice());
            cart.getItems().add(newItem);
        }

        cart.recalculateTotal();
        return cartRepo.save(cart);
    }

    @Transactional
    public Cart removeFromCart(String email, Long productId) {
        Cart cart = getCart(email);
        cart.getItems().removeIf(item -> item.getProduct().getId().equals(productId));
        cart.recalculateTotal();
        return cartRepo.save(cart);
    }

    @Transactional
    public Cart updateQuantity(String email, Long productId, Integer quantity) {
        Cart cart = getCart(email);
        
        // 1. Fetch the product to check stock (need to fetch it again or from item)
        // Ideally we should look up the product fresh from DB to be sure
        Product product = productRepo.findById(productId)
             .orElseThrow(() -> new RuntimeException("Product not found"));
             
        if (quantity > product.getStockQuantity()) {
            throw new RuntimeException("There are only " + product.getStockQuantity() + " products available");
        }

        cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst()
                .ifPresent(item -> item.setQuantity(quantity));
        cart.recalculateTotal();
        return cartRepo.save(cart);
    }

    @Transactional
    public void clearCart(String email) {
        Cart cart = getCart(email);
        cart.getItems().clear();
        cart.setTotalPrice(java.math.BigDecimal.ZERO);
        cartRepo.save(cart);
    }
}
