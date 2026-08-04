// supabase/functions/calculate-schedules/index.ts
//
// Cron: recalcula la tabla maintenance_schedules (próximos mantenimientos) para
// uno o todos los vehículos activos. No es user-facing: solo se invoca con la
// service_role key (cron job de Supabase).
//
// El tech spec v2.0 no define el algoritmo exacto, así que se implementa una
// versión razonable y documentada. Reglas de cálculo abajo.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Umbrales para marcar "due_soon" (revisar pronto)
const DUE_SOON_KM = 500 // faltan <= 500 km
const DUE_SOON_DAYS = 14 // faltan <= 14 días

type MaintenanceType = {
  id: string
  slug: string
  default_interval_km: number | null
  default_interval_months: number | null
  applicable_to: string[]
}

type MaintenanceRecord = {
  maintenance_type_id: string | null
  performed_at: string
  km_at_service: number | null
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    // Auth: solo service_role (cron). Comparamos el bearer con la service key.
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const authHeader = req.headers.get('Authorization') ?? ''
    if (authHeader.replace('Bearer ', '') !== serviceKey) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, serviceKey)

    // Permite recalcular un solo vehículo (?vehicleId) o todos los activos.
    let vehicleId: string | undefined
    try {
      const body = await req.json()
      vehicleId = body?.vehicleId
    } catch {
      // Sin body → recalcular todos
    }

    // Catálogo de tipos de mantenimiento (datos maestros)
    const { data: types } = await supabase
      .from('maintenance_types')
      .select('id, slug, default_interval_km, default_interval_months, applicable_to')
      .eq('is_active', true)

    if (!types) throw new Error('No maintenance_types found')

    // Vehículos a procesar
    let vehiclesQuery = supabase
      .from('vehicles')
      .select('id, user_id, type, current_km')
      .eq('is_active', true)
    if (vehicleId) vehiclesQuery = vehiclesQuery.eq('id', vehicleId)

    const { data: vehicles } = await vehiclesQuery
    if (!vehicles) throw new Error('No vehicles found')

    const today = new Date()
    let upserted = 0

    for (const vehicle of vehicles) {
      // Último registro por tipo de mantenimiento para este vehículo
      const { data: records } = await supabase
        .from('maintenance_records')
        .select('maintenance_type_id, performed_at, km_at_service')
        .eq('vehicle_id', vehicle.id)
        .eq('is_deleted', false)
        .order('performed_at', { ascending: false })

      const lastByType = new Map<string, MaintenanceRecord>()
      for (const r of (records ?? []) as MaintenanceRecord[]) {
        if (r.maintenance_type_id && !lastByType.has(r.maintenance_type_id)) {
          lastByType.set(r.maintenance_type_id, r)
        }
      }

      for (const type of types as MaintenanceType[]) {
        // Saltar tipos que no aplican a este tipo de vehículo
        if (!type.applicable_to.includes(vehicle.type)) continue

        const last = lastByType.get(type.id)

        // Próximo por km: último km de servicio + intervalo
        let dueKm: number | null = null
        if (type.default_interval_km != null) {
          const baseKm = last?.km_at_service ?? 0
          dueKm = baseKm + type.default_interval_km
        }

        // Próximo por fecha: última fecha + intervalo en meses
        let dueDate: Date | null = null
        if (type.default_interval_months != null) {
          const baseDate = last ? new Date(last.performed_at) : today
          dueDate = new Date(baseDate)
          dueDate.setMonth(dueDate.getMonth() + type.default_interval_months)
        }

        // Estado: 'overdue' si ya venció por km o fecha; 'due_soon' si está cerca;
        // 'ok' si falta; 'unknown' si no hay datos de intervalo para calcular.
        let status: 'ok' | 'due_soon' | 'overdue' | 'unknown' = 'unknown'
        if (dueKm != null || dueDate != null) {
          const kmOverdue = dueKm != null && vehicle.current_km >= dueKm
          const dateOverdue = dueDate != null && today >= dueDate
          const kmSoon = dueKm != null && dueKm - vehicle.current_km <= DUE_SOON_KM
          const daysToDue =
            dueDate != null
              ? Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
              : null
          const dateSoon = daysToDue != null && daysToDue <= DUE_SOON_DAYS

          if (kmOverdue || dateOverdue) status = 'overdue'
          else if (kmSoon || dateSoon) status = 'due_soon'
          else status = 'ok'
        }

        // Upsert del schedule (único por vehicle_id + maintenance_type_id)
        const { error: upsertError } = await supabase.from('maintenance_schedules').upsert(
          {
            vehicle_id: vehicle.id,
            user_id: vehicle.user_id,
            maintenance_type_id: type.id,
            due_km: dueKm,
            due_date: dueDate ? dueDate.toISOString().slice(0, 10) : null,
            status,
            last_record_id: null,
            last_calculated_at: today.toISOString(),
          },
          { onConflict: 'vehicle_id,maintenance_type_id' }
        )
        if (!upsertError) upserted++
      }
    }

    return new Response(
      JSON.stringify({ ok: true, vehicles: vehicles.length, schedules_upserted: upserted }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'internal_error', detail: (err as Error)?.message ?? String(err) }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }
})
