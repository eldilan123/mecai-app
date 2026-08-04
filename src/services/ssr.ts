import AsyncStorage from '@react-native-async-storage/async-storage'
import type { WebSocketLike } from '@supabase/supabase-js'

/**
 * Compatibilidad con el render en servidor.
 *
 * `expo start --web` no sirve HTML estático: con `web.output: "static"` Expo
 * Router renderiza cada ruta en Node antes de mandarla al navegador. Ahí no
 * existen ni `window` ni `WebSocket`, así que los módulos que se evalúan al
 * importar (como el cliente de Supabase) tienen que aguantar ese entorno.
 *
 * En React Native `window` SÍ está definido (RN lo apunta a `global`), así que
 * este flag solo da `true` en Node.
 */
export const isServerRendering = typeof window === 'undefined'

/**
 * WebSocket inerte para el render en servidor.
 *
 * `createClient` construye un `RealtimeClient` de inmediato, y ese constructor
 * resuelve el transporte WebSocket en el acto: si no encuentra uno global,
 * lanza. En el navegador y en React Native `WebSocket` es global, así que no
 * hay problema — pero `expo start --web` renderiza las rutas en Node (Expo
 * Router con `web.output: "static"`), y Node < 22 no trae `WebSocket` global.
 * De ahí el error "Node.js 20 detected without native WebSocket support".
 *
 * MecAI no usa Realtime (solo Auth + REST), así que en el servidor le pasamos
 * este stub para que el cliente se construya sin explotar. Si algún día alguien
 * se suscribe a un canal durante el SSR, falla acá con un mensaje claro en vez
 * de quedarse colgado en silencio.
 *
 * Se puede borrar cuando el proyecto corra en Node 22+ (que ya trae WebSocket
 * nativo) o si `web.output` deja de renderizar en servidor.
 */
export class ServerWebSocket implements WebSocketLike {
  readonly CONNECTING = 0
  readonly OPEN = 1
  readonly CLOSING = 2
  readonly CLOSED = 3

  readonly readyState = 3 // CLOSED: nunca llega a abrirse
  readonly url: string
  readonly protocol = ''

  onopen: ((ev: Event) => unknown) | null = null
  onmessage: ((ev: MessageEvent) => unknown) | null = null
  onclose: ((ev: CloseEvent) => unknown) | null = null
  onerror: ((ev: Event) => unknown) | null = null

  constructor(address: string | URL) {
    this.url = typeof address === 'string' ? address : address.toString()
  }

  send(): void {
    throw new Error(
      'Supabase Realtime no está disponible durante el render en servidor. ' +
        'Si necesitas Realtime en web, corre el proyecto en Node 22+.'
    )
  }

  close(): void {
    // No hay conexión que cerrar.
  }

  addEventListener(): void {
    // Sin conexión no hay eventos que emitir.
  }

  removeEventListener(): void {
    // Idem addEventListener.
  }
}

/**
 * Transporte a pasarle a `createClient`.
 *
 * `undefined` en cliente (navegador / React Native) para que Supabase use el
 * `WebSocket` nativo; el stub solo en runtimes sin WebSocket global.
 */
export const realtimeTransport =
  typeof globalThis.WebSocket === 'undefined' ? ServerWebSocket : undefined

/**
 * Opciones de `auth` que dependen del entorno.
 *
 * En el servidor no hay dónde guardar la sesión: `AsyncStorage` en web se apoya
 * en `localStorage` y revienta con "window is not defined". Con
 * `persistSession: false` y sin `storage`, Supabase usa memoria y el render
 * sale sin sesión — que es lo correcto: la sesión real la hidrata el cliente.
 */
export function getAuthStorageOptions() {
  if (isServerRendering) {
    return { persistSession: false, autoRefreshToken: false }
  }
  return { storage: AsyncStorage, persistSession: true, autoRefreshToken: true }
}
