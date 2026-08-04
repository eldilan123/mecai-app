import { Eye, EyeOff } from 'lucide-react-native'
import { forwardRef, useState } from 'react'
import { Pressable, TextInput, View, type TextInputProps } from 'react-native'

import { Typography } from './Typography'

import { colors, typography } from '@/constants/theme'

/**
 * Input del design system (Design System v2.0 §4/§5).
 *
 * - Label opcional arriba (body-sm, neutral-700)
 * - Fondo neutral-100, borde neutral-200, radius sm (8px), padding 12px
 * - Foco: borde primary-400 · Error: borde error + mensaje debajo
 * - `type="password"` añade el toggle show/hide con íconos Lucide
 */
export type InputType = 'text' | 'email' | 'password'

export interface InputProps extends Omit<TextInputProps, 'style' | 'secureTextEntry'> {
  label?: string
  error?: string
  type?: InputType
  /** Texto de ayuda debajo del input (se oculta si hay error). */
  hint?: string
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
  { label, error, type = 'text', hint, className, onFocus, onBlur, ...rest },
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
        <Typography variant="body-sm" color={colors.neutral[700]} className="mb-1">
          {label}
        </Typography>
      ) : null}

      <View
        className={`flex-row items-center rounded-sm border bg-neutral-100 px-3 ${borderClass}`}
      >
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
            paddingVertical: 12,
            fontFamily: typography.fontBody,
            fontSize: typography.sizes.base,
            color: colors.neutral[900],
          }}
          {...TYPE_PROPS[type]}
          {...rest}
        />

        {isPassword ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            hitSlop={8}
            onPress={() => setIsPasswordVisible((visible) => !visible)}
            className="pl-2"
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color={colors.neutral[500]} />
            ) : (
              <Eye size={20} color={colors.neutral[500]} />
            )}
          </Pressable>
        ) : null}
      </View>

      {hasError ? (
        <Typography variant="body-sm" color={colors.error} className="mt-1">
          {error}
        </Typography>
      ) : hint ? (
        <Typography variant="body-sm" color={colors.neutral[500]} className="mt-1">
          {hint}
        </Typography>
      ) : null}
    </View>
  )
})
