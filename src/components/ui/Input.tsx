import { Eye, EyeOff } from 'lucide-react-native'
import { forwardRef, useState } from 'react'
import { Pressable, TextInput, View, type TextInputProps } from 'react-native'

import { Typography } from './Typography'

import { colors, typography } from '@/constants/theme'

/**
 * Input del design system (Design System v2.0 §4/§5).
 *
 * - Label opcional arriba (body-sm medium, neutral-700), separado 8px del campo
 * - Fondo neutral-100, borde neutral-200, radius sm (8px)
 * - Foco: borde primary-400 · Error: borde error + mensaje debajo
 * - `icon` pinta un ícono guía a la izquierda (neutral-500 → primary-600 al foco)
 * - `type="password"` añade el toggle show/hide (área táctil de 44px)
 * - `rightSlot` pinta un control a la derecha (ej. la X de limpiar búsqueda)
 */
export type InputType = 'text' | 'email' | 'password'

export interface InputProps extends Omit<TextInputProps, 'style' | 'secureTextEntry'> {
  label?: string
  error?: string
  type?: InputType
  /** Ícono guía a la izquierda del campo (Lucide, tamaño 20). */
  icon?: React.ReactNode
  /** Texto de ayuda debajo del input (se oculta si hay error). */
  hint?: string
  /**
   * Control a la derecha del campo, dentro del borde. Se ignora en
   * `type="password"`, que ya ocupa ese lugar con el toggle show/hide.
   */
  rightSlot?: React.ReactNode
  className?: string
}

/** Presets de teclado/autocompletado según el tipo de campo. */
const TYPE_PROPS: Record<InputType, Partial<TextInputProps>> = {
  text: {
    autoCapitalize: 'words',
    autoCorrect: false,
  },
  email: {
    keyboardType: 'email-address',
    autoCapitalize: 'none',
    autoCorrect: false,
    autoComplete: 'email',
    textContentType: 'emailAddress',
  },
  password: {
    autoCapitalize: 'none',
    autoCorrect: false,
    autoComplete: 'password',
    textContentType: 'password',
  },
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, type = 'text', icon, hint, rightSlot, className, onFocus, onBlur, ...rest },
  ref
) {
  const [isFocused, setIsFocused] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const hasError = Boolean(error)
  const isPassword = type === 'password'

  const borderClass = hasError
    ? 'border-error'
    : isFocused
      ? 'border-primary-400'
      : 'border-neutral-200'

  return (
    <View className={`w-full ${className ?? ''}`}>
      {label ? (
        <Typography
          variant="body-sm"
          color={colors.neutral[700]}
          className="mb-2"
          style={{ fontFamily: typography.fontBodyMedium }}
        >
          {label}
        </Typography>
      ) : null}

      <View
        className={`flex-row items-center rounded-sm border bg-neutral-100 px-3 ${borderClass}`}
      >
        {icon ? <View className="mr-2">{icon}</View> : null}

        <TextInput
          ref={ref}
          placeholderTextColor={colors.neutral[500]}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={(e) => {
            setIsFocused(true)
            onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            onBlur?.(e)
          }}
          style={{
            flex: 1,
            paddingVertical: 14,
            fontFamily: typography.fontBody,
            fontSize: typography.sizes.base,
            color: colors.neutral[900],
          }}
          {...TYPE_PROPS[type]}
          {...rest}
        />

        {!isPassword && rightSlot ? rightSlot : null}

        {isPassword ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            hitSlop={12}
            onPress={() => setIsPasswordVisible((visible) => !visible)}
            // 44px de área táctil (guideline iOS/Android) sin agrandar el campo
            className="h-11 w-11 items-center justify-center"
          >
            {isPasswordVisible ? (
              <EyeOff size={24} color={colors.neutral[500]} />
            ) : (
              <Eye size={24} color={colors.neutral[500]} />
            )}
          </Pressable>
        ) : null}
      </View>

      {hasError ? (
        <Typography variant="body-sm" color={colors.error} className="mt-2">
          {error}
        </Typography>
      ) : hint ? (
        <Typography variant="body-sm" color={colors.neutral[500]} className="mt-2">
          {hint}
        </Typography>
      ) : null}
    </View>
  )
})
