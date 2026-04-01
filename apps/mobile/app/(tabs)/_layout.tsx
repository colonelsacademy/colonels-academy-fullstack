import { Tabs } from "expo-router";

import { mobileTheme } from "@colonels-academy/design-tokens";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: mobileTheme.colors.accentStrong,
        tabBarInactiveTintColor: mobileTheme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: mobileTheme.colors.card,
          borderTopColor: mobileTheme.colors.border
        }
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Overview" }} />
      <Tabs.Screen name="courses" options={{ title: "Courses" }} />
      <Tabs.Screen name="schedule" options={{ title: "Schedule" }} />
      <Tabs.Screen name="account" options={{ title: "Account" }} />
    </Tabs>
  );
}
