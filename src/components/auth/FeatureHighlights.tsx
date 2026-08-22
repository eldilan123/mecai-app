import { DollarSign, Sparkles, Wrench, type LucideIcon } from 'lucide-react-native'
import { View } from 'react-native'

import { Typography } from '@/components/ui/Typography'
import { colors, typography } from '@/constants/theme'

/**
 * Las tres promesas de MecAI, en la pantalla de bienvenida.
 *
 * Traduce la propuesta de valor del brief a algo escaneable en dos segundos:
 * qué hace la app, qué problema evita, y por qué es distinta. El texto va en
 * lenguaje de usuario ("no te embalan"), no en lenguaje de producto.
 */
interface Feature {
  icon: LucideIcon
  label: string
}

const FEATURES: Feature[] = [
  { icon: Wrench, label: 'Mantenimientos al día' },
  { icon: DollarSign, label: 'Sin sorpresas en el taller' },
  { icon: Sparkles, label: 'IA que sabe de tu carro' },
]

export interface FeatureHighlightsProps {
  className?: string
}

export function FeatureHighlights({ className }: FeatureHighlightsProps) {
  return (
    <View className={`w-full flex-row justify-between gap-3 ${className ?? ''}`}>
      {FEATURES.map(({ icon: Icon, label }) => (
        <View key={label} className="flex-1 items-center">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-primary-50">
            <Icon size={24} color={colors.primary[600]} />
          </View>
          <Typography
            variant="body-sm"
            color={colors.neutral[700]}
            numberOfLines={2}
            className="mt-3 text-center leading-4"
            style={{ fontFamily: typography.fontBodyMedium }}
          >
            {label}
          </Typography>
        </View>
      ))}
    </View>
  )
}
