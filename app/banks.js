/* Lista de bancos por país: [nome, site (para o logotipo), cor da marca] */
window.BANKS = {
  BR: ['🇧🇷 Brasil', [
    ['Nubank', 'nubank.com.br', '#820ad1'], ['Itaú', 'itau.com.br', '#ec7000'], ['Bradesco', 'bradesco.com.br', '#cc092f'],
    ['Banco do Brasil', 'bb.com.br', '#f8d117'], ['Caixa', 'caixa.gov.br', '#0070af'], ['Santander', 'santander.com.br', '#ec0000'],
    ['Inter', 'inter.co', '#ff7a00'], ['C6 Bank', 'c6bank.com.br', '#242424'], ['PicPay', 'picpay.com', '#21c25e'],
    ['Mercado Pago', 'mercadopago.com.br', '#00b1ea'], ['PagBank', 'pagbank.com.br', '#1bb99a'], ['BTG Pactual', 'btgpactual.com', '#0f2a4e'],
    ['XP Investimentos', 'xpi.com.br', '#1c1c1c'], ['Rico', 'rico.com.vc', '#ff5a00'], ['Sicoob', 'sicoob.com.br', '#003641'],
    ['Sicredi', 'sicredi.com.br', '#3fa110'], ['Banrisul', 'banrisul.com.br', '#004b8d'], ['BRB', 'brb.com.br', '#00519e'],
    ['Banco Pan', 'bancopan.com.br', '#00a6e2'], ['Neon', 'neon.com.br', '#00a5ff'], ['Next', 'next.me', '#00ff5f'],
    ['Banco Original', 'original.com.br', '#00a857'], ['Safra', 'safra.com.br', '#122c4f'], ['Banco BV', 'bv.com.br', '#1d4ed8'],
    ['Agibank', 'agibank.com.br', '#00c4b3'], ['Will Bank', 'willbank.com.br', '#ffd900'], ['Digio', 'digio.com.br', '#0f2a5c'],
    ['Banco do Nordeste', 'bnb.gov.br', '#a6192e'], ['Banco da Amazônia', 'bancoamazonia.com.br', '#00843d'], ['Banestes', 'banestes.com.br', '#004a8f'],
    ['Daycoval', 'daycoval.com.br', '#003a70'], ['Mercantil do Brasil', 'mercantildobrasil.com.br', '#0a3d91'], ['Cora', 'cora.com.br', '#fe3e6d'],
    ['Stone', 'stone.com.br', '#00a868'], ['InfinitePay', 'infinitepay.io', '#00c853'], ['Porto Bank', 'portoseguro.com.br', '#0046c0'],
    ['Nomad', 'nomadglobal.com', '#1a1a1a'], ['Avenue', 'avenue.us', '#0b1f3a'], ['Wise', 'wise.com', '#9fe870'], ['PayPal', 'paypal.com', '#003087']]],
  PT: ['🇵🇹 Portugal', [
    ['Caixa Geral de Depósitos', 'cgd.pt', '#0067b1'], ['Millennium bcp', 'millenniumbcp.pt', '#d1005d'], ['Novo Banco', 'novobanco.pt', '#00a19a'],
    ['Santander', 'santander.pt', '#ec0000'], ['BPI', 'bancobpi.pt', '#f57c00'], ['Crédito Agrícola', 'creditoagricola.pt', '#00843d'],
    ['ActivoBank', 'activobank.pt', '#00bfb3'], ['Banco Montepio', 'bancomontepio.pt', '#00205b'], ['Moey!', 'moey.pt', '#5a2d82'],
    ['Revolut', 'revolut.com', '#191c1f'], ['Wise', 'wise.com', '#9fe870']]],
  US: ['🇺🇸 Estados Unidos', [
    ['Chase', 'chase.com', '#117aca'], ['Bank of America', 'bankofamerica.com', '#e31837'], ['Wells Fargo', 'wellsfargo.com', '#d71e28'],
    ['Citi', 'citi.com', '#056dae'], ['Capital One', 'capitalone.com', '#004977'], ['U.S. Bank', 'usbank.com', '#0c2074'],
    ['PNC', 'pnc.com', '#ef7622'], ['TD Bank', 'td.com', '#34a853'], ['Ally', 'ally.com', '#650360'], ['Discover', 'discover.com', '#ff6000'],
    ['American Express', 'americanexpress.com', '#006fcf'], ['Charles Schwab', 'schwab.com', '#00a0df'], ['Chime', 'chime.com', '#1ec677'],
    ['PayPal', 'paypal.com', '#003087'], ['Wise', 'wise.com', '#9fe870']]],
  AR: ['🇦🇷 Argentina', [
    ['Banco Nación', 'bna.com.ar', '#00599c'], ['Banco Galicia', 'bancogalicia.com', '#f58025'], ['Santander', 'santander.com.ar', '#ec0000'],
    ['BBVA', 'bbva.com.ar', '#004481'], ['Banco Macro', 'macro.com.ar', '#00205b'], ['Banco Provincia', 'bancoprovincia.com.ar', '#007a33'],
    ['ICBC', 'icbc.com.ar', '#c8102e'], ['HSBC', 'hsbc.com.ar', '#db0011'], ['Brubank', 'brubank.com', '#6c2bd9'],
    ['Mercado Pago', 'mercadopago.com.ar', '#00b1ea'], ['Ualá', 'uala.com.ar', '#3e6bfd']]],
  MX: ['🇲🇽 México', [
    ['BBVA', 'bbva.mx', '#004481'], ['Banorte', 'banorte.com', '#eb0029'], ['Santander', 'santander.com.mx', '#ec0000'],
    ['Banamex', 'banamex.com', '#002d72'], ['HSBC', 'hsbc.com.mx', '#db0011'], ['Banco Azteca', 'bancoazteca.com.mx', '#00843d'],
    ['Scotiabank', 'scotiabank.com.mx', '#ec111a'], ['Inbursa', 'inbursa.com', '#002f6c'], ['Nu', 'nu.com.mx', '#820ad1'],
    ['Mercado Pago', 'mercadopago.com.mx', '#00b1ea']]],
  ES: ['🇪🇸 Espanha', [
    ['Santander', 'bancosantander.es', '#ec0000'], ['BBVA', 'bbva.es', '#004481'], ['CaixaBank', 'caixabank.es', '#007eae'],
    ['Banco Sabadell', 'bancsabadell.com', '#006dff'], ['Bankinter', 'bankinter.com', '#ff6600'], ['ING', 'ing.es', '#ff6200'],
    ['Unicaja', 'unicajabanco.es', '#009b3a'], ['Openbank', 'openbank.es', '#ec0000'], ['Revolut', 'revolut.com', '#191c1f']]],
  GB: ['🇬🇧 Reino Unido', [
    ['Barclays', 'barclays.co.uk', '#00aeef'], ['HSBC', 'hsbc.co.uk', '#db0011'], ['Lloyds Bank', 'lloydsbank.com', '#006a4d'],
    ['NatWest', 'natwest.com', '#5a287d'], ['Santander', 'santander.co.uk', '#ec0000'], ['Nationwide', 'nationwide.co.uk', '#1c2b6b'],
    ['Monzo', 'monzo.com', '#ff4f40'], ['Starling', 'starlingbank.com', '#7433ff'], ['Revolut', 'revolut.com', '#191c1f']]]
};
