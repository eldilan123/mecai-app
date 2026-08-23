import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader'
import { OnboardingProgressBar } from '@/components/onboarding/OnboardingProgressBar'
import { Screen } from '@/components/ui/Screen'
import { useVehicleOnboardingStore } from '@/store/vehicleOnboarding.store'

/**
 * Paso 2 — marca. PLACEHOLDER.
 *
 * Sólo existe para que el `push` del paso 1 tenga a dónde llegar y se pueda
 * verificar el flujo en Expo Go. La pantalla real (lista de marcas filtrada por
 * tipo con `getBrandsForType`) llega en el siguiente step de HU-08.
 */
export default function VehicleBrandScreen() {
  const type = useVehicleOnboardingStore((state) => state.type)

  return (
    <Screen edges={['bottom']}>
      <OnboardingProgressBar currentStep={2} totalSteps={7} />

      <OnboardingHeader
        title="Paso 2 — próximamente"
        subtitle={`Tipo seleccionado: ${type ?? 'ninguno'}`}
        className="mt-6"
      />
    </Screen>
  )
}
