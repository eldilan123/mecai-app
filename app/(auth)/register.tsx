import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Pressable, View } from 'react-native'

import { GoogleAuthPlaceholder } from '@/components/auth/GoogleAuthPlaceholder'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { FormError } from '@/components/ui/FormError'
import { Input } from '@/components/ui/Input'
import { Screen } from '@/components/ui/Screen'
import { Typography } from '@/components/ui/Typography'
import { colors } from '@/constants/theme'
import { useAuth } from '@/hooks/useAuth'
import {
  registerSchema,
  type RegisterFormValues,
  type RegisterInput,
} from '@/utils/validation.schemas'

/**
 * Registro por email/password (HU-06).
 *
 * Validación con react-hook-form + Zod en modo `onTouched`: no regaña mientras
 * el usuario escribe por primera vez, pero sí corrige en vivo tras el primer
 * blur. Al éxito navega a /verify-email, porque el proyecto tiene "Confirm
 * email" activo y todavía no hay sesión.
 */
export default function RegisterScreen() {
  const { signUp } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues, unknown, RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: { fullName: '', email: '', password: '' },
  })

  // `values` es la SALIDA del schema: email ya viene en minúsculas y sin
  // espacios, y un nombre vacío llega como undefined.
  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)

    const result = await signUp({
      email: values.email,
      password: values.password,
      fullName: values.fullName,
    })

    if (!result.ok) {
      setFormError(result.error)
      return
    }

    router.replace({ pathname: '/verify-email', params: { email: values.email } })
  })

  return (
    <Screen scrollable contentContainerClassName="py-8">
      <Typography variant="display-lg">Crear tu cuenta</Typography>
      <Typography variant="body-md" color={colors.neutral[700]} className="mt-2">
        Toma menos de un minuto. Después te preguntamos por tu vehículo.
      </Typography>

      {/* TODO: HU-06 Google OAuth pendiente — se habilita al configurar Google Cloud. */}
      <GoogleAuthPlaceholder className="mt-8" />

      <Divider label="o con email" className="my-6" />

      <View className="gap-4">
        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Nombre (opcional)"
              placeholder="¿Cómo te llamamos?"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.fullName?.message}
              returnKeyType="next"
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email"
              type="email"
              placeholder="tucorreo@ejemplo.com"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
              returnKeyType="next"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Contraseña"
              type="password"
              placeholder="Mínimo 8 caracteres"
              hint="Con al menos una mayúscula y un número"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              returnKeyType="done"
              onSubmitEditing={() => void onSubmit()}
            />
          )}
        />
      </View>

      <FormError message={formError} className="mt-4" />

      <Button
        title="Crear cuenta"
        loading={isSubmitting}
        onPress={() => void onSubmit()}
        className="mt-6"
      />

      <Pressable
        accessibilityRole="link"
        onPress={() => router.replace('/login')}
        className="mt-6 self-center py-2"
        hitSlop={8}
      >
        <Typography variant="body-md" color={colors.neutral[700]}>
          ¿Ya tienes cuenta?{' '}
          <Typography variant="body-md" color={colors.primary[600]}>
            Iniciar sesión
          </Typography>
        </Typography>
      </Pressable>
    </Screen>
  )
}
