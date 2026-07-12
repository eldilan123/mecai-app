import { Text, View } from 'react-native'

/**
 * Pantalla inicial temporal de MecAI.
 *
 * Es solo un placeholder para que la app arranque durante el setup (HU-03).
 * Se reemplazará por el flujo real de bienvenida / auth / onboarding en las
 * historias de la Épica 2.
 */
export default function Index() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>MecAI — setup inicial (HU-03)</Text>
    </View>
  )
}
