import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import { Mail, MailCheck } from 'lucide-react-native'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { View } from 'react-native'

import { AuthHeader } from '@/components/auth/AuthHeader'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'
import { Input } from '@/components/ui/Input'
import { Screen } from '@/components/ui/Screen'
import { TextLink } from '@/components/ui/TextLink'
import { Typography } from '@/components/ui/Typography'
import { colors, typography } from '@/constants/theme'
import { useAuth } from '@/hooks/useAuth'
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
  type ResetPasswordInput,
} from '@/utils/validation.schemas'

/**
 * Recuperación de contraseña (HU-07).
 *
 * Supabase manda un enlace de recuperación al correo. Al abrirlo, el deep link
 * a `/auth/callback` abre una sesión temporal (evento PASSWORD_RECOVERY) y
 * el usuario queda dentro de la app.
 *
 * TODO: HU-16 — pantalla de "definir contraseña nueva" tras el PASSWORD_RECOVERY.
 * Por ahora el enlace deja al usuario con sesión iniciada, que es el
 * comportamiento esperado del criterio "Olvidé mi contraseña funcional".
 */
export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const [sentToEmail, setSentToEmail] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues, unknown, ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched',
    defaultValues: { email: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)

    const result = await resetPassword(values.email)
    if (!result.ok) {
      setFormError(result.error)
      return
    }

    setSentToEmail(values.email)
  })

  if (sentToEmail) {
    return (
      <Screen className="py-8">
        <View className="flex-1 items-center justify-center">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-primary-50">
            <MailCheck size={36} color={colors.primary[600]} />
          </View>

          <Typography variant="display-lg" className="mt-8 text-center">
            Enlace enviado
          </Typography>

          <Typography
            variant="body-lg"
            color={colors.neutral[700]}
            className="mt-3 max-w-[320px] text-center leading-6"
          >
            Si hay una cuenta con{' '}
            <Typography
              variant="body-lg"
              color={colors.primary[600]}
              style={{ fontFamily: typography.fontBodyMedium }}
            >
              {sentToEmail}
            </Typography>
            , te llegó un correo para recuperar tu contraseña.
          </Typography>

          <Typography
            variant="body-md"
            color={colors.neutral[500]}
            className="mt-4 max-w-[320px] text-center leading-5"
          >
            Revisa también la carpeta de spam.
          </Typography>
        </View>

        <Button title="Volver a login" onPress={() => router.replace('/login')} />
      </Screen>
    )
  }

  return (
    <Screen scrollable contentContainerClassName="py-8">
      <AuthHeader
        title="Recuperar contraseña"
        subtitle="Ingresa tu email y te enviaremos instrucciones para restablecerla."
        className="mb-8"
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Email"
            type="email"
            icon={<Mail size={20} color={colors.neutral[500]} />}
            placeholder="tucorreo@ejemplo.com"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
            returnKeyType="send"
            onSubmitEditing={() => void onSubmit()}
          />
        )}
      />

      <FormError message={formError} className="mt-5" />

      <Button
        title="Enviar enlace"
        loading={isSubmitting}
        onPress={() => void onSubmit()}
        className="mt-6"
      />

      <TextLink action="Volver a login" onPress={() => router.back()} className="mt-4" />
    </Screen>
  )
}
