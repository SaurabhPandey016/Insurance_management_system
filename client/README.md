# 🛡️ InsuraShield Client — Next.js 16 Production Frontend Portal

Welcome to the frontend application portal of **InsuraShield**. This repository contains the premium, high-fidelity user interface built on **Next.js 16 (React 19)** and styled using **Tailwind CSS v4** design primitives.

It delivers three distinct, highly specialized dashboards (Admin, Agent, Customer) designed for optimal responsiveness, security, and accessibility.

---

## 🎨 Creative & Modern UI/UX Highlights
- **✨ Sleek Dark Mode Aesthetics**: Implements modern typography (using Google Fonts Geist integration), customized glassmorphic containers, vibrant HSL gradients, and subtle hover animations that give a high-end SaaS application feel.
- **📈 Rich Visual Dashboards (Chart.js)**: Utilizes dynamic graphs (line, bar, doughnut) to represent collection streams, client acquisition rates, and claim resolution statuses.
- **🔐 Secure Client Routing**: Wraps dashboard views in a client-side `<ProtectRoute>` state checker to verify access roles and automatically handle redirects.
- **💳 Fully Integrated Premium Checkout**: Features a mock checkout module allowing customers to select credit cards, debit cards, bank transfers, or Stripe to pay outstanding monthly premiums. It automatically initiates receipt compilation on the server and displays an interactive PDF receipt download link upon success.
- **📁 Secure Document Vault**: Includes drag-and-drop file inputs linked directly to backend Multipart Form-Data upload APIs for identity papers and claim support records.

---

## 🛠️ Advanced Technology Stack
*   **Core Framework**: Next.js 16.2 (App Router with Server & Client components)
*   **State & Session Orchestration**: React Context (`AuthContext`) with cookie-based JWT parsing
*   **Styling Engine**: Tailwind CSS v4 (incorporating advanced custom theme variables and utility classes)
*   **Visual Indicators**: Chart.js v4 + React-ChartJS-2
*   **Icons & Graphics**: Lucide React

---

## 📂 Frontend Directory Mapping
```bash
client/
├── public/                 # Static branding assets & vector graphics
└── src/
    ├── app/                # Next.js App Router root
    │   ├── dashboard/      # Protected dashboard viewport routes
    │   │   ├── claims/     # Claims filings tracker and agent review tables
    │   │   ├── customers/  # Customer lists and profile audit timelines
    │   │   ├── documents/  # Vault uploads and digital contract records
    │   │   ├── payments/   # Premium installments and invoice ledger
    │   │   ├── policies/   # Base templates designer and issued contracts list
    │   │   └── page.tsx    # Dashboard routing dispatcher (renders dashboard component based on role)
    │   ├── login/          # Combined credentials interface (tabs for Customer, Agent, Admin)
    │   ├── register/       # Customer signup portal
    │   ├── layout.tsx      # Root html wrapper with AuthProvider and Global Navigation
    │   └── page.tsx        # Branded marketing landing page
    ├── components/         # Modular layout, auth, and dashboard widgets
    │   ├── dashboards/     # Dedicated role component panels
    │   │   ├── AdminDashboard.tsx   # Aggregates system metrics and Chart.js graphs
    │   │   ├── AgentDashboard.tsx   # Focuses on workflows, pending approvals, and fast action shortcuts
    │   │   └── CustomerDashboard.tsx# Renders outstanding bills, active policies, and checkout forms
    │   ├── AuthContext.tsx # Centralized authentication context provider
    │   ├── ProtectRoute.tsx# High-order route validation guard
    │   ├── Navbar.tsx      # Responsive header nav
    │   ├── Sidebar.tsx     # Responsive left navigation panel
    │   └── Footer.tsx      # Contact footer displaying links & credits
```

---

## 🔒 Security Architecture
1. **HttpOnly Cookie Authentication**: The client does not store access tokens in `localStorage` or `sessionStorage` (preventing Cross-Site Scripting (XSS) token extraction). Instead, the server sets HttpOnly, Secure, SameSite cookies which are automatically included in all `fetch` queries via `credentials: 'include'`.
2. **Context-Driven Guards**: The `<ProtectRoute>` high-order component intercepts all dashboard navigation requests, checks the loading state, and routes non-authenticated viewers back to `/login`.

---

## 🚀 Setup & Development Execution

### 1. Environment Variables Configuration
Configure a `.env` file inside the `client/` folder:
```env
# URL where the Express MVC server is running
NEXT_PUBLIC_API_URL=http://localhost:10000/api
NEXT_PUBLIC_SERVER_URL=http://localhost:10000
```

### 2. Package Installation
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

### 4. Build for Production
```bash
npm run build
```

---

<p align="center" style="font-size: 14px; font-weight: bold; margin-top: 40px; color: #818cf8;">
  Made with ❤️ by Saurabh Pandey
</p>
