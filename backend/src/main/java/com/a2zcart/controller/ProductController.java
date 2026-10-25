package com.a2zcart.controller;

import com.a2zcart.model.Product;
import com.a2zcart.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"})
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<List<Product>> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {

        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(productRepository.findByNameContainingIgnoreCase(search));
        }

        if (category != null && !category.equalsIgnoreCase("all")) {
            return ResponseEntity.ok(productRepository.findByCategory(category));
        }

        return ResponseEntity.ok(productRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Autowired
    private com.a2zcart.repository.SellerCompanyRepository sellerCompanyRepository;

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        if (product.getCreatedAt() == null) {
            product.setCreatedAt(LocalDateTime.now());
        }
        if (product.getSellerName() == null || product.getSellerName().isBlank()) {
            product.setSellerName("Abi");
        }
        if (product.getSeller() == null) {
            sellerCompanyRepository.findById(6L)
                .or(() -> sellerCompanyRepository.findFirstByEmailIgnoreCase("abisheksanthosh06@gmail.com"))
                .ifPresent(product::setSeller);
        }
        Product saved = productRepository.save(product);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/batch")
    public ResponseEntity<List<Product>> createProductsBatch(@RequestBody List<Product> products) {
        com.a2zcart.model.SellerCompany abiSeller = sellerCompanyRepository.findById(6L)
                .or(() -> sellerCompanyRepository.findFirstByEmailIgnoreCase("abisheksanthosh06@gmail.com"))
                .orElse(null);

        for (Product p : products) {
            if (p.getCreatedAt() == null) {
                p.setCreatedAt(LocalDateTime.now());
            }
            if (p.getSellerName() == null || p.getSellerName().isBlank()) {
                p.setSellerName("Abi");
            }
            if (p.getSeller() == null && abiSeller != null) {
                p.setSeller(abiSeller);
            }
        }
        List<Product> saved = productRepository.saveAll(products);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
