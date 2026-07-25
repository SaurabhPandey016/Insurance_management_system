# ⚙️ InsuraShield Server — RESTful Express MVC Engine

Welcome to the backend server engine of **InsuraShield**. This repository houses the API service built on **Node.js (Express)** and integrated with **Prisma ORM v7** connecting to a managed **PostgreSQL (Supabase)** database instance.

It executes the platform's core logic: secure authentication, role-based validations, PDF invoice generation, file storage, and data querying.

---

## 🏗️ Architectural Pattern: Express MVC
To ensure scalability, modular testing, and clear segregation of concerns, the backend strictly implements the **Model-View-Controller (MVC)** architectural design:
- **Models (`server/models/`)**: Encapsulates Prisma queries and handles complex database manipulations (e.g. generating monthly installment records upon writing a policy).
- **Controllers (`server/controllers/`)**: Reads incoming request parameters, triggers schema validations, invokes respective database models, and shapes response structures.
- **Routes (`server/routes/`)**: Mounts RESTful endpoints and binds route-specific middleware (auth checks, file upload capture).

---

## 🔒 Security & Middleware Pipelines
1.  **Strict Request Validations (Zod)**: Prevents malformed payloads or SQL injection vectors. Every POST/PUT request is checked against a Zod schema defined in [validation.js](file:///c:/Users/HP/OneDrive/Desktop/Labmentix%20Projects/Project-4/Insurance_management_system/server/utils/validation.js) before hitting controllers.
2.  **HttpOnly JWT Session Delivery**: Issues signed JWT payloads via secure, HttpOnly, SameSite cookies. This shields the application from cross-site scripting (XSS) and cross-site request forgery (CSRF) vulnerabilities.
3.  **Bcrypt Hashing**: Secures user credentials using bcrypt with a high work factor salt to protect credentials in the database.
4.  **Graceful Exception Boundary (errorMiddleware.js)**: A centralized Express error interceptor that maps database schema violations, Zod validation errors, and file size constraints to friendly client responses—preventing server crashes.
5.  **Secure File Storage**: Configures `multer` disk storage policies to enforce mimetype restrictions, allowing only validated images and PDF contracts into the server's local vault directory.

---

## 📄 Automated Receipt Compiler (PDFKit)
When a premium payment installment is successfully checkout-approved, the server automatically:
- Records the transaction ID and updates the payment status to `PAID`.
- Triggers `pdfGenerator.js` to compile a highly formatted, styled PDF invoice containing policy terms, premium rates, receipt metadata, and client details.
- Saves the invoice in `uploads/receipts/` and makes it accessible for clients to download in the client portal.

---

## 📂 Backend Directory Mapping
```bash
server/
├── prisma/
│   ├── schema.prisma       # Prisma database models (User, Profile, Policy, Claim, Payment, Document)
│   └── seed.js             # Seed script to inject default policy templates and test profiles
├── controllers/            # HTTP Controllers (Auth, Customers, Claims, Payments, Policies, Vault)
├── middlewares/            # Middleware chains
│   ├── authMiddleware.js   # Parses HttpOnly JWT cookies and checks roles
│   ├── errorMiddleware.js  # Catches system exceptions and formats client errors
│   └── uploadMiddleware.js # Manages Multer file uploads and validation checks
├── models/                 # MVC Database abstraction models (Wraps Prisma logic)
├── routes/                 # Express Router configuration endpoints
├── uploads/                # Local vault file uploads directory
│   └── receipts/           # Generated payment receipts PDF archive
└── utils/
    ├── pdfGenerator.js     # Invoice compiler using PDFKit
    └── validation.js       # Request validation rules using Zod
```

---

## 🚀 Setup & Execution Guide

### 1. Environment Configurations
Create a `.env` file inside the `server/` directory:
```env
# Database connection configurations (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.your_project_id:your_db_password@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://postgres.your_project_id:your_db_password@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require"

# Server configuration parameters
PORT=10000
JWT_SECRET="your_custom_jwt_signing_key_phrase"
CLIENT_URL="http://localhost:3000"
```

### 2. Dependency Installation
```bash
npm install
```

### 3. Database Sync & Migrations
```bash
# Push tables to Supabase
npx prisma db push
```

### 4. Database Seed Injection
```bash
# Populate initial policy templates and testing profiles
npm run seed
```

### 5. Start Express API Server
```bash
# Start server in development mode with nodemon hot-reload
npm run dev
```
The server binds locally to `http://localhost:10000`.

---

<p align="center" style="font-size: 14px; font-weight: bold; margin-top: 40px; color: #818cf8;">
  Made with ❤️ by Saurabh Pandey
</p>
