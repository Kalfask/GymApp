# 🏋️ GymApp - Project Plan & Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Current Status](#current-status)
3. [Planned Features](#planned-features)
4. [Technical Changes Required](#technical-changes-required)
5. [Implementation Phases](#implementation-phases)
6. [Database Schema](#database-schema)
7. [API Routes](#api-routes)
8. [Timeline](#timeline)

---

## 🎯 Project Overview

**Project Name:** GymApp  
**Purpose:** Full-stack gym management application for coaches and athletes  
**Thesis:** Bachelor's Degree in Information Systems - UoM  

### Unique Selling Points (USP)
1. 📸 **AI Form Checker** - Analyze exercise form using AI vision
2. 🏆 **Gamification System** - XP, badges, streaks, leaderboards
3. 📊 **Predictive Analytics** - AI-powered goal predictions

---

## ✅ Current Status

### Completed Features

#### Coach Dashboard
| Feature | Status | Description |
|---------|--------|-------------|
| Add Member | ✅ Done | Add new gym members with plan |
| View Members | ✅ Done | List all members with status |
| Delete Member | ✅ Done | Remove members |
| Renew Membership | ✅ Done | Extend membership plans |
| View Program Requests | ✅ Done | See pending workout requests |
| Create Program | ✅ Done | Build custom workout programs |
| Generate PDF | ✅ Done | Auto-generate workout PDFs |
| Exercise Videos | ✅ Done | Add/manage YouTube videos |

#### Athlete Dashboard
| Feature | Status | Description |
|---------|--------|-------------|
| Email Login | ✅ Done | Login with email |
| View Membership | ✅ Done | See membership status |
| Request Program | ✅ Done | Request workout program |
| View Program | ✅ Done | See assigned workouts |
| Watch Videos | ✅ Done | View exercise tutorials |
| Download PDF | ✅ Done | Download workout PDF |
| AI Tips | ✅ Done | Get personalized AI tips |
| Day Selector | ✅ Done | Select day for specific tips |

### Current Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express |
| AI | Google Gemini API |
| PDF | PDFKit |
| Data Storage | In-memory arrays (temporary) |

### Current Project Structure
```
gymapp/
├── server/
│   ├── index.js          # All backend routes
│   ├── package.json      # Dependencies
│   ├── .env              # API keys (not in git)
│   └── programs/         # Generated PDFs
├── frontend/
│   ├── index.html        # Home page
│   ├── coach.html        # Coach dashboard
│   ├── athlete.html      # Athlete dashboard
│   └── js/
│       ├── api.js        # API functions
│       ├── coach.js      # Coach logic
│       └── athlete.js    # Athlete logic
├── .gitignore
├── README.md
└── PROJECT_PLAN.md       # This file
```

### Current Data Structure
```javascript
// Member Object (current)
{
    id: Date.now(),
    name: "Kostas",
    email: "kostas@email.com",
    phone: "123456",
    plan: "monthly",           // monthly, 3-month, yearly
    startDate: "2024-01-01",
    endDate: "2024-02-01",
    status: "active",          // active, expiring, expired
    daysLeft: 25,
    programRequest: {
        goal: "strength",
        level: "intermediate",
        status: "pending",     // pending, completed
        requestedAt: Date
    },
    program: {
        days: [...],
        filename: "program_123.pdf",
        createdAt: Date
    }
}

// Exercise Video Object (current)
{
    id: Date.now(),
    name: "Bench Press",
    url: "https://youtube.com/...",
    createdAt: Date
}
```

### Current Limitations
| Issue | Impact |
|-------|--------|
| Data in arrays | Lost on server restart |
| No real authentication | Anyone can login with any email |
| No password protection | Security risk |
| Basic UI | Not professional looking |
| Single page per role | All features crammed together |

---

## 🚀 Planned Features

### Feature 1: 📸 AI Form Checker
**Description:** Athletes upload image/video of exercise, AI analyzes form and gives corrections.

**User Flow:**
```
1. Athlete goes to "Form Check" page
2. Selects exercise (Squat, Deadlift, etc.)
3. Uploads image or video
4. AI analyzes using Gemini Vision API
5. Returns feedback:
   - Score: 85/100
   - ✅ Good: "Back is straight"
   - ⚠️ Fix: "Knees going past toes"
   - 💡 Tip: "Push through heels"
6. History saved for progress tracking
```

**Technical Requirements:**
- Gemini Vision API
- Image upload & storage
- Form feedback display component

---

### Feature 2: 🏆 Gamification System
**Description:** Points, badges, streaks, and leaderboards to motivate users.

**Components:**

#### XP (Experience Points)
| Action | XP Earned |
|--------|-----------|
| Complete workout | +50 XP |
| Watch exercise video | +10 XP |
| 7-day streak | +100 XP bonus |
| Perfect form check (90+) | +25 XP |
| Request program | +5 XP |
| Log weight | +5 XP |

#### Levels
| Level | XP Required | Title |
|-------|-------------|-------|
| 1 | 0 | Beginner |
| 2 | 100 | Rookie |
| 3 | 300 | Regular |
| 4 | 600 | Dedicated |
| 5 | 1000 | Athlete |
| 6 | 1500 | Pro |
| 7 | 2500 | Elite |
| 8 | 4000 | Champion |
| 9 | 6000 | Legend |
| 10 | 10000 | Master |

#### Badges
| Badge | Icon | Requirement |
|-------|------|-------------|
| First Steps | 🎯 | Complete first workout |
| Consistent | 🔥 | 7-day streak |
| On Fire | 🔥🔥 | 30-day streak |
| Video Student | 📚 | Watch 10 videos |
| Form Master | ⭐ | 5 perfect form checks |
| Strength Builder | 💪 | Complete 10 strength workouts |
| Cardio King | 🏃 | Complete 10 cardio workouts |
| Century | 💯 | Complete 100 workouts |
| Early Bird | 🌅 | Workout before 7 AM |
| Night Owl | 🦉 | Workout after 9 PM |

#### Streaks
- Track consecutive days with workouts
- Show streak counter with fire emoji 🔥
- Bonus XP for milestone streaks

#### Leaderboard
- Weekly XP rankings
- Monthly rankings
- All-time rankings
- Filter by gym/global

---

### Feature 3: 📊 Predictive Analytics
**Description:** AI predicts when user will reach their goal based on progress data.

**Features:**
```
┌─────────────────────────────────────────┐
│  📊 Goal Prediction                     │
│                                         │
│  Current Weight: 77kg                   │
│  Goal Weight: 72kg                      │
│  Progress: ████████░░ 62%               │
│                                         │
│  📅 Predicted Date: April 15, 2024      │
│  📈 Confidence: 85%                     │
│  📉 Avg Loss: 0.8kg/week                │
│                                         │
│  💡 Recommendations:                    │
│  "Add 1 cardio session to reach         │
│   your goal 10 days earlier!"           │
│                                         │
│  📈 [View Progress Chart]               │
└─────────────────────────────────────────┘
```

**Data Tracked:**
- Weight (weekly logs)
- Workout completion rate
- Workout frequency
- Calorie burn estimates
- Strength progress (weights lifted)

**Predictions:**
- Goal completion date
- Confidence percentage
- Recommendations to improve

---

### Additional Planned Features

| Feature | Priority | Description |
|---------|----------|-------------|
| Real Authentication | High | Password login, JWT tokens |
| Database (Supabase) | High | Persistent data storage |
| QR Code Login | Medium | Scan QR to login |
| Progress Photos | Medium | Upload before/after photos |
| Workout Timer | Medium | Rest timer between sets |
| Nutrition Tips | Low | AI meal suggestions |
| Social Features | Low | Follow friends, share progress |
| Mobile App | Future | React Native version |

---

## 🔧 Technical Changes Required

### Phase 1: Database (Supabase)

#### Install Dependencies
```bash
cd server
npm install @supabase/supabase-js
```

#### Environment Variables (.env)
```
GEMINI_API_KEY=your_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

#### Backend Changes

**Current (arrays):**
```javascript
let members = [];

app.post('/members', (req, res) => {
    const member = { id: Date.now(), ...req.body };
    members.push(member);
    res.json(member);
});
```

**New (Supabase):**
```javascript
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.post('/members', async (req, res) => {
    const { data, error } = await supabase
        .from('members')
        .insert({ ...req.body, xp: 0, level: 1, streak: 0 })
        .select();
    
    if (error) return res.status(500).json({ error });
    res.json(data[0]);
});
```

### Phase 2: Authentication

#### New Login Flow
```
1. User enters email + password
2. Backend validates credentials
3. Backend returns JWT token
4. Frontend stores token
5. All requests include token
6. Backend verifies token
```

#### Password Hashing
```javascript
const bcrypt = require('bcrypt');

// Register
const hashedPassword = await bcrypt.hash(password, 10);

// Login
const valid = await bcrypt.compare(password, hashedPassword);
```

### Phase 3: React Conversion

#### New Project Structure
```
gymapp/
├── server/                    # Backend (stays similar)
│   ├── index.js
│   ├── package.json
│   └── .env
│
├── client/                    # React Frontend (NEW)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── MemberCard.jsx
│   │   │   ├── XPBar.jsx
│   │   │   ├── BadgeDisplay.jsx
│   │   │   ├── StreakCounter.jsx
│   │   │   ├── LeaderboardTable.jsx
│   │   │   ├── WeightChart.jsx
│   │   │   ├── PredictionCard.jsx
│   │   │   └── FormChecker.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   │
│   │   │   ├── coach/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Members.jsx
│   │   │   │   ├── Programs.jsx
│   │   │   │   ├── Requests.jsx
│   │   │   │   ├── Videos.jsx
│   │   │   │   └── Leaderboard.jsx
│   │   │   │
│   │   │   └── athlete/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── Program.jsx
│   │   │       ├── Tips.jsx
│   │   │       ├── Videos.jsx
│   │   │       ├── Progress.jsx
│   │   │       ├── FormCheck.jsx
│   │   │       ├── Badges.jsx
│   │   │       └── Leaderboard.jsx
│   │   │
│   │   ├── api/
│   │   │   └── api.js
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── App.jsx
│   │   └── index.jsx
│   │
│   ├── package.json
│   └── tailwind.config.js
│
└── server-spring/             # Spring Boot Backend (Phase 5)
    └── ... (Java files)
```

---

## 🗄️ Database Schema

### Tables

#### members
```sql
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(20) DEFAULT 'athlete',  -- 'coach' or 'athlete'
    plan VARCHAR(20),                     -- 'monthly', '3-month', 'yearly'
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak INTEGER DEFAULT 0,
    last_workout_date DATE,
    goal_weight DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### programs
```sql
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    days JSONB NOT NULL,
    filename VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### program_requests
```sql
CREATE TABLE program_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    goal VARCHAR(100),
    level VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'completed'
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### exercise_videos
```sql
CREATE TABLE exercise_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### badges
```sql
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    requirement VARCHAR(255)
);
```

#### member_badges
```sql
CREATE TABLE member_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(member_id, badge_id)
);
```

#### weight_logs
```sql
CREATE TABLE weight_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    weight DECIMAL(5,2) NOT NULL,
    logged_at DATE DEFAULT CURRENT_DATE
);
```

#### workout_history
```sql
CREATE TABLE workout_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    program_id UUID REFERENCES programs(id),
    day_name VARCHAR(100),
    exercises_completed JSONB,
    xp_earned INTEGER DEFAULT 0,
    completed_at TIMESTAMP DEFAULT NOW()
);
```

#### form_checks
```sql
CREATE TABLE form_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    exercise VARCHAR(100) NOT NULL,
    image_url VARCHAR(500),
    score INTEGER,
    feedback JSONB,
    checked_at TIMESTAMP DEFAULT NOW()
);
```

### Entity Relationship Diagram
```
┌──────────────┐       ┌──────────────┐
│   members    │───────│   programs   │
└──────────────┘   1:1 └──────────────┘
       │
       │ 1:N
       ▼
┌──────────────────┐
│ program_requests │
└──────────────────┘
       │
       │ 1:N
       ▼
┌──────────────────┐
│  weight_logs     │
└──────────────────┘
       │
       │ 1:N
       ▼
┌──────────────────┐
│ workout_history  │
└──────────────────┘
       │
       │ 1:N
       ▼
┌──────────────────┐
│   form_checks    │
└──────────────────┘
       │
       │ N:M
       ▼
┌──────────────────┐       ┌──────────────┐
│  member_badges   │───────│    badges    │
└──────────────────┘       └──────────────┘
```

---

## 🛣️ API Routes

### Current Routes
```
GET    /test                              # Test server
POST   /members                           # Add member
GET    /members                           # Get all members
GET    /members/search/:email             # Find by email
DELETE /members/:id                       # Delete member
POST   /members/:id/renew                 # Renew membership
POST   /members/:id/request-program       # Request program
POST   /members/:id/create-program        # Create program
GET    /members/:id/program               # Get program
GET    /members/:id/download              # Download PDF
GET    /exercises                         # Get all videos
POST   /exercises                         # Add video
DELETE /exercises/:id                     # Delete video
POST   /ai/tips                           # Get AI tips
GET    /ai/models                         # List AI models
```

### New Routes (to add)

#### Authentication
```
POST   /auth/register                     # Create account
POST   /auth/login                        # Login, get token
POST   /auth/logout                       # Logout
GET    /auth/me                           # Get current user
```

#### Gamification
```
POST   /members/:id/complete-workout      # Complete workout, earn XP
GET    /members/:id/badges                # Get member's badges
POST   /members/:id/award-badge           # Award badge
GET    /leaderboard                       # Get XP rankings
GET    /leaderboard/weekly                # Weekly rankings
GET    /leaderboard/monthly               # Monthly rankings
```

#### Analytics
```
POST   /members/:id/log-weight            # Log weight
GET    /members/:id/weight-history        # Get weight logs
GET    /members/:id/predictions           # Get AI predictions
GET    /members/:id/workout-history       # Get workout history
GET    /members/:id/stats                 # Get overall stats
```

#### Form Checker
```
POST   /form-check                        # Upload image, get feedback
GET    /members/:id/form-history          # Get past form checks
```

---

## 📅 Implementation Phases

### Phase 1: Database Setup (Supabase)
**Duration:** 1-2 days
**Tasks:**
- [ ] Create Supabase account
- [ ] Create project
- [ ] Create all tables
- [ ] Update backend to use Supabase
- [ ] Migrate all routes
- [ ] Test all existing features

### Phase 2: Authentication
**Duration:** 2-3 days
**Tasks:**
- [ ] Add bcrypt for password hashing
- [ ] Add JWT for tokens
- [ ] Create register route
- [ ] Create login route
- [ ] Update frontend for login/register
- [ ] Protect routes with authentication

### Phase 3: Gamification
**Duration:** 3-4 days
**Tasks:**
- [ ] Add XP system
- [ ] Add level calculation
- [ ] Add streak tracking
- [ ] Create badges table and data
- [ ] Add badge awarding logic
- [ ] Create leaderboard
- [ ] Update frontend to show XP, badges, streak

### Phase 4: Predictive Analytics
**Duration:** 2-3 days
**Tasks:**
- [ ] Add weight logging
- [ ] Create progress charts (Chart.js)
- [ ] Implement prediction algorithm
- [ ] Add AI recommendations
- [ ] Create progress dashboard

### Phase 5: AI Form Checker
**Duration:** 3-4 days
**Tasks:**
- [ ] Set up image upload
- [ ] Integrate Gemini Vision API
- [ ] Create feedback display
- [ ] Store form check history
- [ ] Award badges for good form

### Phase 6: React Conversion
**Duration:** 5-7 days
**Tasks:**
- [ ] Create React app
- [ ] Set up React Router
- [ ] Install Tailwind CSS
- [ ] Install shadcn/ui
- [ ] Convert all pages to components
- [ ] Add responsive design
- [ ] Polish UI/UX

### Phase 7: Spring Boot Backend
**Duration:** 5-7 days
**Tasks:**
- [ ] Set up Spring Boot project
- [ ] Create same routes in Java
- [ ] Connect to same Supabase database
- [ ] Test all features
- [ ] Compare with Node.js (for thesis)

### Phase 8: Deployment
**Duration:** 1-2 days
**Tasks:**
- [ ] Deploy backend to Railway/Render
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Set up custom domain
- [ ] Configure environment variables
- [ ] Final testing

---

## 📊 Timeline

```
Week 1-2:   Database + Authentication
Week 3:     Gamification
Week 4:     Predictive Analytics
Week 5:     AI Form Checker
Week 6-7:   React Conversion + Styling
Week 8-9:   Spring Boot Backend
Week 10:    Deployment + Documentation
Week 11+:   Testing + Thesis Writing
```

---

## 📝 Notes for Thesis

### Key Points to Highlight
1. **Full-stack development** - Frontend, Backend, Database
2. **Two backend implementations** - Node.js vs Spring Boot comparison
3. **AI Integration** - Gemini API for tips and form checking
4. **Modern features** - Gamification, predictive analytics
5. **Professional practices** - Git, environment variables, documentation

### Comparison Points (Node.js vs Spring Boot)
| Aspect | Node.js | Spring Boot |
|--------|---------|-------------|
| Language | JavaScript | Java |
| Setup time | Fast | Slower |
| Type safety | Weak | Strong |
| Performance | Good | Very good |
| Learning curve | Easy | Steeper |
| Enterprise use | Startups | Corporations |
| Ecosystem | npm | Maven/Gradle |

### Technologies Used
- **Frontend:** HTML, CSS, JavaScript → React, Tailwind CSS
- **Backend v1:** Node.js, Express
- **Backend v2:** Spring Boot (Java)
- **Database:** Supabase (PostgreSQL)
- **AI:** Google Gemini API
- **PDF:** PDFKit
- **Charts:** Chart.js
- **Hosting:** Railway, Vercel

---

## 🔗 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Spring Boot](https://spring.io/projects/spring-boot)
- [Gemini API](https://ai.google.dev)
- [Chart.js](https://www.chartjs.org)

---

*Last Updated: February 2025*
*Author: Konstantinos Kalfas*
*University of Macedonia - Information Systems*
