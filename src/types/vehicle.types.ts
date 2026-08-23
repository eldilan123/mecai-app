import type { Database } from '@/types/database.types'

/**
 * Tipos del dominio "vehículo" (HU-08).
 *
 * El flujo de registro es multi-paso: el usuario responde una pregunta por
 * pantalla y las respuestas se van acumulando en `VehicleOnboardingData` hasta
 * el INSERT final. Por eso los tipos del formulario y los de la tabla están
 * separados: durante el flujo casi todo puede ser `null`.
 */

/**
 * Categorías de vehículo soportadas.
 *
 * Estos 5 valores son exactamente los del CHECK de la columna `vehicles.type`
 * en Supabase. Agregar uno acá sin migrar la base rompe el INSERT.
 */
export type VehicleTypeSlug = 'car' | 'motorcycle' | 'truck' | 'van' | 'suv'

/** Una opción del selector de tipo (pantalla 1 del flujo). */
export interface VehicleTypeOption {
  slug: VehicleTypeSlug
  /** Etiqueta que ve el usuario, en español de Colombia. */
  labelEs: string
  /** Nombre del icono de `lucide-react-native` (ej: 'Car', 'Bike'). */
  iconName: string
  /** Subtítulo breve que desambigua la categoría. */
  description: string
}

/** Una marca del catálogo curado. */
export interface VehicleBrand {
  /** kebab-case, único en todo el catálogo. */
  slug: string
  /** Nombre para mostrar. Es el valor que termina guardándose en la BD. */
  name: string
  /** Categorías que cubre la marca: define en qué pasos aparece. */
  types: VehicleTypeSlug[]
}

/** Un modelo del catálogo curado. */
export interface VehicleModel {
  /** kebab-case, único dentro de su combinación marca + tipo. */
  slug: string
  /** Nombre para mostrar. Es el valor que termina guardándose en la BD. */
  name: string
  brandSlug: string
  type: VehicleTypeSlug
}

/**
 * Lo que el store acumula durante el flujo, antes del INSERT.
 *
 * `brand` y `model` guardan el *name* y no el slug: el usuario puede terminar
 * escribiendo una marca o modelo que no está en el catálogo curado, y la BD
 * espera texto libre en esas columnas.
 */
export interface VehicleOnboardingData {
  type: VehicleTypeSlug | null
  brand: string | null
  model: string | null
  year: number | null
  currentKm: number | null
  licensePlate: string | null
  color: string | null
  nickname: string | null
  /** URI local que devuelve el image picker, ANTES de subir al bucket. */
  photoLocalUri: string | null
}

type VehiclesInsert = Database['public']['Tables']['vehicles']['Insert']

/**
 * Payload exacto del INSERT en `vehicles`.
 *
 * Se deriva del tipo generado por Supabase, pero estrecha `type` de `string` al
 * union real: así el compilador atrapa un tipo inválido antes de que lo rechace
 * el CHECK de la base.
 */
export type VehicleInsertPayload = Omit<VehiclesInsert, 'type'> & {
  type: VehicleTypeSlug
}

/** Una fila de `vehicles` tal como la devuelve Supabase. */
export type VehicleRow = Database['public']['Tables']['vehicles']['Row']
