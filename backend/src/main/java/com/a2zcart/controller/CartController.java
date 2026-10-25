package com.a2zcart.controller;

import com.a2zcart.model.CartItem;
import com.a2zcart.repository.CartItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"})
public class CartController {

    @Autowired
    private CartItemRepository cartItemRepository;

    /**
     * Get all cart products for user
     * Returns: productId, quantity, productCount, price, name, image, seller info
     */
    @GetMapping
    public ResponseEntity<?> getCart(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String email
    ) {
        if (email != null && !email.trim().isEmpty()) {
            return ResponseEntity.ok(cartItemRepository.findByUserEmailIgnoreCaseOrderByUpdatedAtDesc(email.trim().toLowerCase()));
        } else if (userId != null) {
            return ResponseEntity.ok(cartItemRepository.findByUserIdOrderByUpdatedAtDesc(userId));
        }
        return ResponseEntity.ok(List.of());
    }

    /**
     * Add or update a product in the user's cart in the database
     * Stores: productId, quantity, productCount, product details
     */
    @PostMapping
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Object> req) {
        try {
            String productId = req.get("productId") != null ? req.get("productId").toString() : (String) req.get("id");
            if (productId == null || productId.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Product ID is required"));
            }

            Long userId = null;
            if (req.get("userId") != null) {
                try {
                    userId = Long.valueOf(req.get("userId").toString());
                } catch (Exception ignored) {}
            }

            String userEmail = req.get("userEmail") != null ? req.get("userEmail").toString() : (String) req.get("email");

            int qtyToAdd = 1;
            if (req.get("quantity") != null) {
                try {
                    qtyToAdd = Integer.parseInt(req.get("quantity").toString());
                } catch (Exception ignored) {}
            }

            if (userEmail != null && !userEmail.isBlank()) {
                userEmail = userEmail.trim().toLowerCase();
            }

            // Check if product already in user's cart
            Optional<CartItem> existing = Optional.empty();
            if (userEmail != null && !userEmail.isBlank()) {
                existing = cartItemRepository.findByUserEmailIgnoreCaseAndProductId(userEmail, productId);
            } else if (userId != null) {
                existing = cartItemRepository.findByUserIdAndProductId(userId, productId);
            }

            CartItem cartItem;
            if (existing.isPresent()) {
                cartItem = existing.get();
                // If quantity was explicitly provided as total, or add to existing
                int newQty = cartItem.getQuantity() + qtyToAdd;
                if (req.get("setExactQuantity") != null && Boolean.parseBoolean(req.get("setExactQuantity").toString())) {
                    newQty = qtyToAdd;
                }
                cartItem.setQuantity(newQty);
                cartItem.setProductCount(newQty);
                cartItem.setUpdatedAt(LocalDateTime.now());
            } else {
                cartItem = new CartItem();
                cartItem.setProductId(productId);
                cartItem.setUserId(userId);
                cartItem.setUserEmail(userEmail);
                cartItem.setQuantity(qtyToAdd);
                cartItem.setProductCount(qtyToAdd);

                cartItem.setProductName(req.get("productName") != null ? req.get("productName").toString() : (String) req.get("name"));
                if (cartItem.getProductName() == null) cartItem.setProductName("Product " + productId);

                long price = 0L;
                if (req.get("price") != null) {
                    try { price = Long.parseLong(req.get("price").toString()); } catch (Exception ignored) {}
                }
                cartItem.setPrice(price);

                if (req.get("originalPrice") != null) {
                    try { cartItem.setOriginalPrice(Long.parseLong(req.get("originalPrice").toString())); } catch (Exception ignored) {}
                }
                cartItem.setImage((String) req.get("image"));
                cartItem.setSellerId((String) req.get("sellerId"));
                cartItem.setSellerName((String) req.get("sellerName"));

                if (req.get("stock") != null) {
                    try { cartItem.setStock(Integer.parseInt(req.get("stock").toString())); } catch (Exception ignored) {}
                }
                cartItem.setUpdatedAt(LocalDateTime.now());
            }

            CartItem saved = cartItemRepository.save(cartItem);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Failed to store cart product in database: " + e.getMessage()));
        }
    }

    /**
     * Update quantity and productCount of a cart item
     */
    @PutMapping
    public ResponseEntity<?> updateCartItemQuantity(@RequestBody Map<String, Object> req) {
        String productId = req.get("productId") != null ? req.get("productId").toString() : (String) req.get("id");
        if (productId == null || productId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Product ID is required"));
        }

        Long userId = null;
        if (req.get("userId") != null) {
            try { userId = Long.valueOf(req.get("userId").toString()); } catch (Exception ignored) {}
        }
        String userEmail = req.get("userEmail") != null ? req.get("userEmail").toString() : (String) req.get("email");

        int quantity = 1;
        if (req.get("quantity") != null) {
            try { quantity = Integer.parseInt(req.get("quantity").toString()); } catch (Exception ignored) {}
        }

        if (userEmail != null && !userEmail.isBlank()) {
            userEmail = userEmail.trim().toLowerCase();
        }

        Optional<CartItem> opt = Optional.empty();
        if (userEmail != null && !userEmail.isBlank()) {
            opt = cartItemRepository.findByUserEmailIgnoreCaseAndProductId(userEmail, productId);
        } else if (userId != null) {
            opt = cartItemRepository.findByUserIdAndProductId(userId, productId);
        }

        if (opt.isPresent()) {
            CartItem item = opt.get();
            if (quantity <= 0) {
                cartItemRepository.delete(item);
                return ResponseEntity.ok(Map.of("message", "Item removed from cart"));
            } else {
                item.setQuantity(quantity);
                item.setProductCount(quantity);
                item.setUpdatedAt(LocalDateTime.now());
                cartItemRepository.save(item);
                return ResponseEntity.ok(item);
            }
        }

        return ResponseEntity.notFound().build();
    }

    /**
     * Remove a product from cart
     */
    @DeleteMapping("/{productId}")
    public ResponseEntity<?> removeCartItem(
            @PathVariable String productId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String email
    ) {
        if (email != null && !email.trim().isEmpty()) {
            cartItemRepository.deleteByProductIdAndUserEmailIgnoreCase(productId, email.trim().toLowerCase());
        } else if (userId != null) {
            cartItemRepository.deleteByProductIdAndUserId(productId, userId);
        }
        return ResponseEntity.ok(Map.of("message", "Cart item removed"));
    }

    /**
     * Clear all cart items for user
     */
    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String email
    ) {
        if (email != null && !email.trim().isEmpty()) {
            cartItemRepository.deleteByUserEmailIgnoreCase(email.trim().toLowerCase());
        } else if (userId != null) {
            cartItemRepository.deleteByUserId(userId);
        }
        return ResponseEntity.ok(Map.of("message", "Cart cleared"));
    }

    /**
     * Batch Sync entire cart list into DB
     */
    @PostMapping("/sync")
    public ResponseEntity<?> syncCart(@RequestBody Map<String, Object> req) {
        try {
            Long userId = null;
            if (req.get("userId") != null) {
                try { userId = Long.valueOf(req.get("userId").toString()); } catch (Exception ignored) {}
            }
            String userEmail = req.get("userEmail") != null ? req.get("userEmail").toString() : (String) req.get("email");

            Object itemsObj = req.get("items");
            if (itemsObj instanceof List<?> list) {
                // Clear existing
                if (userId != null) cartItemRepository.deleteByUserId(userId);
                if (userEmail != null && !userEmail.isBlank()) cartItemRepository.deleteByUserEmailIgnoreCase(userEmail.trim());

                List<CartItem> savedList = new ArrayList<>();
                for (Object o : list) {
                    if (o instanceof Map<?, ?> m) {
                        String prodId = m.get("productId") != null ? m.get("productId").toString() : (m.get("id") != null ? m.get("id").toString() : null);
                        if (prodId == null) continue;

                        int qty = 1;
                        if (m.get("quantity") != null) {
                            try { qty = Integer.parseInt(m.get("quantity").toString()); } catch (Exception ignored) {}
                        }

                        CartItem item = new CartItem();
                        item.setProductId(prodId);
                        item.setUserId(userId);
                        item.setUserEmail(userEmail);
                        item.setQuantity(qty);
                        item.setProductCount(qty);
                        item.setProductName(m.get("name") != null ? m.get("name").toString() : (m.get("productName") != null ? m.get("productName").toString() : "Product"));

                        long price = 0L;
                        if (m.get("price") != null) {
                            try { price = Long.parseLong(m.get("price").toString()); } catch (Exception ignored) {}
                        }
                        item.setPrice(price);

                        if (m.get("originalPrice") != null) {
                            try { item.setOriginalPrice(Long.parseLong(m.get("originalPrice").toString())); } catch (Exception ignored) {}
                        }
                        item.setImage((String) m.get("image"));
                        item.setSellerId((String) m.get("sellerId"));
                        item.setSellerName((String) m.get("sellerName"));
                        item.setUpdatedAt(LocalDateTime.now());

                        savedList.add(cartItemRepository.save(item));
                    }
                }
                return ResponseEntity.ok(savedList);
            }
            return ResponseEntity.ok(List.of());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to sync cart: " + e.getMessage()));
        }
    }
}
