import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Award,
  Bell,
  BookOpen,
  ChevronRight,
  Clock,
  LogIn,
  LogOut,
  Settings,
  TrendingUp,
  User,
  UserPlus
} from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  Platform,
  StatusBar as RNStatusBar,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useTheme } from "../../src/contexts/ThemeContext";
import { useAuth } from "../../src/providers/auth-provider";

export default function AccountScreen() {
  const { user, signOutUser } = useAuth();
  const { isDark, colors } = useTheme();
  const [stats] = useState({
    courses: 0,
    certificates: 0,
    progress: 0,
    studyTime: 0
  });

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOutUser();
            router.replace("/login");
          } catch (_error) {
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        }
      }
    ]);
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  const topInset = Platform.OS === "android" ? RNStatusBar.currentHeight || 0 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background.secondary }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {!user ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={[styles.guestScroll, { backgroundColor: colors.background.secondary }]}
        >
          <View style={[styles.guestHeader, { paddingTop: topInset + 48 }]}>
            <LinearGradient
              colors={
                isDark ? ["#1e1e1e", "#0B1120", "#1e1e1e"] : ["#F8F9FB", "#1e293b", "#F8F9FB"]
              }
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <View style={styles.guestAvatarRing}>
              <Award size={48} color="#D4AF37" strokeWidth={2} />
            </View>
            <Text style={[styles.guestTitle, { color: colors.text.primary }]}>Join the Elite</Text>
            <Text
              style={[
                styles.guestSubtitle,
                { color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 255, 255, 0.9)" }
              ]}
            >
              Begin your journey to excellence
            </Text>
          </View>

          <View style={[styles.guestBody, { backgroundColor: colors.background.secondary }]}>
            <TouchableOpacity
              onPress={() => router.push("/login")}
              activeOpacity={0.85}
              style={styles.loginWrapper}
            >
              <LinearGradient
                colors={["#D4AF37", "#B8941F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginGradient}
              >
                <LogIn size={20} color="#fff" strokeWidth={2.5} />
                <Text style={styles.loginText}>LOGIN</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/login")}
              activeOpacity={0.85}
              style={[
                styles.signupButton,
                { backgroundColor: colors.background.primary, borderColor: colors.border.primary }
              ]}
            >
              <UserPlus size={20} color={colors.text.primary} strokeWidth={2.5} />
              <Text style={[styles.signupText, { color: colors.text.primary }]}>
                CREATE ACCOUNT
              </Text>
            </TouchableOpacity>

            <Text style={[styles.benefitsTitle, { color: colors.text.primary }]}>
              Why Join Colonel's Academy?
            </Text>

            <View style={styles.benefitRow}>
              <View
                style={[
                  styles.benefitIconBox,
                  { backgroundColor: isDark ? "rgba(0, 105, 62, 0.2)" : "#D1FAE5" }
                ]}
              >
                <BookOpen size={24} color="#00693E" strokeWidth={2.5} />
              </View>
              <View style={styles.benefitContent}>
                <Text style={[styles.benefitName, { color: colors.text.primary }]}>
                  Elite Courses
                </Text>
                <Text style={[styles.benefitDesc, { color: colors.text.secondary }]}>
                  Access premium military preparation courses
                </Text>
              </View>
            </View>

            <View style={styles.benefitRow}>
              <View
                style={[
                  styles.benefitIconBox,
                  { backgroundColor: isDark ? "rgba(212, 175, 55, 0.2)" : "#FEF3C7" }
                ]}
              >
                <Award size={24} color="#D4AF37" strokeWidth={2.5} />
              </View>
              <View style={styles.benefitContent}>
                <Text style={[styles.benefitName, { color: colors.text.primary }]}>
                  Track Progress
                </Text>
                <Text style={[styles.benefitDesc, { color: colors.text.secondary }]}>
                  Monitor your journey and earn certificates
                </Text>
              </View>
            </View>

            <View style={styles.benefitRow}>
              <View
                style={[
                  styles.benefitIconBox,
                  { backgroundColor: isDark ? "rgba(30, 58, 138, 0.2)" : "#DBEAFE" }
                ]}
              >
                <Bell size={24} color="#1E3A8A" strokeWidth={2.5} />
              </View>
              <View style={styles.benefitContent}>
                <Text style={[styles.benefitName, { color: colors.text.primary }]}>
                  Stay Updated
                </Text>
                <Text style={[styles.benefitDesc, { color: colors.text.secondary }]}>
                  Get notified about new courses and live classes
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: colors.background.secondary }}
        >
          <View style={[styles.profileHeader, { paddingTop: topInset + 16 }]}>
            <LinearGradient
              colors={
                isDark ? ["#1e1e1e", "#0B1120", "#1e1e1e"] : ["#F8F9FB", "#1e293b", "#F8F9FB"]
              }
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarGlow} />
              <View style={styles.avatarContainer}>
                <User size={40} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            </View>
            <Text style={[styles.userName, { color: colors.text.primary }]}>
              {user.displayName || user.email?.split("@")[0] || "Cadet"}
            </Text>
            <Text
              style={[
                styles.userEmail,
                { color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)" }
              ]}
            >
              {user.email}
            </Text>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>RECRUIT</Text>
            </View>
          </View>

          <View style={[styles.statsContainer, { backgroundColor: colors.background.secondary }]}>
            <View style={styles.statsRow}>
              <View style={styles.statCardWrapper}>
                <View
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: colors.background.primary,
                      borderColor: colors.border.primary
                    }
                  ]}
                >
                  <View
                    style={[
                      styles.statIconContainer,
                      { backgroundColor: isDark ? "rgba(0, 105, 62, 0.2)" : "#D1FAE5" }
                    ]}
                  >
                    <BookOpen size={28} color="#00693E" strokeWidth={2.5} />
                  </View>
                  <Text style={[styles.statValue, { color: colors.text.primary }]}>
                    {stats.courses}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>COURSES</Text>
                </View>
              </View>
              <View style={styles.statCardWrapper}>
                <View
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: colors.background.primary,
                      borderColor: colors.border.primary
                    }
                  ]}
                >
                  <View
                    style={[
                      styles.statIconContainer,
                      { backgroundColor: isDark ? "rgba(212, 175, 55, 0.2)" : "#FEF3C7" }
                    ]}
                  >
                    <Award size={28} color="#D4AF37" strokeWidth={2.5} />
                  </View>
                  <Text style={[styles.statValue, { color: colors.text.primary }]}>
                    {stats.certificates}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>
                    CERTIFICATES
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statCardWrapper}>
                <View
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: colors.background.primary,
                      borderColor: colors.border.primary
                    }
                  ]}
                >
                  <View
                    style={[
                      styles.statIconContainer,
                      { backgroundColor: isDark ? "rgba(30, 58, 138, 0.2)" : "#DBEAFE" }
                    ]}
                  >
                    <TrendingUp size={28} color="#1E3A8A" strokeWidth={2.5} />
                  </View>
                  <Text style={[styles.statValue, { color: colors.text.primary }]}>
                    {stats.progress}%
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>PROGRESS</Text>
                </View>
              </View>
              <View style={styles.statCardWrapper}>
                <View
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: colors.background.primary,
                      borderColor: colors.border.primary
                    }
                  ]}
                >
                  <View
                    style={[
                      styles.statIconContainer,
                      { backgroundColor: isDark ? "rgba(217, 119, 6, 0.2)" : "#FEF3C7" }
                    ]}
                  >
                    <Clock size={28} color="#D97706" strokeWidth={2.5} />
                  </View>
                  <Text style={[styles.statValue, { color: colors.text.primary }]}>
                    {stats.studyTime}h
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>
                    STUDY TIME
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.menuContainer, { backgroundColor: colors.background.secondary }]}>
            <View style={styles.sectionHeader}>
              <Settings size={18} color="#D4AF37" strokeWidth={2.5} />
              <Text style={[styles.sectionTitle, { color: colors.text.tertiary }]}>ACCOUNT</Text>
            </View>
            <View
              style={[
                styles.menuCard,
                { backgroundColor: colors.background.primary, borderColor: colors.border.primary }
              ]}
            >
              <TouchableOpacity onPress={handleSettings} activeOpacity={0.7}>
                <View style={styles.menuItem}>
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIcon, { backgroundColor: "rgba(212, 175, 55, 0.1)" }]}>
                      <Settings size={18} color="#D4AF37" strokeWidth={2.5} />
                    </View>
                    <Text style={[styles.menuText, { color: colors.text.primary }]}>Settings</Text>
                  </View>
                  <ChevronRight size={18} color={colors.text.tertiary} strokeWidth={2.5} />
                </View>
              </TouchableOpacity>
              <View style={[styles.menuDivider, { backgroundColor: colors.border.primary }]} />
              <TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
                <View style={styles.menuItem}>
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIcon, { backgroundColor: "rgba(239, 68, 68, 0.1)" }]}>
                      <LogOut size={18} color="#EF4444" strokeWidth={2.5} />
                    </View>
                    <Text style={[styles.menuText, { color: "#EF4444" }]}>Logout</Text>
                  </View>
                  <ChevronRight size={18} color="#EF4444" strokeWidth={2.5} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 96 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  guestScroll: { flex: 1 },
  guestHeader: {
    alignItems: "center",
    paddingBottom: 40,
    paddingHorizontal: 20,
    overflow: "hidden"
  },
  guestAvatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#D4AF37",
    marginBottom: 20,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8
  },
  guestTitle: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: "center"
  },
  guestSubtitle: { fontSize: 16, fontWeight: "400", textAlign: "center" },
  guestBody: { padding: 20, paddingTop: 32, flex: 1 },
  loginWrapper: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8
  },
  loginGradient: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    gap: 8
  },
  loginText: { fontSize: 16, fontWeight: "900", color: "#FFFFFF", letterSpacing: 2 },
  signupButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    borderWidth: 2,
    marginBottom: 32
  },
  signupText: { fontSize: 16, fontWeight: "900", letterSpacing: 2 },
  benefitsTitle: { fontSize: 20, fontWeight: "700", marginBottom: 20, letterSpacing: -0.5 },
  benefitRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, marginBottom: 8 },
  benefitIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16
  },
  benefitContent: { flex: 1 },
  benefitName: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  benefitDesc: { fontSize: 14, lineHeight: 20 },
  profileHeader: { alignItems: "center", paddingBottom: 48, overflow: "hidden" },
  avatarWrapper: { position: "relative", marginBottom: 16 },
  avatarGlow: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(212, 175, 55, 0.3)",
    top: -5,
    left: -5
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#D4AF37",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF"
  },
  userName: { fontSize: 24, fontWeight: "700", marginBottom: 8, letterSpacing: -0.5 },
  userEmail: { fontSize: 14, marginBottom: 16 },
  rankBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: "#D4AF37",
    borderRadius: 8,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  rankText: { fontSize: 12, fontWeight: "900", color: "#1A2942", letterSpacing: 3 },
  statsContainer: { paddingHorizontal: 20, paddingVertical: 16 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  statCardWrapper: { width: "48%" },
  statCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12
  },
  statValue: { fontSize: 36, fontWeight: "900", marginBottom: 2 },
  statLabel: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 3 },
  menuContainer: { padding: 20 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4
  },
  sectionTitle: { fontSize: 12, fontWeight: "900", letterSpacing: 3 },
  menuCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20
  },
  menuItemLeft: { flexDirection: "row", alignItems: "center", gap: 16 },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  menuText: { fontSize: 16, fontWeight: "700" },
  menuDivider: { height: 1, marginHorizontal: 20 }
});
