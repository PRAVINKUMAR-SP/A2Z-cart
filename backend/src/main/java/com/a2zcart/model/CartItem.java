package com.a2zcart.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cart_items")
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String userEmail;

    @Column(nullable = false)
    private String productId;

    @Column(nullable = false)
    private Integer quantity = 1;

    // The total count or quantity count of this product in cart
    @Column(nullable = false)
    private Integer productCount = 1;

    @Column(nullable = false)
    private String productName;

    @Column(nullable = false)
    private Long price; // Price in integer paise

    private Long originalPrice;

    private String image;

    private String sellerId;

    private String sellerName;

    private Integer stock = 99;

    private LocalDateTime updatedAt = LocalDateTime.now();

    public CartItem() {}

    public CartItem(Long userId, String userEmail, String productId, Integer quantity, Integer productCount,
                    String productName, Long price, Long originalPrice, String image, String sellerId,
                    String sellerName, Integer stock) {
        this.userId = userId;
        this.userEmail = userEmail;
        this.productId = productId;
        this.quantity = quantity;
        this.productCount = productCount != null ? productCount : quantity;
        this.productName = productName;
        this.price = price;
        this.originalPrice = originalPrice;
        this.image = image;
        this.sellerId = sellerId;
        this.sellerName = sellerName;
        this.stock = stock != null ? stock : 99;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Integer getProductCount() { return productCount; }
    public void setProductCount(Integer productCount) { this.productCount = productCount; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public Long getPrice() { return price; }
    public void setPrice(Long price) { this.price = price; }

    public Long getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(Long originalPrice) { this.originalPrice = originalPrice; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getSellerId() { return sellerId; }
    public void setSellerId(String sellerId) { this.sellerId = sellerId; }

    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
