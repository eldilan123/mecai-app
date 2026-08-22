import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import { Lock, Mail } from 'lucide-react-native'
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
import { loginSchema, type LoginFormValues, type LoginInput } from '@/utils/validation.schemas'

const ICON_SIZE = 20

/**
 * Login por email/password (HU-07).
 *
 * Al éxito NO navega: `onAuthStateChange` actualiza el store y el guard del
 * root layout redirige solo. Así el mismo camino sirve para login manual y para
 * sesión restaurada al abrir la app.
 */
export default function LoginScreen() {
  const { signIn } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues, unknown, LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)

    const result = await signIn({ email: values.email, password: values.password })
    if (!result.ok) {
      setFormError(result.error)
    }
  })

  return (
    <Screen scrollable contentContainerClassName="py-8">
      <AuthHeader
        title="Bienvenido de vuelta"
        subtitle="Nos alegra verte por acá."
        className="mb-8"
      />

      <View className="gap-5">
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
              placeholder="Tu contraseña"
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

      <TextLink
        action="¿Olvidaste tu contraseña?"
        onPress={() => router.push('/forgot-password')}
        align="right"
        className="mt-2"
      />

      <FormError message={formError} className="mt-3" />

      <Button
        title="Iniciar sesión"
        loading={isSubmitting}
        onPress={() => void onSubmit()}
        className="mt-5"
      />

      <Divider label="o continúa con" className="my-6" />

      {/* TODO: HU-06 Google OAuth pendiente — se habilita al configurar Google Cloud. */}
      <GoogleAuthPlaceholder />

      <TextLink
        label="¿No tienes cuenta?"
        action="Regístrate"
        onPress={() => router.replace('/register')}
        className="mt-6"
      />
    </Screen>
  )
}
