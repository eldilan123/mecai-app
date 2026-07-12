import '@/global.css'

import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter'
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono'
import { Sora_600SemiBold, Sora_700Bold } from '@expo-google-fonts/sora'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'

// Mantener el splash visible hasta que las fuentes estén listas.
SplashScreen.preventAutoHideAsync()

/**
 * Root layout de MecAI.
 *
 * Carga las fuentes del design system (Sora / Inter / JetBrains Mono) y declara
 * el Stack raíz. En HUs posteriores se montarán aquí los providers globales
 * (auth, etc.) y el auth guard que enruta entre (auth) / (onboarding) / (tabs).
 */
export default function RootLayout() {
  const [loaded, error] = useFonts({
    Sora_700Bold,
    Sora_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    JetBrainsMono_400Regular,
  })

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync()
    }
  }, [loaded, error])

  if (!loaded && !error) {
    return null
  }

  return <Stack screenOptions={{ headerShown: false }} />
}
