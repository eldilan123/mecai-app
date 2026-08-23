import { zodResolver } from '@hookform/resolvers/zod'
import { Redirect, router } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
import { z } from 'zod'

import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader'
import { OnboardingProgressBar } from '@/components/onboarding/OnboardingProgressBar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Screen } from '@/components/ui/Screen'
import { useVehicleOnboardingStore } from '@/store/vehicleOnboarding.store'
import { colorSchema, licensePlateSchema, nicknameSchema } from '@/utils/validation.schemas'

const TOTAL_STEPS = 7

const extrasSchema = z.object({
  license_plate: licensePlateSchema,
  color: colorSchema,
  nickname: nicknameSchema,
})

type ExtrasFormValues = z.input<typeof extrasSchema>

/** Un campo vacío es "no lo llenó", que en la BD es `null`, no `''`. */
function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? ''
  return trimmed === '' ? null : trimmed
}

/**
 * Paso 6 — extras opcionales (HU-08).
 *
 * Los tres campos pueden quedar vacíos: nadie debería quedarse trabado acá por
 * no recordar la placa. De ahí el "Saltar por ahora" explícito, que además
 * limpia lo que hubiera escrito antes de cambiar de opinión.
 */
export default function VehicleExtrasScreen() {
  const type = useVehicleOnboardingStore((state) => state.type)
  const brand = useVehicleOnboardingStore((state) => state.brand)
  const model = useVehicleOnboardingStore((state) => state.model)
  const year = useVehicleOnboardingStore((state) => state.year)
  const currentKm = useVehicleOnboardingStore((state) => state.currentKm)
  const licensePlate = useVehicleOnboardingStore((state) => state.licensePlate)
  const color = useVehicleOnboardingStore((state) => state.color)
  const nickname = useVehicleOnboardingStore((state) => state.nickname)
  const setExtras = useVehicleOnboardingStore((state) => state.setExtras)

  const { control, handleSubmit } = useForm<ExtrasFormValues>({
    resolver: zodResolver(extrasSchema),
    mode: 'onChange',
    defaultValues: {
      license_plate: licensePlate ?? '',
      color: color ?? '',
      nickname: nickname ?? '',
    },
  })

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

  const onContinue = (data: ExtrasFormValues) => {
    setExtras({
      licensePlate: emptyToNull(data.license_plate),
      color: emptyToNull(data.color),
      nickname: emptyToNull(data.nickname),
    })
    router.push('/(onboarding)/vehicle-confirm')
  }

  const onSkip = () => {
    setExtras({ licensePlate: null, color: null, nickname: null })
    router.push('/(onboarding)/vehicle-confirm')
  }

  return (
    <Screen edges={['bottom']}>
      <OnboardingProgressBar currentStep={6} totalSteps={TOTAL_STEPS} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="grow pb-4"
        >
          <OnboardingHeader
            title="Un par de detalles más"
            subtitle="Todos opcionales — puedes saltarlos si prefieres."
            className="mb-6 mt-6"
          />

          <View className="gap-5">
            <Controller
              control={control}
              name="license_plate"
              render={({ field, fieldState }) => (
                <Input
                  label="Placa"
                  placeholder="ABC123"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={10}
                  error={fieldState.error?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="color"
              render={({ field, fieldState }) => (
                <Input
                  label="Color"
                  placeholder="Rojo, Azul, Blanco…"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  autoCapitalize="sentences"
                  maxLength={30}
                  error={fieldState.error?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="nickname"
              render={({ field, fieldState }) => (
                <Input
                  label="Apodo"
                  placeholder="Mi compañero, La bestia, El azul…"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  autoCapitalize="sentences"
                  maxLength={40}
                  error={fieldState.error?.message}
                />
              )}
            />
          </View>
        </ScrollView>

        <View className="gap-2 pb-4 pt-2">
          <Button title="Continuar" size="lg" onPress={handleSubmit(onContinue)} />
          <Button title="Saltar por ahora" variant="ghost" size="md" onPress={onSkip} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  )
}
