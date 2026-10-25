package com.a2zcart.repository;

import com.a2zcart.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserIdOrUserEmailIgnoreCaseOrderByUpdatedAtDesc(Long userId, String email);
    List<CartItem> findByUserEmailIgnoreCaseOrderByUpdatedAtDesc(String email);
    List<CartItem> findByUserIdOrderByUpdatedAtDesc(Long userId);

    Optional<CartItem> findByUserIdAndProductId(Long userId, String productId);
    Optional<CartItem> findByUserEmailIgnoreCaseAndProductId(String email, String productId);

    @Transactional
    @Modifying
    void deleteByProductIdAndUserId(String productId, Long userId);

    @Transactional
    @Modifying
    void deleteByProductIdAndUserEmailIgnoreCase(String productId, String email);

    @Transactional
    @Modifying
    void deleteByUserId(Long userId);

    @Transactional
    @Modifying
    void deleteByUserEmailIgnoreCase(String email);
}
