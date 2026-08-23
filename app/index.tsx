import { Redirect } from 'expo-router'

import { useAuthStore } from '@/store/auth.store'

/**
 * Entrada de la app: decide a dónde va el usuario.
 *
 * Sin sesión → bienvenida. Con sesión pero sin vehículos → onboarding (HU-08).
 * Con sesión y con vehículos → Home. El root layout ya esperó a que la sesión
 * *y* `hasVehicle` se resuelvan, así que aquí ambos son confiables.
 *
 * El guard de verdad vive en `_layout.tsx` (`<Stack.Protected>`); esto solo
 * resuelve la ruta inicial.
 */
export default function Index() {
  const user = useAuthStore((state) => state.user)
  const hasVehicle = useAuthStore((state) => state.hasVehicle)

  if (!user) {
    return <Redirect href="/(auth)/welcome" />
  }

  return <Redirect href={hasVehicle ? '/(tabs)' : '/(onboarding)/vehicle-type'} />
}
