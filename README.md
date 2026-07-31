# 🛡️ InsuraShield — Digital Insurance Operations Platform

[![Next.js Client](https://img.shields.io/badge/Client-Next.js%2016-indigo?style=for-the-badge&logo=nextdotjs)](./client)
[![Express Server](https://img.shields.io/badge/Server-Express%20MVC-blue?style=for-the-badge&logo=express)](./server)
[![Prisma Schema](https://img.shields.io/badge/ORM-Prisma%20v7-emerald?style=for-the-badge&logo=prisma)](./server/prisma/schema.prisma)
[![Supabase Database](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20Supabase-emerald?style=for-the-badge&logo=supabase)](./server/prisma/schema.prisma)
[![Developer Portfolio](https://img.shields.io/badge/Developed%20By-Saurabh%20Pandey-rose?style=for-the-badge)](#-connect-with-developer)

**InsuraShield** is a premium, robust, enterprise-grade insurance management web platform. Designed to digitize manual paper-based insurance workflows, it enables insurance companies, agents, and clients to issue policies, track monthly premium installments, audit submitted claims, and upload verified credentials from a centralized dark-mode portal.

---

## 📸 Architecture & Workflow Diagram

```mermaid
graph TD
    %% Frontend Layer
    subgraph Client [Client Portal - Next.js 16]
        A[Next.js App Router] -->|State Management| B(AuthContext State)
        A -->|Tailwind CSS v4 UI| C(Glassmorphic Layouts)
        A -->|Interactive Billing| D(Premium Checkout Form)
        A -->|Chart.js Graphs| E(Business Statistics Reports)
    end

    %% Backend Layer
    subgraph Engine [Server Engine - Express MVC]
        F[RESTful API Router] -->|Zod Validator| G(Input Auditing Pipe)
        F -->|Auth Verification| H(HttpOnly JWT Validator)
        F -->|Controllers Layer| I(Business Logic Managers)
        I -->|PDFKit Compiler| J(Invoice Generator)
        I -->|Multer Engine| K(Vault File Uploads)
    end

    %% Database Layer
    subgraph Persistence [Database Layer - Supabase]
        L[(PostgreSQL Database)]
    end

    %% Workflow relations
    Client -->|REST Requests / CORS & Cookies| F
    I -->|Prisma Client pg Adapter| L
```

---

## 🎨 Enterprise-Grade Features

### 🔑 Combined Authentication Panel
*   Unified access portal for all three roles (**Customer**, **Agent**, **Admin**).
*   Cookies-based JWT session authorization (uses HttpOnly, SameSite, Secure flags to eliminate XSS/CSRF token hijacking).

### 📈 Admin Business Metrics Panel
*   Displays critical operational analytics: Total Revenue collected, outstanding installment balances, active policies, and claim volumes.
*   Interactive analytical widgets (powered by **Chart.js**):
    *   *Revenue Collections Trend*: Line graph tracking collections over time.
    *   *Claims Resolution Breakdown*: Doughnut chart mapping approved, pending, and rejected claims.
    *   *Customer Acquisition Growth*: Bar chart tracking monthly client registration growth.

### 💼 Insurance Agent Workstations
*   Register customers manually.
*   Issue customized coverage policies (assign custom premium rates, set term dates, and link to client profiles).
*   Review claims queue (verify descriptions and approve/reject claims with custom remarks).

### 👤 Customer Self-Service Client Portal
*   View active policies, duration terms, and coverage limits.
*   Review pending and overdue monthly premium bills.
*   Pay premium installments instantly via the integrated checkout form.
*   Download dynamic, styled PDF receipts containing billing breakdowns.
*   Upload verified identification or claim proofs to the secure document vault.
*   Submit claims and track auditing progress.

---

## 📂 Project Organization & Directory Maps
```bash
Insurance_management_system/
├── client/                 # Next.js 16 + Tailwind CSS v4 frontend portal
│   ├── src/app/            # App router paths (dashboards, login, register, landing)
│   └── src/components/     # Layouts (Navbar, Sidebar, Footer) and dashboards
├── server/                 # Node.js + Express + Prisma v7 REST API
│   ├── controllers/        # HTTP input parsing logic
│   ├── models/             # Database queries wrapper layers (MVC Model abstraction)
│   ├── routes/             # REST endpoint bindings
│   └── utils/              # PDF Generator and Zod schema validations
└── walkthrough.md          # Project details and validation summary
```

---

## 🚀 Step-by-Step Local Setup

To launch both backend and frontend layers on your system:

### 1. Configure Server Environments
Navigate into the [server/](file:///c:/Users/HP/OneDrive/Desktop/Labmentix%20Projects/Project-4/Insurance_management_system/server) directory and create your `server/.env` file:
```env
# Connection urls to PostgreSQL (Supabase)
DATABASE_URL="postgresql://postgres.your_id:your_password@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://postgres.your_id:your_password@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require"

# Server bindings & secrets
PORT=10000
JWT_SECRET="your_custom_jwt_security_signature_key"
CLIENT_URL="http://localhost:3000"
```

### 2. Configure Client Environments
Navigate into the [client/](file:///c:/Users/HP/OneDrive/Desktop/Labmentix%20Projects/Project-4/Insurance_management_system/client) directory and create your `client/.env` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:10000/api
NEXT_PUBLIC_SERVER_URL=http://localhost:10000
```

### 3. Setup and Run the Server
Open a terminal in the [server/](file:///c:/Users/HP/OneDrive/Desktop/Labmentix%20Projects/Project-4/Insurance_management_system/server) folder:
```bash
# Install dependencies
npm install

# Push database schema to Supabase instance
npx prisma db push

# Inject default policy templates & hashed test accounts
npm run seed

# Run Express server
npm run dev
```
The server will start on `http://localhost:10000`.

### 4. Setup and Run the Client
Open a new terminal in the [client/](file:///c:/Users/HP/OneDrive/Desktop/Labmentix%20Projects/Project-4/Insurance_management_system/client) folder:
```bash
# Install dependencies
npm install

# Build & launch client dev server
npm run dev
```
The client portal will start on `http://localhost:3000`.

---

<!-- ## 🔐 Seeded Accounts for Testing
To facilitate evaluation, the seeding script populates test profiles with pre-configured relations. You can log in directly using:

| User Role | Login Email | Testing Password |
| :--- | :--- | :--- |
| **👑 System Administrator** | `admin@insurance.com` | `Admin@123` |
| **💼 Insurance Agent** | `agent@insurance.com` | `Agent@123` |
| **👤 Premium Customer** | `customer@insurance.com` | `Customer@123` |

--- -->

## 📬 Connect with Developer

Have questions, suggestions, or want to collaborate? Feel free to reach out:

*   **🐙 GitHub**: [SaurabhPandey016](https://github.com/SaurabhPandey016)
*   **💼 LinkedIn**: [Saurabh Pandey](https://www.linkedin.com/in/saurabhpandey-/)
*   **📧 Email**: [developersaurabh04@gmail.com](mailto:developersaurabh04@gmail.com)
*   **📞 Phone**: [+91 8720026790](tel:+918720026790)

---
<p align="center" style="font-size: 14px; font-weight: bold; margin-top: 40px; color: #818cf8;">
  Made with ❤️ by Saurabh Pandey
</p>
