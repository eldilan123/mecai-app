import { Redirect, router } from 'expo-router'
import { useState } from 'react'
import { View } from 'react-native'

import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader'
import { OnboardingProgressBar } from '@/components/onboarding/OnboardingProgressBar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Screen } from '@/components/ui/Screen'
import { Typography } from '@/components/ui/Typography'
import { colors } from '@/constants/theme'
import { useVehicleOnboardingStore } from '@/store/vehicleOnboarding.store'
import { formatWithDots, parseIntSafe } from '@/utils/format.utils'
import { vehicleKmSchema } from '@/utils/validation.schemas'

const TOTAL_STEPS = 7

/** Tope del odómetro, igual que en `vehicleKmSchema`. */
const KM_MAX = 9_999_999

/**
 * Paso 5 — kilometraje actual (HU-08).
 *
 * El valor se reformatea con separadores en cada tecla. Eso mueve el cursor al
 * final si alguien edita en medio del número, pero el caso real es teclear el
 * odómetro de corrido, y un número de 6-7 dígitos sin separadores es fácil de
 * equivocar al releerlo.
 * TODO: si se vuelve molesto, controlar el cursor con `selection` /
 * `onSelectionChange`: https://reactnative.dev/docs/textinput#selection
 */
export default function VehicleKmScreen() {
  const type = useVehicleOnboardingStore((state) => state.type)
  const brand = useVehicleOnboardingStore((state) => state.brand)
  const model = useVehicleOnboardingStore((state) => state.model)
  const year = useVehicleOnboardingStore((state) => state.year)
  const currentKm = useVehicleOnboardingStore((state) => state.currentKm)
  const setCurrentKm = useVehicleOnboardingStore((state) => state.setCurrentKm)

  const [displayValue, setDisplayValue] = useState(
    currentKm != null ? formatWithDots(currentKm) : ''
  )

  if (!type) {
    return <Redirect href="/(onboarding)/vehicle-type" />
  }
  if (!brand) {
    return <Redirect href="/(onboarding)/vehicle-brand" />
  }
  if (!model) {
    return <Redirect href="/(onboarding)/vehicle-model" />
  }
  if (year == null) {
    return <Redirect href="/(onboarding)/vehicle-year" />
  }

  const handleChange = (text: string) => {
    const parsed = parseIntSafe(text)
    if (parsed === null) {
      setDisplayValue('')
      return
    }
    // Por encima del tope se ignora la tecla en vez de recortar el número:
    // recortar dejaría en pantalla un valor que el usuario nunca escribió.
    if (parsed > KM_MAX) {
      return
    }
    setDisplayValue(formatWithDots(parsed))
  }

  const parsedKm = parseIntSafe(displayValue)
  const isValid = parsedKm !== null && vehicleKmSchema.safeParse(parsedKm).success

  const handleContinue = () => {
    if (parsedKm === null) {
      return
    }
    setCurrentKm(parsedKm)
    router.push('/(onboarding)/vehicle-extras')
  }

  return (
    <Screen edges={['bottom']}>
      <OnboardingProgressBar currentStep={5} totalSteps={TOTAL_STEPS} />

      <OnboardingHeader
        title="¿Cuántos kilómetros tiene?"
        subtitle="Mira el odómetro. Si no estás seguro, aproxima — puedes ajustarlo después."
        className="mb-6 mt-6"
      />

      <View className="flex-1">
        <Input
          value={displayValue}
          onChangeText={handleChange}
          keyboardType="number-pad"
          placeholder="Ej: 45.000"
          // "9.999.999" son 9 caracteres contando los separadores.
          maxLength={9}
          accessibilityLabel="Kilometraje actual"
          autoFocus
          rightSlot={
            <Typography variant="body-md" color={colors.neutral[500]} className="ml-2">
              km
            </Typography>
          }
        />

        <Typography variant="body-sm" color={colors.neutral[500]} className="mt-2 leading-5">
          Máximo {formatWithDots(KM_MAX)} km
        </Typography>
      </View>

      <Button
        title="Continuar"
        size="lg"
        onPress={handleContinue}
        disabled={!isValid}
        className="mb-4"
      />
    </Screen>
  )
}
