package com.a2zcart.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "seller_commissions")
public class SellerCommission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String orderTrackingNumber;

    private Long orderDbId;

    private Long sellerId;

    @Column(nullable = false)
    private String sellerName;

    private String sellerEmail;
    private String sellerPhone;

    @Column(nullable = false)
    private Long grossAmount; // In integer paise (e.g. 249900 = ₹2,499.00)

    @Column(nullable = false)
    private Double commissionRate = 10.0; // 10% platform fee

    @Column(nullable = false)
    private Long commissionAmount; // In integer paise (e.g. 24990 = ₹249.90)

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, SUBMITTED, VERIFIED, WAIVED

    private String utrNumber; // 12-digit UPI UTR / Reference number when seller pays admin

    private String paymentProofUrl;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime paidAt;
    private LocalDateTime verifiedAt;

    private String adminNotes;

    public SellerCommission() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderTrackingNumber() { return orderTrackingNumber; }
    public void setOrderTrackingNumber(String orderTrackingNumber) { this.orderTrackingNumber = orderTrackingNumber; }

    public Long getOrderDbId() { return orderDbId; }
    public void setOrderDbId(Long orderDbId) { this.orderDbId = orderDbId; }

    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }

    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }

    public String getSellerEmail() { return sellerEmail; }
    public void setSellerEmail(String sellerEmail) { this.sellerEmail = sellerEmail; }

    public String getSellerPhone() { return sellerPhone; }
    public void setSellerPhone(String sellerPhone) { this.sellerPhone = sellerPhone; }

    public Long getGrossAmount() { return grossAmount; }
    public void setGrossAmount(Long grossAmount) { this.grossAmount = grossAmount; }

    public Double getCommissionRate() { return commissionRate; }
    public void setCommissionRate(Double commissionRate) { this.commissionRate = commissionRate; }

    public Long getCommissionAmount() { return commissionAmount; }
    public void setCommissionAmount(Long commissionAmount) { this.commissionAmount = commissionAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getUtrNumber() { return utrNumber; }
    public void setUtrNumber(String utrNumber) { this.utrNumber = utrNumber; }

    public String getPaymentProofUrl() { return paymentProofUrl; }
    public void setPaymentProofUrl(String paymentProofUrl) { this.paymentProofUrl = paymentProofUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }
}
