package com.a2zcart.repository;

import com.a2zcart.model.SellerCommission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SellerCommissionRepository extends JpaRepository<SellerCommission, Long> {
    List<SellerCommission> findAllByOrderByCreatedAtDesc();
    List<SellerCommission> findBySellerIdOrderByCreatedAtDesc(Long sellerId);
    List<SellerCommission> findBySellerNameIgnoreCaseOrderByCreatedAtDesc(String sellerName);
    Optional<SellerCommission> findByOrderTrackingNumber(String orderTrackingNumber);
    List<SellerCommission> findByStatusOrderByCreatedAtDesc(String status);
}
