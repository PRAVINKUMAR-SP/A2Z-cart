# A2Z~cart — PostgreSQL Relational Database Schema

## Monetary Precision Rule
All financial amounts are stored as **integer paise** (e.g., ₹1,499.00 = `149900`) to strictly avoid IEEE-754 floating-point inaccuracies.

---

## 1. DDL Schema Definition

```sql
-- Users and Authentication
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL, -- 'ROLE_BUYER', 'ROLE_SELLER', 'ROLE_ADMIN'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Multi-Vendor Registered Companies
CREATE TABLE seller_companies (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100),
    gstin VARCHAR(15) NOT NULL UNIQUE,
    pan_number VARCHAR(10) NOT NULL,
    registered_address TEXT,
    store_category VARCHAR(100),
    bank_account VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    admin_notes TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP
);

-- Product Catalog
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tagline VARCHAR(255),
    description TEXT,
    category VARCHAR(100) NOT NULL,
    price BIGINT NOT NULL, -- stored in integer paise
    original_price BIGINT,
    discount_percent INT,
    stock INT NOT NULL DEFAULT 0,
    rating DOUBLE PRECISION DEFAULT 4.8,
    reviews_count INT DEFAULT 0,
    has_3d_model BOOLEAN DEFAULT FALSE,
    model_shape VARCHAR(50), -- 'headphones', 'watch', 'laptop', 'drone'
    image TEXT,
    seller_id BIGINT REFERENCES seller_companies(id) ON DELETE SET NULL,
    seller_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Master Parent Orders (Checkout Level)
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_tracking_number VARCHAR(100) NOT NULL UNIQUE,
    buyer_id BIGINT NOT NULL REFERENCES users(id),
    buyer_name VARCHAR(255),
    buyer_phone VARCHAR(50),
    total_amount BIGINT NOT NULL, -- in integer paise
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
    payment_method VARCHAR(50),
    payment_id VARCHAR(100),
    razorpay_order_id VARCHAR(100),
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Multi-Vendor Suborders (Split by Seller)
CREATE TABLE seller_suborders (
    id BIGSERIAL PRIMARY KEY,
    suborder_number VARCHAR(100) NOT NULL UNIQUE,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    seller_id BIGINT REFERENCES seller_companies(id),
    seller_name VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
    courier VARCHAR(100) DEFAULT 'Delhivery Express',
    tracking_number VARCHAR(100)
);

-- Historical Order Item Snapshots
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    suborder_id BIGINT NOT NULL REFERENCES seller_suborders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price_snapshot BIGINT NOT NULL, -- in integer paise
    image TEXT
);

-- Payment Ledger
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL DEFAULT 'RAZORPAY',
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    amount BIGINT NOT NULL, -- in integer paise
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) NOT NULL DEFAULT 'SUCCESS',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
