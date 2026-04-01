import type { PropsWithChildren, ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { mobileTheme } from "@colonels-academy/design-tokens";

interface ScreenShellProps extends PropsWithChildren {
  eyebrow?: string;
  title: string;
  subtitle: string;
  footer?: ReactNode;
}

export function ScreenShell({ children, eyebrow, title, subtitle, footer }: ScreenShellProps) {
  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.container}>
      <View style={styles.hero}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.body}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: mobileTheme.spacing.md
  },
  container: {
    backgroundColor: mobileTheme.colors.surface
  },
  content: {
    gap: mobileTheme.spacing.lg,
    padding: mobileTheme.spacing.lg
  },
  eyebrow: {
    color: mobileTheme.colors.accentStrong,
    fontSize: mobileTheme.typography.caption,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  footer: {
    paddingBottom: mobileTheme.spacing.xl
  },
  hero: {
    backgroundColor: mobileTheme.colors.card,
    borderColor: mobileTheme.colors.border,
    borderRadius: mobileTheme.radii.lg,
    borderWidth: 1,
    gap: mobileTheme.spacing.sm,
    padding: mobileTheme.spacing.lg,
    ...mobileTheme.shadows.card
  },
  subtitle: {
    color: mobileTheme.colors.textSecondary,
    fontSize: mobileTheme.typography.body,
    lineHeight: 22
  },
  title: {
    color: mobileTheme.colors.textPrimary,
    fontSize: mobileTheme.typography.hero,
    fontWeight: "800"
  }
});
