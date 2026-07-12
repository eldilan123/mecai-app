# MecAI 📱🔧

**Tu mecánico inteligente, siempre en tu bolsillo.**

MecAI es una app móvil de mantenimiento vehicular con IA para Latinoamérica.
Ayuda a personas que tienen carro o moto pero no saben de mecánica a entender su
vehículo, anticipar fallas y no dejarse "embalar" en el taller.

> Este repositorio corresponde a la **app móvil** (Épica 1 — HU-03: setup de
> repositorio y estructura de proyecto).

---

## 🧱 Stack tecnológico

| Capa          | Tecnología                                           |
| ------------- | ---------------------------------------------------- |
| Mobile        | React Native + **Expo SDK 56**                       |
| Lenguaje      | TypeScript (strict)                                  |
| Navegación    | Expo Router (file-based)                             |
| Estilos       | **NativeWind v4** (Tailwind para RN) + design tokens |
| Estado global | Zustand _(se integra en HUs posteriores)_            |
| Backend / DB  | Supabase _(HU-04)_                                   |
| IA            | Claude API vía Supabase Edge Function _(HU-09+)_     |
| Fuentes       | Sora · Inter · JetBrains Mono (`@expo-google-fonts`) |
| Calidad       | ESLint (strict) · Prettier · Husky · lint-staged     |

> ℹ️ El tech spec original asumía Expo SDK 52 / TS 5.x / Expo Router v4. El
> proyecto se generó con `create-expo-app@latest`, que entrega **SDK 56** (cumple
> el requisito "52+"). Los design tokens provienen del **Design System v2.0**, no
> del tech spec (ver nota en `src/constants/theme.ts`).

---

## ✅ Requisitos previos

- **Node.js 20+** (probado con 20.20)
- **npm 10+**
- **Expo CLI** (se usa vía `npx`, no requiere instalación global)
- App **Expo Go** en tu celular, o un emulador Android / simulador iOS

---

## 🚀 Setup local

```bash
# 1. Clonar
git clone <url-del-repo> mecai-app
cd mecai-app

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
#   → edita .env con tus claves (Supabase, RevenueCat, AdMob)
#   Las claves de servidor (Claude, service role, FCM) NO van aquí: van en
#   Supabase Edge Functions (HU-04).

# 4. Arrancar
npm run start
#   → escanea el QR con Expo Go, o presiona "a" (Android) / "i" (iOS) / "w" (web)
```

---

## 📜 Comandos disponibles

| Comando                | Descripción                               |
| ---------------------- | ----------------------------------------- |
| `npm run start`        | Inicia el servidor de desarrollo de Expo  |
| `npm run android`      | Abre en emulador / dispositivo Android    |
| `npm run ios`          | Abre en simulador iOS (requiere macOS)    |
| `npm run web`          | Abre en navegador                         |
| `npm run lint`         | ESLint sobre todo el proyecto             |
| `npm run lint:fix`     | ESLint con auto-fix                       |
| `npm run format`       | Formatea con Prettier (escribe)           |
| `npm run format:check` | Verifica formato sin escribir             |
| `npm run typecheck`    | Type-check de TypeScript (`tsc --noEmit`) |

> **Pre-commit:** Husky corre `lint-staged` (eslint --fix + prettier) sobre los
> archivos staged antes de cada commit.

---

## 📁 Estructura de carpetas

```
mecai-app/
├── app/                  # Rutas (Expo Router)
│   ├── (auth)/           # Bienvenida, login, registro
│   ├── (onboarding)/     # Registro de vehículo + onboarding IA
│   ├── (tabs)/           # App principal: home, asistente, historial, perfil
│   ├── maintenance/      # Detalle / alta de mantenimientos
│   ├── _layout.tsx       # Root layout (fuentes + providers + auth guard)
│   └── index.tsx         # Entrada temporal (placeholder HU-03)
├── src/
│   ├── components/       # ui · chat · vehicle · maintenance
│   ├── services/         # supabase · claude · notifications · revenuecat · admob
│   ├── store/            # Zustand (auth · vehicle · chat)
│   ├── hooks/            # Custom hooks
│   ├── types/            # Tipos TS
│   ├── utils/            # Helpers puros + schemas Zod
│   ├── constants/        # theme.ts (design tokens) · vehicles · maintenance
│   └── global.css        # Directivas de Tailwind (NativeWind)
├── supabase/             # migrations · functions  (HU-04)
├── assets/               # logo · icons · illustrations · fonts · images
├── tailwind.config.js    # Tokens del design system para NativeWind
├── babel.config.js       # babel-preset-expo + nativewind
├── metro.config.js       # withNativeWind
├── eslint.config.js      # ESLint flat config (strict)
├── .prettierrc           # Reglas de Prettier
└── .env.example          # Variables de entorno documentadas
```

Cada carpeta principal incluye su propio `README.md` describiendo qué va dentro.

---

## 🎨 Design System

Los tokens (colores, tipografía, espaciado, radios) viven en dos lugares
**sincronizados**:

- `tailwind.config.js` → para usar con `className` (NativeWind)
- `src/constants/theme.ts` → para usar desde código TS

Fuente de verdad: **Design System v2.0** (`../04-mecai-design-system.md`).
Color de marca: verde petróleo `#1F6B5E` (`primary-600`). Acento: naranja cálido
`#E8780A` (`accent-600`).

---

## 📚 Documentación interna del proyecto

Vive en la raíz del repositorio padre (un nivel arriba de `mecai-app/`):

- `01-mecia-project-brief-v2.md` — visión, mercado, modelo de negocio
- `02-mecia-roadmap-epicas-historias.md` — roadmap, épicas e historias de usuario
- `03-mecia-tech-spec-v2.md` — especificación técnica (stack, BD, arquitectura)
- `04-mecai-design-system.md` — sistema de diseño, paleta, tipografía, logo

> Nota de naming: el nombre vigente del producto es **MecAI**. Los archivos 02 y
> 03 conservan el nombre viejo "MecIA" en su título, pero el código usa MecAI.

---

## 🗺️ Estado del proyecto

**Épica 1 — HU-03 (setup):** ✅ completada en este repo.
Siguiente: HU-04 (Supabase + BD), HU-05 (cuentas y EAS), HU-06+ (features).
