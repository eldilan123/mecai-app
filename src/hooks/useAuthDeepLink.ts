import * as Linking from 'expo-linking'
import { useEffect } from 'react'

import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/store/auth.store'
import { parseAuthDeepLink } from '@/utils/auth.utils'
import { getAuthErrorMessage, getAuthLinkErrorMessage } from '@/utils/format.utils'

/**
 * Completa la sesión cuando el usuario vuelve a la app desde un correo de
 * Supabase (confirmación de cuenta o recuperación de contraseña).
 *
 * La URL de vuelta la genera `Linking.createURL('auth/callback')`, así que el
 * esquema cambia según el entorno: `exp://` en Expo Go, `mecai://` en build
 * standalone, `http://` en web. Llega con:
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

      const { setLinkError } = useAuthStore.getState()

      if (params.errorCode || params.errorDescription) {
        setLinkError(getAuthLinkErrorMessage(params.errorCode, params.errorDescription))
        return
      }

      setLinkError(null)

      try {
        if (params.code) {
          const { error } = await supabase.auth.exchangeCodeForSession(params.code)
          if (error) {
            setLinkError(getAuthErrorMessage(error))
          }
          return
        }

        if (params.accessToken && params.refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: params.accessToken,
            refresh_token: params.refreshToken,
          })
          if (error) {
            setLinkError(getAuthErrorMessage(error))
          }
        }
      } catch (error) {
        setLinkError(getAuthErrorMessage(error))
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
