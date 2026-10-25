package com.a2zcart.repository;

import com.a2zcart.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(String category);
    List<Product> findBySellerId(Long sellerId);
    List<Product> findByNameContainingIgnoreCase(String name);
}
