import { Pressable, View } from 'react-native'

import { Typography } from './Typography'

import { colors, typography } from '@/constants/theme'

/**
 * Link de texto tocable.
 *
 * Garantiza los 44px de área táctil que piden las guías de iOS y Android sin
 * inflar el diseño: el padding vertical y el `hitSlop` hacen el trabajo, no el
 * tamaño de la letra.
 *
 * Con `label` antepone texto neutro no tocable ("¿Ya tienes cuenta? ") y deja
 * en verde petróleo solo la parte accionable.
 */
export interface TextLinkProps {
  /** Texto neutro que precede al link (opcional). */
  label?: string
  /** Texto accionable, en primary-600. */
  action: string
  onPress: () => void
  align?: 'left' | 'center' | 'right'
  className?: string
}

const ALIGN_CLASS: Record<NonNullable<TextLinkProps['align']>, string> = {
  left: 'self-start',
  center: 'self-center',
  right: 'self-end',
}

export function TextLink({ label, action, onPress, align = 'center', className }: TextLinkProps) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label ? `${label} ${action}` : action}
      onPress={onPress}
      hitSlop={12}
      className={`min-h-11 justify-center py-2 ${ALIGN_CLASS[align]} ${className ?? ''}`}
    >
      <View className="flex-row items-center">
        {label ? (
          <Typography variant="body-md" color={colors.neutral[700]}>
            {`${label} `}
          </Typography>
        ) : null}
        <Typography
          variant="body-md"
          color={colors.primary[600]}
          style={{ fontFamily: typography.fontBodyMedium }}
        >
          {action}
        </Typography>
      </View>
    </Pressable>
  )
}
