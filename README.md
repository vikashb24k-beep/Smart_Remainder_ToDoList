# Smart Todo Reminder App (MERN)

A production-ready MERN app with JWT auth, per-user tasks, cron-based email reminders, browser notifications, dark mode, and responsive Tailwind UI.

## Tech Stack
- Frontend: React (Hooks + Context API + React Router)
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT + bcrypt
- Scheduler: node-cron (runs every minute)
- Email: Nodemailer (Gmail SMTP)
- UI: Tailwind CSS + react-hot-toast

## Folder Structure

```text
backend/
  controllers/
  models/
  routes/
  middleware/
  utils/
  scheduler.js
  server.js

frontend/
  src/
    context/
    pages/
    components/
    services/
    App.jsx
```

## Environment Variables

### Backend (`backend/.env`)
Use `backend/.env.example` as a template.

```env
MONGO_URI=mongodb://127.0.0.1:27017/smart_reminder
JWT_SECRET=replace_with_a_strong_secret
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
REMINDER_TIMEZONE=Asia/Kolkata
REMINDER_GRACE_MINUTES=2
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
Use `frontend/.env.example` as a template.

```env
VITE_API_URL=http://localhost:5000
```

## Install

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Run (Development)

Open 2 terminals.

### Terminal 1: Backend

```bash
cd backend
npm run dev
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

## Main API Routes

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Tasks (Protected)
- `POST /api/tasks`
- `GET /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

## Notes
- Cron scheduler checks every minute in `REMINDER_TIMEZONE` and supports a short catch-up window using `REMINDER_GRACE_MINUTES` (useful after deploy restarts).
- Duplicate email sends are prevented using `lastNotified`.
- Each user can manage only their own tasks.
- Browser notifications can be enabled from dashboard.
