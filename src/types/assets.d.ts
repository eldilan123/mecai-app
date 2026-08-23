/**
 * Declaraciones de módulos para assets estáticos importados desde código.
 *
 * Metro los resuelve a un número (referencia al asset registry) o, en web, a la
 * URL del archivo. `expo/types` no incluye estas declaraciones, así que las
 * definimos aquí para poder hacer `import logo from '@/assets/logo/x.png'`.
 */
declare module '*.png' {
  const content: number
  export default content
}

declare module '*.jpg' {
  const content: number
  export default content
}

declare module '*.svg' {
  const content: number
  export default content
}
