import { router } from 'expo-router'
import { View } from 'react-native'

import { FeatureHighlights } from '@/components/auth/FeatureHighlights'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { Screen } from '@/components/ui/Screen'
import { Typography } from '@/components/ui/Typography'
import { colors, typography } from '@/constants/theme'

/**
 * Pantalla de bienvenida (HU-06).
 *
 * Primer contacto con la marca. El orden vertical está pensado para leerse de
 * corrido en dos segundos: quién soy (logo) → qué hago por ti (título) → la
 * promesa (tagline) → cómo (features) → qué hacer ahora (botones).
 *
 * El tagline va en verde petróleo, no en gris: es la propuesta de valor del
 * brief, no un pie de página.
 */
export default function WelcomeScreen() {
  return (
    <Screen scrollable contentContainerClassName="pb-4 pt-6">
      <View className="items-center">
        <Logo variant="horizontal" width={260} />

        <Typography variant="display-xl" color={colors.primary[600]} className="mt-8 text-center">
          Tu mecánico inteligente
        </Typography>

        <Typography
          variant="title-md"
          color={colors.primary[600]}
          className="mt-2 text-center"
          style={{ fontFamily: typography.fontBodyMedium }}
        >
          Para que no te embalen en el taller.
        </Typography>

        <Typography
          variant="body-md"
          color={colors.neutral[700]}
          className="mt-4 max-w-[320px] text-center leading-5"
          style={{ fontFamily: typography.fontBodyMedium }}
        >
          Te decimos qué necesita tu carro o tu moto, cuándo, y cuánto debería costar. En español y
          sin enredos.
        </Typography>
      </View>

      <FeatureHighlights className="mt-10" />

      {/* Absorbe la diferencia de alto entre un iPhone SE y un Pro Max: el
          contenido queda arriba y los botones pegados al borde inferior. */}
      <View className="flex-1" />

      <View className="gap-3">
        <Button title="Crear cuenta" onPress={() => router.push('/register')} />
        <Button title="Ya tengo cuenta" variant="ghost" onPress={() => router.push('/login')} />
      </View>
    </Screen>
  )
}
