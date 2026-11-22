// HANKX Finanças — recebe os avisos do Mercado Pago e libera/renova o Premium.
// IMPORTANTE: nesta função, DESLIGUE "Enforce JWT verification" (o Mercado Pago não envia login).
// Segredos: MP_ACCESS_TOKEN (SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY já existem automaticamente)
// A situação é sempre consultada de novo na API do Mercado Pago, então um aviso falso não libera nada.
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const url = new URL(req.url);
  let body: any = {};
  try { body = await req.json(); } catch { /* sem corpo */ }
  const type = body.type || body.topic || url.searchParams.get('type') || url.searchParams.get('topic') || '';
  const id = body?.data?.id || url.searchParams.get('data.id') || url.searchParams.get('id');
  if (!id) return new Response('sem id', { status: 200 });

  const token = Deno.env.get('MP_ACCESS_TOKEN')!;
  const mp = (p: string) => fetch('https://api.mercadopago.com' + p, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  let pre: any = null;
  if (type.includes('preapproval')) pre = await mp(`/preapproval/${id}`);
  else if (type.includes('authorized_payment')) {
    const ap = await mp(`/authorized_payments/${id}`);
    if (ap?.preapproval_id) pre = await mp(`/preapproval/${ap.preapproval_id}`);
  }
  if (!pre?.external_reference) return new Response('ignorado', { status: 200 });

  const [uid, plan] = String(pre.external_reference).split('|');
  await admin.from('payments_log').insert({ user_id: uid, provider: 'mercadopago', event: `${type}:${pre.status}`, payload: pre });

  if (pre.status === 'authorized') {
    let until = pre.next_payment_date ? new Date(pre.next_payment_date) : new Date();
    if (!pre.next_payment_date) until.setMonth(until.getMonth() + (plan === 'anual' ? 12 : 1));
    until.setDate(until.getDate() + 3); // 3 dias de folga para a cobrança cair
    await admin.from('profiles').update({ premium_until: until.toISOString(), plan, provider: 'mercadopago', provider_ref: pre.id }).eq('id', uid);
  }
  // Cancelada/pausada: o Premium continua até o fim do período já pago (premium_until não muda).
  return new Response('ok', { status: 200 });
});
