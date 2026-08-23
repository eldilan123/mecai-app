import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

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

  setUser: (user: AuthUser | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (isLoading: boolean) => void
  setLinkError: (linkError: string | null) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isLoading: true,
      linkError: null,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      setLinkError: (linkError) => set({ linkError }),
      clearAuth: () => set({ user: null, profile: null }),
    }),
    {
      name: 'mecai-auth',
      storage: createJSONStorage(() => AsyncStorage),
      // `isLoading` y `linkError` son estado de arranque/transitorio: no se persisten.
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
