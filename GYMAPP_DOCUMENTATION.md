# 🏋️ GymApp - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [Environment Variables](#environment-variables)
6. [Authentication System](#authentication-system)
7. [API Routes Reference](#api-routes-reference)
8. [Frontend Guide](#frontend-guide)
9. [Common Patterns](#common-patterns)
10. [Troubleshooting](#troubleshooting)
11. [Future Features](#future-features)
12. [Deployment Guide](#deployment-guide)

---

## Project Overview

GymApp is a full-stack gym management application for coaches and athletes.

### Features Completed ✅
- Member management (CRUD operations)
- Subscription tracking (monthly, 3-month, yearly)
- Program requests from athletes
- Program creation by coaches
- PDF generation with cloud storage (Supabase Storage)
- Exercise video library (YouTube embed)
- AI-powered workout tips (Google Gemini API)
- Real authentication with JWT tokens
- Password hashing with bcrypt

### User Roles
| Role | Can Do |
|------|--------|
| Coach | Add members, create programs, manage videos, see all data |
| Athlete | Login, view program, request program, get AI tips, watch videos |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage (PDFs) |
| AI | Google Gemini API |
| PDF | PDFKit |
| Auth | bcrypt + JWT |

### NPM Packages
```json
{
  "dependencies": {
    "express": "^4.x",
    "cors": "^2.x",
    "@supabase/supabase-js": "^2.x",
    "@google/generative-ai": "^0.x",
    "pdfkit": "^0.x",
    "bcrypt": "^5.x",
    "jsonwebtoken": "^9.x",
    "dotenv": "^16.x"
  }
}
```

---

## Project Structure

```
gymapp/
├── server/
│   ├── index.js          # Main backend file (all routes)
│   ├── package.json      # Dependencies
│   ├── .env              # Environment variables (NOT in git)
│   └── programs/         # (Legacy - PDFs now in cloud)
│
├── frontend/
│   ├── index.html        # Landing page
│   ├── coach.html        # Coach dashboard
│   ├── athlete.html      # Athlete dashboard
│   └── js/
│       ├── api.js        # API calls
│       ├── coach.js      # Coach page logic
│       └── athlete.js    # Athlete page logic
│
├── .gitignore            # Ignores .env, node_modules
├── README.md             # Project readme
└── PROJECT_PLAN.md       # Feature planning
```

---

## Database Schema

### Supabase Tables

#### 1. members
```sql
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),                    -- Hashed with bcrypt
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(20) DEFAULT 'athlete',       -- 'athlete' or 'coach'
    plan VARCHAR(20),                         -- 'monthly', '3-month', 'yearly'
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    xp INTEGER DEFAULT 0,                     -- For future gamification
    level INTEGER DEFAULT 1,
    streak INTEGER DEFAULT 0,
    last_workout_date DATE,
    goal_weight DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. programs
```sql
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    days JSONB NOT NULL,                      -- Array of workout days
    file_url VARCHAR(500),                    -- Supabase Storage URL
    filename VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. program_requests
```sql
CREATE TABLE program_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    goal VARCHAR(100),
    level VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',     -- 'pending' or 'completed'
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. exercise_videos
```sql
CREATE TABLE exercise_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,                -- YouTube URL
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Supabase Storage
- Bucket: `programs` (public)
- Contains: PDF workout programs
- URL format: `https://[project].supabase.co/storage/v1/object/public/programs/[filename]`

---

## Environment Variables

Create `server/.env`:

```env
# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_public_key

# JWT Secret (make up any random string)
JWT_SECRET=your_super_secret_jwt_key_2024
```

### Getting API Keys

| Service | How to Get |
|---------|------------|
| Gemini | https://makersuite.google.com/app/apikey |
| Supabase URL | Project Settings → API → Project URL |
| Supabase Key | Project Settings → API → anon public |

---

## Authentication System

### How It Works

```
REGISTER:
1. User sends: email, password, name
2. Server hashes password with bcrypt
3. Server saves to database
4. Server returns success

LOGIN:
1. User sends: email, password
2. Server finds user by email
3. Server compares password with bcrypt
4. If match → Create JWT token
5. Server returns token + user info

PROTECTED ROUTES:
1. Frontend sends: Authorization: Bearer <token>
2. Middleware extracts token
3. Middleware verifies with jwt.verify()
4. If valid → Continue to route
5. If invalid → Return 401/403
```

### Backend Code

#### Password Hashing
```javascript
const bcrypt = require('bcrypt');

// Hash (when registering)
const hashedPassword = await bcrypt.hash(password, 10);

// Compare (when logging in)
const match = await bcrypt.compare(password, user.password);
```

#### JWT Token
```javascript
const jwt = require('jsonwebtoken');

// Create token (when logging in)
const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
);

// Verify token (in middleware)
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

#### Auth Middleware
```javascript
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  // { id, email, role }
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
}
```

#### Global Middleware (Apply to All Routes)
```javascript
const publicRoutes = ['/auth/login', '/auth/register', '/exercises'];

app.use((req, res, next) => {
    if (publicRoutes.some(route => req.path.startsWith(route))) {
        return next();  // Public route - skip auth
    }
    authenticateToken(req, res, next);  // Protected route - check auth
});
```

### Frontend Code

#### Save Token (after login)
```javascript
localStorage.setItem('token', data.token);
localStorage.setItem('user', JSON.stringify(data.member));
```

#### Send Token (with requests)
```javascript
const token = localStorage.getItem('token');

fetch('/members/123/program', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
});
```

#### Check If Logged In
```javascript
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}
```

#### Logout
```javascript
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}
```

---

## API Routes Reference

### Authentication Routes (Public)

#### POST /auth/register
Create new account.

**Request:**
```javascript
fetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'user@email.com',
        password: 'password123',
        name: 'John Doe',
        phone: '123456789'
    })
})
```

**Response:**
```json
{ "message": "Registration successful" }
```

#### POST /auth/login
Login and get token.

**Request:**
```javascript
fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'user@email.com',
        password: 'password123'
    })
})
```

**Response:**
```json
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

---

### Member Routes (Protected)

#### GET /members
Get all members with programs and requests (JOIN query).

**Request:**
```javascript
fetch('/members', {
    headers: { 'Authorization': `Bearer ${token}` }
})
```

**Response:**
```json
[
    {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@email.com",
        "plan": "monthly",
        "status": "active",
        "daysLeft": 25,
        "program": { "days": [...], "fileUrl": "..." },
        "programRequest": { "goal": "strength", "status": "pending" }
    }
]
```

#### POST /members
Add new member (coach action).

**Request:**
```javascript
fetch('/members', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        name: 'Jane Doe',
        email: 'jane@email.com',
        phone: '987654321',
        plan: 'monthly'
    })
})
```

#### GET /members/search/:email
Find member by email (for athlete login).

**Request:**
```javascript
fetch(`/members/search/${email}`, {
    headers: { 'Authorization': `Bearer ${token}` }
})
```

#### DELETE /members/:id
Delete a member.

**Request:**
```javascript
fetch(`/members/${memberId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
})
```

#### POST /members/:id/renew
Renew membership with new plan.

**Request:**
```javascript
fetch(`/members/${memberId}/renew`, {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ newplan: '3-month' })
})
```

---

### Program Routes (Protected)

#### POST /members/:id/request-program
Athlete requests a workout program.

**Request:**
```javascript
fetch(`/members/${memberId}/request-program`, {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        goal: 'Build muscle',
        level: 'intermediate'
    })
})
```

#### POST /members/:id/create-program
Coach creates program for member (generates PDF).

**Request:**
```javascript
fetch(`/members/${memberId}/create-program`, {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        days: [
            {
                dayName: 'Push Day',
                exercises: [
                    { type: 'strength', name: 'Bench Press', setsReps: '4x8', notes: '' },
                    { type: 'strength', name: 'Shoulder Press', setsReps: '3x10', notes: '' }
                ]
            },
            {
                dayName: 'Pull Day',
                exercises: [
                    { type: 'strength', name: 'Deadlift', setsReps: '5x5', notes: 'Heavy' }
                ]
            }
        ]
    })
})
```

#### GET /members/:id/program
Get member's program.

**Response:**
```json
{
    "program": {
        "days": [...],
        "fileUrl": "https://...supabase.co/.../program.pdf",
        "createdAt": "2024-01-15"
    }
}
```

#### GET /members/:id/request
Get member's program request.

**Response:**
```json
{
    "request": {
        "goal": "Build muscle",
        "level": "intermediate",
        "status": "pending",
        "requestedAt": "2024-01-10"
    }
}
```

#### GET /members/:id/download
Download/redirect to program PDF.

---

### Exercise Video Routes (Public)

#### GET /exercises
Get all exercise videos.

**Response:**
```json
[
    { "id": "uuid", "name": "Bench Press Tutorial", "url": "https://youtube.com/..." },
    { "id": "uuid", "name": "Squat Form", "url": "https://youtube.com/..." }
]
```

#### POST /exercises
Add exercise video.

**Request:**
```javascript
fetch('/exercises', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: 'Deadlift Tutorial',
        url: 'https://www.youtube.com/watch?v=abc123'
    })
})
```

#### DELETE /exercises/:id
Delete exercise video.

---

### AI Routes (Protected)

#### POST /ai/tips
Get AI-powered workout tips.

**Request:**
```javascript
fetch('/ai/tips', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        memberName: 'John',
        goal: 'Build muscle',
        level: 'intermediate',
        exercises: ['Bench Press', 'Squats', 'Deadlift']
    })
})
```

**Response:**
```json
{
    "success": true,
    "tips": "1. Focus on progressive overload...\n2. Rest 2-3 minutes between heavy sets...",
    "model": "gemma-3-4b-it"
}
```

---

## Frontend Guide

### Adding Token to All API Calls

Update `api.js` to include token:

```javascript
const API = 'http://localhost:3000';

// Helper function to get headers
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// Example: Get members
async function getMembers() {
    const response = await fetch(`${API}/members`, {
        headers: getAuthHeaders()
    });
    return await response.json();
}

// Example: Delete member
async function deleteMember(id) {
    const response = await fetch(`${API}/members/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return await response.json();
}
```

### Login Page Flow

```javascript
async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.token) {
        // Save token and user
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.member));
        
        // Redirect based on role
        if (data.member.role === 'coach') {
            window.location.href = '/coach.html';
        } else {
            window.location.href = '/athlete.html';
        }
    } else {
        alert(data.message);
    }
}
```

### Protect Pages

Add this to top of protected pages (coach.html, athlete.html):

```javascript
// Check if logged in
if (!localStorage.getItem('token')) {
    window.location.href = '/login.html';
}
```

---

## Common Patterns

### Supabase Query Patterns

```javascript
// Get all
const { data, error } = await supabase.from('table').select('*');

// Get one by ID
const { data, error } = await supabase.from('table').select('*').eq('id', id).single();

// Get one (might not exist)
const { data, error } = await supabase.from('table').select('*').eq('id', id).maybeSingle();

// Insert
const { data, error } = await supabase.from('table').insert({ ... }).select().single();

// Update
const { data, error } = await supabase.from('table').update({ ... }).eq('id', id);

// Delete
const { data, error } = await supabase.from('table').delete().eq('id', id);

// JOIN (get related data)
const { data, error } = await supabase.from('members').select(`
    *,
    programs (*),
    program_requests (*)
`);
```

### Date Calculations

```javascript
// Today
const today = new Date();

// Add 1 month
const endDate = new Date();
endDate.setMonth(endDate.getMonth() + 1);

// Add 3 months
endDate.setMonth(endDate.getMonth() + 3);

// Add 1 year
endDate.setFullYear(endDate.getFullYear() + 1);

// Days between dates
const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

// Format for database
date.toISOString()  // "2024-01-15T10:30:00.000Z"
```

### PDF Generation with Buffer

```javascript
const pdfBuffer = await new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks = [];
    
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    
    // PDF content
    doc.text('Hello World');
    
    doc.end();
});

// Upload to Supabase Storage
await supabase.storage.from('bucket').upload('file.pdf', pdfBuffer, {
    contentType: 'application/pdf',
    upsert: true
});
```

---

## Troubleshooting

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `401 No token provided` | Missing Authorization header | Add `Bearer ${token}` to headers |
| `403 Invalid token` | Token expired or wrong | Login again to get new token |
| `404 Not Found` | Wrong URL or route not found | Check URL spelling |
| `Cannot find module` | Package not installed | Run `npm install` |
| `SUPABASE_URL is undefined` | Missing .env | Create .env file with variables |
| `ERR_BLOCKED_BY_CLIENT` | Ad blocker | Ignore - not your code |

### Debug Tips

```javascript
// Log request in backend
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Log Supabase responses
const { data, error } = await supabase.from('table').select('*');
console.log('Data:', data);
console.log('Error:', error);

// Log token info
console.log('Token:', req.headers['authorization']);
console.log('User:', req.user);
```

### Server Commands

```bash
# Start server
cd server
node index.js

# Install packages
npm install

# If bcrypt fails (Windows)
npm rebuild bcrypt --build-from-source
```

---

## Future Features

### 1. 🏆 Gamification (Next Priority)

**Database Changes:**
```sql
-- Already have in members:
-- xp, level, streak, last_workout_date

-- New table for badges
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100),
    description TEXT,
    icon VARCHAR(50),
    xp_required INTEGER
);

CREATE TABLE member_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id),
    badge_id UUID REFERENCES badges(id),
    earned_at TIMESTAMP DEFAULT NOW()
);
```

**New Routes:**
```
POST /members/:id/complete-workout  → Add XP, update streak
GET /members/:id/badges             → Get earned badges
GET /leaderboard                    → Top members by XP
```

**XP System:**
| Action | XP |
|--------|-----|
| Complete workout | +50 |
| Watch video | +10 |
| 7-day streak | +100 |
| Perfect form | +25 |

---

### 2. 📊 Predictive Analytics

**Database Changes:**
```sql
CREATE TABLE weight_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id),
    weight DECIMAL(5,2),
    logged_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE workout_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id),
    program_id UUID REFERENCES programs(id),
    completed_at TIMESTAMP DEFAULT NOW(),
    xp_earned INTEGER
);
```

**New Routes:**
```
POST /members/:id/log-weight
GET /members/:id/weight-history
GET /members/:id/predictions
GET /members/:id/stats
```

---

### 3. 📸 AI Form Checker

**How it works:**
1. Athlete uploads image/video
2. Send to Gemini Vision API
3. AI analyzes form
4. Returns feedback

**Database:**
```sql
CREATE TABLE form_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id),
    exercise VARCHAR(100),
    image_url VARCHAR(500),
    feedback TEXT,
    score INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**New Route:**
```
POST /form-check  → Upload image, get AI feedback
```

---

### 4. ⚛️ React Frontend

**Structure:**
```
/                       → Home/Landing
/login                  → Login page
/register               → Register page
/coach/members          → Member list
/coach/programs         → Create programs
/coach/requests         → Pending requests
/athlete/dashboard      → Athlete home
/athlete/program        → View program
/athlete/progress       → Stats & tracking
```

**Tech:**
- React + React Router
- Tailwind CSS
- shadcn/ui components
- Chart.js for analytics

---

### 5. ☕ Spring Boot Backend

Rebuild backend in Java for thesis comparison.

**Same API routes, different technology:**
- Spring Boot framework
- Spring Security (auth)
- JPA/Hibernate (database)
- Same Supabase database

---

## Deployment Guide

### Backend (Railway or Render)

1. Create account on Railway.app or Render.com
2. Connect GitHub repo
3. Set environment variables:
   - `GEMINI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `JWT_SECRET`
4. Deploy

### Frontend (Vercel or Netlify)

1. Create account on Vercel.com
2. Connect GitHub repo
3. Set root directory to `frontend`
4. Deploy

### Update API URL

Change in `frontend/js/api.js`:
```javascript
// Development
const API = 'http://localhost:3000';

// Production
const API = 'https://your-backend.railway.app';
```

---

## Quick Reference

### Start Development
```bash
cd server
node index.js
# Server runs on http://localhost:3000
```

### Test API (Browser Console)
```javascript
// Login
fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@test.com', password: 'password123' })
}).then(r => r.json()).then(console.log);

// Protected route
fetch('http://localhost:3000/members', {
    headers: { 'Authorization': 'Bearer YOUR_TOKEN_HERE' }
}).then(r => r.json()).then(console.log);
```

### Git Commands
```bash
git add .
git commit -m "Your message"
git push
```

---

## Contact & Resources

- Supabase Docs: https://supabase.com/docs
- Express Docs: https://expressjs.com
- JWT Docs: https://jwt.io
- Gemini API: https://ai.google.dev

---

*Last Updated: February 2024*
*Project: Bachelor's Thesis - University of Macedonia*
