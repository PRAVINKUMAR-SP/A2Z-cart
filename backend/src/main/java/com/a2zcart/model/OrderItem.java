package com.a2zcart.model;

import jakarta.persistence.*;

@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "suborder_id", nullable = false)
    private SellerSuborder suborder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(nullable = false)
    private String productName;

    @Column(nullable = false)
    private Integer quantity;

    // Price snapshot in paise at time of purchase
    @Column(nullable = false)
    private Long priceSnapshot;

    private String image;

    public OrderItem() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SellerSuborder getSuborder() { return suborder; }
    public void setSuborder(SellerSuborder suborder) { this.suborder = suborder; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Long getPriceSnapshot() { return priceSnapshot; }
    public void setPriceSnapshot(Long priceSnapshot) { this.priceSnapshot = priceSnapshot; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
}
