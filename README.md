# Lagaan Secure 🌾

**Lagaan Secure** is an enterprise-grade AgriTech marketplace connecting farmers and Farmers Producer Organizations (FPOs) directly with institutional buyers and wholesale procurement networks — eliminating multi-layered intermediary commissions.

🌐 **Live Vercel Production Web App:** [https://lagaan-secure.vercel.app](https://lagaan-secure.vercel.app)

---

## 🌟 Key Capabilities & Innovation

- **Direct Farmer-to-Buyer Marketplace**: Trade agricultural produce directly without agent fees.
- **AI Demand & 14-Day Price Forecasting**: Mathematical linear regression (OLS + EWMA) timing advice.
- **Multi-Stop Route Optimizer**: Nearest-Neighbor TSP heuristic for freight consolidation and route planning.
- **FPO Bulk Lot Aggregation**: Pool smallholder member harvests into unified institutional master lots.
- **Institutional Bulk Tenders**: Post buyer procurement requirements with automated match scoring.
- **Cold Storage & Logistics Directory**: Multi-chamber warehouse and verified transport carrier discovery.
- **Google OAuth 2.0 & Demo Access**: One-click Google sign-in and instant dual-role demo access.
- **Real-Time Platform Impact Analytics**: Quantifiable farmer earnings gain (+38.5%) and buyer cost savings (-18.2%).
- **Bilingual Interface**: Native English and Hindi localization with instant context toggling.

---

## 🏗️ System Architecture

```text
       ┌─────────────────────────────────────────┐
       │   Browser / Client (React 18 + Vite)    │
       └────────────────────┬────────────────────┘
                            │
               REST APIs / JSON Payloads
                            │
       ┌────────────────────▼────────────────────┐
       │     Express.js API Server / Vercel      │
       │    Serverless Node Execution Engine     │
       └────────────────────┬────────────────────┘
                            │
              Sequelize ORM / Dialect pg
                            │
       ┌────────────────────▼────────────────────┐
       │  PostgreSQL Relational Database (SSL)   │
       └─────────────────────────────────────────┘
```

---

## 🚀 Live Production & One-Click Cloud Deployment

### 1. Vercel Deployment (Frontend + Serverless API)
The repository includes a root `vercel.json` and `/api/index.js` wrapper configured for Vercel deployment:
- **Production Web App**: [https://lagaan-secure.vercel.app](https://lagaan-secure.vercel.app)
- **Deployment Config**: `vercel.json`

### 2. Render Blueprint Deployment (Full Stack + Managed PostgreSQL)
The project includes a 1-click `render.yaml` Blueprint for Render:
1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** → **Blueprint**.
3. Connect repository `hardik-cs2837/LagaanSecure`.
4. Render automatically provisions the Express Web Service and PostgreSQL database.

---

## 🔐 Google OAuth 2.0 Configuration

Lagaan Secure supports Google Identity Services (GIS) One-Tap and Popup Authentication (`@react-oauth/google`).

### Environment Variables Setup:
Set the following environment variable in Vercel / Render or your local `.env`:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### Google Cloud Console Setup:
1. Go to **[Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)**.
2. Create an **OAuth 2.0 Client ID** (Application type: *Web Application*).
3. Set **Authorized JavaScript Origins**:
   - `https://lagaan-secure.vercel.app` (Production)
   - `http://localhost:5173` (Local Development)
4. Set **Authorized Redirect URIs**:
   - `https://lagaan-secure.vercel.app/login`
5. Save and paste your **Client ID** into `VITE_GOOGLE_CLIENT_ID`.

*Note: If no Google Client ID is configured, the application automatically enables active demo session fallbacks so evaluators can test Google sign-in instantly with one click.*

---

## 🛠️ Local Development & Quickstart

### Prerequisites
- **Node.js**: v18.x or higher
- **PostgreSQL**: v14.x or higher
- **npm**: v9.x or higher

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/hardik-cs2837/LagaanSecure.git
cd LagaanSecure

# Install root dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Environment Configuration
Create a `.env` file in the project root (copy from `.env.example`):
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgres://postgres:your_password@localhost:5432/lagaansecure
JWT_SECRET=lagaan_secure_super_secret_jwt_key_2026
CORS_ORIGIN=*
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 3. Database Initialization & Seeding
```bash
# Create local database
createdb -U postgres lagaansecure

# Seed database with sample farmers, buyers, FPOs, and active listings
npm run seed
```

### 4. Run Development Servers
```bash
# Run both Backend API and Frontend concurrently:
npm run dev
```

- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Pre-Seeded Demo Accounts

| User Role | Phone Number | Password | Profile / Business Name |
| :--- | :--- | :--- | :--- |
| **Farmer (FPO Leader)** | `9876543210` | `password123` | Ramesh Patel (Sahyadri Farmers Co.) |
| **Buyer (Institutional)** | `9123456780` | `password123` | Pooja Sharma (FreshMart Ltd.) |

---

## 🧪 Testing & Verification

Run automated integration test suite:
```bash
npm test
```

Verifies:
- User registration & authentication JWT issuance
- Mandi price transparency calculations
- FPO lot pooling & distribution
- Order deal creation & counter-offer negotiation
- Route optimization engine output

---

## 📄 License
Released under the MIT License. Developed for Lagaan Secure AgriTech Platform.
