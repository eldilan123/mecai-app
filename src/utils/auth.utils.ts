import * as Linking from 'expo-linking'

/**
 * Helpers de auth ligados al enrutamiento por deep link.
 *
 * Supabase manda los correos (confirmación de cuenta, recuperación de
 * contraseña) con un `redirect_to` que tiene que apuntar de vuelta a la app.
 * `Linking.createURL` resuelve el esquema correcto en cada entorno:
 * - Expo Go:    exp://192.168.x.x:8081/--/auth/callback
 * - Dev/prod:   mecai://auth/callback   (scheme de app.json)
 * - Web:        http://localhost:8081/auth/callback
 *
 * ⚠️ Supabase solo respeta el `redirect_to` si coincide con la allowlist de
 * **Authentication → URL Configuration → Redirect URLs**. Si no coincide,
 * ignora la URL en silencio y usa el Site URL — que es exactamente cómo se
 * rompe el flujo en Expo Go si falta `exp://**` en la lista.
 */
export const AUTH_CALLBACK_PATH = 'auth/callback'

export function getAuthRedirectUrl(): string {
  return Linking.createURL(AUTH_CALLBACK_PATH)
}

/** Tokens/código que puede traer un deep link de auth de Supabase. */
export interface AuthDeepLinkParams {
  accessToken?: string
  refreshToken?: string
  /** Código del flujo PKCE (si el cliente se configura con `flowType: 'pkce'`). */
  code?: string
  /** Tipo de enlace: 'signup' | 'recovery' | 'magiclink' | 'invite'. */
  type?: string
  /** Código de error de GoTrue, p. ej. 'otp_expired'. */
  errorCode?: string
  errorDescription?: string
}

/**
 * Extrae los parámetros de auth de una URL entrante.
 *
 * Supabase los manda en el fragmento (`#access_token=...`) en el flujo implícito
 * —el default del cliente— y como query (`?code=...`) en PKCE. Se soportan ambos
 * para que el enlace funcione sin importar la configuración del cliente.
 */
export function parseAuthDeepLink(url: string): AuthDeepLinkParams | null {
  const [beforeHash, hash] = url.split('#')
  if (!beforeHash) {
    return null
  }

  const params = new Map<string, string>()

  const queryIndex = beforeHash.indexOf('?')
  if (queryIndex !== -1) {
    collectParams(beforeHash.slice(queryIndex + 1), params)
  }
  if (hash) {
    collectParams(hash, params)
  }

  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')
  const code = params.get('code')
  const errorCode = params.get('error_code')
  const errorDescription = params.get('error_description') ?? params.get('error')

  if (!accessToken && !code && !errorCode && !errorDescription) {
    return null
  }

  return {
    accessToken,
    refreshToken,
    code,
    type: params.get('type'),
    errorCode,
    errorDescription: errorDescription ? decodeURIComponent(errorDescription) : undefined,
  }
}

function collectParams(raw: string, target: Map<string, string>): void {
  for (const pair of raw.split('&')) {
    if (!pair) continue
    const separatorIndex = pair.indexOf('=')
    if (separatorIndex === -1) continue
    const key = decodeURIComponent(pair.slice(0, separatorIndex))
    const value = decodeURIComponent(pair.slice(separatorIndex + 1).replace(/\+/g, ' '))
    if (key && value) {
      target.set(key, value)
    }
  }
}
