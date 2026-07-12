import { StyleSheet, Text, type TextProps } from 'react-native'

import { colors, typography } from '@/constants/theme'

/**
 * Escala tipográfica de MecAI (Design System v2.0 §3).
 *
 * Variantes (familia / tamaño / tracking):
 * - display-2xl: Sora Bold     36  -1     → nombre en splash
 * - display-xl:  Sora Bold     30  -0.5   → títulos de sección grandes
 * - display-lg:  Sora SemiBold 24         → títulos de pantalla
 * - title-md:    Inter Medium  20         → títulos de card
 * - title-sm:    Inter Medium  18         → subtítulos
 * - body-lg:     Inter Regular 16         → texto principal
 * - body-md:     Inter Regular 14         → texto secundario
 * - body-sm:     Inter Regular 12         → captions, labels
 * - mono-md:     JetBrains     14         → datos técnicos (km, precios, OBD)
 */
export type TypographyVariant =
  | 'display-2xl'
  | 'display-xl'
  | 'display-lg'
  | 'title-md'
  | 'title-sm'
  | 'body-lg'
  | 'body-md'
  | 'body-sm'
  | 'mono-md'

export interface TypographyProps extends TextProps {
  variant?: TypographyVariant
  /** Color del texto (hex). Por defecto neutral-900 (texto principal). */
  color?: string
}

export function Typography({ variant = 'body-lg', color, style, ...rest }: TypographyProps) {
  return (
    <Text style={[styles[variant], { color: color ?? colors.neutral[900] }, style]} {...rest} />
  )
}

const styles = StyleSheet.create({
  'display-2xl': {
    fontFamily: typography.fontDisplay,
    fontSize: typography.sizes['4xl'],
    letterSpacing: -1,
  },
  'display-xl': {
    fontFamily: typography.fontDisplay,
    fontSize: typography.sizes['3xl'],
    letterSpacing: -0.5,
  },
  'display-lg': {
    fontFamily: typography.fontDisplaySemiBold,
    fontSize: typography.sizes['2xl'],
  },
  'title-md': {
    fontFamily: typography.fontBodyMedium,
    fontSize: typography.sizes.xl,
  },
  'title-sm': {
    fontFamily: typography.fontBodyMedium,
    fontSize: typography.sizes.lg,
  },
  'body-lg': {
    fontFamily: typography.fontBody,
    fontSize: typography.sizes.base,
  },
  'body-md': {
    fontFamily: typography.fontBody,
    fontSize: typography.sizes.sm,
  },
  'body-sm': {
    fontFamily: typography.fontBody,
    fontSize: typography.sizes.xs,
  },
  'mono-md': {
    fontFamily: typography.fontMono,
    fontSize: typography.sizes.sm,
  },
})
