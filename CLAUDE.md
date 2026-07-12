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

- **Expo SDK 56** · React 19 · React Native 0.85 · **TypeScript 6** (strict)
- **Expo Router** (file-based, carpeta `app/` en la raíz)
- **NativeWind v4** + **Tailwind v3** para estilos
- **Zustand** para estado global (se integra en HUs de features)
- Backend **Supabase** (HU-04) · IA **Claude API** vía Edge Function (HU-09+)
- Fuentes: **Sora / Inter / JetBrains Mono** (`@expo-google-fonts`)

> El tech spec (`03`) asumía SDK 52 / TS 5 / Expo Router v4; `create-expo-app@latest`
> entrega SDK 56, que cumple el requisito "52+". Donde el spec y la realidad de la
> librería difieran, gana la realidad de la librería (avísale a Dilan si es grande).

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
  `maintenance/`. El root layout carga fuentes y (a futuro) providers + auth guard.
- `src/components/{ui,chat,vehicle,maintenance}/` — componentes. `ui/` = primitivos
  del design system.
- `src/services/` — SDKs externos (supabase, claude, notifications, revenuecat, admob).
  **La app nunca llama a Claude directo**: siempre vía Edge Function.
- `src/store/` — Zustand (`*.store.ts`). `src/hooks/` — `useX.ts`.
  `src/types/` — `*.types.ts`. `src/utils/` — helpers puros + schemas Zod.
- `src/constants/theme.ts` — design tokens en TS. `tailwind.config.js` — los mismos
  tokens para `className`. **Mantener ambos sincronizados.**
- `supabase/` — migrations + edge functions (HU-04). `assets/` — logo, icons, etc.

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

## Estado

Épica 1 — **HU-03 (setup) ✅**. Pendiente manual de Dilan: repo remoto en GitHub,
branch protection, estrategia de ramas. Siguiente: HU-04 (Supabase), HU-05 (cuentas/EAS).
