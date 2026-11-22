# HANKX Finanças (app)

App pessoal de controle financeiro, no mesmo estilo do Hankx: Início, Calendário, Transações, Gráficos e Ajustes.
Funciona no navegador do celular e pode ser instalado na tela inicial como se fosse um app.

**Endereço:** https://www.hankx.com.br/app/

## Como instalar no iPhone
1. Abra **https://www.hankx.com.br/app/** no **Safari**.
2. Toque no botão **Compartilhar** (quadrado com seta para cima).
3. Toque em **Adicionar à Tela de Início** e depois em **Adicionar**.
4. Pronto: o ícone HANKX aparece na tela e abre em tela cheia.

No Android: abra no Chrome, toque nos três pontinhos e escolha **Instalar app** / **Adicionar à tela inicial**.

## Onde ficam os dados
- Os dados ficam no aparelho e, com **Ajustes → Salvar no GitHub** ligado, também num repositório **privado**
  (`renatotnegrao-hankx/hankx-dados`, arquivo `financas.json`). As alterações são enviadas a cada 30 minutos (com o app aberto ou ao abri-lo de novo); há também o botão "Enviar para o GitHub agora".
- Se apagar o app ou trocar de celular: entre de novo (login/senha), vá em **Ajustes → Salvar no GitHub**,
  cole a mesma chave e tudo volta. O GitHub guarda o histórico de versões (dá para recuperar versões antigas).
- Os dados só são apagados se você usar **Ajustes → Limpar dados** (e mesmo assim o histórico do GitHub mantém as versões anteriores).
- A chave do GitHub fica só no aparelho; ela nunca é gravada no repositório.
- Continua existindo o **Fazer backup** (.json) como cópia extra.

## Cancelar lançamento
Abra o lançamento → **Cancelar lançamento**. Ele continua aparecendo riscado como CANCELADO, mas sai dos saldos,
totais, gráficos e relatórios. Para desfazer: **Reativar lançamento**. Em Transações há o filtro **Cancelados**.

## O que tem
- **Início:** saldo acumulado, saldo da conta, saldo do período e do dia, receitas x despesas, vencimentos próximos.
- **Calendário:** mês com saldo dia a dia (modo Saldo) ou o movimento do dia (modo Fluxo).
- **Transações:** filtros por mês, ano, todos ou período; por conta; pendentes/realizados; busca.
- **Lançamentos:** receita ou despesa, conta, categoria, pago/pendente, repetição (diária, semanal, quinzenal, mensal, anual;
  sem fim, até uma data ou em parcelas), código do lote e nota. Ao editar uma série, escolha "só nesta" ou "nesta e nas próximas".
- **Gráficos:** projeção de 6/12/24 meses com linha de saldo, pizza por categoria e ranking.
- **Ajustes:** tema Claro/Escuro/Auto, perfis de interface (Padrão, Feminino, Masculino, Minimal, Windows, Moderno),
  Meu Perfil (com busca de CEP), Contas e Cartões, Categorias, Dívidas (parcelas que você marca como pagas),
  simulador de Empréstimos (gera as parcelas divididas 40% no dia 15 e 60% no dia 30), Orientação do que pagar primeiro,
  relatórios (Controle de Caixa em Excel e PDF, Excel por categoria, fluxo diário em CSV) e backup.

## Arquivos
```
app/index.html      → página do app
app/styles.css      → visual e temas
app/app.js          → toda a lógica
app/sw.js           → funciona offline depois do primeiro acesso
app/manifest.json   → instalação na tela inicial
app/icons/          → ícones
app/vendor/         → biblioteca para gerar arquivos Excel
```
