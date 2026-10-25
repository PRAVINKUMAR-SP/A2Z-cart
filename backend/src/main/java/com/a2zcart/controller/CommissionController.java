package com.a2zcart.controller;

import com.a2zcart.model.AdminPaymentConfig;
import com.a2zcart.model.Order;
import com.a2zcart.model.SellerCommission;
import com.a2zcart.repository.AdminPaymentConfigRepository;
import com.a2zcart.repository.OrderRepository;
import com.a2zcart.repository.SellerCommissionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/commissions")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"})
public class CommissionController {

    @Autowired
    private SellerCommissionRepository commissionRepository;

    @Autowired
    private AdminPaymentConfigRepository adminPaymentConfigRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ObjectMapper objectMapper;

    // Helper to get or create active Admin Payment Config
    private AdminPaymentConfig getOrCreateAdminConfig() {
        return adminPaymentConfigRepository.findFirstByOrderByIdDesc().orElseGet(() -> {
            AdminPaymentConfig cfg = new AdminPaymentConfig();
            cfg.setAdminName("A2Z Cart Platform Operations");
            cfg.setAdminUpiId("8072628827@upi");
            cfg.setAdminPhone("8072628827");
            cfg.setAdminEmail("pravin007ptk@gmail.com");
            cfg.setDefaultCommissionRate(10.0);
            return adminPaymentConfigRepository.save(cfg);
        });
    }

    /**
     * 1. Get Admin Receiving Payment Config (UPI ID, Admin Name, Phone, QR)
     */
    @GetMapping("/config")
    public ResponseEntity<?> getAdminPaymentConfig() {
        return ResponseEntity.ok(getOrCreateAdminConfig());
    }

    /**
     * 2. Update Admin Receiving Payment Config (Admin only)
     */
    @PostMapping("/config")
    public ResponseEntity<?> updateAdminPaymentConfig(@RequestBody Map<String, Object> body) {
        AdminPaymentConfig cfg = getOrCreateAdminConfig();

        if (body.get("adminName") != null) cfg.setAdminName(body.get("adminName").toString());
        if (body.get("adminUpiId") != null) cfg.setAdminUpiId(body.get("adminUpiId").toString());
        if (body.get("adminPhone") != null) cfg.setAdminPhone(body.get("adminPhone").toString());
        if (body.get("adminEmail") != null) cfg.setAdminEmail(body.get("adminEmail").toString());
        if (body.get("adminQrPhoto") != null) cfg.setAdminQrPhoto(body.get("adminQrPhoto").toString());
        if (body.get("defaultCommissionRate") != null) {
            try {
                cfg.setDefaultCommissionRate(Double.parseDouble(body.get("defaultCommissionRate").toString()));
            } catch (Exception ignored) {}
        }
        cfg.setUpdatedAt(LocalDateTime.now());
        adminPaymentConfigRepository.save(cfg);

        return ResponseEntity.ok(Map.of("message", "Admin receiving payment configuration updated", "config", cfg));
    }

    /**
     * 3. Get Seller's Commission Ledger & Invoices
     * Calculates total direct sales received, total 10% commission, pending due, and itemized invoices.
     */
    @GetMapping("/seller")
    public ResponseEntity<?> getSellerCommissionLedger(
            @RequestParam(required = false) Long sellerId,
            @RequestParam(required = false) String sellerName
    ) {
        // Sync any orders in the system that do not have a commission invoice yet
        syncMissingOrderCommissions();

        List<SellerCommission> all = commissionRepository.findAllByOrderByCreatedAtDesc();
        List<SellerCommission> filtered = new ArrayList<>();

        for (SellerCommission sc : all) {
            boolean match = false;
            if (sellerId != null && Objects.equals(sc.getSellerId(), sellerId)) {
                match = true;
            } else if (sellerName != null && !sellerName.isBlank()) {
                if (sc.getSellerName() != null && sc.getSellerName().toLowerCase().contains(sellerName.trim().toLowerCase())) {
                    match = true;
                }
            } else {
                match = true; // All if unspecified
            }
            if (match) filtered.add(sc);
        }

        long totalGrossSalesPaise = 0L;
        long totalCommissionPaise = 0L;
        long pendingCommissionPaise = 0L;
        long submittedCommissionPaise = 0L;
        long verifiedCommissionPaise = 0L;

        for (SellerCommission sc : filtered) {
            totalGrossSalesPaise += (sc.getGrossAmount() != null ? sc.getGrossAmount() : 0L);
            long comm = (sc.getCommissionAmount() != null ? sc.getCommissionAmount() : 0L);
            totalCommissionPaise += comm;

            String st = sc.getStatus() != null ? sc.getStatus().toUpperCase() : "PENDING";
            if ("PENDING".equals(st)) {
                pendingCommissionPaise += comm;
            } else if ("SUBMITTED".equals(st)) {
                submittedCommissionPaise += comm;
            } else if ("VERIFIED".equals(st)) {
                verifiedCommissionPaise += comm;
            }
        }

        AdminPaymentConfig adminConfig = getOrCreateAdminConfig();

        Map<String, Object> resp = new HashMap<>();
        resp.put("totalGrossSalesPaise", totalGrossSalesPaise);
        resp.put("totalCommissionPaise", totalCommissionPaise);
        resp.put("pendingCommissionPaise", pendingCommissionPaise);
        resp.put("submittedCommissionPaise", submittedCommissionPaise);
        resp.put("verifiedCommissionPaise", verifiedCommissionPaise);
        resp.put("invoices", filtered);
        resp.put("adminPaymentConfig", adminConfig);

        return ResponseEntity.ok(resp);
    }

    /**
     * 4. Seller Pays Commission to Admin QR
     * Seller scans Admin QR, pays the pending commission, and enters 12-digit UTR reference.
     */
    @PostMapping("/seller/pay")
    public ResponseEntity<?> submitCommissionPayment(@RequestBody Map<String, Object> body) {
        String utrNumber = (String) body.get("utrNumber");
        if (utrNumber == null || utrNumber.trim().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please enter a valid UPI Reference / UTR Number"));
        }

        Object invoiceIdsObj = body.get("invoiceIds");
        List<Long> idsToPay = new ArrayList<>();

        if (invoiceIdsObj instanceof List<?> list) {
            for (Object item : list) {
                try {
                    idsToPay.add(Long.valueOf(item.toString()));
                } catch (Exception ignored) {}
            }
        }

        List<SellerCommission> updated = new ArrayList<>();

        if (!idsToPay.isEmpty()) {
            for (Long id : idsToPay) {
                Optional<SellerCommission> opt = commissionRepository.findById(id);
                if (opt.isPresent()) {
                    SellerCommission sc = opt.get();
                    if (!"VERIFIED".equalsIgnoreCase(sc.getStatus())) {
                        sc.setStatus("SUBMITTED");
                        sc.setUtrNumber(utrNumber.trim());
                        sc.setPaidAt(LocalDateTime.now());
                        updated.add(commissionRepository.save(sc));
                    }
                }
            }
        } else {
            // If no specific IDs passed, update all pending for this seller
            String sellerName = (String) body.get("sellerName");
            List<SellerCommission> all = commissionRepository.findAll();
            for (SellerCommission sc : all) {
                boolean match = (sellerName == null || sc.getSellerName().equalsIgnoreCase(sellerName.trim()));
                if (match && "PENDING".equalsIgnoreCase(sc.getStatus())) {
                    sc.setStatus("SUBMITTED");
                    sc.setUtrNumber(utrNumber.trim());
                    sc.setPaidAt(LocalDateTime.now());
                    updated.add(commissionRepository.save(sc));
                }
            }
        }

        return ResponseEntity.ok(Map.of(
                "message", "Commission payment submitted successfully! Admin will verify against bank records.",
                "updatedCount", updated.size(),
                "utrNumber", utrNumber
        ));
    }

    /**
     * 5. Admin Platform Overview: All Commission Invoices
     */
    @GetMapping("/admin")
    public ResponseEntity<?> getAdminCommissionLedger() {
        syncMissingOrderCommissions();

        List<SellerCommission> invoices = commissionRepository.findAllByOrderByCreatedAtDesc();

        long totalPlatformGrossPaise = 0L;
        long totalCommissionAccruedPaise = 0L;
        long totalCommissionPendingPaise = 0L;
        long totalCommissionSubmittedPaise = 0L;
        long totalCommissionCollectedPaise = 0L;

        for (SellerCommission sc : invoices) {
            totalPlatformGrossPaise += (sc.getGrossAmount() != null ? sc.getGrossAmount() : 0L);
            long comm = (sc.getCommissionAmount() != null ? sc.getCommissionAmount() : 0L);
            totalCommissionAccruedPaise += comm;

            String st = sc.getStatus() != null ? sc.getStatus().toUpperCase() : "PENDING";
            if ("PENDING".equals(st)) {
                totalCommissionPendingPaise += comm;
            } else if ("SUBMITTED".equals(st)) {
                totalCommissionSubmittedPaise += comm;
            } else if ("VERIFIED".equals(st)) {
                totalCommissionCollectedPaise += comm;
            }
        }

        AdminPaymentConfig adminConfig = getOrCreateAdminConfig();

        Map<String, Object> resp = new HashMap<>();
        resp.put("totalPlatformGrossPaise", totalPlatformGrossPaise);
        resp.put("totalCommissionAccruedPaise", totalCommissionAccruedPaise);
        resp.put("totalCommissionPendingPaise", totalCommissionPendingPaise);
        resp.put("totalCommissionSubmittedPaise", totalCommissionSubmittedPaise);
        resp.put("totalCommissionCollectedPaise", totalCommissionCollectedPaise);
        resp.put("adminPaymentConfig", adminConfig);
        resp.put("invoices", invoices);

        return ResponseEntity.ok(resp);
    }

    /**
     * 6. Admin Verifies Commission Payment (Marks VERIFIED)
     */
    @PostMapping("/admin/{id}/verify")
    public ResponseEntity<?> verifyCommissionPayment(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        Optional<SellerCommission> opt = commissionRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        SellerCommission sc = opt.get();
        sc.setStatus("VERIFIED");
        sc.setVerifiedAt(LocalDateTime.now());
        if (body != null && body.get("notes") != null) {
            sc.setAdminNotes(body.get("notes"));
        } else {
            sc.setAdminNotes("Verified in Admin Bank Account");
        }
        commissionRepository.save(sc);

        return ResponseEntity.ok(Map.of("message", "Commission payment verified and approved successfully", "invoice", sc));
    }

    /**
     * 7. Admin Rejects Commission Payment (Returns to PENDING)
     */
    @PostMapping("/admin/{id}/reject")
    public ResponseEntity<?> rejectCommissionPayment(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        Optional<SellerCommission> opt = commissionRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        SellerCommission sc = opt.get();
        sc.setStatus("PENDING");
        sc.setAdminNotes(body != null && body.get("reason") != null ? body.get("reason") : "UTR not matching bank records. Please re-verify.");
        commissionRepository.save(sc);

        return ResponseEntity.ok(Map.of("message", "Commission payment rejected and marked back to PENDING", "invoice", sc));
    }

    /**
     * Automatic sync helper: Scans all orders in database and ensures every order has a SellerCommission record.
     */
    private void syncMissingOrderCommissions() {
        try {
            List<Order> orders = orderRepository.findAll();
            for (Order o : orders) {
                if (o.getOrderTrackingNumber() == null) continue;
                Optional<SellerCommission> existing = commissionRepository.findByOrderTrackingNumber(o.getOrderTrackingNumber());
                if (existing.isEmpty()) {
                    SellerCommission sc = new SellerCommission();
                    sc.setOrderTrackingNumber(o.getOrderTrackingNumber());
                    sc.setOrderDbId(o.getId());

                    // Parse seller name from product details if available
                    String sellerName = "Verified Seller";
                    Long sellerId = 1L;
                    if (o.getProductDetails() != null && !o.getProductDetails().isBlank()) {
                        try {
                            List<?> items = objectMapper.readValue(o.getProductDetails(), List.class);
                            if (!items.isEmpty() && items.get(0) instanceof Map<?, ?> m) {
                                if (m.get("sellerName") != null) sellerName = m.get("sellerName").toString();
                                if (m.get("sellerId") != null) {
                                    try { sellerId = Long.valueOf(m.get("sellerId").toString()); } catch (Exception ignored) {}
                                }
                            }
                        } catch (Exception ignored) {}
                    }

                    sc.setSellerName(sellerName);
                    sc.setSellerId(sellerId);
                    sc.setGrossAmount(o.getTotalAmount() != null ? o.getTotalAmount() : 0L);
                    sc.setCommissionRate(10.0);
                    sc.setCommissionAmount((long) (sc.getGrossAmount() * 0.10));
                    sc.setStatus("PENDING");
                    sc.setCreatedAt(o.getCreatedAt() != null ? o.getCreatedAt() : LocalDateTime.now());
                    commissionRepository.save(sc);
                }
            }
        } catch (Exception e) {
            System.err.println("Note: syncMissingOrderCommissions: " + e.getMessage());
        }
    }
}
