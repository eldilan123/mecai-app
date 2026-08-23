import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { supabase } from '@/services/supabase'
import type { AuthUser, Profile } from '@/types/auth.types'

/**
 * Estado global de autenticación (HU-06 / HU-07).
 *
 * La sesión real (tokens, refresh) la maneja el cliente de Supabase con su
 * propio AsyncStorage; este store guarda el *usuario* y el *perfil* para que la
 * UI pueda pintar algo apenas abre la app, sin esperar el round-trip a la red.
 *
 * Nota: el tech spec §7 propone MMKV. Se usa AsyncStorage porque MMKV es módulo
 * nativo y no corre en Expo Go (misma decisión que `services/supabase.ts`).
 */
export interface AuthState {
  user: AuthUser | null
  profile: Profile | null
  /** True mientras se resuelve el estado de auth inicial (hidratación + getSession). */
  isLoading: boolean
  /**
   * Error del último deep link de auth procesado (enlace vencido, inválido…).
   * Lo escribe `useAuthDeepLink` y lo lee la pantalla `/auth/callback`.
   */
  linkError: string | null
  /**
   * ¿El usuario tiene al menos un vehículo activo?
   *
   * `null` significa "todavía no sabemos", y la distinción es crítica: si el
   * guard leyera `false` durante la carga, mandaría al onboarding a alguien que
   * sí tiene vehículos. Sólo `true` y `false` son respuestas.
   *
   * No se persiste: es estado del servidor, se resuelve en cada arranque.
   */
  hasVehicle: boolean | null

  setUser: (user: AuthUser | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (isLoading: boolean) => void
  setLinkError: (linkError: string | null) => void
  /** Setter directo, para el update optimista tras crear el vehículo (HU-08 paso 7). */
  setHasVehicle: (hasVehicle: boolean) => void
  /** Consulta a Supabase si el usuario tiene vehículos activos. */
  refreshVehicleStatus: () => Promise<void>
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isLoading: true,
      linkError: null,
      hasVehicle: null,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      setLinkError: (linkError) => set({ linkError }),
      setHasVehicle: (hasVehicle) => set({ hasVehicle }),

      refreshVehicleStatus: async () => {
        const { user } = get()

        // Sin sesión no hay nada que consultar, y RLS devolvería vacío de todos
        // modos: volvemos a "no sabemos" para que el guard no decida con datos
        // del usuario anterior.
        if (!user) {
          set({ hasVehicle: null })
          return
        }

        const { data, error } = await supabase
          .from('vehicles')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .limit(1)

        if (error) {
          if (__DEV__) {
            console.warn('[auth] No se pudo verificar los vehículos:', error.message)
          }
          // Un fallo de red no debe reescribir lo que ya sabíamos. Pero si aún
          // no sabíamos nada, quedarnos en `null` deja la app colgada en el
          // loader del guard: asumimos `true` (→ Home). Es el error menos malo.
          // Mandar a alguien con vehículos al onboarding le haría registrar un
          // duplicado; Home, en cambio, ya tiene estado vacío y se recupera en
          // el siguiente refresh.
          if (get().hasVehicle === null) {
            set({ hasVehicle: true })
          }
          return
        }

        set({ hasVehicle: data.length > 0 })
      },

      clearAuth: () => set({ user: null, profile: null, hasVehicle: null }),
    }),
    {
      name: 'mecai-auth',
      storage: createJSONStorage(() => AsyncStorage),
      // `isLoading`, `linkError` y `hasVehicle` son estado transitorio o del
      // servidor: no se persisten.
      partialize: (state) => ({ user: state.user, profile: state.profile }),
    }
  )
)

/**
 * ¿El usuario tiene premium activo?
 *
 * Premium = tier 'premium' Y (sin fecha de expiración O expiración en el futuro).
 * Se evalúa sobre el perfil para no depender de RevenueCat en cada render.
 */
export function isProfilePremium(profile: Profile | null): boolean {
  if (!profile || profile.subscription_tier !== 'premium') {
    return false
  }
  if (!profile.subscription_expires_at) {
    return true
  }
  return new Date(profile.subscription_expires_at).getTime() > Date.now()
}

/** Selector de premium para usar dentro de componentes. */
export const selectIsPremium = (state: AuthState): boolean => isProfilePremium(state.profile)
