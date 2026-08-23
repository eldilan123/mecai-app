import { Search, X } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { FlatList, Pressable, View } from 'react-native'

import { OptionCard } from '@/components/onboarding/OptionCard'
import { Input } from '@/components/ui/Input'
import { Typography } from '@/components/ui/Typography'
import { colors } from '@/constants/theme'

/**
 * Lista con buscador para los pasos de selección del onboarding (HU-08).
 *
 * El filtrado es local y síncrono: los catálogos son de 15-20 items y ya están
 * en memoria, así que no hay nada que debouncear — un debounce sólo agregaría
 * latencia percibida entre la tecla y el resultado.
 */
export interface SearchableItem {
  key: string
  label: string
  subtitle?: string
}

export interface SearchableListProps {
  items: SearchableItem[]
  onSelect: (key: string) => void
  searchPlaceholder: string
  /** Mensaje cuando no hay resultados. Por defecto 'Sin resultados'. */
  emptyMessage?: string
  /**
   * Enfocar el input al montar. Por defecto `false`: que el usuario vea las
   * opciones antes de que el teclado le tape media pantalla.
   */
  autoFocus?: boolean
}

/**
 * Normaliza para comparar: minúsculas y sin acentos, para que "peugeot"
 * encuentre "Peugeót" y "citroen" encuentre "Citroën".
 */
export function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/** Filtra por coincidencia de substring sobre el label normalizado. */
export function filterItems(items: SearchableItem[], query: string): SearchableItem[] {
  const normalizedQuery = normalizeForSearch(query)
  if (!normalizedQuery) {
    return items
  }
  return items.filter((item) => normalizeForSearch(item.label).includes(normalizedQuery))
}

function EmptyState({ message }: { message: string }) {
  return (
    <View className="items-center rounded-md border border-neutral-200 bg-white px-5 py-8">
      <Typography variant="title-sm" className="text-center">
        {message}
      </Typography>
      <Typography variant="body-md" color={colors.neutral[500]} className="mt-2 text-center">
        Intenta con otro término
      </Typography>
    </View>
  )
}

export function SearchableList({
  items,
  onSelect,
  searchPlaceholder,
  emptyMessage,
  autoFocus = false,
}: SearchableListProps) {
  const [query, setQuery] = useState('')

  const visibleItems = useMemo(() => filterItems(items, query), [items, query])

  // Dos vacíos distintos: no hay catálogo, o el filtro no encontró nada. El
  // segundo sí sugiere reformular la búsqueda; el primero no.
  const message =
    items.length === 0
      ? (emptyMessage ?? 'No hay opciones disponibles')
      : (emptyMessage ?? 'Sin resultados')

  return (
    <View className="flex-1">
      <Input
        value={query}
        onChangeText={setQuery}
        placeholder={searchPlaceholder}
        accessibilityLabel={searchPlaceholder}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        className="mb-4"
        icon={<Search size={20} color={colors.neutral[500]} />}
        rightSlot={
          query.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Limpiar búsqueda"
              onPress={() => setQuery('')}
              hitSlop={8}
              // 44px de área táctil sin agrandar el campo.
              className="h-11 w-11 items-center justify-center"
            >
              <X size={20} color={colors.neutral[500]} />
            </Pressable>
          ) : null
        }
      />

      <FlatList
        data={visibleItems}
        keyExtractor={(item) => item.key}
        // Sin esto, con el teclado abierto el primer tap sólo lo cierra y el
        // usuario tiene que tocar dos veces para elegir.
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-3 pb-8"
        ListEmptyComponent={<EmptyState message={message} />}
        renderItem={({ item }) => (
          <OptionCard
            title={item.label}
            description={item.subtitle}
            onPress={() => onSelect(item.key)}
          />
        )}
      />
    </View>
  )
}
