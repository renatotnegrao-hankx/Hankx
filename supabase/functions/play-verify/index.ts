// HANKX Finanças — confere no Google Play uma compra feita dentro do app Android e libera o Premium.
// Segredos: GOOGLE_SERVICE_ACCOUNT (o conteúdo do arquivo .json da conta de serviço), PLAY_PACKAGE (ex.: br.com.hankx.financas)
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const b64url = (b: Uint8Array) => btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function googleToken(sa: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const enc = (o: unknown) => b64url(new TextEncoder().encode(JSON.stringify(o)));
  const unsigned = `${enc({ alg: 'RS256', typ: 'JWT' })}.${enc({
    iss: sa.client_email, scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600,
  })}`;
  const pem = sa.private_key.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned)));
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${b64url(sig)}` }),
  });
  const j = await r.json();
  if (!j.access_token) throw new Error('Falha ao autenticar no Google: ' + JSON.stringify(j));
  return j.access_token;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return json({ error: 'Faça login.' }, 401);

    const { purchaseToken } = await req.json();
    if (!purchaseToken) return json({ error: 'Compra sem token.' }, 400);

    const pkg = Deno.env.get('PLAY_PACKAGE') ?? 'br.com.hankx.financas';
    const access = await googleToken(JSON.parse(Deno.env.get('GOOGLE_SERVICE_ACCOUNT')!));
    const base = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${pkg}/purchases`;
    const r = await fetch(`${base}/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`, { headers: { Authorization: `Bearer ${access}` } });
    const s = await r.json();
    if (!r.ok) return json({ error: 'Google Play recusou a consulta.', detail: s }, 502);

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    await admin.from('payments_log').insert({ user_id: user.id, provider: 'googleplay', event: s.subscriptionState, payload: s });

    const ok = ['SUBSCRIPTION_STATE_ACTIVE', 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD'].includes(s.subscriptionState);
    const items = s.lineItems || [];
    const expiry = items.map((i: any) => i.expiryTime).sort().pop();
    const productId = items[0]?.productId || '';
    if (s.acknowledgementState === 'ACKNOWLEDGEMENT_STATE_PENDING' && productId) {
      await fetch(`${base}/subscriptions/${productId}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`, {
        method: 'POST', headers: { Authorization: `Bearer ${access}`, 'Content-Type': 'application/json' }, body: '{}',
      });
    }
    if (ok && expiry) {
      await admin.from('profiles').update({
        premium_until: expiry, plan: productId.includes('anual') ? 'anual' : 'mensal', provider: 'googleplay', provider_ref: purchaseToken,
      }).eq('id', user.id);
    }
    return json({ active: ok, until: expiry || null });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
