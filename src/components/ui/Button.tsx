import { ActivityIndicator, Pressable, View, type PressableProps } from 'react-native'

import { Typography } from './Typography'

import { colors, typography } from '@/constants/theme'

/**
 * Button del design system (Design System v2.0 §5).
 *
 * Variantes:
 * - primary:   bg-primary-600, texto blanco
 * - secondary: bg-primary-50, texto primary-600, borde primary-100
 * - danger:    bg-error/10, texto error, borde error/30
 * - ghost:     transparente, texto primary-600
 *
 * Tamaños: sm (py-2 px-4 / 13px) · md (py-3 px-5 / 15px) · lg (py-4 px-6 / 16px)
 * Deshabilitado (o cargando): opacity 40% y sin eventos táctiles.
 *
 * Nota: el design system v2.0 pinta GHOST en neutral-700. Se cambió a
 * primary-600 en el pase de pulido visual de HU-06/07 (decisión de Dilan): el
 * ghost se usa como acción secundaria de marca ("Ya tengo cuenta", "Volver a
 * login") y en neutral gris no se leía como tocable. Actualizar el DS a v2.1.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  title: string
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  /** Ocupa todo el ancho disponible. Por defecto true (CTAs de pantalla completa). */
  fullWidth?: boolean
  /** Ícono opcional a la izquierda del texto. */
  icon?: React.ReactNode
  /** Clases extra para el contenedor (márgenes, etc.). */
  className?: string
}

const VARIANT_STYLES: Record<ButtonVariant, { container: string; textColor: string }> = {
  primary: {
    container: 'bg-primary-600',
    textColor: colors.neutral[0],
  },
  secondary: {
    container: 'bg-primary-50 border border-primary-100',
    textColor: colors.primary[600],
  },
  danger: {
    // error/10 y error/30 del design system, resueltos a hex opaco (RN no soporta bg-error/10)
    container: 'bg-[#FDECEC] border border-[#F7BFBF]',
    textColor: colors.error,
  },
  ghost: {
    container: 'bg-transparent',
    textColor: colors.primary[600],
  },
}

const SIZE_STYLES: Record<ButtonSize, { container: string; fontSize: number }> = {
  sm: { container: 'py-2 px-4', fontSize: 13 },
  md: { container: 'py-3 px-5', fontSize: 15 },
  lg: { container: 'py-4 px-6', fontSize: 16 },
}

export function Button({
  title,
  variant = 'primary',
  size = 'lg',
  loading = false,
  fullWidth = true,
  icon,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled === true || loading
  const variantStyle = VARIANT_STYLES[variant]
  const sizeStyle = SIZE_STYLES[size]

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={[
        'flex-row items-center justify-center rounded-md',
        variantStyle.container,
        sizeStyle.container,
        fullWidth ? 'w-full' : 'self-start',
        isDisabled ? 'opacity-40' : '',
        // Tap feedback del design system §9
        'active:scale-[0.97]',
        className ?? '',
      ].join(' ')}
      {...rest}
    >
      {/* El contenido se mantiene montado (invisible) durante el loading para
          que el botón conserve exactamente el mismo alto y ancho: sin esto, el
          spinner encoge el botón y el layout salta. */}
      <View className={`flex-row items-center ${loading ? 'opacity-0' : ''}`}>
        {icon ? <View className="mr-2">{icon}</View> : null}
        <Typography
          color={variantStyle.textColor}
          style={{
            fontFamily: typography.fontBodyMedium,
            fontSize: sizeStyle.fontSize,
          }}
        >
          {title}
        </Typography>
      </View>

      {loading ? (
        <View className="absolute inset-0 items-center justify-center">
          <ActivityIndicator size="small" color={variantStyle.textColor} />
        </View>
      ) : null}
    </Pressable>
  )
}
