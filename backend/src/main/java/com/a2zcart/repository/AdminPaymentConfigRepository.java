package com.a2zcart.repository;

import com.a2zcart.model.AdminPaymentConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminPaymentConfigRepository extends JpaRepository<AdminPaymentConfig, Long> {
    Optional<AdminPaymentConfig> findFirstByOrderByIdDesc();
}
