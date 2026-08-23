import { Redirect } from 'expo-router'
import { ScrollView, StyleSheet, View } from 'react-native'

import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader'
import { OnboardingProgressBar } from '@/components/onboarding/OnboardingProgressBar'
import { Screen } from '@/components/ui/Screen'
import { Typography } from '@/components/ui/Typography'
import { colors } from '@/constants/theme'
import { useVehicleOnboardingStore } from '@/store/vehicleOnboarding.store'
import { formatWithDots, typeToNoun } from '@/utils/format.utils'

const TOTAL_STEPS = 7

/** Una fila del resumen. La última no lleva separador. */
function SummaryRow({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) {
  return (
    <View
      className={`flex-row items-center justify-between py-3 ${isLast ? '' : 'border-b border-neutral-100'}`}
    >
      <Typography variant="body-sm" color={colors.neutral[500]}>
        {label}
      </Typography>
      <Typography variant="body-md" className="ml-4 flex-1 text-right">
        {value}
      </Typography>
    </View>
  )
}

/**
 * Paso 7 — confirmación. PARCIAL.
 *
 * El resumen ya es el definitivo; falta la foto del vehículo y el botón que
 * hace el INSERT, que llegan en la próxima iteración.
 */
export default function VehicleConfirmScreen() {
  const type = useVehicleOnboardingStore((state) => state.type)
  const brand = useVehicleOnboardingStore((state) => state.brand)
  const model = useVehicleOnboardingStore((state) => state.model)
  const year = useVehicleOnboardingStore((state) => state.year)
  const currentKm = useVehicleOnboardingStore((state) => state.currentKm)
  const licensePlate = useVehicleOnboardingStore((state) => state.licensePlate)
  const color = useVehicleOnboardingStore((state) => state.color)
  const nickname = useVehicleOnboardingStore((state) => state.nickname)

  // Los extras pueden ser null legítimamente; los cinco anteriores no.
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
  if (currentKm == null) {
    return <Redirect href="/(onboarding)/vehicle-km" />
  }

  return (
    <Screen edges={['bottom']}>
      <OnboardingProgressBar currentStep={TOTAL_STEPS} totalSteps={TOTAL_STEPS} />

      <OnboardingHeader
        title="Confirmemos"
        subtitle="Revisa los datos antes de guardar."
        className="mb-6 mt-6"
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-8">
        <View className="rounded-lg bg-white px-5 py-2" style={styles.card}>
          <SummaryRow label="Tipo" value={typeToNoun(type)} />
          <SummaryRow label="Marca" value={brand} />
          <SummaryRow label="Modelo" value={model} />
          <SummaryRow label="Año" value={String(year)} />
          <SummaryRow label="Kilometraje" value={`${formatWithDots(currentKm)} km`} />
          <SummaryRow label="Placa" value={licensePlate ?? '—'} />
          <SummaryRow label="Color" value={color ?? '—'} />
          <SummaryRow label="Apodo" value={nickname ?? '—'} isLast />
        </View>

        <Typography
          variant="body-md"
          color={colors.neutral[500]}
          className="mt-6 text-center leading-5"
        >
          🚧 Paso 7 en construcción — la foto y el guardado se agregan en la próxima iteración.
        </Typography>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  // Sombra de Card del design system v2.0 §8.
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
})
