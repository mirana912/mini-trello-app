# 🔧 Express Backend Setup Guide

## Overview

This Express.js + TypeScript backend provides:
- ✅ GitHub OAuth authentication
- ✅ Email verification code system
- ✅ GitHub repository integration (branches, PRs, commits, issues)
- ✅ RESTful API endpoints
- ✅ Firebase Admin SDK integration

## 📁 Backend Structure

```
server/
├── src/
│   ├── config/
│   │   ├── index.ts           # Environment configuration
│   │   └── firebase.ts        # Firebase Admin initialization
│   ├── controllers/
│   │   ├── authController.ts  # GitHub OAuth logic
│   │   ├── emailController.ts # Email verification
│   │   └── githubController.ts # GitHub API integration
│   ├── middleware/
│   │   └── auth.ts            # Authentication middleware
│   ├── routes/
│   │   ├── auth.ts            # Auth routes
│   │   └── github.ts          # GitHub routes
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   └── server.ts              # Main Express app
├── dist/                      # Compiled JavaScript (generated)
└── tsconfig.json              # TypeScript config
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This installs both frontend and backend dependencies.

### 2. Configure Environment Variables

Create `.env.local` in the project root:

```env
# Frontend Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc

# Backend Config
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT Secret
JWT_SECRET=your-super-secret-key-change-this

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# Firebase Admin SDK
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Key_Here\n-----END PRIVATE KEY-----\n"

# Email (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### 3. Get Firebase Admin Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon)
4. Go to **Service Accounts** tab
5. Click **Generate new private key**
6. Download the JSON file
7. Copy values to `.env.local`:
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and \n)

### 4. Setup GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: Mini Trello Local
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:5000/api/auth/github/callback`
4. Click **Register application**
5. Copy **Client ID** and **Client Secret** to `.env.local`

### 5. Run the Backend

```bash
# Development mode (auto-restart on changes)
npm run server

# Or run both frontend and backend together
npm run dev:all
```

Backend will start on: `http://localhost:5000`

## 📚 API Endpoints

### Health Check
```
GET /health
```
Response:
```json
{
  "success": true,
  "message": "Mini Trello API Server is running",
  "timestamp": "2024-02-05T12:00:00.000Z"
}
```

### Authentication

#### 1. Initiate GitHub OAuth
```
GET /api/auth/github
```
Response:
```json
{
  "success": true,
  "data": {
    "authUrl": "https://github.com/login/oauth/authorize?client_id=..."
  }
}
```

#### 2. GitHub OAuth Callback (handled automatically)
```
GET /api/auth/github/callback?code=xxx
```
Redirects to frontend with token.

#### 3. Send Verification Code
```
POST /api/auth/send-code
Content-Type: application/json

{
  "email": "user@example.com"
}
```
Response:
```json
{
  "success": true,
  "message": "Verification code sent to email",
  "code": "123456"  // Only in development
}
```

#### 4. Verify Code
```
POST /api/auth/verify-code
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```
Response:
```json
{
  "success": true,
  "message": "Code verified successfully"
}
```

### GitHub Integration

All GitHub endpoints require authentication header:
```
Authorization: Bearer <firebase-token>
```

#### 1. Get User Repositories
```
GET /api/github/repositories
Authorization: Bearer <token>
```
Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 123456,
      "name": "my-repo",
      "full_name": "username/my-repo",
      "private": false,
      "html_url": "https://github.com/username/my-repo",
      "description": "My awesome repository"
    }
  ]
}
```

#### 2. Get Repository Info (Branches, PRs, Issues, Commits)
```
GET /api/github/repositories/:owner/:repo
Authorization: Bearer <token>
```
Response:
```json
{
  "success": true,
  "data": {
    "repositoryId": "username/repo-name",
    "branches": [...],
    "pulls": [...],
    "issues": [...],
    "commits": [...]
  }
}
```

#### 3. Attach GitHub Item to Task
```
POST /api/boards/:boardId/cards/:cardId/tasks/:taskId/github-attach
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "pull_request",
  "number": "42",
  "title": "Fix login bug",
  "url": "https://github.com/user/repo/pull/42"
}
```

#### 4. Get Task GitHub Attachments
```
GET /api/boards/:boardId/cards/:cardId/tasks/:taskId/github-attachments
Authorization: Bearer <token>
```

#### 5. Remove GitHub Attachment
```
DELETE /api/boards/:boardId/cards/:cardId/tasks/:taskId/github-attachments/:attachmentId
Authorization: Bearer <token>
```

## 🔌 Connecting Frontend to Backend

### Update Frontend API Calls

Create `lib/api.ts` in your frontend:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const sendVerificationCode = async (email: string) => {
  const response = await fetch(`${API_URL}/api/auth/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return response.json();
};

export const verifyCode = async (email: string, code: string) => {
  const response = await fetch(`${API_URL}/api/auth/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  return response.json();
};

export const getUserRepositories = async (token: string) => {
  const response = await fetch(`${API_URL}/api/github/repositories`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json();
};
```

## 🧪 Testing the Backend

### 1. Test Health Check
```bash
curl http://localhost:5000/health
```

### 2. Test Send Code (Development)
```bash
curl -X POST http://localhost:5000/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 3. Test with Postman

Import these endpoints into Postman:
1. Create new collection "Mini Trello API"
2. Add environment variable `baseUrl` = `http://localhost:5000`
3. Add requests for each endpoint above

## 📦 Production Deployment

### Build Backend
```bash
npm run server:build
```

This compiles TypeScript to JavaScript in `server/dist/`.

### Start Production Server
```bash
npm run server:start
```

### Deploy Options

#### Option 1: Heroku
```bash
# Add Procfile
echo "web: npm run server:start" > Procfile

# Deploy
heroku create mini-trello-api
git push heroku main
```

#### Option 2: Railway.app
1. Connect GitHub repo
2. Set environment variables
3. Deploy automatically

#### Option 3: DigitalOcean App Platform
1. Import repo
2. Configure build command: `npm run server:build`
3. Configure run command: `npm run server:start`

## 🔒 Security Checklist

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Enable CORS only for your frontend domain
- [ ] Use HTTPS in production
- [ ] Keep Firebase private key secure (never commit)
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting (add `express-rate-limit`)
- [ ] Validate all user inputs
- [ ] Set up proper error logging

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill process if needed
kill -9 <PID>

# Or use different port
PORT=5001 npm run server
```

### Firebase Admin error
- Check `FIREBASE_PRIVATE_KEY` has proper escaping
- Ensure JSON structure is correct
- Verify service account has correct permissions

### GitHub OAuth not working
- Check callback URL matches exactly
- Verify client ID and secret
- Ensure GitHub app is not suspended

## 📊 Development Tips

### Hot Reload
Backend uses `ts-node-dev` for auto-restart on file changes.

### Logging
All requests are logged with timestamp and method.

### Add New Endpoints
1. Create controller in `server/src/controllers/`
2. Create route in `server/src/routes/`
3. Import route in `server/src/server.ts`

### Example: Add new route
```typescript
// server/src/routes/boards.ts
import { Router } from 'express';
import { verifyFirebaseToken } from '../middleware/auth';

const router = Router();

router.get('/', verifyFirebaseToken, async (req, res) => {
  // Your logic here
  res.json({ success: true, data: [] });
});

export default router;

// In server.ts
import boardRoutes from './routes/boards';
app.use('/api/boards', boardRoutes);
```

## ✅ Summary

Your Express backend is now set up with:
- ✅ TypeScript for type safety
- ✅ GitHub OAuth integration
- ✅ Email verification system
- ✅ Firebase Admin SDK
- ✅ RESTful API structure
- ✅ Authentication middleware
- ✅ Error handling
- ✅ Development hot reload

**Next Steps:**
1. Start backend: `npm run server`
2. Test endpoints with curl or Postman
3. Connect frontend to backend API
4. Deploy to production

Good luck! 🚀
