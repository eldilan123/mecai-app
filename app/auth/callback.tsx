import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'

import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'
import { Screen } from '@/components/ui/Screen'
import { Typography } from '@/components/ui/Typography'
import { colors } from '@/constants/theme'
import { useAuthStore } from '@/store/auth.store'

/** Si en este tiempo no llegó ni sesión ni error, algo salió mal en silencio. */
const TIMEOUT_MS = 10000

/**
 * Destino de los enlaces de correo de Supabase (`.../auth/callback`).
 *
 * Quien procesa los tokens es `useAuthDeepLink`, montado en el root layout:
 * corre aunque la app se abra en frío y sin depender del router. Esta pantalla
 * existe por dos razones:
 *
 * 1. Sin una ruta real en `/auth/callback`, Expo Router recibe el deep link y
 *    muestra su pantalla de "Unmatched Route" — que es la "pantalla en blanco"
 *    que se ve al volver del correo.
 * 2. Le da al usuario algo que mirar mientras se aplica la sesión, y una salida
 *    si el enlace venció.
 *
 * Al quedar fuera de los grupos `(auth)` y `(tabs)`, es accesible con y sin
 * sesión — que es justo lo que hace falta: cuando el enlace abre la app,
 * todavía no hay sesión.
 */
export default function AuthCallbackScreen() {
  const user = useAuthStore((state) => state.user)
  const linkError = useAuthStore((state) => state.linkError)
  const [hasTimedOut, setHasTimedOut] = useState(false)

  // Sesión aplicada → al Home. El guard del root layout ya habilitó (tabs).
  useEffect(() => {
    if (user) {
      router.replace('/(tabs)')
    }
  }, [user])

  useEffect(() => {
    const timeoutId = setTimeout(() => setHasTimedOut(true), TIMEOUT_MS)
    return () => clearTimeout(timeoutId)
  }, [])

  const errorMessage =
    linkError ??
    (hasTimedOut ? 'No pudimos confirmar tu cuenta con ese enlace. Intenta de nuevo.' : null)

  if (errorMessage) {
    return (
      <Screen className="py-8">
        <View className="flex-1 justify-center">
          <Typography variant="display-lg" className="text-center">
            Algo salió mal
          </Typography>
          <FormError message={errorMessage} className="mt-6" />
          <Typography
            variant="body-md"
            color={colors.neutral[500]}
            className="mt-4 text-center leading-5"
          >
            Puedes pedir un enlace nuevo desde la pantalla de registro o de recuperación.
          </Typography>
        </View>

        <Button title="Volver a login" onPress={() => router.replace('/login')} />
      </Screen>
    )
  }

  return (
    <Screen className="py-8">
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Typography variant="title-sm" className="mt-6 text-center">
          Confirmando tu cuenta…
        </Typography>
        <Typography
          variant="body-md"
          color={colors.neutral[500]}
          className="mt-2 text-center leading-5"
        >
          Un segundo, ya casi estamos.
        </Typography>
      </View>
    </Screen>
  )
}
