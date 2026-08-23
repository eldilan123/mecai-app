import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader'
import { OnboardingProgressBar } from '@/components/onboarding/OnboardingProgressBar'
import { Screen } from '@/components/ui/Screen'
import { useVehicleOnboardingStore } from '@/store/vehicleOnboarding.store'

/**
 * Paso 4 — año. PLACEHOLDER.
 *
 * Existe para que el `push` del paso 3 tenga a dónde llegar y para poder ver en
 * el dispositivo lo que el store acumuló. La pantalla real llega en el
 * siguiente step de HU-08.
 */
export default function VehicleYearScreen() {
  const type = useVehicleOnboardingStore((state) => state.type)
  const brand = useVehicleOnboardingStore((state) => state.brand)
  const model = useVehicleOnboardingStore((state) => state.model)

  return (
    <Screen edges={['bottom']}>
      <OnboardingProgressBar currentStep={4} totalSteps={7} />

      <OnboardingHeader
        title="Paso 4 — próximamente"
        subtitle={`Hasta ahora tenemos: ${type ?? '—'} ${brand ?? '—'} ${model ?? '—'}`}
        className="mt-6"
      />
    </Screen>
  )
}
