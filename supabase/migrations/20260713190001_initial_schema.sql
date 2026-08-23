-- ============================================================
-- MIGRACIÓN 001: Esquema inicial (MecAI)
-- Fuente: tech spec v2.0 §5. Copiado al pie de la letra.
-- ============================================================

-- Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para búsqueda fuzzy de marcas/modelos

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLA: profiles
-- Extiende auth.users de Supabase
-- ============================================================
CREATE TABLE profiles (
  id                        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name                 TEXT,
  email                     TEXT UNIQUE NOT NULL,
  avatar_url                TEXT,

  -- Suscripción
  subscription_tier         TEXT NOT NULL DEFAULT 'free'
                            CHECK (subscription_tier IN ('free', 'premium')),
  subscription_expires_at   TIMESTAMPTZ,
  revenuecat_customer_id    TEXT UNIQUE, -- ID de RevenueCat para sincronizar

  -- Rate limiting IA
  monthly_ai_queries_used   INTEGER NOT NULL DEFAULT 0
                            CHECK (monthly_ai_queries_used >= 0),
  monthly_queries_reset_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Configuración
  notifications_enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  notification_prefs        JSONB NOT NULL DEFAULT '{
    "two_weeks_before": true,
    "three_days_before": true,
    "day_of": true,
    "reengagement": true
  }',

  -- Canal de adquisición (para analytics)
  acquisition_source        TEXT, -- 'organic', 'school_partner', 'paid_social', etc.
  school_partner_code       TEXT, -- Código de escuela de conducción si aplica

  -- Metadatos
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Creación automática de perfil al registrarse.
-- SECURITY DEFINER: search_path explícito para evitar "relation does
-- not exist" en runtime (ver HU-04 patch). El trigger lo dispara GoTrue
-- al insertar en auth.users, y ese contexto NO trae `public` en el
-- search_path: sin esto, `profiles` no resuelve y el registro da 500.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- TABLA: vehicles
-- ============================================================
CREATE TABLE vehicles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Clasificación
  type            TEXT NOT NULL
                  CHECK (type IN ('car', 'motorcycle', 'truck', 'van', 'suv')),
  brand           TEXT NOT NULL,        -- 'Renault'
  model           TEXT NOT NULL,        -- 'Logan'
  year            SMALLINT NOT NULL
                  CHECK (year >= 1970 AND year <= EXTRACT(YEAR FROM NOW()) + 1),
  trim            TEXT,                 -- Versión/trim (opcional)

  -- Identificación
  license_plate   TEXT,
  vin             TEXT,
  color           TEXT,
  nickname        TEXT,                 -- "Mi Logan azul"

  -- Kilometraje (CRÍTICO para calcular mantenimientos)
  current_km      INTEGER NOT NULL CHECK (current_km >= 0),
  km_updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Media
  photo_url       TEXT,

  -- Estado
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  is_primary      BOOLEAN NOT NULL DEFAULT FALSE, -- El vehículo "por defecto"

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Solo puede haber un vehículo primario por usuario
CREATE UNIQUE INDEX unique_primary_vehicle
  ON vehicles (user_id) WHERE is_primary = TRUE AND is_active = TRUE;

-- ============================================================
-- TABLA: maintenance_types
-- Catálogo de tipos de mantenimiento (datos maestros)
-- ============================================================
CREATE TABLE maintenance_types (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                    TEXT UNIQUE NOT NULL,     -- 'oil_change', 'brake_pads'
  name_es                 TEXT NOT NULL,            -- 'Cambio de aceite'
  name_en                 TEXT,                     -- 'Oil change'
  description_es          TEXT,
  category                TEXT NOT NULL
                          CHECK (category IN ('engine', 'brakes', 'tires', 'electrical', 'fluids', 'filters', 'general')),

  -- Intervalos por defecto (pueden ser overrideados por modelo)
  default_interval_km     INTEGER,                  -- 5000
  default_interval_months SMALLINT,                 -- 6
  -- Urgency: cuán crítico es no hacerlo
  urgency_level           TEXT NOT NULL DEFAULT 'medium'
                          CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),

  -- Aplicabilidad
  applicable_to           TEXT[] NOT NULL DEFAULT '{car,motorcycle,truck,van,suv}',

  -- UI
  icon_name               TEXT,                     -- nombre del icono en Lucide/Phosphor
  color_hint              TEXT,                     -- hex color para el ícono en UI

  is_active               BOOLEAN NOT NULL DEFAULT TRUE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: maintenance_records
-- Historial de mantenimientos realizados
-- ============================================================
CREATE TABLE maintenance_records (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id            UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  maintenance_type_id   UUID REFERENCES maintenance_types(id),

  -- Datos del evento
  name                  TEXT NOT NULL,              -- Si es custom o copia del tipo
  performed_at          TIMESTAMPTZ NOT NULL,        -- Cuándo se hizo
  km_at_service         INTEGER CHECK (km_at_service >= 0),

  -- Economía
  cost_amount           NUMERIC(12, 2),
  cost_currency         TEXT NOT NULL DEFAULT 'COP',

  -- Proveedor
  workshop_name         TEXT,
  workshop_city         TEXT,
  workshop_notes        TEXT,

  -- Notas libres
  notes                 TEXT,
  photos                TEXT[],                     -- URLs a Supabase Storage

  -- Trazabilidad
  source                TEXT NOT NULL DEFAULT 'manual'
                        CHECK (source IN ('manual', 'ai_onboarding', 'ai_chat', 'import')),

  -- Soft delete
  is_deleted            BOOLEAN NOT NULL DEFAULT FALSE,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER maintenance_records_updated_at
  BEFORE UPDATE ON maintenance_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TABLA: maintenance_schedules
-- Próximos mantenimientos calculados (recalculados por cron)
-- ============================================================
CREATE TABLE maintenance_schedules (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id            UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  maintenance_type_id   UUID NOT NULL REFERENCES maintenance_types(id),

  -- Cuándo toca
  due_date              DATE,
  due_km                INTEGER,

  -- Estado calculado
  status                TEXT NOT NULL DEFAULT 'ok'
                        CHECK (status IN ('ok', 'due_soon', 'overdue', 'unknown')),

  -- Referencia al último mantenimiento de este tipo
  last_record_id        UUID REFERENCES maintenance_records(id),

  -- Notificaciones enviadas (evitar duplicados)
  notified_two_weeks    BOOLEAN NOT NULL DEFAULT FALSE,
  notified_three_days   BOOLEAN NOT NULL DEFAULT FALSE,
  notified_day_of       BOOLEAN NOT NULL DEFAULT FALSE,

  -- Recalculado en cada cambio de km o nuevo registro
  last_calculated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Un schedule por tipo por vehículo
  UNIQUE (vehicle_id, maintenance_type_id)
);

CREATE TRIGGER maintenance_schedules_updated_at
  BEFORE UPDATE ON maintenance_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TABLA: ai_conversations
-- Historial de chats con el asistente IA
-- ============================================================
CREATE TABLE ai_conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_id      UUID REFERENCES vehicles(id) ON DELETE SET NULL,

  type            TEXT NOT NULL DEFAULT 'chat'
                  CHECK (type IN ('onboarding', 'chat', 'diagnosis', 'no_te_embales')),

  title           TEXT,                   -- Resumen auto-generado de la conv
  messages        JSONB NOT NULL DEFAULT '[]',
  -- Estructura de cada mensaje:
  -- { role: 'user'|'assistant', content: string, timestamp: ISO string }

  -- Analytics
  query_count     SMALLINT NOT NULL DEFAULT 0,
  was_useful      BOOLEAN,                -- Feedback del usuario (thumb up/down)

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER ai_conversations_updated_at
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TABLA: school_partners
-- Escuelas de conducción aliadas
-- ============================================================
CREATE TABLE school_partners (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  city            TEXT NOT NULL,
  contact_name    TEXT,
  contact_email   TEXT,
  contact_phone   TEXT,
  promo_code      TEXT UNIQUE NOT NULL,   -- Código que usan los estudiantes
  premium_days    SMALLINT NOT NULL DEFAULT 30, -- Días de premium gratis
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
