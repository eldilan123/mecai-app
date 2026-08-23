import { createClient, type User } from '@supabase/supabase-js'

import { getAuthStorageOptions, realtimeTransport } from '@/services/ssr'
import type { Database } from '@/types/database.types'

// Variables públicas (van en el bundle de la app). Ver .env.example.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. Copia .env.example a .env y complétalas.'
  )
}

/**
 * Cliente Supabase tipado con el esquema de la BD (`Database`).
 *
 * Persistencia de sesión con AsyncStorage. Nota: el tech spec §7 usa MMKV para
 * el estado de Zustand; aquí se usa AsyncStorage porque MMKV es un módulo nativo
 * (requiere dev build, no corre en Expo Go) y aún no está en el proyecto. Si más
 * adelante se adopta MMKV globalmente, se puede migrar este `storage`.
 *
 * Las opciones que dependen del entorno (storage y transporte de Realtime) salen
 * de `services/ssr.ts`: el render en servidor de `expo start --web` corre en
 * Node, donde no hay `window` ni `WebSocket`.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...getAuthStorageOptions(),
    // En apps nativas no hay URL de callback en el navegador.
    detectSessionInUrl: false,
  },
  realtime: {
    transport: realtimeTransport,
  },
})

/** Devuelve el usuario autenticado actual, o null si no hay sesión. */
export async function getUser(): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}
