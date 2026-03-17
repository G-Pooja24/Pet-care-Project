package com.petproject.petproject.controller;

import com.petproject.petproject.entity.Product;
import com.petproject.petproject.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000") // Assuming React default port
public class ProductController {

    @Autowired
    private ProductService service;

    // --- Unified Endpoints ---

    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public Product createProduct(@ModelAttribute Product product, @RequestParam(value = "image", required = false) MultipartFile image) {
        return service.addProduct(product, image);
    }

    @PutMapping(value = "/{id}", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public Product updateProduct(@PathVariable Long id, @ModelAttribute Product product, @RequestParam(value = "image", required = false) MultipartFile image) {
        System.out.println("DEBUG: Updating Product ID: " + id);
        System.out.println("DEBUG: Received StockQuantity: " + product.getStockQuantity());
        return service.updateProduct(id, product, image);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        service.deleteProduct(id);
        return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
    }

    @GetMapping
    public List<Product> getAllProducts() {
        return service.getAllProducts();
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return service.getProductById(id);
    }

    @GetMapping("/search") // ?category=FOOD OR ?min=10&max=100
    public List<Product> searchProducts(@RequestParam(required = false) String category,
                                        @RequestParam(required = false) Double min,
                                        @RequestParam(required = false) Double max) {
        if (category != null) {
            return service.getProductsByCategory(category);
        }
        if (min != null && max != null) {
            return service.getProductsByPriceRange(min, max);
        }
        return service.getAllProducts();
    }
}
