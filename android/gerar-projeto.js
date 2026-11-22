// Gera o projeto Android (Trusted Web Activity) do HANKX Finanças a partir do site.
// Uso: node android/gerar-projeto.js <pasta-de-saida> <versionCode>
const { TwaGenerator, TwaManifest, ConsoleLog } = require('@bubblewrap/core');
const out = process.argv[2] || 'android-build';
const code = parseInt(process.argv[3] || '1', 10);
const base = process.env.ICON_BASE || 'https://www.hankx.com.br/app/';
const m = new TwaManifest({
  packageId: 'br.com.hankx.financas',
  host: 'www.hankx.com.br',
  name: 'HANKX Finanças',
  launcherName: 'HANKX',
  display: 'standalone',
  orientation: 'portrait',
  themeColor: '#12161f',
  navigationColor: '#12161f',
  backgroundColor: '#0f141c',
  enableNotifications: false,
  startUrl: '/app/',
  iconUrl: base + 'icons/icon-512.png',
  maskableIconUrl: base + 'icons/icon-maskable-512.png',
  webManifestUrl: (process.env.MANIFEST_URL || 'https://www.hankx.com.br/app/manifest.json'),
  fallbackType: 'customtabs',
  appVersion: '1.0.' + code,
  appVersionCode: code,
  splashScreenFadeOutDuration: 300,
  enableSiteSettingsShortcut: false,
  features: { playBilling: { enabled: true } },
  signingKey: { path: './upload.keystore', alias: 'hankx' },
  minSdkVersion: 21,
});
new TwaGenerator().createTwaProject(out, m, new ConsoleLog('gerar'))
  .then(() => console.log('Projeto gerado em', out))
  .catch((e) => { console.error(e); process.exit(1); });
