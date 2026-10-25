package com.a2zcart.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "seller_suborders")
public class SellerSuborder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String suborderNumber;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id")
    private SellerCompany seller;

    private String sellerName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.CONFIRMED;

    private String courier = "Delhivery Express";
    private String trackingNumber;

    @OneToMany(mappedBy = "suborder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    public SellerSuborder() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSuborderNumber() { return suborderNumber; }
    public void setSuborderNumber(String suborderNumber) { this.suborderNumber = suborderNumber; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public SellerCompany getSeller() { return seller; }
    public void setSeller(SellerCompany seller) { this.seller = seller; }

    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public String getCourier() { return courier; }
    public void setCourier(String courier) { this.courier = courier; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
}
