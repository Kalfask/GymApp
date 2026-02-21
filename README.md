# 🏋️ GymApp

A full-stack gym management application for coaches and athletes.

## ✨ Features

### Coach Dashboard
- ➕ Add and manage gym members
- 💳 Track membership plans (monthly, 3-month, yearly)
- 🔄 Renew memberships
- 📋 View program requests from athletes
- ✍️ Create personalized workout programs
- 📄 Auto-generate PDF workout plans
- 🎬 Manage exercise video library (YouTube)

### Athlete Dashboard
- 🔐 Login with email
- 💳 View membership status
- 📝 Request workout programs
- 📋 View assigned workouts
- ▶️ Watch exercise tutorial videos
- 🤖 Get AI-powered personalized tips
- 📥 Download workout PDF

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express |
| Database | Supabase (PostgreSQL) |
| AI | Google Gemini API |
| PDF | PDFKit |

## 🚧 Migration Status

Currently migrating from in-memory arrays to Supabase database.

| Route | Status |
|-------|--------|
| POST /members | ✅ Migrated |
| GET /members | ✅ Migrated |
| GET /members/search/:email | ✅ Migrated |
| DELETE /members/:id | ✅ Migrated |
| POST /members/:id/renew | ✅ Migrated |
| POST /members/:id/request-program | ✅ Migrated |
| POST /members/:id/create-program | 🔄 In Progress |
| GET /members/:id/program | ⏳ Pending |
| Exercise video routes | ⏳ Pending |

## 📁 Project Structure
```
gymapp/
├── server/
│   ├── index.js        # Backend routes & logic
│   ├── package.json    # Dependencies
│   ├── .env            # API keys (not in repo)
│   └── programs/       # Generated PDFs
└── frontend/
    ├── index.html      # Home page
    ├── coach.html      # Coach dashboard
    ├── athlete.html    # Athlete dashboard
    └── js/
        ├── api.js      # API calls
        ├── coach.js    # Coach logic
        └── athlete.js  # Athlete logic
```

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- Supabase account (free)
- Google Gemini API key (free)

### Installation

1. **Clone the repo**
```bash
   git clone https://github.com/YOUR_USERNAME/gymapp.git
   cd gymapp
```

2. **Install dependencies**
```bash
   cd server
   npm install
```

3. **Set up Supabase**
   - Create account at https://supabase.com
   - Create new project
   - Run SQL to create tables (see PROJECT_PLAN.md)

4. **Set up environment variables**
   
   Create `server/.env` file:
```
   GEMINI_API_KEY=your_gemini_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
```

5. **Start the server**
```bash
   node index.js
```

6. **Open in browser**
```
   http://localhost:3000
```

## 🔮 Roadmap

- [x] Member management (CRUD)
- [x] Subscription tracking
- [x] Program requests
- [x] PDF generation
- [x] Exercise video library
- [x] AI-powered tips
- [x] Supabase database (in progress)
- [ ] Real authentication
- [ ] QR code login
- [ ] Gamification (XP, badges)
- [ ] Predictive analytics
- [ ] AI form checker
- [ ] React frontend
- [ ] Spring Boot backend

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Your Name**
- GitHub: @KalfasK (https://github.com/kalfask)

---

Made with ❤️ and lots of ☕
