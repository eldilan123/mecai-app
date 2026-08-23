import { useState } from 'react'
import { View } from 'react-native'

import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'
import { Screen } from '@/components/ui/Screen'
import { Typography } from '@/components/ui/Typography'
import { colors } from '@/constants/theme'
import { useAuth } from '@/hooks/useAuth'

/**
 * Home placeholder (HU-06 / HU-07).
 *
 * Solo sirve para comprobar que la sesión y el store funcionan: muestra el email
 * del usuario y permite cerrar sesión.
 *
 * TODO: HU-12 — reemplazar por el Home real (estado del vehículo + próximos
 * mantenimientos + accesos al chat).
 */
export default function HomeScreen() {
  const { user, profile, isPremium, signOut } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    setError(null)

    const result = await signOut()
    if (!result.ok) {
      setError(result.error)
      setIsSigningOut(false)
    }
    // Si sale bien, el guard del root layout desmonta esta pantalla.
  }

  return (
    <Screen className="py-8">
      <View className="flex-1 justify-center">
        <Typography variant="display-lg" className="text-center">
          Home próximamente 🚧
        </Typography>

        <Typography
          variant="body-md"
          color={colors.neutral[700]}
          className="mt-3 text-center leading-5"
        >
          Aquí va el estado de tu vehículo y los próximos mantenimientos (HU-12).
        </Typography>

        <View className="mt-8 rounded-md bg-neutral-0 p-5">
          <Typography variant="body-sm" color={colors.neutral[500]}>
            Sesión activa
          </Typography>
          <Typography variant="title-sm" className="mt-1">
            {user?.email ?? '—'}
          </Typography>

          <Typography variant="body-sm" color={colors.neutral[500]} className="mt-4">
            Perfil
          </Typography>
          <Typography variant="body-md" className="mt-1">
            {profile?.full_name ?? 'Sin nombre registrado'}
          </Typography>

          <Typography variant="body-sm" color={colors.neutral[500]} className="mt-4">
            Plan
          </Typography>
          <Typography variant="body-md" className="mt-1">
            {isPremium ? 'Premium' : 'Free'}
          </Typography>
        </View>
      </View>

      <FormError message={error} className="mb-3" />

      <Button
        title="Cerrar sesión"
        variant="danger"
        loading={isSigningOut}
        onPress={() => void handleSignOut()}
      />
    </Screen>
  )
}
