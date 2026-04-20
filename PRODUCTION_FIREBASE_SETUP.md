# Production Firebase Authentication Setup

## Current Issue
- Using Firebase Auth Emulator (development only)
- Google Sign-In doesn't work with emulator
- Emulator popup blocked by browser
- Not suitable for production

## Solution: Use Real Firebase Auth

### Step 1: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **colonels-academy-dev** (or create production project)
3. Click **Project Settings** (gear icon) → **Service Accounts**
4. Click **"Generate new private key"**
5. Download the JSON file
6. Save it securely (DO NOT commit to git)

### Step 2: Update Environment Variables

Update your `.env` file with values from the downloaded JSON:

```env
# Firebase Admin SDK (Server-side)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Firebase Client SDK (Browser-side)
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_APP_ID="1:xxxxx:web:xxxxx"

# IMPORTANT: Disable emulator for production
NEXT_PUBLIC_USE_FIREBASE_EMULATOR="false"
```

### Step 3: Enable Google Sign-In Provider

1. In Firebase Console → **Authentication** → **Sign-in method**
2. Click **Google** provider
3. Click **Enable**
4. Set **Project support email** (required)
5. Click **Save**

### Step 4: Configure Authorized Domains

1. In Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Add your production domain (e.g., `thecolonelsacademy.com`)
3. Keep `localhost` for development

### Step 5: Configure OAuth Consent Screen

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Fill in required information:
   - App name
   - User support email
   - Developer contact email
5. Add scopes: `email`, `profile`
6. Save

### Step 6: Configure OAuth Client

1. In Google Cloud Console → **APIs & Services** → **Credentials**
2. Find your OAuth 2.0 Client ID (created by Firebase)
3. Under **Authorized JavaScript origins**, add:
   - `https://your-domain.com`
   - `http://localhost:3001` (for development)
4. Under **Authorized redirect URIs**, add:
   - `https://your-project.firebaseapp.com/__/auth/handler`
   - `https://your-domain.com/__/auth/handler`
   - `http://localhost:3001/__/auth/handler` (for development)

### Step 7: Test Authentication

1. Stop Firebase emulator
2. Restart API and web app
3. Try Google Sign-In
4. Should work without popup blocking

## Environment-Specific Configuration

### Development (.env)
```env
NEXT_PUBLIC_USE_FIREBASE_EMULATOR="true"
NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL="http://127.0.0.1:9099"
```

### Production (.env.production)
```env
NEXT_PUBLIC_USE_FIREBASE_EMULATOR="false"
# No emulator URL needed
```

## Security Checklist

- [ ] Service account key stored securely (not in git)
- [ ] Environment variables set in production hosting
- [ ] Authorized domains configured
- [ ] OAuth consent screen configured
- [ ] Redirect URIs configured
- [ ] Firebase emulator disabled in production
- [ ] Test Google Sign-In works
- [ ] Test email/password sign-in works

## Quick Fix for Right Now

If you need to test immediately without setting up production Firebase:

1. Use **email/password authentication** instead of Google Sign-In
2. This works with Firebase emulator
3. Sign up at: http://localhost:3001/login
4. Use any email/password (emulator accepts anything)

## Production Deployment Checklist

Before deploying to production:

1. ✅ Get real Firebase service account credentials
2. ✅ Update all environment variables
3. ✅ Enable Google Sign-In provider
4. ✅ Configure authorized domains
5. ✅ Configure OAuth consent screen
6. ✅ Test authentication flow
7. ✅ Disable Firebase emulator
8. ✅ Update CORS settings on API
9. ✅ Set up proper session cookies (secure, httpOnly)
10. ✅ Test on production domain
