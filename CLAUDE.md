@AGENTS.md

# MecAI — Guía para Claude Code

Contexto operativo del proyecto para agentes. Lee esto antes de trabajar.

## Qué es MecAI

App móvil de **mantenimiento vehicular con IA para Latinoamérica**. Ayuda a
dueños de carro/moto sin conocimiento mecánico a entender su vehículo, anticipar
fallas y no dejarse "embalar" en el taller. Tagline: _"Para que no te embalen en
el taller."_ MVP en 3 épicas (identidad → core IA/onboarding → monetización).

> **Naming:** el nombre correcto es **MecAI** (no "MecIA"). Los documentos `02` y
> `03` conservan el nombre viejo en su título — ignóralo, usa **MecAI** en todo el
> código, comentarios y docs.

## Stack (real, no el del tech spec)

- **Expo SDK 54** · React 19.1 · React Native 0.81 · **TypeScript 5.9** (strict)
- **Expo Router v6** (file-based, carpeta `app/` en la raíz)
- **NativeWind v4** + **Tailwind v3** para estilos
- **Zustand** para estado global (se integra en HUs de features)
- Backend **Supabase** (HU-04) · IA **Claude API** vía Edge Function (HU-09+)
- Fuentes: **Sora / Inter / JetBrains Mono** (`@expo-google-fonts`)

> **Por qué SDK 54 y no el último:** el Expo Go de App Store y Play Store solo
> soporta hasta SDK 54. Quedarse ahí permite testear en iPhone y Android reales
> durante todo el MVP sin dev build. **No subas el SDK** sin hablarlo con Dilan:
> se pierde Expo Go. El tech spec (`03`) pedía "SDK 52+", así que cumple.

> `babel-preset-expo` está declarado explícito en devDependencies. No lo quites:
> con SDK 54 npm lo anida dentro de `node_modules/expo/` y Metro no lo encuentra
> ("Cannot find module 'babel-preset-expo'"). Al cambiar de SDK, sincronízalo.

## Comandos

```bash
npm run start        # dev server (Expo)
npm run lint         # ESLint (flat config, strict)
npm run lint:fix     # ESLint --fix
npm run typecheck    # tsc --noEmit
npm run format       # Prettier --write
npm run format:check # Prettier --check
```

Pre-commit (Husky + lint-staged) corre `eslint --fix` + `prettier` sobre lo staged.

## Estructura

- `app/` — rutas (Expo Router). Grupos: `(auth)`, `(onboarding)`, `(tabs)`,
  `maintenance/`. El root layout carga fuentes, arranca el listener de sesión y
  hace de **auth guard** con `<Stack.Protected>` (HU-06/07).
- `src/components/{ui,auth,chat,vehicle,maintenance}/` — componentes. `ui/` =
  primitivos del design system (`Button`, `Input`, `Typography`, `Screen`,
  `FormError`, `Divider`).
- `src/services/` — SDKs externos (supabase, claude, notifications, revenuecat, admob).
  **La app nunca llama a Claude directo**: siempre vía Edge Function.
- `src/store/` — Zustand (`*.store.ts`). `src/hooks/` — `useX.ts`.
  `src/types/` — `*.types.ts`. `src/utils/` — helpers puros + schemas Zod.
- `src/constants/theme.ts` — design tokens en TS. `tailwind.config.js` — los mismos
  tokens para `className`. **Mantener ambos sincronizados.**
- `supabase/` — migrations + edge functions (HU-04). `assets/` — logo, icons, etc.

## Backend / Supabase (HU-04)

- **`supabase/migrations/`** — SQL versionado (formato `YYYYMMDDHHMMSS_nombre.sql`):
  `initial_schema` (7 tablas + triggers), `indexes`, `rls_policies` (RLS en TODAS
  las tablas), `seed_maintenance_types` (17 tipos), `fix_handle_new_user_search_path`.
  Ya aplicadas al proyecto remoto.
- **`supabase/functions/`** — Edge Functions Deno (runtime distinto; excluidas del
  `tsc`/eslint de la app):
  - `ai-assistant` — proxy a Claude (auth + rate limiting + selección de modelo).
  - `calculate-schedules` — cron que recalcula `maintenance_schedules`.
  - `send-reminders` — cron de push notifications (stub hasta HU-13).
- **Cliente:** `src/services/supabase.ts` exporta `supabase` (tipado con `Database`)
  y `getUser()`. Persistencia con AsyncStorage.
- **Tipos:** `src/types/database.types.ts`. **Regenerar** tras cambios de esquema:
  `npx supabase gen types typescript --linked > src/types/database.types.ts`
  (requiere Docker o access token del CLI).

### Convenciones SQL

1. **Toda función `SECURITY DEFINER` lleva `SET search_path = public`** y califica
   sus tablas con schema (`public.profiles`, no `profiles`). `SECURITY DEFINER`
   cambia el _usuario_ con el que corre la función, **no** su `search_path`: ese
   lo hereda de quien la llama. Los triggers sobre `auth.users` los dispara GoTrue
   desde un contexto sin `public`, así que sin esto fallan en runtime con
   "relation does not exist" — y solo se nota al registrarse un usuario real, no
   al aplicar la migración. Fue exactamente el bug de `handle_new_user()` (HU-04).
2. **Los fixes de SQL nunca son solo remotos.** Si algo se parcha a mano en el SQL
   Editor, hay que reflejarlo en `supabase/migrations/` o `supabase db reset`
   revive el bug. Se corrige la migración original **in-place** y además se agrega
   una migración nueva con el mismo `CREATE OR REPLACE`, para las BD que ya
   aplicaron la versión rota.
3. **`CREATE OR REPLACE` sobre `CREATE`** en funciones, para que las migraciones
   de corrección sean idempotentes.
4. **RLS activo en toda tabla nueva**, con su política en `rls_policies`.

Comandos Supabase comunes:

```bash
npx supabase db push                 # aplica migraciones nuevas al remoto
npx supabase functions deploy <fn>   # despliega una Edge Function (requiere access token)
npx supabase gen types typescript --linked > src/types/database.types.ts
```

> **Modelos Claude en `ai-assistant`:** default `claude-haiku-4-5-20251001`, premium
> (diagnóstico) `claude-sonnet-5` (el `claude-sonnet-4-6` del tech spec quedó
> superseded). **`CLAUDE_API_KEY` es placeholder hasta HU-05** — la función se
> despliega pero fallará en runtime con la key real hasta entonces.

## Design System (fuente de verdad)

Los tokens vienen del **Design System v2.0** (`../04-mecai-design-system.md`), **no**
del tech spec §4 (quedó desactualizado tras el renombre). Marca: verde petróleo
`#1F6B5E` (`primary-600`). Acento: naranja cálido `#E8780A` (`accent-600`). Fondo:
blanco hueso `#F8F7F4` (`neutral-50`). MVP solo en **light mode**.

Usa `Typography` (`src/components/ui/Typography.tsx`) para texto: expone la escala
`display-*`, `title-*`, `body-*`, `mono-md`.

## Reglas de resolución de conflictos doc-vs-doc

1. Diseño / tokens / visual → gana **Design System (04)** (es más nuevo).
2. Arquitectura / stack / BD / estructura de carpetas → gana **Tech Spec (03)**.
3. Otro conflicto que no encaje → **pregunta a Dilan**, no improvises.

## Convenciones de código

- Nombres de variables/funciones en **inglés**; comentarios de lógica de negocio
  en **español**.
- TypeScript strict + `noUncheckedIndexedAccess`. Sin `any` explícito (regla ESLint).
- Prettier: comillas simples, sin `;`, `trailingComma: es5`, ancho 100, tab 2.
- Alias de import: `@/*` → `src/*`.

## Documentación del proyecto

En la raíz del repo padre (un nivel arriba): `01` brief · `02` roadmap/HUs · `03`
tech spec · `04` design system.

## Auth (HU-06 / HU-07)

- **Flujo:** `(auth)/welcome` → `register` → `verify-email` · `login` →
  `forgot-password`. Con sesión activa el guard manda a `(tabs)`.
- **`src/hooks/useAuth.ts`** — única fuente de verdad de auth: se suscribe una
  sola vez a `onAuthStateChange` y expone `signIn`, `signUp`, `signOut`,
  `resetPassword`, `resendVerificationEmail` + `user`, `profile`, `isPremium`,
  `isLoading`. Todas devuelven `AuthResult` (`{ ok, error }`), nunca lanzan.
- **`src/hooks/useAuthDeepLink.ts`** — completa la sesión al volver del correo de
  Supabase (`mecai://auth/callback`). Soporta flujo implícito y PKCE.
- **Errores:** `getAuthErrorMessage()` (`src/utils/format.utils.ts`) traduce los
  errores de GoTrue a español. **Nunca mostrar el error crudo al usuario.**
- **Supabase remoto:** "Confirm email" está **ON** → tras `signUp` NO hay sesión
  hasta que el usuario abre el enlace. Google OAuth sigue deshabilitado.
- Para que los correos vuelvan a la app hay que tener `mecai://auth/callback` (y
  la URL de Expo Go) en **Authentication → URL Configuration → Redirect URLs**.

## Estado

Épica 1 — **HU-03 (setup) ✅**, **HU-04 (Supabase) ✅** (BD + RLS + seed aplicados al
remoto; Edge Functions escritas — deploy pendiente de un access token del CLI).
Épica 2 — **HU-06 (registro) ✅**, **HU-07 (login + sesión) ✅** (falta Google OAuth,
pendiente de configurar Google Cloud). Siguiente: HU-05 (cuentas/EAS), HU-08
(registro de vehículo).
