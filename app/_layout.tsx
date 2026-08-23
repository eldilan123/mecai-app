import '@/global.css'

import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter'
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono'
import { Sora_600SemiBold, Sora_700Bold } from '@expo-google-fonts/sora'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { useAuth } from '@/hooks/useAuth'
import { useAuthDeepLink } from '@/hooks/useAuthDeepLink'

// Mantener el splash visible hasta que fuentes Y sesión estén resueltas.
SplashScreen.preventAutoHideAsync()

/**
 * Root layout de MecAI.
 *
 * Responsabilidades:
 * 1. Cargar las fuentes del design system (Sora / Inter / JetBrains Mono).
 * 2. Arrancar el listener de sesión de Supabase (`useAuth`) y el manejo de deep
 *    links de los correos de confirmación / recuperación (`useAuthDeepLink`).
 * 3. Auth guard: sin sesión → grupo `(auth)`; con sesión → grupo `(tabs)`.
 *
 * El guard usa `<Stack.Protected>`: si la condición deja de cumplirse, Expo
 * Router saca esas rutas del stack y navega a la primera disponible. No hay
 * ventana en la que una pantalla privada quede visible sin sesión.
 */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Sora_700Bold,
    Sora_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    JetBrainsMono_400Regular,
  })

  const { user, isLoading: isAuthLoading } = useAuth()
  useAuthDeepLink()

  const isReady = (fontsLoaded || Boolean(fontError)) && !isAuthLoading

  useEffect(() => {
    if (isReady) {
      void SplashScreen.hideAsync()
    }
  }, [isReady])

  // Splash nativo sigue en pantalla mientras tanto.
  if (!isReady) {
    return null
  }

  const isSignedIn = user !== null

  return (
    <SafeAreaProvider>
      {/* Fondo claro en toda la app (MVP solo light mode) → iconos oscuros. */}
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!isSignedIn}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected guard={isSignedIn}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
      </Stack>
    </SafeAreaProvider>
  )
}
