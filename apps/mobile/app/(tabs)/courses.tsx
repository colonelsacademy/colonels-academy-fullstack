import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Award,
  Bell,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Clock,
  Flame,
  GraduationCap,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Target,
  Users,
  X
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useTheme } from "../../src/contexts/ThemeContext";
import { useAsyncResource } from "../../src/hooks/use-async-resource";
import { mobileApiClient } from "../../src/lib/api";
import { useAuth } from "../../src/providers/auth-provider";

const { width: W, height: H } = Dimensions.get("window");

const CATS = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "army", label: "Army", color: "#00693E", icon: Award },
  { id: "police", label: "Police", color: "#1E40AF", icon: Target },
  { id: "apf", label: "APF", color: "#D97706", icon: GraduationCap }
];

const SORT_OPTIONS = [
  { id: "popular", label: "Popular", icon: Flame },
  { id: "new", label: "New", icon: Sparkles },
  { id: "rating", label: "Top Rated", icon: Star }
];

export default function CoursesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isDark, colors: Colors } = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"popular" | "new" | "rating">("popular");
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const carouselRef = useRef<FlatList>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Shimmer animation for skeleton loaders
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!imagesLoaded) {
      Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true
        })
      ).start();
    }
  }, [imagesLoaded, shimmerAnim]);

  const _shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-400, 400]
  });

  // Preload images for instant display
  useEffect(() => {
    const imagesToPreload = DEFAULT_COURSES.map((c) => c.heroImageUrl);
    Promise.all(imagesToPreload.map((uri) => Image.prefetch(uri)))
      .then(() => {
        setTimeout(() => setImagesLoaded(true), 300);
      })
      .catch(() => setImagesLoaded(true));
  }, []);

  const { data: coursesData, loading } = useAsyncResource(() => mobileApiClient.getCourses(), [], {
    items: []
  });

  // Default data for immediate rendering
  const DEFAULT_COURSES = [
    {
      slug: "nepal-army-staff-college",
      title: "Nepal Army Staff College - Course [2026]",
      track: "staff",
      heroImageUrl:
        "https://uat.thecolonelsacademy.com/images/courses/nepal-army-staff-college.png?w=300&q=70",
      durationLabel: "60 Hours",
      lessonCount: 75,
      priceNpr: 8500,
      students: 2450,
      rating: 4.9,
      featured: true
    },
    {
      slug: "nepal-police-inspector-cadet",
      title: "Nepal Police Inspector Cadet - Course [2026]",
      track: "police",
      heroImageUrl:
        "https://uat.thecolonelsacademy.com/images/courses/nepal-police-inspector-cadet.png?w=300&q=70",
      durationLabel: "50 Hours",
      lessonCount: 65,
      priceNpr: 4500,
      students: 1800,
      rating: 4.8,
      featured: true
    },
    {
      slug: "apf-inspector-cadet",
      title: "APF Inspector Cadet - Course [2026]",
      track: "apf",
      heroImageUrl:
        "https://uat.thecolonelsacademy.com/images/courses/apf-inspector-cadet.png?w=300&q=70",
      durationLabel: "45 Hours",
      lessonCount: 55,
      priceNpr: 4500,
      students: 1200,
      rating: 4.7,
      featured: true
    },
    {
      slug: "nepal-army-officer-cadet",
      title: "Nepal Army Officer Cadet - Course [2026]",
      track: "army",
      heroImageUrl:
        "https://uat.thecolonelsacademy.com/images/courses/nepal-army-officer-cadet.png?w=300&q=70",
      durationLabel: "45 Hours",
      lessonCount: 50,
      priceNpr: 4500,
      students: 3200,
      rating: 4.9,
      featured: true
    }
  ];

  const displayCourses: any[] = coursesData.items.length > 0 ? coursesData.items : DEFAULT_COURSES;

  // Filter courses
  let browseCourses = displayCourses;
  if (activeCategory !== "all") {
    browseCourses = browseCourses.filter((c: any) => {
      const track = c.track?.toLowerCase() || "";
      return track === activeCategory || (activeCategory === "army" && track === "staff");
    });
  }
  if (search) {
    const q = search.toLowerCase();
    browseCourses = browseCourses.filter((c: any) => c.title.toLowerCase().includes(q));
  }

  // Featured courses (top 3)
  const featuredCourses = displayCourses.slice(0, 3);

  // Sort courses
  const sortedCourses = [...browseCourses];
  if (sortBy === "popular") {
    sortedCourses.sort((a: any, b: any) => (b.students || 0) - (a.students || 0));
  } else if (sortBy === "new") {
    sortedCourses.reverse();
  } else if (sortBy === "rating") {
    sortedCourses.sort((a: any, b: any) => (b.rating || 4.5) - (a.rating || 4.5));
  }

  // Auto-scroll featured carousel
  useEffect(() => {
    if (featuredCourses.length <= 1) return;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => {
        const nextIndex = (prev + 1) % featuredCourses.length;
        carouselRef.current?.scrollToOffset({
          offset: nextIndex * W,
          animated: true
        });
        return nextIndex;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredCourses.length]);

  // Styles MUST be inside component to access Colors from theme
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background.secondary },
    // Header
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: 60,
      paddingBottom: 12,
      backgroundColor: Colors.background.primary
    },
    headerLeft: { flex: 1 },
    headerTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: Colors.text.primary
    },
    headerSubtitle: {
      fontSize: 12,
      color: Colors.text.tertiary,
      marginTop: 2
    },
    bellBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: Colors.background.secondary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: Colors.border.primary
    },
    // Search
    searchSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: Colors.background.primary
    },
    searchWrap: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: Colors.background.secondary,
      borderRadius: 24,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1.5,
      borderColor: Colors.border.primary
    },
    searchInput: { flex: 1, fontSize: 15, color: Colors.text.primary, padding: 0 },
    filterButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: Colors.background.secondary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1.5,
      borderColor: Colors.border.primary
    },
    // Featured
    featuredSection: {
      paddingVertical: 16,
      backgroundColor: Colors.background.primary,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border.primary
    },
    featuredCard: {
      height: 200,
      borderRadius: 24,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 24,
      elevation: 10
    },
    featuredImage: { width: "100%", height: "100%" },
    featuredGradient: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 16,
      paddingBottom: 16,
      paddingTop: 32
    },
    featuredOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "40%"
    },
    featuredTextContainer: {
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 24
    },
    featuredBadge: {
      position: "absolute",
      top: 16,
      left: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "rgba(212,175,55,0.95)",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20
    },
    featuredBadgeText: {
      fontSize: 10,
      fontWeight: "900",
      color: "#0B1120",
      letterSpacing: 0.5
    },
    featuredMeta: { flexDirection: "row", alignItems: "center", gap: 16 },
    featuredMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    featuredMetaText: { fontSize: 12, color: "rgba(255,255,255,0.95)", fontWeight: "700" },
    featuredDots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 16 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border.primary },
    dotActive: { width: 20, backgroundColor: "#D4AF37" },
    // Skeleton
    featuredSkeletonContainer: { paddingHorizontal: 16 },
    featuredSkeleton: {
      height: 200,
      borderRadius: 24,
      backgroundColor: Colors.background.secondary,
      overflow: "hidden"
    },
    skeletonBox: {
      backgroundColor: Colors.background.secondary,
      overflow: "hidden"
    },
    skeletonText: {
      backgroundColor: Colors.background.secondary,
      borderRadius: 4,
      overflow: "hidden"
    },
    skeletonShimmer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.5)"
    },
    // Section Header
    sectionHeader: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 16,
      backgroundColor: Colors.background.secondary
    },
    sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 },
    sectionIconBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "rgba(212, 175, 55, 0.15)",
      alignItems: "center",
      justifyContent: "center"
    },
    sectionTitle: { fontSize: 20, fontWeight: "700", color: Colors.text.primary },
    sectionSubtitle: { fontSize: 13, color: Colors.text.tertiary, marginTop: 2, marginLeft: 44 },
    // Course Card
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
      shadowOpacity: isDark ? 0.3 : 0.12,
      shadowRadius: 16,
      elevation: 8
    },
    courseHeader: { flexDirection: "row", minHeight: 140 },
    courseThumbnail: {
      width: 140,
      height: "100%" as any,
      minHeight: 140,
      backgroundColor: Colors.background.tertiary
    },
    courseBody: { flex: 1, padding: 16, paddingLeft: 18, justifyContent: "space-between" },
    courseTopSection: { marginBottom: 8 },
    courseTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 8
    },
    courseTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: "700",
      color: Colors.text.primary,
      lineHeight: 20,
      letterSpacing: -0.3
    },
    courseBadgeBest: {
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 6,
      marginLeft: 6,
      backgroundColor: "#D4AF37"
    },
    courseBadgeText: { fontSize: 8, fontWeight: "900", color: "#FFFFFF", letterSpacing: 0.5 },
    courseMeta: { flexDirection: "row", alignItems: "center", gap: 12 },
    metaItem: { flexDirection: "row", alignItems: "center", gap: 3 },
    metaText: { fontSize: 11, color: Colors.text.secondary, fontWeight: "600" },
    courseFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 4
    },
    courseDuration: { flexDirection: "row", alignItems: "center", gap: 6 },
    durationText: { fontSize: 13, fontWeight: "600", color: Colors.text.secondary },
    viewDetailsBtn: {
      backgroundColor: "#1E40AF",
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 4
    },
    viewDetailsBtnText: { fontSize: 12, fontWeight: "700", color: "#FFFFFF" },
    // Empty
    emptyWrap: { alignItems: "center", paddingVertical: 64, paddingHorizontal: 32 },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: Colors.text.primary,
      marginTop: 16,
      marginBottom: 8,
      textAlign: "center"
    },
    emptyDesc: { fontSize: 14, color: Colors.text.secondary, textAlign: "center", lineHeight: 22 },
    // Filter Modal
    modalOverlay: { flex: 1, justifyContent: "flex-end" },
    modalBackdrop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)"
    },
    filterModal: {
      backgroundColor: Colors.background.primary,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: "80%"
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border.primary
    },
    modalTitleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    modalTitle: { fontSize: 22, fontWeight: "700", color: Colors.text.primary },
    modalCloseBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: Colors.background.secondary,
      alignItems: "center",
      justifyContent: "center"
    },
    filterSection: {
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border.primary
    },
    filterSectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: Colors.text.primary,
      marginBottom: 16
    },
    filterOptions: { gap: 12 },
    filterOptionWrapper: { width: "100%" },
    filterOption: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderRadius: 16,
      backgroundColor: Colors.background.secondary,
      borderWidth: 2,
      borderColor: Colors.border.primary
    },
    filterOptionText: { flex: 1, fontSize: 15, fontWeight: "600", color: Colors.text.primary },
    filterOptionTextActive: { color: "#FFFFFF", fontWeight: "700" },
    filterResultsPreview: { paddingHorizontal: 20, paddingVertical: 20, alignItems: "center" },
    filterResultsText: { fontSize: 14, color: Colors.text.secondary, fontWeight: "600" },
    modalFooter: {
      paddingHorizontal: 20,
      paddingVertical: 20,
      paddingBottom: 32,
      borderTopWidth: 1,
      borderTopColor: Colors.border.primary
    },
    applyButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: "#1E40AF",
      paddingVertical: 16,
      borderRadius: 16
    },
    applyButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" }
  });

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Explore</Text>
          <Text style={styles.headerSubtitle}>{sortedCourses.length} courses available</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn}>
          <Bell size={20} color={Colors.text.primary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setTimeout(() => setRefreshing(false), 800);
            }}
            tintColor="#1E40AF"
          />
        }
      >
        {/* Search & Filter Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchWrap}>
            <Search size={20} color={Colors.text.tertiary} strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search courses..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor={Colors.text.tertiary}
            />
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
            <SlidersHorizontal size={20} color={Colors.text.primary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Featured Hero Carousel */}
        {featuredCourses.length > 0 && !search && (
          <View style={styles.featuredSection}>
            {!imagesLoaded ? (
              <View style={styles.featuredSkeletonContainer}>
                <View style={styles.featuredSkeleton}>
                  <View style={styles.skeletonShimmer} />
                </View>
              </View>
            ) : (
              <>
                <FlatList
                  ref={carouselRef}
                  data={featuredCourses}
                  horizontal
                  pagingEnabled={false}
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={W}
                  snapToAlignment="center"
                  decelerationRate="fast"
                  scrollEventThrottle={16}
                  contentContainerStyle={{ paddingHorizontal: 0 }}
                  onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                    useNativeDriver: false
                  })}
                  onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / W);
                    setFeaturedIndex(index);
                  }}
                  getItemLayout={(_data, index) => ({ length: W, offset: W * index, index })}
                  keyExtractor={(item: any) => item.slug}
                  renderItem={({ item: course }: any) => (
                    <View style={{ width: W, paddingHorizontal: 16 }}>
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => router.push(`/course/${course.slug}` as any)}
                      >
                        <View style={styles.featuredCard}>
                          <Image
                            source={{ uri: course.heroImageUrl }}
                            style={styles.featuredImage}
                            contentFit="cover"
                            transition={200}
                            cachePolicy="memory-disk"
                            priority="high"
                            recyclingKey={course.slug}
                          />
                          <LinearGradient
                            colors={["transparent", "rgba(0,0,0,0.7)"]}
                            style={styles.featuredOverlay}
                            pointerEvents="none"
                          />
                          <View style={styles.featuredBadge}>
                            <Flame size={12} color="#0B1120" strokeWidth={2.5} />
                            <Text style={styles.featuredBadgeText}>FEATURED</Text>
                          </View>
                          <View style={styles.featuredGradient}>
                            <View style={styles.featuredTextContainer}>
                              <View style={styles.featuredMeta}>
                                <View style={styles.featuredMetaItem}>
                                  <Star size={16} fill="#D4AF37" color="#D4AF37" strokeWidth={2} />
                                  <Text style={styles.featuredMetaText}>4.9</Text>
                                </View>
                                <View style={styles.featuredMetaItem}>
                                  <Users size={16} color="rgba(255,255,255,0.9)" strokeWidth={2} />
                                  <Text style={styles.featuredMetaText}>1,200+ students</Text>
                                </View>
                                <View style={styles.featuredMetaItem}>
                                  <Clock size={16} color="rgba(255,255,255,0.9)" strokeWidth={2} />
                                  <Text style={styles.featuredMetaText}>
                                    {course.durationLabel}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                />
                <View style={styles.featuredDots}>
                  {featuredCourses.map((_: any, i: number) => (
                    <View key={i} style={[styles.dot, i === featuredIndex && styles.dotActive]} />
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        {/* Course List */}
        {sortedCourses.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Search size={56} color={Colors.text.tertiary} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No Courses Found</Text>
            <Text style={styles.emptyDesc}>Try adjusting your search or filters.</Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionIconBadge}>
                  {sortBy === "popular" ? (
                    <Flame size={18} color="#D4AF37" strokeWidth={2.5} />
                  ) : sortBy === "new" ? (
                    <Sparkles size={18} color="#D4AF37" strokeWidth={2.5} />
                  ) : (
                    <Star size={18} fill="#D4AF37" color="#D4AF37" strokeWidth={2.5} />
                  )}
                </View>
                <Text style={styles.sectionTitle}>
                  {sortBy === "popular"
                    ? "Popular Courses"
                    : sortBy === "new"
                      ? "New Courses"
                      : "Top Rated"}
                </Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                {sortBy === "popular"
                  ? "Most enrolled by students"
                  : sortBy === "new"
                    ? "Recently added courses"
                    : "Highest rated by learners"}
              </Text>
            </View>

            {!imagesLoaded ? (
              <>
                {[1, 2, 3].map((i) => (
                  <View key={i} style={styles.courseCard}>
                    <View style={styles.courseHeader}>
                      <View style={[styles.courseThumbnail, styles.skeletonBox]}>
                        <View style={styles.skeletonShimmer} />
                      </View>
                      <View style={styles.courseBody}>
                        <View style={styles.courseTopSection}>
                          <View
                            style={[
                              styles.skeletonText,
                              { width: "90%", height: 16, marginBottom: 8 }
                            ]}
                          >
                            <View style={styles.skeletonShimmer} />
                          </View>
                          <View style={[styles.skeletonText, { width: "60%", height: 12 }]}>
                            <View style={styles.skeletonShimmer} />
                          </View>
                        </View>
                        <View style={[styles.skeletonText, { width: "40%", height: 12 }]}>
                          <View style={styles.skeletonShimmer} />
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            ) : (
              sortedCourses.map((course: any) => (
                <TouchableOpacity
                  key={course.slug}
                  activeOpacity={0.95}
                  onPress={() => router.push(`/course/${course.slug}` as any)}
                >
                  <View style={styles.courseCard}>
                    <View style={styles.courseHeader}>
                      <Image
                        source={{ uri: course.heroImageUrl }}
                        style={styles.courseThumbnail}
                        contentFit="cover"
                        contentPosition="center"
                        transition={150}
                        cachePolicy="memory-disk"
                        priority="normal"
                        recyclingKey={course.slug}
                      />
                      <View style={styles.courseBody}>
                        <View style={styles.courseTopSection}>
                          <View style={styles.courseTopRow}>
                            <Text style={styles.courseTitle} numberOfLines={2}>
                              {course.title}
                            </Text>
                            {course.featured && (
                              <View style={styles.courseBadgeBest}>
                                <Text style={styles.courseBadgeText}>BEST</Text>
                              </View>
                            )}
                          </View>
                          <View style={styles.courseMeta}>
                            <View style={styles.metaItem}>
                              <Star size={12} fill="#D4AF37" color="#D4AF37" strokeWidth={2} />
                              <Text style={styles.metaText}>{course.rating || 4.9}</Text>
                            </View>
                            <View style={styles.metaItem}>
                              <BookOpen size={12} color={Colors.text.tertiary} strokeWidth={2} />
                              <Text style={styles.metaText}>{course.lessonCount}L</Text>
                            </View>
                            <View style={styles.metaItem}>
                              <Users size={12} color={Colors.text.tertiary} strokeWidth={2} />
                              <Text style={styles.metaText}>
                                {(course.students / 1000).toFixed(1)}K
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View style={styles.courseFooter}>
                          <View style={styles.courseDuration}>
                            <Clock size={14} color={Colors.text.secondary} strokeWidth={2} />
                            <Text style={styles.durationText}>{course.durationLabel}</Text>
                          </View>
                          <TouchableOpacity
                            style={styles.viewDetailsBtn}
                            onPress={() => router.push(`/course/${course.slug}` as any)}
                          >
                            <Text style={styles.viewDetailsBtnText}>Details</Text>
                            <ChevronRight size={12} color="#FFFFFF" strokeWidth={2.5} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setFilterModalVisible(false)}
          />
          <View style={styles.filterModal}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <SlidersHorizontal size={24} color={Colors.text.primary} strokeWidth={2} />
                <Text style={styles.modalTitle}>Filters</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setFilterModalVisible(false)}
              >
                <X size={24} color={Colors.text.secondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Category</Text>
                <View style={styles.filterOptions}>
                  {CATS.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    const Icon = cat.icon;
                    let activeColor = "#1E40AF";
                    if (cat.id === "army") activeColor = "#00693E";
                    else if (cat.id === "apf") activeColor = "#D97706";
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => setActiveCategory(cat.id)}
                        style={styles.filterOptionWrapper}
                      >
                        <View
                          style={[
                            styles.filterOption,
                            isActive && { backgroundColor: activeColor, borderColor: activeColor }
                          ]}
                        >
                          <Icon
                            size={20}
                            color={isActive ? "#FFFFFF" : Colors.text.secondary}
                            strokeWidth={2}
                          />
                          <Text
                            style={[
                              styles.filterOptionText,
                              isActive && styles.filterOptionTextActive
                            ]}
                          >
                            {cat.label}
                          </Text>
                          {isActive && (
                            <CheckCircle
                              size={18}
                              color="#FFFFFF"
                              strokeWidth={2.5}
                              fill="#FFFFFF"
                            />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Sort By</Text>
                <View style={styles.filterOptions}>
                  {SORT_OPTIONS.map((opt) => {
                    const isActive = sortBy === opt.id;
                    const Icon = opt.icon;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        onPress={() => setSortBy(opt.id as any)}
                        style={styles.filterOptionWrapper}
                      >
                        <View
                          style={[
                            styles.filterOption,
                            isActive && { backgroundColor: "#D4AF37", borderColor: "#D4AF37" }
                          ]}
                        >
                          <Icon
                            size={20}
                            color={isActive ? "#0B1120" : Colors.text.secondary}
                            strokeWidth={2.5}
                          />
                          <Text style={[styles.filterOptionText, isActive && { color: "#0B1120" }]}>
                            {opt.label}
                          </Text>
                          {isActive && (
                            <CheckCircle
                              size={18}
                              color="#0B1120"
                              strokeWidth={2.5}
                              fill="#0B1120"
                            />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.filterResultsPreview}>
                <Text style={styles.filterResultsText}>
                  {sortedCourses.length} {sortedCourses.length === 1 ? "course" : "courses"} match
                  your filters
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
                <CheckCircle size={20} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
