package com.a2zcart.controller;

import com.a2zcart.model.Product;
import com.a2zcart.model.SellerCompany;
import com.a2zcart.model.SellerStatus;
import com.a2zcart.model.User;
import com.a2zcart.repository.ProductRepository;
import com.a2zcart.repository.SellerCompanyRepository;
import com.a2zcart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/seller")
public class SellerController {

    @Autowired
    private SellerCompanyRepository sellerCompanyRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    // Get current seller profile
    @GetMapping("/profile")
    public ResponseEntity<?> getSellerProfile(@RequestParam(required = false) Long userId, @RequestParam(required = false) String email) {
        Optional<SellerCompany> sellerOpt = Optional.empty();
        if (userId != null) {
            sellerOpt = sellerCompanyRepository.findByUserId(userId);
        }
        if (sellerOpt.isEmpty() && email != null && !email.isBlank()) {
            Optional<User> uOpt = userRepository.findByEmail(email.trim().toLowerCase());
            if (uOpt.isPresent()) {
                sellerOpt = sellerCompanyRepository.findByUserId(uOpt.get().getId());
            }
        }
        if (sellerOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("exists", false));
        }

        SellerCompany s = sellerOpt.get();
        Map<String, Object> resp = new HashMap<>();
        resp.put("exists", true);
        resp.put("id", s.getId());
        resp.put("sellerName", s.getCompanyName());
        resp.put("companyName", s.getCompanyName());
        resp.put("sellerAddress", s.getRegisteredAddress());
        resp.put("registeredAddress", s.getRegisteredAddress());
        resp.put("phone", s.getPhone());
        resp.put("email", s.getEmail());
        resp.put("storeDp", s.getStoreDp());
        resp.put("gpayQr", s.getGpayQr());
        resp.put("status", s.getStatus());
        resp.put("gstin", s.getGstin());
        resp.put("panNumber", s.getPanNumber());
        return ResponseEntity.ok(resp);
    }

    // Save or update seller profile
    @PostMapping("/profile")
    public ResponseEntity<?> saveSellerProfile(@RequestBody Map<String, Object> body) {
        String sellerName = (String) body.get("sellerName");
        if (sellerName == null || sellerName.isBlank()) {
            sellerName = (String) body.get("companyName");
        }
        if (sellerName == null || sellerName.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Seller name is required"));
        }

        String sellerAddress = (String) body.get("sellerAddress");
        if (sellerAddress == null || sellerAddress.isBlank()) {
            sellerAddress = (String) body.get("registeredAddress");
        }
        String phone = (String) body.get("phone");
        String email = (String) body.get("email");
        String storeDp = (String) body.get("storeDp");
        String gpayQr = (String) body.get("gpayQr");

        Long userId = null;
        if (body.get("userId") != null) {
            try {
                userId = Long.valueOf(body.get("userId").toString());
            } catch (Exception ignored) {}
        }

        SellerCompany company = null;
        if (userId != null) {
            company = sellerCompanyRepository.findByUserId(userId).orElse(null);
        }
        if (company == null && email != null && !email.isBlank()) {
            Optional<User> uOpt = userRepository.findByEmail(email.trim().toLowerCase());
            if (uOpt.isPresent()) {
                userId = uOpt.get().getId();
                company = sellerCompanyRepository.findByUserId(userId).orElse(null);
            }
        }

        if (company == null) {
            company = new SellerCompany();
            company.setStatus(SellerStatus.APPROVED);
        }

        User sellerUser = null;
        if (userId != null) {
            sellerUser = userRepository.findById(userId).orElse(null);
        }
        if (sellerUser == null && email != null && !email.isBlank()) {
            sellerUser = userRepository.findByEmail(email.trim().toLowerCase()).orElse(null);
        }
        if (sellerUser == null && phone != null && !phone.isBlank()) {
            String phoneClean = phone.replaceAll("\\D", "");
            if (!phoneClean.isBlank()) {
                sellerUser = userRepository.findByPhone(phoneClean).orElse(null);
            }
        }

        if (sellerUser == null) {
            // Create a dedicated seller User with ROLE_SELLER in the database
            sellerUser = new User();
            sellerUser.setName(sellerName.trim());
            sellerUser.setEmail(email != null && !email.isBlank() ? email.trim().toLowerCase() : "seller_" + System.currentTimeMillis() + "@a2zcart.com");
            sellerUser.setPhone(phone != null ? phone.replaceAll("\\D", "") : "");
            sellerUser.setPassword(passwordEncoder.encode("Seller@123"));
            sellerUser.setRole(com.a2zcart.model.Role.ROLE_SELLER);
            sellerUser = userRepository.save(sellerUser);
        } else {
            // Existing user becoming a seller: ensure their role is updated to ROLE_SELLER (never demote or alter super admin)
            if (!sellerUser.getEmail().equalsIgnoreCase("pravin007ptk@gmail.com")) {
                sellerUser.setRole(com.a2zcart.model.Role.ROLE_SELLER);
                sellerUser = userRepository.save(sellerUser);
            }
        }

        company.setUser(sellerUser);

        company.setCompanyName(sellerName.trim());
        company.setRegisteredAddress(sellerAddress != null ? sellerAddress : "");
        company.setPhone(phone != null ? phone : "");
        company.setEmail(email != null ? email : "");
        company.setStoreDp(storeDp != null ? storeDp : "");
        company.setGpayQr(gpayQr != null ? gpayQr : "");
        if (company.getStatus() == null) {
            company.setStatus(SellerStatus.APPROVED);
        }
        if (company.getGstin() == null || company.getGstin().isBlank()) {
            company.setGstin("GSTIN-" + System.currentTimeMillis());
        }
        if (company.getPanNumber() == null || company.getPanNumber().isBlank()) {
            company.setPanNumber("PAN-" + System.currentTimeMillis());
        }
        if (company.getBusinessType() == null || company.getBusinessType().isBlank()) {
            company.setBusinessType("PROPRIETORSHIP");
        }

        SellerCompany saved = sellerCompanyRepository.save(company);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("id", saved.getId());
        resp.put("userId", sellerUser.getId());
        resp.put("role", sellerUser.getRole().name());
        resp.put("sellerName", saved.getCompanyName());
        resp.put("companyName", saved.getCompanyName());
        resp.put("sellerAddress", saved.getRegisteredAddress());
        resp.put("registeredAddress", saved.getRegisteredAddress());
        resp.put("phone", saved.getPhone());
        resp.put("email", saved.getEmail());
        resp.put("storeDp", saved.getStoreDp());
        resp.put("gpayQr", saved.getGpayQr());
        resp.put("status", saved.getStatus());

        return ResponseEntity.ok(resp);
    }

    @PostMapping("/products")
    public ResponseEntity<?> createProduct(@RequestBody Product product, @RequestParam Long sellerId) {
        Optional<SellerCompany> sellerOpt = sellerCompanyRepository.findById(sellerId);
        
        if (sellerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Seller company not found"));
        }

        SellerCompany seller = sellerOpt.get();

        if (seller.getStatus() != SellerStatus.APPROVED) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", "ACCOUNT_NOT_APPROVED",
                    "status", seller.getStatus(),
                    "message", "Your seller application is under review. You cannot publish products until admin approval."
            ));
        }

        product.setSeller(seller);
        product.setSellerName(seller.getCompanyName());
        Product saved = productRepository.save(product);

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getSellerProducts(@RequestParam Long sellerId) {
        return ResponseEntity.ok(productRepository.findBySellerId(sellerId));
    }
}
