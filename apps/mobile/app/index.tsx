import { Redirect } from "expo-router";
import { useAuth } from "../src/providers/auth-provider";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { user, isReady } = useAuth();

  // Show loading while checking auth state
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  // If user is logged in, go to tabs
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  // If not logged in, go to login
  return <Redirect href="/login" />;
}
