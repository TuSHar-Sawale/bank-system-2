# 🏦 NexBank – Full Stack Banking System

A complete banking system built with React, Node.js/Express, and MongoDB.  
Built as a MCAA student project.

---

## 📁 Project Structure

```
banking-app/
├── backend/          ← Node.js + Express API
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── server.js
│   │   └── seedAdmin.js
│   ├── package.json
│   └── .env.example
│
└── frontend/         ← React App
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── context/
    │   ├── utils/
    │   ├── App.js
    │   └── index.css
    └── package.json
```

---

## 🚀 DEPLOYMENT GUIDE (Step by Step)

---

### STEP 1 — Set Up MongoDB Atlas (Free Database)

1. Go to https://mongodb.com/atlas and click **"Try Free"**
2. Sign up / log in
3. Click **"Create a cluster"** → choose **FREE (M0)** → any region → click **"Create"**
4. In the left sidebar, click **"Database Access"**
   - Click **"Add New Database User"**
   - Set username: `bankAdmin`, password: something strong (save it!)
   - Role: **"Read and Write to any database"** → click **Add User**
5. Click **"Network Access"** in sidebar
   - Click **"Add IP Address"** → click **"Allow Access from Anywhere"** → Confirm
6. Click **"Databases"** → click **"Connect"** on your cluster
   - Choose **"Connect your application"**
   - Copy the connection string. It looks like:
     ```
     mongodb+srv://bankAdmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password
   - Add your database name: change `/?retryWrites` to `/bankingdb?retryWrites`
   - Final string looks like:
     ```
     mongodb+srv://bankAdmin:yourpassword@cluster0.xxxxx.mongodb.net/bankingdb?retryWrites=true&w=majority
     ```
   - **Save this string — you'll need it twice below**

---

### STEP 2 — Deploy Backend on Render (Free)

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   # Create a new repo on github.com, then:
   git remote add origin https://github.com/YOUR_USERNAME/banking-app.git
   git push -u origin main
   ```

2. Go to https://render.com and sign in with GitHub

3. Click **"New +"** → **"Web Service"**

4. Connect your GitHub repo → select it

5. Fill in the settings:
   - **Name:** `nexbank-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

6. Scroll down to **"Environment Variables"** and add:
   | Key | Value |
   |-----|-------|
   | `MONGO_URI` | your MongoDB Atlas connection string |
   | `JWT_SECRET` | any random long string e.g. `mysecretkey123abc456xyz` |
   | `NODE_ENV` | `production` |

7. Click **"Create Web Service"**

8. Wait 2-3 minutes for it to deploy. You'll get a URL like:
   ```
   https://nexbank-backend.onrender.com
   ```
   **Copy this URL — you need it for Step 3**

9. **Seed the Admin user** (do this once):
   - In your Render dashboard, go to your service → click **"Shell"** tab
   - Run: `node src/seedAdmin.js`
   - You'll see: `✅ Admin created: admin@bank.com / Admin@1234`

---

### STEP 3 — Deploy Frontend on Vercel (Free)

1. Go to https://vercel.com and sign in with GitHub

2. Click **"New Project"** → import your GitHub repo

3. Configure project:
   - **Root Directory:** click **Edit** → type `frontend`
   - **Framework Preset:** Create React App (auto-detected)
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

4. Scroll to **"Environment Variables"** and add:
   | Key | Value |
   |-----|-------|
   | `REACT_APP_API_URL` | `https://nexbank-backend.onrender.com/api` |
   
   *(Replace with your actual Render URL from Step 2)*

5. Click **"Deploy"**

6. Wait ~2 minutes. You'll get a URL like:
   ```
   https://nexbank-frontend.vercel.app
   ```

---

### STEP 4 — Test Your App

1. Open your Vercel URL in the browser
2. Register a new user account
3. **Login as Admin:**
   - Email: `admin@bank.com`
   - Password: `Admin@1234`
4. Go to **Admin Panel → Users** tab → click **"Approve"** next to your new user
5. Log out, then log in as your new user
6. Test deposit, withdraw, transfer!

---

## 💻 Run Locally (Development)

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
node src/seedAdmin.js   # Run ONCE to create admin
npm run dev             # Starts on http://localhost:5000
```

### Frontend
```bash
cd frontend
cp .env.example .env
# Edit .env: REACT_APP_API_URL=http://localhost:5000/api
npm install
npm start               # Starts on http://localhost:3000
```

---

## 🔑 Default Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@bank.com | Admin@1234 |
| Customer | Register yourself | Your password |

---

## 🧩 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register new user | ❌ |
| POST | /api/auth/login | Login | ❌ |
| GET | /api/auth/me | Get current user | ✅ |
| GET | /api/account | Get my account | ✅ |
| PUT | /api/account/profile | Update profile | ✅ |
| POST | /api/transactions/deposit | Deposit money | ✅ |
| POST | /api/transactions/withdraw | Withdraw money | ✅ |
| POST | /api/transactions/transfer | Transfer money | ✅ |
| GET | /api/transactions | Get my transactions | ✅ |
| GET | /api/admin/stats | Dashboard stats | Admin |
| GET | /api/admin/users | All users | Admin |
| PUT | /api/admin/approve/:userId | Approve user | Admin |
| PUT | /api/admin/freeze/:accountId | Freeze/unfreeze | Admin |
| GET | /api/admin/transactions | All transactions | Admin |

---

## ⚙️ Tech Stack
- **Frontend:** React 18, React Router 6, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Auth:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Hosting:** Vercel (frontend) + Render (backend) + MongoDB Atlas (DB)
