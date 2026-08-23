import { Stack, router } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { Pressable } from 'react-native'

import { colors } from '@/constants/theme'

/**
 * Layout del grupo (onboarding): registro guiado del primer vehículo (HU-08).
 *
 * Una pregunta por pantalla. El layout sólo aporta el marco común —
 * fondo, botón atrás y transición—; la barra de progreso la renderiza cada
 * pantalla con `<OnboardingProgressBar />`, porque es la pantalla la que sabe
 * en qué paso está.
 *
 * `vehicle-type` es el único paso sin header: es el primero y no hay a dónde
 * volver. Las demás pantallas usan el header nativo sólo por el chevron, sin
 * título — el título vive grande en el cuerpo, no en la barra.
 */
function BackButton() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Volver al paso anterior"
      onPress={() => router.back()}
      // Área táctil de 44px sin agrandar el icono (mínimo de las HIG de Apple).
      hitSlop={12}
      className="active:opacity-60"
    >
      <ChevronLeft size={28} color={colors.neutral[900]} />
    </Pressable>
  )
}

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: '',
        headerShadowVisible: false,
        headerBackVisible: false,
        headerStyle: { backgroundColor: colors.neutral[50] },
        contentStyle: { backgroundColor: colors.neutral[50] },
        headerLeft: () => <BackButton />,
      }}
    >
      <Stack.Screen name="vehicle-type" options={{ headerShown: false }} />
    </Stack>
  )
}
