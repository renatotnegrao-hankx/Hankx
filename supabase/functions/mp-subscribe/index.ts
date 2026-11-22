// HANKX Finanças — abre o pagamento no Mercado Pago.
// mensal/anual: assinatura recorrente (preapproval). vitalicio: pagamento único (Checkout Pro, aceita Pix).
// Segredos (Edge Functions → Secrets): MP_ACCESS_TOKEN, APP_URL (opcional)
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
export const PLANS: Record<string, { amount: number; freq?: number; title: string }> = {
  mensal: { amount: 9.9, freq: 1, title: 'HANKX Finanças Premium — mensal' },
  anual: { amount: 89.9, freq: 12, title: 'HANKX Finanças Premium — anual' },
  vitalicio: { amount: 199.9, title: 'HANKX Finanças Premium — vitalício' },
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
    const token = Deno.env.get('MP_ACCESS_TOKEN');
    const ref = `${user.id}|${plan}`;
    const hook = `${Deno.env.get('SUPABASE_URL')}/functions/v1/mp-webhook`;
    let r: Response;
    if (plan === 'vitalicio') {
      r = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ title: P.title, quantity: 1, unit_price: P.amount, currency_id: 'BRL' }],
          payer: { email: user.email }, external_reference: ref, notification_url: hook,
          back_urls: { success: `${appUrl}?pago=1`, pending: `${appUrl}?pago=1`, failure: appUrl }, auto_return: 'approved',
        }),
      });
    } else {
      r = await fetch('https://api.mercadopago.com/preapproval', {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: P.title, external_reference: ref, payer_email: user.email, back_url: `${appUrl}?pago=1`,
          auto_recurring: { frequency: P.freq, frequency_type: 'months', transaction_amount: P.amount, currency_id: 'BRL' },
          status: 'pending',
        }),
      });
    }
    const j = await r.json();
    if (!r.ok) return json({ error: j.message || 'Erro no Mercado Pago.', detail: j }, 502);
    return json({ url: j.init_point, id: j.id });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
