import { View } from 'react-native'

import { Logo } from '@/components/ui/Logo'
import { Typography } from '@/components/ui/Typography'
import { colors } from '@/constants/theme'

/**
 * Encabezado de las pantallas de formulario de auth.
 *
 * Monograma pequeño alineado a la izquierda + título + subtítulo. El monograma
 * da presencia de marca sin competir con el título: el lockup completo se
 * reserva para la bienvenida (Design System v2.0 §7).
 */
export interface AuthHeaderProps {
  title: string
  subtitle?: string
  className?: string
}

export function AuthHeader({ title, subtitle, className }: AuthHeaderProps) {
  return (
    <View className={className}>
      <Logo variant="monogram" width={60} className="mb-6" />

      <Typography variant="display-lg">{title}</Typography>

      {subtitle ? (
        <Typography variant="body-md" color={colors.neutral[700]} className="mt-2 leading-5">
          {subtitle}
        </Typography>
      ) : null}
    </View>
  )
}
