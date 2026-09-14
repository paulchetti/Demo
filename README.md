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
- Automatically dispatches submissions with all 3 document attachments directly to `chettipaul@gmail.com`.
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

## License
Proprietary & Confidential - Trading Trends Institutional Technologies.
