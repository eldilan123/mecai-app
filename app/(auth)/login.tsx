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
import { loginSchema, type LoginFormValues, type LoginInput } from '@/utils/validation.schemas'

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
      <Typography variant="display-lg">Bienvenido de vuelta</Typography>
      <Typography variant="body-md" color={colors.neutral[700]} className="mt-2">
        Entra para ver cómo va tu vehículo.
      </Typography>

      {/* TODO: HU-06 Google OAuth pendiente — se habilita al configurar Google Cloud. */}
      <GoogleAuthPlaceholder className="mt-8" />

      <Divider label="o con email" className="my-6" />

      <View className="gap-4">
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

      <Pressable
        accessibilityRole="link"
        onPress={() => router.push('/forgot-password')}
        className="mt-3 self-end py-1"
        hitSlop={8}
      >
        <Typography variant="body-md" color={colors.primary[600]}>
          ¿Olvidaste tu contraseña?
        </Typography>
      </Pressable>

      <FormError message={formError} className="mt-4" />

      <Button
        title="Iniciar sesión"
        loading={isSubmitting}
        onPress={() => void onSubmit()}
        className="mt-6"
      />

      <Pressable
        accessibilityRole="link"
        onPress={() => router.replace('/register')}
        className="mt-6 self-center py-2"
        hitSlop={8}
      >
        <Typography variant="body-md" color={colors.neutral[700]}>
          ¿No tienes cuenta?{' '}
          <Typography variant="body-md" color={colors.primary[600]}>
            Regístrate
          </Typography>
        </Typography>
      </Pressable>
    </Screen>
  )
}
