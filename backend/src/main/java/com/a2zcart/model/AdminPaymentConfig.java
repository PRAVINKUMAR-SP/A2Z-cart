package com.a2zcart.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admin_payment_config")
public class AdminPaymentConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String adminName = "A2Z Cart Platform Admin";

    @Column(nullable = false)
    private String adminUpiId = "8072628827@upi";

    private String adminPhone = "8072628827";

    private String adminEmail = "pravin007ptk@gmail.com";

    @Column(columnDefinition = "TEXT")
    private String adminQrPhoto;

    private Double defaultCommissionRate = 10.0;

    private LocalDateTime updatedAt = LocalDateTime.now();

    public AdminPaymentConfig() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAdminName() { return adminName; }
    public void setAdminName(String adminName) { this.adminName = adminName; }

    public String getAdminUpiId() { return adminUpiId; }
    public void setAdminUpiId(String adminUpiId) { this.adminUpiId = adminUpiId; }

    public String getAdminPhone() { return adminPhone; }
    public void setAdminPhone(String adminPhone) { this.adminPhone = adminPhone; }

    public String getAdminEmail() { return adminEmail; }
    public void setAdminEmail(String adminEmail) { this.adminEmail = adminEmail; }

    public String getAdminQrPhoto() { return adminQrPhoto; }
    public void setAdminQrPhoto(String adminQrPhoto) { this.adminQrPhoto = adminQrPhoto; }

    public Double getDefaultCommissionRate() { return defaultCommissionRate; }
    public void setDefaultCommissionRate(Double defaultCommissionRate) { this.defaultCommissionRate = defaultCommissionRate; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
