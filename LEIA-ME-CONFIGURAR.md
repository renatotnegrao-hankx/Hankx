# HANKX Finanças — como ligar o banco de dados e começar a faturar

O código já está todo pronto e publicado. O que falta é **criar 3 contas e colar alguns códigos**.
Faça na ordem abaixo. Enquanto a Parte 1 não for feita, o app continua funcionando como antes
(login único `jnegrao`, dados no aparelho/GitHub).

---

## Parte 1 — Banco de dados (Supabase) · ~15 min · grátis

1. Acesse **supabase.com** → *Start your project* → entre com sua conta do GitHub.
2. *New project* → Nome: `hankx-financas` → crie uma senha forte (guarde) → Região: **South America (São Paulo)** → *Create new project*. Espere ~2 min.
3. Menu lateral **SQL Editor** → *New query* → abra o arquivo `supabase/schema.sql` deste repositório, copie **tudo**, cole e clique em **Run**. Deve aparecer "Success".
4. Menu **Authentication → URL Configuration**:
   - *Site URL*: `https://www.hankx.com.br/app/`
   - *Redirect URLs*: adicione `https://www.hankx.com.br/app/` e `https://hankx.com.br/app/`
5. (Opcional) **Authentication → Emails**: traduza os e-mails de confirmação e de "esqueci a senha" para português.
6. Menu **Project Settings → API** (ou *Data API*). Copie:
   - **Project URL** (ex.: `https://abcd1234.supabase.co`)
   - **anon public key** (um texto longo começando com `eyJ…`)
7. **Me envie esses 2 códigos** (ou edite o arquivo `app/config.js` no GitHub e cole nos campos `supabaseUrl` e `supabaseAnonKey`).
   Esses dois são públicos por natureza: é seguro colocá-los no site.
   ⚠️ **Nunca** envie nem publique a chave `service_role`.

Pronto: o app passa a ter **cadastro com e-mail e senha, 7 dias de Premium grátis, dados na nuvem e "Excluir minha conta"**.
Na primeira vez que você entrar, o app pergunta se quer levar os lançamentos que já estão no aparelho para a sua conta.

---

## Parte 2 — Receber pelo site (Mercado Pago) · ~20 min

1. Crie/entre na sua conta em **mercadopago.com.br** (de preferência conta PJ da HANKX).
2. Acesse **mercadopago.com.br/developers/panel** → *Criar aplicação* → nome `HANKX Finanças` → tipo **Pagamentos online / Assinaturas**.
3. Em **Credenciais de produção**, copie o **Access Token** (começa com `APP_USR-`). Ele é **secreto**.
4. No Supabase, instale as funções do servidor. O jeito mais fácil (sem programar):
   - Menu **Edge Functions** → *Deploy a new function* → *Via Editor*.
   - Crie a função **`mp-subscribe`** e cole o conteúdo de `supabase/functions/mp-subscribe/index.ts`. *Deploy*.
   - Crie a função **`mp-webhook`**, cole `supabase/functions/mp-webhook/index.ts`, e **desligue "Enforce JWT verification"** nas configurações dela. *Deploy*.
5. Supabase → **Edge Functions → Secrets** → adicione:
   - `MP_ACCESS_TOKEN` = o Access Token do passo 3
   - `APP_URL` = `https://www.hankx.com.br/app/`
6. Mercado Pago → sua aplicação → **Webhooks / Notificações** → URL de produção:
   `https://SEU-PROJETO.supabase.co/functions/v1/mp-webhook`
   Marque os eventos **Planos e assinaturas** (subscription_preapproval e subscription_authorized_payment). Salve.
7. Teste: crie uma conta nova no app → Ajustes → HANKX Premium → Assinar. Ao pagar, o Premium é liberado sozinho em alguns segundos.

Preços: **R$ 9,90/mês** ou **R$ 89,90/ano** (para mudar, edite `PLANS` em `mp-subscribe/index.ts`).

---

## Parte 3 — App na Play Store (conta do KidsBill) · ~1 h + análise do Google

1. Acesse **pwabuilder.com** → digite `https://www.hankx.com.br/app/` → *Start* → *Package for stores* → **Android** → *Generate package*.
   - **Package ID**: `br.com.hankx.financas`
   - **App name**: `HANKX Finanças` · **Launcher name**: `HANKX`
   - Em *Signing key* escolha **Create new** e **guarde o arquivo .keystore e as senhas** (sem eles não dá para atualizar o app).
   - Marque **Enable Play Billing** (cobrança do Google Play).
   - Baixe o .zip: dentro dele estão o arquivo **.aab** (para a loja) e o **assetlinks.json**.
2. **Me envie o `assetlinks.json` do .zip** (ou só a linha `sha256_cert_fingerprints`). Eu coloco em `hankx.com.br/.well-known/assetlinks.json` — isso tira a barra de endereço do app.
   Depois de subir na loja, o Play Console mostra uma segunda impressão digital em *Configuração → Integridade do app → Assinatura do app*; me envie também.
3. **Play Console** (conta do KidsBill) → *Criar app* → `HANKX Finanças`, Português (Brasil), App, Gratuito.
4. Ficha da loja: use os textos e as imagens de `img/` (telas do app). Ícone: `app/icons/icon-512.png`.
   - Política de privacidade: `https://www.hankx.com.br/privacidade.html`
   - Exclusão de conta (Segurança dos dados): `https://www.hankx.com.br/excluir-conta.html`
   - Categoria: **Finanças**. Classificação: livre. Público-alvo: 18+.
   - **Declaração de apps financeiros**: "o app não oferece empréstimos nem serviços financeiros; é ferramenta de organização".
   - **Acesso ao app**: informe um login de teste (crie uma conta só para o revisor do Google).
5. **Monetizar → Produtos → Assinaturas** → crie:
   - `premium_mensal` — R$ 9,90 por mês
   - `premium_anual` — R$ 89,90 por ano
   (Os mesmos IDs já estão em `app/config.js`.)
6. Para o app confirmar as compras: Google Cloud → crie uma **conta de serviço**, baixe a chave **.json**, e no Play Console → *Usuários e permissões* convide o e-mail dessa conta com permissão **Ver dados financeiros e gerenciar pedidos**.
   No Supabase, crie a função **`play-verify`** (cole `supabase/functions/play-verify/index.ts`) e os segredos:
   - `GOOGLE_SERVICE_ACCOUNT` = todo o conteúdo do arquivo .json
   - `PLAY_PACKAGE` = `br.com.hankx.financas`
7. Envie o **.aab** em **Teste fechado**. Se a conta do KidsBill for **pessoal e criada depois de nov/2023**, são necessários **12 testadores por 14 dias** antes de publicar em produção. Conta de empresa não precisa.

---

## Onde está cada coisa

| Endereço | O que é |
|---|---|
| `hankx.com.br` | Site de vendas do app (novo) |
| `hankx.com.br/app` | O aplicativo |
| `hankx.com.br/consultoria` | Site antigo da consultoria (preservado) |
| `hankx.com.br/privacidade.html` · `termos.html` · `excluir-conta.html` | Páginas exigidas pelas lojas |
| `supabase/schema.sql` | Banco de dados |
| `supabase/functions/*` | Cobrança (Mercado Pago e Google Play) |
| `app/config.js` | Onde entram os 2 códigos do Supabase |

## Plano grátis × Premium

| | Grátis | Premium (7 dias grátis na criação da conta) |
|---|---|---|
| Lançamentos, recorrências, calendário | ✅ | ✅ |
| Resumo do mês (aba Gráficos) | ✅ | ✅ |
| Dados na nuvem | ✅ | ✅ |
| Contas/cartões | 1 | Ilimitadas |
| Gráficos completos (projeção, categorias, ranking) | — | ✅ |
| Relatórios Excel, PDF, CSV | — | ✅ |
| Dívidas, empréstimos, orientação | — | ✅ |
| Temas e perfis de interface | Padrão | Todos |
