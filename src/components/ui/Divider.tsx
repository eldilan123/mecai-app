import { View } from 'react-native'

import { Typography } from './Typography'

import { colors } from '@/constants/theme'

/**
 * Separador horizontal (neutral-200). Con `label` queda una línea a cada lado
 * del texto — el patrón "── o con email ──" de las pantallas de auth.
 */
export interface DividerProps {
  label?: string
  className?: string
}

export function Divider({ label, className }: DividerProps) {
  if (!label) {
    return <View className={`h-[1px] w-full bg-neutral-200 ${className ?? ''}`} />
  }

  return (
    <View className={`w-full flex-row items-center ${className ?? ''}`}>
      <View className="h-[1px] flex-1 bg-neutral-200" />
      <Typography variant="body-sm" color={colors.neutral[500]} className="mx-3">
        {label}
      </Typography>
      <View className="h-[1px] flex-1 bg-neutral-200" />
    </View>
  )
}
