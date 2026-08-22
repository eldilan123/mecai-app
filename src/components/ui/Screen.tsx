import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type ViewProps,
  type ScrollViewProps,
} from 'react-native'
import { SafeAreaView, type Edge } from 'react-native-safe-area-context'

/**
 * Wrapper de pantalla de MecAI.
 *
 * Aplica el fondo blanco hueso (neutral-50) y el padding horizontal estándar.
 * Con `scrollable` envuelve el contenido en un ScrollView + KeyboardAvoidingView,
 * que es lo que necesitan las pantallas de formulario para que el teclado no
 * tape los inputs.
 *
 * Nota: el padding lateral es de **20px** (`px-5`), no los 16px del design
 * system v2.0 §4. Decisión de Dilan en el pase de pulido visual de HU-06/07 —
 * 16px dejaba las pantallas de auth apretadas. Actualizar el DS a v2.1.
 */
export interface ScreenProps extends ViewProps {
  /** Envuelve el contenido en ScrollView + KeyboardAvoidingView. */
  scrollable?: boolean
  /** Bordes seguros a respetar. Por defecto arriba y abajo. */
  edges?: readonly Edge[]
  /** Desactiva el padding horizontal (pantallas full-bleed). */
  noPadding?: boolean
  contentContainerClassName?: ScrollViewProps['contentContainerClassName']
}

const DEFAULT_EDGES: readonly Edge[] = ['top', 'bottom']

export function Screen({
  scrollable = false,
  edges = DEFAULT_EDGES,
  noPadding = false,
  className,
  contentContainerClassName,
  children,
  ...rest
}: ScreenProps) {
  const paddingClass = noPadding ? '' : 'px-5'

  if (scrollable) {
    return (
      <SafeAreaView edges={edges} className="flex-1 bg-neutral-50">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            className="flex-1"
            contentContainerClassName={`grow ${paddingClass} ${contentContainerClassName ?? ''}`}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className={`grow ${className ?? ''}`} {...rest}>
              {children}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={edges} className="flex-1 bg-neutral-50">
      <View className={`flex-1 ${paddingClass} ${className ?? ''}`} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  )
}
