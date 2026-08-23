import { View } from 'react-native'

import { Typography } from '@/components/ui/Typography'
import { colors } from '@/constants/theme'

/**
 * Título y subtítulo de cada paso del onboarding (HU-08).
 *
 * Es hermano de `AuthHeader` pero sin el monograma: dentro del flujo el usuario
 * ya sabe dónde está, y una marca repetida en siete pantallas seguidas resta
 * peso a la pregunta, que es lo único que importa en cada paso.
 *
 * No lleva padding horizontal propio — `Screen` ya aplica los 20px del design
 * system; agregarlos otra vez aquí los duplicaría.
 */
export interface OnboardingHeaderProps {
  title: string
  subtitle?: string
  className?: string
}

export function OnboardingHeader({ title, subtitle, className }: OnboardingHeaderProps) {
  return (
    <View className={className}>
      <Typography variant="display-xl" className="leading-9">
        {title}
      </Typography>

      {subtitle ? (
        <Typography variant="body-lg" color={colors.neutral[700]} className="mt-2 leading-6">
          {subtitle}
        </Typography>
      ) : null}
    </View>
  )
}
