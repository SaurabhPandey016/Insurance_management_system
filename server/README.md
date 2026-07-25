# ⚙️ InsuraShield Server (Backend REST API)

Welcome to the backend API of **InsuraShield**, a robust and secure insurance management platform. Developed using Node.js, Express, and Prisma v7, it implements a pure MVC (Model-View-Controller) architecture connecting to a Supabase PostgreSQL instance.

---

## 🔒 Security & Architecture
- **🛡️ Clean MVC Pattern**: Decouples business logic into models, controller layers, and routers.
- **🍪 HttpOnly Cookies**: Session tokens are transmitted via secure, HttpOnly, SameSite cookies to mitigate XSS attacks.
- **⚡ Prisma v7 Integration**: Integrates schema mappings using runtime PostgreSQL driver pools with custom SSL chains to bypass unauthorized certifications.
- **📑 Dynamic PDF Generator**: Compiles styled receipt invoice PDFs inside `uploads/receipts/` using `pdfkit` automatically when a payment is processed.
- **🔍 Input Validations**: Employs Zod schemas to strictly validate user registrations, logins, claims, and template creations before processing.
- **⚠️ Crash-Free Middleware**: Runs global exception boundaries to catch and map schema violations or database conflicts without halting the execution pool.

---

## 🛠️ Tech Stack
- **Runtime**: [Node.js](https://nodejs.org/)
- **Web Framework**: [Express.js](https://expressjs.com/)
- **ORM**: [Prisma ORM v7](https://www.prisma.io/)
- **Database**: [PostgreSQL (Supabase)](https://supabase.com/)
- **Validation**: [Zod](https://zod.dev/)
- **Authentication**: JSON Web Tokens (JWT) + `bcrypt` password hashing
- **File Management**: `Multer` disk storage
- **PDF Generation**: [PDFKit](https://pdfkit.org/)

---

## 📂 Directory Structure
```bash
server/
├── prisma/
│   ├── schema.prisma       # Prisma database models
│   └── seed.js             # Seed script for default templates and users
├── controllers/            # HTTP controller layers
├── middlewares/            # Auth, Upload, and Error middlewares
├── models/                 # Database Prisma model wrappers
├── routes/                 # Express REST endpoint maps
├── uploads/                # Local vault file uploads
│   └── receipts/           # Generated PDF invoice receipts
├── utils/
│   ├── pdfGenerator.js     # Receipt compiler
│   └── validation.js       # Zod validation schemas
├── app.js                  # App bootstrap and main server configs
├── db.js                   # Prisma Client initializer with SSL support
└── prisma.config.ts        # Prisma datasource migrations config
```

---

## 🚀 Setup & Execution

### 1. Configure Environment Variables
Create a `server/.env` file inside the `server/` directory and define your connection configurations:
```env
DATABASE_URL=postgresql://postgres.xxx:password@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
DIRECT_URL=postgresql://postgres.xxx:password@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require
PORT=10000
JWT_SECRET=your_super_secret_jwt_signature_key
CLIENT_URL=http://localhost:3000
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database Schema
Push the defined schemas and constraints to your Supabase PostgreSQL instance:
```bash
npx prisma db push
```

### 4. Seed Database
Load the initial default policy types and seeded user roles (Admin, Agent, Customer):
```bash
npm run seed
```

### 5. Start Express API Server
```bash
npm run dev
```
The server will bind locally to `http://localhost:10000`.

---

## 📂 Uploads Storage
Documents uploaded to the vault are stored inside `uploads/` using randomized disk filenames. Invoices generated upon checkouts are compiled inside `uploads/receipts/` and streamed directly back to client browsers.
