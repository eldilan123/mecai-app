import { isAuthError } from '@supabase/supabase-js'

import type { VehicleTypeSlug } from '@/types/vehicle.types'

/**
 * Helpers de formato y traducción de mensajes al usuario.
 */

/** Mensaje genérico cuando no reconocemos el error (nunca mostrar el error crudo en inglés). */
const FALLBACK_MESSAGE = 'Algo salió mal. Vuelve a intentarlo en un momento.'

const NO_CONNECTION_MESSAGE = 'No pudimos conectarnos. Revisa tu internet y vuelve a intentarlo.'

/**
 * Errores de Supabase Auth por `code` (la vía estable; el `message` cambia entre
 * versiones de GoTrue). Ver https://supabase.com/docs/guides/auth/debugging/error-codes
 */
const ERROR_BY_CODE: Record<string, string> = {
  invalid_credentials: 'Email o contraseña incorrectos. Revísalos e intenta de nuevo.',
  email_not_confirmed: 'Todavía no confirmaste tu email. Busca el correo que te enviamos.',
  user_already_exists: 'Este email ya está registrado. ¿Quieres iniciar sesión?',
  email_exists: 'Este email ya está registrado. ¿Quieres iniciar sesión?',
  weak_password: 'Esa contraseña es muy débil. Usa 8+ caracteres con una mayúscula y un número.',
  email_address_invalid: 'Ese email no se ve bien. Revísalo.',
  validation_failed: 'Revisa los datos que escribiste.',
  over_email_send_rate_limit:
    'Enviamos varios correos seguidos. Espera un minuto y vuelve a intentar.',
  over_request_rate_limit: 'Demasiados intentos seguidos. Espera un momento e intenta de nuevo.',
  same_password: 'La contraseña nueva debe ser distinta a la actual.',
  user_not_found: 'No encontramos una cuenta con ese email.',
  signup_disabled: 'El registro está deshabilitado por ahora. Escríbenos si necesitas acceso.',
  session_expired: 'Tu sesión expiró. Inicia sesión de nuevo.',
  otp_expired: 'Ese enlace ya venció. Pide uno nuevo.',
}

/**
 * Fallback por texto del mensaje, para versiones/casos que no traen `code`.
 * Las claves se comparan en minúsculas contra el mensaje del error.
 */
const ERROR_BY_MESSAGE: [needle: string, message: string][] = [
  ['user already registered', 'Este email ya está registrado. ¿Quieres iniciar sesión?'],
  ['already been registered', 'Este email ya está registrado. ¿Quieres iniciar sesión?'],
  ['invalid login credentials', 'Email o contraseña incorrectos. Revísalos e intenta de nuevo.'],
  ['email not confirmed', 'Todavía no confirmaste tu email. Busca el correo que te enviamos.'],
  [
    'password should be at least',
    'Esa contraseña es muy corta. Usa 8+ caracteres con una mayúscula y un número.',
  ],
  ['unable to validate email address', 'Ese email no se ve bien. Revísalo.'],
  ['for security purposes', 'Espera unos segundos antes de volver a intentarlo.'],
  [
    'email rate limit exceeded',
    'Enviamos varios correos seguidos. Espera un minuto y vuelve a intentar.',
  ],
  ['email link is invalid or has expired', 'Ese enlace ya venció. Pide uno nuevo.'],
  ['access_denied', 'El enlace no es válido. Pide uno nuevo desde la app.'],
  ['network request failed', NO_CONNECTION_MESSAGE],
  ['failed to fetch', NO_CONNECTION_MESSAGE],
]

/** Detecta fallas de red (sin conexión, DNS, timeout) mirando el mensaje. */
function isNetworkError(message: string): boolean {
  const normalized = message.toLowerCase()
  return (
    normalized.includes('network request failed') ||
    normalized.includes('failed to fetch') ||
    normalized.includes('networkerror') ||
    normalized.includes('timeout')
  )
}

/**
 * Traduce cualquier error de Supabase Auth a un mensaje en español, cercano y
 * accionable. Nunca lanza: ante lo desconocido devuelve un mensaje genérico.
 */
export function getAuthErrorMessage(error: unknown): string {
  if (!error) {
    return FALLBACK_MESSAGE
  }

  // Sin conexión: AuthRetryableFetchError trae status 0 y el mensaje del fetch.
  if (isAuthError(error)) {
    const byCode = error.code ? ERROR_BY_CODE[error.code] : undefined
    if (byCode) {
      return byCode
    }
    if (error.status === 0 || isNetworkError(error.message)) {
      return NO_CONNECTION_MESSAGE
    }
    return matchByMessage(error.message) ?? FALLBACK_MESSAGE
  }

  if (error instanceof Error) {
    if (isNetworkError(error.message)) {
      return NO_CONNECTION_MESSAGE
    }
    return matchByMessage(error.message) ?? FALLBACK_MESSAGE
  }

  if (typeof error === 'string') {
    return matchByMessage(error) ?? FALLBACK_MESSAGE
  }

  return FALLBACK_MESSAGE
}

/**
 * Traduce el error que viene en un deep link de Supabase.
 *
 * Los correos no devuelven un `AuthError`: el error llega como parámetros en la
 * URL (`error_code=otp_expired&error_description=...`), así que se traduce por
 * código y, si no lo conocemos, por el texto de la descripción.
 */
export function getAuthLinkErrorMessage(code?: string, description?: string): string {
  const byCode = code ? ERROR_BY_CODE[code] : undefined
  if (byCode) {
    return byCode
  }
  if (description) {
    return matchByMessage(description) ?? FALLBACK_MESSAGE
  }
  return FALLBACK_MESSAGE
}

function matchByMessage(message: string): string | null {
  const normalized = message.toLowerCase()
  for (const [needle, translated] of ERROR_BY_MESSAGE) {
    if (normalized.includes(needle)) {
      return translated
    }
  }
  return null
}

/** Enmascara un email para mostrarlo sin exponerlo entero: `dil***@gmail.com`. */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@')
  if (!localPart || !domain) {
    return email
  }
  const visible = localPart.slice(0, 3)
  return `${visible}${localPart.length > 3 ? '***' : ''}@${domain}`
}

/**
 * Sustantivo de cada tipo de vehículo, en minúscula salvo las siglas.
 *
 * Se escribe a mano y no se deriva de `VEHICLE_TYPES[].labelEs` porque esa
 * etiqueta es un rótulo suelto del picker, no una palabra pensada para ir
 * dentro de una frase.
 */
const TYPE_NOUNS: Record<VehicleTypeSlug, string> = {
  car: 'carro',
  motorcycle: 'moto',
  suv: 'SUV',
  truck: 'camioneta',
  van: 'van',
}

/**
 * Tipo con posesivo, para intercalar en frases:
 * `Elige la marca de ${typeToArticleAndNoun(type)}.` → "…de tu carro."
 */
export function typeToArticleAndNoun(type: VehicleTypeSlug): string {
  return `tu ${TYPE_NOUNS[type]}`
}

/**
 * Tipo como etiqueta suelta, capitalizada: "Carro", "Moto", "SUV".
 * Para el resumen de confirmación, donde el valor va solo en su fila.
 */
export function typeToNoun(type: VehicleTypeSlug): string {
  const noun = TYPE_NOUNS[type]
  return noun.charAt(0).toUpperCase() + noun.slice(1)
}

/**
 * Separador de miles con punto, como se escribe en Colombia: 150000 → "150.000".
 *
 * Se usa para el odómetro, donde el número es largo y sin separador es fácil
 * equivocarse en un dígito al leerlo.
 */
export function formatWithDots(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Lee un entero de un texto que puede venir con separadores: "150.000" → 150000.
 *
 * Descarta todo lo que no sea dígito, así que sirve tanto para lo que el
 * usuario tipea como para reformatear lo que ya está en pantalla. Devuelve
 * `null` si no queda ningún dígito.
 */
export function parseIntSafe(s: string): number | null {
  const digits = s.replace(/\D/g, '')
  if (digits === '') {
    return null
  }
  const n = Number.parseInt(digits, 10)
  return Number.isNaN(n) ? null : n
}
