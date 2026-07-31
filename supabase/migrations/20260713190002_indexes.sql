-- ============================================================
-- MIGRACIÓN 002: Índices para performance (MecAI)
-- Fuente: tech spec v2.0 §5. Copiado al pie de la letra.
-- ============================================================

-- Queries más frecuentes de la app:
CREATE INDEX idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX idx_vehicles_user_active ON vehicles(user_id) WHERE is_active = TRUE;
CREATE INDEX idx_maintenance_records_vehicle ON maintenance_records(vehicle_id);
CREATE INDEX idx_maintenance_records_user ON maintenance_records(user_id);
CREATE INDEX idx_maintenance_records_performed ON maintenance_records(performed_at DESC);
CREATE INDEX idx_maintenance_schedules_vehicle ON maintenance_schedules(vehicle_id);
CREATE INDEX idx_maintenance_schedules_status ON maintenance_schedules(status);
CREATE INDEX idx_maintenance_schedules_due_date ON maintenance_schedules(due_date);
CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_vehicle ON ai_conversations(vehicle_id);

-- Búsqueda fuzzy de marcas/modelos
CREATE INDEX idx_vehicles_brand_trgm ON vehicles USING gin(brand gin_trgm_ops);
CREATE INDEX idx_vehicles_model_trgm ON vehicles USING gin(model gin_trgm_ops);
