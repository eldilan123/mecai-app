import { Picker } from '@react-native-picker/picker'
import { Redirect, router } from 'expo-router'
import { useMemo, useState } from 'react'
import { View } from 'react-native'

import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader'
import { OnboardingProgressBar } from '@/components/onboarding/OnboardingProgressBar'
import { Button } from '@/components/ui/Button'
import { Screen } from '@/components/ui/Screen'
import { getYearRange } from '@/constants/vehicles'
import { colors, typography } from '@/constants/theme'
import { useVehicleOnboardingStore } from '@/store/vehicleOnboarding.store'

const TOTAL_STEPS = 7

/**
 * Paso 4 — ¿de qué año? (HU-08)
 *
 * A diferencia de los pasos 1-3, acá el tap no avanza: el picker siempre tiene
 * algo seleccionado, así que sin un "Continuar" explícito no habría forma de
 * distinguir "elegí este año" de "todavía no lo toqué".
 */
export default function VehicleYearScreen() {
  const type = useVehicleOnboardingStore((state) => state.type)
  const brand = useVehicleOnboardingStore((state) => state.brand)
  const model = useVehicleOnboardingStore((state) => state.model)
  const year = useVehicleOnboardingStore((state) => state.year)
  const setYear = useVehicleOnboardingStore((state) => state.setYear)

  const { min, max } = getYearRange()

  // Descendente: los vehículos recientes son los más frecuentes y quedan arriba.
  const years = useMemo(
    () => Array.from({ length: max - min + 1 }, (_, index) => max - index),
    [max, min]
  )

  // El año vive en estado local hasta "Continuar": escribirlo al store en cada
  // tick del scroll re-renderiza el guard del root layout sin necesidad.
  const [localYear, setLocalYear] = useState(year ?? max)

  if (!type) {
    return <Redirect href="/(onboarding)/vehicle-type" />
  }
  if (!brand) {
    return <Redirect href="/(onboarding)/vehicle-brand" />
  }
  if (!model) {
    return <Redirect href="/(onboarding)/vehicle-model" />
  }

  const handleContinue = () => {
    setYear(localYear)
    router.push('/(onboarding)/vehicle-km')
  }

  return (
    <Screen edges={['bottom']}>
      <OnboardingProgressBar currentStep={4} totalSteps={TOTAL_STEPS} />

      <OnboardingHeader
        title="¿De qué año es?"
        subtitle={`Tu ${brand} ${model}, año…`}
        className="mb-6 mt-6"
      />

      <View className="flex-1 justify-center">
        <View className="rounded-md bg-neutral-100 py-2">
          <Picker
            selectedValue={localYear}
            onValueChange={(value) => setLocalYear(Number(value))}
            accessibilityLabel="Año del vehículo"
            style={{ backgroundColor: 'transparent' }}
            itemStyle={{
              fontSize: 22,
              fontFamily: typography.fontDisplaySemiBold,
              color: colors.neutral[900],
            }}
          >
            {years.map((value) => (
              <Picker.Item key={value} label={String(value)} value={value} />
            ))}
          </Picker>
        </View>
      </View>

      <Button title="Continuar" size="lg" onPress={handleContinue} className="mb-4" />
    </Screen>
  )
}
