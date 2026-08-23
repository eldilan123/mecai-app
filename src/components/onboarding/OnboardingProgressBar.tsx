import { useEffect, useRef } from 'react'
import { Animated, View } from 'react-native'

import { Typography } from '@/components/ui/Typography'
import { colors } from '@/constants/theme'

/**
 * Barra de progreso del onboarding de vehículo (HU-08).
 *
 * Cada pantalla del grupo `(onboarding)` la renderiza arriba de su contenido
 * declarando su propio paso, en vez de vivir en el header del Stack: así el
 * layout no tiene que saber en qué paso está ninguna pantalla.
 *
 * Usa el `Animated` del core de React Native y no Reanimated: Reanimated está
 * en las dependencias pero todavía no se usa en ninguna pantalla, y no vale la
 * pena introducir un segundo motor de animación por una barra de 3px.
 */
const ANIMATION_MS = 300

export interface OnboardingProgressBarProps {
  currentStep: number
  totalSteps: number
}

export function OnboardingProgressBar({ currentStep, totalSteps }: OnboardingProgressBarProps) {
  const progress = Math.min(Math.max(currentStep / totalSteps, 0), 1)
  // Arranca en el valor final para que el primer render no anime desde cero:
  // la animación es para el avance entre pasos, no para la entrada.
  const animatedProgress = useRef(new Animated.Value(progress)).current

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: ANIMATION_MS,
      // El ancho es una propiedad de layout: no la puede manejar el hilo nativo.
      useNativeDriver: false,
    }).start()
  }, [animatedProgress, progress])

  const width = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  })

  return (
    <View className="mt-2">
      <View className="h-[3px] overflow-hidden rounded-full bg-neutral-200">
        <Animated.View style={{ width, height: '100%', backgroundColor: colors.primary[600] }} />
      </View>

      <Typography variant="body-sm" color={colors.neutral[500]} className="mt-2 text-right">
        Paso {currentStep} de {totalSteps}
      </Typography>
    </View>
  )
}
