package com.petproject.petproject.service;

import com.petproject.petproject.entity.Product;
import com.petproject.petproject.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository repo;
    private final String UPLOAD_DIR = "uploads/";

    @Autowired
    public ProductService(ProductRepository repo) {
        this.repo = repo;
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize upload directory", e);
        }
    }

    public Product addProduct(Product product, MultipartFile image) {
        if (image != null && !image.isEmpty()) {
            product.setImageUrl(saveFile(image));
        }
        return repo.save(product);
    }

    // Overload for backward compatibility/testing if needed, or just redirect
    public Product addProduct(Product product) {
        return addProduct(product, null);
    }

    public Product updateProduct(Long id, Product details, MultipartFile image) {
        Product product = repo.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        product.setTitle(details.getTitle());
        product.setDescription(details.getDescription());
        product.setPrice(details.getPrice());
        product.setStockQuantity(details.getStockQuantity());
        product.setCategory(details.getCategory());
        
        if (image != null && !image.isEmpty()) {
            product.setImageUrl(saveFile(image));
        }
        // If image is null, we keep the existing imageUrl
        
        return repo.save(product);
    }

    // Overload for existing controller usage (will be replaced, but good to keep signature for now)
    public Product updateProduct(Long id, Product details) {
        return updateProduct(id, details, null);
    }

    public void deleteProduct(Long id) {
        repo.deleteById(id);
    }

    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    public Product getProductById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public List<Product> getProductsByCategory(String category) {
        return repo.findByCategory(category);
    }

    public List<Product> getProductsByPriceRange(Double min, Double max) {
        return repo.findByPriceBetween(BigDecimal.valueOf(min), BigDecimal.valueOf(max));
    }

    private String saveFile(MultipartFile file) {
        try {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path path = Paths.get(UPLOAD_DIR + fileName);
            Files.write(path, file.getBytes());
            return fileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }
}
