-- ============================================================
-- MIGRACIÓN 004: Seed data — maintenance_types (MecAI)
-- Fuente: tech spec v2.0 §5. 17 tipos de mantenimiento. Copiado al pie de la letra.
-- ============================================================

INSERT INTO maintenance_types
  (slug, name_es, name_en, category, default_interval_km, default_interval_months, urgency_level, applicable_to, icon_name, color_hint)
VALUES
  ('oil_change',       'Cambio de aceite',          'Oil change',           'engine',    5000,  6,  'high',     '{car,motorcycle,truck,van,suv}', 'Droplets',  '#F08C1F'),
  ('oil_filter',       'Filtro de aceite',           'Oil filter',           'filters',   5000,  6,  'high',     '{car,motorcycle,truck,van,suv}', 'Filter',    '#F08C1F'),
  ('air_filter',       'Filtro de aire',             'Air filter',           'filters',   15000, 12, 'medium',   '{car,motorcycle,truck,van,suv}', 'Wind',      '#3B82F6'),
  ('brake_pads',       'Pastillas de freno',         'Brake pads',           'brakes',    30000, NULL,'critical', '{car,truck,van,suv}',           'CircleStop','#EF4444'),
  ('tire_rotation',    'Rotación de llantas',        'Tire rotation',        'tires',     10000, 6,  'medium',   '{car,truck,van,suv}',           'RefreshCw', '#8B5CF6'),
  ('timing_belt',      'Correa de distribución',     'Timing belt',          'engine',    80000, 48, 'critical', '{car,truck,van,suv}',           'Settings2', '#EF4444'),
  ('timing_chain',     'Cadena de distribución',     'Timing chain',         'engine',    120000,NULL,'high',    '{car,motorcycle,truck,van,suv}', 'Settings2', '#F59E0B'),
  ('spark_plugs',      'Bujías',                     'Spark plugs',          'engine',    30000, 24, 'medium',   '{car,motorcycle,truck,van,suv}', 'Zap',       '#F59E0B'),
  ('brake_fluid',      'Líquido de frenos',          'Brake fluid',          'fluids',    20000, 24, 'high',     '{car,motorcycle,truck,van,suv}', 'Gauge',     '#EF4444'),
  ('coolant',          'Refrigerante (anticongelante)','Coolant',            'fluids',    40000, 24, 'medium',   '{car,truck,van,suv}',           'Thermometer','#3B82F6'),
  ('battery_check',    'Revisión de batería',        'Battery check',        'electrical',NULL,  12, 'medium',   '{car,motorcycle,truck,van,suv}', 'Battery',   '#F59E0B'),
  ('alignment',        'Alineación y balanceo',      'Wheel alignment',      'tires',     10000, 6,  'low',      '{car,truck,van,suv}',           'Target',    '#22C55E'),
  ('general_service',  'Servicio general',           'General service',      'general',   NULL,  12, 'medium',   '{car,motorcycle,truck,van,suv}', 'Wrench',    '#6B7280'),
  ('transmission_oil', 'Aceite de transmisión',      'Transmission oil',     'fluids',    40000, 36, 'medium',   '{car,truck,van,suv}',           'Cog',       '#8B5CF6'),
  ('clutch',           'Revisión de embrague',       'Clutch check',         'engine',    60000, NULL,'high',    '{car,motorcycle,truck,van}',    'Layers',    '#F59E0B'),
  ('cabin_filter',     'Filtro de habitáculo',       'Cabin air filter',     'filters',   15000, 12, 'low',      '{car,truck,van,suv}',           'Wind',      '#22C55E'),
  ('wiper_blades',     'Plumillas limpiaparabrisas', 'Wiper blades',         'general',   NULL,  12, 'low',      '{car,truck,van,suv}',           'Droplets',  '#6B7280');
