package com.a2zcart.controller;

import com.a2zcart.model.*;
import com.a2zcart.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"})
public class AdminController {

    @Autowired
    private SellerCompanyRepository sellerCompanyRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserAddressRepository userAddressRepository;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    // 1. Sellers Management
    @GetMapping("/sellers")
    public ResponseEntity<List<SellerCompany>> getAllSellers() {
        return ResponseEntity.ok(sellerCompanyRepository.findAll());
    }

    @PostMapping("/sellers/{id}/approve")
    public ResponseEntity<?> approveSeller(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        Optional<SellerCompany> opt = sellerCompanyRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        SellerCompany seller = opt.get();
        seller.setStatus(SellerStatus.APPROVED);
        seller.setApprovedAt(LocalDateTime.now());
        seller.setAdminNotes(body != null ? body.getOrDefault("notes", "Approved by Compliance") : "Approved by Compliance");
        sellerCompanyRepository.save(seller);

        return ResponseEntity.ok(Map.of("message", "Seller approved successfully. Publishing access granted.", "status", "APPROVED"));
    }

    @PostMapping("/sellers/{id}/reject")
    public ResponseEntity<?> rejectSeller(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<SellerCompany> opt = sellerCompanyRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        SellerCompany seller = opt.get();
        seller.setStatus(SellerStatus.REJECTED);
        seller.setAdminNotes(body.getOrDefault("reason", "Documents did not pass verification"));
        sellerCompanyRepository.save(seller);

        return ResponseEntity.ok(Map.of("message", "Seller application rejected.", "status", "REJECTED"));
    }

    @DeleteMapping("/sellers/{id}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> deleteSeller(@PathVariable String id) {
        Long numericId = null;
        try {
            numericId = Long.parseLong(id.replace("APP-", "").trim());
        } catch (NumberFormatException ignored) {}

        if (numericId != null) {
            try {
                jdbcTemplate.update("UPDATE products SET seller_id = NULL WHERE seller_id = ?", numericId);
                jdbcTemplate.update("UPDATE seller_suborders SET seller_id = NULL WHERE seller_id = ?", numericId);
                jdbcTemplate.update("DELETE FROM seller_companies WHERE id = ?", numericId);
            } catch (Exception e) {
                System.err.println("Error deleting seller: " + e.getMessage());
            }
        }

        return ResponseEntity.ok(Map.of(
            "message", "Seller deleted successfully",
            "id", id
        ));
    }

    // Change any user's role: BUYER, SELLER, ADMIN
    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        String roleStr = body.get("role");
        if (roleStr == null || roleStr.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Role is required"));
        }

        try {
            String normalizedRole = roleStr.toUpperCase().trim();
            if (!normalizedRole.startsWith("ROLE_")) {
                normalizedRole = "ROLE_" + normalizedRole;
            }
            Role role = Role.valueOf(normalizedRole);
            User user = opt.get();
            user.setRole(role);
            userRepository.save(user);

            Map<String, Object> res = new HashMap<>();
            res.put("id", user.getId());
            res.put("name", user.getName());
            res.put("email", user.getEmail());
            res.put("role", user.getRole().name());
            res.put("message", "User role successfully updated to " + user.getRole().name());

            return ResponseEntity.ok(res);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid role. Must be BUYER, SELLER, or ADMIN"));
        }
    }

    // Delete a user and clean up dependent data
    @DeleteMapping("/users/{id}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = opt.get();
        String email = user.getEmail() != null ? user.getEmail().trim() : "";

        try {
            // 1. Delete cart items
            jdbcTemplate.update("DELETE FROM cart_items WHERE user_id = ? OR LOWER(user_email) = LOWER(?)", id, email);
        } catch (Exception e) {
            System.err.println("Cart cleanup: " + e.getMessage());
        }

        try {
            // 2. Delete user addresses
            jdbcTemplate.update("DELETE FROM user_addresses WHERE user_id = ? OR LOWER(email) = LOWER(?)", id, email);
        } catch (Exception e) {
            System.err.println("Address cleanup: " + e.getMessage());
        }

        try {
            // 3. Nullify buyer in orders so historical orders remain intact without FK violations
            jdbcTemplate.update("UPDATE orders SET buyer_id = NULL WHERE buyer_id = ? OR user_id = ?", id, id);
        } catch (Exception e) {
            System.err.println("Orders cleanup: " + e.getMessage());
        }

        try {
            // 4. Handle SellerCompany dependencies
            List<Long> scIds = jdbcTemplate.query(
                "SELECT id FROM seller_companies WHERE user_id = ?",
                (rs, rowNum) -> rs.getLong("id"),
                id
            );

            for (Long scId : scIds) {
                // Unlink products referencing this seller company (FK: fkm5ypp73bn7mjb46i1ubcx1rs6)
                jdbcTemplate.update("UPDATE products SET seller_id = NULL WHERE seller_id = ?", scId);

                // Unlink seller_suborders referencing this seller company
                jdbcTemplate.update("UPDATE seller_suborders SET seller_id = NULL WHERE seller_id = ?", scId);

                // Delete seller company record
                jdbcTemplate.update("DELETE FROM seller_companies WHERE id = ?", scId);
            }
        } catch (Exception e) {
            System.err.println("Seller cleanup: " + e.getMessage());
        }

        // 5. Delete user from users table
        try {
            jdbcTemplate.update("DELETE FROM users WHERE id = ?", id);
        } catch (Exception e) {
            userRepository.delete(user);
        }

        return ResponseEntity.ok(Map.of(
            "message", "User account and associated records deleted successfully.",
            "id", id
        ));
    }

    // Get all users (all roles: BUYER, SELLER, ADMIN)
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<User> allUsers = userRepository.findAll();
        List<Map<String, Object>> list = new ArrayList<>();
        for (User u : allUsers) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("name", u.getName());
            m.put("email", u.getEmail());
            m.put("phone", u.getPhone());
            m.put("role", u.getRole().name());
            m.put("createdAt", u.getCreatedAt());
            list.add(m);
        }
        return ResponseEntity.ok(list);
    }

    // 2. Buyers Directory
    @GetMapping("/buyers")
    public ResponseEntity<?> getAllBuyers() {
        List<User> allUsers = userRepository.findAll();
        List<Map<String, Object>> buyers = new ArrayList<>();
        for (User u : allUsers) {
            if (u.getRole() == Role.ROLE_BUYER) {
                Map<String, Object> m = new HashMap<>();
                m.put("id", u.getId());
                m.put("name", u.getName());
                m.put("email", u.getEmail());
                m.put("phone", u.getPhone());
                m.put("role", u.getRole().name());
                m.put("createdAt", u.getCreatedAt());
                buyers.add(m);
            }
        }
        return ResponseEntity.ok(buyers);
    }

    // 3. Admin Accounts
    @GetMapping("/admins")
    public ResponseEntity<?> getAllAdmins() {
        List<User> allUsers = userRepository.findAll();
        List<Map<String, Object>> admins = new ArrayList<>();
        for (User u : allUsers) {
            if (u.getRole() == Role.ROLE_ADMIN) {
                Map<String, Object> m = new HashMap<>();
                m.put("id", u.getId());
                m.put("name", u.getName());
                m.put("email", u.getEmail());
                m.put("phone", u.getPhone());
                m.put("role", u.getRole().name());
                m.put("createdAt", u.getCreatedAt());
                admins.add(m);
            }
        }
        return ResponseEntity.ok(admins);
    }

    // 4. Products Catalog Moderation
    @GetMapping("/products")
    public ResponseEntity<?> getAllProducts() {
        return ResponseEntity.ok(productRepository.findAll());
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Product listing removed by admin."));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/products")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> deleteAllProducts() {
        productRepository.deleteAll();
        return ResponseEntity.ok(Map.of("message", "All product listings removed by admin."));
    }

    // 5. Cart Products across all users
    @GetMapping("/cart-products")
    public ResponseEntity<?> getAllCartProducts() {
        return ResponseEntity.ok(cartItemRepository.findAll());
    }

    // 6. Orders Master Ledger
    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAllByOrderByCreatedAtDesc());
    }

    // 7. Order Products (itemized items from all confirmed orders)
    @GetMapping("/order-products")
    public ResponseEntity<?> getAllOrderProducts() {
        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc();
        List<Map<String, Object>> orderProducts = new ArrayList<>();

        for (Order o : orders) {
            if (o.getProductDetails() != null && !o.getProductDetails().isBlank()) {
                try {
                    List<?> items = objectMapper.readValue(o.getProductDetails(), List.class);
                    for (Object itm : items) {
                        if (itm instanceof Map<?, ?> m) {
                            Map<String, Object> row = new HashMap<>();
                            row.put("orderId", o.getOrderTrackingNumber());
                            row.put("orderDbId", o.getId());
                            row.put("buyerName", o.getBuyerName());
                            row.put("buyerEmail", o.getBuyerEmail());
                            row.put("orderStatus", o.getStatus() != null ? o.getStatus().name() : "CONFIRMED");
                            row.put("paymentMethod", o.getPaymentMethod());
                            row.put("orderDate", o.getCreatedAt());

                            row.put("productId", m.get("productId") != null ? m.get("productId") : m.get("id"));
                            row.put("name", m.get("name") != null ? m.get("name") : m.get("productName"));
                            row.put("price", m.get("price"));
                            row.put("quantity", m.get("quantity"));
                            row.put("productCount", m.get("productCount") != null ? m.get("productCount") : m.get("quantity"));
                            row.put("image", m.get("image"));
                            row.put("sellerName", m.get("sellerName"));
                            row.put("sellerId", m.get("sellerId"));

                            orderProducts.add(row);
                        }
                    }
                } catch (Exception ignored) {}
            }
        }
        return ResponseEntity.ok(orderProducts);
    }

    // 8. Platform Analytics
    @GetMapping("/analytics")
    public ResponseEntity<?> getPlatformAnalytics() {
        long orderCount = orderRepository.count();
        long productCount = productRepository.count();
        long sellerCount = sellerCompanyRepository.count();
        long buyerCount = userRepository.count();
        long cartItemsCount = cartItemRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", orderCount);
        stats.put("totalProducts", productCount);
        stats.put("totalSellers", sellerCount);
        stats.put("totalBuyers", buyerCount);
        stats.put("totalCartItems", cartItemsCount);
        stats.put("commissionRate", "10%");

        return ResponseEntity.ok(stats);
    }
}
