# Google Sign-In Troubleshooting Checklist

## Quick Checklist

When you see "Something went wrong" after selecting your Google account, check these in order:

### ✅ 1. OAuth Consent Screen Configuration
**Most Common Issue!**

Go to: https://console.cloud.google.com/apis/credentials/consent

- [ ] OAuth consent screen is configured
- [ ] If in "Testing" mode: Your email is added to "Test users" list
- [ ] OR: App is published (changed to "Production" mode)

### ✅ 2. Authorized Redirect URIs
Go to: https://console.cloud.google.com/apis/credentials

Click on your Web Client ID and verify:

- [ ] `https://auth.expo.io/@anonymous/colonels-academy-mobile` is listed
- [ ] `https://auth.expo.io/@anonymous/colonels-academy-mobile/` (with trailing slash) is listed

### ✅ 3. Authorized JavaScript Origins
In the same OAuth client configuration:

- [ ] `https://auth.expo.io` is listed
- [ ] `http://localhost` is listed
- [ ] `http://localhost:8081` is listed

### ✅ 4. Client ID in App
Check your `.env` file:

- [ ] `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is set
- [ ] Value matches the Client ID from Google Cloud Console
- [ ] No extra spaces or quotes

### ✅ 5. App Configuration
Check `app.config.ts`:

- [ ] `slug` is set to `colonels-academy-mobile`
- [ ] `scheme` is set (currently: `colonelsacademy`)

## Testing Steps

After verifying the above:

1. **Close Expo Go completely** (swipe away from recent apps)
2. **Restart the dev server**: Stop and run `pnpm run dev:mobile` again
3. **Reopen Expo Go** and scan the QR code
4. **Try Google Sign-In** and watch the console logs

## Console Logs to Look For

When you press the Google Sign-In button, you should see:

```
🔧 Google Auth Configuration:
  Client ID: ✅ Set
  Request ready: ✅ Yes
  Redirect URI: https://auth.expo.io/@anonymous/colonels-academy-mobile

🚀 Starting Google Sign-In...
Request ready: true
📱 Prompt result: success
✅ Google Sign-In SUCCESS
Response params: { ... }
🔑 ID Token received, creating credential...
✅ Successfully signed in with Firebase
✅ User authenticated, navigating to home...
```

## Common Error Messages

### "Something went wrong"
**Cause**: Usually OAuth consent screen issue or unauthorized test user

**Fix**: 
1. Add your email to test users in OAuth consent screen
2. OR publish the app to production mode

### "Access blocked: Authorization Error"
**Cause**: App not verified or user not in test users list

**Fix**: Add user to test users or verify the app

### "Invalid Redirect URI"
**Cause**: Redirect URI not whitelisted in Google Cloud Console

**Fix**: Add the exact redirect URI to authorized redirect URIs

### "Client ID property must be defined"
**Cause**: Environment variable not loaded

**Fix**: 
1. Check `.env` file has `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
2. Restart dev server
3. Clear Expo cache: `pnpm run dev:mobile --clear`

## Alternative: Email/Password Sign-In

If Google Sign-In continues to have issues, you can use email/password authentication which works reliably in Expo Go:

1. The login screen already has email/password fields
2. Users can create accounts via Firebase Console or your web app
3. Mobile app can sign in with those credentials

## Need More Help?

Share these details:

1. Complete console logs from when you press "Sign in with Google"
2. Screenshot of your OAuth consent screen configuration
3. Screenshot of your OAuth client's authorized redirect URIs
4. Whether your app is in "Testing" or "Production" mode
