import { Tabs } from 'expo-router'
import { House } from 'lucide-react-native'

import { colors, typography } from '@/constants/theme'

/**
 * Layout de la zona autenticada.
 *
 * TODO: HU-12 — aquí van las tabs reales (Home, Chat, Mantenimiento, Perfil).
 * Por ahora solo existe Home como placeholder para verificar el flujo de auth.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.neutral[500],
        tabBarStyle: {
          backgroundColor: colors.neutral[0],
          borderTopColor: colors.neutral[200],
        },
        tabBarLabelStyle: {
          fontFamily: typography.fontBody,
          fontSize: typography.sizes.xs,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
    </Tabs>
  )
}
