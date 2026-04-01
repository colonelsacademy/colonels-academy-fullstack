import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { mobileTheme } from "@colonels-academy/design-tokens";

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Screen not found.</Text>
      <Link asChild href="/">
        <Pressable style={styles.linkButton}>
          <Text style={styles.link}>Return to the mobile academy home</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: mobileTheme.colors.surface,
    flex: 1,
    gap: mobileTheme.spacing.md,
    justifyContent: "center",
    padding: mobileTheme.spacing.lg
  },
  link: {
    color: mobileTheme.colors.info,
    fontSize: mobileTheme.typography.body,
    fontWeight: "700"
  },
  linkButton: {
    borderColor: mobileTheme.colors.border,
    borderRadius: mobileTheme.radii.sm,
    borderWidth: 1,
    paddingHorizontal: mobileTheme.spacing.md,
    paddingVertical: mobileTheme.spacing.sm
  },
  title: {
    color: mobileTheme.colors.textPrimary,
    fontSize: mobileTheme.typography.title,
    fontWeight: "800"
  }
});
