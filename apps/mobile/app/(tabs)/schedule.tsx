import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Play, Calendar, Clock, Users, BookMarked, ClipboardList, Bell, LogIn } from "lucide-react-native";
import { useAuth } from "../../src/providers/auth-provider";
import { useAsyncResource } from "../../src/hooks/use-async-resource";
import { mobileApiClient } from "../../src/lib/api";
import { useFocusEffect, router } from "expo-router";
import { useProtectedRoute } from "../../src/hooks/use-protected-route";
import { useTheme } from "../../src/contexts/ThemeContext";

export default function ScheduleScreen() {
  const { user, isReady } = useProtectedRoute();
  const { isDark, colors: Colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessions, setSessions] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const data = await mobileApiClient.getLiveSessions();
      setSessions(data.items || []);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  useFocusEffect(useCallback(() => { fetchSessions(); }, []));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      fetchSessions();
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background.secondary },
    header: {
      backgroundColor: isDark ? "#0B1120" : "#0B1120",
      padding: 20,
      paddingTop: 60,
    },
    headerLabel: {
      fontSize: 10,
      fontWeight: "900",
      color: "#6B7280",
      letterSpacing: 2,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    headerTitle: { fontSize: 28, fontWeight: "700", color: "#FFFFFF", marginBottom: 4 },
    headerSubtitle: { fontSize: 13, color: "#9CA3AF" },
    featuredCard: {
      backgroundColor: isDark ? "#0d1526" : "#0B1120",
      margin: 16,
      borderRadius: 16,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "rgba(212, 175, 55, 0.3)",
    },
    featuredBackground: {
      position: "absolute",
      top: 0,
      right: 0,
      opacity: 0.1,
      padding: 16,
    },
    featuredContent: { padding: 20, position: "relative", zIndex: 10 },
    liveIndicator: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
    liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#EF4444" },
    liveText: {
      fontSize: 10,
      fontWeight: "900",
      color: "#D4AF37",
      letterSpacing: 2,
      textTransform: "uppercase",
    },
    featuredTopic: {
      fontSize: 22,
      fontWeight: "700",
      color: "#FFFFFF",
      lineHeight: 28,
      marginBottom: 16,
    },
    sessionDetails: { gap: 8, marginBottom: 20 },
    detailRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    detailText: { fontSize: 12, color: "#9CA3AF" },
    actionRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    joinButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: "#D4AF37",
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      flex: 1,
    },
    joinButtonText: { fontSize: 14, fontWeight: "700", color: "#0B1120" },
    pendingButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: isDark ? "#1f2937" : "#374151",
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      flex: 1,
    },
    pendingButtonText: { fontSize: 14, fontWeight: "700", color: "#9CA3AF" },
    scheduledButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: isDark ? "#1f2937" : "#374151",
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      flex: 1,
    },
    scheduledButtonText: { fontSize: 14, fontWeight: "700", color: "#9CA3AF" },
    typeBadge: {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: 20,
    },
    typeBadgeText: {
      fontSize: 10,
      fontWeight: "700",
      color: "#9CA3AF",
      letterSpacing: 1.5,
      textTransform: "uppercase",
    },
    section: { padding: 16 },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: Colors.text.primary,
      marginBottom: 16,
    },
    upcomingGrid: { gap: 16 },
    upcomingCard: {
      backgroundColor: Colors.background.primary,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: Colors.border.primary,
    },
    upcomingHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    upcomingLabel: {
      fontSize: 10,
      fontWeight: "700",
      color: Colors.text.secondary,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      backgroundColor: Colors.background.secondary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    upcomingType: {
      fontSize: 10,
      fontWeight: "900",
      color: "#D4AF37",
      letterSpacing: 1.5,
      textTransform: "uppercase",
    },
    upcomingTopic: {
      fontSize: 14,
      fontWeight: "700",
      color: Colors.text.primary,
      marginBottom: 8,
      lineHeight: 18,
    },
    upcomingDetails: { gap: 6 },
    upcomingDetailRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    upcomingDetailText: { fontSize: 11, color: Colors.text.secondary },
    upcomingInstructor: {
      fontSize: 11,
      fontWeight: "700",
      color: Colors.text.secondary,
      marginTop: 4,
    },
    materialsGrid: { gap: 16 },
    materialCard: {
      backgroundColor: Colors.background.primary,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: Colors.border.primary,
    },
    materialHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
    materialTitle: {
      fontSize: 12,
      fontWeight: "700",
      color: Colors.text.secondary,
      letterSpacing: 1.5,
      textTransform: "uppercase",
    },
    materialList: { gap: 8 },
    materialItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    materialItemContent: { flex: 1, marginRight: 8 },
    materialItemTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: Colors.text.primary,
      marginBottom: 2,
    },
    materialItemDue: { fontSize: 10, color: Colors.text.tertiary },
    materialStatus: {
      fontSize: 10,
      fontWeight: "700",
      color: Colors.text.tertiary,
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    noteItem: {
      backgroundColor: Colors.background.secondary,
      borderWidth: 1,
      borderColor: Colors.border.primary,
      borderRadius: 12,
      padding: 8,
    },
    noteTitle: { fontSize: 14, fontWeight: "700", color: Colors.text.primary, marginBottom: 4 },
    noteDetail: { fontSize: 11, color: Colors.text.secondary, lineHeight: 16 },
    loadingText: { marginTop: 12, fontSize: 14, color: Colors.text.tertiary },
    emptyCard: {
      backgroundColor: Colors.background.primary,
      margin: 16,
      padding: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: Colors.border.primary,
      borderStyle: "dashed",
      alignItems: "center",
    },
    emptyText: { fontSize: 14, color: Colors.text.tertiary },
    authRequiredTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: Colors.text.primary,
      marginTop: 16,
      marginBottom: 8,
      textAlign: "center",
    },
    authRequiredText: {
      fontSize: 14,
      color: Colors.text.secondary,
      textAlign: "center",
      marginBottom: 24,
      lineHeight: 20,
    },
    loginButton: {
      backgroundColor: "#D4AF37",
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 12,
    },
    loginButtonText: { fontSize: 14, fontWeight: "700", color: "#0B1120" },
  });

  if (!isReady) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center", padding: 20 }]}>
        <StatusBar style="light" />
        <LogIn size={48} color="#D4AF37" />
        <Text style={styles.authRequiredTitle}>Authentication Required</Text>
        <Text style={styles.authRequiredText}>
          Please log in to access live classes and instructor-led sessions.
        </Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.push("/login")}>
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatSession = (session: any) => {
    const startDate = new Date(session.startsAt);
    const endDate = new Date(session.endsAt);
    return {
      id: session.id,
      topic: session.title || "Live Session",
      day: startDate.toLocaleDateString("en-US", { weekday: "long" }),
      date: startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      time: startDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      instructor: "Instructor",
      type: session.deliveryMode?.toUpperCase() || "LECTURE",
      meetLink: session.meetingUrl || "",
      isLive: currentTime >= startDate && currentTime <= endDate,
      courseSlug: session.courseSlug,
    };
  };

  const formattedSessions = sessions.map(formatSession);
  const nextSession = formattedSessions[0];
  const upcomingSessions = formattedSessions.slice(1, 3);

  const prep = [{ title: "Chapter 5: Strategic Planning", due: "Feb 14", status: "Pending" }];
  const assignments = [{ title: "Case Study Analysis", due: "Feb 18", status: "Pending" }];
  const notes = [{ title: "Session Rescheduled", detail: "Tomorrow's class moved to 6:30 PM" }];

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSessions();
    setRefreshing(false);
  };

  const handleJoinClass = async (meetLink: string) => {
    if (!meetLink) {
      Alert.alert("Link Not Available", "The meeting link is not available yet.");
      return;
    }
    try {
      let url = meetLink.trim();
      if (!url.startsWith("http://") && !url.startsWith("https://")) url = "https://" + url;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Cannot Open Link", `Please open the link in your browser.\n\n${url}`);
      }
    } catch {
      Alert.alert("Error", "Failed to open the meeting link.");
    }
  };

  if (initialLoading) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.loadingText}>Loading live classes...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />}
    >
      <StatusBar style="light" />

      {/* Header - always dark for the military aesthetic */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>STAFF COLLEGE DESK</Text>
        <Text style={styles.headerTitle}>Command Center</Text>
        <Text style={styles.headerSubtitle}>Instructor-led sessions • No recordings</Text>
      </View>

      {/* Featured Next Session */}
      {nextSession ? (
        <View style={styles.featuredCard}>
          <View style={styles.featuredBackground}>
            <Play size={120} color="#D4AF37" />
          </View>
          <View style={styles.featuredContent}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>
                {nextSession.isLive ? "LIVE NOW" : "NEXT HIGH-VALUE SESSION"}
              </Text>
            </View>
            <Text style={styles.featuredTopic}>{nextSession.topic}</Text>
            <View style={styles.sessionDetails}>
              <View style={styles.detailRow}>
                <Calendar size={14} color="#9CA3AF" />
                <Text style={styles.detailText}>{nextSession.day}, {nextSession.date}</Text>
              </View>
              <View style={styles.detailRow}>
                <Clock size={14} color="#9CA3AF" />
                <Text style={styles.detailText}>{nextSession.time}</Text>
              </View>
              <View style={styles.detailRow}>
                <Users size={14} color="#9CA3AF" />
                <Text style={styles.detailText}>{nextSession.instructor}</Text>
              </View>
            </View>
            <View style={styles.actionRow}>
              {nextSession.isLive && nextSession.meetLink ? (
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={() => handleJoinClass(nextSession.meetLink)}
                >
                  <Play size={16} color="#0B1120" fill="#0B1120" />
                  <Text style={styles.joinButtonText}>Join Live Class</Text>
                </TouchableOpacity>
              ) : nextSession.meetLink ? (
                <View style={styles.scheduledButton}>
                  <Calendar size={16} color="#6B7280" />
                  <Text style={styles.scheduledButtonText}>Scheduled</Text>
                </View>
              ) : (
                <View style={styles.pendingButton}>
                  <Clock size={16} color="#6B7280" />
                  <Text style={styles.pendingButtonText}>Link Pending</Text>
                </View>
              )}
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{nextSession.type}</Text>
              </View>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No sessions scheduled</Text>
        </View>
      )}

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
          <View style={styles.upcomingGrid}>
            {upcomingSessions.map((session, index) => (
              <View key={index} style={styles.upcomingCard}>
                <View style={styles.upcomingHeader}>
                  <Text style={styles.upcomingLabel}>NEXT PHASE</Text>
                  <Text style={styles.upcomingType}>{session.type}</Text>
                </View>
                <Text style={styles.upcomingTopic} numberOfLines={2}>{session.topic}</Text>
                <View style={styles.upcomingDetails}>
                  <View style={styles.upcomingDetailRow}>
                    <Calendar size={12} color={Colors.text.tertiary} />
                    <Text style={styles.upcomingDetailText}>{session.day} • {session.date}</Text>
                  </View>
                  <View style={styles.upcomingDetailRow}>
                    <Clock size={12} color={Colors.text.tertiary} />
                    <Text style={styles.upcomingDetailText}>{session.time}</Text>
                  </View>
                  <Text style={styles.upcomingInstructor}>{session.instructor}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Materials Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Course Materials</Text>
        <View style={styles.materialsGrid}>
          <View style={styles.materialCard}>
            <View style={styles.materialHeader}>
              <BookMarked size={16} color="#D4AF37" />
              <Text style={styles.materialTitle}>PRE-CLASS MATERIALS</Text>
            </View>
            <View style={styles.materialList}>
              {prep.map((item, index) => (
                <View key={index} style={styles.materialItem}>
                  <View style={styles.materialItemContent}>
                    <Text style={styles.materialItemTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.materialItemDue}>Due {item.due}</Text>
                  </View>
                  <Text style={styles.materialStatus}>{item.status}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.materialCard}>
            <View style={styles.materialHeader}>
              <ClipboardList size={16} color="#D4AF37" />
              <Text style={styles.materialTitle}>ASSIGNMENTS</Text>
            </View>
            <View style={styles.materialList}>
              {assignments.map((item, index) => (
                <View key={index} style={styles.materialItem}>
                  <View style={styles.materialItemContent}>
                    <Text style={styles.materialItemTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.materialItemDue}>Due {item.due}</Text>
                  </View>
                  <Text style={styles.materialStatus}>{item.status}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.materialCard}>
            <View style={styles.materialHeader}>
              <Bell size={16} color="#D4AF37" />
              <Text style={styles.materialTitle}>INSTRUCTOR NOTES</Text>
            </View>
            <View style={styles.materialList}>
              {notes.map((item, index) => (
                <View key={index} style={styles.noteItem}>
                  <Text style={styles.noteTitle}>{item.title}</Text>
                  <Text style={styles.noteDetail}>{item.detail}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}
