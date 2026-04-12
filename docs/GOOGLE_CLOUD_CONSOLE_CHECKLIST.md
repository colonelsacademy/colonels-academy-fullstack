# Google Cloud Console Setup Checklist

Go to: https://console.cloud.google.com/apis/credentials

## ✅ Web Client ID Configuration

Find your Web Client ID: `996779913784-9ag3q34hf9s9l6sjdj7l0a152sjrk0ba.apps.googleusercontent.com`

### Authorized JavaScript origins:
- [ ] `http://localhost`
- [ ] `http://localhost:8081`
- [ ] `https://auth.expo.io` ⚠️ **CRITICAL FOR EXPO**
- [ ] `https://colonels-academy-dev.firebaseapp.com`

### Authorized redirect URIs:
- [ ] `http://localhost:8081`
- [ ] `https://colonels-academy-dev.firebaseapp.com/__/auth/handler`
- [ ] `https://auth.expo.io/@anonymous/colonels-academy-mobile` ⚠️ **CRITICAL FOR EXPO GO**
- [ ] `colonelsacademy://` (for standalone builds)

---

## ✅ Android OAuth Client

**For Expo Go (Development):**

- [ ] Create Android OAuth client
- [ ] Application type: **Android**
- [ ] Package name: `host.exp.exponent` ⚠️ **Must be exact for Expo Go**
- [ ] SHA-1 certificate: `BB:0D:AC:74:D3:21:E1:43:07:71:9B:62:90:AF:A1:66:6E:44:5D:75` ⚠️ **Expo Go's certificate**

**For Production Build (Future):**

- [ ] Create separate Android OAuth client
- [ ] Package name: `com.colonelsacademy.mobile`
- [ ] SHA-1: Your app's signing certificate

---

## ✅ iOS OAuth Client (Optional for now)

**For Expo Go (Development):**

- [ ] Create iOS OAuth client
- [ ] Bundle ID: `host.exp.Exponent` (Expo Go's bundle ID)

**For Production Build (Future):**

- [ ] Create separate iOS OAuth client
- [ ] Bundle ID: `com.colonelsacademy.mobile`

---

## ✅ OAuth Consent Screen

- [ ] Publishing status: **In production** (or add test users if in Testing mode)
- [ ] Scopes include: `email`, `profile`, `openid`

---

## After Making Changes

1. Click **SAVE** at the bottom of each OAuth client page
2. Wait 2-5 minutes for changes to propagate
3. Copy the Android Client ID
4. Add to `.env`: `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<android-client-id>`
5. Restart dev server completely
6. Close and reopen Expo Go app
7. Test Google Sign-In
