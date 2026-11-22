# HANKX Finanças — Premium, administrador e pagamentos

O banco (Supabase) já está ligado. Para ativar planos, painel do administrador e cobrança, faça na ordem:

## 1. Atualizar o banco (2 min)
1. Supabase → **SQL Editor** → *New query*.
2. Cole **todo** o arquivo `supabase/schema.sql` → **Run** → deve aparecer "Success".
3. Em outra *New query*, cadastre o e-mail do administrador (troque pelo seu e-mail) e clique em **Run**:
   ```sql
   insert into public.admins (email) values ('SEU-EMAIL-AQUI') on conflict do nothing;
   ```
4. Saia e entre de novo no app com esse e-mail: em **Ajustes** aparece **Painel do administrador**.
   Para os demais usuários essa opção não aparece, e o banco recusa qualquer pedido de quem não está na tabela `admins`.

## 2. Receber pelo site — Mercado Pago (20 min)
1. **mercadopago.com.br/developers/panel** → *Criar aplicação* (`HANKX Finanças`, Pagamentos online / Assinaturas).
2. Copie o **Access Token de produção** (`APP_USR-…`). É **secreto**: não envie por chat.
3. Supabase → **Edge Functions** → *Deploy a new function* → *Via Editor*:
   - `mp-subscribe` → cole `supabase/functions/mp-subscribe/index.ts` → Deploy.
   - `mp-webhook` → cole `supabase/functions/mp-webhook/index.ts` → **desligue "Enforce JWT verification"** → Deploy.
4. Supabase → **Edge Functions → Secrets**: `MP_ACCESS_TOKEN` = o token; `APP_URL` = `https://www.hankx.com.br/app/`.
5. Mercado Pago → sua aplicação → **Webhooks** → URL de produção
   `https://ffpahcsofmjpcqpmpmxp.supabase.co/functions/v1/mp-webhook`
   → marque **Pagamentos** e **Planos e assinaturas** → Salvar.

Planos: **Mensal R$ 9,90**, **Anual R$ 89,90** (renovação automática) e **Vitalício R$ 199,90** (pagamento único, aceita Pix).
Para mudar preços: edite `PLANS` em `mp-subscribe/index.ts` e os valores em `admin_stats` no `schema.sql`.

## 3. Google Play (quando publicar o app Android)
- Play Console → Monetizar: assinaturas `premium_mensal` (R$ 9,90/mês) e `premium_anual` (R$ 89,90/ano); produto único `premium_vitalicio` (R$ 199,90).
- Função `play-verify` (cole `supabase/functions/play-verify/index.ts`) + segredos `GOOGLE_SERVICE_ACCOUNT` (conteúdo do .json da conta de serviço) e `PLAY_PACKAGE` = `br.com.hankx.financas`.

## Painel do administrador
- Receita recorrente mensal, receita do mês, dos últimos 30 dias e total.
- Assinantes por plano (mensal, anual, vitalício, cortesia) e quem está no teste de 7 dias.
- Usuários totais, novos em 7/30 dias, ativos na semana, gráfico dos últimos 6 meses e últimos pagamentos.
- Lista de usuários com busca: toque num usuário para dar **Premium grátis** (30 dias, 90 dias, 1 ano ou vitalício) ou **remover**.

## Grátis × Premium
| | Grátis | Premium |
|---|---|---|
| Lançamentos, recorrências, calendário, resumo do mês, nuvem | ✅ | ✅ |
| Contas/cartões | 1 | ilimitadas |
| Gráficos completos, relatórios, dívidas, empréstimos, orientação, temas | — | ✅ |

Toda conta nova tem **7 dias de Premium grátis**.
