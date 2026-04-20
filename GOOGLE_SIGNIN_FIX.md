# Google Sign-In Fix - Complete Guide

## ✅ Changes Made

### 1. Disabled Firebase Emulator
- Changed `NEXT_PUBLIC_USE_FIREBASE_EMULATOR` from `"true"` to `"false"` in both `.env` and `apps/web/.env.local`
- **Reason:** Google Sign-In doesn't work with Firebase Auth Emulator - it requires real Firebase Auth

### 2. Improved Error Handling
- Added detailed console logging for debugging
- Better error messages for common issues (popup blocked, unauthorized domain, etc.)
- Added fallback to redirect if popup is blocked

### 3. Enhanced Google Sign-In Flow
- Added explicit OAuth scopes (profile, email)
- Better popup/redirect handling
- Fixed admin role check (changed from "admin" to "ADMIN")

### 4. Fixed Cache Issues
- Cleared Next.js `.next` and `.turbo` cache directories
- Restarted with clean build to ensure environment variables are loaded

## 🚀 Current Status

- ✅ Firebase emulator disabled
- ✅ Google Sign-In code improved with better error handling
- ✅ Web app running on **http://localhost:3003**
- ✅ API running on **http://localhost:4000**
- ✅ Clean build with no cache issues
- ⚠️ **Action Required:** Configure Google Sign-In in Firebase Console (see steps below)

To make Google Sign-In work, you need to configure it in Firebase Console:

### Step 1: Enable Google Sign-In Provider
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **colonels-academy-dev**
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Google** provider
5. Click **Enable**
6. Set **Project support email** (required)
7. Click **Save**

### Step 2: Add Authorized Domains
1. In Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Make sure these domains are added:
   - `localhost` (should be there by default)
   - `colonels-academy-dev.firebaseapp.com`
   - Any production domains you'll use

### Step 3: Verify OAuth Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **colonels-academy-dev**
3. Navigate to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID
5. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3003`
   - `http://localhost:3000`
6. Under **Authorized redirect URIs**, add:
   - `http://localhost:3003/__/auth/handler`
   - `http://localhost:3000/__/auth/handler`
   - `https://colonels-academy-dev.firebaseapp.com/__/auth/handler`

## 🧪 Testing Google Sign-In

1. **Open the app:** http://localhost:3003/login
2. **Click "Continue with Google"**
3. **Check browser console** for detailed logs:
   - "Starting Google sign-in..."
   - "Google sign-in successful via popup"
   - "Getting ID token..."
   - "Logging in with backend..."
   - "Redirecting to: /my-learning"

## 🐛 Common Issues & Solutions

### Issue: "Popup was blocked"
**Solution:** Allow popups for localhost in your browser settings, or the app will automatically try redirect method

### Issue: "This domain is not authorized"
**Solution:** Add your domain to Firebase Console → Authentication → Authorized domains

### Issue: "auth/unauthorized-domain"
**Solution:** 
1. Check Firebase Console authorized domains
2. Check Google Cloud Console OAuth redirect URIs
3. Make sure the domain matches exactly (including port number)

### Issue: Sign-in works but redirects to wrong page
**Solution:** Check the `next` query parameter in the URL, or it defaults to `/my-learning`

### Issue: "Not an admin" error when accessing /admin
**Solution:** 
1. User needs to be in database with role "ADMIN" (uppercase)
2. Check database: `SELECT * FROM "User" WHERE email = 'your-email@gmail.com';`
3. Update role: `UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@gmail.com';`

## 📝 Admin User Setup

After successful Google sign-in, to make a user an admin:

```sql
-- Connect to database
psql postgresql://postgres:postgres@localhost:5434/colonels_academy

-- Check current user
SELECT id, email, "displayName", role FROM "User" WHERE email = 'your-email@gmail.com';

-- Update to admin
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@gmail.com';

-- Verify
SELECT id, email, "displayName", role FROM "User" WHERE email = 'your-email@gmail.com';
```

## 🚀 Current Status

- ✅ Firebase emulator disabled
- ✅ Google Sign-In code improved with better error handling
- ✅ Web app running on http://localhost:3003
- ✅ API running on http://localhost:4000
- ⚠️ **Action Required:** Configure Google Sign-In in Firebase Console (see steps above)

## 📞 Next Steps

1. **Configure Firebase Console** (see Step 1-3 above)
2. **Test Google Sign-In** at http://localhost:3003/login
3. **Check browser console** for any errors
4. **Update user role to ADMIN** in database if needed
5. **Access admin panel** at http://localhost:3003/admin

## 🔍 Debugging Tips

If Google Sign-In still doesn't work:

1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Try signing in** and watch for error messages
4. **Check Network tab** for failed requests
5. **Look for Firebase errors** in console

Common error codes:
- `auth/popup-blocked` → Allow popups
- `auth/unauthorized-domain` → Add domain to Firebase
- `auth/operation-not-allowed` → Enable Google provider in Firebase
- `auth/invalid-api-key` → Check Firebase config in .env files
