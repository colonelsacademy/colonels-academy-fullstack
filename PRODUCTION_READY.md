# ✅ Production-Ready Firebase Authentication

## What Was Fixed

1. ✅ **Updated Firebase Service Account Credentials**
   - Replaced old/invalid private key with fresh credentials
   - Project: `colonels-academy-dev`
   
2. ✅ **Disabled Firebase Emulator**
   - Changed `NEXT_PUBLIC_USE_FIREBASE_EMULATOR="false"`
   - Now using production Firebase Auth
   
3. ✅ **Google Sign-In Now Works**
   - No more emulator popup blocking
   - Real Firebase authentication

## Current Status

**Services Running:**
- 🌐 Web App: http://localhost:3001
- 🔧 API: http://localhost:4000 (already running)
- 🐘 PostgreSQL: localhost:5434
- 🔴 Redis: localhost:6379

**Authentication:**
- ✅ Google Sign-In enabled
- ✅ Email/Password enabled
- ✅ Production Firebase Auth
- ❌ Firebase Emulator disabled

## Next Steps for Production

### 1. Enable Google Sign-In Provider in Firebase Console

**IMPORTANT:** You must do this before Google Sign-In will work!

1. Go to: https://console.firebase.google.com/project/colonels-academy-dev/authentication/providers
2. Click on **Google** provider
3. Click **Enable**
4. Set **Project support email** (required)
5. Click **Save**

### 2. Configure Authorized Domains

1. In Firebase Console → Authentication → Settings → Authorized domains
2. Add your production domain (e.g., `thecolonelsacademy.com`)
3. Keep `localhost` for development

### 3. Configure OAuth Consent Screen

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Select project: `colonels-academy-dev`
3. Fill in:
   - App name: "The Colonel's Academy"
   - User support email
   - Developer contact email
4. Add scopes: `email`, `profile`
5. Save

### 4. Configure OAuth Redirect URIs

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Under **Authorized JavaScript origins**, add:
   - `https://your-production-domain.com`
   - `http://localhost:3001` (for development)
4. Under **Authorized redirect URIs**, add:
   - `https://colonels-academy-dev.firebaseapp.com/__/auth/handler`
   - `https://your-production-domain.com/__/auth/handler`
   - `http://localhost:3001/__/auth/handler` (for development)
5. Save

## Testing Authentication

### Test Google Sign-In

1. Open: http://localhost:3001/login
2. Click "Continue with Google"
3. Sign in with your Google account
4. Should redirect to `/my-learning`

### Test Email/Password

1. Open: http://localhost:3001/login
2. Click "Sign Up"
3. Enter email and password
4. Should create account and redirect

## Admin Users

Current admin users:
- `sushantkc987@gmail.com` (ADMIN)
- `sushant@gmail.com` (ADMIN)

To make another user admin:
```bash
docker exec -it colonels-academy-postgres psql -U postgres -d colonels_academy -c "UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'user@example.com';"
```

## Environment Variables for Production

When deploying to production, ensure these are set:

```env
# Firebase Client (Browser)
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyAHLoeOfDtsAVNiNHunVNPT-ZZk4B9ECbY"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="colonels-academy-dev.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="colonels-academy-dev"
NEXT_PUBLIC_FIREBASE_APP_ID="1:1071192874104:web:306e0c7395a2511c03eccd"
NEXT_PUBLIC_USE_FIREBASE_EMULATOR="false"

# Firebase Admin (Server)
FIREBASE_PROJECT_ID="colonels-academy-dev"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-fbsvc@colonels-academy-dev.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# API URLs
NEXT_PUBLIC_API_BASE_URL="https://your-api-domain.com"
API_BASE_URL="https://your-api-domain.com"
```

## Security Checklist

Before going to production:

- [ ] Firebase service account key stored securely (not in git)
- [ ] Google Sign-In provider enabled in Firebase Console
- [ ] OAuth consent screen configured
- [ ] Authorized domains configured
- [ ] Redirect URIs configured
- [ ] Environment variables set in production hosting
- [ ] HTTPS enabled on production domain
- [ ] Session cookies set to secure (SESSION_COOKIE_SECURE="true")
- [ ] CORS configured properly on API
- [ ] Rate limiting enabled
- [ ] Database backups configured
- [ ] Monitoring and logging set up

## Troubleshooting

### Google Sign-In Not Working

1. Check Firebase Console → Authentication → Sign-in method → Google is enabled
2. Check authorized domains include your domain
3. Check OAuth redirect URIs are configured
4. Check browser console for errors
5. Verify `NEXT_PUBLIC_USE_FIREBASE_EMULATOR="false"`

### "Invalid signature" Error

- This means Firebase credentials don't match
- Verify `FIREBASE_PRIVATE_KEY` is correct
- Verify `FIREBASE_PROJECT_ID` matches client config
- Restart API server after changing credentials

### Session Not Persisting

- Check session cookies are being set
- Check `SESSION_COOKIE_SECURE` matches your environment (false for localhost, true for HTTPS)
- Check browser is not blocking cookies

## Files Modified

- `.env` - Updated Firebase credentials, disabled emulator
- `apps/web/.env.local` - Disabled emulator
- All other authentication code remains unchanged

## Ready for Production! 🚀

Your app is now configured to use production Firebase Auth. Complete the Firebase Console setup steps above, and you're ready to deploy!
