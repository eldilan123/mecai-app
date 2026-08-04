import { Stack } from 'expo-router'

import { colors } from '@/constants/theme'

/**
 * Layout del grupo (auth): bienvenida, registro, login, verificación y
 * recuperación de contraseña (HU-06 / HU-07).
 *
 * Sin headers nativos — cada pantalla arma su propio encabezado con el
 * design system.
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.neutral[50] },
      }}
    />
  )
}
