package com.a2zcart.repository;

import com.a2zcart.model.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {
    List<UserAddress> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<UserAddress> findByEmailIgnoreCaseOrderByCreatedAtDesc(String email);
    List<UserAddress> findByUserIdOrEmailIgnoreCaseOrderByCreatedAtDesc(Long userId, String email);
}
