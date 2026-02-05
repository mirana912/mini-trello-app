# ⚡ Express Backend - Quick Reference

## 🎯 What Changed?

Your project now has a **full Express.js + TypeScript backend** alongside the Next.js frontend!

### Architecture
```
Frontend (Next.js)  →  Backend (Express)  →  Firebase/Firestore
     :3000                  :5000               Cloud Database
```

## 📦 New Dependencies Added

```json
{
  "dependencies": {
    "express": "^4.18.2",           // Web server
    "cors": "^2.8.5",               // Cross-origin requests
    "firebase-admin": "^12.0.0",    // Firebase Admin SDK
    "jsonwebtoken": "^9.0.2",       // JWT tokens
    "axios": "^1.6.7",              // HTTP requests (GitHub API)
    "nodemailer": "^6.9.13",        // Email sending
    "bcryptjs": "^2.4.3"            // Password hashing
  },
  "devDependencies": {
    "ts-node": "^10.9.2",           // Run TypeScript directly
    "ts-node-dev": "^2.0.0",        // Auto-restart on changes
    "concurrently": "^8.2.2",       // Run multiple commands
    "@types/express": "^4.17.21",   // TypeScript types
    // ... other types
  }
}
```

## 🚀 New NPM Scripts

```bash
# Run backend only
npm run server

# Run frontend only
npm run dev

# Run BOTH together (recommended)
npm run dev:all

# Build backend for production
npm run server:build

# Start production backend
npm run server:start
```

## 📂 New Files Created

```
server/
├── src/
│   ├── config/
│   │   ├── index.ts              # Environment config
│   │   └── firebase.ts           # Firebase Admin setup
│   ├── controllers/
│   │   ├── authController.ts     # GitHub OAuth logic
│   │   ├── emailController.ts    # Email verification
│   │   └── githubController.ts   # GitHub API integration
│   ├── middleware/
│   │   └── auth.ts               # Auth middleware
│   ├── routes/
│   │   ├── auth.ts               # /api/auth/* routes
│   │   └── github.ts             # /api/github/* routes
│   ├── types/
│   │   └── index.ts              # TypeScript types
│   └── server.ts                 # Main Express app
├── BACKEND_GUIDE.md              # Full documentation
└── tsconfig.json                 # TypeScript config
```

## 🔑 Environment Variables to Add

Add these to your `.env.local`:

```env
# === NEW BACKEND VARIABLES ===

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT Secret (change this!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# Firebase Admin SDK
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@yourproject.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Key\n-----END PRIVATE KEY-----\n"

# Email (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@minitrello.com
```

## 🔧 Setup Steps (5 Minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Get Firebase Admin Credentials

**Go to Firebase Console:**
1. Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download JSON file
4. Copy to `.env.local`:
   ```env
   FIREBASE_CLIENT_EMAIL=<from JSON: client_email>
   FIREBASE_PRIVATE_KEY="<from JSON: private_key>"
   ```

### 3. Setup GitHub OAuth

**Go to GitHub Settings:**
1. Settings → Developer settings → OAuth Apps
2. New OAuth App:
   - Name: `Mini Trello Local`
   - Homepage: `http://localhost:3000`
   - Callback: `http://localhost:5000/api/auth/github/callback`
3. Copy Client ID & Secret to `.env.local`

### 4. Start Everything
```bash
npm run dev:all
```

You should see:
```
✅ Frontend: http://localhost:3000
✅ Backend: http://localhost:5000
```

## 🌐 API Endpoints

### Test Backend is Running
```bash
curl http://localhost:5000/health
```

Should return:
```json
{
  "success": true,
  "message": "Mini Trello API Server is running"
}
```

### Main Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Health check |
| GET | `/api/auth/github` | Get GitHub OAuth URL |
| GET | `/api/auth/github/callback` | GitHub callback |
| POST | `/api/auth/send-code` | Send verification email |
| POST | `/api/auth/verify-code` | Verify email code |
| GET | `/api/github/repositories` | Get user's repos |
| GET | `/api/github/repositories/:owner/:repo` | Get repo details |
| POST | `/api/boards/:bid/cards/:cid/tasks/:tid/github-attach` | Attach GitHub item to task |

**Full API docs:** See `server/BACKEND_GUIDE.md`

## 🧪 Quick Test

### 1. Test Email Verification
```bash
curl -X POST http://localhost:5000/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

In development, it will return the code in the response!

### 2. Test with Postman

Import this collection:
```json
{
  "info": { "name": "Mini Trello API" },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/health"
      }
    },
    {
      "name": "Send Code",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/auth/send-code",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"test@example.com\"}"
        }
      }
    }
  ]
}
```

## 🔗 Connecting Frontend to Backend

Frontend already has Firebase Auth, but you can add backend API calls:

```typescript
// lib/api.ts (create this file)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function sendCode(email: string) {
  const res = await fetch(`${API_URL}/api/auth/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function getGitHubRepos(firebaseToken: string) {
  const res = await fetch(`${API_URL}/api/github/repositories`, {
    headers: { 'Authorization': `Bearer ${firebaseToken}` },
  });
  return res.json();
}
```

Then use in components:
```typescript
import { sendCode, getGitHubRepos } from '@/lib/api';

// In your component
const handleSendCode = async () => {
  const result = await sendCode('user@example.com');
  console.log(result); // { success: true, code: "123456" }
};
```

## ✅ Checklist

Before showing to mentor:

- [ ] `npm install` completed without errors
- [ ] `.env.local` has all backend variables
- [ ] Firebase Admin credentials added
- [ ] GitHub OAuth app created
- [ ] `npm run dev:all` starts both servers
- [ ] Frontend loads at http://localhost:3000
- [ ] Backend health check works at http://localhost:5000/health
- [ ] Can test email verification endpoint

## 🎓 What You Can Tell Your Mentor

**"I've implemented a full Express.js + TypeScript backend with:**
- ✅ RESTful API architecture
- ✅ GitHub OAuth integration
- ✅ Email verification system
- ✅ Firebase Admin SDK integration
- ✅ GitHub API endpoints for repositories, PRs, commits, issues
- ✅ JWT authentication middleware
- ✅ TypeScript for type safety
- ✅ Proper error handling and logging

**The backend provides these key features:**
1. GitHub OAuth flow with token exchange
2. Email verification code generation and validation
3. GitHub repository integration (fetch branches, PRs, issues, commits)
4. Ability to attach GitHub items to tasks
5. RESTful endpoints for all operations

**It's production-ready with:**
- Environment configuration
- CORS security
- Firebase Admin integration
- TypeScript compilation
- Development hot-reload"

## 🚨 Troubleshooting

### "Port 5000 already in use"
```bash
# Find what's using port 5000
lsof -i :5000

# Kill it
kill -9 <PID>

# Or use different port
PORT=5001 npm run server
```

### "Firebase Admin error"
- Check `FIREBASE_PRIVATE_KEY` has `\n` as literal characters
- Ensure it's wrapped in double quotes
- Verify project ID matches

### "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 Resources

- Full Backend Guide: `server/BACKEND_GUIDE.md`
- Main README: `README.md`
- Setup Guide: `SETUP_GUIDE.md`
- Quick Start: `QUICKSTART.md`

---

**You now have a complete full-stack application!** 🎉

Frontend (Next.js) + Backend (Express) + Database (Firebase)
