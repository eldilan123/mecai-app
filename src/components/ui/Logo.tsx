import { Image } from 'expo-image'
import { View } from 'react-native'

import horizontalLogo from '@/assets/logo/mecai-logo-horizontal.png'
import monogramLogo from '@/assets/logo/mecai-icon-only.png'

/**
 * Logo de MecAI (Design System v2.0 §7).
 *
 * - `horizontal`: lockup completo (monograma + wordmark). Pantalla de bienvenida.
 *   Relación de aspecto ~3.05:1 del asset original; el alto se deriva del ancho
 *   para no deformarlo (el DS prohíbe estirar el logo).
 * - `monogram`: solo el cuadrado con la "M". Branding contextual en pantallas
 *   de formulario, donde el lockup completo competiría con el título.
 *
 * Tamaño mínimo del DS: 120px de ancho para el horizontal, 24px el monograma.
 */
export type LogoVariant = 'horizontal' | 'monogram'

export interface LogoProps {
  variant?: LogoVariant
  /** Ancho en px. El alto se calcula solo. */
  width?: number
  className?: string
}

/** Proporción del lockup horizontal (ancho / alto) medida sobre el asset. */
const HORIZONTAL_RATIO = 3.05

export function Logo({ variant = 'horizontal', width = 220, className }: LogoProps) {
  const isMonogram = variant === 'monogram'
  const height = isMonogram ? width : Math.round(width / HORIZONTAL_RATIO)

  return (
    <View className={className}>
      <Image
        source={isMonogram ? monogramLogo : horizontalLogo}
        style={{ width, height }}
        contentFit="contain"
        accessibilityLabel="MecAI"
      />
    </View>
  )
}
