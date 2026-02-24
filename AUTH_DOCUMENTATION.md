# 🔐 Complete Authentication Guide

## Table of Contents
1. [Overview - What is Authentication?](#overview)
2. [Password Hashing (bcrypt)](#password-hashing)
3. [JWT Tokens](#jwt-tokens)
4. [Backend Setup](#backend-setup)
5. [Backend Routes](#backend-routes)
6. [Middleware (Protecting Routes)](#middleware)
7. [Frontend Integration](#frontend-integration)
8. [Complete Flow](#complete-flow)
9. [Common Errors](#common-errors)
10. [Security Tips](#security-tips)

---

## Overview

### What is Authentication?

Authentication = "Who are you?"

```
Without Auth:
Anyone → Your App → Gets all data 😱

With Auth:
Unknown person → Your App → "Login first!" 🛑
Logged in user → Your App → Gets their data ✅
```

### The Two Main Parts

| Part | What It Does | Technology |
|------|--------------|------------|
| **Password Hashing** | Securely store passwords | bcrypt |
| **Tokens** | Remember who's logged in | JWT |

---

## Password Hashing

### Why Hash Passwords?

```
❌ NEVER store plain passwords:
Database: { email: "john@email.com", password: "mypassword123" }
If hacked → Everyone's passwords exposed!

✅ ALWAYS hash passwords:
Database: { email: "john@email.com", password: "$2b$10$X7z9kL..." }
If hacked → Useless gibberish, can't reverse it!
```

### What is Hashing?

```
Hashing = One-way transformation

"password123" → bcrypt → "$2b$10$X7z9kLmN3pQ5rS7uW1xY4z..."

You CANNOT reverse it:
"$2b$10$X7z9kL..." → ??? → Can't get "password123" back!
```

### How bcrypt Works

```javascript
// Install
npm install bcrypt

// Import
const bcrypt = require('bcrypt');
```

### Hashing a Password (When Registering)

```javascript
const password = "mypassword123";

// Hash it (10 = salt rounds, higher = more secure but slower)
const hashedPassword = await bcrypt.hash(password, 10);

// Result: "$2b$10$X7z9kLmN3pQ5rS7uW1xY4zA6bC0dE2fG3hI4jK5lM6nO7pQ8rS9tU"

// Save THIS to database, not the original password!
await supabase.from('members').insert({ 
    email: "john@email.com", 
    password: hashedPassword  // The hashed version!
});
```

### Comparing Passwords (When Logging In)

```javascript
const inputPassword = "mypassword123";        // What user typed
const storedHash = "$2b$10$X7z9kL...";        // From database

// Compare them
const match = await bcrypt.compare(inputPassword, storedHash);

if (match) {
    console.log("✅ Correct password!");
} else {
    console.log("❌ Wrong password!");
}
```

### How Compare Works

```
bcrypt.compare("mypassword123", "$2b$10$X7z...")

1. Takes "mypassword123"
2. Hashes it the same way
3. Compares with stored hash
4. Returns true/false

It does NOT decrypt! It re-hashes and compares.
```

---

## JWT Tokens

### What is a Token?

Think of it like a **concert wristband**:

```
┌─────────────────────────────────────────┐
│  🎫 CONCERT WRISTBAND                   │
├─────────────────────────────────────────┤
│  Name: Kostas                           │
│  Ticket Type: VIP                       │
│  Valid Until: March 1st                 │
│  Signature: ✓ (can't be faked)          │
└─────────────────────────────────────────┘

Show wristband → Security lets you in
No wristband → "Who are you?" ❌
```

### JWT = JSON Web Token

```
┌─────────────────────────────────────────┐
│  🔐 JWT TOKEN                           │
├─────────────────────────────────────────┤
│  id: "abc-123"                          │
│  email: "kostas@email.com"              │
│  role: "athlete"                        │
│  expires: 7 days                        │
│  signature: ✓ (verified with secret)    │
└─────────────────────────────────────────┘
```

### What a Token Looks Like

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFiYy0xMjMiLCJlbWFpbCI6Imtvc3Rhc0BlbWFpbC5jb20ifQ.X7kZ9mN2pL3qR5sT8uW1xY4zA6bC0dE2fG
```

### Token Has 3 Parts

```
HEADER.PAYLOAD.SIGNATURE

Part 1 - Header (Token type):
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9

Part 2 - Payload (Your data):
eyJpZCI6ImFiYy0xMjMiLCJlbWFpbCI6Imtvc3Rhc0BlbWFpbC5jb20ifQ

Part 3 - Signature (Proves it's real):
X7kZ9mN2pL3qR5sT8uW1xY4zA6bC0dE2fG
```

### How JWT Works

```javascript
// Install
npm install jsonwebtoken

// Import
const jwt = require('jsonwebtoken');

// You need a SECRET KEY (keep it private!)
// Store in .env file:
JWT_SECRET=my_super_secret_key_nobody_knows_2024
```

### Creating a Token (When User Logs In)

```javascript
const jwt = require('jsonwebtoken');

// User data to put in token
const userData = {
    id: "abc-123",
    email: "kostas@email.com",
    role: "athlete"
};

// Create token
const token = jwt.sign(
    userData,                    // Data to store
    process.env.JWT_SECRET,      // Your secret key
    { expiresIn: '7d' }          // Token expires in 7 days
);

// Result: "eyJhbGciOiJIUzI1NiIs..."

// Send to frontend
res.json({ token: token });
```

### Verifying a Token (When User Makes Request)

```javascript
const token = "eyJhbGciOiJIUzI1NiIs...";  // From request header

try {
    // Verify and decode
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log(decoded);
    // { id: "abc-123", email: "kostas@email.com", role: "athlete" }
    
    console.log("✅ Valid token!");
} catch (error) {
    console.log("❌ Invalid or expired token!");
}
```

### Why Tokens Can't Be Faked

```
Hacker tries to make fake token:
1. Creates payload: { id: "admin", role: "admin" }
2. But doesn't know your SECRET KEY
3. Can't create valid signature
4. jwt.verify() fails → "Invalid token!"

Only YOUR server can create valid tokens because
only YOU know the JWT_SECRET!
```

---

## Backend Setup

### 1. Install Packages

```bash
npm install bcrypt jsonwebtoken dotenv
```

### 2. Environment Variables (.env)

```env
JWT_SECRET=your_super_secret_key_here_make_it_long_and_random
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_key
```

### 3. Import in index.js

```javascript
require('dotenv').config();  // Load .env file
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
```

### 4. Database - Add Columns

```sql
ALTER TABLE members ADD COLUMN password VARCHAR(255);
ALTER TABLE members ADD COLUMN role VARCHAR(20) DEFAULT 'athlete';
```

---

## Backend Routes

### POST /auth/register

**Purpose:** Create new user account

**Flow:**
```
1. Get email, password, name from request
2. Check if email already exists
3. Hash the password
4. Save to database
5. Return success
```

**Code:**
```javascript
app.post('/auth/register', async (req, res) => {
    const { email, password, name, phone } = req.body;
    
    try {
        // 1. Check if email exists
        const { data: existing } = await supabase
            .from('members')
            .select('*')
            .eq('email', email)
            .maybeSingle();
        
        if (existing) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Save to database
        const { data: newUser, error } = await supabase
            .from('members')
            .insert({ 
                email, 
                password: hashedPassword,  // Hashed!
                name, 
                phone,
                role: 'athlete'
            })
            .select()
            .single();

        if (error) throw error;

        // 4. Return success (don't send password back!)
        res.json({ message: 'Registration successful' });
    }
    catch(error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
});
```

### POST /auth/login

**Purpose:** Verify user and give them a token

**Flow:**
```
1. Get email, password from request
2. Find user by email
3. Compare password with bcrypt
4. If match → Create JWT token
5. Return token + user info
```

**Code:**
```javascript
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // 1. Find user by email
        const { data: member, error } = await supabase
            .from('members')
            .select('*')
            .eq('email', email)
            .maybeSingle();
        
        if (error) throw error;
        
        // 2. User not found
        if (!member) {
            return res.status(400).json({ message: 'Email not found' });
        }

        // 3. Compare passwords
        const match = await bcrypt.compare(password, member.password);
        
        if (!match) {
            return res.status(400).json({ message: 'Incorrect password' });
        }

        // 4. Create token
        const token = jwt.sign(
            { 
                id: member.id, 
                email: member.email, 
                role: member.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 5. Return token + user info (NOT password!)
        res.json({ 
            token,
            member: {
                id: member.id,
                email: member.email,
                name: member.name,
                role: member.role
            }
        });
    }
    catch(error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed' });
    }
});
```

---

## Middleware

### What is Middleware?

Code that runs BETWEEN request and route:

```
Request → Middleware → Route
              ↓
        "Check token"
              ↓
       Valid? → Continue
       Invalid? → Block
```

### The authenticateToken Function

```javascript
function authenticateToken(req, res, next) {
    // 1. Get token from header
    const authHeader = req.headers['authorization'];
    // Header looks like: "Bearer eyJhbGciOiJ..."
    
    const token = authHeader && authHeader.split(' ')[1];
    // Split by space: ["Bearer", "eyJhbGciOiJ..."]
    // Get index 1: "eyJhbGciOiJ..."
    
    // 2. No token provided
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    
    // 3. Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // decoded = { id: "abc", email: "...", role: "..." }
        
        // 4. Attach user to request (so route can use it)
        req.user = decoded;
        
        // 5. Continue to the route
        next();
    } catch (error) {
        // Token invalid or expired
        return res.status(403).json({ message: 'Invalid token' });
    }
}
```

### Using Middleware on One Route

```javascript
// Without protection (anyone can access)
app.get('/exercises', async (req, res) => {
    // Public route
});

// With protection (only logged-in users)
app.get('/members/:id/program', authenticateToken, async (req, res) => {
    // req.user is available here!
    console.log('User:', req.user.email);
    console.log('Role:', req.user.role);
});
```

### Global Middleware (Protect All Routes)

Instead of adding `authenticateToken` to every route:

```javascript
// List of routes that DON'T need login
const publicRoutes = ['/auth/register', '/auth/login', '/exercises'];

// This runs for EVERY request
app.use((req, res, next) => {
    // Check if it's a public route
    if (publicRoutes.some(route => req.path.startsWith(route))) {
        return next();  // Skip authentication
    }
    
    // For all other routes, check token
    authenticateToken(req, res, next);
});

// Now ALL routes are protected except publicRoutes!
```

### How Global Middleware Works

```
Request: POST /auth/login
→ Is it public? Yes → Skip auth → Route runs ✅

Request: GET /members/123/program
→ Is it public? No → Check token → Valid? → Route runs ✅
→ Is it public? No → Check token → Invalid? → "Unauthorized" ❌
```

---

## Frontend Integration

### 1. API Functions (api.js)

```javascript
const API = 'http://localhost:3000';

// ============ AUTH HELPERS ============

// Get headers with token
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// Check if logged in
function isLoggedIn() {
    return localStorage.getItem('authToken') !== null;
}

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Logout
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// ============ AUTH ROUTES ============

// Register
async function register(email, password, name, phone) {
    const response = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phone })
    });
    return await response.json();
}

// Login
async function login(email, password) {
    const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return await response.json();
}

// ============ PROTECTED ROUTES ============

// All other routes use getAuthHeaders()
async function getMembers() {
    const response = await fetch(`${API}/members`, {
        headers: getAuthHeaders()  // Includes token!
    });
    return await response.json();
}

async function getProgram(memberId) {
    const response = await fetch(`${API}/members/${memberId}/program`, {
        headers: getAuthHeaders()
    });
    return await response.json();
}
```

### 2. Login Page (login.html)

```javascript
async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Call login API
    const result = await login(email, password);
    
    if (result.token) {
        // ✅ Success! Save token and user
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('user', JSON.stringify(result.member));
        
        // Redirect based on role
        if (result.member.role === 'coach') {
            window.location.href = 'coach.html';
        } else {
            window.location.href = 'athlete.html';
        }
    } else {
        // ❌ Error
        alert(result.message);
    }
}
```

### 3. Register Page (register.html)

```javascript
async function handleRegister() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    // Call register API
    const result = await register(email, password, name, phone);
    
    if (result.message === 'Registration successful') {
        alert('Account created! Please login.');
        window.location.href = 'login.html';
    } else {
        alert(result.message);
    }
}
```

### 4. Protect Pages (coach.html, athlete.html)

Add this at the END of your HTML (after api.js loads):

```html
<script src="js/api.js"></script>
<script src="js/coach.js"></script>
<script>
    // Check if logged in
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
    }
    
    // Optional: Check role
    const user = getCurrentUser();
    if (user && user.role !== 'coach') {
        alert('Coaches only!');
        window.location.href = 'athlete.html';
    }
</script>
```

### 5. Logout Button

```html
<button onclick="logout()">🚪 Logout</button>
```

---

## Complete Flow

### Registration Flow

```
┌─────────────────────────────────────────────────────────┐
│                    REGISTRATION                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. User fills form:                                    │
│     Name: "Kostas"                                      │
│     Email: "kostas@email.com"                           │
│     Password: "mypassword123"                           │
│                                                         │
│  2. Frontend calls:                                     │
│     register(email, password, name, phone)              │
│                                                         │
│  3. Backend receives request                            │
│                                                         │
│  4. Backend checks: Email exists?                       │
│     → No, continue                                      │
│                                                         │
│  5. Backend hashes password:                            │
│     "mypassword123" → "$2b$10$X7z..."                   │
│                                                         │
│  6. Backend saves to database:                          │
│     { email, password: HASHED, name, role: 'athlete' }  │
│                                                         │
│  7. Backend returns: { message: 'Success' }             │
│                                                         │
│  8. Frontend redirects to login page                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Login Flow

```
┌─────────────────────────────────────────────────────────┐
│                       LOGIN                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. User enters:                                        │
│     Email: "kostas@email.com"                           │
│     Password: "mypassword123"                           │
│                                                         │
│  2. Frontend calls:                                     │
│     login(email, password)                              │
│                                                         │
│  3. Backend finds user by email                         │
│                                                         │
│  4. Backend compares passwords:                         │
│     bcrypt.compare("mypassword123", "$2b$10$X7z...")    │
│     → Returns true ✅                                   │
│                                                         │
│  5. Backend creates token:                              │
│     jwt.sign({ id, email, role }, SECRET, { exp: 7d })  │
│                                                         │
│  6. Backend returns:                                    │
│     { token: "eyJhbG...", member: { id, name, role } }  │
│                                                         │
│  7. Frontend saves to localStorage:                     │
│     localStorage.setItem('authToken', token)            │
│     localStorage.setItem('user', JSON.stringify(member))│
│                                                         │
│  8. Frontend redirects to dashboard                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Protected Request Flow

```
┌─────────────────────────────────────────────────────────┐
│                  PROTECTED REQUEST                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Frontend wants to get data:                         │
│     getMembers()                                        │
│                                                         │
│  2. Frontend adds token to request:                     │
│     headers: { 'Authorization': 'Bearer eyJhbG...' }    │
│                                                         │
│  3. Request hits middleware first                       │
│                                                         │
│  4. Middleware extracts token:                          │
│     "Bearer eyJhbG..." → "eyJhbG..."                    │
│                                                         │
│  5. Middleware verifies token:                          │
│     jwt.verify(token, SECRET)                           │
│     → Returns { id, email, role } ✅                    │
│                                                         │
│  6. Middleware attaches to request:                     │
│     req.user = { id, email, role }                      │
│                                                         │
│  7. Middleware calls next()                             │
│     → Request continues to route                        │
│                                                         │
│  8. Route handles request:                              │
│     console.log(req.user.email)  // Works!              │
│     res.json(data)                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Invalid Token Flow

```
┌─────────────────────────────────────────────────────────┐
│                    INVALID TOKEN                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Frontend sends request with bad/expired token       │
│                                                         │
│  2. Middleware tries to verify:                         │
│     jwt.verify(token, SECRET)                           │
│     → Throws error! ❌                                  │
│                                                         │
│  3. Middleware catches error:                           │
│     return res.status(403).json({ message: 'Invalid' }) │
│                                                         │
│  4. Route NEVER runs                                    │
│                                                         │
│  5. Frontend receives 403 error                         │
│     → Can redirect to login page                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Common Errors

### "No token provided"
```
Cause: Request has no Authorization header
Fix: Make sure frontend sends token

// Check in frontend
console.log(localStorage.getItem('authToken'));

// Check headers being sent
console.log(getAuthHeaders());
```

### "Invalid token"
```
Cause: Token expired or wrong secret
Fix: Login again to get new token

// Clear old token
localStorage.removeItem('authToken');
// Redirect to login
window.location.href = 'login.html';
```

### "Email already registered"
```
Cause: Email exists in database
Fix: Use different email or login instead
```

### "Incorrect password"
```
Cause: Password doesn't match hash
Fix: Check password spelling, use "forgot password" feature
```

### "Cannot read property of undefined"
```
Cause: Trying to use token before it exists
Fix: Check script order - api.js must load first!

<!-- WRONG -->
<script>
    isLoggedIn();  // Function doesn't exist yet!
</script>
<script src="js/api.js"></script>

<!-- CORRECT -->
<script src="js/api.js"></script>
<script>
    isLoggedIn();  // Now it exists ✅
</script>
```

---

## Security Tips

### 1. Never Store Plain Passwords
```javascript
// ❌ NEVER
password: "mypassword123"

// ✅ ALWAYS
password: await bcrypt.hash("mypassword123", 10)
```

### 2. Keep JWT_SECRET Secret
```javascript
// ❌ NEVER in code
const secret = "my_secret_key";

// ✅ ALWAYS in .env
process.env.JWT_SECRET
```

### 3. Use HTTPS in Production
```
// ❌ HTTP (data visible to hackers)
http://myapp.com

// ✅ HTTPS (data encrypted)
https://myapp.com
```

### 4. Set Token Expiry
```javascript
// ❌ Never expires (dangerous if stolen)
jwt.sign(data, secret)

// ✅ Expires in 7 days
jwt.sign(data, secret, { expiresIn: '7d' })
```

### 5. Don't Send Password Back
```javascript
// ❌ NEVER
res.json({ user: member });  // Includes password!

// ✅ ALWAYS
res.json({ 
    user: { 
        id: member.id, 
        email: member.email 
        // No password!
    } 
});
```

### 6. Add .env to .gitignore
```
# .gitignore
.env
node_modules/
```

---

## Quick Reference

### Backend Cheat Sheet

```javascript
// Hash password (register)
const hashed = await bcrypt.hash(password, 10);

// Compare password (login)
const match = await bcrypt.compare(password, hashed);

// Create token (login)
const token = jwt.sign({ id, email, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Verify token (middleware)
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### Frontend Cheat Sheet

```javascript
// Save token (after login)
localStorage.setItem('authToken', token);
localStorage.setItem('user', JSON.stringify(user));

// Get token (for requests)
localStorage.getItem('authToken');

// Check logged in
localStorage.getItem('authToken') !== null;

// Logout
localStorage.removeItem('authToken');
localStorage.removeItem('user');

// Send with request
headers: { 'Authorization': `Bearer ${token}` }
```

### HTTP Status Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Success |
| 400 | Bad Request | Wrong email/password |
| 401 | Unauthorized | No token provided |
| 403 | Forbidden | Invalid/expired token |
| 500 | Server Error | Something broke |

---

*This is your complete guide to authentication. Read it, understand it, and you'll be able to implement auth in any project!* 💪
