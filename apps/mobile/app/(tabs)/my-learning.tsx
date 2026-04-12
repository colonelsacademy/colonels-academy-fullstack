import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { BookOpen, Clock, Star, Award, TrendingUp, ChevronRight, Users } from "lucide-react-native";
import { useAuth } from "../../src/providers/auth-provider";
import { useTheme } from "../../src/contexts/ThemeContext";

export default function MyLearningScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isDark, colors: Colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const enrolledCourses = [
    {
      id: "1",
      slug: "nepal-army-staff-college",
      title: "Nepal Army Staff College - Course [2026]",
      heroImageUrl: "https://uat.thecolonelsacademy.com/images/courses/nepal-army-staff-college.png?w=300&q=70",
      lessonCount: 75,
      durationLabel: "60 Hours",
      rating: 4.9,
      students: 2450,
      progress: 35,
    },
    {
      id: "2",
      slug: "nepal-police-inspector-cadet",
      title: "Nepal Police Inspector Cadet - Course [2026]",
      heroImageUrl: "https://uat.thecolonelsacademy.com/images/courses/nepal-police-inspector-cadet.png?w=300&q=70",
      lessonCount: 65,
      durationLabel: "50 Hours",
      rating: 4.8,
      students: 1800,
      progress: 12,
    },
  ];

  const isLoading = false;

  // Pre-compute outside StyleSheet.create to avoid Babel ternary parse issues
  const cardShadowOpacity = isDark ? 0.3 : 0.12;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background.secondary },
    header: {
      paddingHorizontal: 16,
      paddingTop: 60,
      paddingBottom: 16,
      backgroundColor: Colors.background.primary,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border.primary,
    },
    headerTitle: { fontSize: 28, fontWeight: "700", color: Colors.text.primary, marginBottom: 4 },
    headerSubtitle: { fontSize: 14, color: Colors.text.secondary },
    statsRow: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: Colors.background.primary,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border.primary,
    },
    statCard: {
      flex: 1,
      backgroundColor: Colors.background.secondary,
      borderRadius: 16,
      padding: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: Colors.border.primary,
      gap: 8,
    },
    statValue: { fontSize: 24, fontWeight: "700", color: Colors.text.primary },
    statLabel: { fontSize: 10, color: Colors.text.tertiary, fontWeight: "700", letterSpacing: 1 },
    sectionLabel: {
      fontSize: 11,
      fontWeight: "900",
      color: Colors.text.tertiary,
      letterSpacing: 1.5,
      paddingHorizontal: 16,
      marginTop: 20,
      marginBottom: 12,
    },
    // ── Exact same as explore courseCard ──────────────────────────────────────
    courseCard: {
      marginHorizontal: 16,
      marginBottom: 16,
      backgroundColor: Colors.background.primary,
      borderRadius: 24,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: Colors.border.primary,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: cardShadowOpacity,
      shadowRadius: 16,
      elevation: 8,
      height: 140,
    },
    courseHeader: { flexDirection: "row", height: 140 },
    courseThumbnail: {
      width: 140,
      height: 140,
      backgroundColor: Colors.background.tertiary,
    },
    progressTrack: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: 140,
      height: 3,
      backgroundColor: "rgba(0,0,0,0.25)",
    },
    progressFill: { height: 3, backgroundColor: "#10B981" },
    activeBadge: {
      position: "absolute",
      top: 10,
      left: 10,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: "#10B981",
    },
    activeBadgeText: { fontSize: 8, fontWeight: "900", color: "#FFFFFF", letterSpacing: 0.5 },
    courseBody: { flex: 1, padding: 12, paddingLeft: 14, justifyContent: "space-between" },
    courseTopSection: { marginBottom: 4 },
    courseTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    courseTitle: {
      flex: 1,
      fontSize: 14,
      fontWeight: "700",
      color: Colors.text.primary,
      lineHeight: 18,
      letterSpacing: -0.3,
    },
    courseMeta: { flexDirection: "row", alignItems: "center", gap: 10 },
    metaItem: { flexDirection: "row", alignItems: "center", gap: 3 },
    metaText: { fontSize: 10, color: Colors.text.secondary, fontWeight: "600" },
    courseFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 2,
    },
    courseDuration: { flexDirection: "row", alignItems: "center", gap: 4 },
    durationText: { fontSize: 11, fontWeight: "600", color: "#10B981" },
    continueBtn: {
      backgroundColor: "#10B981",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
    },
    continueBtnText: { fontSize: 11, fontWeight: "700", color: "#FFFFFF" },
    // ── Empty states ──────────────────────────────────────────────────────────
    emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
    emptyWrap: { alignItems: "center", paddingVertical: 64, paddingHorizontal: 32 },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: Colors.text.primary,
      marginTop: 16,
      marginBottom: 8,
      textAlign: "center",
    },
    emptyDesc: { fontSize: 14, color: Colors.text.secondary, textAlign: "center", lineHeight: 22 },
    emptyBtn: {
      marginTop: 24,
      backgroundColor: "#1E40AF",
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: 12,
    },
    emptyBtnText: { fontSize: 14, fontWeight: "900", color: "#FFFFFF", letterSpacing: 0.5 },
  });

  if (isLoading) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Learning</Text>
          <Text style={styles.headerSubtitle}>Track your progress</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Award size={72} color={Colors.text.tertiary} strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>Start Your Learning Journey</Text>
          <Text style={styles.emptyDesc}>Sign in to access your courses and track your progress.</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push("/login" as any)}>
            <Text style={styles.emptyBtnText}>SIGN IN</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Learning</Text>
        <Text style={styles.headerSubtitle}>
          {enrolledCourses.length > 0
            ? `${enrolledCourses.length} active course${enrolledCourses.length > 1 ? "s" : ""}`
            : "No courses enrolled yet"}
        </Text>
      </View>

      {enrolledCourses.length > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <TrendingUp size={20} color="#10B981" strokeWidth={2.5} />
            <Text style={styles.statValue}>{enrolledCourses.length}</Text>
            <Text style={styles.statLabel}>COURSES</Text>
          </View>
          <View style={styles.statCard}>
            <BookOpen size={20} color="#1E40AF" strokeWidth={2.5} />
            <Text style={styles.statValue}>{enrolledCourses.reduce((a, c) => a + c.lessonCount, 0)}</Text>
            <Text style={styles.statLabel}>LESSONS</Text>
          </View>
          <View style={styles.statCard}>
            <Award size={20} color="#D4AF37" strokeWidth={2.5} />
            <Text style={styles.statValue}>
              {Math.round(enrolledCourses.reduce((a, c) => a + c.progress, 0) / enrolledCourses.length)}%
            </Text>
            <Text style={styles.statLabel}>PROGRESS</Text>
          </View>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); }}
            tintColor="#10B981"
          />
        }
      >
        {enrolledCourses.length === 0 ? (
          <View style={styles.emptyWrap}>
            <BookOpen size={56} color={Colors.text.tertiary} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No Courses Yet</Text>
            <Text style={styles.emptyDesc}>Explore our course catalog and start learning today.</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push("/(tabs)/courses" as any)}>
              <Text style={styles.emptyBtnText}>EXPLORE COURSES</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>CONTINUE LEARNING</Text>
            {enrolledCourses.map((course) => (
              <TouchableOpacity
                key={course.id}
                activeOpacity={0.95}
                onPress={() => router.push(`/course/${course.slug}` as any)}
              >
                <View style={styles.courseCard}>
                  <View style={styles.courseHeader}>
                    {/* Thumbnail — exact same as explore, overflow:hidden on card handles corners */}
                    <View>
                      <Image
                        source={{ uri: course.heroImageUrl }}
                        style={styles.courseThumbnail}
                        contentFit="cover"
                        contentPosition="center"
                        transition={150}
                        cachePolicy="memory-disk"
                        recyclingKey={course.slug}
                      />
                      {/* ACTIVE badge — same as explore's BEST badge */}
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>ACTIVE</Text>
                      </View>
                      {/* Thin progress strip at bottom of thumbnail */}
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${course.progress}%` }]} />
                      </View>
                    </View>

                    {/* Body — exact same as explore */}
                    <View style={styles.courseBody}>
                      <View style={styles.courseTopSection}>
                        <View style={styles.courseTopRow}>
                          <Text style={styles.courseTitle} numberOfLines={2}>
                            {course.title}
                          </Text>
                        </View>
                        <View style={styles.courseMeta}>
                          <View style={styles.metaItem}>
                            <Star size={12} fill="#D4AF37" color="#D4AF37" strokeWidth={2} />
                            <Text style={styles.metaText}>{course.rating}</Text>
                          </View>
                          <View style={styles.metaItem}>
                            <BookOpen size={12} color={Colors.text.tertiary} strokeWidth={2} />
                            <Text style={styles.metaText}>{course.lessonCount}L</Text>
                          </View>
                          <View style={styles.metaItem}>
                            <Users size={12} color={Colors.text.tertiary} strokeWidth={2} />
                            <Text style={styles.metaText}>{(course.students / 1000).toFixed(1)}K</Text>
                          </View>
                        </View>
                      </View>
                      {/* Footer — same layout, green instead of blue, shows progress % */}
                      <View style={styles.courseFooter}>
                        <View style={styles.courseDuration}>
                          <Clock size={14} color="#10B981" strokeWidth={2} />
                          <Text style={styles.durationText}>{course.progress}% done</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.continueBtn}
                          onPress={() => router.push(`/course/${course.slug}` as any)}
                        >
                          <Text style={styles.continueBtnText}>Continue</Text>
                          <ChevronRight size={12} color="#FFFFFF" strokeWidth={2.5} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
