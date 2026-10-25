package com.a2zcart.repository;

import com.a2zcart.model.SellerCompany;
import com.a2zcart.model.SellerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SellerCompanyRepository extends JpaRepository<SellerCompany, Long> {
    Optional<SellerCompany> findByUserId(Long userId);
    Optional<SellerCompany> findFirstByEmailIgnoreCase(String email);
    Optional<SellerCompany> findFirstByOrderByIdDesc();
    List<SellerCompany> findByStatus(SellerStatus status);
}
