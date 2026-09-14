# Trading Trends - Institutional Algorithmic Platform

**Trading Trends** is an algorithmic trading, managed capital, and investment management web platform. It features an institutional visitor landing page with strict KYC identity verification, automated email document dispatching, an advanced Super-Admin control portal, and an authenticated user trading dashboard with automated Monday-through-Friday $50 USDT compounding.

---

## Key Features

### 1. Visitor Landing Page
- Institutional dark theme with vibrant cyan (`#00f2fe`) and emerald (`#00e676`) accents.
- Educational onboarding workflow explaining the **$200 to $500 USD minimum initial investment deposit** required to activate daily 50 USDT gains.
- Live market ticker and quantitative performance stats.

### 2. KYC Verification & Email Dispatch
- 7 mandatory identity fields: Full Name, Email, Phone, DOB, Address, Aadhaar Number, PAN Card Number.
- **Dual Aadhaar Upload Boxes**: Dedicated uploaders for **Front Side** (Photo & details) and **Back Side** (Address & QR code).
- **PAN Card Uploader**.
- Automatically dispatches submissions with all 3 document attachments directly to `tradingtrendsbeta@gmail.com`.
- Automatically logs applications in the Admin Portal for 1-click account generation.

### 3. Super-Admin Portal (`/admin`)
- **Complete Control**: Admin has 100% control over all user accounts and dashboard views.
- **Direct Balance Override**: Edit any user's balance to any target amount anytime.
- **"View as User" (Live Impersonation)**: Admin can view the user's screen in real time.
- **KYC Inquiries Inbox**: Review submitted documents with 1-click user creation.
- **Withdrawals & Deposits Hub**: Review payout requests (USDT TRC-20 address or Binance ID) and approve or reject with instant balance settlements.
- **Platform & Deposit Settings**: Configure platform deposit address, custom deposit notes, and SMTP settings.

### 4. User Trading Dashboard
- Verified personal profile (Name, Email, Phone, DOB, Address, Aadhaar, PAN).
- **Automated Monday–Friday Growth Engine**: Automatically credits **+50 USDT ($50.00 USD) daily** every Monday through Friday, cleanly pausing over Saturdays and Sundays.
- **Deposit Modal**: USDT TRC-20 address, QR code, and admin custom note.
- **Withdrawal Modal**: Payout to Crypto Address or Binance ID with mandatory network advisory note.
- **Trading Trends Alpha-V Bot Feed**: Real-time algorithmic trade ledger.
- **TradingView Terminal**: Live interactive candlestick chart.

---

## Tech Stack

- **Frontend**: React 18, Vite, Lucide Icons, TradingView Charts, Vanilla CSS with custom glassmorphism design tokens.
- **Backend**: Node.js, Express, JSON persistent database store, Multer (multipart document uploads), Nodemailer (MIME attachments dispatch).
- **Security**: JWT Authentication, bcrypt password hashing, Role-Based Access Control (`ADMIN` vs `USER`).

---

## Local Development & Setup

### Prerequisites
- Node.js (v18+) & npm

### 1. Backend Setup
```bash
cd server
npm install
node index.js
```
The server will start on `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
The application will be accessible at `http://localhost:5173`.

### Default Credentials
- **Admin**: `admin` / `admin123`
- **Demo Trader**: `rahul_trader` / `TraderPass123!`

---

## 🚀 Free Deployment Guide (No Custom Domain Required)

You can deploy the platform 100% free with automated SSL domains:
- **Backend API**: Hosted on **Render** (provides free `https://<your-app>.onrender.com`)
- **Frontend App**: Hosted on **Vercel** (provides free `https://<your-app>.vercel.app`)

### Step 1: Deploy Backend to Render (render.com)
1. Sign up/Log in at [render.com](https://render.com) using your GitHub account.
2. Click **New +** -> **Web Service**.
3. Select and connect your repository: `paulchetti/Trading-Trends`.
4. Configure settings:
   - **Name**: `trading-trends-api` (or your choice)
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Instance Type**: `Free`
5. In **Environment Variables**, add:
   - `ADMIN_EMAIL` = `tradingtrendsbeta@gmail.com`
   - `JWT_SECRET` = `trading_trends_secure_secret_2026` (or any random string)
   - `NODE_ENV` = `production`
6. Click **Deploy Web Service**.
7. Once deployed, copy your backend URL (e.g., `https://trading-trends-api.onrender.com`).

### Step 2: Deploy Frontend to Vercel (vercel.com)
1. Sign up/Log in at [vercel.com](https://vercel.com) using your GitHub account.
2. Click **Add New...** -> **Project**.
3. Import your `Trading-Trends` repository.
4. In project configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: click `Edit` and select `client` (or leave default if using root `vercel.json`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add:
   - **Key**: `VITE_API_URL`
   - **Value**: Your Render backend URL from Step 1 (e.g., `https://trading-trends-api.onrender.com`)
6. Click **Deploy**.
7. Vercel will instantly generate your live website URL (e.g., `https://trading-trends.vercel.app`) with free SSL.

---

## License
Proprietary & Confidential - Trading Trends Institutional Technologies.
