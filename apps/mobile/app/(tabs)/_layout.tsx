import { Tabs } from "expo-router";
import { Compass, GraduationCap, Home, User, Video } from "lucide-react-native";
import { useTheme } from "../../src/contexts/ThemeContext";

export default function TabsLayout() {
  const { colors: Colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.accent.gold,
        tabBarInactiveTintColor: Colors.text.secondary,
        tabBarStyle: {
          backgroundColor: Colors.background.primary,
          borderTopColor: Colors.border.primary,
          height: 72,
          paddingBottom: 4,
          paddingTop: 12,
          paddingHorizontal: 4
        },
        tabBarLabelStyle: {
          fontSize: 9.5,
          fontWeight: "600",
          marginTop: 2
        },
        tabBarItemStyle: {
          paddingHorizontal: 0,
          paddingBottom: 0
        },
        tabBarIconStyle: {
          marginBottom: 0
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home color={color} size={24} />
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => <Compass color={color} size={24} />
        }}
      />
      <Tabs.Screen
        name="my-learning"
        options={{
          title: "My Learning",
          tabBarIcon: ({ color }) => <GraduationCap color={color} size={24} />
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Live Class",
          tabBarIcon: ({ color }) => <Video color={color} size={24} />
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User color={color} size={24} />
        }}
      />
    </Tabs>
  );
}
