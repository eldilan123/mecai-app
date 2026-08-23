import { z } from 'zod'

import { getYearRange } from '@/constants/vehicles'

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

/* ── Vehículos (HU-08) ──────────────────────────────────────────────────── */

const { min: YEAR_MIN, max: YEAR_MAX } = getYearRange()

const KM_MAX = 9_999_999
const KM_MESSAGE = 'El kilometraje debe ser un número válido entre 0 y 9,999,999'

export const vehicleTypeSchema = z.enum(['car', 'motorcycle', 'truck', 'van', 'suv'], {
  errorMap: () => ({ message: 'Selecciona un tipo de vehículo' }),
})

export const vehicleYearSchema = z
  .number({
    required_error: '¿De qué año es tu vehículo?',
    invalid_type_error: 'Escribe el año en números',
  })
  .int('Escribe el año en números')
  .min(YEAR_MIN, `Solo aceptamos vehículos desde ${YEAR_MIN}`)
  .max(YEAR_MAX, `El año no puede ser mayor a ${YEAR_MAX}`)

export const vehicleKmSchema = z
  .number({ required_error: KM_MESSAGE, invalid_type_error: KM_MESSAGE })
  .int(KM_MESSAGE)
  .min(0, KM_MESSAGE)
  .max(KM_MAX, KM_MESSAGE)

/**
 * Placa. Opcional y sin formato estricto: cambia por país (Colombia usa
 * "ABC123" para carros y "ABC12D" para motos) y no queremos bloquear a nadie
 * por un guion de más.
 */
export const licensePlateSchema = z
  .string()
  .trim()
  .min(1, 'Escribe la placa o deja el campo vacío')
  .max(10, 'La placa no puede tener más de 10 caracteres')
  .optional()
  .or(z.literal(''))

export const colorSchema = z
  .string()
  .trim()
  .max(30, 'Máximo 30 caracteres')
  .optional()
  .or(z.literal(''))

export const nicknameSchema = z
  .string()
  .trim()
  .max(40, 'Máximo 40 caracteres')
  .optional()
  .or(z.literal(''))

/**
 * Validación final antes del INSERT en `vehicles`.
 *
 * Los nombres de campo son los de la tabla (snake_case), no los del store, para
 * que el objeto validado se pueda mandar tal cual a Supabase.
 */
export const vehicleFullSchema = z.object({
  type: vehicleTypeSchema,
  brand: z.string().trim().min(1, 'Selecciona o escribe la marca'),
  model: z.string().trim().min(1, 'Selecciona o escribe el modelo'),
  year: vehicleYearSchema,
  current_km: vehicleKmSchema,
  license_plate: licensePlateSchema,
  color: colorSchema,
  nickname: nicknameSchema,
})

export type VehicleFormValues = z.input<typeof vehicleFullSchema>
export type VehicleInput = z.output<typeof vehicleFullSchema>
