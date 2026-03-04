# 🏋️ GymApp

A gym management system for personal trainers and their athletes.

![Version](https://img.shields.io/badge/version-2.0-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38BDF8)
![Node](https://img.shields.io/badge/Node.js-18+-339933)

---

## ✨ Features

- 🔐 **Authentication** - JWT-based secure login/register
- 👥 **Member Management** - Add, edit, delete members
- 📋 **Workout Programs** - Create custom programs + PDF generation
- 🎬 **Exercise Library** - YouTube video tutorials
- 🤖 **AI Coach Tips** - Personalized tips powered by Gemini AI
- 🎮 **Gamification** - XP, levels, streaks, badges, leaderboard

---

## 🛠 Tech Stack

### Backend
- Node.js + Express
- Supabase (PostgreSQL + Storage)
- JWT + bcrypt

### Frontend
- React 18 + Vite
- Tailwind CSS v4
- *(Original vanilla JS version also available)*

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm
- Supabase account

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/gymapp.git
cd gymapp

# Install backend
cd server
npm install

# Create .env file
cp .env.example .env
# Edit .env with your credentials

# Start backend
npm start
```

### Running React Frontend

```bash
cd frontend-react
npm install
npm run dev
```

Opens at `http://localhost:5173`

---

## 📁 Project Structure

```
gymapp/
├── server/              # Backend (Express + Supabase)
├── frontend/            # Original vanilla JS
├── frontend-react/      # New React + Tailwind
└── README.md
```

---

## 🔑 Environment Variables

Create `.env` in `/server`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_key
```

---

## 📖 Documentation

See [GYMAPP_TEAM_DOCUMENTATION.md](./GYMAPP_TEAM_DOCUMENTATION.md) for:
- Complete API reference
- Database schema
- Authentication guide
- Gamification system
- Future features

---

## 🎮 Gamification

| Level | Title | XP Required |
|-------|-------|-------------|
| 1 | Beginner | 0 |
| 2 | Rookie | 100 |
| 3 | Regular | 300 |
| 5 | Athlete | 1000 |
| 10 | Master | 10000 |

**Badges:** 🌟 First Steps • 🔥 On Fire • 💪 Dedicated • 👑 Elite

---

## 🔮 Coming Soon

- [ ] 💬 Chat System
- [ ] 📝 Workout Logging
- [ ] ⚖️ Progress Tracking
- [ ] 📸 Progress Photos
- [ ] 🤖 AI Form Checker
- [ ] 🔗 Trainer-Athlete Token System

---

## 👥 Team

Built as a thesis project.

---

## 📄 License

MIT License
