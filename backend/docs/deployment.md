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
./mvnw clean package -DskipTests
# Produces runnable JAR: backend/target/backend-0.0.1-SNAPSHOT.jar
```

---

## 4. AWS EC2 Dual-Instance Separate Hosting Architecture

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      Internet Users (HTTPS: 443)                       │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                 ┌───────────────────▼───────────────────┐
                 │         EC2 Instance #1: Frontend     │
                 │   - Nginx Web Server (Port 80 / 443)  │
                 │   - React SPA bundle (/var/www/html)  │
                 └───────────────────┬───────────────────┘
                                     │ Reverse Proxy: /api/* -> Port 8085
                 ┌───────────────────▼───────────────────┐
                 │         EC2 Instance #2: Backend      │
                 │   - Spring Boot (Port 8085 / systemd) │
                 │   - OpenJDK 21 (LTS)                  │
                 └───────────────────┬───────────────────┘
                                     │ JDBC SSL (Port 5432)
                 ┌───────────────────▼───────────────────┐
                 │          AWS RDS PostgreSQL           │
                 │   - a2zcart_db Database Engine        │
                 └───────────────────────────────────────┘
```

### 4.1 Security Groups Setup
1. **Frontend SG (`sg-frontend`)**:
   - `Inbound`: Port 80 (HTTP) -> `0.0.0.0/0`
   - `Inbound`: Port 443 (HTTPS) -> `0.0.0.0/0`
   - `Inbound`: Port 22 (SSH) -> `Your IP`
2. **Backend SG (`sg-backend`)**:
   - `Inbound`: Port 8085 -> Source `sg-frontend` (or VPC CIDR / Frontend Public IP)
   - `Inbound`: Port 22 (SSH) -> `Your IP`
3. **RDS Database SG (`sg-rds`)**:
   - `Inbound`: Port 5432 -> Source `sg-backend`

### 4.2 Backend EC2 Setup (Spring Boot)
1. **Connect to Backend EC2**:
   ```bash
   ssh -i your-key.pem ubuntu@<BACKEND_EC2_PUBLIC_IP>
   ```
2. **Install OpenJDK 21**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y openjdk-21-jdk git
   ```
3. **Upload or Clone Code**:
   ```bash
   git clone https://github.com/PRAVINKUMAR-SP/A2Z-cart.git
   cd A2Z-cart/backend
   chmod +x mvnw
   ./mvnw clean package -DskipTests
   ```
4. **Create Systemd Service (`/etc/systemd/system/a2z-backend.service`)**:
   ```ini
   [Unit]
   Description=A2Z-cart Spring Boot Backend
   After=syslog.target network.target

   [Service]
   User=ubuntu
   WorkingDirectory=/home/ubuntu/A2Z-cart/backend
   ExecStart=/usr/bin/java -jar /home/ubuntu/A2Z-cart/backend/target/backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=rds
   SuccessExitStatus=143
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```
5. **Start and Enable Service**:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now a2z-backend
   sudo systemctl status a2z-backend
   ```
6. **Verify Backend Locally**:
   ```bash
   curl http://localhost:8085/api/products
   ```

### 4.3 Frontend EC2 Setup (Nginx)
1. **Connect to Frontend EC2**:
   ```bash
   ssh -i your-key.pem ubuntu@<FRONTEND_EC2_PUBLIC_IP>
   ```
2. **Install Nginx**:
   ```bash
   sudo apt update && sudo apt install -y nginx
   ```
3. **Deploy Frontend Build**:
   On your local machine (or CI/CD), build the frontend and copy to the EC2:
   ```bash
   # On local machine:
   cd frontend
   npm run build
   scp -i your-key.pem -r dist/* ubuntu@<FRONTEND_EC2_PUBLIC_IP>:/tmp/dist/

   # On Frontend EC2:
   sudo mkdir -p /var/www/a2z-cart
   sudo cp -r /tmp/dist/* /var/www/a2z-cart/
   sudo chown -R www-data:www-data /var/www/a2z-cart
   ```
4. **Configure Nginx Site (`/etc/nginx/sites-available/a2z-cart`)**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com <FRONTEND_EC2_IP>;

       # Frontend Static Files (React SPA)
       location / {
           root /var/www/a2z-cart;
           index index.html index.htm;
           try_files $uri $uri/ /index.html;
       }

       # Reverse Proxy for Spring Boot Backend API
       location /api/ {
           proxy_pass http://<BACKEND_EC2_PRIVATE_OR_PUBLIC_IP>:8085/api/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
           proxy_read_timeout 300s;
           proxy_connect_timeout 300s;
       }

       # Static Asset Caching
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
           root /var/www/a2z-cart;
           expires 30d;
           add_header Cache-Control "public, no-transform";
       }
   }
   ```
5. **Enable Site & Restart Nginx**:
   ```bash
   sudo ln -sf /etc/nginx/sites-available/a2z-cart /etc/nginx/sites-enabled/
   sudo rm -f /etc/nginx/sites-enabled/default
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### 4.4 Free SSL Setup with Let's Encrypt (Optional but Recommended)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```
Certbot will automatically configure HTTPS on port 443 and auto-renew certificates.

---

## 5. Automated CI/CD Deployment with GitHub Actions

Whenever you run `git push origin main`, GitHub Actions automatically connects to your EC2 instance via SSH, pulls the latest code, builds both the React frontend and Spring Boot backend, and restarts Nginx.

### Required GitHub Secrets:
Navigate to your GitHub Repository: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Secret Name | Value | Description |
| :--- | :--- | :--- |
| `EC2_HOST` | `15.206.84.110` (or Elastic IP) | Public IP address of your EC2 instance |
| `EC2_USER` | `ec2-user` | Amazon Linux 2023 default user |
| `EC2_SSH_KEY` | Contents of `your-key.pem` | Private SSH Key (including `-----BEGIN ...-----` and `-----END ...-----`) |

### Workflow Configuration:
The workflow is defined at [deploy.yml](file:///.github/workflows/deploy.yml). Every push to `main` executes:
1. `git fetch origin main && git reset --hard origin/main`
2. `npm install --legacy-peer-deps && npm run build` (deploys to `/var/www/a2z-cart`)
3. `./mvnw clean package -DskipTests` (recompiles JAR)
4. Restarts `a2z-backend` and `nginx` services.

