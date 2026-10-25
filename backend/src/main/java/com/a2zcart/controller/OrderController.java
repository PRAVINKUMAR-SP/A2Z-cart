package com.a2zcart.controller;

import com.a2zcart.model.Order;
import com.a2zcart.model.OrderStatus;
import com.a2zcart.model.User;
import com.a2zcart.repository.OrderRepository;
import com.a2zcart.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"})
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.a2zcart.repository.CartItemRepository cartItemRepository;

    @Autowired
    private com.a2zcart.repository.SellerCommissionRepository commissionRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @jakarta.annotation.PostConstruct
    public void init() {
        try {
            jdbcTemplate.execute("ALTER TABLE orders ALTER COLUMN buyer_id DROP NOT NULL");
        } catch (Exception e) {
            System.out.println("Note: orders.buyer_id not-null drop: " + e.getMessage());
        }
    }

    /**
     * Create & confirm an order and persist directly into PostgreSQL DB
     * Captures: order id, user id, product details, order status, payment method (ONLINE / CASH_ON_DELIVERY)
     */
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> req) {
        try {
            Order order = new Order();

            // 1. Order ID / Tracking Number
            String orderId = (String) req.get("orderId");
            if (orderId == null || orderId.isBlank()) {
                orderId = (String) req.get("orderTrackingNumber");
            }
            if (orderId == null || orderId.isBlank()) {
                orderId = "ORD-" + ((int) (10000 + Math.random() * 90000));
            }
            order.setOrderTrackingNumber(orderId);

            // 2. User ID & Buyer Details
            Long userId = null;
            if (req.get("userId") != null) {
                try {
                    userId = Long.valueOf(req.get("userId").toString());
                } catch (Exception ignored) {}
            }
            order.setUserId(userId);

            String buyerEmail = (String) req.get("buyerEmail");
            if (buyerEmail == null && req.get("email") != null) {
                buyerEmail = req.get("email").toString();
            }
            order.setBuyerEmail(buyerEmail);

            String buyerName = (String) req.get("buyerName");
            if (buyerName == null && req.get("name") != null) {
                buyerName = req.get("name").toString();
            }
            order.setBuyerName(buyerName);

            String buyerPhone = (String) req.get("buyerPhone");
            if (buyerPhone == null && req.get("phone") != null) {
                buyerPhone = req.get("phone").toString();
            }
            order.setBuyerPhone(buyerPhone);

            // Resolve or link to User entity in DB
            User buyer = null;
            if (userId != null) {
                buyer = userRepository.findById(userId).orElse(null);
            }
            if (buyer == null && buyerEmail != null && !buyerEmail.isBlank()) {
                buyer = userRepository.findByEmail(buyerEmail.trim().toLowerCase()).orElse(null);
            }
            if (buyer == null) {
                String emailToUse = (buyerEmail != null && !buyerEmail.isBlank()) ? buyerEmail.trim().toLowerCase() : "buyer@example.com";
                Optional<User> existingUser = userRepository.findByEmail(emailToUse);
                if (existingUser.isPresent()) {
                    buyer = existingUser.get();
                } else {
                    try {
                        User newUser = new User(
                            buyerName != null && !buyerName.isBlank() ? buyerName : "Buyer",
                            emailToUse,
                            "$2a$10$demoHashedPasswordDummyPlaceholder",
                            buyerPhone != null && !buyerPhone.isBlank() ? buyerPhone.replaceAll("\\D", "") : "9876543210",
                            com.a2zcart.model.Role.ROLE_BUYER
                        );
                        buyer = userRepository.save(newUser);
                    } catch (Exception ignored) {}
                }
            }

            if (buyer != null) {
                order.setBuyer(buyer);
                if (order.getUserId() == null) {
                    order.setUserId(buyer.getId());
                }
            }

            // 3. Product Details (Full JSON snapshot of products ordered) & Product Count
            Object itemsObj = req.get("productDetails");
            if (itemsObj == null) {
                itemsObj = req.get("items");
            }
            int totalProductCount = 0;
            if (req.get("productCount") != null) {
                try {
                    totalProductCount = Integer.parseInt(req.get("productCount").toString());
                } catch (Exception ignored) {}
            }

            if (itemsObj instanceof List<?> list) {
                if (totalProductCount == 0) {
                    for (Object it : list) {
                        if (it instanceof Map<?, ?> m) {
                            Object q = m.get("quantity");
                            if (q != null) {
                                try { totalProductCount += Integer.parseInt(q.toString()); } catch (Exception ignored) {}
                            } else {
                                totalProductCount += 1;
                            }
                        } else {
                            totalProductCount += 1;
                        }
                    }
                }
                order.setProductDetails(objectMapper.writeValueAsString(itemsObj));
            } else if (itemsObj instanceof String) {
                order.setProductDetails((String) itemsObj);
            } else if (itemsObj != null) {
                order.setProductDetails(objectMapper.writeValueAsString(itemsObj));
            } else {
                order.setProductDetails("[]");
            }
            order.setProductCount(Math.max(1, totalProductCount));

            // 4. Order Status (CONFIRMED / PLACED)
            String statusStr = (String) req.get("status");
            OrderStatus orderStatus = OrderStatus.CONFIRMED;
            if (statusStr != null) {
                try {
                    orderStatus = OrderStatus.valueOf(statusStr.toUpperCase().trim());
                } catch (Exception e) {
                    orderStatus = OrderStatus.CONFIRMED;
                }
            }
            order.setStatus(orderStatus);

            // 5. Payment Method & Status (Online Gateway vs Cash on Delivery)
            String paymentMethod = (String) req.get("paymentMethod");
            if (paymentMethod == null || paymentMethod.isBlank()) {
                paymentMethod = "ONLINE";
            } else {
                String pmUpper = paymentMethod.toUpperCase().trim();
                if (pmUpper.contains("COD") || pmUpper.contains("CASH")) {
                    paymentMethod = "CASH_ON_DELIVERY";
                } else if (pmUpper.contains("RAZORPAY") || pmUpper.contains("ONLINE")) {
                    paymentMethod = "ONLINE";
                }
            }
            order.setPaymentMethod(paymentMethod);

            String paymentStatus = (String) req.get("paymentStatus");
            if (paymentStatus == null || paymentStatus.isBlank()) {
                paymentStatus = "CASH_ON_DELIVERY".equals(paymentMethod) ? "PENDING" : "SUCCESS";
            }
            order.setPaymentStatus(paymentStatus);

            order.setPaymentId((String) req.get("paymentId"));
            order.setRazorpayOrderId((String) req.get("razorpayOrderId"));

            // 6. Total Amount
            Long totalAmount = 0L;
            if (req.get("totalAmount") != null) {
                totalAmount = Long.valueOf(req.get("totalAmount").toString());
            }
            order.setTotalAmount(totalAmount);

            // 7. Shipping Address
            Object addrObj = req.get("shippingAddress");
            if (addrObj instanceof String) {
                order.setShippingAddress((String) addrObj);
            } else if (addrObj != null) {
                order.setShippingAddress(objectMapper.writeValueAsString(addrObj));
            }

            order.setCreatedAt(LocalDateTime.now());

            Order savedOrder = orderRepository.save(order);

            // Auto-create SellerCommission record for Model 2 (Seller direct payment + Admin commission invoice)
            try {
                com.a2zcart.model.SellerCommission sc = new com.a2zcart.model.SellerCommission();
                sc.setOrderTrackingNumber(savedOrder.getOrderTrackingNumber());
                sc.setOrderDbId(savedOrder.getId());

                String sellerName = "Verified Seller";
                Long sellerId = 1L;
                if (savedOrder.getProductDetails() != null && !savedOrder.getProductDetails().isBlank()) {
                    try {
                        List<?> items = objectMapper.readValue(savedOrder.getProductDetails(), List.class);
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
                long gross = savedOrder.getTotalAmount() != null ? savedOrder.getTotalAmount() : 0L;
                sc.setGrossAmount(gross);
                sc.setCommissionRate(10.0);
                sc.setCommissionAmount((long) (gross * 0.10));
                sc.setStatus("PENDING");
                sc.setCreatedAt(LocalDateTime.now());
                commissionRepository.save(sc);
            } catch (Exception commErr) {
                System.err.println("Note: Error creating commission record: " + commErr.getMessage());
            }

            // Clear the user's cart in the database since the order is confirmed
            try {
                if (order.getUserId() != null) {
                    cartItemRepository.deleteByUserId(order.getUserId());
                }
                if (order.getBuyerEmail() != null && !order.getBuyerEmail().isBlank()) {
                    cartItemRepository.deleteByUserEmailIgnoreCase(order.getBuyerEmail().trim());
                }
            } catch (Exception ignored) {}

            return ResponseEntity.ok(savedOrder);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Failed to store order in database: " + e.getMessage()));
        }
    }

    /**
     * Retrieve orders for a user or list all orders
     */
    @GetMapping
    public ResponseEntity<?> getOrders(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String email
    ) {
        if (userId != null && email != null && !email.trim().isEmpty()) {
            return ResponseEntity.ok(orderRepository.findByUserIdOrBuyerEmailIgnoreCaseOrderByCreatedAtDesc(userId, email.trim()));
        } else if (userId != null) {
            return ResponseEntity.ok(orderRepository.findByUserIdOrderByCreatedAtDesc(userId));
        } else if (email != null && !email.trim().isEmpty()) {
            return ResponseEntity.ok(orderRepository.findByBuyerEmailIgnoreCaseOrderByCreatedAtDesc(email.trim()));
        }
        return ResponseEntity.ok(orderRepository.findAllByOrderByCreatedAtDesc());
    }

    /**
     * Retrieve a specific order by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Retrieve an order by Tracking Number (e.g. ORD-98214)
     */
    @GetMapping("/tracking/{trackingNumber}")
    public ResponseEntity<?> getOrderByTrackingNumber(@PathVariable String trackingNumber) {
        return orderRepository.findByOrderTrackingNumber(trackingNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update order status (e.g. CANCELLED, SHIPPED, DELIVERED)
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        Optional<Order> opt = orderRepository.findById(id);
        if (opt.isPresent()) {
            Order order = opt.get();
            String newStatus = body.get("status");
            if (newStatus != null) {
                try {
                    order.setStatus(OrderStatus.valueOf(newStatus.toUpperCase().trim()));
                    orderRepository.save(order);
                    return ResponseEntity.ok(order);
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Invalid order status"));
                }
            }
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Delete an order
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        if (orderRepository.existsById(id)) {
            orderRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Order deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }
}
