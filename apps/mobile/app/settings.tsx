import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  FileText,
  Globe,
  HelpCircle,
  Info,
  Lock,
  Mail,
  MessageCircle,
  Moon,
  Shield,
  Sun,
  Trash2,
  User,
  X
} from "lucide-react-native";
import { type ReactNode, useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Platform,
  StatusBar as RNStatusBar,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useTheme } from "../src/contexts/ThemeContext";

export default function SettingsScreen() {
  const { isDark, toggleTheme, colors } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const notifEnabled = await AsyncStorage.getItem("notificationsEnabled");
      if (notifEnabled !== null) {
        setNotificationsEnabled(notifEnabled === "true");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const toggleNotifications = async (value: boolean) => {
    try {
      setNotificationsEnabled(value);
      await AsyncStorage.setItem("notificationsEnabled", value.toString());

      if (value) {
        // In Expo, we'd use expo-notifications for permissions
        Alert.alert(
          "Notifications",
          "Notifications have been enabled. You will receive updates about courses and live classes.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error toggling notifications:", error);
      Alert.alert("Error", "Failed to update notification settings");
    }
  };

  const toggleDarkMode = async () => {
    await toggleTheme();
  };

  const handleContactSupport = () => {
    Alert.alert("Contact Support", "How would you like to contact us?", [
      {
        text: "Email",
        onPress: () => Linking.openURL("mailto:support@colonelsacademy.com")
      },
      {
        text: "WhatsApp",
        onPress: () => Linking.openURL("https://wa.me/9779763777517")
      },
      { text: "Cancel", style: "cancel" }
    ]);
  };

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "This will clear all locally stored data except your login session. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              const keys = await AsyncStorage.getAllKeys();
              const keysToRemove = keys.filter(
                (key) => !key.includes("auth") && !key.includes("user") && !key.includes("firebase")
              );
              await AsyncStorage.multiRemove(keysToRemove);
              Alert.alert("Success", "Cache cleared successfully!");
            } catch (error) {
              console.error("Error clearing cache:", error);
              Alert.alert("Error", "Failed to clear cache");
            }
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "Profile editing feature coming soon!");
  };

  const handleChangePassword = () => {
    Alert.alert("Change Password", "Password change feature coming soon!");
  };

  const handleLanguage = () => {
    Alert.alert("Language", "Multiple languages coming soon!");
  };

  const SettingItem = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    iconBg,
    iconColor,
    rightElement
  }: {
    icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
    title: string;
    subtitle: string;
    onPress?: () => void;
    iconBg: string;
    iconColor: string;
    rightElement?: ReactNode;
  }) => (
    <TouchableOpacity onPress={onPress} style={styles.settingItem} activeOpacity={0.7}>
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: iconBg }]}>
          <Icon size={20} color={iconColor} strokeWidth={2.5} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      {rightElement || <ChevronRight size={20} color="#9CA3AF" strokeWidth={2.5} />}
    </TouchableOpacity>
  );

  const topInset = Platform.OS === "android" ? RNStatusBar.currentHeight || 0 : 0;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.secondary },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingBottom: 16,
      backgroundColor: colors.background.primary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.primary
    },
    backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    headerTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary },
    scrollView: { flex: 1 },
    scrollContent: { paddingTop: 20 },
    section: { marginBottom: 32 },
    sectionTitle: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.text.secondary,
      letterSpacing: 3,
      paddingHorizontal: 20,
      marginBottom: 8
    },
    sectionContent: { backgroundColor: colors.background.primary, paddingVertical: 4 },
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16,
      paddingHorizontal: 20,
      backgroundColor: colors.background.primary,
      borderBottomWidth: 1,
      borderBottomColor: colors.background.secondary
    },
    settingLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
    settingIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12
    },
    settingText: { flex: 1 },
    settingTitle: { fontSize: 16, fontWeight: "600", color: colors.text.primary, marginBottom: 2 },
    settingSubtitle: { fontSize: 14, color: colors.text.secondary },
    modalContainer: { flex: 1, backgroundColor: colors.background.primary },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.primary
    },
    modalTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary },
    modalDate: { fontSize: 12, color: colors.text.tertiary, marginTop: 2 },
    modalContent: { flex: 1 },
    modalScrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 48 },
    legalSection: {
      flexDirection: "row",
      gap: 12,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.primary,
      marginBottom: 20
    },
    legalSectionLast: { borderBottomWidth: 0, marginBottom: 0 },
    legalSectionNum: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: "#3B82F6",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 1,
      flexShrink: 0
    },
    legalSectionNumText: { fontSize: 12, fontWeight: "700", color: "#FFFFFF" },
    legalSectionBody: { flex: 1 },
    legalSectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 8
    },
    legalSectionText: { fontSize: 14, color: colors.text.secondary, lineHeight: 20 },
    legalBulletList: { marginTop: 8, gap: 6 },
    legalBullet: {
      fontSize: 14,
      color: colors.text.secondary,
      lineHeight: 20,
      paddingLeft: 8,
      borderLeftWidth: 2,
      borderLeftColor: colors.border.primary
    },
    legalHighlight: { color: colors.text.primary, fontWeight: "600" },
    legalContactBox: {
      marginTop: 12,
      padding: 12,
      backgroundColor: colors.background.secondary,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border.primary,
      gap: 4
    },
    legalContactLine: { fontSize: 14, color: colors.text.primary, fontWeight: "500" },
    aboutContainer: { flex: 1, backgroundColor: colors.background.primary },
    aboutHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.primary
    },
    aboutHeaderTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary },
    aboutScroll: { paddingHorizontal: 20, paddingBottom: 48 },
    aboutIdentity: { alignItems: "center", paddingVertical: 32 },
    aboutLogoBox: {
      width: 80,
      height: 80,
      borderRadius: 18,
      backgroundColor: isDark ? "rgba(212, 175, 55, 0.15)" : "#FEF3C7",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16
    },
    aboutName: { fontSize: 24, fontWeight: "700", color: colors.text.primary, marginBottom: 4 },
    aboutVersion: { fontSize: 14, color: colors.text.tertiary },
    aboutGroupLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.text.tertiary,
      letterSpacing: 1,
      marginBottom: 8,
      marginLeft: 4
    },
    aboutGroup: {
      backgroundColor: colors.background.primary,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border.primary,
      marginBottom: 32,
      overflow: "hidden"
    },
    aboutRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 12,
      gap: 8
    },
    aboutRowText: { flex: 1, fontSize: 16, color: colors.text.primary },
    aboutRowDivider: { height: 1, backgroundColor: colors.border.primary, marginLeft: 46 },
    aboutFooterText: {
      fontSize: 12,
      color: colors.text.tertiary,
      textAlign: "center",
      marginTop: 16
    },
    aboutFooterSub: { fontSize: 12, color: colors.text.tertiary, textAlign: "center", marginTop: 4 }
  });

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 16 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color="#111827" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={User}
              title="Edit Profile"
              subtitle="Update your personal information"
              onPress={handleEditProfile}
              iconBg="rgba(59, 130, 246, 0.1)"
              iconColor="#3B82F6"
            />
            <SettingItem
              icon={Lock}
              title="Change Password"
              subtitle="Update your account password"
              onPress={handleChangePassword}
              iconBg="rgba(251, 191, 36, 0.1)"
              iconColor="#F59E0B"
            />
          </View>
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APP SETTINGS</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={Bell}
              title="Notifications"
              subtitle={notificationsEnabled ? "Enabled" : "Disabled"}
              onPress={() => {}}
              iconBg="rgba(139, 92, 246, 0.1)"
              iconColor="#8B5CF6"
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={toggleNotifications}
                  trackColor={{ false: "#D1D5DB", true: "#F59E0B" }}
                  thumbColor="#FFFFFF"
                />
              }
            />
            <SettingItem
              icon={Shield}
              title="Privacy Policy"
              subtitle="Read our privacy policy"
              onPress={() => setPrivacyModalVisible(true)}
              iconBg="rgba(16, 185, 129, 0.1)"
              iconColor="#10B981"
            />
            <SettingItem
              icon={Globe}
              title="Language"
              subtitle="English"
              onPress={handleLanguage}
              iconBg="rgba(251, 191, 36, 0.1)"
              iconColor="#F59E0B"
            />
            <SettingItem
              icon={isDark ? Sun : Moon}
              title="Dark Mode"
              subtitle={isDark ? "On" : "Off"}
              onPress={() => {}}
              iconBg={isDark ? "rgba(251, 191, 36, 0.1)" : "#F3F4F6"}
              iconColor={isDark ? "#F59E0B" : "#6B7280"}
              rightElement={
                <Switch
                  value={isDark}
                  onValueChange={toggleDarkMode}
                  trackColor={{ false: "#D1D5DB", true: "#F59E0B" }}
                  thumbColor="#FFFFFF"
                />
              }
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUPPORT</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={HelpCircle}
              title="Help & Support"
              subtitle="Contact us for assistance"
              onPress={handleContactSupport}
              iconBg="#F3F4F6"
              iconColor="#6B7280"
            />
            <SettingItem
              icon={FileText}
              title="Terms & Conditions"
              subtitle="Read our terms and policies"
              onPress={() => setTermsModalVisible(true)}
              iconBg="#F3F4F6"
              iconColor="#6B7280"
            />
            <SettingItem
              icon={Info}
              title="About"
              subtitle="Version 1.0.0"
              onPress={() => setAboutModalVisible(true)}
              iconBg="#F3F4F6"
              iconColor="#6B7280"
            />
            <SettingItem
              icon={Trash2}
              title="Clear Cache"
              subtitle="Free up storage space"
              onPress={handleClearCache}
              iconBg="rgba(239, 68, 68, 0.1)"
              iconColor="#EF4444"
            />
          </View>
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>

      {/* Terms & Conditions Modal */}
      <Modal
        visible={termsModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setTermsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalHeader, { paddingTop: Platform.OS === "ios" ? 60 : 16 }]}>
            <View>
              <Text style={styles.modalTitle}>Terms & Conditions</Text>
              <Text style={styles.modalDate}>Last updated: {new Date().toLocaleDateString()}</Text>
            </View>
            <TouchableOpacity onPress={() => setTermsModalVisible(false)}>
              <X size={22} color="#111827" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}
          >
            <View style={styles.legalSection}>
              <View style={styles.legalSectionNum}>
                <Text style={styles.legalSectionNumText}>1</Text>
              </View>
              <View style={styles.legalSectionBody}>
                <Text style={styles.legalSectionTitle}>Agreement to Terms</Text>
                <Text style={styles.legalSectionText}>
                  By accessing our website and purchasing our courses, you agree to be bound by
                  these Terms of Service and to comply with all applicable laws and regulations.
                </Text>
              </View>
            </View>

            <View style={styles.legalSection}>
              <View style={styles.legalSectionNum}>
                <Text style={styles.legalSectionNumText}>2</Text>
              </View>
              <View style={styles.legalSectionBody}>
                <Text style={styles.legalSectionTitle}>Intellectual Property</Text>
                <Text style={styles.legalSectionText}>
                  The content, organization, graphics, design, compilation, digital conversion and
                  other matters related to the Site are protected under applicable copyrights,
                  trademarks and other proprietary rights. The copying, redistribution, use or
                  publication by you of any such matters or any part of the Site is strictly
                  prohibited.
                </Text>
              </View>
            </View>

            <View style={styles.legalSection}>
              <View style={styles.legalSectionNum}>
                <Text style={styles.legalSectionNumText}>3</Text>
              </View>
              <View style={styles.legalSectionBody}>
                <Text style={styles.legalSectionTitle}>Use License</Text>
                <Text style={styles.legalSectionText}>
                  Permission is granted to temporarily download one copy of the materials for
                  personal, non-commercial transitory viewing only. Under this license you may not:
                </Text>
                <View style={styles.legalBulletList}>
                  <Text style={styles.legalBullet}>Modify or copy the materials</Text>
                  <Text style={styles.legalBullet}>
                    Use the materials for any commercial purpose or public display
                  </Text>
                  <Text style={styles.legalBullet}>
                    Attempt to decompile or reverse engineer any software
                  </Text>
                  <Text style={styles.legalBullet}>
                    Transfer the materials to another person or mirror on any other server
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.legalSection}>
              <View style={styles.legalSectionNum}>
                <Text style={styles.legalSectionNumText}>4</Text>
              </View>
              <View style={styles.legalSectionBody}>
                <Text style={styles.legalSectionTitle}>Disclaimer</Text>
                <Text style={styles.legalSectionText}>
                  The materials on The Colonel's Academy's website are provided on an 'as is' basis.
                  The Colonel's Academy makes no warranties, expressed or implied, and hereby
                  disclaims all other warranties including implied warranties of merchantability or
                  fitness for a particular purpose.
                </Text>
              </View>
            </View>

            <View style={[styles.legalSection, styles.legalSectionLast]}>
              <View
                style={[styles.legalSectionNum, { backgroundColor: "rgba(251, 191, 36, 0.2)" }]}
              >
                <Text style={[styles.legalSectionNumText, { color: "#D97706" }]}>5</Text>
              </View>
              <View style={styles.legalSectionBody}>
                <Text style={styles.legalSectionTitle}>Refund Policy</Text>
                <Text style={styles.legalSectionText}>
                  We offer a <Text style={styles.legalHighlight}>7-day money-back guarantee</Text>{" "}
                  on all our online courses provided less than 30% of the course content has been
                  consumed. To request a refund, please contact our support team.
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        visible={privacyModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPrivacyModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalHeader, { paddingTop: Platform.OS === "ios" ? 60 : 16 }]}>
            <View>
              <Text style={styles.modalTitle}>Privacy Policy</Text>
              <Text style={styles.modalDate}>Last updated: {new Date().toLocaleDateString()}</Text>
            </View>
            <TouchableOpacity onPress={() => setPrivacyModalVisible(false)}>
              <X size={22} color="#111827" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}
          >
            <View style={styles.legalSection}>
              <View style={styles.legalSectionNum}>
                <Text style={styles.legalSectionNumText}>1</Text>
              </View>
              <View style={styles.legalSectionBody}>
                <Text style={styles.legalSectionTitle}>Introduction</Text>
                <Text style={styles.legalSectionText}>
                  Welcome to The Colonel's Academy. We respect your privacy and are committed to
                  protecting your personal data. This policy informs you how we look after your
                  personal data and tells you about your privacy rights.
                </Text>
              </View>
            </View>

            <View style={styles.legalSection}>
              <View style={styles.legalSectionNum}>
                <Text style={styles.legalSectionNumText}>2</Text>
              </View>
              <View style={styles.legalSectionBody}>
                <Text style={styles.legalSectionTitle}>Data We Collect</Text>
                <Text style={styles.legalSectionText}>
                  We may collect, use, store and transfer different kinds of personal data about
                  you:
                </Text>
                <View style={styles.legalBulletList}>
                  <Text style={styles.legalBullet}>
                    Identity Data: first name, last name, username or similar identifier
                  </Text>
                  <Text style={styles.legalBullet}>
                    Contact Data: email address and telephone numbers
                  </Text>
                  <Text style={styles.legalBullet}>
                    Transaction Data: details about payments and products purchased
                  </Text>
                  <Text style={styles.legalBullet}>
                    Technical Data: IP address, login data, browser type and version
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.legalSection}>
              <View style={styles.legalSectionNum}>
                <Text style={styles.legalSectionNumText}>3</Text>
              </View>
              <View style={styles.legalSectionBody}>
                <Text style={styles.legalSectionTitle}>How We Use Your Data</Text>
                <Text style={styles.legalSectionText}>
                  We will only use your personal data when the law allows us to. Most commonly:
                </Text>
                <View style={styles.legalBulletList}>
                  <Text style={styles.legalBullet}>To register you as a new student/customer</Text>
                  <Text style={styles.legalBullet}>
                    To process and deliver your order including manage payments, fees and charges
                  </Text>
                  <Text style={styles.legalBullet}>
                    To manage our relationship with you including notifying you about changes to our
                    terms or privacy policy
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.legalSection}>
              <View style={styles.legalSectionNum}>
                <Text style={styles.legalSectionNumText}>4</Text>
              </View>
              <View style={styles.legalSectionBody}>
                <Text style={styles.legalSectionTitle}>Data Security</Text>
                <Text style={styles.legalSectionText}>
                  We have put in place appropriate security measures to prevent your personal data
                  from being accidentally lost, used or accessed in an unauthorised way. We limit
                  access to your personal data to those who have a business need to know.
                </Text>
              </View>
            </View>

            <View style={styles.legalSection}>
              <View style={styles.legalSectionNum}>
                <Text style={styles.legalSectionNumText}>5</Text>
              </View>
              <View style={styles.legalSectionBody}>
                <Text style={styles.legalSectionTitle}>Data Retention & Account Deletion</Text>
                <Text style={styles.legalSectionText}>
                  We retain your personal data only for as long as necessary. If you wish to
                  permanently delete your account and all associated data, you can do so directly
                  within the application.{" "}
                  <Text style={styles.legalHighlight}>
                    Deleting your account will instantly revoke access to all purchased courses and
                    your learning progress cannot be recovered.
                  </Text>
                </Text>
              </View>
            </View>

            <View style={[styles.legalSection, styles.legalSectionLast]}>
              <View style={styles.legalSectionNum}>
                <Text style={styles.legalSectionNumText}>6</Text>
              </View>
              <View style={styles.legalSectionBody}>
                <Text style={styles.legalSectionTitle}>Contact Details</Text>
                <Text style={styles.legalSectionText}>
                  For any questions about this privacy policy, contact us at:
                </Text>
                <View style={styles.legalContactBox}>
                  <Text style={styles.legalContactLine}>support@colonelsacademy.com</Text>
                  <Text style={styles.legalContactLine}>+977-9851347306</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal
        visible={aboutModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAboutModalVisible(false)}
      >
        <View style={styles.aboutContainer}>
          <View style={[styles.aboutHeader, { paddingTop: Platform.OS === "ios" ? 60 : 16 }]}>
            <Text style={styles.aboutHeaderTitle}>About</Text>
            <TouchableOpacity onPress={() => setAboutModalVisible(false)}>
              <X size={22} color="#111827" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.aboutScroll}
          >
            {/* App Identity */}
            <View style={styles.aboutIdentity}>
              <View style={styles.aboutLogoBox}>
                <Text style={{ fontSize: 40 }}>🎓</Text>
              </View>
              <Text style={styles.aboutName}>Colonel's Academy</Text>
              <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            </View>

            {/* Contact */}
            <Text style={styles.aboutGroupLabel}>CONTACT</Text>
            <View style={styles.aboutGroup}>
              <TouchableOpacity
                style={styles.aboutRow}
                onPress={() => Linking.openURL("mailto:support@colonelsacademy.com")}
              >
                <Mail size={18} color="#6B7280" strokeWidth={2} />
                <Text style={styles.aboutRowText}>support@colonelsacademy.com</Text>
                <ChevronRight size={16} color="#9CA3AF" strokeWidth={2} />
              </TouchableOpacity>
              <View style={styles.aboutRowDivider} />
              <TouchableOpacity
                style={styles.aboutRow}
                onPress={() => Linking.openURL("https://wa.me/9779763777517")}
              >
                <MessageCircle size={18} color="#6B7280" strokeWidth={2} />
                <Text style={styles.aboutRowText}>+977 976-3777517</Text>
                <ChevronRight size={16} color="#9CA3AF" strokeWidth={2} />
              </TouchableOpacity>
              <View style={styles.aboutRowDivider} />
              <TouchableOpacity
                style={styles.aboutRow}
                onPress={() => Linking.openURL("https://colonelsacademy.com")}
              >
                <Globe size={18} color="#6B7280" strokeWidth={2} />
                <Text style={styles.aboutRowText}>colonelsacademy.com</Text>
                <ChevronRight size={16} color="#9CA3AF" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <Text style={styles.aboutFooterText}>
              © {new Date().getFullYear()} Colonel's Academy. All rights reserved.
            </Text>
            <Text style={styles.aboutFooterSub}>Made with 🇳🇵 in Nepal</Text>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
