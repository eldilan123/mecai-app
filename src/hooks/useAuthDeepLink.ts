import * as Linking from 'expo-linking'
import { useEffect } from 'react'

import { supabase } from '@/services/supabase'
import { parseAuthDeepLink } from '@/utils/auth.utils'

/**
 * Completa la sesión cuando el usuario vuelve a la app desde un correo de
 * Supabase (confirmación de cuenta o recuperación de contraseña).
 *
 * Supabase redirige a `mecai://auth/callback` con:
 * - flujo implícito (default): `#access_token=...&refresh_token=...`
 * - flujo PKCE:                `?code=...`
 *
 * Se soportan ambos. Al aplicar la sesión, `onAuthStateChange` (en `useAuth`)
 * hace el resto: llena el store y el guard del layout redirige al Home.
 *
 * Se monta UNA sola vez, en el root layout.
 */
export function useAuthDeepLink(): void {
  useEffect(() => {
    let isMounted = true

    async function handleUrl(url: string | null): Promise<void> {
      if (!url || !isMounted) {
        return
      }

      const params = parseAuthDeepLink(url)
      if (!params) {
        return
      }

      if (params.errorDescription) {
        if (__DEV__) {
          console.warn('[auth] Deep link con error:', params.errorDescription)
        }
        return
      }

      if (params.code) {
        await supabase.auth.exchangeCodeForSession(params.code)
        return
      }

      if (params.accessToken && params.refreshToken) {
        await supabase.auth.setSession({
          access_token: params.accessToken,
          refresh_token: params.refreshToken,
        })
      }
    }

    // La app pudo abrirse DESDE el enlace (cold start).
    void Linking.getInitialURL().then(handleUrl)

    // O ya estaba abierta en segundo plano.
    const subscription = Linking.addEventListener('url', ({ url }) => {
      void handleUrl(url)
    })

    return () => {
      isMounted = false
      subscription.remove()
    }
  }, [])
}
