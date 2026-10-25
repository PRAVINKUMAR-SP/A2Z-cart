# A2Z~cart — Complete 3D Multi-Vendor E-Commerce Platform

A production-grade, full-stack multi-vendor marketplace inspired by Amazon and Flipkart, featuring:
* **Interactive 3D Graphics**: Built with Three.js, `@react-three/fiber`, and `@react-three/drei` for 3D hero spatial scenes and 360° interactive product model inspection.
* **Three Dedicated Dashboards**:
  - **Buyer Portal**: 3D spatial catalog, faceted filters, real-time cart, multi-address selection, Razorpay sandbox checkout, and live carrier milestone tracking.
  - **Seller Dashboard**: Merchant KYC verification pipeline, sales KPI analytics (Gross Sales, Net Payouts, Units Sold), product CRUD with image uploads, and suborder dispatch processing.
  - **Admin Control Center**: Platform-wide GMV analytics, seller application review/approval queue, product catalog moderation, and immutable audit logs.
* **Security & Precision**:
  - Role-Based Access Control (RBAC) via Spring Security 6 & JWT.
  - Server-side cryptographic signature verification (`HMAC-SHA256`) for Razorpay payments.
  - Strict financial integrity: All prices stored in **integer paise** (no floating point bugs).
  - Multi-vendor order splitting into separate seller suborders with individual carrier tracking IDs.

---

## 🚀 Instant Quickstart (Windows 11)

### 1. Frontend Web App (React 18 + Vite)
```powershell
cd frontend
npm install
npm run dev
```
> **URL:** [http://localhost:5173/](http://localhost:5173/)

### 2. Backend REST API (Java 21 + Spring Boot 3.3.x)
```powershell
cd backend
..\backend-tools\apache-maven-3.9.9\bin\mvn.cmd spring-boot:run
```
> **API URL:** [http://localhost:8085](http://localhost:8085)  
> **API Proxy:** Configured in Vite (`/api` -> `http://localhost:8085`)

---

## 🔑 Demo Personas & Instant Switcher

The top navigation bar contains an **Instant Persona Switcher** for one-click testing without manual login:

| Persona | Name & Email | Role | Accessible Portals |
|---|---|---|---|
| **Buyer** | Rahul Sharma (`buyer@example.com`) | `ROLE_BUYER` | Shopping Mall, Cart, Checkout, Order Tracking |
| **Approved Seller** | TechHub Retailers (`seller@techhub.com`) | `ROLE_SELLER` | Seller Dashboard, Product CRUD, Order Dispatches |
| **Pending Seller** | Gadget Galaxy (`pending@gadgets.com`) | `ROLE_SELLER` | Application Status Banner (Publishing Locked) |
| **Platform Admin** | Operations (`admin@a2zcart.com`) | `ROLE_ADMIN` | Admin Console, Seller Approvals, Catalog Moderation |

---

## 📁 Repository Structure

```text
A2Z-cart/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # Navbar, Footer
│   │   │   ├── product/        # ProductCard
│   │   │   └── three/          # Hero3DScene, Product3DViewer
│   │   ├── pages/
│   │   │   ├── public/         # LandingPage, ShopPage, ProductDetailPage, Login, Register, SellerOnboarding
│   │   │   ├── buyer/          # CartPage, CheckoutPage, OrdersPage, BuyerDashboard
│   │   │   ├── seller/         # SellerDashboard
│   │   │   └── admin/          # AdminDashboard
│   │   ├── store/              # authStore, cartStore, productStore, orderStore, sellerStore
│   │   └── utils/              # constants, formatters (paise to INR)
│   └── package.json
├── backend/
│   ├── src/main/java/com/a2zcart/
│   │   ├── model/              # User, Role, SellerCompany, Product, Order, SellerSuborder, OrderItem, Payment
│   │   ├── repository/         # UserRepository, ProductRepository, OrderRepository, SellerCompanyRepository
│   │   ├── security/           # JwtTokenProvider, JwtAuthenticationFilter, SecurityConfig
│   │   ├── controller/         # AuthController, ProductController, PaymentController, SellerController, AdminController
│   │   └── config/             # DataInitializer, CorsConfig
│   └── pom.xml
├── docs/
│   ├── api-plan.md
│   ├── database-schema.md
│   └── deployment.md
└── README.md
```
