import '@/global.css'

import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter'
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono'
import { Sora_600SemiBold, Sora_700Bold } from '@expo-google-fonts/sora'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { colors } from '@/constants/theme'
import { useAuth } from '@/hooks/useAuth'
import { useAuthDeepLink } from '@/hooks/useAuthDeepLink'
import { useAuthStore } from '@/store/auth.store'

// Mantener el splash visible hasta que fuentes Y sesión estén resueltas.
SplashScreen.preventAutoHideAsync()

/**
 * Root layout de MecAI.
 *
 * Responsabilidades:
 * 1. Cargar las fuentes del design system (Sora / Inter / JetBrains Mono).
 * 2. Arrancar el listener de sesión de Supabase (`useAuth`) y el manejo de deep
 *    links de los correos de confirmación / recuperación (`useAuthDeepLink`).
 * 3. Auth guard de tres estados:
 *      - sin sesión                    → grupo `(auth)`
 *      - con sesión y sin vehículos    → grupo `(onboarding)` (HU-08)
 *      - con sesión y con vehículos    → grupo `(tabs)`
 *
 * El guard usa `<Stack.Protected>`: si la condición deja de cumplirse, Expo
 * Router saca esas rutas del stack y navega a la primera disponible. No hay
 * ventana en la que una pantalla privada quede visible sin sesión, y como los
 * tres guards son mutuamente excluyentes tampoco hay loops de redirección.
 */
/**
 * Loader de transición, sobre el mismo blanco hueso que el resto de la app para
 * que no haya un salto de color al montar la primera pantalla.
 */
function BootLoader() {
  return (
    <View className="flex-1 items-center justify-center bg-neutral-50">
      <ActivityIndicator color={colors.primary[600]} />
    </View>
  )
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Sora_700Bold,
    Sora_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    JetBrainsMono_400Regular,
  })

  const { user, isLoading: isAuthLoading } = useAuth()
  const hasVehicle = useAuthStore((state) => state.hasVehicle)
  useAuthDeepLink()

  const isSignedIn = user !== null

  // Con sesión, ningún grupo puede montarse hasta saber si hay vehículo: los
  // tres guards fallarían y el Stack quedaría vacío. Sin sesión da igual.
  const isVehicleStatusResolved = !isSignedIn || hasVehicle !== null

  const areFontsReady = fontsLoaded || Boolean(fontError)
  const isReady = areFontsReady && !isAuthLoading && isVehicleStatusResolved

  useEffect(() => {
    if (isReady) {
      void SplashScreen.hideAsync()
    }
  }, [isReady])

  if (!isReady) {
    // En el arranque en frío el splash nativo sigue encima y esto no se ve.
    // Donde sí se ve es tras un login: entre `SIGNED_IN` y la respuesta de
    // `refreshVehicleStatus` hay una ventana corta que, sin esto, sería una
    // pantalla en blanco.
    return areFontsReady ? <BootLoader /> : null
  }

  return (
    <SafeAreaProvider>
      {/* Fondo claro en toda la app (MVP solo light mode) → iconos oscuros. */}
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!isSignedIn}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected guard={isSignedIn && hasVehicle === false}>
          <Stack.Screen name="(onboarding)" />
        </Stack.Protected>

        <Stack.Protected guard={isSignedIn && hasVehicle === true}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
      </Stack>
    </SafeAreaProvider>
  )
}
