import { router, useLocalSearchParams } from 'expo-router'
import { MailCheck } from 'lucide-react-native'
import { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'

import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'
import { Screen } from '@/components/ui/Screen'
import { Typography } from '@/components/ui/Typography'
import { colors } from '@/constants/theme'
import { useAuth } from '@/hooks/useAuth'

/** Segundos de espera antes de poder reenviar el correo (evita el rate limit de Supabase). */
const RESEND_COOLDOWN_SECONDS = 60

/**
 * Pantalla intermedia post-registro (HU-06).
 *
 * El proyecto tiene "Confirm email" activo: tras el signUp no hay sesión hasta
 * que el usuario abre el enlace del correo. Cuando lo abre, el deep link
 * a `/auth/callback` crea la sesión y el guard del root layout lo lleva
 * al Home — no hace falta que vuelva aquí.
 */
export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>()
  const { resendVerificationEmail } = useAuth()

  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS)
  const [isResending, setIsResending] = useState(false)
  const [feedback, setFeedback] = useState<{ message: string; tone: 'success' | 'error' } | null>(
    null
  )
  /**
   * Momento en que vence el cooldown. Se guarda como timestamp (no como
   * contador) porque el usuario se va a su app de correo y vuelve: al volver,
   * los segundos restantes se recalculan contra el reloj real, no contra los
   * ticks que el sistema pudo haber pausado en segundo plano.
   */
  const [cooldownUntil, setCooldownUntil] = useState(
    () => Date.now() + RESEND_COOLDOWN_SECONDS * 1000
  )

  // Arranca ya consumido: el primer correo lo acaba de enviar el signUp.
  useEffect(() => {
    const intervalId = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000))
      setSecondsLeft(remaining)
      if (remaining === 0) {
        clearInterval(intervalId)
      }
    }, 500)

    return () => clearInterval(intervalId)
  }, [cooldownUntil])

  const handleResend = useCallback(async () => {
    if (!email || secondsLeft > 0) {
      return
    }

    setIsResending(true)
    setFeedback(null)

    const result = await resendVerificationEmail(email)

    setIsResending(false)

    if (result.ok) {
      setFeedback({
        message: 'Listo, te reenviamos el correo. Revisa tu bandeja.',
        tone: 'success',
      })
      setSecondsLeft(RESEND_COOLDOWN_SECONDS)
      setCooldownUntil(Date.now() + RESEND_COOLDOWN_SECONDS * 1000)
      return
    }

    setFeedback({
      message: result.error ?? 'No pudimos reenviar el correo. Intenta de nuevo.',
      tone: 'error',
    })
  }, [email, resendVerificationEmail, secondsLeft])

  const resendTitle = secondsLeft > 0 ? `Reenviar email (${secondsLeft}s)` : 'Reenviar email'

  return (
    <Screen className="py-8">
      <View className="flex-1 items-center justify-center">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-primary-50">
          <MailCheck size={36} color={colors.primary[600]} />
        </View>

        <Typography variant="display-lg" className="mt-8 text-center">
          Revisa tu correo
        </Typography>

        <Typography
          variant="body-lg"
          color={colors.neutral[700]}
          className="mt-3 max-w-[320px] text-center leading-6"
        >
          Te enviamos un email para confirmar tu cuenta a{' '}
          <Typography variant="body-lg" color={colors.neutral[900]}>
            {email ?? 'tu correo'}
          </Typography>
          .
        </Typography>

        <Typography
          variant="body-md"
          color={colors.neutral[500]}
          className="mt-4 max-w-[320px] text-center leading-5"
        >
          Ábrelo desde este teléfono y vuelves a la app con la sesión lista. Si no lo ves, mira en
          spam.
        </Typography>

        <FormError message={feedback?.message} tone={feedback?.tone} className="mt-6" />
      </View>

      <View className="gap-3">
        <Button
          title={resendTitle}
          variant="secondary"
          loading={isResending}
          disabled={secondsLeft > 0 || !email}
          onPress={() => void handleResend()}
        />
        <Button title="Volver a login" variant="ghost" onPress={() => router.replace('/login')} />
      </View>
    </Screen>
  )
}
