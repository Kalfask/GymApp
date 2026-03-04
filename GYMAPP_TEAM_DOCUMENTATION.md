# 🏋️ GymApp - Complete Project Documentation

## Team Documentation v2.0
**Last Updated:** March 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Getting Started](#3-getting-started)
4. [Project Structure](#4-project-structure)
5. [Database Schema](#5-database-schema)
6. [API Routes Reference](#6-api-routes-reference)
7. [Authentication System](#7-authentication-system)
8. [Gamification System](#8-gamification-system)
9. [Frontend Guide](#9-frontend-guide)
10. [React Frontend](#10-react-frontend)
11. [Future Features (TODO)](#11-future-features-todo)
12. [Security Notes](#12-security-notes)
13. [Common Issues & Fixes](#13-common-issues--fixes)

---

## 1. Project Overview

### What is GymApp?

GymApp is a gym management system for personal trainers and their athletes. It allows trainers to create workout programs, and athletes to track their progress with gamification features.

### Core Features (Completed ✅)

| Feature | Description |
|---------|-------------|
| **Authentication** | JWT-based login/register with bcrypt password hashing |
| **Member Management** | Add, delete, renew memberships |
| **Workout Programs** | Create multi-day programs with exercises |
| **PDF Generation** | Auto-generate downloadable PDF workout plans |
| **Exercise Videos** | YouTube video library linked to exercises |
| **AI Tips** | Gemini AI-powered workout tips |
| **Gamification** | XP, levels, streaks, badges, leaderboard |

### Business Model (Future)

```
TRAINER (pays €5/month)
├── Gets unique token
├── Shares token with clients
├── Creates programs
└── Full dashboard access

ATHLETE (free)
├── Without trainer: Basic access
└── With trainer (via token): Full access
```

---

## 2. Tech Stack

### Backend

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web framework |
| Supabase | Database + Storage |
| JWT | Authentication tokens |
| bcrypt | Password hashing |
| PDFKit | PDF generation |
| Google Generative AI | AI tips (Gemini) |

### Frontend (Two Versions)

#### Vanilla JS (Original)
| Technology | Purpose |
|------------|---------|
| HTML/CSS/JS | Basic frontend |
| Fetch API | HTTP requests |
| localStorage | Token storage |

#### React (New - In Development) ✨
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite | Build tool |
| Tailwind CSS v4 | Styling |
| React Router | Page navigation (coming) |

### Database

| Service | Purpose |
|---------|---------|
| Supabase PostgreSQL | Main database |
| Supabase Storage | PDF file storage |

---

## 3. Getting Started

### Prerequisites

- Node.js (v18+)
- npm
- Git
- Supabase account (credentials will be shared)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/gymapp.git
cd gymapp

# 2. Install backend dependencies
cd server
npm install

# 3. Create .env file
cp .env.example .env
# Edit .env with the credentials (see below)

# 4. Start the server
npm start
# or for development with auto-reload:
npm run dev
```

### Environment Variables (.env)

```env
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIs...

# Authentication
JWT_SECRET=your_jwt_secret_key_here

# AI (Gemini)
GEMINI_API_KEY=your_gemini_api_key_here
```

**⚠️ IMPORTANT:** Never commit .env to Git! It's in .gitignore.

### Running the App

#### Option A: Vanilla JS Frontend
```bash
# Terminal 1: Start backend
cd server
npm start
# Server runs at http://localhost:3000

# Terminal 2: Open frontend
# Just open frontend/index.html in browser
# Or use Live Server extension in VS Code
```

#### Option B: React Frontend (New)
```bash
# Terminal 1: Start backend
cd server
npm start
# Server runs at http://localhost:3000

# Terminal 2: Start React dev server
cd frontend-react
npm run dev
# Frontend runs at http://localhost:5173
```

---

## 4. Project Structure

```
gymapp/
├── server/
│   ├── index.js          # Main server file (ALL routes here)
│   ├── package.json      # Dependencies
│   ├── .env              # Environment variables (DO NOT COMMIT)
│   └── .env.example      # Template for .env
│
├── frontend/             # Vanilla JS (Original)
│   ├── index.html        # Landing page
│   ├── login.html        # Login page
│   ├── register.html     # Registration page
│   ├── athlete.html      # Athlete dashboard
│   ├── coach.html        # Coach dashboard
│   ├── css/
│   │   └── style.css     # Shared styles
│   └── js/
│       ├── api.js        # All API functions
│       ├── athlete.js    # Athlete page logic
│       └── coach.js      # Coach page logic
│
├── frontend-react/       # React (New) ✨
│   ├── src/
│   │   ├── App.jsx       # Main component
│   │   ├── main.jsx      # Entry point
│   │   ├── index.css     # Tailwind imports
│   │   ├── api.js        # API functions (copy from frontend/js/)
│   │   ├── components/   # Reusable components
│   │   └── pages/        # Page components
│   ├── postcss.config.js # PostCSS config
│   ├── vite.config.js    # Vite config
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 5. Database Schema

### Tables Overview

```
members            - Users (athletes & coaches)
programs           - Workout programs
program_requests   - Program requests from athletes
exercise_videos    - YouTube video library
badges             - Available badges
member_badges      - Badges earned by members
workout_history    - Workout completion log
```

### members

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR | Unique email |
| password | VARCHAR | Hashed password (bcrypt) |
| name | VARCHAR | Full name |
| phone | VARCHAR | Phone number |
| role | VARCHAR | 'athlete' or 'coach' |
| plan | VARCHAR | 'monthly', '3-month', 'yearly', or NULL |
| start_date | TIMESTAMP | Membership start |
| end_date | TIMESTAMP | Membership end |
| xp | INTEGER | Experience points (default 0) |
| level | INTEGER | Current level 1-10 (default 1) |
| streak | INTEGER | Consecutive workout days (default 0) |
| last_workout_date | DATE | Last workout completion |
| total_workouts | INTEGER | Total workouts completed |
| videos_watched | INTEGER | Total videos watched |
| created_at | TIMESTAMP | Account creation date |

### programs

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| member_id | UUID | FK → members.id (CASCADE DELETE) |
| days | JSONB | Workout days and exercises |
| file_url | VARCHAR | PDF URL in Supabase Storage |
| created_at | TIMESTAMP | Creation date |

### program_requests

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| member_id | UUID | FK → members.id (CASCADE DELETE) |
| goal | VARCHAR | Fitness goal |
| level | VARCHAR | Fitness level |
| status | VARCHAR | 'pending' or 'completed' |
| created_at | TIMESTAMP | Request date |

### exercise_videos

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR | Exercise name |
| url | VARCHAR | YouTube URL |
| created_at | TIMESTAMP | Added date |

### badges

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR | Badge name |
| icon | VARCHAR | Emoji icon |
| description | TEXT | How to earn |
| requirement_type | VARCHAR | 'workouts', 'streak', 'level', 'videos' |
| requirement_value | INTEGER | Value needed to earn |

### member_badges

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| member_id | UUID | FK → members.id (CASCADE DELETE) |
| badge_id | UUID | FK → badges.id |
| earned_at | TIMESTAMP | When earned |

### Default Badges (Pre-populated)

| Name | Icon | Type | Value |
|------|------|------|-------|
| First Steps | 🌟 | workouts | 1 |
| On Fire | 🔥 | streak | 7 |
| Dedicated | 💪 | streak | 30 |
| Centurion | 💯 | workouts | 100 |
| Video Student | 📺 | videos | 10 |
| Rising Star | ⭐ | level | 5 |
| Elite | 👑 | level | 10 |

---

## 6. API Routes Reference

### Authentication

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/auth/register` | Create new account | No |
| POST | `/auth/login` | Login, get token | No |

#### POST /auth/register

```javascript
// Request
{
    "email": "user@email.com",
    "password": "password123",
    "name": "John Doe",
    "phone": "1234567890"
}

// Response
{ "message": "Registration successful" }
```

#### POST /auth/login

```javascript
// Request
{
    "email": "user@email.com",
    "password": "password123"
}

// Response
{
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "member": {
        "id": "uuid",
        "email": "user@email.com",
        "name": "John Doe",
        "role": "athlete"
    }
}
```

### Members

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/members` | Get all members | Yes |
| POST | `/members` | Add new member | Yes |
| DELETE | `/members/:id` | Delete member | Yes |
| GET | `/members/search/:email` | Find member by email | Yes |
| POST | `/members/:id/renew` | Renew membership | Yes |
| POST | `/members/:id/assign-plan` | Assign plan to new member | Yes |

### Programs

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/members/:id/request-program` | Request a program | Yes |
| GET | `/members/:id/request` | Get program request | Yes |
| POST | `/members/:id/create-program` | Create program + PDF | Yes |
| GET | `/members/:id/program` | Get member's program | Yes |
| GET | `/members/:id/download` | Download PDF | Yes |

### Exercise Videos

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/exercises` | Get all videos | No |
| POST | `/exercises` | Add new video | Yes |
| DELETE | `/exercises/:id` | Delete video | Yes |

### Gamification

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/members/:id/complete-workout` | Complete workout (+XP) | Yes |
| POST | `/members/:id/watch-video` | Watch video (+XP) | Yes |
| GET | `/members/:id/stats` | Get member stats | Yes |
| GET | `/leaderboard` | Get top 10 by XP | Yes |

### AI

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/ai/tips` | Get AI workout tips | Yes |

---

## 7. Authentication System

### How It Works

```
1. User registers → Password hashed with bcrypt → Saved to DB
2. User logs in → Password compared → JWT token created
3. Token stored in localStorage
4. Every API request sends token in header
5. Server middleware verifies token
6. If valid → Route executes
7. If invalid → 401/403 error
```

### JWT Token Structure

```javascript
// Token contains:
{
    id: "member-uuid",
    email: "user@email.com",
    role: "athlete",  // or "coach"
    iat: 1234567890,  // Issued at
    exp: 1234567890   // Expires (7 days)
}
```

### Frontend Token Usage

```javascript
// After login - save token
localStorage.setItem('authToken', token);
localStorage.setItem('user', JSON.stringify(member));

// For API requests - include header
headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
}

// Logout - clear storage
localStorage.removeItem('authToken');
localStorage.removeItem('user');
```

### Protected Routes

All routes except these require authentication:
- `/auth/login`
- `/auth/register`
- `/exercises` (GET only)
- `/test`

---

## 8. Gamification System

### XP System

| Action | XP Earned |
|--------|-----------|
| Complete workout | +50 |
| Watch exercise video | +10 |
| 7-day streak bonus | +100 |
| 30-day streak bonus | +500 |

### Levels

| Level | Title | XP Required |
|-------|-------|-------------|
| 1 | Beginner | 0 |
| 2 | Rookie | 100 |
| 3 | Regular | 300 |
| 4 | Committed | 600 |
| 5 | Athlete | 1000 |
| 6 | Advanced | 1500 |
| 7 | Expert | 2500 |
| 8 | Elite | 4000 |
| 9 | Champion | 6000 |
| 10 | Master | 10000 |

### Streak Logic

```javascript
// When completing workout:
if (lastWorkout === yesterday) {
    streak = streak + 1;  // Continue streak
} else if (lastWorkout === today) {
    // Already worked out today - no XP
} else {
    streak = 1;  // Reset streak
}
```

### Badge Awarding

Badges are checked automatically after:
- Completing a workout
- Watching a video

```javascript
// checkAndAwardBadges() checks:
// - Is requirement met?
// - Does member already have badge?
// - If met AND doesn't have → Award badge
```

### Helper Function

```javascript
function calculateLevel(xp) {
    const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2500, 4000, 6000, 10000];
    for (let i = 0; i < levelThresholds.length - 1; i++) {
        if (xp < levelThresholds[i + 1])
            return i + 1;
    }
    return 10;
}
```

---

## 9. Frontend Guide (Vanilla JS)

### Pages

| Page | Purpose | Access |
|------|---------|--------|
| index.html | Landing page | Public |
| login.html | Login form | Public |
| register.html | Registration form | Public |
| athlete.html | Athlete dashboard | Athletes |
| coach.html | Coach dashboard | Coaches |

### api.js Functions

```javascript
// Auth
register(email, password, name, phone)
login(email, password)
logout()
isLoggedIn()
getCurrentUser()

// Members
getMembers()
addMember(name, email, phone, plan)
deleteMember(id)
searchMember(email)
renewMember(id, newplan)
assignPlan(memberId, plan)

// Programs
requestProgram(memberId, goal, level)
createProgram(memberId, days)
getProgram(memberId)
getMemberRequest(memberId)
downloadProgram(memberId)

// Videos
getExerciseVideos()
addExerciseVideo(name, url)
deleteExerciseVideo(id)

// Gamification
getStats(memberId)
getLeaderboard()
completeWorkout(memberId)
watchVideo(memberId)

// AI
getAITips(memberName, goal, level, exercises)
```

### Auth Header Helper

```javascript
function getAuthToken() {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}
```

---

## 10. React Frontend

### Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI framework |
| Vite | 5.x | Build tool (fast!) |
| Tailwind CSS | 4.x | Utility-first styling |

### Setup

```bash
cd frontend-react
npm install
npm run dev
```

Opens at `http://localhost:5173`

### Tailwind CSS v4 Setup

**postcss.config.js:**
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

**src/index.css:**
```css
@import "tailwindcss";
```

### Project Structure (Planned)

```
frontend-react/src/
├── api.js              # API functions (same as vanilla)
├── App.jsx             # Main app + routing
├── main.jsx            # Entry point
├── index.css           # Tailwind
├── components/         # Reusable components
│   ├── Button.jsx
│   ├── Card.jsx
│   ├── Input.jsx
│   ├── Navbar.jsx
│   └── StatsCard.jsx
└── pages/              # Page components
    ├── Login.jsx
    ├── Register.jsx
    ├── AthleteDashboard.jsx
    └── CoachDashboard.jsx
```

### Key Concepts

```jsx
// Component
function MemberCard({ name, level }) {
    return (
        <div className="bg-slate-800 p-4 rounded-lg">
            <h3 className="text-sky-400">{name}</h3>
            <p>Level {level}</p>
        </div>
    );
}

// State
const [xp, setXP] = useState(0);

// Effect (load data)
useEffect(() => {
    getStats(memberId).then(setStats);
}, []);

// Event
<button onClick={handleClick}>Click</button>
```

### Tailwind Classes Reference

```jsx
// Colors
"bg-slate-900"      // Dark background
"bg-slate-800"      // Card background
"text-sky-400"      // Primary text
"text-amber-400"    // Accent text

// Layout
"flex items-center justify-center"
"grid grid-cols-2 gap-4"
"min-h-screen"

// Spacing
"p-4" "px-6" "py-3"   // Padding
"m-4" "mx-auto"       // Margin

// Typography
"text-4xl font-bold"
"text-sm text-slate-400"

// Effects
"rounded-lg"
"shadow-lg"
"hover:bg-sky-400"
"transition"
```

---

## 11. Future Features (TODO)

### 💬 Chat System (Priority 1)

**Tables Needed:**
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES members(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES members(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Routes:**
```
POST /messages              → Send message
GET /messages/:oderId  → Get conversation
GET /messages/unread        → Count unread
PUT /messages/:id/read      → Mark as read
```

---

### 📝 Workout Logging (Priority 2)

**Tables Needed:**
```sql
CREATE TABLE workout_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    exercise_name VARCHAR(100),
    sets INTEGER,
    reps INTEGER,
    weight DECIMAL(5,2),
    logged_at TIMESTAMP DEFAULT NOW()
);
```

**Routes:**
```
POST /members/:id/log-workout
GET /members/:id/workout-history
GET /members/:id/personal-records
```

---

### ⚖️ Weight/Body Tracking (Priority 3)

**Tables Needed:**
```sql
CREATE TABLE weight_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    weight DECIMAL(5,2),
    logged_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE body_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    chest DECIMAL(5,2),
    waist DECIMAL(5,2),
    arms DECIMAL(5,2),
    logged_at TIMESTAMP DEFAULT NOW()
);
```

---

### 📊 Trainer Dashboard (Priority 4)

- Overview of all athletes
- Who trained this week
- Inactive athletes alert
- Quick stats

---

### 📸 Progress Photos (Priority 5)

**Tables Needed:**
```sql
CREATE TABLE progress_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    photo_url VARCHAR(500),
    notes TEXT,
    taken_at TIMESTAMP DEFAULT NOW()
);
```

---

### 🤖 AI Form Checker (Priority 6)

- Upload photo/video of exercise
- Gemini Vision API analyzes form
- Returns score + feedback

---

### 🔗 Trainer-Token System (Priority 7)

**Tables Needed:**
```sql
CREATE TABLE trainers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    name VARCHAR(100),
    token VARCHAR(50) UNIQUE,
    plan VARCHAR(20),
    plan_expires DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE members ADD COLUMN trainer_id UUID REFERENCES trainers(id);
```

---

### 🚀 Deployment

**Backend: Railway or Render**
**Frontend: Vercel or Netlify**

Update API URL in api.js:
```javascript
const API = 'https://your-app.railway.app';
```

---

## 12. Security Notes

### ⚠️ Important Rules

1. **Never commit .env** - Contains secrets
2. **Never expose passwords** - Always delete before response:
   ```javascript
   delete member.password;
   ```
3. **Always use HTTPS in production**
4. **JWT secret should be long and random**
5. **Supabase uses service_role key** - Never expose to frontend

### Row Level Security (RLS)

RLS is enabled on all tables. The backend uses service_role key which bypasses RLS.

### Password Security

- Passwords hashed with bcrypt (10 salt rounds)
- Never stored as plain text
- Never sent in responses

---

## 13. Common Issues & Fixes

### "No token provided"
**Cause:** Request missing auth header
**Fix:** Check `getAuthToken()` is being called

### "Invalid token"
**Cause:** Token expired or wrong secret
**Fix:** Login again, check JWT_SECRET matches

### CORS Error
**Cause:** Frontend on different port
**Fix:** `app.use(cors())` already in server

### PDF Download Fails
**Cause:** Auth header not sent with direct link
**Fix:** Use `downloadProgram()` function

### Tailwind Classes Not Working
**Cause:** Wrong setup
**Fix:** Check postcss.config.js and index.css

### React Build Error
**Fix:** Delete node_modules, run `npm install` again

---

## Quick Commands

```bash
# Backend
cd server && npm start

# Frontend (Vanilla)
# Open frontend/index.html

# Frontend (React)
cd frontend-react && npm run dev

# Git
git add .
git commit -m "message"
git push
```

---

*Documentation v2.0 - Updated for React + Tailwind CSS*
