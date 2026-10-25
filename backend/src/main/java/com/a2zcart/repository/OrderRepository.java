package com.a2zcart.repository;

import com.a2zcart.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Order> findByBuyerEmailIgnoreCaseOrderByCreatedAtDesc(String buyerEmail);
    List<Order> findByUserIdOrBuyerEmailIgnoreCaseOrderByCreatedAtDesc(Long userId, String buyerEmail);
    Optional<Order> findByOrderTrackingNumber(String trackingNumber);
    List<Order> findAllByOrderByCreatedAtDesc();
}
