// Babel config de MecAI.
// jsxImportSource: 'nativewind' habilita className en componentes RN.
// El preset nativewind/babel procesa las clases de Tailwind.
module.exports = function (api) {
  api.cache(true)
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
  }
}
