# A2Z~cart — Complete REST API Documentation

Base URL: `http://localhost:8085` (or proxied via Vite at `http://localhost:5173/api`)

---

## 1. Authentication & Identity (`/api/auth`)

### `POST /api/auth/register`
Creates a new buyer or seller account with BCrypt password hashing.
* **Request Body:**
```json
{
  "name": "Rahul Sharma",
  "email": "buyer@example.com",
  "password": "Password@123",
  "phone": "+91 98765 43210",
  "role": "BUYER" // "BUYER" or "SELLER"
}
```
* **Response (200 OK):**
```json
{
  "id": 1,
  "name": "Rahul Sharma",
  "email": "buyer@example.com",
  "role": "ROLE_BUYER",
  "token": "eyJhbGciOiJIUzM4NCJ9..."
}
```

### `POST /api/auth/login`
Authenticates user and returns an HMAC-signed JWT Bearer token.
* **Request Body:**
```json
{
  "email": "admin@a2zcart.com",
  "password": "Admin@123"
}
```
* **Response (200 OK):**
```json
{
  "id": 1,
  "name": "A2Z Platform Operations",
  "email": "admin@a2zcart.com",
  "role": "ROLE_ADMIN",
  "token": "eyJhbGciOiJIUzM4NCJ9..."
}
```

---

## 2. Product Catalog (`/api/products`)

### `GET /api/products`
Retrieves all marketplace products with optional category and search filters.
* **Query Parameters:**
  - `category` (optional): `electronics`, `wearables`, `gaming`, `fashion`, `cameras`, `laptops`
  - `search` (optional): keyword string matching product title or description
* **Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Aetheris Pro Spatial Wireless Headphones",
    "tagline": "Lossless Hi-Res Audio with 45dB Active Hybrid Noise Cancellation",
    "category": "electronics",
    "price": 1499900,
    "originalPrice": 2499900,
    "discountPercent": 40,
    "stock": 24,
    "rating": 4.8,
    "has3DModel": true,
    "modelShape": "headphones",
    "sellerName": "TechHub Retailers Pvt Ltd"
  }
]
```

### `GET /api/products/{id}`
Returns full specification details for a single product.

---

## 3. Payments & Razorpay Gateway (`/api/payments`)

### `POST /api/payments/create-order`
Creates a Razorpay payment order in integer paise.
* **Request Body:**
```json
{
  "amount": 1499900,
  "currency": "INR"
}
```
* **Response (200 OK):**
```json
{
  "razorpayOrderId": "order_rzp_1792819518582",
  "amount": 1499900,
  "currency": "INR",
  "keyId": "rzp_test_placeholder_key"
}
```

### `POST /api/payments/verify`
Server-side cryptographic signature verification (`HMAC-SHA256`).
* **Request Body:**
```json
{
  "razorpayOrderId": "order_rzp_1792819518582",
  "razorpayPaymentId": "pay_test_983192",
  "razorpaySignature": "sig_test_valid_signature"
}
```
* **Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "verified": true,
  "paymentId": "pay_test_983192",
  "message": "Razorpay signature verified. Stock committed."
}
```

---

## 4. Seller Portal (`/api/seller/**`)

Requires Bearer token with `ROLE_SELLER` or `ROLE_ADMIN`.

### `POST /api/seller/products?sellerId={id}`
Creates a new listing. **Enforces compliance check:** returns `403 FORBIDDEN` if seller status is `PENDING` or `REJECTED`.

### `GET /api/seller/products?sellerId={id}`
Returns catalog items owned strictly by this seller.

---

## 5. Admin Governance (`/api/admin/**`)

Requires Bearer token with `ROLE_ADMIN`.

### `GET /api/admin/sellers`
Returns all seller applications with GSTIN, PAN, and attached verification documents.

### `POST /api/admin/sellers/{id}/approve`
Approves pending seller and unlocks selling access.

### `POST /api/admin/sellers/{id}/reject`
Rejects seller with a required justification reason.

### `GET /api/admin/analytics`
Returns platform GMV, order volume, vendor counts, and commission metrics.
