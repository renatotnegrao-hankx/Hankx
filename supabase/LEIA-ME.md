# Ligar o banco de dados (Supabase) — HANKX Finanças

Enquanto o arquivo `app/config.js` estiver vazio, o app funciona como antes
(login jnegrao, dados no aparelho). Depois de preenchido, cada pessoa entra com
e-mail e senha e os dados ficam iguais no celular e no computador.

1. Acesse **supabase.com** → *Start your project* → entre com o GitHub.
2. *New project* → nome `hankx-financas` → crie uma senha (guarde) → região **South America (São Paulo)** → *Create*. Espere ~2 min.
3. Menu **SQL Editor** → *New query* → cole todo o arquivo `supabase/schema.sql` → **Run** (deve aparecer "Success").
4. Menu **Authentication → URL Configuration**:
   - *Site URL*: `https://www.hankx.com.br/app/`
   - *Redirect URLs*: `https://www.hankx.com.br/app/` e `https://hankx.com.br/app/`
5. Menu **Project Settings → API** (Data API): copie a **Project URL** e a **anon public key**.
6. Cole os dois em `app/config.js` (ou mande para o Claude colocar).
   A *anon key* é pública por natureza. **Nunca** publique a chave `service_role`.

No primeiro login, o app pergunta se quer levar os lançamentos que já estão no aparelho para a sua conta.
