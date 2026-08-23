import type { ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

import { Typography } from '@/components/ui/Typography'
import { colors } from '@/constants/theme'

/**
 * Tarjeta de opción de los pasos de selección del onboarding (HU-08).
 *
 * Pensada para los pasos 1 (tipo), 2 (marca) y 3 (modelo). En el paso 1 el tap
 * avanza de inmediato, así que `selected` no se usa; existe para los pasos que
 * sí muestran la elección antes de continuar.
 */
export interface OptionCardProps {
  /** Icono ya renderizado. Opcional: los pasos de marca y modelo no llevan. */
  icon?: ReactNode
  title: string
  description?: string
  onPress: () => void
  selected?: boolean
}

export function OptionCard({
  icon,
  title,
  description,
  onPress,
  selected = false,
}: OptionCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={description}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={styles.shadow}
      className={[
        'min-h-[60px] w-full flex-row items-center rounded-md',
        // El padding baja 1px al seleccionar para compensar el borde extra y
        // que el contenido no se mueva.
        selected
          ? 'border-2 border-primary-500 bg-primary-50 p-[19px]'
          : 'border border-neutral-200 bg-white p-5',
        // Tap feedback del design system §9
        'active:scale-[0.97]',
      ].join(' ')}
    >
      {icon ? (
        <View className="mr-4 h-12 w-12 items-center justify-center rounded-md bg-primary-100">
          {icon}
        </View>
      ) : null}

      <View className="flex-1">
        <Typography variant="title-sm">{title}</Typography>

        {description ? (
          <Typography variant="body-md" color={colors.neutral[700]} className="mt-1">
            {description}
          </Typography>
        ) : null}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  // Sombra de Card del design system v2.0 §8.
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
})
