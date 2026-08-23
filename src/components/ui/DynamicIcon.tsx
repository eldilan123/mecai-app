import { Bike, Bus, Car, CarFront, Truck, type LucideIcon } from 'lucide-react-native'

import { colors } from '@/constants/theme'

/**
 * Resuelve un icono de Lucide a partir de su nombre en texto.
 *
 * Existe porque el seed de `constants/vehicles.ts` guarda el icono como string
 * (`iconName: 'Car'`) y no como componente: los datos no deberían importar UI.
 *
 * La whitelist es deliberada. Un import dinámico de toda la librería metería
 * ~1500 iconos en el bundle; acá sólo entran los que el seed usa de verdad.
 * Al agregar un tipo de vehículo nuevo hay que registrar su icono aquí.
 */
const ICONS: Record<string, LucideIcon> = {
  Car,
  Bike,
  CarFront,
  Truck,
  Bus,
}

export interface DynamicIconProps {
  /** Nombre del icono tal como aparece en el seed (ej: 'Car'). */
  name: string
  size?: number
  color?: string
}

export function DynamicIcon({ name, size = 24, color = colors.primary[600] }: DynamicIconProps) {
  const Icon = ICONS[name]

  if (!Icon) {
    if (__DEV__) {
      console.warn(
        `[DynamicIcon] "${name}" no está en la whitelist. ` +
          `Agrégalo en components/ui/DynamicIcon.tsx. Disponibles: ${Object.keys(ICONS).join(', ')}`
      )
    }
    return null
  }

  return <Icon size={size} color={color} />
}
