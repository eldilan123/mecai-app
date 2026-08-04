import type { User } from '@supabase/supabase-js'

import type { Database } from '@/types/database.types'

/** Fila de la tabla `profiles` (extiende `auth.users`). */
export type Profile = Database['public']['Tables']['profiles']['Row']

/** Tier de suscripción. La columna es TEXT con CHECK ('free' | 'premium'). */
export type SubscriptionTier = 'free' | 'premium'

/** Usuario autenticado de Supabase Auth. */
export type AuthUser = User

/** Resultado uniforme de las operaciones de auth: nunca lanza, siempre devuelve error legible. */
export interface AuthResult {
  ok: boolean
  /** Mensaje en español listo para mostrar al usuario. Null si `ok` es true. */
  error: string | null
}
