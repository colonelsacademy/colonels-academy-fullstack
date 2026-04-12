import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  CreditCard,
  ExternalLink,
  Globe,
  PlayCircle,
  Star,
  Users
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: _width } = Dimensions.get("window");

const Colors = {
  text: {
    primary: "#1A2942",
    secondary: "#4B5563",
    tertiary: "#9CA3AF"
  },
  background: {
    primary: "#FFFFFF",
    secondary: "#F8F9FB"
  },
  border: {
    glass: "rgba(26, 41, 66, 0.08)"
  },
  status: {
    success: "#10B981",
    successGlow: "#D1FAE5"
  }
};

export default function CourseDetailsScreen() {
  const { slug } = useLocalSearchParams();
  const _router = useRouter();
  const insets = useSafeAreaInsets();
  const [expandedModule, setExpandedModule] = useState<number | null>(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Calculate proper top padding for back button - more precise positioning
  const _backButtonTop = insets.top + 8;

  // Mock course data - in production, fetch from API using slug
  const course = {
    slug: slug as string,
    title: "Nepal Army Staff College - Course [2026]",
    description: "Elite strategic preparation for Staff College entrance exams",
    tag: "NEPAL ARMY",
    heroImageUrl:
      "https://uat.thecolonelsacademy.com/images/courses/nepal-army-staff-college.png?w=800&q=85",
    rating: 4.9,
    ratingCount: 4250,
    students: 2450,
    duration: "60 Hours",
    lessons: 75,
    level: "Advanced",
    instructor: "Col. (Retd.) R. Thapa & Brig. Gen. (retd.) S. Jung",
    priceNpr: 8500,
    originalPrice: 12000,
    isEnrolled: false,
    comingSoon: false
  };

  const curriculum = [
    {
      title: "Introduction & Orientation",
      lessons: [
        { id: 1, title: "Welcome to the Course", duration: "5 min", isPreview: true },
        { id: 2, title: "Course Overview", duration: "10 min", isPreview: true },
        { id: 3, title: "Study Materials", duration: "8 min", isPreview: false }
      ]
    },
    {
      title: "Core Concepts",
      lessons: [
        { id: 4, title: "Fundamental Principles", duration: "25 min", isPreview: false },
        { id: 5, title: "Advanced Techniques", duration: "30 min", isPreview: false },
        { id: 6, title: "Practical Applications", duration: "20 min", isPreview: false }
      ]
    },
    {
      title: "Advanced Topics",
      lessons: [
        { id: 7, title: "Strategic Analysis", duration: "35 min", isPreview: false },
        { id: 8, title: "Case Studies", duration: "40 min", isPreview: false }
      ]
    }
  ];

  const handleEnrollNow = async () => {
    // Open the web checkout page — payment is handled on the website
    // to avoid app store commission fees
    const websiteUrl = `https://thecolonelsacademy.com/courses/${course.slug}?ref=mobile`;

    const supported = await Linking.canOpenURL(websiteUrl);

    if (supported) {
      await Linking.openURL(websiteUrl);
    } else {
      Alert.alert(
        "Cannot Open Link",
        "Unable to open the course page. Please visit thecolonelsacademy.com in your browser.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <View style={styles.header}>
          {!imageLoaded && (
            <View style={styles.imageSkeleton}>
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          )}
          <Image
            source={{ uri: course.heroImageUrl }}
            style={styles.headerImage}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
            priority="high"
            onLoadEnd={() => setImageLoaded(true)}
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)", "rgba(0,0,0,0.9)"]}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.categoryBadge}>
                <Text style={styles.category}>{course.tag}</Text>
              </View>
              <Text style={styles.title}>{course.title}</Text>
              <Text style={styles.description}>{course.description}</Text>

              <View style={styles.stats}>
                <View style={styles.stat}>
                  <Star size={16} fill="#FCD34D" color="#FCD34D" strokeWidth={2} />
                  <Text style={styles.statText}>
                    {course.rating} ({course.ratingCount.toLocaleString()})
                  </Text>
                </View>
                <View style={styles.stat}>
                  <Users size={16} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.statText}>{course.students.toLocaleString()} students</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* What You'll Learn */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What You'll Learn</Text>
            <View style={styles.learningPoints}>
              {[
                "Master core concepts and fundamentals",
                "Apply knowledge to real-world scenarios",
                "Prepare for competitive examinations",
                "Build confidence and strategic thinking"
              ].map((point) => (
                <View key={point} style={styles.learningPoint}>
                  <CheckCircle size={20} color="#10B981" strokeWidth={2.5} />
                  <Text style={styles.learningPointText}>{point}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Course Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Course Details</Text>
            <View style={styles.details}>
              <View style={styles.detail}>
                <Clock size={20} color={Colors.text.secondary} strokeWidth={2} />
                <Text style={styles.detailText}>{course.duration} total</Text>
              </View>
              <View style={styles.detail}>
                <BookOpen size={20} color={Colors.text.secondary} strokeWidth={2} />
                <Text style={styles.detailText}>{course.lessons} lectures</Text>
              </View>
              <View style={styles.detail}>
                <Award size={20} color={Colors.text.secondary} strokeWidth={2} />
                <Text style={styles.detailText}>{course.level}</Text>
              </View>
            </View>
          </View>

          {/* Instructor */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructor</Text>
            <View style={styles.instructor}>
              <Image
                source={{
                  uri: "https://uat.thecolonelsacademy.com/images/instructors/Rajesh%20Thapa.png"
                }}
                style={styles.instructorImage}
                contentFit="cover"
              />
              <View style={styles.instructorInfo}>
                <Text style={styles.instructorName}>{course.instructor}</Text>
                <Text style={styles.instructorBio}>Expert instructor with years of experience</Text>
              </View>
            </View>
          </View>

          {/* Curriculum */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Course Curriculum</Text>
            {curriculum.map((module, moduleIndex) => (
              <View key={module.title} style={styles.module}>
                <TouchableOpacity
                  style={styles.moduleHeader}
                  onPress={() =>
                    setExpandedModule(expandedModule === moduleIndex ? null : moduleIndex)
                  }
                >
                  <Text style={styles.moduleTitle}>{module.title}</Text>
                  <View style={styles.moduleInfo}>
                    <Text style={styles.moduleLessons}>{module.lessons.length} lectures</Text>
                    {expandedModule === moduleIndex ? (
                      <ChevronUp size={20} color={Colors.text.secondary} strokeWidth={2} />
                    ) : (
                      <ChevronDown size={20} color={Colors.text.secondary} strokeWidth={2} />
                    )}
                  </View>
                </TouchableOpacity>

                {expandedModule === moduleIndex && (
                  <View style={styles.lessons}>
                    {module.lessons.map((lesson) => (
                      <View key={lesson.id} style={styles.lesson}>
                        <PlayCircle size={16} color={Colors.text.secondary} strokeWidth={2} />
                        <Text style={styles.lessonTitle}>{lesson.title}</Text>
                        <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                        {lesson.isPreview && (
                          <View style={styles.previewBadge}>
                            <Text style={styles.previewText}>Preview</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed Bottom Bar - Store Compliant */}
      <View style={styles.bottomBar}>
        <View style={styles.enrollInfo}>
          <Text style={styles.enrollTitle}>Purchase on Website</Text>
          <Text style={styles.enrollDescription}>
            Tap to open the course page and complete your purchase securely.
          </Text>
        </View>
        <TouchableOpacity style={styles.enrollButton} onPress={handleEnrollNow}>
          <Text style={styles.enrollButtonText}>Get Started</Text>
          <ChevronRight size={20} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary
  },
  header: {
    height: 380,
    position: "relative",
    backgroundColor: Colors.background.secondary
  },
  headerImage: {
    width: "100%",
    height: "100%",
    position: "absolute"
  },
  imageSkeleton: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1
  },
  headerGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
    justifyContent: "flex-end",
    paddingTop: 80
  },
  headerContent: {
    padding: 20,
    paddingBottom: 24
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(252, 211, 77, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(252, 211, 77, 0.4)"
  },
  category: {
    fontSize: 11,
    color: "#FCD34D",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.5
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 10,
    lineHeight: 32,
    letterSpacing: -0.5,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4
  },
  description: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 22,
    marginBottom: 16,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4
  },
  stats: {
    flexDirection: "row",
    gap: 20
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  statText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "600"
  },
  content: {
    padding: 16
  },
  section: {
    backgroundColor: Colors.background.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border.glass
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 16
  },
  learningPoints: {
    gap: 12
  },
  learningPoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12
  },
  learningPointText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.secondary,
    lineHeight: 22
  },
  details: {
    gap: 12
  },
  detail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  detailText: {
    fontSize: 15,
    color: Colors.text.secondary
  },
  instructor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16
  },
  instructorImage: {
    width: 60,
    height: 60,
    borderRadius: 30
  },
  instructorInfo: {
    flex: 1
  },
  instructorName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 4
  },
  instructorBio: {
    fontSize: 13,
    color: Colors.text.secondary
  },
  module: {
    borderWidth: 1,
    borderColor: Colors.border.glass,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden"
  },
  moduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.background.secondary
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
    flex: 1
  },
  moduleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  moduleLessons: {
    fontSize: 13,
    color: Colors.text.secondary
  },
  lessons: {
    backgroundColor: Colors.background.primary
  },
  lesson: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.background.secondary
  },
  lessonTitle: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.secondary
  },
  lessonDuration: {
    fontSize: 12,
    color: Colors.text.tertiary
  },
  previewBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  previewText: {
    fontSize: 11,
    color: "#1E40AF",
    fontWeight: "700"
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background.primary,
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: Colors.border.glass,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 12
  },
  enrollInfo: {
    marginBottom: 16
  },
  enrollTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 8
  },
  enrollDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20
  },
  enrollButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0B1120",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#0B1120",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  enrollButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1
  }
});
