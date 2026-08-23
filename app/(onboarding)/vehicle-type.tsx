import { router } from 'expo-router'
import { ScrollView, View } from 'react-native'

import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader'
import { OnboardingProgressBar } from '@/components/onboarding/OnboardingProgressBar'
import { OptionCard } from '@/components/onboarding/OptionCard'
import { DynamicIcon } from '@/components/ui/DynamicIcon'
import { Screen } from '@/components/ui/Screen'
import { VEHICLE_TYPES } from '@/constants/vehicles'
import { useVehicleOnboardingStore } from '@/store/vehicleOnboarding.store'
import type { VehicleTypeSlug } from '@/types/vehicle.types'

/** Total de pasos del flujo de registro de vehículo (HU-08). */
const TOTAL_STEPS = 7

/**
 * Paso 1 — ¿qué tipo de vehículo? (HU-08)
 *
 * El tap selecciona y avanza en un solo gesto: no hay botón "Continuar" porque
 * la elección es excluyente y no hay nada que confirmar. Se puede corregir
 * volviendo desde el paso 2.
 */
export default function VehicleTypeScreen() {
  const setType = useVehicleOnboardingStore((state) => state.setType)

  const handleSelect = (slug: VehicleTypeSlug) => {
    setType(slug)
    router.push('/(onboarding)/vehicle-brand')
  }

  return (
    <Screen>
      <OnboardingProgressBar currentStep={1} totalSteps={TOTAL_STEPS} />

      <OnboardingHeader
        title="¿Qué vehículo vas a registrar?"
        subtitle="Elige el tipo — puedes agregar más adelante si tienes varios."
        className="mb-6 mt-6"
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-8">
        <View className="gap-3">
          {VEHICLE_TYPES.map((option) => (
            <OptionCard
              key={option.slug}
              icon={<DynamicIcon name={option.iconName} size={26} />}
              title={option.labelEs}
              description={option.description}
              onPress={() => handleSelect(option.slug)}
            />
          ))}
        </View>
      </ScrollView>
    </Screen>
  )
}
