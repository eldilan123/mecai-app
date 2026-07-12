# `src/services/` — Comunicación con servicios externos

Capa que aísla la app de los SDKs de terceros. La app **nunca** llama a Claude
API directamente: siempre pasa por la Edge Function de Supabase.

| Archivo            | Responsabilidad                            |
| ------------------ | ------------------------------------------ |
| `supabase.ts`      | Cliente Supabase + helpers (HU-04)         |
| `claude.ts`        | Llamadas a la Edge Function de IA (HU-09+) |
| `notifications.ts` | Expo Notifications (HU-13)                 |
| `revenuecat.ts`    | Suscripciones premium (HU-15)              |
| `admob.ts`         | Publicidad (HU-15)                         |
