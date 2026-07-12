// Metro config de MecAI: envuelve la config por defecto de Expo con NativeWind.
// El `input` apunta al CSS global con las directivas de Tailwind.
const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const config = getDefaultConfig(__dirname)

module.exports = withNativeWind(config, { input: './src/global.css' })
