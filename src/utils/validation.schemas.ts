import { z } from 'zod'

/**
 * Schemas de validación de formularios (Zod).
 *
 * Los mensajes están en español y en tono cercano: el usuario objetivo de MecAI
 * no es técnico, así que el error tiene que decirle qué hacer, no qué falló.
 */

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Escribe tu email')
  .email('Ese email no se ve bien. Revísalo.')
  // Supabase normaliza a minúsculas; lo hacemos antes para que el input coincida.
  .transform((value) => value.toLowerCase())

const passwordSchema = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
  .regex(/[0-9]/, 'Debe tener al menos un número')

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .max(80, 'Máximo 80 caracteres')
    .optional()
    // Un string vacío en el input equivale a "no lo llenó".
    .transform((value) => (value === '' ? undefined : value)),
  email: emailSchema,
  password: passwordSchema,
})

export const loginSchema = z.object({
  email: emailSchema,
  // En login no se re-valida la fuerza: si la contraseña es vieja o cambió la
  // política, el usuario igual debe poder entrar. El error lo da Supabase.
  password: z.string().min(1, 'Escribe tu contraseña'),
})

export const resetPasswordSchema = z.object({
  email: emailSchema,
})

/** Valores del formulario ANTES de las transformaciones de Zod (lo que maneja react-hook-form). */
export type RegisterFormValues = z.input<typeof registerSchema>
export type LoginFormValues = z.input<typeof loginSchema>
export type ResetPasswordFormValues = z.input<typeof resetPasswordSchema>

/** Valores ya validados y normalizados (lo que llega al `onSubmit`). */
export type RegisterInput = z.output<typeof registerSchema>
export type LoginInput = z.output<typeof loginSchema>
export type ResetPasswordInput = z.output<typeof resetPasswordSchema>
