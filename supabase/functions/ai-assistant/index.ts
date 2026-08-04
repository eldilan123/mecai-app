// supabase/functions/ai-assistant/index.ts
//
// Proxy a la API de Claude. La app NUNCA llama a Claude directamente: siempre
// pasa por esta Edge Function, que verifica auth, aplica rate limiting por tier
// y protege la API key (server-side).
//
// Basado en el tech spec v2.0 §6. Cambio vs. spec: el modelo premium
// 'claude-sonnet-4-6' quedó superseded → se usa 'claude-sonnet-5' (Sonnet vigente).
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const FREE_TIER_MONTHLY_LIMIT = 5
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { messages, vehicleId, conversationType } = await req.json()

    // Auth
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    const authHeader = req.headers.get('Authorization')!
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    // Perfil y verificación de tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, monthly_ai_queries_used, monthly_queries_reset_at')
      .eq('id', user.id)
      .single()

    if (!profile) throw new Error('Profile not found')

    // Reset mensual si corresponde
    const resetDate = new Date(profile.monthly_queries_reset_at)
    const now = new Date()
    if (now.getFullYear() > resetDate.getFullYear() || now.getMonth() > resetDate.getMonth()) {
      await supabase
        .from('profiles')
        .update({
          monthly_ai_queries_used: 0,
          monthly_queries_reset_at: now.toISOString(),
        })
        .eq('id', user.id)
      profile.monthly_ai_queries_used = 0
    }

    // Rate limit para free
    if (
      profile.subscription_tier === 'free' &&
      profile.monthly_ai_queries_used >= FREE_TIER_MONTHLY_LIMIT
    ) {
      return new Response(
        JSON.stringify({
          error: 'limit_reached',
          used: profile.monthly_ai_queries_used,
          limit: FREE_TIER_MONTHLY_LIMIT,
        }),
        { status: 429, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    // Contexto del vehículo
    let vehicleContext = ''
    if (vehicleId) {
      const { data: vehicle } = await supabase
        .from('vehicles')
        .select(
          `
          *,
          maintenance_records (
            name, performed_at, km_at_service, maintenance_type_id
          )
        `
        )
        .eq('id', vehicleId)
        .eq('user_id', user.id)
        .single()

      if (vehicle) {
        vehicleContext = `
VEHÍCULO DEL USUARIO:
- ${vehicle.brand} ${vehicle.model} ${vehicle.year}
- Kilometraje actual: ${vehicle.current_km.toLocaleString()} km
- Tipo: ${vehicle.type}

HISTORIAL DE MANTENIMIENTOS REGISTRADOS:
${
  vehicle.maintenance_records
    .map(
      (r: { name: string; performed_at: string; km_at_service: number | null }) =>
        `- ${r.name}: ${new Date(r.performed_at).toLocaleDateString('es-CO')} (${
          r.km_at_service?.toLocaleString() ?? 'km desconocido'
        })`
    )
    .join('\n') || 'Sin registros aún.'
}
        `
      }
    }

    // Selección de modelo según tier y tipo de consulta
    // Haiku para operaciones frecuentes; Sonnet (vigente) para diagnóstico premium.
    const model =
      profile.subscription_tier === 'premium' && conversationType === 'diagnosis'
        ? 'claude-sonnet-5'
        : 'claude-haiku-4-5-20251001'

    const systemPrompt = `Eres MecAI, el asistente de mantenimiento vehicular más útil de Latinoamérica.
Tu misión: empoderar al usuario para que entienda su vehículo, tome decisiones informadas y no se deje embalar por mecánicos deshonestos.

${vehicleContext}

REGLAS DE RESPUESTA:
- Español latinoamericano informal y cálido. Nunca jerga técnica sin explicarla.
- Respuestas concisas — máximo 150 palabras salvo que el usuario pida más detalle
- Cuando haya urgencia, sé directo: 🔴 Urgente, 🟡 Revisar pronto, 🟢 Puede esperar
- Si mencionas costos, usa pesos colombianos (COP) como referencia base
- Si el problema podría ser peligroso, dilo claramente y recomienda ir a un taller
- Nunca inventes especificaciones técnicas que no conoces — di "depende del modelo específico"
- Eres un aliado del usuario, no del mecánico`

    // Llamada a Claude
    // TODO: CLAUDE_API_KEY pendiente de HU-05 — hasta entonces esta llamada
    // fallará en runtime (por ahora se despliega con un secret placeholder).
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('CLAUDE_API_KEY')!, // TODO: CLAUDE_API_KEY pendiente de HU-05
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 600,
        system: systemPrompt,
        messages,
      }),
    })

    const claudeData = await claudeRes.json()

    // Incrementar contador
    if (profile.subscription_tier === 'free') {
      await supabase
        .from('profiles')
        .update({ monthly_ai_queries_used: profile.monthly_ai_queries_used + 1 })
        .eq('id', user.id)
    }

    return new Response(JSON.stringify(claudeData), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'internal_error', detail: (err as Error)?.message ?? String(err) }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }
})
