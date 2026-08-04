-- ============================================================
-- MIGRACIÓN 003: RLS Policies (MecAI)
-- Fuente: tech spec v2.0 §5. Copiado al pie de la letra.
-- RLS activo en TODAS las tablas — los usuarios nunca ven datos de otros.
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_partners ENABLE ROW LEVEL SECURITY;

-- profiles: solo tu propio perfil
CREATE POLICY "profiles_own" ON profiles
  FOR ALL USING (auth.uid() = id);

-- vehicles: solo tus propios vehículos
CREATE POLICY "vehicles_own" ON vehicles
  FOR ALL USING (auth.uid() = user_id);

-- maintenance_records: solo tus registros
CREATE POLICY "records_own" ON maintenance_records
  FOR ALL USING (auth.uid() = user_id);

-- maintenance_schedules: solo los tuyos
CREATE POLICY "schedules_own" ON maintenance_schedules
  FOR ALL USING (auth.uid() = user_id);

-- ai_conversations: solo las tuyas
CREATE POLICY "conversations_own" ON ai_conversations
  FOR ALL USING (auth.uid() = user_id);

-- maintenance_types: lectura pública (es catálogo)
CREATE POLICY "maintenance_types_read" ON maintenance_types
  FOR SELECT USING (TRUE);

-- school_partners: solo lectura para usuarios auth (validar código)
CREATE POLICY "school_partners_read" ON school_partners
  FOR SELECT TO authenticated USING (is_active = TRUE);
