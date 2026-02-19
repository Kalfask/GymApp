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
| AI | Google Gemini API |
| PDF | PDFKit |

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
- Google Gemini API key (free)

### Installation

1. **Clone the repo**
```bash
   git clone https://github.com/Kalfask/GymApp.git
   cd gymapp
```

2. **Install dependencies**
```bash
   cd server
   npm install
```

3. **Set up environment variables**
   
   Create `server/.env` file:
```
   GEMINI_API_KEY=your_api_key_here
```
   
   Get your free API key at: https://aistudio.google.com/app/apikey

4. **Start the server**
```bash
   node index.js
```

5. **Open in browser**
```
   http://localhost:3000
```

## 📱 Usage

### As a Coach:
1. Open `http://localhost:3000/coach.html`
2. Add members with their subscription plan
3. Add exercise videos to the library
4. Create workout programs when athletes request them

### As an Athlete:
1. Open `http://localhost:3000/athlete.html`
2. Login with your email
3. View your membership status
4. Request a workout program
5. View workouts and watch tutorial videos
6. Get AI tips for your training

## 🔮 Roadmap

- [x] Member management (CRUD)
- [x] Subscription tracking
- [x] Program requests
- [x] PDF generation
- [x] Exercise video library
- [x] AI-powered tips
- [ ] QR code login
- [ ] Database (Supabase)
- [ ] Real authentication
- [ ] Progress tracking
- [ ] Mobile app
- [ ] Spring Boot backend

## 🤝 Contributing

Pull requests are welcome!

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Author


---

Made with ❤️ and lots of ☕
