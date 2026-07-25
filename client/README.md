# 🛡️ InsuraShield Client (Frontend Application)

Welcome to the frontend of **InsuraShield**, a premium, high-fidelity, and fully responsive insurance management interface. Built on Next.js 16 (App Router) and styled with Tailwind CSS v4, it delivers a state-of-the-art administrative, agent, and customer dashboard portal.

---

## 🎨 Features & Interface Design
- **✨ Premium Dark UI/UX**: Designed using glassmorphism, tailored HSL color gradients, glowing borders, and smooth micro-animations.
- **🔐 Protected Routes**: Implements client-side route guards via `<ProtectRoute>` wrapping to ensure non-authenticated users cannot access sensitive dashboard panels.
- **📊 Business Charts (Chart.js)**: Displays visual administrative summaries including premium collection trends, customer onboarding rates, and claims resolution ratios.
- **💳 Built-in Checkout Portal**: Permits customers to review pending premium installments, choose payment methods, execute mock checkouts, and download generated PDF receipts instantly.
- **📂 Secure Document Vault**: Facilitates uploading identity cards and claim supporting files via forms mapped directly to backend multipart storage.
- **📱 Fully Responsive**: Implements responsive, collapsible sidebar layouts and fixed responsive navbars tested on mobile, tablet, and desktop viewports.

---

## 🛠️ Tech Stack
- **Framework**: [Next.js 16](https://nextjs.org/) (React 19, App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: React Context (`AuthContext`) with cookie-based session verification
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Chart.js](https://www.chartjs.org/) + [React Chartjs 2](https://react-chartjs-2.js.org/)

---

## 📂 Directory Structure
```bash
client/
├── public/                 # Static assets (logos, icons)
└── src/
    ├── app/                # Next.js App Router structure
    │   ├── dashboard/      # Protected dashboard views
    │   │   ├── claims/     # Claims filings & review queues
    │   │   ├── customers/  # Customer directories
    │   │   ├── documents/  # Uploaded vault files
    │   │   ├── payments/   # Premium dues & invoices
    │   │   ├── policies/   # Active plans & template designer
    │   │   └── page.tsx    # Dashboard dispatcher (role-based)
    │   ├── login/          # Combined credentials form
    │   ├── register/       # Client signup form
    │   ├── layout.tsx      # Global layouts
    │   └── page.tsx        # Premium Landing page
    └── components/         # Reusable presentation files
        ├── AuthContext.tsx # Authentication state routines
        ├── ProtectRoute.tsx# Router navigation guard
        ├── Navbar.tsx      # Main navigation header
        ├── Sidebar.tsx     # Dashboard left menu
        └── Footer.tsx      # Standard footer
```

---

## 🚀 Setup & Execution

### 1. Configure Environment Variables
Create a `client/.env` file in the root of the `client` directory and specify your API base URLs:
```env
NEXT_PUBLIC_API_URL=http://localhost:10000/api
NEXT_PUBLIC_SERVER_URL=http://localhost:10000
```

### 2. Install Dependencies
Navigate into the client directory and install packages:
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
The app will run locally at `http://localhost:3000`.

---

## 🔒 Session Verification & Security
All sessions are validated against backend HttpOnly cookie signatures containing JWT strings. No security tokens or user details are saved in `localStorage`, protecting the app from cross-site scripting (XSS) credential leaks.
