import { Redirect } from 'expo-router'

import { useAuthStore } from '@/store/auth.store'

/**
 * Entrada de la app: decide a dónde va el usuario.
 *
 * Con sesión activa → Home. Sin sesión → bienvenida. El root layout ya esperó a
 * que la sesión se resuelva (splash), así que aquí `user` es confiable.
 *
 * El guard de verdad vive en `_layout.tsx` (`<Stack.Protected>`); esto solo
 * resuelve la ruta inicial.
 */
export default function Index() {
  const user = useAuthStore((state) => state.user)

  return <Redirect href={user ? '/(tabs)' : '/(auth)/welcome'} />
}
