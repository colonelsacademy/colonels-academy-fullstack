# Google OAuth Setup for Mobile App

## Current Issue
Google Sign-In opens the browser but fails with "Something went wrong" after account selection.

## Root Cause
The redirect URI needs to be properly configured in Google Cloud Console for Expo Go.

## Solution Steps

### 0. Check OAuth Consent Screen (IMPORTANT!)
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Make sure the OAuth consent screen is configured
3. If it says "Testing" mode, add your test email to the "Test users" list
4. OR publish the app (change from Testing to Production)

**This is often the cause of "Something went wrong" errors!**

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/apis/credentials

### 2. Select Your Project
Make sure you're in the `colonels-academy-dev` project.

### 3. Find Your OAuth 2.0 Client ID
Look for the Web Client ID: `996779913784-9ag3q34hf9s9l6sjdj7l0a152sjrk0ba.apps.googleusercontent.com`

### 4. Add Authorized Redirect URIs
Click on the client ID and add these redirect URIs:

**For Expo Go (Development):**
```
https://auth.expo.io/@anonymous/colonels-academy-mobile
```

**Important:** Also add this alternative format:
```
https://auth.expo.io/@anonymous/colonels-academy-mobile/
```
(Note the trailing slash - some OAuth providers require both)

**For Production (when you build standalone app):**
```
com.colonelsacademy.mobile:/oauthredirect
```

### 5. Verify Authorized JavaScript Origins
Make sure these are added (should already be there for web):
```
http://localhost
http://localhost:8081
http://localhost:19006
https://auth.expo.io
```

**Important:** Add `https://auth.expo.io` if it's not there - this is required for Expo's auth proxy!

### 6. Save Changes
Click "Save" at the bottom of the page.

## Testing After Configuration

1. Restart the mobile app (close and reopen Expo Go)
2. Try Google Sign-In again
3. Check the console logs for detailed error messages:
   - Look for `🚀 Starting Google Sign-In...`
   - Look for `✅ Google Sign-In SUCCESS` or `❌ Google Sign-In ERROR`
   - Check what response type you're getting

## Alternative: Create Android OAuth Client

If the above doesn't work, you may need to create a separate Android OAuth client:

1. In Google Cloud Console, click "Create Credentials" > "OAuth client ID"
2. Select "Android" as application type
3. For package name, use: `host.exp.exponent` (for Expo Go)
4. For SHA-1, use Expo's debug certificate:
   ```
   BB:0D:AC:74:D3:21:E1:43:07:71:9B:62:90:AF:A1:66:6E:44:5D:75
   ```
5. Create the client and copy the Client ID
6. Update `.env` with: `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<new-android-client-id>`
7. Update `auth-provider.tsx` to use the Android client ID for `androidClientId`

## Debugging

The app now has enhanced logging. When you try to sign in, check the console for:

- `🚀 Starting Google Sign-In...` - Sign-in initiated
- `📱 Prompt result: success/error/cancel` - Browser response
- `✅ Google Sign-In SUCCESS` - Got response from Google
- `🔑 ID Token received` - Token is valid
- `✅ Successfully signed in with Firebase` - Complete success

If you see errors, they will be prefixed with `❌` and include detailed information.

## Current Configuration

- **Web Client ID**: `996779913784-9ag3q34hf9s9l6sjdj7l0a152sjrk0ba.apps.googleusercontent.com`
- **Redirect URI**: `https://auth.expo.io/@anonymous/colonels-academy-mobile`
- **App Slug**: `colonels-academy-mobile`
- **Package Name**: `com.colonelsacademy.mobile`

## Notes

- Expo Go uses the `@anonymous` namespace when you're not logged into an Expo account
- If you log into Expo with `expo login`, the redirect URI will change to `https://auth.expo.io/@your-username/colonels-academy-mobile`
- For production builds (not Expo Go), you'll need native OAuth clients for iOS and Android
