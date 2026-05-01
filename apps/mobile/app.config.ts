// @ts-nocheck — app.config.ts runs in Node.js context, process.env is available at build time
import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Colonels Academy",
  slug: "colonels-academy-mobile",
  scheme: "colonelsacademy",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  experiments: {
    typedRoutes: true
  },
  ios: {
    bundleIdentifier: "com.colonelsacademy.mobile",
    supportsTablet: true,
    googleServicesFile: "./GoogleService-Info.plist",
    infoPlist: {
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: [
            "com.googleusercontent.apps.996779913784-iv0j5b15951sgu0dl73hkhbv0rjj39qr"
          ]
        }
      ]
    }
  },
  android: {
    package: "com.colonelsacademymobile",
    googleServicesFile: "./google-services.json",
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: "com.colonelsacademy.mobile"
          }
        ],
        category: ["BROWSABLE", "DEFAULT"]
      }
    ]
  },
  plugins: ["expo-router", "expo-web-browser", "@react-native-google-signin/google-signin"],
  extra: {
    eas: {
      projectId: "97465248-d682-420c-b0d0-f979b6e501b0"
    },
    // Firebase configuration for standalone builds
    EXPO_PUBLIC_API_BASE_URL:
      process.env.EXPO_PUBLIC_API_BASE_URL ||
      "https://colonels-academyapi-production.up.railway.app",
    EXPO_PUBLIC_FIREBASE_API_KEY:
      process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyAHLoeOfDtsAVNiNHunVNPT-ZZk4B9ECbY",
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "colonels-academy-dev.firebaseapp.com",
    EXPO_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "colonels-academy-dev",
    EXPO_PUBLIC_FIREBASE_APP_ID:
      process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:996779913784:web:306e0c7395a2511c03eccd",
    EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID:
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
      "996779913784-9ag3q34hf9s9l6sjdj7l0a152sjrk0ba.apps.googleusercontent.com",
    EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID:
      process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
      "996779913784-lln7b2fpcbbr21052bsel09m7kaqfdhn.apps.googleusercontent.com",
    EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID:
      process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
      "996779913784-iv0j5b15951sgu0dl73hkhbv0rjj39qr.apps.googleusercontent.com",
    EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID:
      process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID || "NEED_TO_CREATE_THIS"
  }
};

export default config;
