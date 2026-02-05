# 🚀 Quick Start Guide - Mini Trello App

Get up and running in 4 days!

## Day 1: Setup & Authentication ✅

### Morning (2-3 hours)
1. **Firebase Setup**
   ```bash
   # Create Firebase project at console.firebase.google.com
   # Enable Authentication (Email/Password + GitHub OAuth)
   # Create Firestore database
   ```

2. **Install Dependencies**
   ```bash
   cd mini-trello-app
   npm install
   ```

3. **Configure Environment**
   ```bash
   # Copy .env.example to .env.local
   # Add your Firebase credentials from Firebase Console
   ```

### Afternoon (3-4 hours)
4. **Test Authentication**
   ```bash
   npm run dev
   # Test sign up and sign in at http://localhost:3000
   ```

5. **Customize UI**
   - Update colors in `app/globals.css`
   - Customize landing page in `app/page.tsx`
   - Test responsive design

**Day 1 Checklist:**
- [ ] Firebase project created
- [ ] Authentication working (email + GitHub)
- [ ] Environment variables configured
- [ ] App running on localhost:3000
- [ ] Landing page customized

---

## Day 2: Boards & Cards 📋

### Morning (3-4 hours)
1. **Test Board Creation**
   - Sign in to your app
   - Create your first board
   - Edit board details
   - Test board deletion

2. **Test Card Management**
   - Create multiple cards
   - Add card descriptions
   - View card tasks counter

### Afternoon (3-4 hours)
3. **Firestore Rules**
   - Update security rules (see README.md)
   - Test permissions
   - Verify data security

4. **UI Polish**
   - Adjust card layouts
   - Test responsive grid
   - Add loading states

**Day 2 Checklist:**
- [ ] Can create/edit/delete boards
- [ ] Can create/edit cards
- [ ] Firestore rules configured
- [ ] Data persists correctly
- [ ] UI is responsive

---

## Day 3: Tasks & Drag-Drop 🎯

### Morning (3-4 hours)
1. **Task Management**
   - Create tasks in different statuses
   - Test task creation form
   - Verify task counting

2. **Drag & Drop**
   - Test dragging tasks between columns
   - Verify status updates in Firestore
   - Check real-time sync (open in 2 browsers)

### Afternoon (3-4 hours)
3. **Task Features**
   - Add task priorities
   - Test task assignment
   - Add deadline tracking (optional)

4. **Polish Kanban Board**
   - Adjust column widths
   - Add smooth animations
   - Test on mobile devices

**Day 3 Checklist:**
- [ ] Task creation working
- [ ] Drag & drop functional
- [ ] Status updates persist
- [ ] Real-time sync working
- [ ] Mobile-friendly

---

## Day 4: Testing & Deployment 🚀

### Morning (2-3 hours)
1. **Feature Testing**
   - Test all user flows
   - Check error handling
   - Test with multiple users
   - Mobile testing

2. **Bug Fixes**
   - Fix any issues found
   - Optimize performance
   - Clean up console logs

### Afternoon (3-4 hours)
3. **Deployment**
   ```bash
   # Option 1: Firebase Hosting
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   npm run build
   firebase deploy

   # Option 2: Vercel
   # Push to GitHub
   # Import to Vercel
   # Add environment variables
   # Deploy
   ```

4. **Final Checks**
   - Test deployed app
   - Verify all features work in production
   - Share with team/mentor

**Day 4 Checklist:**
- [ ] All features tested
- [ ] No critical bugs
- [ ] App deployed to production
- [ ] Production URL accessible
- [ ] Demo prepared

---

## Essential Commands

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build           # Build for production
npm start              # Start production server

# Firebase
firebase login         # Login to Firebase
firebase init          # Initialize Firebase
firebase deploy        # Deploy to Firebase Hosting

# Troubleshooting
rm -rf .next node_modules
npm install
npm run dev
```

---

## Testing Checklist

### Authentication ✅
- [ ] Email sign up
- [ ] Email sign in
- [ ] GitHub OAuth
- [ ] Sign out
- [ ] Protected routes

### Boards ✅
- [ ] Create board
- [ ] View boards list
- [ ] Open board details
- [ ] Edit board
- [ ] Delete board

### Cards ✅
- [ ] Create card
- [ ] View cards
- [ ] Edit card
- [ ] Delete card

### Tasks ✅
- [ ] Create task
- [ ] Drag between columns
- [ ] Edit task
- [ ] Delete task
- [ ] Real-time sync

### UI/UX ✅
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Fast loading
- [ ] Smooth animations
- [ ] Error messages clear

---

## Common Issues & Solutions

### Issue: Firebase connection error
**Solution:**
```bash
# Check .env.local file exists
# Verify all Firebase credentials are correct
# Ensure Firebase project is active
```

### Issue: Drag & drop not working
**Solution:**
```bash
# Clear browser cache
# Check @dnd-kit is installed
npm install @dnd-kit/core @dnd-kit/sortable
```

### Issue: Real-time not syncing
**Solution:**
```bash
# Check Firestore rules allow read/write
# Verify Firestore database is created
# Open in incognito to test
```

### Issue: Build errors
**Solution:**
```bash
rm -rf .next node_modules
npm install
npm run dev
```

---

## Demo Script (for Presentation)

1. **Landing Page** (30 sec)
   - Show features overview
   - Highlight key benefits

2. **Authentication** (1 min)
   - Sign up with email
   - Show GitHub OAuth

3. **Dashboard** (1 min)
   - Create a board
   - Show boards list

4. **Board Detail** (2 min)
   - Create cards
   - Create tasks
   - Drag tasks between columns
   - Show real-time sync (2 browsers)

5. **Collaboration** (1 min)
   - Invite team member
   - Show shared board

6. **Mobile Demo** (30 sec)
   - Show responsive design
   - Test on phone/tablet

**Total: ~6 minutes**

---

## Resources

- **Firebase Console**: https://console.firebase.google.com/
- **Next.js Docs**: https://nextjs.org/docs
- **Bootstrap Docs**: https://getbootstrap.com/docs
- **dnd-kit Docs**: https://docs.dndkit.com/

---

## Support

If you run into issues:
1. Check the README.md
2. Review Firebase documentation
3. Check browser console for errors
4. Ask your mentor for help

Good luck! 🎉
