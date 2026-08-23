import { Redirect, router } from 'expo-router'
import { useMemo } from 'react'

import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader'
import { OnboardingProgressBar } from '@/components/onboarding/OnboardingProgressBar'
import { SearchableList } from '@/components/onboarding/SearchableList'
import { Screen } from '@/components/ui/Screen'
import { getBrandsForType } from '@/constants/vehicles'
import { useVehicleOnboardingStore } from '@/store/vehicleOnboarding.store'
import { typeToArticleAndNoun } from '@/utils/format.utils'

const TOTAL_STEPS = 7

/**
 * Paso 2 — ¿de qué marca? (HU-08)
 *
 * Las marcas se filtran por el tipo elegido en el paso 1: quien registra una
 * moto no debería tener que pasar por Renault ni Mazda.
 */
export default function VehicleBrandScreen() {
  const type = useVehicleOnboardingStore((state) => state.type)
  const setBrand = useVehicleOnboardingStore((state) => state.setBrand)

  const brands = useMemo(() => (type ? getBrandsForType(type) : []), [type])
  const items = useMemo(
    () => brands.map((brand) => ({ key: brand.slug, label: brand.name })),
    [brands]
  )

  // Sin tipo no hay lista que mostrar: pasa si alguien llega por deep link o si
  // el store se perdió. `Redirect` en vez de un efecto para que la pantalla
  // inválida no llegue a pintarse ni un frame.
  if (!type) {
    return <Redirect href="/(onboarding)/vehicle-type" />
  }

  const handleSelect = (slug: string) => {
    const brand = brands.find((candidate) => candidate.slug === slug)
    if (!brand) {
      return
    }
    // Se guarda el `name`, no el slug: es lo que va al INSERT.
    setBrand(brand.name)
    router.push('/(onboarding)/vehicle-model')
  }

  return (
    <Screen edges={['bottom']}>
      <OnboardingProgressBar currentStep={2} totalSteps={TOTAL_STEPS} />

      <OnboardingHeader
        title="¿De qué marca es?"
        subtitle={`Elige la marca de ${typeToArticleAndNoun(type)}.`}
        className="mb-6 mt-6"
      />

      <SearchableList
        items={items}
        onSelect={handleSelect}
        searchPlaceholder="Buscar marca…"
        emptyMessage="No encontramos esa marca"
      />
    </Screen>
  )
}
