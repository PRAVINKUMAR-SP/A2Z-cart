package com.a2zcart.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String tagline;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category;

    // Monetary amounts stored in integer paise (e.g. ₹1,499.00 = 149900)
    @Column(nullable = false)
    private Long price;

    private Long originalPrice;
    private Integer discountPercent;

    @Column(nullable = false)
    private Integer stock = 0;

    private Double rating = 4.8;
    private Integer reviewsCount = 10;

    private Boolean has3DModel = false;
    private String modelShape; // 'headphones', 'watch', 'laptop', 'drone'

    private String image;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id")
    private SellerCompany seller;

    private String sellerName;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Product() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTagline() { return tagline; }
    public void setTagline(String tagline) { this.tagline = tagline; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Long getPrice() { return price; }
    public void setPrice(Long price) { this.price = price; }

    public Long getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(Long originalPrice) { this.originalPrice = originalPrice; }

    public Integer getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(Integer discountPercent) { this.discountPercent = discountPercent; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getReviewsCount() { return reviewsCount; }
    public void setReviewsCount(Integer reviewsCount) { this.reviewsCount = reviewsCount; }

    public Boolean getHas3DModel() { return has3DModel; }
    public void setHas3DModel(Boolean has3DModel) { this.has3DModel = has3DModel; }

    public String getModelShape() { return modelShape; }
    public void setModelShape(String modelShape) { this.modelShape = modelShape; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public SellerCompany getSeller() { return seller; }
    public void setSeller(SellerCompany seller) { this.seller = seller; }

    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
