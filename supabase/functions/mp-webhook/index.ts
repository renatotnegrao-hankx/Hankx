// HANKX Finanças — recebe avisos do Mercado Pago, libera o Premium e registra a receita.
// IMPORTANTE: desligue "Enforce JWT verification" nesta função.
// Segredos: MP_ACCESS_TOKEN. A situação é sempre consultada na API do Mercado Pago (aviso falso não libera nada).
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const url = new URL(req.url);
  let body: any = {};
  try { body = await req.json(); } catch { /* sem corpo */ }
  const type = String(body.type || body.topic || url.searchParams.get('type') || url.searchParams.get('topic') || '');
  const id = body?.data?.id || url.searchParams.get('data.id') || url.searchParams.get('id');
  if (!id) return new Response('sem id', { status: 200 });

  const token = Deno.env.get('MP_ACCESS_TOKEN')!;
  const mp = (p: string) => fetch('https://api.mercadopago.com' + p, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const emailOf = async (uid: string) => (await admin.from('profiles').select('email').eq('id', uid).maybeSingle()).data?.email ?? null;
  const record = async (uid: string, plan: string, amount: number, extId: string, payload: unknown) => {
    await admin.from('payments').upsert({ user_id: uid, email: await emailOf(uid), provider: 'mercadopago', plan, amount, status: 'approved', external_id: 'mp:' + extId, payload },
      { onConflict: 'external_id', ignoreDuplicates: true });
  };

  // Pagamento único (vitalício)
  if (type === 'payment' || type.includes('payment') && !type.includes('authorized')) {
    const p = await mp(`/v1/payments/${id}`);
    const [uid, plan] = String(p?.external_reference || '').split('|');
    if (uid && plan === 'vitalicio' && p.status === 'approved') {
      await record(uid, plan, Number(p.transaction_amount) || 199.9, String(p.id), p);
      await admin.from('profiles').update({ premium_until: '9999-12-31T00:00:00Z', plan: 'vitalicio', provider: 'mercadopago', provider_ref: String(p.id) }).eq('id', uid);
    }
    return new Response('ok', { status: 200 });
  }

  // Assinaturas (mensal / anual)
  let pre: any = null, ap: any = null;
  if (type.includes('preapproval')) pre = await mp(`/preapproval/${id}`);
  else if (type.includes('authorized_payment')) {
    ap = await mp(`/authorized_payments/${id}`);
    if (ap?.preapproval_id) pre = await mp(`/preapproval/${ap.preapproval_id}`);
  }
  if (!pre?.external_reference) return new Response('ignorado', { status: 200 });
  const [uid, plan] = String(pre.external_reference).split('|');

  if (ap && (ap.payment?.status === 'approved' || ap.status === 'processed')) {
    await record(uid, plan, Number(ap.transaction_amount) || (plan === 'anual' ? 89.9 : 9.9), String(ap.id), ap);
  }
  if (pre.status === 'authorized') {
    const until = pre.next_payment_date ? new Date(pre.next_payment_date) : new Date();
    if (!pre.next_payment_date) until.setMonth(until.getMonth() + (plan === 'anual' ? 12 : 1));
    until.setDate(until.getDate() + 3); // folga para a cobrança cair
    await admin.from('profiles').update({ premium_until: until.toISOString(), plan, provider: 'mercadopago', provider_ref: pre.id }).eq('id', uid);
  }
  return new Response('ok', { status: 200 });
});
