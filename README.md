# 🌾 KisaanConnect

**Direct Farmer-to-Buyer Agricultural Marketplace with Live Mandi Price Transparency**

KisaanConnect solves two critical problems in Indian agriculture:
1. **Farmers lack market access and price discovery** — they depend on local agents who offer below-market rates.
2. **Multiple intermediaries** reduce farmer earnings while increasing consumer prices.

## ✨ Key Features

- **Intermediary Markup Calculator** — Farmers enter a local agent's offer and instantly see how it compares to live mandi prices, with a clear visual showing how much they could save by selling directly.
- **Live Mandi Prices** — Real-time data from Agmarknet/data.gov.in, with mock fallback for offline demos.
- **Direct Deal Flow** — Buyers browse listings, make offers, negotiate, and close deals — no middlemen.
- **AI Fair-Price Advisor** — Conversational chatbot that explains whether an offer is fair (rule-based, ready for LLM upgrade).
- **Bilingual UI** — English and Hindi, with i18next.
- **Mobile-First Design** — Built for farmers using smartphones.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | PostgreSQL + Sequelize ORM |
| Auth | JWT (farmer/buyer roles) |
| Charts | Recharts |
| i18n | i18next |
| External API | Agmarknet (data.gov.in) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd KisanConnect
npm run install:all

# 2. Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# 3. Create database
createdb kisaanconnect

# 4. Run migrations
npm run db:migrate

# 5. Start development servers
npm run dev
```

The backend runs on `http://localhost:5000` and the frontend on `http://localhost:5173`.

## 📁 Project Structure

```
KisanConnect/
├── server/              # Express backend
│   ├── config/          # Database config
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── middleware/       # Auth, validation, error handling
│   ├── services/        # Business logic
│   ├── jobs/            # Scheduled tasks (price refresh)
│   └── data/            # Mock price data
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route pages
│   │   ├── context/     # React context (auth, notifications)
│   │   ├── hooks/       # Custom hooks
│   │   ├── i18n/        # Translations (en, hi)
│   │   └── services/    # API client
│   └── index.html
├── .env.example
└── package.json
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/listings | Browse listings (with filters) |
| POST | /api/listings | Create listing (farmer) |
| GET | /api/prices/:commodity | Get mandi prices |
| POST | /api/listings/:id/markup-check | Check intermediary markup |
| POST | /api/deals | Make an offer |
| PATCH | /api/deals/:id | Accept/reject/counter |
| GET | /api/notifications/:userId | Get notifications |
| POST | /api/advisor/explain | AI fair-price explanation |
