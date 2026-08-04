import { Image } from 'expo-image'
import { router } from 'expo-router'
import { View } from 'react-native'

import { Button } from '@/components/ui/Button'
import { Screen } from '@/components/ui/Screen'
import { Typography } from '@/components/ui/Typography'
import { colors } from '@/constants/theme'

// Logo horizontal a color — el uso recomendado para pantalla de bienvenida
// (Design System v2.0 §7, tabla "cuándo usar cada versión").
import logo from '@/assets/logo/mecai-logo-horizontal.png'

/**
 * Pantalla de bienvenida (HU-06).
 *
 * Primer contacto con la marca: dice qué es MecAI y por qué importa, en el tono
 * de la propuesta de valor del brief. Nada de jerga técnica ni de mecánica.
 */
export default function WelcomeScreen() {
  return (
    <Screen className="justify-between py-8">
      <View className="flex-1 items-center justify-center">
        <Image
          source={logo}
          style={{ width: 220, height: 72 }}
          contentFit="contain"
          accessibilityLabel="MecAI"
        />

        <Typography variant="display-xl" className="mt-12 text-center">
          Tu mecánico inteligente
        </Typography>

        <Typography
          variant="body-lg"
          color={colors.neutral[700]}
          className="mt-3 text-center leading-6"
        >
          Para que no te embalen en el taller.
        </Typography>

        <Typography
          variant="body-md"
          color={colors.neutral[500]}
          className="mt-6 max-w-[300px] text-center leading-5"
        >
          Te decimos qué necesita tu carro o tu moto, cuándo, y cuánto debería costar. En español y
          sin enredos.
        </Typography>
      </View>

      <View className="gap-3">
        <Button title="Crear cuenta" onPress={() => router.push('/register')} />
        <Button title="Ya tengo cuenta" variant="secondary" onPress={() => router.push('/login')} />
      </View>
    </Screen>
  )
}
