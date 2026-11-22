// HANKX Finanças — cria a assinatura no Mercado Pago e devolve o link de pagamento.
// Segredos necessários (Supabase → Edge Functions → Secrets): MP_ACCESS_TOKEN, APP_URL (opcional)
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const PLANS: Record<string, { amount: number; freq: number; reason: string }> = {
  mensal: { amount: 9.9, freq: 1, reason: 'HANKX Finanças Premium — mensal' },
  anual: { amount: 89.9, freq: 12, reason: 'HANKX Finanças Premium — anual' },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return json({ error: 'Faça login para assinar.' }, 401);

    const { plan } = await req.json();
    const P = PLANS[plan];
    if (!P) return json({ error: 'Plano inválido.' }, 400);

    const appUrl = Deno.env.get('APP_URL') ?? 'https://www.hankx.com.br/app/';
    const r = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: { Authorization: `Bearer ${Deno.env.get('MP_ACCESS_TOKEN')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reason: P.reason,
        external_reference: `${user.id}|${plan}`,
        payer_email: user.email,
        back_url: `${appUrl}?pago=1`,
        auto_recurring: { frequency: P.freq, frequency_type: 'months', transaction_amount: P.amount, currency_id: 'BRL' },
        status: 'pending',
      }),
    });
    const j = await r.json();
    if (!r.ok) return json({ error: j.message || 'Erro no Mercado Pago.', detail: j }, 502);
    return json({ url: j.init_point, id: j.id });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
