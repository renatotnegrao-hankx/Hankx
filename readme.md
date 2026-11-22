# Site HANKX — versão estática (HTML/CSS/JS puro)

Este pacote contém o site institucional da HANKX pronto para publicar em
**qualquer provedor de hospedagem** (Hostinger, outro provedor, etc.) — sem
nenhuma dependência do Base44. É HTML puro, sem build, sem Node, sem backend.

## O que tem aqui

```
index.html              → Página inicial
sobre.html               → Sobre a HANKX
consultoria.html         → Consultoria de Custos e Controladoria
financas-pessoais.html   → Finanças Pessoais / Educação Financeira
academy.html             → HANKX Academy (treinamentos)
resultados.html          → Resultados
contato.html             → Contato (formulário envia para o WhatsApp)
404.html                 → Página de erro 404
robots.txt / sitemap.xml → SEO básico
assets/css/style.css     → Estilos (fontes, animações)
assets/js/main.js        → Menu mobile, scroll, ícones, formulário
```

## Como publicar

1. Faça upload de **todo o conteúdo desta pasta** (mantendo a estrutura de
   pastas `assets/`) para a raiz pública do seu provedor (geralmente
   `public_html/` ou `htdocs/`).
2. Não é necessário nenhum passo de build, banco de dados ou PHP — são
   arquivos estáticos comuns.
3. Configure a página inicial do provedor para `index.html` (normalmente já
   é o padrão).
4. Se quiser usar HTTPS/domínio próprio (ex: hankx.com.br), configure isso no
   painel do seu provedor de hospedagem/DNS como de costume.

## Coisas para revisar antes de publicar

- **Imagens**: as imagens (logo, foto do hero, watermarks) ainda apontam
  para `media.base44.com`, o CDN de mídia do Base44. Esse CDN tende a
  continuar no ar independente do app, mas para ficar 100% independente do
  Base44, baixe essas imagens e troque os `src="https://media.base44.com/..."`
  por caminhos locais (ex: `assets/img/logo.png`). As URLs usadas estão
  listadas abaixo.
- **Fontes e ícones** vêm de CDNs públicos (Google Fonts e unpkg/Lucide) —
  isso é normal e não depende do Base44.
- **Formulário de contato**: não envia e-mail nem grava em banco — ele monta
  a mensagem e abre o WhatsApp (mesmo comportamento do site original). Se
  quiser um formulário que envie e-mail de verdade, será preciso um serviço
  de formulário (ex: Formspree) ou um back-end simples em PHP no seu
  provedor.
- Páginas de login/cadastro do app original (`Login`, `Register`,
  `OAuthConsent`, etc.) **não foram incluídas** porque dependiam do backend
  do Base44 e não fazem parte do site institucional público.

### Imagens hospedadas no Base44 (para baixar e trocar depois)

- Logo (navbar): https://media.base44.com/images/public/6a4ab9281d64929c0d49ed87/e80dca286_LogoTransparente.png
- Logo (rodapé): https://media.base44.com/images/public/6a4ab9281d64929c0d49ed87/6a2e68ec6_HANKX_2.jpeg
- Hero (Home): https://media.base44.com/images/public/6a4ab9281d64929c0d49ed87/d1c09e631_Imagemclarasiteprincipal4.png
- Marca d'água (Consultoria): https://media.base44.com/images/public/6a4ab9281d64929c0d49ed87/013c41068_generated_image.png
- Marca d'água (Academy): https://media.base44.com/images/public/6a4ab9281d64929c0d49ed87/f0b3b48a9_generated_image.png
- Marca d'água (Finanças Pessoais): https://media.base44.com/images/public/6a4ab9281d64929c0d49ed87/8d83daa86_generated_image.png
- Marca d'água (Resultados): https://media.base44.com/images/public/6a4ab9281d64929c0d49ed87/3a7d965d2_generated_image.png
