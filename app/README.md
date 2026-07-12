# `app/` — Rutas (Expo Router)

Routing basado en archivos. Cada archivo `.tsx` es una pantalla; cada carpeta
es un segmento de ruta. Los grupos entre paréntesis `(grupo)` no aparecen en la
URL, solo organizan layouts.

| Carpeta / archivo | Contenido                                            |
| ----------------- | ---------------------------------------------------- |
| `_layout.tsx`     | Root layout: providers globales + auth guard         |
| `index.tsx`       | Entrada temporal (placeholder de HU-03)              |
| `(auth)/`         | Bienvenida, login, registro (HU-06, HU-07)           |
| `(onboarding)/`   | Registro de vehículo + onboarding IA (HU-08, HU-09)  |
| `(tabs)/`         | App principal: home, asistente, historial, perfil    |
| `maintenance/`    | Detalle (`[id].tsx`) y alta manual de mantenimientos |

> Nota: las pantallas concretas se crean en sus HUs respectivas. En HU-03 solo
> queda la estructura.
