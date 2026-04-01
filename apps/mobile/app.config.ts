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
    supportsTablet: true
  },
  android: {
    package: "com.colonelsacademy.mobile"
  },
  plugins: ["expo-router"]
};

export default config;
