import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Play, Star, Target, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  StatusBar as RNStatusBar,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useTheme } from "../../src/contexts/ThemeContext";
import { useAsyncResource } from "../../src/hooks/use-async-resource";
import { mobileApiClient } from "../../src/lib/api";
import { useAuth } from "../../src/providers/auth-provider";

const { width, height } = Dimensions.get("window");

const INSTRUCTORS = [
  {
    name: "Col. (Retd.) Rajesh Thapa",
    rank: "Nepal Army",
    experience: "25+ years",
    specialization: "Strategy, command preparation, and selection-board drills",
    image: "https://uat.thecolonelsacademy.com/images/instructors/Rajesh%20Thapa.png",
    rating: 4.9,
    students: 5000,
    courses: 12,
    bio: "Former directing staff with deep experience preparing officer-cadet and command-track candidates for high-stakes military assessments."
  },
  {
    name: "DIG (Retd.) K. P. Sharma",
    rank: "Nepal Police",
    experience: "30+ years",
    specialization: "Criminal law, investigation, and oral-board performance",
    image: "https://uat.thecolonelsacademy.com/images/instructors/KP%20Sharma.png",
    rating: 4.8,
    students: 3200,
    courses: 8,
    bio: "Law-enforcement mentor focused on analytical reasoning, legal frameworks, and interview readiness for inspector-track learners."
  },
  {
    name: "AIG (Retd.) S. B. Basnet",
    rank: "APF Nepal",
    experience: "28+ years",
    specialization: "Border security, tactical ops, and field leadership",
    image: "https://uat.thecolonelsacademy.com/images/instructors/SB%20Basnet.png",
    rating: 4.9,
    students: 2800,
    courses: 10,
    bio: "Operations-focused instructor helping cadets translate theory into disciplined, scenario-based decision making."
  }
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isDark, colors: Colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<(typeof INSTRUCTORS)[0] | null>(
    null
  );
  const [instructorModalVisible, setInstructorModalVisible] = useState(false);

  const { data: _coursesData, loading: _loading } = useAsyncResource(
    () => mobileApiClient.getCourses(),
    [],
    {
      items: []
    }
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const userName = user?.email?.split("@")[0] || "Cadet";

  const openInstructorModal = (instructor: (typeof INSTRUCTORS)[0]) => {
    setSelectedInstructor(instructor);
    setInstructorModalVisible(true);
  };

  const closeInstructorModal = () => {
    setInstructorModalVisible(false);
    setTimeout(() => setSelectedInstructor(null), 300);
  };

  const topInset = Platform.OS === "android" ? RNStatusBar.currentHeight || 0 : 0;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background.secondary
    },

    // Header
    header: {
      backgroundColor: Colors.background.secondary,
      paddingBottom: 20,
      paddingHorizontal: 20
    },
    headerContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start"
    },
    headerLeft: {
      flex: 1,
      gap: 4
    },
    brandRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 4
    },
    brandDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: Colors.accent.gold
    },
    brandName: {
      fontSize: 10,
      fontWeight: "700",
      color: Colors.accent.gold,
      letterSpacing: 2
    },
    welcomeGreeting: {
      fontSize: 13,
      fontWeight: "500",
      color: Colors.text.tertiary,
      letterSpacing: 0.2
    },
    headerTitle: {
      fontSize: 26,
      fontWeight: "700",
      color: Colors.text.primary,
      letterSpacing: -0.5,
      lineHeight: 30
    },
    headerIconButton: {
      padding: 0
    },
    iconButtonInner: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: Colors.background.secondary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: Colors.border.primary
    },

    // Quick Actions
    quickActions: {
      paddingHorizontal: 16,
      marginTop: 20,
      marginBottom: 48
    },
    actionCards: {
      gap: 12
    },
    websiteButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 20,
      paddingHorizontal: 24,
      borderRadius: 12,
      gap: 8
    },
    websiteButtonPrimary: {
      backgroundColor: "#0B1120",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 6
    },
    websiteButtonSecondary: {
      backgroundColor: Colors.background.secondary,
      borderWidth: 1.5,
      borderColor: Colors.border.primary
    },
    websiteButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#FFFFFF",
      letterSpacing: 1.5,
      textTransform: "uppercase"
    },
    websiteButtonTextSecondary: {
      color: Colors.text.primary
    },
    playIconContainer: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: "#10B981",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent"
    },

    // Section Header
    sectionHeader: {
      paddingHorizontal: 16,
      marginBottom: 16
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: Colors.text.primary,
      letterSpacing: -0.5,
      marginBottom: 4,
      textTransform: "capitalize"
    },
    goldUnderline: {
      width: 40,
      height: 3,
      backgroundColor: Colors.accent.gold,
      borderRadius: 2
    },

    // Intake Banner
    intakeBannerContainer: {
      paddingHorizontal: 16,
      marginTop: 20,
      marginBottom: 20
    },
    intakeBanner: {
      borderRadius: 16,
      overflow: "hidden",
      borderWidth: 2,
      borderColor: "#00693E",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 6
    },
    intakeGradient: {
      borderRadius: 16
    },
    glassOverlay: {
      backgroundColor: Colors.background.secondary,
      padding: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: Colors.border.primary,
      position: "relative"
    },
    cornerAccent: {
      position: "absolute",
      top: 16,
      right: 16,
      flexDirection: "row",
      gap: 4
    },
    cornerDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: "#00693E",
      shadowColor: "#D4AF37",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8
    },
    intakeHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 16,
      marginBottom: 20
    },
    logoContainer: {
      position: "relative"
    },
    logoGlow: {
      position: "absolute",
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: isDark ? "rgba(0, 105, 62, 0.15)" : "rgba(0, 105, 62, 0.15)",
      top: 12
    },
    forceLogo: {
      width: 72,
      height: 72,
      marginTop: 12
    },
    intakeHeaderText: {
      flex: 1
    },
    intakeBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      marginBottom: 4,
      backgroundColor: isDark ? "rgba(0, 105, 62, 0.2)" : "#E6F2ED",
      borderWidth: 1,
      borderColor: "#00693E",
      flexDirection: "row",
      alignItems: "center",
      gap: 4
    },
    goldShine: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: Colors.accent.gold,
      shadowColor: "#D4AF37",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8
    },
    intakeBadgeText: {
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 1,
      color: "#00693E",
      textTransform: "uppercase"
    },
    intakeTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: Colors.text.primary,
      marginBottom: 4,
      letterSpacing: -0.5
    },
    intakeSubtitle: {
      fontSize: 14,
      color: Colors.text.secondary,
      marginBottom: 0
    },
    dividerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      gap: 8
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: Colors.border.primary
    },
    dividerDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: "#00693E"
    },
    intakeTimeline: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
      position: "relative"
    },
    timelineItem: {
      alignItems: "center",
      flex: 1,
      position: "relative"
    },
    timelineIconWrapper: {
      position: "relative",
      marginBottom: 8
    },
    timelineIconGlow: {
      position: "absolute",
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(212, 175, 55, 0.25)",
      top: -2,
      left: -2
    },
    timelineIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#00693E",
      borderWidth: 2,
      borderColor: Colors.background.primary,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 3
    },
    timelineConnector: {
      position: "absolute",
      top: 16,
      left: "50%",
      right: "-50%",
      height: 2,
      backgroundColor: "#00693E",
      zIndex: -1
    },
    timelineDate: {
      fontSize: 15,
      fontWeight: "700",
      color: Colors.text.primary,
      marginBottom: 2,
      letterSpacing: -0.3
    },
    timelineLabel: {
      fontSize: 10,
      color: Colors.text.secondary,
      fontWeight: "600",
      letterSpacing: 0.5,
      textTransform: "uppercase"
    },
    intakeIndicators: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 6,
      marginTop: 8
    },
    indicator: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.2)" : "#D1D5DB"
    },
    indicatorActive: {
      width: 24,
      backgroundColor: "#00693E",
      shadowColor: "#00693E",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8
    },

    // Instructors
    horizontalScrollContent: {
      paddingHorizontal: 16,
      gap: 12
    },
    instructorCard: {
      width: 160,
      backgroundColor: Colors.background.secondary,
      borderRadius: 12,
      overflow: "hidden",
      marginRight: 12,
      borderWidth: 1,
      borderColor: Colors.border.primary,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3
    },
    instructorImage: {
      width: "100%",
      height: 120,
      backgroundColor: isDark ? "#2a2a2a" : "#F5F6F8"
    },
    instructorInfo: {
      padding: 12
    },
    instructorName: {
      fontSize: 14,
      fontWeight: "700",
      color: Colors.text.primary,
      marginBottom: 2,
      letterSpacing: -0.2
    },
    instructorRank: {
      fontSize: 11,
      color: Colors.accent.gold,
      fontWeight: "600",
      marginBottom: 2
    },
    instructorExp: {
      fontSize: 10,
      color: Colors.text.secondary,
      marginBottom: 6
    },
    instructorStats: {
      flexDirection: "row",
      gap: 12
    },
    instructorStat: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3
    },
    instructorStatText: {
      fontSize: 11,
      fontWeight: "600",
      color: Colors.text.secondary
    },

    // Instructor Detail Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.85)",
      justifyContent: "center",
      alignItems: "center"
    },
    modalContainer: {
      width: width * 0.9,
      height: height * 0.75,
      borderRadius: 24,
      overflow: "hidden",
      position: "relative"
    },
    modalImage: {
      width: "100%",
      height: "100%",
      position: "absolute"
    },
    modalGradient: {
      flex: 1,
      justifyContent: "flex-end",
      padding: 24
    },
    closeButton: {
      position: "absolute",
      top: 24,
      right: 24,
      zIndex: 10
    },
    closeButtonInner: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.2)",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 6
    },
    modalContent: {
      gap: 16
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4
    },
    modalBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: Colors.accent.gold,
      borderRadius: 8,
      shadowColor: "#D4AF37",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8
    },
    modalBadgeText: {
      fontSize: 10,
      fontWeight: "900",
      color: "#0F1C15",
      letterSpacing: 2,
      textTransform: "uppercase"
    },
    modalRating: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.2)",
      borderRadius: 8
    },
    modalRatingText: {
      fontSize: 13,
      fontWeight: "700",
      color: "#FFFFFF"
    },
    modalInfo: {
      marginBottom: 12
    },
    modalName: {
      fontSize: 30,
      fontWeight: "700",
      color: "#FFFFFF",
      letterSpacing: -0.5,
      marginBottom: 6,
      lineHeight: 34
    },
    modalSpecialization: {
      fontSize: 16,
      color: "rgba(255, 255, 255, 0.7)",
      fontWeight: "500",
      letterSpacing: 0.5
    },
    modalBioContainer: {
      marginBottom: 16
    },
    modalBio: {
      fontSize: 14,
      color: "rgba(255, 255, 255, 0.6)",
      lineHeight: 22,
      fontStyle: "italic"
    },
    modalStats: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: "rgba(255, 255, 255, 0.1)"
    },
    modalStatItem: {
      flex: 1,
      alignItems: "center"
    },
    modalStatValue: {
      fontSize: 18,
      fontWeight: "700",
      color: "#FFFFFF",
      marginBottom: 4
    },
    modalStatLabel: {
      fontSize: 9,
      fontWeight: "700",
      color: "rgba(255, 255, 255, 0.4)",
      letterSpacing: 2,
      textTransform: "uppercase"
    },
    modalDivider: {
      width: 1,
      height: 40,
      backgroundColor: "rgba(255, 255, 255, 0.1)"
    }
  });

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topInset + 16 }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.brandRow}>
                <View style={styles.brandDot} />
                <Text style={styles.brandName}>COLONEL'S ACADEMY</Text>
              </View>
              <Text style={styles.welcomeGreeting}>{`Welcome, ${userName}`}</Text>
              <Text style={styles.headerTitle}>Elite Military Preparation</Text>
            </View>
            <TouchableOpacity style={styles.headerIconButton}>
              <View style={styles.iconButtonInner}>
                <Ionicons name="notifications-outline" size={20} color={Colors.text.secondary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Intake Banner */}
        <View style={styles.intakeBannerContainer}>
          <View style={styles.intakeBanner}>
            <View style={styles.intakeGradient}>
              <View style={styles.glassOverlay}>
                <View style={styles.cornerAccent}>
                  <View style={styles.cornerDot} />
                </View>

                <View style={styles.intakeHeader}>
                  <View style={styles.logoContainer}>
                    <View style={styles.logoGlow} />
                    <Image
                      source={require("../../assets/images/army-logo.png")}
                      style={styles.forceLogo}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.intakeHeaderText}>
                    <View style={styles.intakeBadge}>
                      <View style={styles.goldShine} />
                      <Text style={styles.intakeBadgeText}>NEPAL ARMY</Text>
                    </View>
                    <Text style={styles.intakeTitle}>Staff College 2083</Text>
                    <Text style={styles.intakeSubtitle}>Strategic Leadership Mastery</Text>
                  </View>
                </View>

                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <View style={styles.dividerDot} />
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.intakeTimeline}>
                  {[
                    { date: "Magh 30", label: "Apply" },
                    { date: "Falgun 15", label: "Written" },
                    { date: "Chaitra 20", label: "Physical" }
                  ].map((item) => (
                    <View key={item.label} style={styles.timelineItem}>
                      <View style={styles.timelineIconWrapper}>
                        <View style={styles.timelineIconGlow} />
                        <View style={styles.timelineIcon}>
                          <Ionicons name="time-outline" size={14} color="#FFFFFF" />
                        </View>
                      </View>
                      <Text style={styles.timelineDate}>{item.date}</Text>
                      <Text style={styles.timelineLabel}>{item.label}</Text>
                      {idx < 2 && <View style={styles.timelineConnector} />}
                    </View>
                  ))}
                </View>

                <View style={styles.intakeIndicators}>
                  <View style={[styles.indicator, styles.indicatorActive]} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <View style={styles.actionCards}>
            <TouchableOpacity
              style={[styles.websiteButton, styles.websiteButtonPrimary]}
              // biome-ignore lint/suspicious/noExplicitAny: route not yet typed
              onPress={() => router.push("/mocktest" as any)}
            >
              <Target size={20} color="#60A5FA" strokeWidth={2.5} fill="none" />
              <Text style={styles.websiteButtonText}>CADET IQ TEST</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.websiteButton, styles.websiteButtonSecondary]}
              // biome-ignore lint/suspicious/noExplicitAny: route not yet typed
              onPress={() => router.push("/demo-class" as any)}
            >
              <View style={styles.playIconContainer}>
                <Play size={12} color="#10B981" strokeWidth={3} fill="#10B981" />
              </View>
              <Text style={[styles.websiteButtonText, styles.websiteButtonTextSecondary]}>
                DEMO CLASS
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />

        {/* Top Instructors Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Instructors</Text>
          <View style={styles.goldUnderline} />
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={INSTRUCTORS}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.horizontalScrollContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.instructorCard}
              onPress={() => openInstructorModal(item)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: item.image }}
                style={styles.instructorImage}
                resizeMode="cover"
              />
              <View style={styles.instructorInfo}>
                <Text style={styles.instructorName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.instructorRank} numberOfLines={1}>
                  {item.rank}
                </Text>
                <Text style={styles.instructorExp}>{item.experience}</Text>
                <View style={styles.instructorStats}>
                  <View style={styles.instructorStat}>
                    <Ionicons name="star" size={10} color="#F59E0B" />
                    <Text style={styles.instructorStatText}>{item.rating}</Text>
                  </View>
                  <View style={styles.instructorStat}>
                    <Ionicons name="people-outline" size={10} color={Colors.text.secondary} />
                    <Text style={styles.instructorStatText}>
                      {(item.students / 1000).toFixed(1)}K
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </ScrollView>

      {/* Instructor Detail Modal */}
      <Modal
        visible={instructorModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeInstructorModal}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          {selectedInstructor && (
            <View style={styles.modalContainer}>
              <Image
                source={{ uri: selectedInstructor.image }}
                style={styles.modalImage}
                resizeMode="cover"
              />

              <LinearGradient
                colors={["rgba(15, 28, 21, 0.4)", "rgba(15, 28, 21, 0.9)"]}
                style={styles.modalGradient}
              >
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeInstructorModal}
                  activeOpacity={0.7}
                >
                  <View style={styles.closeButtonInner}>
                    <X size={24} color="#FFFFFF" strokeWidth={2.5} />
                  </View>
                </TouchableOpacity>

                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <View style={styles.modalBadge}>
                      <Text style={styles.modalBadgeText}>{selectedInstructor.rank}</Text>
                    </View>
                    <View style={styles.modalRating}>
                      <Star
                        size={14}
                        fill={Colors.accent.gold}
                        color={Colors.accent.gold}
                        strokeWidth={2}
                      />
                      <Text style={styles.modalRatingText}>{selectedInstructor.rating}</Text>
                    </View>
                  </View>

                  <View style={styles.modalInfo}>
                    <Text style={styles.modalName}>{selectedInstructor.name}</Text>
                    <Text style={styles.modalSpecialization}>
                      {selectedInstructor.specialization}
                    </Text>
                  </View>

                  <View style={styles.modalBioContainer}>
                    <Text style={styles.modalBio}>{selectedInstructor.bio}</Text>
                  </View>

                  <View style={styles.modalStats}>
                    <View style={styles.modalStatItem}>
                      <Text style={styles.modalStatValue}>
                        {selectedInstructor.students.toLocaleString()}
                      </Text>
                      <Text style={styles.modalStatLabel}>STUDENTS</Text>
                    </View>
                    <View style={styles.modalDivider} />
                    <View style={styles.modalStatItem}>
                      <Text style={styles.modalStatValue}>{selectedInstructor.courses}</Text>
                      <Text style={styles.modalStatLabel}>COURSES</Text>
                    </View>
                    <View style={styles.modalDivider} />
                    <View style={styles.modalStatItem}>
                      <Text style={styles.modalStatValue}>{selectedInstructor.experience}</Text>
                      <Text style={styles.modalStatLabel}>EXPERIENCE</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}
