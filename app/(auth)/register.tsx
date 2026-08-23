import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import { Lock, Mail, User } from 'lucide-react-native'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { View } from 'react-native'

import { AuthHeader } from '@/components/auth/AuthHeader'
import { GoogleAuthPlaceholder } from '@/components/auth/GoogleAuthPlaceholder'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { FormError } from '@/components/ui/FormError'
import { Input } from '@/components/ui/Input'
import { Screen } from '@/components/ui/Screen'
import { TextLink } from '@/components/ui/TextLink'
import { colors } from '@/constants/theme'
import { useAuth } from '@/hooks/useAuth'
import {
  registerSchema,
  type RegisterFormValues,
  type RegisterInput,
} from '@/utils/validation.schemas'

const ICON_SIZE = 20

/**
 * Registro por email/password (HU-06).
 *
 * Validación con react-hook-form + Zod en modo `onTouched`: no regaña mientras
 * el usuario escribe por primera vez, pero sí corrige en vivo tras el primer
 * blur. Al éxito navega a /verify-email, porque el proyecto tiene "Confirm
 * email" activo y todavía no hay sesión.
 *
 * El botón de Google va DEBAJO del formulario a propósito: está deshabilitado,
 * y arriba se llevaba la atención del camino que sí funciona.
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
      <AuthHeader
        title="Crear tu cuenta"
        subtitle="Toma menos de un minuto. Después te preguntamos por tu vehículo."
        className="mb-8"
      />

      <View className="gap-5">
        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Nombre (opcional)"
              icon={<User size={ICON_SIZE} color={colors.neutral[500]} />}
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
              icon={<Mail size={ICON_SIZE} color={colors.neutral[500]} />}
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
              icon={<Lock size={ICON_SIZE} color={colors.neutral[500]} />}
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

      <FormError message={formError} className="mt-5" />

      <Button
        title="Crear cuenta"
        loading={isSubmitting}
        onPress={() => void onSubmit()}
        className="mt-6"
      />

      <Divider label="o continúa con" className="my-6" />

      {/* TODO: HU-06 Google OAuth pendiente — se habilita al configurar Google Cloud. */}
      <GoogleAuthPlaceholder />

      <TextLink
        label="¿Ya tienes cuenta?"
        action="Iniciar sesión"
        onPress={() => router.replace('/login')}
        className="mt-6"
      />
    </Screen>
  )
}
