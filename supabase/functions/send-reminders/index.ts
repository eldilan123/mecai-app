// supabase/functions/send-reminders/index.ts
//
// Cron: envía recordatorios push de mantenimientos próximos. Solo service_role.
//
// STUB (HU-04): por ahora solo consulta los schedules en ventana de notificación
// y hace console.log. La integración real con FCM/APNs y el marcado de
// notified_* viene en HU-13.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    // Auth: solo service_role (cron)
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const authHeader = req.headers.get('Authorization') ?? ''
    if (authHeader.replace('Bearer ', '') !== serviceKey) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, serviceKey)

    const today = new Date()
    const twoWeeks = new Date(today)
    twoWeeks.setDate(today.getDate() + 14)
    const toDate = (d: Date) => d.toISOString().slice(0, 10)

    // Schedules cuya fecha estimada cae dentro de las próximas 2 semanas.
    // Cada ventana concreta (2 semanas / 3 días / día de) y el anti-duplicado
    // (notified_two_weeks, notified_three_days, notified_day_of) se manejan en HU-13.
    const { data: dueSchedules } = await supabase
      .from('maintenance_schedules')
      .select('id, user_id, vehicle_id, maintenance_type_id, due_date, status')
      .in('status', ['due_soon', 'overdue'])
      .gte('due_date', toDate(today))
      .lte('due_date', toDate(twoWeeks))

    // TODO: HU-13 - integración FCM/APNs (enviar push + marcar notified_*).
    console.log(
      `[send-reminders] ${dueSchedules?.length ?? 0} schedules en ventana de notificación`
    )

    return new Response(
      JSON.stringify({ ok: true, pending_notifications: dueSchedules?.length ?? 0 }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'internal_error', detail: (err as Error)?.message ?? String(err) }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }
})
