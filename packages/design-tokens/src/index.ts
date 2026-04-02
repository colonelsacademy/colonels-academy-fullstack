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

/**
 * CSS custom property map for web (Tailwind CSS / global stylesheet).
 * Usage: inject via a <style> tag or CSS-in-JS at the root layout.
 * Example:  `style={{ '--color-accent': webCssVars['--color-accent'] }}`
 */
export const webCssVars = {
  "--color-ink":            colorTokens.ink,
  "--color-surface":        colorTokens.surface,
  "--color-surface-muted":  colorTokens.surfaceMuted,
  "--color-card":           colorTokens.card,
  "--color-border":         colorTokens.border,
  "--color-accent":         colorTokens.accent,
  "--color-accent-strong":  colorTokens.accentStrong,
  "--color-success":        colorTokens.success,
  "--color-danger":         colorTokens.danger,
  "--color-info":           colorTokens.info,
  "--color-text-primary":   colorTokens.textPrimary,
  "--color-text-secondary": colorTokens.textSecondary,
  "--color-text-inverse":   colorTokens.textInverse,
  "--spacing-xs":  `${spacingTokens.xs}px`,
  "--spacing-sm":  `${spacingTokens.sm}px`,
  "--spacing-md":  `${spacingTokens.md}px`,
  "--spacing-lg":  `${spacingTokens.lg}px`,
  "--spacing-xl":  `${spacingTokens.xl}px`,
  "--spacing-xxl": `${spacingTokens.xxl}px`,
  "--radius-sm":   `${radiusTokens.sm}px`,
  "--radius-md":   `${radiusTokens.md}px`,
  "--radius-lg":   `${radiusTokens.lg}px`,
  "--radius-pill": `${radiusTokens.pill}px`,
} as const;

/** Generates a :root { … } CSS block string from the token map. */
export function generateCssVarBlock(): string {
  const declarations = Object.entries(webCssVars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
  return `:root {\n${declarations}\n}`;
}
