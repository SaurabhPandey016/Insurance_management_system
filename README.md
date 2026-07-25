# 🛡️ InsuraShield - Comprehensive Insurance Management Platform

[![Next.js Client](https://img.shields.io/badge/Client-Next.js%2016-indigo)](./client)
[![Express Server](https://img.shields.io/badge/Server-Express%20MVC-blue)](./server)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20Prisma%20v7-emerald)](./server/prisma/schema.prisma)
[![Developer](https://img.shields.io/badge/Made%20With%20%E2%9D%A4%20by-Saurabh%20Pandey-rose)](#-connect-with-developer)

**InsuraShield** is a state-of-the-art web platform engineered to modernize, simplify, and digitize end-to-end insurance business operations. From central policy issuing and automated monthly billing to secure claim auditing and document vault uploads, InsuraShield provides a premium, responsive, and crash-free solution.

---

## 🎨 System Architecture Overview

```mermaid
graph TD
    A[Next.js 16 Frontend Client] -->|Fetch API / CORS / Credentials| B(Express Backend MVC Engine)
    B -->|Prisma Pg Adapter| C[(Supabase PostgreSQL Database)]
    B -->|HttpOnly Cookies| D[JWT Session Validation]
    B -->|Zod Validations| E[Input Auditing Middleware]
    B -->|PDFKit Generator| F[Dynamic Payment Receipts PDF]
    B -->|Multer Engine| G[Local Files Uploads Storage]
```

---

## ✨ Features & Operations

### 🔑 Combined Authentication & Security
- Credentials-based auth form supporting role tabs (**Customer**, **Agent**, **Admin**).
- Cookies-based auth flow storing JWT keys securely inside HttpOnly wrappers.

### 📊 Role-Based Dashboard Dashboards
- **👑 Administrator Panel**: Full business analytics dashboards including monthly premium collection trends, customer registration ratios, and claim status distribution charts.
- **💼 Insurance Agent Portal**: Register new customer accounts, issue customized policies from active templates, and review claims queues.
- **👤 Client Portal**: Check active plans, review outstanding monthly premium dues, execute payments, download PDF receipts, upload files, and file claim requests.

### 💳 Dynamic Payments Billing
- Monthly billing installment queues are generated automatically when a policy is written.
- Integrated premium checkouts compile payment receipts to PDF documents on the fly.

### 📂 File Vault System
- Form upload integrations supporting Multer file attachments (PDF, DOCX, JPG, PNG) for identity papers and accident evidence files.

---

## 📂 Project Organization
```bash
Insurance_management_system/
├── client/                 # Next.js frontend application (Port 3000)
├── server/                 # Express backend API & database layer (Port 10000)
├── walkthrough.md          # Implementation summary document
└── task.md                 # Project checklist tracker
```

---

## 🚀 Quick Execution Guide

Follow these steps to run both application layers locally:

### 1. Database and Environment Configuration
Inside the [server/](file:///c:/Users/HP/OneDrive/Desktop/Labmentix%20Projects/Project-4/Insurance_management_system/server) directory, write your `server/.env` configuration:
```env
DATABASE_URL=postgresql://postgres.xxx:password@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
DIRECT_URL=postgresql://postgres.xxx:password@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require
PORT=10000
JWT_SECRET=your_super_secret_jwt_signature_key
CLIENT_URL=http://localhost:3000
```

Inside the [client/](file:///c:/Users/HP/OneDrive/Desktop/Labmentix%20Projects/Project-4/Insurance_management_system/client) directory, write your `client/.env` configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:10000/api
NEXT_PUBLIC_SERVER_URL=http://localhost:10000
```

### 2. Setup the Server Database
Open a terminal in the [server/](file:///c:/Users/HP/OneDrive/Desktop/Labmentix%20Projects/Project-4/Insurance_management_system/server) folder and push the Prisma schema and seed data:
```bash
# Install server dependencies
npm install

# Push relational tables and constraints to Supabase
npx prisma db push

# Seed default policy types and users
npm run seed
```

### 3. Start the API Server
```bash
npm run dev
```
The backend server runs on `http://localhost:10000`.

### 4. Start the Next.js Client
Open a new terminal in the [client/](file:///c:/Users/HP/OneDrive/Desktop/Labmentix%20Projects/Project-4/Insurance_management_system/client) folder:
```bash
# Install client dependencies
npm install

# Launch client dev server
npm run dev
```
The frontend client runs on `http://localhost:3000`.

---

## 🔑 Test Credentials (Pre-Seeded)
To facilitate testing, you can log in directly using the seeded credentials:
- **Administrator**: `admin@insurance.com` (Password: `Admin@123`)
- **Insurance Agent**: `agent@insurance.com` (Password: `Agent@123`)
- **Customer**: `customer@insurance.com` (Password: `Customer@123`)

---

## 📬 Connect with Developer

Have questions, suggestions, or want to collaborate? Reach out:

- **🐙 GitHub**: [SaurabhPandey016](https://github.com/SaurabhPandey016)
- **💼 LinkedIn**: [Saurabh Pandey](https://www.linkedin.com/in/saurabhpandey-/)
- **📧 Email**: [developersaurabh04@gmail.com](mailto:developersaurabh04@gmail.com)
- **📞 Phone**: [+91 8720026790](tel:+918720026790)

---
<p align="center">Made with ❤️ by Saurabh pandey</p>
