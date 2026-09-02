# Lagaan Secure

Lagaan Secure is a secure, production-ready AgriTech platform that connects farmers and FPOs directly with institutional buyers, eliminating multi-layered intermediary commissions. It enables fair price discovery, AI-driven demand forecasting, institutional bulk procurement, and multi-stop logistics routing.

## 🌟 Features

- **Direct Digital Marketplace**: Trade crops directly without agent commissions.
- **AI Demand Forecasting**: Forward-looking demand curves and sell-timing advice.
- **Smart Logistics Routing**: Multi-stop TSP routing for cost-efficient freight consolidation.
- **FPO Aggregation**: Pool member harvests into institutional master lots.
- **Bulk Procurement Tenders**: Post institutional purchasing requirements.
- **AI Farm Copilot**: Multilingual agricultural intelligence with fallback support.
- **Impact Analytics**: Live dashboards for farmer earnings and buyer savings.
- **Bilingual Interface**: Seamlessly switch between English and Hindi.

## 🏗️ Architecture

Browser → React (Vite) → Express API → PostgreSQL

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Recharts, i18next
- **Backend**: Node.js, Express.js, Sequelize ORM
- **Database**: PostgreSQL
- **Security**: JWT stateless sessions, bcryptjs password hashing, Helmet, CORS
- **AI Integration**: Google Gemini / OpenAI (optional, with deterministic fallback)

---

# 📖 Zero-Experience Start Guide

This guide assumes you have never seen this project before. Follow these steps exactly to run the application on your computer.

### STEP 1 — PREREQUISITES

You need three free tools installed on your computer:

1. **Node.js (v18 or higher)**
   - **What it is**: The engine that runs the JavaScript backend and frontend.
   - **How to install**: Go to [nodejs.org](https://nodejs.org/), download the "LTS" version, and install it.
   - **Verify**: Open a terminal (Command Prompt or PowerShell) and type `node --version`. It should print a version number.

2. **PostgreSQL (v14 or higher)**
   - **What it is**: The relational database that securely stores all users and transactions.
   - **How to install**: Go to [postgresql.org](https://www.postgresql.org/download/), download the installer for your OS, and install it. **Remember the password you set for the default `postgres` user.**
   - **Verify**: Open a terminal and type `psql -U postgres`. It should ask for your password. Type `\q` to exit.

3. **Git**
   - **What it is**: A tool to download the project code.
   - **How to install**: Go to [git-scm.com](https://git-scm.com/), download and install.
   - **Verify**: Type `git --version` in your terminal.

---

### STEP 2 — GET THE PROJECT

Open your terminal and run:

```bash
git clone https://github.com/your-username/kisaanconnect.git
cd Lagaan Secure
```

If you use VS Code, you can open the project folder by typing:
```bash
code .
```

---

### STEP 3 — INSTALL DEPENDENCIES

You need to download the required code libraries for both the backend and frontend.

Run these exact commands in your terminal:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

---

### STEP 4 — CREATE POSTGRESQL DATABASE

You need to create a blank database for the application to use.

1. Open **pgAdmin 4** (installed with PostgreSQL) or use the `psql` command line tool.
2. Log in with your `postgres` password.
3. If using `psql`, run this exact command:
   ```sql
   CREATE DATABASE kisaanconnect;
   ```
4. If using pgAdmin, right-click on **Databases** → **Create** → **Database**, name it `kisaanconnect`, and click Save.

---

### STEP 5 — CREATE .ENV

The `.env` file holds your local configuration and passwords.

1. Find the `.env.example` file in the main folder.
2. Copy it and rename the copy to `.env`.
3. Open `.env` and configure your database settings:

| Variable | Required | Purpose | Example |
| :--- | :--- | :--- | :--- |
| `PORT` | Yes | Backend server port | `5000` |
| `DATABASE_URL` | Yes | Connection to PostgreSQL | `postgres://postgres:your_password@localhost:5432/kisaanconnect` |
| `JWT_SECRET` | Yes | Secures user login tokens | `my_secure_secret_key` |
| `AI_API_KEY` | Optional | Powers real AI responses | `your_gemini_api_key_here` |

*Note: Replace `your_password` in the `DATABASE_URL` with your actual PostgreSQL password.*

---

### STEP 6 — GOOGLE LOGIN

Google OAuth allows users to log in with their Google accounts.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project and configure the OAuth Consent Screen.
3. Create OAuth 2.0 Client IDs.
4. Set the Authorized redirect URI to `http://localhost:5000/api/auth/google/callback`.
5. Copy your **Client ID** and **Client Secret** into your `.env` file (`GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`).

**Don't have time to set this up?** No problem. Standard email/password registration and login work perfectly without it.

---

### STEP 7 — DATABASE MIGRATION & SEEDING

Now that your database is created and configured, let's build the tables and fill them with realistic demo data.

Run this exact command in your terminal:

```bash
npm run seed
```

**What this does**: It creates all tables (Users, Deals, Listings) and automatically populates 4 farmers, 3 buyers, 1 FPO, and active listings so you can test the app immediately.

---

### STEP 8 — START APPLICATION

You will need TWO terminal windows running simultaneously.

**TERMINAL 1 — BACKEND**
```bash
npm run dev
```

**TERMINAL 2 — FRONTEND**
Open a new terminal window, navigate to the `client` folder, and run:
```bash
cd client
npm run dev
```

---

### STEP 9 — OPEN APPLICATION

Open your web browser and go to:

* **Frontend**: [http://localhost:5173](http://localhost:5173)
* **Backend API Health**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

### STEP 10 — FIRST LOGIN

Since we ran the seed script, you have ready-to-use demo accounts!

**Demo Farmer Account (FPO Leader)**
* **Phone**: `9822011223`
* **Password**: `password123`

**Demo Buyer Account (Institutional)**
* **Phone**: `9820012345`
* **Password**: `password123`

You can also click "Register as Farmer" on the landing page to create a brand new account.

---

### STEP 11 — 5-MINUTE PRODUCT DEMO

Want to see how it works? Follow this flow:

1. **Farmer**: Log in using `9822011223` / `password123`.
2. View the **AI Demand Forecast** and your **Best Matched Buyers**.
3. Go to **Add Lot** and create a Grade A listing for Tomatoes.
4. **Buyer**: Log out, then log in using `9820012345` / `password123`.
5. Browse the **Marketplace**, find the Tomato listing, and click **Make Offer**.
6. **Farmer**: Log back in, go to **Deals**, and **Counter** the offer.
7. **Buyer**: Log in, accept the counteroffer, and schedule **Logistics**.
8. View the final **Printable Tax Invoice** and the **Impact Analytics Dashboard**.

---

### STEP 12 — TROUBLESHOOTING

* **"npm is not recognized as an internal or external command"**: You haven't installed Node.js, or you need to restart your terminal after installing it.
* **"password authentication failed for user postgres"**: You typed the wrong PostgreSQL password in your `.env` file's `DATABASE_URL`.
* **"database kisaanconnect does not exist"**: You forgot to run `CREATE DATABASE kisaanconnect;` (Step 4).
* **"Cannot find module 'express'"**: You forgot to run `npm install` in the root folder (Step 3).

---

### STEP 13 — WINDOWS NOTES

* Use **PowerShell** or **Git Bash** for running terminal commands.
* If a script command fails on Windows, ensure you are running `npm run` from the correct directory (`Lagaan Secure` for backend, `Lagaan Secure/client` for frontend).

---

### STEP 14 — PROJECT STRUCTURE

```text
Lagaan Secure/
├── client/              → React frontend code
│   ├── src/components/  → Reusable UI widgets
│   ├── src/pages/       → Major screens (Dashboards, Marketplace)
│   └── src/i18n/        → English & Hindi translations
├── server/              → Node.js backend code
│   ├── models/          → PostgreSQL database tables
│   ├── routes/          → API endpoints
│   ├── services/        → Business logic (AI, Routing, Matching)
│   └── scripts/         → Database seeding scripts
├── .env.example         → Configuration template
└── package.json         → Project commands
```

---

### STEP 15 — COMMAND REFERENCE

| Command | Folder | Purpose |
| :--- | :--- | :--- |
| `npm install` | Root & Client | Installs dependencies |
| `npm run seed` | Root | Creates database tables and demo data |
| `npm run dev` | Root | Starts backend API server |
| `npm run dev` | Client | Starts frontend React server |
| `npm test` | Root | Runs all automated integration tests |

---

### STEP 16 — PRODUCTION DEPLOYMENT

When you are ready to deploy to the internet (e.g., Render, Railway, Vercel):

1. **Set Environment Variables**: In your hosting provider's dashboard, set `NODE_ENV=production`, `DATABASE_URL` (cloud database), `JWT_SECRET`, and `CORS_ORIGIN`.
2. **Build the Frontend**: Run `cd client && npm run build`. This generates optimized static files in `client/dist`.
3. **Start the Server**: Run `node server/server.js`. In production, Express automatically serves the built React frontend files.

---

### FIVE THINGS TO REMEMBER

1. Install Node.js and PostgreSQL.
2. Create the `kisaanconnect` database.
3. Copy `.env.example` to `.env` and update `DATABASE_URL`.
4. Run `npm install` and `npm run seed`.
5. Open two terminals, run `npm run dev` in the root and in the `client` folder, then open `http://localhost:5173`.
