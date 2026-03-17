package com.petproject.petproject.service;

import com.petproject.petproject.entity.Product;
import com.petproject.petproject.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class ProductServiceTest {

    @Mock
    private ProductRepository repo;

    @InjectMocks
    private ProductService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void updateProduct_ShouldNotDecrementValues() {
        // Arrange
        Long productId = 1L;
        Product existingProduct = new Product();
        existingProduct.setId(productId);
        existingProduct.setStockQuantity(100);
        existingProduct.setPrice(new BigDecimal("100.00"));

        Product updateDetails = new Product();
        updateDetails.setStockQuantity(599);
        updateDetails.setPrice(new BigDecimal("599.00"));
        updateDetails.setTitle("Updated Title");
        updateDetails.setDescription("Updated Desc");
        updateDetails.setCategory("FOOD");

        when(repo.findById(productId)).thenReturn(Optional.of(existingProduct));
        when(repo.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        service.updateProduct(productId, updateDetails);

        // Assert
        ArgumentCaptor<Product> productCaptor = ArgumentCaptor.forClass(Product.class);
        verify(repo).save(productCaptor.capture());

        Product savedProduct = productCaptor.getValue();
        
        System.out.println("DEBUG TEST: Saved Stock: " + savedProduct.getStockQuantity());
        System.out.println("DEBUG TEST: Saved Price: " + savedProduct.getPrice());

        assertEquals(599, savedProduct.getStockQuantity(), "Stock quantity should be 599");
        assertEquals(new BigDecimal("599.00"), savedProduct.getPrice(), "Price should be 599.00");
    }
}
