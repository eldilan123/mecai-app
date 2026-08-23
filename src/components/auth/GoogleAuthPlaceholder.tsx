import { View } from 'react-native'

import { Typography } from '@/components/ui/Typography'
import { colors } from '@/constants/theme'

/**
 * Placeholder del botón "Continuar con Google".
 *
 * TODO: HU-06 Google OAuth pendiente — requiere configurar el proyecto en
 * Google Cloud Console (OAuth client iOS/Android/Web) y habilitar el provider
 * Google en Supabase (Authentication → Providers). Al implementarlo, reemplazar
 * este componente por un `<Button>` que llame a `supabase.auth.signInWithOAuth`
 * con `expo-auth-session` / `expo-web-browser`.
 */
export interface GoogleAuthPlaceholderProps {
  className?: string
}

export function GoogleAuthPlaceholder({ className }: GoogleAuthPlaceholderProps) {
  return (
    <View
      accessibilityRole="button"
      accessibilityState={{ disabled: true }}
      accessibilityLabel="Continuar con Google, próximamente"
      className={`w-full flex-row items-center justify-center rounded-md border border-neutral-200 bg-neutral-0 px-6 py-4 opacity-40 ${className ?? ''}`}
    >
      {/* Ícono provisional: la "G" tipográfica evita cargar el logo de Google
          antes de tener el OAuth aprobado (sus brand guidelines lo exigen). */}
      <Typography variant="title-sm" color={colors.neutral[700]} className="mr-2">
        G
      </Typography>
      <Typography variant="body-lg" color={colors.neutral[700]}>
        Continuar con Google
      </Typography>
      <View className="ml-2 rounded-full bg-accent-100 px-2 py-[2px]">
        <Typography variant="body-sm" color={colors.accent[600]}>
          Próximamente
        </Typography>
      </View>
    </View>
  )
}
