# Mini Trello - Real-Time Board Management Tool

A full-stack collaborative project management application built with Next.js, Firebase, and Bootstrap.

## 🚀 Features

- ✅ **Authentication**: Email verification & GitHub OAuth
- ✅ **Board Management**: Create and manage multiple boards
- ✅ **Card System**: Organize projects with cards
- ✅ **Task Management**: Create, update, and track tasks
- ✅ **Drag & Drop**: Intuitive kanban-style task management
- ✅ **Real-Time Sync**: Live updates across all connected users (via Firestore)
- ✅ **Team Collaboration**: Invite members to boards
- ✅ **GitHub Integration**: Link PRs, commits, and issues to tasks
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Bootstrap 5 + react-bootstrap
- @dnd-kit (Drag and Drop)
- React Icons

**Backend:**
- Express.js + TypeScript
- Node.js
- Firebase Admin SDK
- Nodemailer (Email verification)
- Axios (GitHub API)

**Database & Services:**
- Firebase Authentication
- Firebase Firestore (Database)
- Firebase Hosting (Deployment)
- GitHub OAuth

**Key Libraries:**
- `firebase` - Firebase SDK
- `firebase-admin` - Firebase Admin SDK for backend
- `express` - Web server framework
- `@dnd-kit/core` & `@dnd-kit/sortable` - Drag and drop
- `react-bootstrap` - UI components
- `date-fns` - Date formatting
- `nodemailer` - Email sending
- `jsonwebtoken` - JWT tokens

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- npm or yarn package manager
- A Firebase account (free tier is sufficient)
- (Optional) A GitHub account for OAuth integration

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd mini-trello-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

#### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `mini-trello-app`
4. Disable Google Analytics (optional)
5. Click "Create project"

#### Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password**
3. Enable **GitHub** (optional):
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Create a new OAuth App
   - Copy Client ID and Client Secret to Firebase

#### Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Start in **production mode**
4. Choose a location close to your users

#### Update Firestore Rules

Go to **Firestore Database** > **Rules** and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User must be authenticated
    function isSignedIn() {
      return request.auth != null;
    }
    
    // User owns the document
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn();
      allow write: if isOwner(userId);
    }
    
    // Boards collection
    match /boards/{boardId} {
      allow read: if isSignedIn() && 
                     resource.data.members.hasAny([request.auth.uid]);
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() && 
                                resource.data.ownerId == request.auth.uid;
    }
    
    // Cards collection
    match /cards/{cardId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn();
    }
    
    // Tasks collection
    match /tasks/{taskId} {
      allow read, write: if isSignedIn();
    }
    
    // Invitations collection
    match /invitations/{invitationId} {
      allow read, write: if isSignedIn();
    }
    
    // GitHub attachments
    match /github_attachments/{attachmentId} {
      allow read, write: if isSignedIn();
    }
    
    // Verification codes
    match /verification_codes/{codeId} {
      allow read, write: if isSignedIn();
    }
  }
}
```

#### Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps"
3. Click the **Web** icon (`</>`)
4. Register your app
5. Copy the `firebaseConfig` object

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Fill in your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional: GitHub OAuth
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
```

### 5. Run Development Server

**Option 1: Run Frontend Only**
```bash
npm run dev
```

**Option 2: Run Backend Only**
```bash
npm run server
```

**Option 3: Run Both Together (Recommended)**
```bash
npm run dev:all
```

Open [http://localhost:3000](http://localhost:3000) for frontend.
Backend API runs on [http://localhost:5000](http://localhost:5000).

**See `server/BACKEND_GUIDE.md` for detailed backend documentation.**

## 📁 Project Structure

```
mini-trello-app/
├── app/                      # Next.js app directory
│   ├── auth/                # Authentication pages
│   │   ├── signin/         # Sign in page
│   │   └── signup/         # Sign up page
│   ├── dashboard/          # Protected dashboard
│   │   ├── boards/        # Board detail pages
│   │   └── page.tsx       # Dashboard home
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/             # Reusable components
│   ├── NavigationBar.tsx  # Top navigation
│   ├── ProtectedRoute.tsx # Auth guard
│   └── TaskCard.tsx       # Draggable task card
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication state
├── lib/                   # Utility functions
│   ├── auth.ts           # Auth helpers
│   ├── firebase.ts       # Firebase config
│   └── firestore.ts      # Database operations
├── server/                # Express.js backend ⭐ NEW
│   ├── src/
│   │   ├── config/       # Backend configuration
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Auth middleware
│   │   ├── routes/       # API routes
│   │   ├── types/        # TypeScript types
│   │   └── server.ts     # Main server file
│   ├── BACKEND_GUIDE.md  # Backend documentation
│   └── tsconfig.json     # TypeScript config
├── types/                # TypeScript types
│   └── index.ts          # Type definitions
├── public/               # Static assets
├── .env.example          # Environment template
├── next.config.js        # Next.js config
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

## 🎯 Usage Guide

### Creating Your First Board

1. Sign up or sign in
2. Click "Create Your First Board" or the "+" button
3. Enter board name and description
4. Click "Create Board"

### Managing Cards & Tasks

1. Open a board
2. Click "Add Card" to create a project card
3. Click "Add Task" on any card
4. Choose task status (Icebox, Backlog, Ongoing, Waiting for Review, Done)
5. Drag and drop tasks between columns

### Inviting Team Members

1. Open a board
2. Click "Invite Members"
3. Enter member email
4. Member receives invitation notification

### Task Statuses

- **Icebox**: Ideas and future tasks
- **Backlog**: Planned tasks
- **Ongoing**: Currently in progress
- **Waiting for Review**: Pending review
- **Done**: Completed tasks

## 🚀 Deployment

### Deploy to Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase:
```bash
firebase init hosting
```

Select:
- Use existing project
- Public directory: `out`
- Configure as single-page app: `Yes`
- Set up automatic builds: `No`

4. Update `package.json` scripts:
```json
{
  "scripts": {
    "build": "next build",
    "export": "next export",
    "deploy": "npm run build && npm run export && firebase deploy"
  }
}
```

5. Update `next.config.js`:
```javascript
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
}
```

6. Deploy:
```bash
npm run deploy
```

### Deploy to Vercel (Alternative)

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables from `.env.local`
5. Deploy

## 🔐 Security Notes

1. **Never commit** `.env.local` to version control
2. Keep Firebase API keys secure (restrict in Firebase Console)
3. Update Firestore security rules for production
4. Enable App Check in Firebase for additional security

## 🐛 Troubleshooting

### Common Issues

**Build errors:**
```bash
rm -rf .next node_modules
npm install
npm run dev
```

**Firebase connection issues:**
- Verify `.env.local` credentials
- Check Firebase project is active
- Ensure Firestore and Authentication are enabled

**Drag and drop not working:**
- Check @dnd-kit dependencies are installed
- Clear browser cache
- Ensure tasks have unique IDs

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Bootstrap Documentation](https://getbootstrap.com/docs)
- [dnd-kit Documentation](https://docs.dndkit.com/)

## 📝 TODO / Future Enhancements

- [ ] Email verification code sending (Nodemailer integration)
- [ ] GitHub repository linking
- [ ] Task comments and activity log
- [ ] File attachments
- [ ] Due date reminders
- [ ] Advanced filtering and search
- [ ] Board templates
- [ ] Mobile app (React Native)

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using Next.js, Firebase, and Bootstrap
