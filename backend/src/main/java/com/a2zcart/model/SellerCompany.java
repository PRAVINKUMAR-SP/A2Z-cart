package com.a2zcart.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "seller_companies")
public class SellerCompany {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    @Column(nullable = false)
    private String companyName;

    private String businessType;

    @Column(nullable = true)
    private String gstin;

    @Column(nullable = true)
    private String panNumber;

    @Column(columnDefinition = "TEXT")
    private String registeredAddress;

    private String storeCategory;
    private String bankAccount;

    private String phone;
    private String email;

    @Column(columnDefinition = "TEXT")
    private String storeDp;

    @Column(columnDefinition = "TEXT")
    private String gpayQr;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SellerStatus status = SellerStatus.APPROVED;

    private String adminNotes;
    private LocalDateTime appliedAt = LocalDateTime.now();
    private LocalDateTime approvedAt;

    public SellerCompany() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getBusinessType() { return businessType; }
    public void setBusinessType(String businessType) { this.businessType = businessType; }

    public String getGstin() { return gstin; }
    public void setGstin(String gstin) { this.gstin = gstin; }

    public String getPanNumber() { return panNumber; }
    public void setPanNumber(String panNumber) { this.panNumber = panNumber; }

    public String getRegisteredAddress() { return registeredAddress; }
    public void setRegisteredAddress(String registeredAddress) { this.registeredAddress = registeredAddress; }

    public String getStoreCategory() { return storeCategory; }
    public void setStoreCategory(String storeCategory) { this.storeCategory = storeCategory; }

    public String getBankAccount() { return bankAccount; }
    public void setBankAccount(String bankAccount) { this.bankAccount = bankAccount; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getStoreDp() { return storeDp; }
    public void setStoreDp(String storeDp) { this.storeDp = storeDp; }

    public String getGpayQr() { return gpayQr; }
    public void setGpayQr(String gpayQr) { this.gpayQr = gpayQr; }

    public SellerStatus getStatus() { return status; }
    public void setStatus(SellerStatus status) { this.status = status; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }

    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
}
