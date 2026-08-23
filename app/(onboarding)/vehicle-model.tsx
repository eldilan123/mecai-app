import { Redirect, router } from 'expo-router'
import { useMemo } from 'react'

import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader'
import { OnboardingProgressBar } from '@/components/onboarding/OnboardingProgressBar'
import { SearchableList } from '@/components/onboarding/SearchableList'
import { Screen } from '@/components/ui/Screen'
import { VEHICLE_BRANDS, getModelsForBrand } from '@/constants/vehicles'
import { useVehicleOnboardingStore } from '@/store/vehicleOnboarding.store'

const TOTAL_STEPS = 7

/**
 * Paso 3 — ¿qué modelo? (HU-08)
 *
 * El catálogo es curado, así que puede faltar un modelo. Por ahora eso se
 * resuelve con el mensaje del buscador vacío y no con un campo libre: escribir
 * el modelo a mano llena la BD de variantes ("Aveo", "aveo emotion", "AVEO GT")
 * que después rompen el match con los planes de mantenimiento.
 */
export default function VehicleModelScreen() {
  const type = useVehicleOnboardingStore((state) => state.type)
  const brand = useVehicleOnboardingStore((state) => state.brand)
  const setModel = useVehicleOnboardingStore((state) => state.setModel)

  // El store guarda el `name` de la marca; el catálogo se indexa por slug.
  const brandSlug = useMemo(
    () => VEHICLE_BRANDS.find((candidate) => candidate.name === brand)?.slug,
    [brand]
  )
  const models = useMemo(
    () => (brandSlug && type ? getModelsForBrand(brandSlug, type) : []),
    [brandSlug, type]
  )
  const items = useMemo(
    () => models.map((model) => ({ key: model.slug, label: model.name })),
    [models]
  )

  // Se verifica en orden de dependencia: sin tipo tampoco sirve volver a marca.
  if (!type) {
    return <Redirect href="/(onboarding)/vehicle-type" />
  }
  if (!brand) {
    return <Redirect href="/(onboarding)/vehicle-brand" />
  }

  const handleSelect = (slug: string) => {
    const model = models.find((candidate) => candidate.slug === slug)
    if (!model) {
      return
    }
    setModel(model.name)
    router.push('/(onboarding)/vehicle-year')
  }

  return (
    <Screen edges={['bottom']}>
      <OnboardingProgressBar currentStep={3} totalSteps={TOTAL_STEPS} />

      <OnboardingHeader
        title="¿Qué modelo?"
        subtitle={`Modelos de ${brand}.`}
        className="mb-6 mt-6"
      />

      <SearchableList
        items={items}
        onSelect={handleSelect}
        searchPlaceholder="Buscar modelo…"
        emptyMessage="No encontramos ese modelo"
      />
    </Screen>
  )
}
