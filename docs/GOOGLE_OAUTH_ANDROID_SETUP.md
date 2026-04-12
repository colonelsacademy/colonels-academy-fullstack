# Google OAuth for Android (Expo Go)

## The Problem

Google Sign-In is failing on Android with "Something went wrong" because we're using a Web Client ID, but Android apps need their own OAuth client.

## Solution: Create Android OAuth Client

### Step 1: Get Expo Go's SHA-1 Certificate

For Expo Go (not a standalone build), use Expo's official debug certificate:

**SHA-1 Fingerprint:**
```
BB:0D:AC:74:D3:21:E1:43:07:71:9B:62:90:AF:A1:66:6E:44:5D:75
```

### Step 2: Create Android OAuth Client in Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Select **"Android"** as Application type
4. Fill in the details:
   - **Name**: `Colonels Academy Mobile (Expo Go)`
   - **Package name**: `host.exp.exponent` (this is Expo Go's package)
   - **SHA-1 certificate fingerprint**: `BB:0D:AC:74:D3:21:E1:43:07:71:9B:62:90:AF:A1:66:6E:44:5D:75`
5. Click **"CREATE"**
6. Copy the **Client ID** that's generated

### Step 3: Update Your .env File

Add the new Android Client ID to your `.env` file:

```env
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<paste-android-client-id-here>
```

Keep the existing Web Client ID as well:
```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=996779913784-9ag3q34hf9s9l6sjdj7l0a152sjrk0ba.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<your-new-android-client-id>
```

### Step 4: Update Config Schema

The config schema needs to include the Android client ID. This should already be done, but verify:

File: `packages/config/src/env.ts`

Should include:
```typescript
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: z.string().optional(),
```

### Step 5: Update Auth Provider

The auth provider needs to use the Android client ID for Android devices.

This will be updated in the code automatically.

### Step 6: Test

1. Save all changes
2. Restart dev server: `pnpm run dev:mobile`
3. Close and reopen Expo Go on your phone
4. Try Google Sign-In again

## Alternative: Use Web Client ID with Different Config

If creating an Android client doesn't work, we can try using the Web Client ID with a different configuration that's more compatible with Expo Go.

## For Production (Standalone Builds)

When you build a standalone app (not using Expo Go), you'll need to:

1. Create a new Android OAuth client
2. Use your app's package name: `com.colonelsacademy.mobile`
3. Generate and use your app's SHA-1 certificate (not Expo Go's)

## Troubleshooting

### "Something went wrong" persists
- Verify the SHA-1 fingerprint is exactly: `BB:0D:AC:74:D3:21:E1:43:07:71:9B:62:90:AF:A1:66:6E:44:5D:75`
- Verify package name is exactly: `host.exp.exponent`
- Wait 5-10 minutes after creating the OAuth client (Google needs time to propagate)
- Clear Expo Go cache: Settings → Clear cache in Expo Go app

### Still not working
- Check console logs for specific error messages
- Verify both Web and Android client IDs are in `.env`
- Try using only email/password authentication as a fallback
