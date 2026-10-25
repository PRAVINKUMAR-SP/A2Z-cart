# A2Z~cart — Production Deployment Guide

## 1. System Requirements
* **Operating System:** Windows 11 / Linux (Ubuntu 22.04 LTS / Debian 12)
* **Java:** JDK 21 (LTS)
* **Node.js:** v20.x or v22.x
* **Database:** PostgreSQL 16+ or 18

---

## 2. Running Locally

### Step 1: Launch Backend (Spring Boot 3.3.x)
```powershell
cd backend
# Uses included standalone Maven wrapper
..\backend-tools\apache-maven-3.9.9\bin\mvn.cmd spring-boot:run
```
* **Port:** `8085`
* **H2 Console:** `http://localhost:8085/h2-console` (JDBC URL: `jdbc:h2:file:./data/a2zcart_db`, User: `sa`, Password: empty)

To connect directly to local PostgreSQL:
```powershell
$env:SPRING_PROFILES_ACTIVE="postgres"
$env:DB_PASSWORD="your_postgres_password"
..\backend-tools\apache-maven-3.9.9\bin\mvn.cmd spring-boot:run
```

### Step 2: Launch Frontend (React + Vite)
```powershell
cd frontend
npm install
npm run dev
```
* **Local Web App:** `http://localhost:5173/`

---

## 3. Production Build & Nginx Proxy Architecture

```text
                                [ Internet (HTTPS / Port 443) ]
                                               │
                                     [ Nginx Reverse Proxy ]
                                   ┌───────────┴───────────┐
                      Location /   │                       │ Location /api/
                                   ▼                       ▼
                     Static Frontend Assets       Spring Boot Service
                     (Vite dist/ bundle)             (Port 8085)
                                                           │
                                                           ▼
                                                    PostgreSQL DB
```

### Build Commands:
```bash
# Frontend Build
cd frontend
npm run build
# Generates static assets in frontend/dist/

# Backend Build
cd backend
mvn clean package -DskipTests
# Produces runnable JAR: backend/target/backend-0.0.1-SNAPSHOT.jar
```
