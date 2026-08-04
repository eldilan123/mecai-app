import { AlertTriangle, CheckCircle2 } from 'lucide-react-native'
import { View } from 'react-native'

import { Typography } from './Typography'

import { colors } from '@/constants/theme'

/**
 * Mensaje de estado de formulario/pantalla (errores globales de auth, avisos y
 * confirmaciones). Los errores de campo individuales los muestra `Input`.
 *
 * Tono del design system §5 (UrgencyBadge): fondo suave + texto del color
 * semántico, nunca un banner rojo agresivo.
 */
export type FormErrorTone = 'error' | 'success' | 'warning'

export interface FormErrorProps {
  /** Mensaje a mostrar. Si es null/undefined, el componente no renderiza nada. */
  message?: string | null
  tone?: FormErrorTone
  className?: string
}

const TONE_STYLES: Record<FormErrorTone, { container: string; color: string }> = {
  // *-/10 del design system resueltos a hex opaco (RN no soporta alpha en clases de color)
  error: { container: 'bg-[#FDECEC]', color: colors.error },
  success: { container: 'bg-[#E9F9EF]', color: colors.success },
  warning: { container: 'bg-accent-100', color: '#B26205' }, // accent-600 oscurecido para contraste AA
}

export function FormError({ message, tone = 'error', className }: FormErrorProps) {
  if (!message) {
    return null
  }

  const toneStyle = TONE_STYLES[tone]
  const Icon = tone === 'success' ? CheckCircle2 : AlertTriangle

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      className={`w-full flex-row items-start rounded-sm p-3 ${toneStyle.container} ${className ?? ''}`}
    >
      <View className="mr-2 mt-[1px]">
        <Icon size={16} color={toneStyle.color} />
      </View>
      <Typography variant="body-md" color={toneStyle.color} className="flex-1">
        {message}
      </Typography>
    </View>
  )
}
