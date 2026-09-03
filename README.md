# Lagaan Secure - Startup-Grade AgriTech Platform

**Lagaan Secure** is a production-ready enterprise AgriTech marketplace connecting smallholder farmers and Farmers Producer Organizations (FPOs) directly with institutional buyers and wholesale procurement networks—eliminating multi-layered intermediary commissions.

## 🚀 Live Production Environment

- **Web Application**: [https://lagaan-secure.vercel.app](https://lagaan-secure.vercel.app)
- **Status**: Beta / Release Candidate 1
- **Data Source**: Live Integration with data.gov.in Mandi Prices API

---

## 💼 Business Model

Lagaan Secure operates on a B2B2C marketplace model designed for scalability and trust:

1. **Transaction Fee (Take Rate)**: A nominal 1-2% escrow processing fee on completed wholesale deals, charged primarily to the buyer. This replaces the traditional 8-15% commission charged by middlemen.
2. **Premium FPO Subscriptions**: Advanced analytics, pooled logistics, and bulk tender matching for FPOs on a monthly SaaS subscription.
3. **Logistics & Warehousing Partnerships**: Lead-generation fees for connecting farmers/buyers with verified cold-storage providers and transport carriers.
4. **Data Insights (Future)**: Anonymized, aggregated supply/demand data licensing for financial institutions and agro-processors.

### Target Users
- **Smallholder Farmers**: Seeking fair, transparent market prices and direct access to reliable buyers without exploitation.
- **Farmers Producer Organizations (FPOs)**: Aggregating member produce to fulfill large institutional orders and optimize transport logistics.
- **Institutional Buyers / FMCGs**: Looking for traceable, direct-source procurement with guaranteed quality and reliable fulfillment.

---

## ⭐ Key Capabilities & Innovation

- **Zero Mock Data Policy**: All market prices are fetched live from verified Government APIs (api.data.gov.in). If data is unavailable, the system degrades gracefully. No fabricated transactions or fake metrics are displayed.
- **Gemini Smart Sell Advisor**: Personalized agricultural intelligence powered by Google Gemini 1.5 Flash. Analyzes crop, location, real-time prices, and logistics to provide actionable selling advice.
- **Advanced Authentication & Security**: Secure JWT sessions, Google OAuth 2.0 integration, strict rate limiting against brute-force attacks, and complete OTP/Forgot Password workflows.
- **Multilingual & Accessible**: Native support for 9 Indian regional languages with Text-to-Speech (TTS) capabilities for low-literacy users.
- **Real-Time Platform Governance**: An administrative dashboard with live API health monitoring and real, database-driven KPIs. Dispute resolution and escrow logic placeholders built-in.
- **Multi-Stop Route Optimizer**: Nearest-Neighbor TSP heuristic for freight consolidation and route planning.
- **FPO Bulk Lot Aggregation**: Pool smallholder member harvests into unified institutional master lots.

---

## 🏗️ System Architecture

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend**: Express.js (Serverless-ready for Vercel)
- **Database**: PostgreSQL (Sequelize ORM)
- **External Services**: Google OAuth (Identity), Google Gemini API (AI Advisor), data.gov.in (Market Prices)

---

## 🚀 Local Development & Quickstart

### Prerequisites
- Node.js v18.x+
- PostgreSQL v14.x+

### 1. Installation
```bash
git clone https://github.com/hardik-cs2837/LagaanSecure.git
cd LagaanSecure
npm install
cd client && npm install && cd ..
```

### 2. Configuration
Copy `.env.example` to `.env` and fill in your actual credentials.
**Crucial**: You must provide a valid `AGMARKNET_API_KEY` and `AI_API_KEY` (Google Gemini) to run local features.

### 3. Database Initialization & Admin Provisioning
```bash
createdb -U postgres kisaanconnect
npm run seed
```

**Admin Account Provisioning:**
The `npm run seed` command automatically provisions a default Super Admin account required to access the Platform Governance and API Health dashboards:
- **Role:** `admin`
- **Phone:** `0000000000` (Use this to login)
- **Password:** `admin123`

⚠️ **SECURITY WARNING:** *Admin accounts cannot be created via the public registration form. For production deployments, you MUST manually provision admin accounts directly in the PostgreSQL database or change the default seeded password immediately to prevent unauthorized access.*

### 4. Run Development Servers
```bash
npm run dev
```

---

## 🚀 Roadmap & Known Limitations

### Current Limitations
- **Escrow Integration**: The current deal flow supports negotiation and "accepted" states, but actual fiat currency escrow is simulated pending a payment gateway integration (e.g., Razorpay/Stripe).
- **Logistics Booking**: Users can view suggested routes, but the final booking of trucks relies on external coordination.

### Future Roadmap
- Q3 2026: Escrow payment gateway integration & automated KYC verification for buyers.
- Q4 2026: Mobile applications for Android (React Native) for deeper penetration into rural markets.
- Q1 2027: Integration with IoT weather sensors and soil health cards for predictive yield modeling.

---

## 📄 License
Released under the MIT License.
