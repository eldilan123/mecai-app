import type { Session } from '@supabase/supabase-js'
import { useCallback, useEffect } from 'react'

import { supabase } from '@/services/supabase'
import { isProfilePremium, useAuthStore } from '@/store/auth.store'
import type { AuthResult, AuthUser, Profile } from '@/types/auth.types'
import { getAuthRedirectUrl } from '@/utils/auth.utils'
import { getAuthErrorMessage } from '@/utils/format.utils'

/**
 * Hook de autenticación de MecAI (HU-06 / HU-07).
 *
 * Se suscribe una sola vez (a nivel de módulo) a `supabase.auth.onAuthStateChange`
 * y sincroniza el store de Zustand. Cualquier componente puede llamar `useAuth()`
 * sin miedo a duplicar listeners.
 */

let listenerInitialized = false

/** Trae el perfil de `profiles` del usuario. Falla en silencio: la sesión manda. */
async function fetchProfile(userId: string): Promise<void> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()

  if (error) {
    // El trigger `handle_new_user` puede no haber corrido aún justo tras el signup.
    // No es fatal: la sesión existe y el perfil se recarga en el próximo evento.
    if (__DEV__) {
      console.warn('[auth] No se pudo cargar el perfil:', error.message)
    }
    return
  }

  useAuthStore.getState().setProfile(data ?? null)
}

/** Aplica una sesión al store (usuario + perfil). */
function applySession(session: Session | null): void {
  const { setUser, clearAuth } = useAuthStore.getState()

  if (!session?.user) {
    clearAuth()
    return
  }

  setUser(session.user)
  // Diferido: llamar a métodos async de Supabase DENTRO del callback de
  // onAuthStateChange puede bloquear el cliente (deadlock documentado).
  setTimeout(() => {
    void fetchProfile(session.user.id)
  }, 0)
}

/** Arranca el listener global de sesión. Idempotente. */
function initializeAuthListener(): void {
  if (listenerInitialized) {
    return
  }
  listenerInitialized = true

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      useAuthStore.getState().clearAuth()
    } else {
      applySession(session)
    }

    // INITIAL_SESSION siempre llega (con o sin sesión): ahí termina la carga.
    if (event === 'INITIAL_SESSION') {
      useAuthStore.getState().setLoading(false)
    }
  })

  // Red de seguridad por si INITIAL_SESSION no llegara (p. ej. storage corrupto).
  void supabase.auth.getSession().finally(() => {
    useAuthStore.getState().setLoading(false)
  })
}

export interface UseAuthReturn {
  user: AuthUser | null
  profile: Profile | null
  isPremium: boolean
  isLoading: boolean
  signUp: (input: { email: string; password: string; fullName?: string }) => Promise<AuthResult>
  signIn: (input: { email: string; password: string }) => Promise<AuthResult>
  signOut: () => Promise<AuthResult>
  resetPassword: (email: string) => Promise<AuthResult>
  /** Reenvía el correo de confirmación de cuenta. */
  resendVerificationEmail: (email: string) => Promise<AuthResult>
  /** Recarga el perfil desde la BD (tras editar datos, por ejemplo). */
  refreshProfile: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)
  const isLoading = useAuthStore((state) => state.isLoading)

  useEffect(() => {
    initializeAuthListener()
  }, [])

  const signUp = useCallback<UseAuthReturn['signUp']>(async ({ email, password, fullName }) => {
    const redirectUrl = getAuthRedirectUrl()

    // TODO(debug): log temporal para diagnosticar el redirect en Expo Go. BORRAR.
    console.log('[DEBUG SIGNUP] emailRedirectTo will be:', redirectUrl)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // El trigger `handle_new_user` lee `full_name` de raw_user_meta_data.
        data: fullName ? { full_name: fullName } : undefined,
        emailRedirectTo: redirectUrl,
      },
    })

    if (error) {
      return { ok: false, error: getAuthErrorMessage(error) }
    }

    // Con "Confirm email" activo, Supabase NO devuelve error si el email ya
    // existe (evita enumeración de usuarios): devuelve un usuario con
    // `identities: []`. Ese es el único indicio de email duplicado.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return { ok: false, error: 'Este email ya está registrado. ¿Quieres iniciar sesión?' }
    }

    return { ok: true, error: null }
  }, [])

  const signIn = useCallback<UseAuthReturn['signIn']>(async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? { ok: false, error: getAuthErrorMessage(error) } : { ok: true, error: null }
  }, [])

  const signOut = useCallback<UseAuthReturn['signOut']>(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return { ok: false, error: getAuthErrorMessage(error) }
    }
    useAuthStore.getState().clearAuth()
    return { ok: true, error: null }
  }, [])

  const resetPassword = useCallback<UseAuthReturn['resetPassword']>(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl(),
    })
    return error ? { ok: false, error: getAuthErrorMessage(error) } : { ok: true, error: null }
  }, [])

  const resendVerificationEmail = useCallback<UseAuthReturn['resendVerificationEmail']>(
    async (email) => {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: getAuthRedirectUrl() },
      })
      return error ? { ok: false, error: getAuthErrorMessage(error) } : { ok: true, error: null }
    },
    []
  )

  const refreshProfile = useCallback(async () => {
    const currentUser = useAuthStore.getState().user
    if (currentUser) {
      await fetchProfile(currentUser.id)
    }
  }, [])

  return {
    user,
    profile,
    isPremium: isProfilePremium(profile),
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    resendVerificationEmail,
    refreshProfile,
  }
}
