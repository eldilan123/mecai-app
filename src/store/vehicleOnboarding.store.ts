import { create } from 'zustand'

import type { VehicleOnboardingData, VehicleTypeSlug } from '@/types/vehicle.types'

/**
 * Estado del flujo de registro de vehículo (HU-08).
 *
 * A diferencia de `auth.store`, este store NO se persiste: es deliberado. Un
 * onboarding a medio llenar que sobrevive al cierre de la app deja al usuario
 * cayendo en el paso 4 sin recordar qué respondió antes. Si cierra, empieza de
 * cero — son 7 preguntas cortas.
 */

/** Pasos del flujo, en orden. */
export type VehicleOnboardingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7

/** Campos que el paso 6 (extras) puede escribir. Todos opcionales. */
export type VehicleExtras = Partial<
  Pick<VehicleOnboardingData, 'licensePlate' | 'color' | 'nickname' | 'photoLocalUri'>
>

export interface VehicleOnboardingState extends VehicleOnboardingData {
  setType: (type: VehicleTypeSlug) => void
  /** Cambiar de marca invalida el modelo elegido: se resetea a `null`. */
  setBrand: (brand: string) => void
  setModel: (model: string) => void
  setYear: (year: number) => void
  setCurrentKm: (km: number) => void
  /** Hace merge sobre los extras existentes; no pisa los que no vengan. */
  setExtras: (extras: VehicleExtras) => void
  reset: () => void
  /** ¿Se puede considerar cerrado el paso `step`? Ver `isStepComplete`. */
  isStepComplete: (step: VehicleOnboardingStep) => boolean
}

const INITIAL_DATA: VehicleOnboardingData = {
  type: null,
  brand: null,
  model: null,
  year: null,
  currentKm: null,
  licensePlate: null,
  color: null,
  nickname: null,
  photoLocalUri: null,
}

/**
 * ¿El paso `step` está completo?
 *
 * Es acumulativo: un paso sólo cuenta como completo si todos los anteriores
 * también lo están. Así el guard de navegación puede preguntar por un paso
 * suelto sin encadenar condiciones, y nadie llega al resumen por deep link con
 * la mitad de los datos en blanco.
 *
 * Los pasos 6 (extras) y 7 (confirmación) no piden datos nuevos: quedan
 * completos apenas los pasos 1–5 lo estén.
 */
export function isStepComplete(data: VehicleOnboardingData, step: VehicleOnboardingStep): boolean {
  const hasType = data.type !== null
  const hasBrand = hasType && data.brand !== null
  const hasModel = hasBrand && data.model !== null
  const hasYear = hasModel && data.year !== null
  const hasKm = hasYear && data.currentKm !== null

  switch (step) {
    case 1:
      return hasType
    case 2:
      return hasBrand
    case 3:
      return hasModel
    case 4:
      return hasYear
    case 5:
    case 6:
    case 7:
      return hasKm
  }
}

export const useVehicleOnboardingStore = create<VehicleOnboardingState>()((set, get) => ({
  ...INITIAL_DATA,

  setType: (type) => set({ type }),
  // El modelo pertenece a una marca concreta: si cambia la marca, el modelo que
  // hubiera quedado seleccionado ya no existe en la lista nueva.
  setBrand: (brand) => set({ brand, model: null }),
  setModel: (model) => set({ model }),
  setYear: (year) => set({ year }),
  setCurrentKm: (currentKm) => set({ currentKm }),
  setExtras: (extras) => set((state) => ({ ...state, ...extras })),
  reset: () => set(INITIAL_DATA),

  isStepComplete: (step) => isStepComplete(get(), step),
}))

/**
 * Selector para usar dentro de componentes:
 * `useVehicleOnboardingStore(selectIsStepComplete(3))`.
 *
 * Devuelve un boolean, así que el componente sólo re-renderiza cuando ese paso
 * cambia de estado — no en cada tecla del formulario.
 */
export const selectIsStepComplete =
  (step: VehicleOnboardingStep) =>
  (state: VehicleOnboardingState): boolean =>
    isStepComplete(state, step)
