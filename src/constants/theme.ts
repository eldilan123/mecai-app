/**
 * Design tokens de MecAI (en TypeScript, para uso desde código).
 *
 * ⚠️ FUENTE DE VERDAD: Design System v2.0 (`04-mecai-design-system.md`), NO el
 * tech spec v2.0 (§4). El `theme.ts` del tech spec quedó desactualizado tras el
 * renombre MecIA → MecAI: allí el main brand era `primary.500` (#2D7A6B); en el
 * design system v2.0 el main brand es `primary.600` (#1F6B5E). Ante conflicto de
 * tokens/diseño, gana el design system.
 *
 * Mantener sincronizado con `tailwind.config.js` (mismos valores).
 */

export const colors = {
  // PRIMARY — Verde Petróleo
  primary: {
    50: '#EAF6F3', // fondos de cards, estados vacíos
    100: '#D1EDE8', // fondos suaves, chips
    400: '#3D9080', // borders activos, highlights
    500: '#2D7A6B', // hover states, iconos activos
    600: '#1F6B5E', // MAIN BRAND — headers, botones primarios, fondo del monograma
    // TODO(700/900): el design system v2.0 no define estos tonos. Valores tomados
    // del tech spec v2.0 como fallback coherente; revisar si se formalizan.
    700: '#1A4840',
    900: '#0D2420',
  },
  // ACCENT — Naranja Cálido
  accent: {
    100: '#FDE8C8', // fondos de alerta suave
    400: '#F4A44A', // warning suave
    500: '#F08C1F', // CTAs secundarios, badges urgentes
    600: '#E8780A', // alertas críticas, precio, "AI" del wordmark
  },
  // NEUTRAL
  neutral: {
    0: '#FFFFFF', // cards, modales
    50: '#F8F7F4', // fondo de pantalla — blanco hueso
    100: '#EFEFEC', // fondos de inputs
    200: '#DDDDD9', // bordes, dividers
    500: '#8A8A85', // placeholder, texto desactivado
    700: '#4A4A46', // texto secundario
    900: '#1C1C18', // texto principal
  },
  // SEMÁNTICOS
  success: '#22C55E', // todo bien 🟢
  warning: '#F59E0B', // revisar pronto 🟡
  error: '#EF4444', // urgente 🔴
  info: '#3B82F6', // datos, estadísticas
} as const

export const typography = {
  // Nombres de familia REALES cargados vía @expo-google-fonts. Usar estos strings
  // en `style.fontFamily` (en className usar las claves de tailwind.config.js).
  fontDisplay: 'Sora_700Bold',
  fontDisplaySemiBold: 'Sora_600SemiBold',
  fontBody: 'Inter_400Regular',
  fontBodyMedium: 'Inter_500Medium',
  fontMono: 'JetBrainsMono_400Regular',

  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
} as const

export const spacing = {
  // Sistema de 8px
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const

export const borderRadius = {
  sm: 8, // inputs, chips pequeños
  md: 12, // cards, botones
  lg: 16, // modales, bottom sheets
  xl: 24, // cards hero, ilustraciones
  full: 9999, // avatares, badges circulares
} as const

export const theme = { colors, typography, spacing, borderRadius } as const
export type Theme = typeof theme
