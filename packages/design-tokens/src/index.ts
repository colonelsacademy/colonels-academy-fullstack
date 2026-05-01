export const colorTokens = {
  ink: "#13212f",
  surface: "#f5f1e8",
  surfaceMuted: "#ebe3d5",
  card: "#ffffff",
  border: "#d7cfbf",
  accent: "#7f5f26",
  accentStrong: "#5f4419",
  success: "#2d6a4f",
  danger: "#8f2d1f",
  info: "#1d4f7a",
  textPrimary: "#18212b",
  textSecondary: "#5d6875",
  textInverse: "#f9f7f2"
} as const;

export const spacingTokens = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
} as const;

export const radiusTokens = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999
} as const;

export const typographyTokens = {
  hero: 30,
  title: 24,
  section: 19,
  body: 16,
  caption: 13
} as const;

export const shadowTokens = {
  card: {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 10
    },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4
  }
} as const;

export const mobileTheme = {
  colors: colorTokens,
  spacing: spacingTokens,
  radii: radiusTokens,
  typography: typographyTokens,
  shadows: shadowTokens
} as const;
