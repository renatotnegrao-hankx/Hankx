/* Hankx — app pessoal de controle financeiro (PWA, dados salvos no aparelho) */
'use strict';

/* ======================= Utilidades ======================= */
const KEY = 'hankx-financas-v1';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const newLote = () => '#' + String(Math.floor(1e10 + Math.random() * 9e10));
const pad = n => String(n).padStart(2, '0');
const ds = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const pd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const today = () => ds(new Date());
const addDays = (s, n) => { const d = pd(s); d.setDate(d.getDate() + n); return ds(d); };
const dim = (y, m0) => new Date(y, m0 + 1, 0).getDate();
function addMonthsDay(s, k, day) {
  const d = pd(s); day = day || d.getDate();
  let y = d.getFullYear(), m = d.getMonth() + k;
  y += Math.floor(m / 12); m = ((m % 12) + 12) % 12;
  return ds(new Date(y, m, Math.min(day, dim(y, m))));
}
const ymAdd = (ym, k) => addMonthsDay(ym + '-01', k).slice(0, 7);
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const MES3 = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const SEMANA = ['Domingo', 'Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado'];
const fmtD = s => { const [y, m, d] = s.split('-'); return `${d}/${m}/${y.slice(2)}`; };
const fmtDL = s => { const d = pd(s); return `${SEMANA[d.getDay()]}, ${d.getDate()} De ${MES3[d.getMonth()]}`; };
const fmtDS = s => { const d = pd(s); return `${d.getDate()} de ${MES3[d.getMonth()].toLowerCase()}`; };
const monthLabel = ym => { const [y, m] = ym.split('-'); return `${MESES[m - 1]} De ${y}`; };
const r2 = n => Math.round(n * 100) / 100;
const brl = n => (n < -0.004 ? '-' : '') + 'R$ ' + Math.abs(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num2 = n => Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const shortN = n => (n > 0.5 ? '+' : n < -0.5 ? '-' : '') + Math.round(Math.abs(n)).toLocaleString('pt-BR');
const kfmt = n => Math.abs(n) >= 1000 ? (n / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'k' : Math.round(n).toString();
function parseMoney(s) {
  s = String(s ?? '').trim().replace(/[R$\s]/g, '');
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s); return isNaN(n) ? 0 : n;
}
function ageOf(b) {
  if (!b) return null; const d = pd(b), t = new Date();
  let a = t.getFullYear() - d.getFullYear();
  if (t.getMonth() < d.getMonth() || (t.getMonth() === d.getMonth() && t.getDate() < d.getDate())) a--;
  return a;
}

/* ======================= Ícones ======================= */
const P = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  cal: '<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/><path d="M7.5 13.5h.01M12 13.5h.01M16.5 13.5h.01M7.5 17.5h.01M12 17.5h.01M16.5 17.5h.01" stroke-width="2.4"/>',
  list: '<path d="M9 6h12M9 12h12M9 18h12M3.5 6h.01M3.5 12h.01M3.5 18h.01" stroke-width="2.2"/>',
  pie: '<path d="M21 12a9 9 0 1 1-9-9"/><path d="M12 3a9 9 0 0 1 9 9h-9z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  pen: '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6"/>',
  circle: '<circle cx="12" cy="12" r="9"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  left: '<path d="m15 18-6-6 6-6"/>', right: '<path d="m9 18 6-6-6-6"/>',
  down: '<path d="m6 9 6 6 6-6"/>', up: '<path d="m18 15-6-6-6 6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  card: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19"/>',
  cash: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01" stroke-width="2.4"/>',
  repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  filter: '<path d="M3 6h18M7 12h10M10 18h4"/>',
  star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 3v4M17 5h4"/>',
  calc: '<rect x="4" y="2.5" width="16" height="19" rx="2.5"/><path d="M8 6.5h8v3H8zM8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01" />',
  dollar: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
  sheet: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 12h8v6H8zM12 12v6M8 15h8"/>',
  chart: '<path d="M3 3v18h18"/><path d="M8 17V11M12 17V7M16 17v-4"/>',
  dl: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
  ul: '<path d="M12 15V3M7 8l5-5 5 5M4 21h16"/>',
  camera: '<path d="M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="4"/>',
  bank: '<path d="M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M2 10l10-7 10 7z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M12 18h.01" stroke-width="2.4"/>',
  sort: '<path d="M7 4v16M3 8l4-4 4 4M17 20V4M13 16l4 4 4-4"/>',
  trend: '<path d="m3 17 6-6 4 4 8-8M15 7h6v6"/>',
  bars: '<path d="M6 20V10M12 20V4M18 20v-6"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01" stroke-width="2.2"/>',
  up: '<circle cx="12" cy="12" r="9"/><path d="M12 16V8M8.5 11.5 12 8l3.5 3.5"/>',
  down2: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8.5 12.5 12 16l3.5-3.5"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'
};
const I = (n, cls = '') => `<span class="ico ${cls}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${P[n] || ''}</svg></span>`;

/* ======================= Dados ======================= */
const DEF_CATS = [
  ['receita', '13º Salário', '🎁'], ['receita', 'Adiantamento', '💰'], ['receita', 'Bônus', '📈'], ['receita', 'Férias', '✈️'],
  ['receita', 'Outros', '🏷️'], ['receita', 'PLR', '📈'], ['receita', 'Salário', '💰'], ['receita', 'Saldo Atual', '📈'],
  ['despesa', 'Água', '💧'], ['despesa', 'Aluguel', '🏠'], ['despesa', 'Barbeiro', '💈'], ['despesa', 'Cartão de Crédito', '💳'],
  ['despesa', 'Consignado', '🏦'], ['despesa', 'Energia Elétrica', '⚡'], ['despesa', 'Financiamento', '🚗'], ['despesa', 'Impostos', '💰'],
  ['despesa', 'Internet', '🌐'], ['despesa', 'Lazer', '🎉'], ['despesa', 'Mercado', '🛒'], ['despesa', 'Saúde', '💊'],
  ['despesa', 'Telefone', '📱'], ['despesa', 'Transporte', '⛽'], ['despesa', 'Empréstimo', '🧾'], ['despesa', 'Outros', '🏷️']
];
function defaults() {
  return {
    v: 1, updatedAt: 0,
    profile: { name: '', birth: '', cep: '', city: '', uf: '', email: '', photo: '' },
    settings: { theme: 'dark', skin: 'padrao' },
    accounts: [{ id: 'acc_' + uid(), name: 'Minha conta', kind: 'conta', type: 'Conta corrente', initial: 0, color: '#ec7000', isDefault: true }],
    categories: DEF_CATS.map(([type, name, icon]) => ({ id: 'cat_' + uid(), type, name, icon })),
    transactions: [],
    debts: []
  };
}
let S, STORE = KEY;
function normalize() {
  const d = defaults();
  for (const k of Object.keys(d)) if (S[k] === undefined || S[k] === null) S[k] = d[k];
  if (!S.accounts.length) S.accounts = d.accounts;
}
function load() {
  try { const raw = localStorage.getItem(STORE); S = raw ? JSON.parse(raw) : defaults(); } catch (e) { S = defaults(); }
  const d = defaults();
  for (const k of Object.keys(d)) if (S[k] === undefined) S[k] = d[k];
  if (!S.accounts.length) S.accounts = d.accounts;
  if (S.settings && S.settings.skin === 'dos') S.settings.skin = 'padrao'; // tema MS-DOS removido
}
function save(fromRemote = false) {
  if (!fromRemote) S.updatedAt = Date.now();
  if (!fromRemote) schedulePush();
  try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) { toast('Não foi possível salvar (memória cheia?)'); }
}

const cat = id => S.categories.find(c => c.id === id);
const acc = id => S.accounts.find(a => a.id === id);
const defAcc = () => (S.accounts.find(a => a.isDefault) || S.accounts[0]);
const sign = t => t.type === 'receita' ? +t.amount : -t.amount;
const LIVE = () => S.transactions.filter(t => !t.canceled);

/* ======================= Estado de tela ======================= */
const T0 = today();
const V = {
  tab: 'inicio', sub: null, acc: 'all', mode: 'mensal', ym: T0.slice(0, 7), year: +T0.slice(0, 4),
  from: T0.slice(0, 8) + '01', to: T0, status: 'todos', type: 'todos', sort: 'data', q: '', searching: false,
  calView: 'saldo', calDay: null, chart: 'resumo', projN: 6, projSel: null, balN: 6, balsel: null, tblMode: 'mes',
  catType: 'despesa', catMode: 'mensal', rankMode: 'mes', open: {}, catTab: 'despesa', accTab: 'conta',
  loanTab: 'prazo', loan: { pv: '', pmt: '', i: '', n: '' }, homeType: 'todos'
};

function range(mode = V.mode) {
  if (mode === 'mensal' || mode === 'mes') { const [y, m] = V.ym.split('-').map(Number); return [`${V.ym}-01`, `${V.ym}-${pad(dim(y, m - 1))}`]; }
  if (mode === 'anual' || mode === 'ano') return [`${V.year}-01-01`, `${V.year}-12-31`];
  if (mode === 'periodo') return V.from <= V.to ? [V.from, V.to] : [V.to, V.from];
  return ['0000-01-01', '9999-12-31'];
}
const accOk = t => V.acc === 'all' || t.accountId === V.acc;
const overdue = t => !t.paid && !t.canceled && t.date < T0; // pendente vencido
const stOk = (t, st = V.status) => st === 'todos' || st === 'cancelados' || (st === 'pendentes' ? overdue(t) : t.paid);
function txIn(a, b, o = {}) {
  const st = o.status ?? V.status, ty = o.type ?? 'todos';
  if (st === 'cancelados') return S.transactions.filter(t => t.canceled && accOk(t) && t.date >= a && t.date <= b && (ty === 'todos' || t.type === ty));
  return S.transactions.filter(t => (o.withCanceled || !t.canceled) && accOk(t) && t.date >= a && t.date <= b && (t.canceled || stOk(t, st)) && (ty === 'todos' || t.type === ty));
}
function initialSum() {
  return S.accounts.filter(a => V.acc === 'all' ? a.kind !== 'cartao' : a.id === V.acc).reduce((s, a) => s + (+a.initial || 0), 0);
}
function balanceAt(date, paidOnly = false) {
  let s = initialSum();
  for (const t of LIVE()) if (accOk(t) && t.date <= date && (!paidOnly || t.paid)) s += sign(t);
  return r2(s);
}
// saldo atual = lançamentos realizados + pendentes já vencidos
function saldoAtual() {
  let s = initialSum();
  for (const t of LIVE()) if (accOk(t) && (t.paid || t.date < T0)) s += sign(t);
  return r2(s);
}
function accBalance(a) {
  let s = +a.initial || 0;
  for (const t of LIVE()) if (t.accountId === a.id && (t.paid || t.date < T0)) s += sign(t);
  return r2(s);
}
const sumType = (list, ty) => r2(list.filter(t => t.type === ty).reduce((s, t) => s + +t.amount, 0));
function sortTx(list, by = V.sort) {
  return list.slice().sort(by === 'valor' ? (a, b) => b.amount - a.amount || a.date.localeCompare(b.date) : (a, b) => a.date.localeCompare(b.date) || (a.type === b.type ? 0 : a.type === 'receita' ? -1 : 1));
}

/* ======================= Componentes ======================= */
// logotipo do banco (carregado do site do banco; se não vier, ficam as iniciais)
const logoUrl = d => `https://www.google.com/s2/favicons?domain=${encodeURIComponent(d)}&sz=128`;
const accIni = n => (String(n || '?').replace(/[^\p{L}\p{N} ]/gu, '').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2) || '?').toLowerCase();
function accLogo(a, cls = 'banklogo') {
  if (!a) return `<span class="${cls}" style="background:#888">?</span>`;
  return `<span class="${cls} ${a.logo ? 'haslogo' : ''}" style="background:${a.color};--bc:${a.color}">${esc(accIni(a.name))}${a.logo ? `<img src="${logoUrl(a.logo)}" alt="" loading="lazy" onerror="this.remove()">` : ''}</span>`;
}
function accChips() {
  const chips = S.accounts.map(a => `<button class="accchip ${V.acc === a.id ? 'on' : ''}" style="${V.acc === a.id ? `background:${a.color}` : ''}" data-act="acc" data-id="${a.id}" title="${esc(a.name)}" aria-label="${esc(a.name)}">${a.logo && !isDesk() ? `<img class="chiplogo only" src="${logoUrl(a.logo)}" alt="" onerror="this.outerHTML='${esc(a.name.length > 11 ? a.name.split(' ')[0] : a.name).replace(/'/g, '')}'">` : `${a.logo ? `<img class="chiplogo" src="${logoUrl(a.logo)}" alt="" onerror="this.remove()">` : ''}${esc(a.name.length > 11 ? a.name.split(' ')[0] : a.name)}`}</button>`).join('');
  return `<div class="accs"><button class="accchip ${V.acc === 'all' ? 'on' : ''}" style="${V.acc === 'all' ? 'background:var(--accent)' : ''}" data-act="acc" data-id="all">Todas</button>${chips}</div>`;
}
function seg(name, opts, cur, cls = '') {
  return `<div class="seg ${cls}">${opts.map(([v, l, c]) => `<button class="${cur === v ? 'on' : ''} ${c || ''}" data-act="set" data-k="${name}" data-v="${v}">${l}</button>`).join('')}</div>`;
}
function pills(name, opts, cur, cls = '') {
  return `<div class="pills ${cls}">${opts.map(([v, l]) => `<button class="pill ${cur === v ? 'on' : ''}" data-act="set" data-k="${name}" data-v="${v}">${l}</button>`).join('')}</div>`;
}
function periodNav(mode = V.mode, allowTodos = false) {
  if (mode === 'periodo') return `<div class="dates2"><label class="f"><span>De</span><input class="in" type="date" value="${V.from}" data-chg="from"></label><label class="f"><span>Até</span><input class="in" type="date" value="${V.to}" data-chg="to"></label></div>`;
  if (mode === 'todos') return '';
  const isM = mode === 'mensal' || mode === 'mes';
  const lab = isM ? monthLabel(V.ym) : String(V.year);
  const cur = isM ? V.ym === T0.slice(0, 7) : V.year === +T0.slice(0, 4);
  return `<div class="monthnav"><button class="ib" data-act="nav" data-d="-1" data-m="${isM ? 'm' : 'y'}">${I('left')}</button>
  <div class="c"><b>${lab}</b><small data-act="nav-today">${cur ? 'Hoje' : 'Ir para hoje'}</small></div>
  <button class="ib" data-act="nav" data-d="1" data-m="${isM ? 'm' : 'y'}">${I('right')}</button></div>`;
}
function txRow(t, o = {}) {
  const c = cat(t.categoryId), a = acc(t.accountId);
  const name = t.desc || c?.name || (t.type === 'receita' ? 'Receita' : 'Despesa');
  const parc = t.total > 1 ? ` <small class="muted">${t.idx}/${t.total}</small>` : '';
  const rep = t.lote ? ' ' + I('repeat') : '';
  const late = !t.paid && !t.canceled && t.date < T0 && t.type === 'despesa';
  return `<div class="tx ${t.type} ${t.paid ? 'paid' : ''} ${t.canceled ? 'canceled' : ''}" data-act="edit-tx" data-id="${t.id}">
    ${o.when ? `<div class="when">${fmtDS(t.date)}${late ? ' · <span class="red">atrasada</span>' : ''}</div>` : ''}
    <div class="txm"><div class="ticon">${c ? c.icon : I(t.type === 'receita' ? 'cash' : 'card')}</div>
    <div class="tinfo"><div class="tname">${esc(name)}${parc}${rep}</div><div class="tsub">${t.canceled ? '<b class="red">CANCELADO</b> · ' : ''}${esc(a?.name || 'Sem conta')}${c && t.desc && t.desc !== c.name ? ' · ' + esc(c.name) : ''}${o.date ? ' · ' + fmtD(t.date) : ''}</div></div>
    <div class="tval">${o.signed ? (t.type === 'despesa' ? '-' : '+') : ''}${brl(t.amount)}</div>
    ${t.canceled ? `<button class="chk" data-act="uncancel-tx" data-id="${t.id}" aria-label="Reativar" title="Reativar">${I('repeat')}</button>` : `<button class="chk" data-act="toggle-paid" data-id="${t.id}" aria-label="Marcar como pago">${I(t.paid ? 'check' : 'circle')}</button>`}
    <button class="ib" data-act="del-tx" data-id="${t.id}" aria-label="Excluir">${I('trash')}</button></div></div>`;
}
function txGrouped(list, opts = {}) {
  if (!list.length) return `<div class="empty">Nenhum lançamento por aqui.<br><small>Toque em + para adicionar.</small></div>`;
  if (V.sort === 'valor') return list.map(t => txRow(t, { date: true, ...opts })).join('');
  let out = '', last = '';
  for (const t of list) { if (t.date !== last) { out += `<div class="dayhead">${fmtDL(t.date)}${opts.year ? ' ' + t.date.slice(0, 4) : ''}</div>`; last = t.date; } out += txRow(t, opts); }
  return out;
}
function sortBar() {
  return `<div class="sortbar"><button class="${V.sort === 'data' ? 'on' : ''}" data-act="set" data-k="sort" data-v="data">${I('cal')} Data</button><button class="${V.sort === 'valor' ? 'on' : ''}" data-act="set" data-k="sort" data-v="valor">${I('sort')} Valor</button></div>`;
}
function three(rec, desp, saldo) {
  return `<div class="three"><div class="card"><span>Receitas</span><b class="green">${brl(rec)}</b></div><div class="card"><span>Despesas</span><b class="red">${brl(desp)}</b></div><div class="card"><span>Saldo Final</span><b class="accent">${brl(saldo)}</b></div></div>`;
}

/* ======================= Telas ======================= */
function scrInicio() {
  const [a, b] = range();
  const list = txIn(a, b);
  const rec = sumType(list, 'receita'), desp = sumType(list, 'despesa'), per = r2(rec - desp);
  const acum = balanceAt(b > T0 && V.mode === 'todos' ? '9999-12-31' : b, V.status === 'realizados');
  const conta = saldoAtual(), dia = balanceAt(T0);
  const pct = rec > 0 ? Math.max(0, Math.min(1, per / rec)) : 0;
  const C = 2 * Math.PI * 50;
  const p = S.profile, nm = (p.name || 'você').toUpperCase();
  const soon = LIVE().filter(t => accOk(t) && !t.paid && t.type === 'despesa' && t.date <= addDays(T0, 7) && t.date >= addDays(T0, -60)).sort((x, y) => x.date.localeCompare(y.date));
  const shown = list.filter(t => V.homeType === 'todos' || t.type === V.homeType);
  return `
  <div class="hello"><svg class="deco" viewBox="0 0 400 100" preserveAspectRatio="none"><path d="M0 80 Q120 70 200 45 T400 5" stroke="var(--green)" fill="none" stroke-width="1.5"/>${[150, 170, 190, 210, 230, 250, 270].map((x, i) => `<rect x="${x}" y="${30 + (i * 13) % 25}" width="7" height="${20 + (i * 17) % 22}" fill="var(--green)" opacity=".5"/>`).join('')}</svg>
    <span class="muted" style="font-size:17px">Olá, <b style="color:var(--text)">${esc(nm)}</b></span>
    <button class="avatar" data-act="go" data-sub="perfil" style="${p.photo ? `background-image:url(${p.photo})` : ''}">${p.photo ? '' : esc((p.name || '?')[0].toUpperCase())}</button></div>
  ${accChips()}
  ${seg('mode', [['mensal', 'Mensal'], ['anual', 'Anual'], ['periodo', 'Período']], V.mode)}
  ${periodNav()}
  ${pills('status', [['todos', 'Todos'], ['pendentes', 'Pendentes'], ['realizados', 'Realizados']], V.status, 'plain')}
  <div class="split"><div class="col">
  <div class="card">
    <div class="summary">
      <div class="ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" stroke="var(--card2)" stroke-width="13" fill="none"/><circle cx="60" cy="60" r="50" stroke="var(--accent)" stroke-width="13" fill="none" stroke-linecap="round" stroke-dasharray="${C * pct} ${C}"/></svg><div class="t"><b>${Math.round(pct * 100)}%</b><small>saldo</small></div></div>
      <div>
        <div class="lbl">Saldo acumulado ${I('trend', 'green')}</div><div class="big">${brl(acum)}</div>
        <div class="small muted" style="margin-top:4px">Saldo da conta: <b style="color:var(--text)">${brl(conta)}</b></div>
      </div>
      ${(() => { const A = V.acc !== 'all' && acc(V.acc); if (!A) return ''; return `<div class="accinfo"><b>${esc(A.kind === 'cartao' ? 'Cartão' : A.type || 'Conta corrente')}</b>${A.agency ? `<span>Ag. ${esc(A.agency)}</span>` : ''}${A.number ? `<span>${A.kind === 'cartao' ? 'Final' : 'Conta'} ${esc(A.number)}</span>` : ''}</div>`; })()}
    </div>
    <div class="hr" style="margin:14px 0 10px"></div>
    <div class="between"><div><div class="lbl">Saldo do período</div><b class="${per >= 0 ? 'green' : 'red'}" style="font-size:15px">${brl(per)}</b></div>
    <div style="text-align:right"><div class="lbl">Saldo do dia</div><b class="${dia >= 0 ? 'green' : 'red'}" style="font-size:15px">${brl(dia)}</b></div></div>
    <div class="rd2"><div class="rdbox r"><span class="green">Receitas</span><b class="green">${brl(rec)}</b></div><div class="rdbox d"><span class="red">Despesas</span><b class="red">${brl(desp)}</b></div></div>
  </div>
  ${trialBanner()}
  ${CL.err ? `<div class="alert" data-act="go" data-sub="sync"><div class="h">${I('info')} Nuvem</div><span class="small">${esc(CL.err)}</span></div>` : ''}
  ${soon.length ? `<div class="alert"><div class="h">${I('bell')} Vencimentos próximos</div>${soon.slice(0, 6).map(t => `<div class="it" data-act="edit-tx" data-id="${t.id}"><span>${esc(t.desc || cat(t.categoryId)?.name || '')} <small class="${t.date < T0 ? 'red' : 'muted'}">&nbsp;${t.date < T0 ? 'atrasada ' : ''}${fmtD(t.date).slice(0, 5)}</small></span><b class="red">${brl(t.amount)}</b></div>`).join('')}${soon.length > 6 ? `<small class="muted">+ ${soon.length - 6} outros</small>` : ''}</div>` : ''}
  </div><div class="col">
  <div class="between"><h2>Próximos</h2><button class="ib" data-act="cycle-home">${I('filter')}${V.homeType !== 'todos' ? `<small class="accent">${V.homeType}</small>` : ''}</button></div>
  ${shown.length ? sortTx(shown, 'data').map(t => txRow(t, { when: true, signed: true })).join('') : '<div class="empty">Nenhum lançamento neste período.</div>'}
  </div></div>`;
}

function scrCalendario() {
  const [y, m] = V.ym.split('-').map(Number);
  const first = new Date(y, m - 1, 1).getDay(), n = dim(y, m - 1);
  const ty = V.type;
  const month = txIn(`${V.ym}-01`, `${V.ym}-${pad(n)}`, { type: ty });
  const byDay = {};
  for (const t of month) (byDay[t.date] ||= []).push(t);
  let bal = (() => { let s = initialSum(); for (const t of LIVE()) if (accOk(t) && t.date < `${V.ym}-01` && stOk(t) && (ty === 'todos' || t.type === ty)) s += sign(t); return s; })();
  let cells = '';
  for (let i = 0; i < first; i++) cells += '<div class="d"></div>';
  for (let d = 1; d <= n; d++) {
    const key = `${V.ym}-${pad(d)}`, L = byDay[key] || [];
    const inc = sumType(L, 'receita'), out = sumType(L, 'despesa'); bal += inc - out;
    let lines = '';
    if (V.calView === 'saldo') {
      if (key >= T0 || L.length) lines += `<div class="${bal >= 0 ? 'green' : 'red'}">${shortN(bal)}</div>`;
      if (L.length) lines += `<div class="x">${inc ? `<span class="blue">+${Math.round(inc).toLocaleString('pt-BR')}</span> ` : ''}${out ? `<span class="orange">-${Math.round(out).toLocaleString('pt-BR')}</span>` : ''}</div>`;
    } else if (L.length) {
      const net = inc - out; lines += `<div class="${net >= 0 ? 'green' : 'red'}">${shortN(net)}</div>`;
    }
    cells += `<div class="d ${key === T0 ? 'today' : ''} ${V.calDay === key ? 'sel' : ''}" data-act="calday" data-d="${key}"><b>${d}</b>${lines}</div>`;
  }
  const rec = sumType(month, 'receita'), desp = sumType(month, 'despesa');
  const list = V.calDay ? month.filter(t => t.date === V.calDay) : month;
  return `
  ${periodNav('mensal')}
  ${accChips()}
  <div class="calbar">
    ${seg('type', [['todos', 'Todos'], ['receita', 'Receita'], ['despesa', 'Despesa']], V.type)}
    ${seg('status', [['todos', 'Todos'], ['pendentes', 'Pend.'], ['realizados', 'Real.']], V.status)}
    ${seg('calView', [['fluxo', I('bars') + ' Fluxo'], ['saldo', I('trend') + ' Saldo']], V.calView)}
  </div>
  <div class="split cal-split"><div class="col">
  <div class="cal"><div class="wd">${['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(x => `<div>${x}</div>`).join('')}</div><div class="grid">${cells}</div></div>
  ${three(rec, desp, r2(rec - desp))}
  </div><div class="col">
  <div class="between"><h2 style="font-size:17px;color:var(--muted)">${V.calDay ? `Dia ${fmtD(V.calDay)} <button class="accent small" data-act="calday" data-d="${V.calDay}">(ver mês)</button>` : `Transações do mês (${month.length})`}</h2>${sortBar()}</div>
  ${txGrouped(sortTx(list))}
  </div></div>`;
}

function scrTransacoes() {
  const [a, b] = range();
  const tot = txIn(a, b);
  const rec = sumType(tot, 'receita'), desp = sumType(tot, 'despesa');
  let list = txIn(a, b, { withCanceled: true });
  if (V.type !== 'todos') list = list.filter(t => t.type === V.type);
  if (V.q) { const q = V.q.toLowerCase(); list = list.filter(t => [t.desc, cat(t.categoryId)?.name, t.note, acc(t.accountId)?.name, t.lote].join(' ').toLowerCase().includes(q)); }
  return `
  <div class="titlebar"><h1>Transações</h1><button class="ib" data-act="search">${I('search')}</button></div>
  ${V.searching ? `<input class="in" id="q" placeholder="Buscar descrição, categoria, nota..." value="${esc(V.q)}" data-inp="q" style="margin-bottom:12px">` : ''}
  ${seg('mode', [['mensal', 'Mensal'], ['anual', 'Anual'], ['todos', 'Todos'], ['periodo', 'Período']], V.mode)}
  ${periodNav()}
  ${accChips()}
  ${pills('status', [['todos', 'Todos'], ['pendentes', 'Pendentes'], ['realizados', 'Realizados'], ['cancelados', 'Cancelados']], V.status, 'plain')}
  ${three(rec, desp, r2(rec - desp))}
  ${seg('type', [['todos', 'Todos'], ['receita', 'Receita', 'rec'], ['despesa', 'Despesa', 'desp']], V.type)}
  <div class="between" style="margin:14px 0 4px"><span class="muted">${list.length} transações</span>${sortBar()}</div>
  <div class="txgrid">${txGrouped(sortTx(list), { year: V.mode !== 'mensal' })}</div>`;
}

/* ---------- Gráficos ---------- */
const PALETTE = ['#f87171', '#fb923c', '#fbbf24', '#f43f5e', '#a78bfa', '#38bdf8', '#34d399', '#f472b6', '#facc15', '#60a5fa', '#c084fc', '#2dd4bf', '#fca5a5', '#94a3b8'];
function monthsData(startYm, n) {
  const out = []; let ym = startYm;
  for (let i = 0; i < n; i++) {
    const [y, m] = ym.split('-').map(Number), end = `${ym}-${pad(dim(y, m - 1))}`;
    const L = txIn(`${ym}-01`, end, { status: 'todos' });
    out.push({ ym, label: `${MES3[m - 1]}/${String(y).slice(2)}`, rec: sumType(L, 'receita'), desp: sumType(L, 'despesa'), saldo: balanceAt(end) });
    ym = ymAdd(ym, 1);
  }
  return out;
}
function projChart(D, W = 360, H = 270, selKey = 'projSel') {
  const SEL = V[selKey];
  const L = 34, R = 8, Tp = 14, B = 26;
  const maxV = Math.max(1, ...D.flatMap(d => [d.rec, d.desp, d.saldo]));
  const minV = Math.min(0, ...D.map(d => d.saldo));
  const step = niceStep((maxV * 1.22 - minV) / 4), top = Math.ceil(maxV * 1.22 / step) * step, bot = Math.floor(minV / step) * step;
  const yv = v => Tp + (top - v) / (top - bot) * (H - Tp - B);
  const gw = (W - L - R) / D.length, bw = Math.min(26, gw * 0.32);
  let g = '';
  for (let v = bot; v <= top + 1e-6; v += step) g += `<line x1="${L}" x2="${W - R}" y1="${yv(v)}" y2="${yv(v)}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${L - 6}" y="${yv(v) + 4}" text-anchor="end" font-size="10" fill="var(--muted)">${kfmt(v)}</text>`;
  const z = yv(0);
  D.forEach((d, i) => {
    const cx = L + gw * i + gw / 2, x1 = cx - bw - 2, x2 = cx + 2;
    const bar = (x, v, col) => { const y = yv(v); const h = Math.max(1, z - y); return `<rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="4" fill="${col}"/>` + (v > 0 && (D.length <= 12 || i % 2 === 0) ? `<text transform="translate(${x + bw / 2 + 3.2},${y - 4}) rotate(-90)" font-size="${D.length > 12 ? 8 : 9.5}" font-weight="700" fill="${col}">${kfmt(v)}</text>` : ''); };
    g += bar(x1, d.rec, '#34d399') + bar(x2, d.desp, '#f87171');
    if (D.length <= 12 || i % Math.ceil(D.length / 8) === 0) g += `<text x="${cx}" y="${H - 8}" text-anchor="middle" font-size="10" fill="var(--muted)">${d.label}</text>`;
    g += `<rect x="${L + gw * i}" y="0" width="${gw}" height="${H - B}" fill="transparent" data-act="projsel" data-key="${selKey}" data-i="${i}"/>`;
  });
  const pts = D.map((d, i) => `${L + gw * i + gw / 2},${yv(d.saldo)}`).join(' ');
  if (SEL != null && D[SEL]) { const cx = L + gw * SEL + gw / 2; g += `<line x1="${cx}" x2="${cx}" y1="${Tp}" y2="${H - B}" stroke="var(--text)" stroke-width="1"/>`; }
  g += `<polyline points="${pts}" fill="none" stroke="#38bdf8" stroke-width="2.4" stroke-linejoin="round"/>`;
  D.forEach((d, i) => { if (D.length > 12 && i % 2) return; g += `<circle cx="${L + gw * i + gw / 2}" cy="${yv(d.saldo)}" r="2.6" fill="#38bdf8"/><text x="${L + gw * i + gw / 2}" y="${yv(d.saldo) - 8}" text-anchor="middle" font-size="${D.length > 12 ? 8.5 : 10}" font-weight="700" fill="#38bdf8" stroke="var(--card)" stroke-width="3" paint-order="stroke">${kfmt(d.saldo)}</text>`; });
  if (SEL != null && D[SEL]) { const d = D[SEL]; g += `<circle cx="${L + gw * SEL + gw / 2}" cy="${yv(d.saldo)}" r="5" fill="#fff" stroke="#38bdf8" stroke-width="3"/>`; }
  const sel = SEL != null && D[SEL] ? D[SEL] : null;
  return `<div class="chartwrap">${sel ? `<div class="tooltip" style="left:${SEL < D.length / 2 ? '45%' : '8%'};top:40px"><b>${sel.label}</b><div class="green">Receita: ${brl(sel.rec)}</div><div class="red">Despesa: ${brl(sel.desp)}</div><div style="color:#38bdf8">Saldo: ${brl(sel.saldo)}</div></div>` : ''}
  <svg viewBox="0 0 ${W} ${H}" width="100%">${g}</svg></div>
  <div class="legend"><span><i style="background:#34d399"></i>Receita</span><span><i style="background:#f87171"></i>Despesa</span><span><i style="background:#38bdf8;border-radius:2px;height:4px"></i>Saldo acumulado</span></div>`;
}
function niceStep(x) { if (x <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(x))); const f = x / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; }
function flowTable() {
  const mode = V.tblMode, [a, b] = range(mode === 'mes' ? 'mensal' : mode === 'ano' ? 'anual' : 'periodo');
  const L = txIn(a, b, { status: 'todos' });
  const groups = {};
  for (const t of L) { const k = mode === 'ano' ? t.date.slice(0, 7) : t.date; (groups[k] ||= []).push(t); }
  const keys = Object.keys(groups).sort();
  let rows = '', tr = 0, td = 0, fin = balanceAt(b);
  for (const k of keys) {
    const G = groups[k], r = sumType(G, 'receita'), d = sumType(G, 'despesa'); tr += r; td += d;
    const end = mode === 'ano' ? `${k}-31` : k, sb = balanceAt(end);
    const lab = mode === 'ano' ? `${MES3[+k.slice(5) - 1]}/${k.slice(2, 4)}` : `${k.slice(8)}-${k.slice(5, 7)}-${k.slice(2, 4)}`;
    const op = V.open['f' + k];
    rows += `<tr data-act="toggle-open" data-k="f${k}"><td>${lab} ${I(op ? 'up' : 'down')}</td><td class="green">${r ? brl(r) : '—'}</td><td class="red">${d ? brl(d) : '—'}</td><td class="${sb >= 0 ? 'green' : 'red'}"><b>${brl(sb)}</b></td></tr>`;
    if (op) rows += G.map(t => `<tr class="sub"><td colspan="2">${esc(t.desc || cat(t.categoryId)?.name || '')}</td><td colspan="2" class="${t.type === 'receita' ? 'green' : 'red'}">${t.type === 'receita' ? '+' : '-'}${brl(t.amount)}</td></tr>`).join('');
  }
  return `<div class="card" style="padding:0;overflow:hidden"><table class="table"><tr><th>${mode === 'ano' ? 'MÊS' : 'DIA'}</th><th>RECEITA</th><th>DESPESA</th><th>SALDO</th></tr>${rows || '<tr><td colspan="4" class="muted" style="text-align:center">Sem lançamentos</td></tr>'}<tr class="tot"><td>Total</td><td class="green">${brl(tr)}</td><td class="red">${brl(td)}</td><td class="${fin >= 0 ? 'green' : 'red'}">${brl(fin)}</td></tr></table></div>`;
}
function catAgg(type, mode) {
  const [a, b] = range(mode);
  const L = txIn(a, b, { status: 'todos', type });
  const m = {};
  for (const t of L) { const k = t.categoryId || 'none'; (m[k] ||= { id: k, total: 0, n: 0, list: [] }); m[k].total += +t.amount; m[k].n++; m[k].list.push(t); }
  const arr = Object.values(m).sort((x, y) => y.total - x.total);
  const tot = arr.reduce((s, x) => s + x.total, 0);
  return { arr, tot };
}
function donut(arr, tot) {
  const C = 2 * Math.PI * 70; let off = 0, g = '', sm = 0;
  arr.forEach((x, i) => {
    const f = tot ? x.total / tot : 0, len = C * f;
    g += `<circle cx="100" cy="100" r="70" fill="none" stroke="${PALETTE[i % PALETTE.length]}" stroke-width="38" stroke-dasharray="${Math.max(0, len - 1.5)} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 100 100)"/>`;
    const mid = (off + len / 2) / C * 2 * Math.PI - Math.PI / 2;
    const pl = f < 0.1 ? (f * 100).toFixed(1).replace('.', ',').replace(',0', '') : Math.round(f * 100);
    if (f >= 0.06) g += `<text x="${100 + 70 * Math.cos(mid)}" y="${100 + 70 * Math.sin(mid) + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">${pl}%</text>`;
    else if (f > 0) { const rr = sm++ % 2 ? 116 : 100; g += `<text x="${100 + rr * Math.cos(mid)}" y="${100 + rr * Math.sin(mid) + 4}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--text)">${pl}%</text>`; }
    off += len;
  });
  if (!arr.length) g = `<circle cx="100" cy="100" r="70" fill="none" stroke="var(--card2)" stroke-width="38"/>`;
  return `<svg viewBox="-36 -36 272 272" width="70%" style="display:block;margin:6px auto 14px;overflow:visible">${g}</svg>`;
}
function scrGraficos() {
  if (!isDesk()) return scrGraficosMob();
  if (!isPremium()) return lockedCard('Gráficos completos', 'Projeção de 6 a 24 meses, categorias e ranking dos seus gastos.');
  let body = '';
  if (V.chart === 'projecao') {
    const D = monthsData(T0.slice(0, 7), V.projN);
    body = `${pills('projN', [[6, '6 Meses'], [12, '12 Meses'], [24, '24 Meses']], V.projN)}
    <div class="split proj-split"><div class="col">
    <div class="card"><div style="text-align:center;font-weight:700;font-size:15px;margin-bottom:6px">Fluxo de Caixa - ${V.projN} Meses</div>${projChart(D)}</div>
    </div><div class="col">
    ${pills('tblMode', [['mes', 'Mês'], ['ano', 'Ano'], ['periodo', 'Período']], V.tblMode)}
    ${periodNav(V.tblMode === 'mes' ? 'mensal' : V.tblMode === 'ano' ? 'anual' : 'periodo')}
    ${flowTable()}
    </div></div>`;
  } else if (V.chart === 'categoria') {
    const { arr, tot } = catAgg(V.catType, V.catMode);
    body = `${seg('catType', [['receita', 'Receita', 'rec'], ['despesa', 'Despesa', 'desp']], V.catType, 'rd')}
    ${pills('catMode', [['mensal', 'Mensal'], ['anual', 'Anual'], ['periodo', 'Período']], V.catMode)}
    ${periodNav(V.catMode)}
    <div class="card"><div class="split donut-split"><div class="col">${donut(arr, tot)}</div><div class="col"><div class="between" style="padding:12px 4px;border-top:1px solid var(--line)"><span class="muted">Total do período</span><b style="font-size:17px">${brl(tot)}</b></div>
    <div class="catlist">${arr.map((x, i) => { const c = cat(x.id); const op = V.open['c' + x.id]; return `<div class="it" data-act="toggle-open" data-k="c${x.id}"><span class="dot" style="background:${PALETTE[i % PALETTE.length]}"></span><span class="nm">${esc(c?.name || 'Sem categoria')}</span><small class="muted">${x.n}x</small><b>${brl(x.total)}</b><small class="muted" style="width:38px;text-align:right">${Math.round(x.total / tot * 100)}%</small>${I(op ? 'up' : 'right')}</div>${op ? x.list.map(t => `<div class="between small" style="padding:4px 26px"><span class="muted">${fmtD(t.date)} · ${esc(t.desc || '')}</span><span>${brl(t.amount)}</span></div>`).join('') : ''}`; }).join('')}</div></div></div></div>`;
  } else {
    const mode = V.rankMode === 'mes' ? 'mensal' : V.rankMode === 'ano' ? 'anual' : 'periodo';
    const R = catAgg('receita', mode), D = catAgg('despesa', mode);
    const rank = (o, col) => { const mx = Math.max(1, ...o.arr.map(x => x.total)); return o.arr.length ? `<div class="rank">${o.arr.slice(0, 10).map(x => `<div class="it"><span>${esc(cat(x.id)?.name || 'Sem categoria')}</span><div class="bar" style="width:${Math.max(2, x.total / mx * 78)}%;background:${col}"><em>${kfmt(x.total)}</em></div></div>`).join('')}</div>` : '<div class="empty">Sem dados</div>'; };
    body = `${pills('rankMode', [['mes', 'Mês Atual'], ['ano', 'Ano'], ['periodo', 'Período']], V.rankMode)}
    ${periodNav(mode)}
    <div class="split even"><div class="col">
    <div class="card"><div class="between"><b style="font-size:15px">Maiores Receitas por Categoria</b><b class="green">${brl(R.tot)}</b></div>${rank(R, '#34d399')}</div>
    </div><div class="col">
    <div class="card"><div class="between"><b style="font-size:15px">Maiores Despesas por Categoria</b><b class="red">${brl(D.tot)}</b></div>${rank(D, '#f87171')}</div>
    </div></div>`;
  }
  return `<h1>Gráficos</h1>${accChips()}${seg('chart', [['projecao', 'Projeção'], ['categoria', 'Categoria'], ['ranking', 'Ranking']], V.chart)}${body}`;
}



/* ---------- Aba Resumo (celular): análises rápidas do mês ---------- */
function gauge(pct, color) {
  const p = Math.max(0, Math.min(1, pct)), r = 80, cx = 100, cy = 96, L = Math.PI * r;
  const arc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const ang = Math.PI * (1 - p), nx = cx + (r - 22) * Math.cos(ang), ny = cy - (r - 22) * Math.sin(ang);
  return `<svg viewBox="0 0 200 112" width="100%" style="max-width:260px;display:block;margin:0 auto">
    <path d="${arc}" fill="none" stroke="var(--card2)" stroke-width="16" stroke-linecap="round"/>
    <path d="M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(Math.PI * 0.3)} ${cy - r * Math.sin(Math.PI * 0.3)}" fill="none" stroke="var(--green)" stroke-opacity=".22" stroke-width="16"/>
    <path d="${arc}" fill="none" stroke="${color}" stroke-width="16" stroke-linecap="round" stroke-dasharray="${L * p} ${L}"/>
    <circle cx="${cx + r * Math.cos(ang)}" cy="${cy - r * Math.sin(ang)}" r="9" fill="var(--card)" stroke="${color}" stroke-width="4"/>
    <text x="${cx - r}" y="${cy + 14}" text-anchor="middle" font-size="9" fill="var(--muted)">0%</text><text x="${cx + r}" y="${cy + 14}" text-anchor="middle" font-size="9" fill="var(--muted)">100%</text></svg>`;
}
function splitBar(parts) {
  const tot = parts.reduce((s2, p) => s2 + p.v, 0) || 1;
  return `<div class="sbar">${parts.map(p => `<i style="width:${p.v / tot * 100}%;background:${p.c}"></i>`).join('')}</div>
  <div class="sleg">${parts.map(p => `<span><i style="background:${p.c}"></i>${p.l}<b>${brl0(p.v)}</b><small>${Math.round(p.v / tot * 100)}%</small></span>`).join('')}</div>`;
}
function resumoMob() {
  const [y, m] = V.ym.split('-').map(Number), n = dim(y, m - 1), a = `${V.ym}-01`, b = `${V.ym}-${pad(n)}`;
  const L = txIn(a, b, { status: 'todos' });
  const rec = sumType(L, 'receita'), desp = sumType(L, 'despesa');
  const recP = sumType(L.filter(t => t.paid), 'receita'), despP = sumType(L.filter(t => t.paid), 'despesa');
  const pct = rec > 0 ? desp / rec : (desp > 0 ? 1 : 0);
  const gcol = pct < 0.7 ? 'var(--green)' : pct < 0.9 ? 'var(--orange)' : 'var(--red)';
  const gmsg = rec <= 0 ? 'Sem receitas lançadas neste mês.' : pct < 0.7 ? 'Ótimo! Sua renda cobre as despesas com folga.' : pct < 0.9 ? 'Atenção: pouca folga entre o que entra e o que sai.' : pct <= 1 ? 'Alerta: quase toda a renda está comprometida.' : 'As despesas passam da sua renda neste mês.';
  // fixas x variáveis
  const D = L.filter(t => t.type === 'despesa');
  const fixas = r2(D.filter(t => t.lote).reduce((s2, t) => s2 + +t.amount, 0)), varia = r2(desp - fixas);
  // gasto acumulado por dia
  let acc = 0; const cum = [];
  for (let d = 1; d <= n; d++) { const k = `${V.ym}-${pad(d)}`; acc += D.filter(t => t.date === k).reduce((s2, t) => s2 + +t.amount, 0); cum.push(acc); }
  const W = 360, H = 170, Lp = 10, Rp = 10, Tp = 22, Bp = 24, top = Math.max(rec, acc, 1) * 1.08;
  const xx = i => Lp + i / (n - 1) * (W - Lp - Rp), yy = v => Tp + (1 - v / top) * (H - Tp - Bp);
  let g = `<defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--red)" stop-opacity=".3"/><stop offset="1" stop-color="var(--red)" stop-opacity="0"/></linearGradient></defs>`;
  if (rec > 0) g += `<line x1="${Lp}" x2="${W - Rp}" y1="${yy(rec)}" y2="${yy(rec)}" stroke="var(--green)" stroke-width="2" stroke-dasharray="6 5"/><rect x="${Lp}" y="${yy(rec) - 19}" width="118" height="16" rx="8" fill="var(--green)"/><text x="${Lp + 59}" y="${yy(rec) - 7.5}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#fff">Renda ${brl0(rec)}</text>`;
  const isCur = V.ym === T0.slice(0, 7), td = +T0.slice(8);
  if (isCur) g += `<line x1="${xx(td - 1)}" x2="${xx(td - 1)}" y1="${Tp - 6}" y2="${H - Bp}" stroke="var(--accent)" stroke-width="1.5"/><text x="${xx(td - 1)}" y="${Tp - 9}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--accent)">hoje</text>`;
  const pts = cum.map((v, i) => `${xx(i)},${yy(v)}`).join(' ');
  g += `<polygon points="${xx(0)},${yy(0)} ${pts} ${xx(n - 1)},${yy(0)}" fill="url(#cg)"/><polyline points="${pts}" fill="none" stroke="var(--red)" stroke-width="2.8" stroke-linejoin="round"/>`;
  const lx = xx(n - 1), ly = yy(acc), lab = brl0(acc), tw = lab.length * 6.4 + 12;
  g += `<circle cx="${lx}" cy="${ly}" r="4.5" fill="var(--card)" stroke="var(--red)" stroke-width="2.5"/><rect x="${lx - tw}" y="${ly + 7}" width="${tw}" height="17" rx="8.5" fill="var(--red)"/><text x="${lx - tw / 2}" y="${ly + 19}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#fff">${lab}</text>`;
  [1, 8, 15, 22, n].forEach(d => { g += `<text x="${xx(d - 1)}" y="${H - 7}" text-anchor="middle" font-size="10.5" fill="var(--muted)">${d}</text>`; });
  [8, 15, 22].forEach(d => { const v = cum[d - 1]; if (!v || (isCur && d > td)) return; g += `<circle cx="${xx(d - 1)}" cy="${yy(v)}" r="3.5" fill="var(--card)" stroke="var(--red)" stroke-width="2"/><text x="${xx(d - 1)}" y="${yy(v) - 8}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--red)" stroke="var(--card)" stroke-width="3" paint-order="stroke">${kfmt(v)}</text>`; });
  // mês anterior por categoria
  const pym = ymAdd(V.ym, -1), [py, pm] = pym.split('-').map(Number);
  const P = txIn(`${pym}-01`, `${pym}-${pad(dim(py, pm - 1))}`, { status: 'todos', type: 'despesa' });
  const byc = (arr) => { const o = {}; for (const t of arr) o[t.categoryId || ''] = (o[t.categoryId || ''] || 0) + +t.amount; return o; };
  const cA = byc(D), cB = byc(P), keys = [...new Set([...Object.keys(cA), ...Object.keys(cB)])];
  const diffs = keys.map(k => ({ k, a: cA[k] || 0, b: cB[k] || 0, d: (cA[k] || 0) - (cB[k] || 0) })).filter(x => Math.abs(x.d) > 0.5).sort((x, z) => Math.abs(z.d) - Math.abs(x.d)).slice(0, 6);
  const despPrev = r2(P.reduce((s2, t) => s2 + +t.amount, 0)), dv = r2(desp - despPrev);
  // dívidas
  const debts = S.debts.map(d => ({ d, st: debtStats(d) })).filter(x => x.st.n);
  return `${periodNav('mensal')}
  <div class="card gcard"><div class="gt"><b>Quanto da renda está comprometida</b><small>despesas do mês ÷ receitas do mês</small></div>
    <div class="gauge">${gauge(pct, gcol)}<div class="gv"><b style="color:${gcol}">${rec > 0 ? Math.round(pct * 100) + '%' : '—'}</b><small>da renda</small></div></div>
    <p class="gmsg" style="border-color:${gcol}">${gmsg} ${rec > 0 ? (rec - desp >= 0 ? `Sobram <b class="green">${brl0(rec - desp)}</b>.` : `Faltam <b class="red">${brl0(desp - rec)}</b>.`) : ''}</p></div>
  <div class="card gcard"><div class="gt"><b>Pago x pendente</b><small>o que já aconteceu e o que ainda vai acontecer</small></div>
    <div class="pp"><div class="pp-h"><span>Receitas</span><b class="green">${brl0(rec)}</b></div>${splitBar([{ v: recP, c: 'var(--green)', l: 'Recebido' }, { v: r2(rec - recP), c: 'color-mix(in srgb,var(--green) 30%,transparent)', l: 'A receber' }])}</div>
    <div class="pp"><div class="pp-h"><span>Despesas</span><b class="red">${brl0(desp)}</b></div>${splitBar([{ v: despP, c: 'var(--red)', l: 'Pago' }, { v: r2(desp - despP), c: 'color-mix(in srgb,var(--red) 30%,transparent)', l: 'A pagar' }])}</div></div>
  <div class="card gcard"><div class="gt"><b>Despesas fixas x variáveis</b><small>fixas = contas que se repetem ou parcelas</small></div>
    ${desp > 0 ? splitBar([{ v: fixas, c: 'var(--accent)', l: 'Fixas' }, { v: varia, c: 'var(--orange)', l: 'Variáveis' }]) + `<p class="gmsg small">${fixas / desp > 0.6 ? 'A maior parte dos gastos é fixa: para economizar, renegocie contratos e parcelas.' : 'Boa parte dos gastos é variável: dá para economizar ajustando o dia a dia.'}</p>` : '<div class="empty">Sem despesas no mês.</div>'}</div>
  <div class="card gcard"><div class="gt"><b>Gastos ao longo do mês</b><small>despesas somadas dia a dia, comparadas com a renda</small></div><svg viewBox="0 0 ${W} ${H}" width="100%" class="gline">${g}</svg></div>
  <div class="card gcard"><div class="gt row-b"><span><b>Comparado a ${MESES[pm - 1].toLowerCase()}</b><small>despesas por categoria</small></span><span class="delta ${dv > 0 ? 'up' : 'down'}">${dv > 0 ? '▲' : '▼'} ${brl0(Math.abs(dv))}</span></div>
    ${diffs.length ? diffs.map(x => { const c = cat(x.k), up = x.d > 0, mx2 = Math.max(x.a, x.b, 1); return `<div class="cmp"><div class="cmp-h"><span class="nm">${c ? c.icon + ' ' : ''}${esc(c?.name || 'Sem categoria')}</span><span class="delta ${up ? 'up' : 'down'}">${up ? '▲' : '▼'} ${brl0(Math.abs(x.d))}</span></div>
      <div class="cmp-b"><small>${MES3[pm - 1]}</small><div class="gtrack"><i style="width:${x.b / mx2 * 100}%;background:var(--muted)"></i></div><em>${brl0(x.b)}</em></div>
      <div class="cmp-b"><small>${MES3[m - 1]}</small><div class="gtrack"><i style="width:${x.a / mx2 * 100}%;background:${up ? 'var(--red)' : 'var(--green)'}"></i></div><em>${brl0(x.a)}</em></div></div>`; }).join('') : '<div class="empty">Sem diferenças entre os dois meses.</div>'}</div>
  ${debts.length ? `<div class="card gcard"><div class="gt"><b>Quitação das dívidas</b><small>parcelas pagas de cada dívida</small></div>${debts.map(({ d, st }) => `<div class="cmp"><div class="cmp-h"><span class="nm">${esc(d.name)}</span><b>${st.paid}/${st.n}</b></div>
    <div class="cmp-b"><small>${Math.round(st.paid / st.n * 100)}%</small><div class="gtrack"><i style="width:${st.paid / st.n * 100}%;background:var(--accent)"></i></div><em class="red">${brl0(st.rem)}</em></div></div>`).join('')}<p class="gmsg small">Valor em vermelho = quanto ainda falta pagar.</p></div>` : ''}`;
}

/* ---------- Gráficos no celular: mais claros e com rótulos visíveis ---------- */
const brl0 = n => (n < -0.5 ? '-' : '') + 'R$ ' + Math.round(Math.abs(n)).toLocaleString('pt-BR');
const mlab = ym => `${MES3[+ym.slice(5) - 1]}/${ym.slice(2, 4)}`;
function saldoLine(D) {
  const W = 360, H = 200, L = 14, R = 14, T = 30, B = 30;
  const vals = D.map(d => d.saldo), mx = Math.max(...vals, 0), mn = Math.min(...vals, 0);
  const span = (mx - mn) || 1, y = v => T + (mx - v) / span * (H - T - B);
  const step = (W - L - R) / Math.max(1, D.length - 1), x = i => L + i * step;
  const every = D.length > 12 ? 4 : D.length > 6 ? 2 : 1, lev = D.length > 12 ? 2 : 1;
  const pts = D.map((d, i) => `${x(i)},${y(d.saldo)}`).join(' ');
  let g = `<defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".35"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>`;
  if (mn < 0 && mx > 0) g += `<line x1="${L}" x2="${W - R}" y1="${y(0)}" y2="${y(0)}" stroke="var(--muted)" stroke-dasharray="4 4" stroke-width="1"/><text x="${W - R}" y="${y(0) - 4}" text-anchor="end" font-size="10" fill="var(--muted)">R$ 0</text>`;
  g += `<polygon points="${L},${y(Math.max(mn, Math.min(0, mx)))} ${pts} ${x(D.length - 1)},${y(Math.max(mn, Math.min(0, mx)))}" fill="url(#sg)"/>`;
  g += `<polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`;
  D.forEach((d, i) => {
    const show = i % every === 0 || i === D.length - 1;
    const neg = d.saldo < 0, cx = x(i), cy = y(d.saldo);
    g += `<circle cx="${cx}" cy="${cy}" r="${show ? 4.5 : 3}" fill="var(--card)" stroke="${neg ? 'var(--red)' : 'var(--accent)'}" stroke-width="2.5"/>`;
  });
  D.forEach((d, i) => {
    const show = i % every === 0 || i === D.length - 1;
    const neg = d.saldo < 0, cx = x(i), cy = y(d.saldo);
    if (i % lev === 0 || i === D.length - 1) {
      const lab = kfmt(d.saldo), tw = lab.length * 6.6 + 10, down = (i / lev) % 2 === 1 && i !== D.length - 1;
      const ty = down ? Math.min(H - B - 4, cy + 22) : Math.max(14, cy - 12);
      const ax = Math.min(W - tw / 2 - 2, Math.max(tw / 2 + 2, cx));
      g += `<rect x="${ax - tw / 2}" y="${ty - 11}" width="${tw}" height="17" rx="8.5" fill="${neg ? 'var(--red)' : 'var(--accent)'}"/><text x="${ax}" y="${ty + 1.5}" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">${lab}</text>`;
    }
    if (show) {
      g += `<text x="${cx}" y="${H - 9}" text-anchor="middle" font-size="11" fill="var(--muted)" font-weight="${d.ym === T0.slice(0, 7) ? 700 : 500}">${MES3[+d.ym.slice(5) - 1]}${d.ym.slice(5) === '01' || i === 0 ? '/' + d.ym.slice(2, 4) : ''}</text>`;
    }
  });
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" class="gline">${g}</svg>`;
}
function scrGraficosMob() {
  let body = '';
  if (V.chart === 'resumo') body = resumoMob();
  else if (V.chart === 'projecao') {
    const D = monthsData(T0.slice(0, 7), V.projN);
    const tr = r2(D.reduce((s2, d) => s2 + d.rec, 0)), td = r2(D.reduce((s2, d) => s2 + d.desp, 0)), last = D[D.length - 1];
    const mx = Math.max(1, ...D.flatMap(d => [d.rec, d.desp]));
    body = `${pills('projN', [[6, '6 meses'], [12, '12 meses'], [24, '24 meses']], V.projN)}
    <div class="gsum"><div class="r"><small>Receitas</small><b>${brl0(tr)}</b></div><div class="d"><small>Despesas</small><b>${brl0(td)}</b></div><div class="s ${last.saldo < 0 ? 'neg' : ''}"><small>Saldo em ${mlab(last.ym)}</small><b>${brl0(last.saldo)}</b></div></div>
    <div class="card gcard"><div class="gt"><b>Evolução do saldo</b><small>saldo acumulado no fim de cada mês</small></div>${saldoLine(D)}</div>
    <div class="card gcard"><div class="gt"><b>Receitas x despesas por mês</b><small>a barra mostra o tamanho de cada valor</small></div>
    ${D.map(d => { const res = r2(d.rec - d.desp); return `<div class="gm ${d.ym === T0.slice(0, 7) ? 'cur' : ''}">
      <div class="gm-h"><b>${MESES[+d.ym.slice(5) - 1]} ${d.ym.slice(0, 4)}${d.ym === T0.slice(0, 7) ? ' <span class="tag">atual</span>' : ''}</b><span class="${res >= 0 ? 'green' : 'red'}">${res >= 0 ? 'Sobra' : 'Falta'} ${brl0(Math.abs(res))}</span></div>
      <div class="gb"><span>Receitas</span><div class="gtrack"><i class="r" style="width:${Math.max(1.5, d.rec / mx * 100)}%"></i></div><em class="green">${brl0(d.rec)}</em></div>
      <div class="gb"><span>Despesas</span><div class="gtrack"><i class="d" style="width:${Math.max(1.5, d.desp / mx * 100)}%"></i></div><em class="red">${brl0(d.desp)}</em></div>
      <div class="gm-f">Saldo no fim do mês: <b class="${d.saldo >= 0 ? '' : 'red'}">${brl(d.saldo)}</b></div></div>`; }).join('')}</div>
    ${pills('tblMode', [['mes', 'Mês'], ['ano', 'Ano'], ['periodo', 'Período']], V.tblMode)}
    ${periodNav(V.tblMode === 'mes' ? 'mensal' : V.tblMode === 'ano' ? 'anual' : 'periodo')}
    ${flowTable()}`;
  } else if (V.chart === 'categoria') {
    const { arr, tot } = catAgg(V.catType, V.catMode);
    const isR = V.catType === 'receita';
    body = `${seg('catType', [['despesa', 'Despesas', 'desp'], ['receita', 'Receitas', 'rec']], V.catType, 'rd')}
    ${pills('catMode', [['mensal', 'Mês'], ['anual', 'Ano'], ['periodo', 'Período']], V.catMode)}
    ${periodNav(V.catMode)}
    <div class="card gcard">
      ${arr.length ? `<div class="gdonut">${donut(arr, tot)}<div class="gc"><small>Total de ${isR ? 'receitas' : 'despesas'}</small><b class="${isR ? 'green' : 'red'}">${brl0(tot)}</b><small>${arr.length} categoria${arr.length > 1 ? 's' : ''}</small></div></div>
      <div class="gcats">${arr.map((x, i) => { const c = cat(x.id), pc = x.total / tot * 100, op = V.open['c' + x.id]; return `<div class="gcat" data-act="toggle-open" data-k="c${x.id}">
        <div class="gcat-h"><span class="dot" style="background:${PALETTE[i % PALETTE.length]}"></span><span class="nm">${c ? c.icon + ' ' : ''}${esc(c?.name || 'Sem categoria')}</span><b>${brl(x.total)}</b></div>
        <div class="gcat-b"><div class="gtrack"><i style="width:${Math.max(1.5, pc)}%;background:${PALETTE[i % PALETTE.length]}"></i></div><em>${pc.toFixed(pc < 10 ? 1 : 0).replace('.', ',')}%</em></div>
        ${op ? `<div class="gcat-l">${x.list.map(t => `<div><span>${fmtD(t.date)} · ${esc(t.desc || '')}</span><span>${brl(t.amount)}</span></div>`).join('')}</div>` : `<small class="muted">${x.n} lançamento${x.n > 1 ? 's' : ''} · toque para ver</small>`}</div>`; }).join('')}</div>`
      : `<div class="empty">Nenhuma ${isR ? 'receita' : 'despesa'} neste período.</div>`}</div>`;
  } else {
    const mode = V.rankMode === 'mes' ? 'mensal' : V.rankMode === 'ano' ? 'anual' : 'periodo';
    const R = catAgg('receita', mode), D = catAgg('despesa', mode);
    const rank = (o, col, ty) => o.arr.length ? o.arr.slice(0, 10).map((x, i) => { const c = cat(x.id), pc = x.total / (o.arr[0].total || 1) * 100, sh = x.total / o.tot * 100;
      return `<div class="grk"><span class="pos">${i + 1}º</span><div class="grk-m"><div class="grk-h"><span class="nm">${c ? c.icon + ' ' : ''}${esc(c?.name || 'Sem categoria')}</span><b class="${ty}">${brl(x.total)}</b></div>
      <div class="gcat-b"><div class="gtrack"><i style="width:${Math.max(1.5, pc)}%;background:${col}"></i></div><em>${sh.toFixed(0)}%</em></div></div></div>`; }).join('') : '<div class="empty">Sem dados no período.</div>';
    body = `${pills('rankMode', [['mes', 'Mês'], ['ano', 'Ano'], ['periodo', 'Período']], V.rankMode)}
    ${periodNav(mode)}
    <div class="card gcard"><div class="gt row-b"><b>Onde você mais gastou</b><b class="red">${brl0(D.tot)}</b></div>${rank(D, 'var(--red)', 'red')}</div>
    <div class="card gcard"><div class="gt row-b"><b>De onde veio o dinheiro</b><b class="green">${brl0(R.tot)}</b></div>${rank(R, 'var(--green)', 'green')}</div>`;
  }
  return `<h1>Gráficos</h1>${accChips()}${seg('chart', [['resumo', 'Resumo'], ['projecao', 'Projeção'], ['categoria', 'Categ.'], ['ranking', 'Ranking']], V.chart)}${body}`;
}

/* ---------- Ajustes ---------- */
const SKINS = [['padrao', '⚙️', 'Padrão', 'Tema padrão'], ['feminino', '🌸', 'Feminino', 'Tons de rosa'], ['minimal', '⬜', 'Minimal', 'Clean & moderno'], ['magico', '✨', 'Mágico', 'Azul royal, roxo e dourado'], ['uniao', '🌍', 'União dos Povos', 'Planeta Terra'], ['estiloso', '💜', 'Estiloso', 'Claro, roxo e cartões brancos'], ['ios', '📱', 'Elegante', 'Limpo e arredondado'], ['office', '📊', 'Executivo', 'Sóbrio, estilo planilha'], ['material', '🔵', 'Moderno', 'Cores suaves e formas amplas']];
function li(act, icon, title, sub, cls = '', extra = '') {
  return `<button class="li ${cls}" data-act="${act}" ${extra}>${I(icon)}<span class="tx2"><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</span>${cls ? '' : I('right')}</button>`;
}
function scrAjustes() {
  const st = S.settings;
  return `<div class="titlebar"><div><h1 style="margin-bottom:4px">Ajustes</h1><div class="muted" style="font-size:14px">${esc(S.profile.email || 'Seus dados ficam salvos neste aparelho')}</div></div>
  <img src="icons/logo.png?v=4" alt="Hankx" style="width:50px;height:50px;border-radius:13px"></div>
  <div class="split even"><div class="col">
  <div class="sect">APARÊNCIA</div>
  <div class="card"><div class="muted" style="margin-bottom:10px">Tema <small class="tdev">${isDesk() ? '💻 vale só para o computador' : '📱 vale só para o celular'}</small></div>
    <div class="opts">${[['light', 'sun', 'Claro'], ['dark', 'moon', 'Escuro'], ['auto', 'phone', 'Auto']].map(([v, ic, l]) => `<button class="opt ${st[TK()[1]] === v ? 'on' : ''}" data-act="theme" data-v="${v}"><span class="e accent" style="color:${st.theme === v ? 'var(--accent)' : 'var(--muted)'}">${I(ic)}</span><b>${l}</b></button>`).join('')}</div>
    <div class="muted" style="margin:16px 0 10px">Perfil de Interface</div>
    <div class="opts">${SKINS.map(([v, e, l, s]) => `<button class="opt ${st[TK()[0]] === v ? 'on' : ''}" data-act="skin" data-v="${v}"><span class="e">${e}</span><b>${l}</b><small>${s}</small></button>`).join('')}</div></div>
  <div class="sect">PERFIL</div>
  <div class="list">${li('go', 'user', 'Meu Perfil', '', '', 'data-sub="perfil"')}${CLOUD_ON ? li('premium', 'star', 'Hankx Premium', premiumLabel()) : ''}</div>
  ${isAdmin() ? `<div class="sect">ADMINISTRADOR</div><div class="list">${li('go', 'shield', 'Painel do administrador', 'Usuários, assinantes, receita e acessos de cortesia', '', 'data-sub="admin"')}</div>` : ''}
  <div class="sect">FERRAMENTAS</div>
  <div class="list">${li('go', 'spark', 'Orientação', 'O que pagar primeiro', '', 'data-sub="orientacao"')}${li('go', 'calc', 'Empréstimos', 'Simular parcelas e gerar lançamentos', '', 'data-sub="emprestimos"')}</div>
  <div class="sect">GESTÃO</div>
  <div class="list">${li('go', 'dollar', 'Contas', '', '', 'data-sub="contas"')}${li('go', 'shield', 'Categorias', '', '', 'data-sub="categorias"')}${li('go', 'card', 'Dívidas', '', '', 'data-sub="dividas"')}</div>
  </div><div class="col">
  <div class="sect">RELATÓRIOS</div>
  <div class="list">${li('rep-caixa', 'sheet', 'Planilha Controle de Caixa', 'Modelo de controle de caixa: descrições nas linhas, meses nas colunas, receitas, despesas e saldos (.xlsx)', 'c-green')}
  ${li('rep-pdf', 'file', 'Planilha Controle de Caixa em PDF', 'Mesmo modelo da planilha, pronto para imprimir (.pdf)', 'c-red')}
  ${li('rep-excel', 'sheet', 'Exportar para Excel', 'Receitas e despesas por categoria e mês, com saldo do mês e acumulado (.xlsx)', 'c-green')}
  ${li('rep-csv', 'chart', 'Exportar Fluxo de Caixa Diário', 'Lista diária de entradas, saídas e saldo acumulado (.csv)', 'c-blue')}</div>
  <div class="sect">DADOS</div>
  <div class="list"><button class="li" data-act="go" data-sub="sync">${I('ul')}<span class="tx2"><b>${CLOUD_ON ? 'Minha conta e nuvem' : 'Dados deste aparelho'}</b><small data-synclabel>${esc(syncLabel())}</small></span>${I('right')}</button>${li('backup', 'dl', 'Fazer backup', 'Gera arquivo .json para salvar no dispositivo', 'c-blue')}${li('restore', 'ul', 'Restaurar backup', 'Importar arquivo .json de backup', 'c-blue')}${li('clear', 'trash', 'Limpar dados', 'Apaga todos os lançamentos e reseta saldo', 'c-red')}</div>
  <div class="sect">CONTA</div>
  <div class="list">${CLOUD_ON ? li('go', 'user', esc(CL.session?.user?.email || 'Minha conta'), 'Dados salvos na nuvem', '', 'data-sub="sync"') : ''}${li('logout', 'lock', 'Sair', 'Pede login e senha de novo para abrir', 'c-red')}</div>
  </div></div>
  <p class="muted small" style="text-align:center;margin-top:24px">Hankx · ${CLOUD_ON ? 'dados salvos na nuvem com segurança' : 'dados salvos só neste aparelho'} · <a class="muted" href="../privacidade.html">Privacidade</a> · <a class="muted" href="../termos.html">Termos</a>.</p>`;
}
function backHead(title, right = '') {
  return `<button class="back" data-act="back">${I('left')} Ajustes</button><div class="titlebar"><h1>${title}</h1>${right}</div>`;
}
function scrPerfil() {
  const p = S.profile, age = ageOf(p.birth);
  const UFS = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');
  return `${backHead('Meu Perfil')}
  <div style="display:flex;justify-content:center;margin-bottom:18px"><label class="avatar" style="width:130px;height:130px;font-size:44px;${p.photo ? `background-image:url(${p.photo})` : ''};border:4px solid var(--accent)">${p.photo ? '' : esc((p.name || '?')[0].toUpperCase())}
  <span style="position:absolute;right:-4px;bottom:-4px;width:44px;height:44px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center">${I('camera')}</span>
  <input type="file" accept="image/*" id="photo" hidden></label></div>
  <label class="f"><span>Nome</span><input class="in" id="pName" value="${esc(p.name)}"></label>
  <label class="f"><span>Data de Nascimento</span><input class="in" type="date" id="pBirth" value="${esc(p.birth)}"></label>
  ${age != null ? `<p class="muted" style="margin:-8px 4px 14px">Idade calculada: <b style="color:var(--text)">${age} anos</b></p>` : ''}
  <label class="f"><span>CEP</span><input class="in" id="pCep" inputmode="numeric" value="${esc(p.cep)}" placeholder="00000-000"></label>
  <p class="muted small" style="margin:-8px 4px 14px">Digite o CEP para preencher cidade e estado automaticamente</p>
  <div class="row"><label class="f" style="flex:1"><span>Cidade</span><input class="in" id="pCity" value="${esc(p.city)}"></label>
  <label class="f" style="flex:1"><span>Estado (UF)</span><select class="in" id="pUf"><option value=""></option>${UFS.map(u => `<option ${p.uf === u ? 'selected' : ''}>${u}</option>`).join('')}</select></label></div>
  <label class="f"><span>E-mail</span><input class="in" type="email" id="pEmail" value="${esc(p.email)}"></label>
  <button class="btn primary" data-act="save-profile">Salvar perfil</button>
  ${p.photo ? '<button class="btn danger" data-act="del-photo" style="margin-top:10px">Remover foto</button>' : ''}`;
}
function scrContas() {
  const contas = S.accounts.filter(a => (a.kind || 'conta') === V.accTab);
  const total = r2(S.accounts.filter(a => a.kind !== 'cartao').reduce((s, a) => s + accBalance(a), 0));
  return `${backHead('Contas')}
  <div class="seg"><button class="${V.accTab === 'conta' ? 'on' : ''}" data-act="set" data-k="accTab" data-v="conta">${I('bank')} Contas</button><button class="${V.accTab === 'cartao' ? 'on' : ''}" data-act="set" data-k="accTab" data-v="cartao">${I('card')} Cartões</button></div>
  ${V.accTab === 'conta' ? `<div class="card between"><span class="muted" style="font-size:15px">Saldo total em caixa</span><b style="font-size:18px">${brl(total)}</b></div>` : ''}
  <div class="cardgrid">${contas.map(a => `<div class="card" style="${a.isDefault ? 'border-color:var(--accent)' : ''}"><div class="row" style="align-items:flex-start">
    ${accLogo(a, 'banklogo')}
    <div style="flex:1;min-width:0"><div class="between"><b style="font-size:16px">${esc(a.name)}</b>${a.isDefault ? '<span class="badge done" style="padding:2px 10px;font-size:12px">Padrão</span>' : ''}</div>
    <div class="muted small">${esc(a.kind === 'cartao' ? `Cartão${a.dueDay ? ' · vence dia ' + a.dueDay : ''}${a.limit ? ' · limite ' + brl(+a.limit) : ''}` : a.type || 'Conta corrente')}</div>
    <div class="between"><b style="font-size:16px;margin-top:4px">${brl(a.kind === 'cartao' ? -LIVE().filter(t => t.accountId === a.id && !t.paid && t.type === 'despesa').reduce((s, t) => s + +t.amount, 0) : accBalance(a))}</b>
    <span><button class="ib" data-act="acc-default" data-id="${a.id}" style="color:${a.isDefault ? 'var(--accent)' : 'var(--muted)'}">${I('star')}</button><button class="ib" data-act="acc-edit" data-id="${a.id}">${I('pen')}</button><button class="ib" data-act="acc-del" data-id="${a.id}">${I('trash')}</button></span></div></div></div></div>`).join('')}
  </div>
  <button class="ad" data-act="acc-edit">+ Adicionar ${V.accTab === 'conta' ? 'conta' : 'cartão'}</button>
  ${V.accTab === 'cartao' ? '<p class="muted small" style="margin-top:12px">No cartão, o valor exibido é o total de despesas ainda não pagas lançadas nele.</p>' : ''}`;
}
function scrCategorias() {
  const L = S.categories.filter(c => c.type === V.catTab).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  return `${backHead('Categorias', `<button class="ib" data-act="cat-edit">${I('plus')}</button>`)}
  ${seg('catTab', [['receita', 'Receita', 'rec'], ['despesa', 'Despesa', 'desp']], V.catTab, 'rd')}
  <div class="catgrid">${L.map(c => `<div class="catrow ${c.type === 'receita' ? 'rec' : ''}"><div class="em">${c.icon}</div><div class="nm">${esc(c.name)}</div><button class="ib" data-act="cat-edit" data-id="${c.id}">${I('pen')}</button><button class="ib" data-act="cat-del" data-id="${c.id}">${I('trash')}</button></div>`).join('')}</div>`;
}
function debtStats(d) {
  const tot = r2(d.installments.reduce((s, i) => s + +i.amount, 0));
  const paid = d.installments.filter(i => i.paid).length;
  const rem = r2(d.installments.filter(i => !i.paid).reduce((s, i) => s + +i.amount, 0));
  const late = d.installments.some(i => !i.paid && i.date < T0);
  return { tot, paid, rem, late, n: d.installments.length };
}
function scrDividas() {
  const total = r2(S.debts.reduce((s, d) => s + debtStats(d).rem, 0));
  return `${backHead('Dívidas', `<button class="ib" data-act="debt-edit">${I('plus')}</button>`)}
  <div class="card between"><span class="muted" style="font-size:15px">Total em aberto</span><b class="red" style="font-size:18px">${brl(total)}</b></div>
  ${S.debts.length ? '' : '<div class="empty">Nenhuma dívida cadastrada.<br><small>Toque em + para adicionar.</small></div>'}
  <div class="cardgrid">${S.debts.map(d => {
    const s = debtStats(d), op = V.open['d' + d.id];
    return `<div class="card"><div class="between" style="align-items:flex-start"><div><b style="font-size:17px">${esc(d.name)}</b>${d.desc ? `<div class="muted">${esc(d.desc)}</div>` : ''}</div>
    <span style="white-space:nowrap;flex:none"><button class="ib" data-act="debt-edit" data-id="${d.id}">${I('pen')}</button><button class="ib" data-act="debt-del" data-id="${d.id}">${I('trash')}</button></span></div>
    <div class="stats3"><div><small>Total</small><b>${brl(s.tot)}</b></div><div><small>Pagas</small><b class="green">${s.paid}/${s.n}</b></div><div><small>Remanescente</small><b class="red">${brl(s.rem)}</b></div></div>
    <div class="between">${s.rem <= 0 ? '<span class="badge done">Quitada</span>' : s.late ? '<span class="badge late">Atrasada</span>' : '<span class="badge ok">Em dia</span>'}
    <button class="muted" data-act="toggle-open" data-k="d${d.id}" style="font-size:14px">Parcelas ${I(op ? 'up' : 'down')}</button></div>
    ${op ? `<div class="hr" style="margin:14px -18px"></div>${d.installments.map((i, k) => `<button class="inst ${i.paid ? 'paid' : ''}" data-act="inst" data-id="${d.id}" data-k="${k}">${I(i.paid ? 'check' : 'circle')}<span class="nm">Parcela ${i.n}/${s.n}</span><span class="dt ${!i.paid && i.date < T0 ? 'red' : ''}">${fmtD(i.date)}</span><span class="v">${brl(+i.amount)}</span></button>`).join('')}` : ''}</div>`;
  }).join('')}</div>`;
}
function loanCalc() {
  const L = V.loan, i = parseMoney(L.i) / 100, n = parseInt(L.n) || 0;
  if (V.loanTab === 'prazo') {
    const pv = parseMoney(L.pv); if (!pv || !n) return null;
    const pmt = i ? pv * i / (1 - Math.pow(1 + i, -n)) : pv / n;
    return { pv, pmt, n, i, total: pmt * n, juros: pmt * n - pv, fv: pv * Math.pow(1 + i, n) };
  }
  const pmt = parseMoney(L.pmt); if (!pmt || !n) return null;
  const pv = i ? pmt * (1 - Math.pow(1 + i, -n)) / i : pmt * n;
  return { pv, pmt, n, i, total: pmt * n, juros: pmt * n - pv, fv: i ? pmt * (Math.pow(1 + i, n) - 1) / i : pmt * n };
}
function loanResult() {
  const r = loanCalc();
  if (!r) return `<div class="card empty" style="font-size:15px;padding:28px 16px">Preencha os campos para ver a simulação da parcela.</div>`;
  return `<div class="card result">
  <div class="between"><span class="muted">Valor ${V.loanTab === 'prazo' ? 'do empréstimo' : 'presente (quanto vale hoje)'}</span><b>${brl(r.pv)}</b></div>
  <div class="between"><span class="muted">Parcela mensal</span><b class="accent" style="font-size:20px">${brl(r.pmt)}</b></div>
  <div class="between"><span class="muted">&nbsp;&nbsp;↳ 40% no dia 15</span><span>${brl(r.pmt * .4)}</span></div>
  <div class="between"><span class="muted">&nbsp;&nbsp;↳ 60% no dia 30</span><span>${brl(r.pmt * .6)}</span></div>
  <div class="between"><span class="muted">Total pago (${r.n}x)</span><b>${brl(r.total)}</b></div>
  <div class="between"><span class="muted">Juros totais</span><b class="red">${brl(r.juros)}</b></div>
  <div class="between"><span class="muted">Valor futuro</span><b>${brl(r.fv)}</b></div>
  <div class="between"><span class="muted">Custo efetivo ao ano</span><b>${(Math.pow(1 + r.i, 12) * 100 - 100).toFixed(2).replace('.', ',')}%</b></div>
  <button class="btn primary" data-act="loan-go" style="margin-top:14px">Concretizar empréstimo</button></div>`;
}
function scrEmprestimos() {
  const L = V.loan;
  return `<button class="back" data-act="back">${I('left')} Ajustes</button>
  <div class="row" style="margin:10px 0 6px">${I('calc', 'accent')}<h1 style="margin:0;font-size:26px">Empréstimos</h1></div>
  <p class="muted" style="font-size:14px;margin-top:4px">Simule as parcelas e, ao concretizar, divida cada parcela em 40% no dia 15 e 60% no dia 30.</p>
  <div class="card">
  ${seg('loanTab', [['prazo', 'Prazo e juros'], ['parcela', 'Valor da parcela']], V.loanTab)}
  ${V.loanTab === 'prazo' ? `<label class="f"><span>Valor do empréstimo</span><div class="insuf"><input class="in" inputmode="decimal" data-loan="pv" value="${esc(L.pv)}" placeholder="10.000,00"><em>R$</em></div></label>`
      : `<label class="f"><span>Valor da parcela</span><div class="insuf"><input class="in" inputmode="decimal" data-loan="pmt" value="${esc(L.pmt)}" placeholder="850,00"><em>R$/mês</em></div></label>`}
  <label class="f"><span>Juros ao mês</span><div class="insuf"><input class="in" inputmode="decimal" data-loan="i" value="${esc(L.i)}" placeholder="1,5"><em>%</em></div></label>
  <label class="f"><span>Prazo</span><div class="insuf"><input class="in" inputmode="numeric" data-loan="n" value="${esc(L.n)}" placeholder="24"><em>meses</em></div></label>
  <p class="muted" style="margin:0">${V.loanTab === 'prazo' ? 'Informe o valor liberado, o juro mensal e o prazo para descobrir a parcela, o total pago e o valor futuro.' : 'Informe a parcela, o juro mensal e o prazo para descobrir o valor presente que esse pagamento representa e o valor futuro.'}</p></div>
  <div id="loanres">${loanResult()}</div>`;
}
function scrOrientacao() {
  const horizon = `${V.ym}-${pad(dim(+V.ym.slice(0, 4), +V.ym.slice(5) - 1))}`;
  const pend = LIVE().filter(t => accOk(t) && !t.paid && t.type === 'despesa' && t.date <= horizon);
  const income = LIVE().filter(t => accOk(t) && !t.paid && t.type === 'receita' && t.date <= horizon).reduce((s, t) => s + +t.amount, 0);
  const cash = balanceAt('9999-12-31', true);
  const ESS = /água|agua|energia|luz|gás|gas|aluguel|condom|internet|telefone|celular|saúde|saude|remédio|mercado|escola/i;
  const JUROS = /cartão|cartao|cheque|consignado|financiamento|empréstimo|emprestimo|imposto|iptu|ipva|multa|dívida|divida|acordo/i;
  const score = t => {
    const nm = (t.desc || '') + ' ' + (cat(t.categoryId)?.name || '');
    let s = 0, why = [];
    if (t.date < T0) { s += 1000 + (pd(T0) - pd(t.date)) / 864e5; why.push('está atrasada (juros e multa correndo)'); }
    if (ESS.test(nm)) { s += 300; why.push('é conta essencial (risco de corte)'); }
    if (JUROS.test(nm)) { s += 200; why.push('atraso gera juros altos ou restrição no nome'); }
    s += Math.max(0, 60 - (pd(t.date) - pd(T0)) / 864e5);
    if (!why.length) why.push('vence em ' + fmtD(t.date));
    return { t, s, why };
  };
  const R = pend.map(score).sort((a, b) => b.s - a.s);
  let avail = cash + income, totPend = 0;
  const rows = R.map((x, k) => {
    totPend += +x.t.amount; avail -= +x.t.amount; const ok = avail >= -0.005;
    return `<div class="adv"><div class="between"><span><span class="n">${k + 1}</span><b>${esc(x.t.desc || cat(x.t.categoryId)?.name || '')}</b></span><b class="red">${brl(x.t.amount)}</b></div>
    <div class="muted small" style="margin:6px 0 0 34px">${fmtD(x.t.date)} · ${x.why.join(' · ')}</div>
    <div class="small" style="margin:4px 0 0 34px">${ok ? '<span class="green">✓ Cabe no seu dinheiro previsto</span>' : `<span class="red">✗ Faltam ${brl(-avail)} até aqui</span>`}</div></div>`;
  }).join('');
  const sobra = r2(cash + income - totPend);
  return `${backHead('Orientação')}
  <p class="muted" style="margin-top:-6px">Prioridade sugerida para pagar as contas pendentes até o fim de ${MESES[+V.ym.slice(5) - 1].toLowerCase()}, com base no seu saldo e nas receitas previstas.</p>
  ${periodNav('mensal')}
  <div class="card result"><div class="between"><span class="muted">Saldo realizado hoje</span><b>${brl(cash)}</b></div>
  <div class="between"><span class="muted">Receitas ainda a receber</span><b class="green">${brl(income)}</b></div>
  <div class="between"><span class="muted">Contas pendentes</span><b class="red">${brl(totPend)}</b></div>
  <div class="between"><span class="muted">${sobra >= 0 ? 'Sobra prevista' : 'Falta prevista'}</span><b class="${sobra >= 0 ? 'green' : 'red'}" style="font-size:20px">${brl(sobra)}</b></div></div>
  ${R.length ? rows : '<div class="empty">Nenhuma conta pendente. 🎉</div>'}
  ${sobra < 0 && R.length ? `<div class="card"><b>Dicas</b><ul class="muted" style="padding-left:20px;margin:8px 0 0"><li>Negocie primeiro as últimas da lista: costumam ter menos multa.</li><li>Evite rolar fatura de cartão ou entrar no cheque especial, que têm os juros mais altos.</li><li>Se faltar só um pouco, veja se dá pra adiar despesas não essenciais.</li></ul></div>` : ''}
  <p class="muted small">Critérios: contas atrasadas primeiro, depois contas essenciais (água, luz, internet…), depois dívidas com juros altos e, por fim, pela data de vencimento.</p>`;
}



/* ======================= Nuvem (Supabase): contas, dados e Premium ======================= */
const CFG = window.HANKX_CONFIG || {};
const CLOUD_ON = !!(CFG.supabaseUrl && CFG.supabaseAnonKey && window.supabase);
const sb = CLOUD_ON ? window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }) : null;
const CL = { session: null, profile: null, busy: false, err: '', timer: null, ready: false, last: 0, dirty: false, recovery: false };
const IS_TWA = (() => { try { if (document.referrer.startsWith('android-app://')) sessionStorage.setItem('hankx-twa', '1'); return sessionStorage.getItem('hankx-twa') === '1'; } catch (e) { return false; } })();
const uidOf = () => CL.session?.user?.id;
function isPremium() {
  if (!CLOUD_ON || isAdmin()) return true;
  const p = CL.profile; if (!p) return true;
  const now = Date.now();
  return (p.premium_until && Date.parse(p.premium_until) > now) || (p.trial_ends_at && Date.parse(p.trial_ends_at) > now);
}
const isAdmin = () => CLOUD_ON && !!CL.admin; // quem é administrador é decidido pelo banco (função is_admin)
const isLifetime = () => { const p = CL.profile; return !!(p && p.premium_until && p.premium_until.slice(0, 4) >= '9000'); };
const PLAN_NAME = { mensal: 'Mensal', anual: 'Anual', vitalicio: 'Vitalício', cortesia: 'Cortesia' };
const isPaid = () => { const p = CL.profile; return !!(p && p.premium_until && Date.parse(p.premium_until) > Date.now()); };
const trialDaysLeft = () => { const p = CL.profile; return p && p.trial_ends_at ? Math.max(0, Math.ceil((Date.parse(p.trial_ends_at) - Date.now()) / 864e5)) : 0; };
function premiumLabel() {
  if (isAdmin()) return 'Administrador · tudo liberado';
  if (isPaid()) return isLifetime() ? `Premium vitalício${CL.profile.plan === 'cortesia' ? ' (cortesia)' : ''}` : `Ativo até ${fmtD(CL.profile.premium_until.slice(0, 10))} · ${PLAN_NAME[CL.profile.plan] || 'Premium'}`;
  const d = trialDaysLeft();
  return d ? `Teste grátis: ${d} dia${d > 1 ? 's' : ''} restante${d > 1 ? 's' : ''}` : 'Teste terminado — assine para liberar tudo';
}
function trialBanner() {
  if (isAdmin()) return '';
  if (!CLOUD_ON || !CL.profile || isPaid()) return '';
  const d = trialDaysLeft();
  return `<div class="pbanner ${d ? '' : 'end'}" data-act="premium">${I('star')}<span><b>${d ? `Teste Premium: ${d} dia${d > 1 ? 's' : ''} restante${d > 1 ? 's' : ''}` : 'Seu teste Premium terminou'}</b><small>${d ? 'Aproveite tudo liberado. Assine para não perder.' : 'Assine para voltar a usar gráficos, relatórios, dívidas e temas.'}</small></span><em>Assinar</em></div>`;
}
// plano grátis: até 2 receitas e 5 despesas por mês
const FREE_LIM = { receita: 2, despesa: 5 };
function overFreeLimit(news) {
  if (isPremium()) return null;
  const add = {};
  for (const t of news) { const k = t.type + '|' + t.date.slice(0, 7); add[k] = (add[k] || 0) + 1; }
  for (const [k, n] of Object.entries(add)) {
    const [ty, ym] = k.split('|');
    const have = S.transactions.filter(t => !t.canceled && t.type === ty && t.date.slice(0, 7) === ym).length;
    if (have + n > FREE_LIM[ty]) return { ty, ym };
  }
  return null;
}
function needPremium(feature) { if (isPremium()) return false; paywall(feature); return true; }
function lockedCard(title, desc) {
  return `<div class="card" style="text-align:center;padding:40px 20px;max-width:560px;margin:30px auto">${I('lock')}<h2 style="margin:12px 0 6px">${title}</h2><p class="muted">${desc}</p><button class="btn primary" data-act="premium" style="max-width:320px;margin:16px auto 0">Conhecer o Premium</button></div>`;
}
function paywall(reason = '') {
  const paid = isPaid(), d = trialDaysLeft();
  const perks = ['Lançamentos ilimitados (no grátis: 2 receitas e 5 despesas por mês)', 'Gráficos completos: projeção, categorias e ranking', 'Relatórios em Excel, PDF e CSV', 'Controle de dívidas e simulador de empréstimos', 'Orientação do que pagar primeiro', 'Várias contas e cartões', 'Todos os temas e perfis de interface'];
  openModal(`<div class="pw">
    <div class="pw-h"><img src="icons/logo.png?v=4" alt=""><div><b>Hankx Premium</b><small>${paid ? premiumLabel() : d ? `Seu teste grátis termina em ${d} dia${d > 1 ? 's' : ''}` : 'Seu teste grátis terminou'}</small></div></div>
    ${reason ? `<p class="pw-r">${I('lock')} <span><b>${esc(reason)}</b> faz parte do Premium.</span></p>` : ''}
    <ul class="pw-l">${perks.map(x => `<li>${I('check')}<span>${x}</span></li>`).join('')}</ul>
    ${paid ? `<p class="muted small">${isLifetime() || CL.profile.plan === 'cortesia' ? 'Seu acesso Premium já está garantido. Obrigado!' : CL.profile.provider === 'googleplay' ? 'Para cancelar ou mudar o plano: Play Store → Pagamentos e assinaturas → Assinaturas.' : 'Para cancelar: Mercado Pago → Assinaturas. O Premium continua até o fim do período pago.'}</p>`
      : `<div class="pw-plans three"><button type="button" class="pw-p" data-plan="mensal"><b>Mensal</b><strong>R$ 9,90<small>/mês</small></strong><small>cancele quando quiser</small></button>
      <button type="button" class="pw-p on" data-plan="anual"><span class="pw-tag">mais vantajoso</span><b>Anual</b><strong>R$ 89,90<small>/ano</small></strong><small>R$ 7,49 por mês</small></button>
      <button type="button" class="pw-p" data-plan="vitalicio"><span class="pw-tag gold">pague 1 vez</span><b>Vitalício</b><strong>R$ 199,90</strong><small>acesso para sempre</small></button></div>
      <button class="btn primary" id="pwgo">Assinar Premium</button>
      <p class="muted small" style="text-align:center;margin:10px 0 0">${IS_TWA ? 'Pagamento seguro pelo Google Play. Mensal e anual renovam automaticamente; cancele quando quiser na Play Store. Vitalício é pagamento único.' : 'Pagamento seguro por Pix ou cartão via Mercado Pago. Mensal e anual renovam automaticamente; cancele quando quiser. Vitalício é pagamento único.'}</p>`}
  </div>`);
  let plan = 'anual';
  $$('.pw-p').forEach(b => b.addEventListener('click', () => { plan = b.dataset.plan; $$('.pw-p').forEach(x => x.classList.toggle('on', x === b)); }));
  $('#pwgo')?.addEventListener('click', () => subscribe(plan));
}
async function subscribe(plan) {
  if (!CLOUD_ON) return toast('A assinatura fica disponível depois que a nuvem for configurada.');
  const btn = $('#pwgo'); btn.disabled = true; btn.textContent = 'Abrindo pagamento…';
  try {
    if ('getDigitalGoodsService' in window) return await playBuy(plan);
    if (IS_TWA) throw new Error('Atualize o app pela Play Store para assinar.');
    const { data, error } = await sb.functions.invoke('mp-subscribe', { body: { plan } });
    if (error || !data?.url) throw new Error(data?.error || 'Não foi possível abrir o pagamento agora. Tente de novo.');
    location.href = data.url;
  } catch (e) { toast(e.message); btn.disabled = false; btn.textContent = 'Assinar Premium'; }
}
async function playBuy(plan) {
  await window.getDigitalGoodsService('https://play.google.com/billing');
  const sku = (CFG.playSkus || {})[plan];
  const service = await window.getDigitalGoodsService('https://play.google.com/billing');
  const req = new PaymentRequest([{ supportedMethods: 'https://play.google.com/billing', data: { sku } }], { total: { label: 'Total', amount: { currency: 'BRL', value: '0' } } });
  const res = await req.show();
  const { data, error } = await sb.functions.invoke('play-verify', { body: { purchaseToken: res.details.purchaseToken, sku } });
  await res.complete(error || !data?.active ? 'fail' : 'success');
  if (error || !data?.active) throw new Error('Não foi possível confirmar a compra. Tente de novo em instantes.');
  await cloudLoadProfile(); closeModal(); applyTheme(); render(); toast('Premium ativado! 🎉');
}
async function playRestore() {
  try {
    if (!('getDigitalGoodsService' in window)) return;
    const service = await window.getDigitalGoodsService('https://play.google.com/billing');
    const list = await service.listPurchases();
    for (const p of list) await sb.functions.invoke('play-verify', { body: { purchaseToken: p.purchaseToken, sku: p.itemId } });
    if (list.length) { await cloudLoadProfile(); applyTheme(); render(); }
  } catch (e) { /* sem compras */ }
}
async function waitPayment() {
  history.replaceState(null, '', location.pathname);
  toast('Confirmando seu pagamento…');
  for (let i = 0; i < 8; i++) {
    await new Promise(r => setTimeout(r, 4000));
    await cloudLoadProfile();
    if (isPaid()) { applyTheme(); render(); return toast('Premium ativado! Obrigado 🎉'); }
  }
  toast('Pagamento recebido. O Premium é liberado assim que o Mercado Pago confirmar.');
}
async function cloudLoadProfile() {
  try { const r = await sb.rpc('is_admin'); CL.admin = r.data === true; } catch (e) { CL.admin = false; }
  try { const { data } = await sb.from('profiles').select('*').eq('id', uidOf()).maybeSingle(); if (data) CL.profile = data; } catch (e) { /* offline */ }
}
async function cloudAfterLogin() {
  STORE = KEY + ':' + uidOf(); load(); applyTheme();
  await cloudLoadProfile();
  try {
    const { data, error } = await sb.from('user_data').select('data,updated_at').eq('user_id', uidOf()).maybeSingle();
    if (error) throw error;
    const remote = data?.data;
    if (remote && remote.transactions) {
      if ((remote.updatedAt || 0) > (S.updatedAt || 0)) { S = remote; normalize(); save(true); applyTheme(); }
      else if ((S.updatedAt || 0) > (remote.updatedAt || 0)) { CL.ready = true; await cloudPush(); }
    } else {
      let legacy = null; try { legacy = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { /* nada */ }
      if (legacy && legacy.transactions && legacy.transactions.length && !S.transactions.length) {
        const r = await ask('Levar seus dados para a conta?', `Encontramos ${legacy.transactions.length} lançamentos salvos neste aparelho. Quer guardar na sua conta?`, [['y', 'Sim, levar meus dados', 'primary'], ['n', 'Não, começar do zero']]);
        if (r === 'y') { S = legacy; normalize(); }
      }
      S.profile.email ||= CL.session.user.email;
      if (!S.profile.name && CL.profile?.name) S.profile.name = CL.profile.name;
      save(true); CL.ready = true; await cloudPush();
    }
    CL.err = '';
  } catch (e) { console.error('nuvem', e); CL.err = cloudErr(e); }
  CL.ready = true;
  if (IS_TWA) playRestore();
}
function cloudErr(e) {
  const m = String(e?.message || e || ''), c = e?.code || '';
  if (c === '42501' || /permission denied/i.test(m)) return 'Sem permissão no banco (rode o SQL de permissões)';
  if (c === 'PGRST205' || c === '42P01' || /does not exist|could not find the table/i.test(m)) return 'Tabela não encontrada no banco (rode o schema.sql)';
  if (/row-level security/i.test(m)) return 'Bloqueado pela segurança do banco (regras RLS)';
  if (/JWT|token|apikey|api key/i.test(m)) return 'Login expirado: saia e entre de novo';
  if (/fetch|network|Failed/i.test(m)) return 'Sem conexão — tentaremos de novo';
  return 'Erro ao salvar: ' + m.slice(0, 90);
}
async function cloudPush() {
  if (!CLOUD_ON || !uidOf()) return;
  CL.busy = true; refreshSyncUI();
  const { error } = await sb.from('user_data').upsert({ user_id: uidOf(), data: S, updated_at: new Date().toISOString() });
  CL.busy = false;
  if (error) { console.error('nuvem', error); CL.err = cloudErr(error); CL.dirty = true; setTimeout(() => CL.dirty && cloudPush(), 30000); }
  else { CL.err = ''; CL.last = Date.now(); CL.dirty = false; }
  refreshSyncUI();
}
function cloudSchedule() { if (!CL.ready || !uidOf()) return; CL.dirty = true; clearTimeout(CL.timer); CL.timer = setTimeout(cloudPush, 2500); }
async function cloudRefresh() {
  if (!uidOf() || !CL.ready) return;
  if (CL.dirty) await cloudPush();
  await cloudLoadProfile();
  try {
    const { data } = await sb.from('user_data').select('data').eq('user_id', uidOf()).maybeSingle();
    if (data?.data && (data.data.updatedAt || 0) > (S.updatedAt || 0)) { S = data.data; normalize(); save(true); }
  } catch (e) { /* offline */ }
  applyTheme(); if (!$('#modal .sheet')) render();
}
async function cloudLogout() {
  if (CL.dirty) await cloudPush();
  try { await sb.auth.signOut(); } catch (e) { /* offline */ }
  CL.session = null; CL.profile = null; CL.admin = false; CL.ready = false; STORE = KEY; load(); V.tab = 'inicio'; V.sub = null; applyTheme(); showAuth('entrar');
}
async function deleteAccount() {
  const r = await ask('Excluir sua conta?', 'Isso apaga sua conta e TODOS os seus dados da nuvem, para sempre. Se quiser guardar uma cópia, faça um backup antes (Ajustes → Fazer backup).', [['y', 'Quero continuar', 'danger']]);
  if (!r) return;
  openModal(`<h3>Confirme a exclusão</h3>
  <p class="muted">Para confirmar, digite <b>EXCLUIR</b> e a sua senha.</p>
  <form id="delf"><label class="f"><span>Digite EXCLUIR</span><input class="in" name="word" autocomplete="off" autocapitalize="characters" required></label>
  <label class="f"><span>Sua senha</span><input class="in" name="pass" type="password" autocomplete="current-password" required></label>
  <p class="red small" id="delerr"></p>
  <div class="acts"><button class="btn danger" type="submit" id="delgo" disabled>Excluir definitivamente</button><button class="btn" type="button" data-act="close-modal">Cancelar</button></div></form>`);
  const f = $('#delf'), go = $('#delgo');
  f.word.focus();
  f.addEventListener('input', () => { go.disabled = f.word.value.trim().toUpperCase() !== 'EXCLUIR' || !f.pass.value; });
  f.addEventListener('submit', async e => {
    e.preventDefault(); go.disabled = true; $('#delerr').textContent = '';
    const email = CL.session?.user?.email;
    const chk = await sb.auth.signInWithPassword({ email, password: f.pass.value });
    if (chk.error) { $('#delerr').textContent = 'Senha incorreta.'; go.disabled = false; return; }
    const { error } = await sb.rpc('delete_my_account');
    if (error) { $('#delerr').textContent = 'Não foi possível excluir agora: ' + error.message; go.disabled = false; return; }
    closeModal();
    try { localStorage.removeItem(STORE); } catch (e2) { /* nada */ }
    CL.dirty = false; await cloudLogout(); toast('Conta excluída.');
  });
}
function authErr(m) {
  m = String(m || '');
  if (/invalid login/i.test(m)) return 'E-mail ou senha incorretos.';
  if (/not confirmed/i.test(m)) return 'Confirme seu e-mail pelo link que enviamos antes de entrar.';
  if (/already registered|already exists/i.test(m)) return 'Este e-mail já tem conta. Use "Entrar".';
  if (/password should be|at least/i.test(m)) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (/rate limit|too many/i.test(m)) return 'Muitas tentativas. Aguarde um minuto e tente de novo.';
  if (/fetch|network/i.test(m)) return 'Sem conexão com a internet.';
  return m;
}
function showAuth(mode = 'entrar', msg = '', ok = '') {
  $('#tabbar').innerHTML = ''; $('#fab').classList.add('hide'); document.body.classList.remove('logged');
  const T = { entrar: 'Entrar', criar: 'Criar conta', esqueci: 'Recuperar senha', nova: 'Criar nova senha' }[mode];
  $('#main').innerHTML = `<div class="loginwrap" style="min-height:82vh;display:flex;flex-direction:column;justify-content:center">
  <div style="text-align:center;margin-bottom:22px"><img src="icons/logo.png?v=4" alt="Hankx" style="width:84px;height:84px;border-radius:22px"><h1 style="margin:14px 0 4px">Hankx</h1><p class="muted" style="margin:0">${mode === 'criar' ? '7 dias de Premium grátis, sem cartão' : 'Seu dinheiro organizado em todos os aparelhos'}</p></div>
  ${mode === 'entrar' || mode === 'criar' ? `<div class="seg" style="margin-bottom:12px"><button class="${mode === 'entrar' ? 'on' : ''}" data-auth="entrar">Entrar</button><button class="${mode === 'criar' ? 'on' : ''}" data-auth="criar">Criar conta</button></div>` : ''}
  <form id="authf" class="card" autocomplete="on"><h3 style="margin:0 0 12px">${T}</h3>
  ${mode === 'criar' ? `<label class="f"><span>Seu nome</span><input class="in" name="name" autocomplete="name" required></label>` : ''}
  ${mode !== 'nova' ? `<label class="f"><span>E-mail</span><input class="in" name="email" type="email" autocomplete="email" autocapitalize="none" spellcheck="false" required></label>` : ''}
  ${mode !== 'esqueci' ? `<label class="f"><span>${mode === 'nova' ? 'Nova senha' : 'Senha'}</span><input class="in" name="pass" type="password" minlength="6" autocomplete="${mode === 'entrar' ? 'current-password' : 'new-password'}" required></label>` : ''}
  ${msg ? `<p class="red" style="margin:0 0 12px">${esc(msg)}</p>` : ''}${ok ? `<p class="green" style="margin:0 0 12px">${esc(ok)}</p>` : ''}
  <button class="btn primary">${{ entrar: 'Entrar', criar: 'Criar conta e começar', esqueci: 'Enviar link por e-mail', nova: 'Salvar nova senha' }[mode]}</button>
  ${mode === 'entrar' ? `<button type="button" class="lnk" data-auth="esqueci" style="display:block;margin:12px auto 0">Esqueci minha senha</button>` : ''}
  ${mode === 'esqueci' ? `<button type="button" class="lnk" data-auth="entrar" style="display:block;margin:12px auto 0">Voltar para entrar</button>` : ''}
  ${mode === 'criar' ? `<p class="muted small" style="margin:12px 0 0">Ao criar a conta você concorda com os <a href="../termos.html" class="accent">Termos de uso</a> e a <a href="../privacidade.html" class="accent">Política de privacidade</a>.</p>` : ''}
  </form>
  <p style="text-align:center;margin-top:16px"><a href="../" class="muted small">← Conhecer o Hankx</a></p></div>`;
  $$('[data-auth]').forEach(b => b.addEventListener('click', () => showAuth(b.dataset.auth)));
  $('#authf').addEventListener('submit', async e => {
    e.preventDefault(); const f = e.target, btn = f.querySelector('.btn.primary'); btn.disabled = true; btn.textContent = 'Aguarde…';
    const email = f.email?.value.trim().toLowerCase(), pass = f.pass?.value;
    const back = location.origin + location.pathname;
    try {
      if (mode === 'entrar') {
        const { data, error } = await sb.auth.signInWithPassword({ email, password: pass }); if (error) throw error;
        CL.session = data.session; await cloudAfterLogin(); render(false);
      } else if (mode === 'criar') {
        const { data, error } = await sb.auth.signUp({ email, password: pass, options: { data: { name: f.name.value.trim() }, emailRedirectTo: back } }); if (error) throw error;
        if (!data.session) return showAuth('entrar', '', `Quase lá! Enviamos um link de confirmação para ${email}. Abra o e-mail, confirme e depois entre aqui.`);
        CL.session = data.session; S.profile.name = f.name.value.trim(); await cloudAfterLogin(); render(false); toast('Conta criada! Seus 7 dias de Premium começaram 🎉');
      } else if (mode === 'esqueci') {
        const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: back }); if (error) throw error;
        showAuth('esqueci', '', 'Se existir uma conta com esse e-mail, enviamos um link para criar uma nova senha.');
      } else if (mode === 'nova') {
        const { error } = await sb.auth.updateUser({ password: pass }); if (error) throw error;
        CL.recovery = false; history.replaceState(null, '', location.pathname); await cloudAfterLogin(); render(false); toast('Senha alterada!');
      }
    } catch (err) { showAuth(mode, authErr(err.message)); }
  });
}
function scrConta() {
  const u = CL.session?.user;
  return `${backHead('Minha conta')}
  <div class="card"><div class="between"><span class="muted">E-mail</span><b>${esc(u?.email || '')}</b></div><div class="hr"></div>
  <div class="between"><span class="muted">Plano</span><b>${isAdmin() ? 'Administrador' : isPaid() ? 'Premium ' + (PLAN_NAME[CL.profile.plan] || '') : trialDaysLeft() ? 'Teste Premium' : 'Grátis'}</b></div><div class="hr"></div>
  <div class="between"><span class="muted">Situação</span><span class="small">${esc(premiumLabel())}</span></div><div class="hr"></div>
  <div class="between"><span class="muted">Nuvem</span><span class="small" data-synclabel>${esc(syncLabel())}</span></div></div>
  ${isAdmin() ? '' : `<button class="btn primary" data-act="premium">${isPaid() ? 'Ver meu plano' : 'Assinar Premium'}</button>`}
  <button class="btn" data-act="cloud-save" style="margin-top:10px">Salvar na nuvem agora</button>
  <p class="muted small" style="margin-top:14px">Seus dados ficam guardados com segurança na nuvem e aparecem em qualquer aparelho (celular ou computador) em que você entrar com este e-mail.</p>
  <div class="dzone"><b>Zona de perigo</b><p class="muted small">Excluir a conta apaga para sempre todos os seus lançamentos, contas e configurações. Não dá para desfazer.</p>
  <button class="lnk red" data-act="delete-account">Excluir minha conta…</button></div>`;
}
async function boot() {
  load(); applyTheme();
  if (!CLOUD_ON) { render(false); if (isLogged()) syncNow(); return; }
  sb.auth.onAuthStateChange((ev, session) => {
    if (ev === 'PASSWORD_RECOVERY') { CL.recovery = true; CL.session = session; showAuth('nova'); }
    else if (ev === 'SIGNED_OUT') CL.session = null;
    else if (session) CL.session = session;
  });
  $('#main').innerHTML = '<div class="empty" style="padding-top:40vh">Carregando…</div>';
  const { data: { session } } = await sb.auth.getSession();
  CL.session = session;
  if (CL.recovery || /type=recovery/.test(location.hash)) { CL.recovery = true; return showAuth('nova'); }
  if (session) await cloudAfterLogin();
  applyTheme(); render(false);
  if (session && /[?&]pago=1/.test(location.search)) waitPayment();
}

/* ======================= Login ======================= */
const AUTH_HASH = 'ee0b71d412bd5fc24c7b60efc3a5263de132b2857783cc7efe8a12857c688252';
const AUTH_KEY = 'hankx-fin-auth';
async function sha256(t) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}
const isLogged = () => { if (CLOUD_ON) return !!CL.session; try { return localStorage.getItem(AUTH_KEY) === AUTH_HASH || sessionStorage.getItem(AUTH_KEY) === AUTH_HASH; } catch (e) { return false; } };
function showLogin(msg = '') {
  if (CLOUD_ON) return showAuth('entrar', msg);
  $('#tabbar').innerHTML = ''; $('#fab').classList.add('hide');
  $('#main').innerHTML = `<div class="loginwrap" style="min-height:80vh;display:flex;flex-direction:column;justify-content:center">
  <div style="text-align:center;margin-bottom:28px"><img src="icons/logo.png?v=4" alt="Hankx" style="width:96px;height:96px;border-radius:24px"><h1 style="margin:16px 0 4px">Hankx</h1><p class="muted" style="margin:0">Entre para acessar</p></div>
  <form id="loginf" class="card" autocomplete="on">
  <label class="f"><span>Login</span><input class="in" name="user" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" required></label>
  <label class="f"><span>Senha</span><input class="in" name="pass" type="password" inputmode="numeric" autocomplete="current-password" required></label>
  <div class="between" style="margin-bottom:16px"><span>Manter conectado neste aparelho</span><label class="switch"><input type="checkbox" name="keep" checked><i></i></label></div>
  ${msg ? `<p class="red" style="margin:0 0 12px;text-align:center">${msg}</p>` : ''}
  <button class="btn primary">Entrar</button></form>
  <p style="text-align:center;margin-top:18px"><a href="../" class="muted small">← Voltar para hankx.com.br</a></p></div>`;
  $('#loginf').addEventListener('submit', async e => {
    e.preventDefault(); const f = e.target;
    let h = '';
    try { h = await sha256('hankx-fin|' + f.user.value.trim().toLowerCase() + '|' + f.pass.value.trim()); } catch (err) { return showLogin('Abra pelo endereço https://www.hankx.com.br/app/'); }
    if (h !== AUTH_HASH) return showLogin('Login ou senha incorretos');
    try { (f.keep.checked ? localStorage : sessionStorage).setItem(AUTH_KEY, AUTH_HASH); } catch (err) {}
    render(false); syncNow();
  });
}
function logout() { if (CLOUD_ON) return cloudLogout(); try { localStorage.removeItem(AUTH_KEY); sessionStorage.removeItem(AUTH_KEY); } catch (e) {} V.tab = 'inicio'; V.sub = null; showLogin(); }


/* ======================= Sincronização (nuvem Supabase) ======================= */
try { localStorage.removeItem('hankx-fin-sync'); } catch (e) { /* chave antiga do GitHub, não é mais usada */ }
const syncOn = () => CLOUD_ON;
function syncNow() { if (CLOUD_ON) return cloudRefresh(); }
function schedulePush() { if (CLOUD_ON) return cloudSchedule(); }
function syncLabel() {
  if (!CLOUD_ON) return 'Dados salvos só neste aparelho';
  if (CL.busy) return 'Salvando na nuvem…';
  if (CL.err) return '⚠️ ' + CL.err;
  return CL.last ? 'Salvo na nuvem · ' + new Date(CL.last).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Conectado à nuvem';
}
function refreshSyncUI() { $$('[data-synclabel]').forEach(el => el.textContent = syncLabel()); }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && isLogged()) syncNow(); });
window.addEventListener('online', () => isLogged() && syncNow());
function scrSync() {
  if (CLOUD_ON) return scrConta();
  return `${backHead('Dados')}<div class="card"><p class="muted" style="margin:0">Seus dados estão salvos só neste aparelho. Use <b>Fazer backup</b> para guardar uma cópia.</p></div>`;
}


/* ======================= Versão notebook (painel financeiro) ======================= */
const DESK_MQ = matchMedia('(min-width: 900px)');
const isDesk = () => DESK_MQ.matches;
DESK_MQ.addEventListener?.('change', () => { applyTheme(); if (isLogged()) render(false); });
const TITLES = { inicio: ['Visão geral', 'Resumo financeiro do período'], calendario: ['Calendário', 'Saldo e movimentação dia a dia'], transacoes: ['Lançamentos', 'Todas as receitas e despesas'], graficos: ['Análises', 'Projeção, categorias e ranking'], ajustes: ['Ajustes', 'Aparência, cadastros, relatórios e dados'],
  perfil: ['Meu Perfil', 'Ajustes'], contas: ['Contas e cartões', 'Ajustes'], categorias: ['Categorias', 'Ajustes'], dividas: ['Dívidas', 'Ajustes'], emprestimos: ['Empréstimos', 'Ferramentas'], orientacao: ['Orientação', 'Ferramentas'], sync: ['Minha conta e nuvem', 'Dados'], admin: ['Painel do administrador', 'Administrador'] };
function deskTop() {
  const k = V.tab === 'ajustes' && V.sub ? V.sub : V.tab, [t, sub] = TITLES[k] || ['', ''];
  const p = S.profile, h = new Date().getHours();
  const hi = (h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite') + (p.name ? ', ' + esc(p.name.split(' ')[0]) : '') + '!';
  const monthTabs = ['inicio', 'calendario'].includes(k);
  const mnav = monthTabs && (k === 'calendario' || V.mode === 'mensal') ? `<div class="mpill"><button data-act="nav" data-d="-1" data-m="m">${I('left')}</button><b>${MESES[+V.ym.slice(5) - 1]} ${V.ym.slice(0, 4)}</b><button data-act="nav" data-d="1" data-m="m">${I('right')}</button></div>` : '<span></span>';
  return `<header class="dtop"><div class="dtop-l">${k === 'inicio' ? `<div class="dtitle">${hi}</div><div class="crumb">Veja como estão suas finanças</div>` : `<div class="dtitle">${esc(t)}</div><div class="crumb">${esc(k === 'inicio' ? '' : sub)}</div>`}</div>
  ${mnav}
  <div class="dtop-r">
  <button class="dbtn primary topnew" data-act="new-tx">${I('plus')} Novo lançamento</button>
  <button class="duser" data-act="go" data-sub="perfil"><span class="avatar sm" style="${p.photo ? `background-image:url(${p.photo})` : ''}">${p.photo ? '' : esc((p.name || '?')[0].toUpperCase())}</span><span><b>${esc(p.name || 'Meu perfil')}</b><small>${esc(p.email || "")}</small></span></button></div></header>`;
}
function mcard(label, val, ic, cls, sub = '', act = '') {
  return `<div class="mcard ${cls}" ${act}><div><div class="ml">${label}</div><div class="mv">${val}</div>${sub ? `<div class="ms">${sub}</div>` : ''}</div><span class="mic">${I(ic)}</span></div>`;
}
function deskToolbar(o = {}) {
  const modes = o.modes || [['mensal', 'Mensal'], ['anual', 'Anual'], ['periodo', 'Período']];
  const isM = V.mode === 'mensal', nav = V.mode === 'periodo'
    ? `<input class="in sm" type="date" value="${V.from}" data-chg="from"><span class="muted">até</span><input class="in sm" type="date" value="${V.to}" data-chg="to">`
    : V.mode === 'todos' ? '' : `<div class="dnav"><button class="ib" data-act="nav" data-d="-1" data-m="${isM ? 'm' : 'y'}">${I('left')}</button><b>${isM ? monthLabel(V.ym) : V.year}</b><button class="ib" data-act="nav" data-d="1" data-m="${isM ? 'm' : 'y'}">${I('right')}</button><button class="lnk" data-act="nav-today">Hoje</button></div>`;
  const accs = `<select class="in sm" data-chg="acc"><option value="all">Todas as contas</option>${S.accounts.map(a => `<option value="${a.id}" ${V.acc === a.id ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select>`;
  const st = o.status || [['todos', 'Todos'], ['pendentes', 'Pendentes'], ['realizados', 'Realizados']];
  return `<div class="toolbar">${o.search ? `<div class="dsearch">${I('search')}<input id="q" placeholder="Buscar descrição, categoria, nota…" value="${esc(V.q)}" data-inp="q"></div>` : ''}
  ${accs}<div class="dseg">${modes.map(([v, l]) => `<button class="${V.mode === v ? 'on' : ''}" data-act="set" data-k="mode" data-v="${v}">${l}</button>`).join('')}</div>${nav}
  <span class="grow"></span><div class="dseg">${st.map(([v, l]) => `<button class="${V.status === v ? 'on' : ''}" data-act="set" data-k="status" data-v="${v}">${l}</button>`).join('')}</div>
  ${o.type ? `<div class="dseg">${[['todos', 'Todos'], ['receita', 'Receitas'], ['despesa', 'Despesas']].map(([v, l]) => `<button class="${V.type === v ? 'on' : ''}" data-act="set" data-k="type" data-v="${v}">${l}</button>`).join('')}</div>` : ''}</div>`;
}
function kpi(label, val, cls = '', sub = '', ic = '') {
  return `<div class="kpi ${cls}"><div class="kl">${ic ? I(ic) : ''}${label}</div><div class="kv">${val}</div>${sub ? `<div class="ks">${sub}</div>` : ''}</div>`;
}
function txStatus(t) {
  if (t.canceled) return '<span class="st cancel">Cancelado</span>';
  if (t.paid) return `<span class="st ok">${t.type === 'receita' ? 'Recebido' : 'Pago'}</span>`;
  if (t.date < T0) return '<span class="st late">Atrasado</span>';
  return '<span class="st pend">Pendente</span>';
}
function txTable(list, o = {}) {
  if (!list.length) return '<div class="empty">Nenhum lançamento neste período.</div>';
  const arrow = k => V.sort === k ? ' ▾' : '';
  return `<div class="dtwrap"><table class="dtable"><thead><tr>
  <th class="sortable" data-act="set" data-k="sort" data-v="data">Data${arrow('data')}</th><th>Descrição</th><th>Categoria</th>${o.compact ? '' : '<th>Conta</th>'}<th>Situação</th>
  <th class="r sortable" data-act="set" data-k="sort" data-v="valor">Valor${arrow('valor')}</th><th class="acts"></th></tr></thead><tbody>
  ${list.map(t => { const c = cat(t.categoryId), a = acc(t.accountId);
    return `<tr class="${t.type} ${t.canceled ? 'canceled' : ''} ${t.paid ? 'paid' : ''}" data-act="edit-tx" data-id="${t.id}">
    <td class="nw">${fmtD(t.date)}</td>
    <td><div class="dname">${esc(t.desc || c?.name || '')}${t.total > 1 ? ` <small class="muted">${t.idx}/${t.total}</small>` : ''}${t.lote ? ' ' + I('repeat') : ''}</div>${t.note ? `<small class="muted">${esc(t.note)}</small>` : ''}</td>
    <td class="nw">${c ? `${c.icon} ${esc(c.name)}` : '<span class="muted">—</span>'}</td>${o.compact ? '' : `<td class="nw">${a?.logo ? `<img class="alogo" src="${logoUrl(a.logo)}" alt="" onerror="this.outerHTML='<span class=adot style=background:${a.color}></span>'">` : `<span class="adot" style="background:${a?.color || '#888'}"></span>`}${esc(a?.name || '—')}</td>`}
    <td>${txStatus(t)}</td><td class="r nw val">${t.type === 'receita' ? '+' : '−'} ${brl(t.amount)}</td>
    <td class="acts nw">${t.canceled ? `<button class="ib" title="Reativar" data-act="uncancel-tx" data-id="${t.id}">${I('repeat')}</button>` : `<button class="ib ${t.paid ? 'green' : ''}" title="${t.paid ? 'Marcar como pendente' : 'Marcar como pago'}" data-act="toggle-paid" data-id="${t.id}">${I(t.paid ? 'check' : 'circle')}</button>`}<button class="ib" title="Excluir" data-act="del-tx" data-id="${t.id}">${I('trash')}</button></td></tr>`; }).join('')}
  </tbody></table></div>`;
}
function scrInicioDesk() {
  const [a, b] = range();
  const list = txIn(a, b);
  const rec = sumType(list, 'receita'), desp = sumType(list, 'despesa');
  const acum = balanceAt(b, V.status === 'realizados'), conta = saldoAtual();
  const recP = sumType(list.filter(t => t.paid), 'receita'), despP = sumType(list.filter(t => t.paid), 'despesa');
  const cards = S.accounts.filter(x => x.kind === 'cartao');
  const cardOpen = r2(LIVE().filter(t => cards.some(c => c.id === t.accountId) && !t.paid && t.type === 'despesa').reduce((s2, t) => s2 + +t.amount, 0));
  const soon = LIVE().filter(t => accOk(t) && overdue(t) && t.type === 'despesa' && t.date >= addDays(T0, -365)).sort((x, y) => x.date.localeCompare(y.date));
  const soonR = LIVE().filter(t => accOk(t) && overdue(t) && t.type === 'receita' && t.date >= addDays(T0, -365)).sort((x, y) => x.date.localeCompare(y.date));
  const { arr, tot } = catAgg('despesa', V.mode);
  const D = monthsData(T0.slice(0, 7), V.balN);
  const debtOpen = r2(S.debts.reduce((s2, d) => s2 + debtStats(d).rem, 0));
  const shown = sortTx(list.filter(t => V.homeType === 'todos' || t.type === V.homeType));
  const contas = S.accounts.filter(x => x.kind !== 'cartao');
  const pend = (L, cls) => L.length ? L.slice(0, 6).map(t => `<div class="mrow" data-act="edit-tx" data-id="${t.id}"><span class="mico ${cls}">${cat(t.categoryId)?.icon || I('card')}</span><span class="grow"><b>${esc(t.desc || cat(t.categoryId)?.name || '')}</b><small class="${t.date < T0 ? 'red' : 'muted'}">${t.date < T0 ? 'Atrasada · ' : 'Vence '}${fmtD(t.date)}</small></span><b class="${cls === 'r' ? 'green' : 'red'}">${brl(t.amount)}</b><button class="ib" data-act="toggle-paid" data-id="${t.id}" title="Marcar como ${cls === 'r' ? 'recebido' : 'pago'}">${I('circle')}</button></div>`).join('') : `<div class="mempty">${I('check')}<span>Tudo em dia por aqui</span></div>`;
  // balanço mensal: mês atual + próximos meses, com a linha do saldo acumulado
  const bal = `<div class="balpills">${pills('balN', [[6, '6 meses'], [12, '12 meses']], V.balN)}</div>${projChart(D, V.balN > 6 ? 640 : 520, 250, 'balsel')}`;
  return `
  ${V.mode !== 'mensal' || V.acc !== 'all' || V.status !== 'todos' ? deskToolbar() : `<div class="mfilters">${deskToolbar()}</div>`}
  <div class="mcards">
    ${mcard('Saldo atual', brl(conta), 'bank', 'blue', 'Realizados + vencidos')}
    ${mcard('Receitas', brl(rec), 'up', 'green', `Recebido ${brl(recP)}`)}
    ${mcard('Despesas', brl(desp), 'down2', 'red', `Pago ${brl(despP)}`)}
    ${mcard('Saldo previsto', brl(acum), 'trend', acum >= 0 ? 'purple' : 'red', 'No fim de ' + (V.mode === 'mensal' ? MESES[+V.ym.slice(5) - 1].toLowerCase() : 'período'))}
  </div>
  <div class="mgrid">
    <div class="mcol">
      <div class="mbox"><div class="mh"><b>Contas</b><button class="lnk" data-act="go" data-sub="contas">Gerenciar contas</button></div>
        ${contas.map(x => `<div class="mrow">${accLogo(x, 'mlogo')}<span class="grow"><b>${esc(x.name)}</b><small class="muted">${esc(x.type || 'Conta corrente')}</small></span><b class="${accBalance(x) < 0 ? 'red' : ''}">${brl(accBalance(x))}</b></div>`).join('')}
        <div class="mfoot"><span>Total</span><b>${brl(r2(contas.reduce((s2, x) => s2 + accBalance(x), 0)))}</b></div></div>
      <div class="mbox"><div class="mh"><b>Despesas por categoria</b><span class="muted small">${brl(tot)}</span></div>
        ${arr.length ? `<div class="mini-donut">${donut(arr, tot)}<div class="catlist">${arr.slice(0, 6).map((x, i) => `<div class="it"><span class="dot" style="background:${PALETTE[i % PALETTE.length]}"></span><span class="nm">${cat(x.id)?.icon || ''} ${esc(cat(x.id)?.name || 'Sem categoria')}</span><b>${brl(x.total)}</b><small class="muted" style="width:34px;text-align:right">${Math.round(x.total / tot * 100)}%</small></div>`).join('')}</div></div>` : `<div class="mempty">${I('pie')}<span>Sem despesas no período</span></div>`}</div>
      ${cards.length || debtOpen ? `<div class="mbox"><div class="mh"><b>Cartões e dívidas</b><button class="lnk" data-act="go" data-sub="dividas">Ver dívidas</button></div>
        ${cards.map(c => `<div class="mrow">${c.logo ? accLogo(c, 'mlogo') : `<span class="mlogo" style="background:${c.color}">${I('card')}</span>`}<span class="grow"><b>${esc(c.name)}</b><small class="muted">${c.dueDay ? 'Vence dia ' + esc(c.dueDay) : 'Cartão de crédito'}</small></span><b class="red">${brl(LIVE().filter(t => t.accountId === c.id && !t.paid && t.type === 'despesa').reduce((s2, t) => s2 + +t.amount, 0))}</b></div>`).join('')}
        ${S.debts.map(d => { const st = debtStats(d); return st.rem > 0 ? `<div class="mrow"><span class="mico d">${I('dollar')}</span><span class="grow"><b>${esc(d.name)}</b><small class="muted">${st.paid}/${st.n} parcelas pagas</small><span class="meter"><i style="width:${Math.round(st.paid / st.n * 100)}%"></i></span></span><b class="red">${brl(st.rem)}</b></div>` : ''; }).join('')}
        <div class="mfoot"><span>Total em aberto</span><b class="red">${brl(r2(debtOpen + cardOpen))}</b></div></div>` : ''}
    </div>
    <div class="mcol">
      ${trialBanner()}
      ${CL.err ? `<div class="mbanner" data-act="go" data-sub="sync">${I('info')}<span><b>${esc(CL.err)}</b></span>${I('right')}</div>` : ''}
      <div class="mbox"><div class="mh"><b>Balanço mensal</b><button class="lnk" data-act="tab" data-v="graficos">Ver relatórios</button></div>${bal}</div>
      <div class="mbox"><div class="mh"><b>Contas a pagar <small class="muted">vencidas</small></b><span class="badge late">${soon.length}</span></div>${pend(soon, 'd')}</div>
      <div class="mbox"><div class="mh"><b>Contas a receber <small class="muted">vencidas</small></b><span class="badge ok">${soonR.length}</span></div>${pend(soonR, 'r')}</div>
    </div>
  </div>
  <div class="mbox"><div class="mh"><b>Lançamentos do mês <span class="muted">(${shown.length})</span></b>
    <div class="dseg sm">${[['todos', 'Todos'], ['receita', 'Receitas'], ['despesa', 'Despesas']].map(([v, l]) => `<button class="${V.homeType === v ? 'on' : ''}" data-act="set" data-k="homeType" data-v="${v}">${l}</button>`).join('')}</div></div>
    ${txTable(shown)}</div>`;
}
function scrTransacoesDesk() {
  const [a, b] = range();
  const tot = txIn(a, b);
  const rec = sumType(tot, 'receita'), desp = sumType(tot, 'despesa');
  let list = txIn(a, b, { withCanceled: true });
  if (V.type !== 'todos') list = list.filter(t => t.type === V.type);
  if (V.q) { const q = V.q.toLowerCase(); list = list.filter(t => [t.desc, cat(t.categoryId)?.name, t.note, acc(t.accountId)?.name, t.lote].join(' ').toLowerCase().includes(q)); }
  const pend = sumType(tot.filter(t => overdue(t)), 'despesa');
  return `${deskToolbar({ search: true, type: true, modes: [['mensal', 'Mensal'], ['anual', 'Anual'], ['todos', 'Todos'], ['periodo', 'Período']], status: [['todos', 'Todos'], ['pendentes', 'Pendentes'], ['realizados', 'Realizados'], ['cancelados', 'Cancelados']] })}
  <div class="kpis k4">${kpi('Receitas', brl(rec), 'pos', '', 'cash')}${kpi('Despesas', brl(desp), 'neg', '', 'card')}${kpi('Resultado', brl(r2(rec - desp)), rec - desp >= 0 ? 'accent' : 'neg', '', 'chart')}${kpi('A pagar (vencido)', brl(pend), 'warn', '', 'bell')}</div>
  <div class="card dcard"><div class="dch"><b>${list.length} lançamentos</b><span class="muted small">Clique numa linha para editar · clique em Data ou Valor para ordenar</span></div>${txTable(sortTx(list))}</div>`;
}

/* faixa colorida do topo no celular (cor do tema) */
const MTITLES = { calendario: 'Calendário', transacoes: 'Transações', graficos: 'Gráficos', ajustes: 'Ajustes', perfil: 'Meu Perfil', contas: 'Contas', categorias: 'Categorias', dividas: 'Dívidas', emprestimos: 'Empréstimos', orientacao: 'Orientação', sync: 'Minha conta', admin: 'Administrador' };
function mobBar() {
  const k = V.tab === 'ajustes' && V.sub ? V.sub : V.tab;
  if (k === 'inicio') return '';
  return `<header class="mbar">${V.sub ? `<button class="mback" data-act="back" aria-label="Voltar">${I('left')}</button>` : ''}<div class="mbar-t">${esc(MTITLES[k] || '')}${V.sub ? '<small>Ajustes</small>' : ''}</div><div class="mbar-r"></div></header>`;
}

/* ======================= Painel do administrador (só aparece para quem o banco reconhece como admin) ======================= */
const AD = { stats: null, users: null, q: '', loading: false, err: '' };
async function adminLoad() {
  if (!isAdmin() || AD.loading) return;
  AD.loading = true; AD.err = '';
  try {
    const [st, us] = await Promise.all([sb.rpc('admin_stats'), sb.rpc('admin_users', { q: AD.q })]);
    if (st.error) throw st.error; if (us.error) throw us.error;
    AD.stats = st.data; AD.users = us.data || [];
  } catch (e) {
    const m = e.message || String(e);
    AD.err = /acesso negado/i.test(m) ? 'Acesso negado.' : /admin_|function|schema cache/i.test(m) ? 'Rode a PARTE 2 do schema.sql no Supabase para ativar o painel.' : 'Não foi possível carregar: ' + m;
  }
  AD.loading = false; if (V.sub === 'admin') render();
}
function userStatus(u) {
  const now = Date.now();
  if (u.premium_until && Date.parse(u.premium_until) > now) {
    const life = u.premium_until.slice(0, 4) >= '9000';
    return { cls: u.plan === 'cortesia' ? 'gift' : 'paid', txt: (PLAN_NAME[u.plan] || 'Premium') + (life ? (u.plan === 'vitalicio' ? '' : ' · vitalício') : ' · até ' + fmtD(u.premium_until.slice(0, 10))) };
  }
  if (u.trial_ends_at && Date.parse(u.trial_ends_at) > now) return { cls: 'trial', txt: 'Teste · ' + Math.ceil((Date.parse(u.trial_ends_at) - now) / 864e5) + ' dias' };
  return { cls: 'free', txt: 'Grátis' };
}
function scrAdmin() {
  if (!isAdmin()) { V.sub = null; return scrAjustes(); }
  if (!AD.stats && !AD.loading && !AD.err) adminLoad();
  const s = AD.stats || {}, n = v => Number(v || 0).toLocaleString('pt-BR');
  const paying = (+s.mensal || 0) + (+s.anual || 0) + (+s.vitalicio || 0);
  const conv = s.users ? Math.round(paying / s.users * 100) : 0;
  const BM = s.by_month || [], mx = Math.max(1, ...BM.map(x => +x.v));
  return `${backHead('Painel do administrador', `<button class="ib" data-act="admin-reload" title="Atualizar">${I('repeat')}</button>`)}
  ${AD.err ? `<div class="alert"><div class="h">${I('info')} Painel</div><span class="small">${esc(AD.err)}</span></div>` : ''}
  ${AD.loading && !AD.stats ? '<div class="empty">Carregando…</div>' : ''}
  ${AD.stats ? `
  <div class="akpis">
    <div class="ak"><small>Receita recorrente mensal</small><b class="green">${brl(+s.mrr)}</b><em>assinaturas mensal + anual</em></div>
    <div class="ak"><small>Receita no mês</small><b>${brl(+s.revenue_month)}</b><em>últimos 30 dias: ${brl(+s.revenue_30d)}</em></div>
    <div class="ak"><small>Receita total</small><b>${brl(+s.revenue_total)}</b><em>desde o início</em></div>
    <div class="ak"><small>Assinantes pagantes</small><b class="accent">${n(paying)}</b><em>${conv}% dos usuários</em></div>
    <div class="ak"><small>Usuários</small><b>${n(s.users)}</b><em>+${n(s.new_7d)} em 7 dias · +${n(s.new_30d)} em 30</em></div>
    <div class="ak"><small>Ativos (7 dias)</small><b>${n(s.active_7d)}</b><em>usaram o app na semana</em></div>
  </div>
  <div class="card"><b>Assinantes por plano</b>
    <div class="aplans">${[['Mensal', s.mensal, '#3b82f6'], ['Anual', s.anual, '#22c55e'], ['Vitalício', s.vitalicio, '#f59e0b'], ['Cortesia', s.cortesia, '#a855f7'], ['Em teste', s.trial, '#94a3b8']].map(([l, v, c]) => `<div><i style="background:${c}"></i><span>${l}</span><b>${n(v)}</b></div>`).join('')}</div></div>
  <div class="card"><b>Receita e novos usuários — últimos 6 meses</b>
    <div class="abars">${BM.map(x => `<div class="ab"><em>${+x.v ? brl0(+x.v) : ''}</em><div class="abb"><i style="height:${Math.max(2, +x.v / mx * 100)}%"></i></div><small>${MES3[+x.m.slice(5) - 1]}</small><span>+${n(x.u)} usuários</span></div>`).join('')}</div></div>
  ${(s.recent || []).length ? `<div class="card"><b>Últimos pagamentos</b>${s.recent.map(p => `<div class="between arow"><span><b>${esc(p.email || '—')}</b><small class="muted">${PLAN_NAME[p.plan] || p.plan} · ${p.provider === 'googleplay' ? 'Google Play' : 'Mercado Pago'} · ${fmtD(p.created_at.slice(0, 10))}</small></span><b class="green">${brl(+p.amount)}</b></div>`).join('')}</div>` : ''}
  <div class="sect">USUÁRIOS (${n((AD.users || []).length)})</div>
  <input class="in" id="adq" placeholder="Buscar por e-mail ou nome…" value="${esc(AD.q)}" style="margin-bottom:10px">
  <div class="ausers">${(AD.users || []).map(u => { const st = userStatus(u); return `<div class="au" data-act="admin-user" data-id="${u.id}">
    <span class="avatar sm">${esc(((u.name || u.email || '?')[0] || '?').toUpperCase())}</span>
    <span class="grow"><b>${esc(u.name || '(sem nome)')}</b><small>${esc(u.email || '')}</small><small class="muted">desde ${fmtD(u.created_at.slice(0, 10))}${u.last_active ? ' · usou em ' + fmtD(u.last_active.slice(0, 10)) : ''}</small></span>
    <span class="ast ${st.cls}">${esc(st.txt)}</span></div>`; }).join('') || '<div class="empty">Nenhum usuário encontrado.</div>'}</div>
  <p class="muted small">Toque em um usuário para dar ou tirar o Premium de cortesia. Este painel só aparece para o administrador.</p>` : ''}`;
}
async function adminUser(id) {
  const u = (AD.users || []).find(x => x.id === id); if (!u) return;
  const st = userStatus(u);
  const r = await ask(esc(u.name || u.email), `${esc(u.email)} · situação atual: <b>${esc(st.txt)}</b>${u.provider && u.provider !== 'admin' ? '<br><small>Este usuário paga pelo ' + (u.provider === 'googleplay' ? 'Google Play' : 'Mercado Pago') + '.</small>' : ''}`,
    [['30d', 'Premium grátis por 30 dias', 'primary'], ['90d', 'Premium grátis por 90 dias', 'primary'], ['1y', 'Premium grátis por 1 ano', 'primary'], ['vitalicio', 'Premium vitalício (cortesia)', 'primary'], ['remover', 'Remover Premium', 'danger']]);
  if (!r) return;
  const { error } = await sb.rpc('admin_grant', { target: id, mode: r });
  if (error) return toast('Não foi possível alterar: ' + error.message);
  toast(r === 'remover' ? 'Premium removido' : 'Premium concedido 🎁'); AD.stats = null; await adminLoad();
}

/* ======================= Render ======================= */
const TK = () => (typeof isDesk === 'function' && isDesk()) ? ['skinD', 'themeD'] : ['skin', 'theme']; // tema do celular x do computador
function applyTheme() {
  const st0 = S.settings, b = document.body;
  if (st0.skinD === undefined) { st0.skinD = st0.skin || 'padrao'; st0.themeD = st0.theme || 'dark'; }
  const [kS, kT] = TK();
  const st = { skin: st0[kS], theme: st0[kT], deskTheme: st0.deskTheme };
  if (st.skin === 'dos') st.skin = 'padrao';
  if (['windows', 'encantado'].includes(st.skin)) st.skin = 'padrao'; // temas antigos removidos
  if (st.skin === 'moderno') st.skin = 'ios';
  if (st.skin === 'masculino') { st.skin = 'padrao'; st0[kS] = 'padrao'; } // tema Masculino removido
  if (['bissexual', 'hetero', 'lesbica', 'diversidade', 'alegria'].includes(st.skin)) st.skin = 'magico';
  if (st.deskTheme === 'mobills') { st0.skinD = 'estiloso'; st0.deskTheme = 'app'; if (kS === 'skinD') st.skin = 'estiloso'; } // antigo "visual no notebook"
  const dark = st.theme === 'auto' ? matchMedia('(prefers-color-scheme: dark)').matches : st.theme === 'dark';
  const mob = st.skin === 'estiloso' && isPremium();
  const skin0 = st.skin; if (!isPremium()) st.skin = 'padrao';
  b.className = mob ? 'light skin-mobills' :  (dark || st.skin === 'dos' ? '' : 'light ') + 'skin-' + st.skin;
  if (typeof isLogged === 'function') { b.classList.toggle('logged', isLogged()); b.classList.toggle('desk', isDesk()); }
  st.skin = skin0; st0[kS] = st.skin;
  const meta = $('meta[name=theme-color]'); if (meta) meta.content = getComputedStyle(b).getPropertyValue('--bg2').trim() || '#12161f';
}
const DX = [['orientacao', 'spark', 'Orientação'], ['emprestimos', 'calc', 'Empréstimos'], ['dividas', 'card', 'Dívidas'], ['contas', 'dollar', 'Contas'], ['categorias', 'shield', 'Categorias']]; // só no computador
const TABS = [['inicio', 'home', 'Início'], ['calendario', 'cal', 'Calendário'], ['transacoes', 'list', 'Transações'], ['graficos', 'pie', 'Gráficos'], ['ajustes', 'gear', 'Ajustes']];
function render(keepScroll = true) {
  document.body.classList.toggle('logged', isLogged());
  document.body.dataset.scr = V.tab === 'ajustes' && V.sub ? V.sub : V.tab;
  if (!isLogged()) return showLogin();
  const y = window.scrollY;
  let h;
  if (V.tab === 'ajustes' && V.sub) h = ({ perfil: scrPerfil, contas: scrContas, categorias: scrCategorias, dividas: scrDividas, emprestimos: scrEmprestimos, orientacao: scrOrientacao, sync: scrSync, admin: scrAdmin })[V.sub]();
  else h = ({ inicio: isDesk() ? scrInicioDesk : scrInicio, calendario: scrCalendario, transacoes: isDesk() ? scrTransacoesDesk : scrTransacoes, graficos: scrGraficos, ajustes: scrAjustes })[V.tab]();
  document.body.classList.toggle('desk', isDesk());
  $('#main').innerHTML = isDesk() ? deskTop() + `<div class="scr">${h}</div>` : mobBar() + `<div class="scr-m">${h}</div>`;
  if (!isDesk()) { const r = $('#main .mbar-r'); if (r) $$('#main .scr-m .titlebar').forEach(tb => $$(':scope > .ib, :scope > img', tb).forEach(x => r.appendChild(x))); }
  $('#tabbar').innerHTML = `<div class="brand"><img src="icons/logo.png?v=4" alt=""><b>Hankx</b></div><button class="snew" data-act="new-tx">${I('plus')} Novo lançamento</button>` + TABS.map(([k, ic, l]) => {
    const isX = V.tab === 'ajustes' && DX.some(d => d[0] === V.sub);
    const b = `<button class="${V.tab === k && !(k === 'ajustes' && isX) ? 'on' : ''}" data-act="tab" data-v="${k}">${I(ic)}<span>${l}</span></button>`;
    return k === 'ajustes' ? `<div class="dxl">FERRAMENTAS</div>` + DX.map(([s, i2, l2]) => `<button class="dx ${V.tab === 'ajustes' && V.sub === s ? 'on' : ''}" data-act="go" data-sub="${s}">${I(i2)}<span>${l2}</span></button>`).join('') + b : b; }).join('');
  $('#fab').innerHTML = I('plus');
  $('#fab').classList.toggle('hide', !isLogged() || V.tab === 'ajustes' || V.tab === 'graficos');
  if (keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
  if (V.searching) { const q = $('#q'); if (q && document.activeElement !== q && V.focusQ) { q.focus(); V.focusQ = false; } }
}

/* ======================= Modal / toast ======================= */
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('on'), 2400); }
function openModal(html, cls = '') {
  $('#modal').innerHTML = `<div class="bk" data-act="close-bk"><div class="sheet ${cls}"><div class="grab"></div><button type="button" class="xclose" data-act="close-modal" aria-label="Fechar">${I('x')}</button>${html}</div></div>`;
  document.body.style.overflow = 'hidden';
}
function closeModal() { $('#modal').innerHTML = ''; document.body.style.overflow = ''; }
function ask(title, msg, options) {
  return new Promise(res => {
    openModal(`<h3>${title}</h3>${msg ? `<p class="muted">${msg}</p>` : ''}<div class="acts">${options.map(([v, l, cls]) => `<button class="btn ${cls || ''}" data-ans="${v}">${l}</button>`).join('')}<button class="btn" data-ans="">Cancelar</button></div>`);
    ask._res = v => { closeModal(); res(v || null); };
  });
}
$('#modal').addEventListener('click', e => {
  const a = e.target.closest('[data-ans]');
  if (a && ask._res) { const r = ask._res; ask._res = null; r(a.dataset.ans); }
});

/* ======================= Lançamentos ======================= */
function stepDate(start, freq, n, day) {
  switch (freq) {
    case 'diaria': return addDays(start, n);
    case 'semanal': return addDays(start, 7 * n);
    case 'quinzenal': return addDays(start, 15 * n);
    case 'anual': return addMonthsDay(start, 12 * n, day);
    default: return addMonthsDay(start, n, day);
  }
}
function genSeries(base, r, L = newLote()) {
  const out = [], maxN = r.end === 'parcelas' ? Math.max(1, parseInt(r.count) || 1) : 1200;
  const limit = r.end === 'ate' && r.until ? r.until : r.end === 'parcelas' ? '9999-12-31' : addMonthsDay(base.date, 60);
  const day = +base.date.slice(8);
  for (let n = 0; n < maxN; n++) {
    const d = stepDate(base.date, r.freq, n, day);
    if (d > limit) break;
    out.push({ ...base, id: uid(), date: d, paid: n === 0 ? !!base.paid : false, lote: L, idx: n + 1, total: r.end === 'parcelas' ? maxN : 0, recur: { ...r } });
  }
  return out;
}
function syncDebtFromTx(t) {
  for (const d of S.debts) for (const i of d.installments) if (i.txId === t.id) i.paid = t.paid;
}
function txForm(t) {
  const isNew = !t;
  const type = t?.type || (V.type === 'receita' ? 'receita' : 'despesa');
  t = t || { type, amount: '', date: V.calDay || (V.ym === T0.slice(0, 7) ? T0 : V.ym + '-01'), desc: '', categoryId: '', accountId: V.acc !== 'all' ? V.acc : defAcc()?.id, paid: false, note: '' };
  const r = t.recur || { freq: 'mensal', end: 'indefinido', until: '', count: 12 };
  const rep = !!t.lote;
  const accOpts = S.accounts.map(a => `<option value="${a.id}" ${a.id === t.accountId ? 'selected' : ''}>${esc(a.name)}${a.isDefault ? ' ★' : ''}${a.kind === 'cartao' ? ' (cartão)' : ''}</option>`).join('');
  openModal(`<h3>${isNew ? 'Novo lançamento' : 'Editar lançamento'}</h3>
  <form id="txf" data-id="${isNew ? '' : t.id}">
  <div class="seg rd" id="ftype"><button type="button" class="${type === 'despesa' ? 'on desp' : 'desp'}" data-ft="despesa">Despesa</button><button type="button" class="${type === 'receita' ? 'on rec' : 'rec'}" data-ft="receita">Receita</button></div>
  <input type="hidden" name="type" value="${type}">
  <div class="txcols"><div class="txc">
  <label class="f"><span>Valor</span><input class="in amount" name="amount" inputmode="decimal" placeholder="0,00" value="${t.amount !== '' ? num2(t.amount) : ''}" required></label>
  <label class="f"><span>Data</span><input class="in" type="date" name="date" value="${t.date}" required></label>
  <label class="f"><span>Descrição</span><input class="in" name="desc" value="${esc(t.desc)}" placeholder="Ex.: Conta de luz"></label>
  <label class="f"><span>Categoria</span><select class="in" name="categoryId" id="fcat"></select></label>
  <label class="f"><span>Conta</span><select class="in" name="accountId">${accOpts}</select></label>
  <div class="box between"><b>${type === 'receita' ? 'Recebido' : 'Pago'}</b><label class="switch"><input type="checkbox" name="paid" ${t.paid ? 'checked' : ''}><i></i></label></div>
  </div><div class="txc">
  <div class="box"><div class="between"><b style="font-size:16px">Repetir</b><label class="switch"><input type="checkbox" name="rep" id="frep" ${rep ? 'checked' : ''}><i></i></label></div>
   <div id="repbox" style="${rep ? '' : 'display:none'}"><div class="muted" style="margin:14px 0 8px">Frequência</div>
   <div class="chips" data-grp="freq">${[['diaria', 'Diária'], ['semanal', 'Semanal'], ['quinzenal', 'Quinzenal'], ['mensal', 'Mensal'], ['anual', 'Anual']].map(([v, l]) => `<button type="button" data-v="${v}" class="${r.freq === v ? 'on' : ''}">${l}</button>`).join('')}</div>
   <div class="muted" style="margin:6px 0 8px">Término</div>
   <div class="chips" data-grp="end">${[['indefinido', 'Indefinido'], ['ate', 'Até data'], ['parcelas', 'Parcelas']].map(([v, l]) => `<button type="button" data-v="${v}" class="${r.end === v ? 'on' : ''}">${l}</button>`).join('')}</div>
   <label class="f" id="funtil" style="${r.end === 'ate' ? '' : 'display:none'}"><span>Data final <b class="red">*</b></span><input class="in" type="date" name="until" value="${r.until || ''}"></label>
   <label class="f" id="fcount" style="${r.end === 'parcelas' ? '' : 'display:none'}"><span>Número de parcelas</span><input class="in" name="count" inputmode="numeric" value="${r.count || 12}"></label>
   <p class="muted small" id="findef" style="${r.end === 'indefinido' ? '' : 'display:none'};margin:0">Serão criados lançamentos pelos próximos 5 anos.</p>
   </div></div>
  ${t.lote ? `<div class="code">Código do lote: <b>${esc(t.lote)}</b>${t.total > 1 ? ` · parcela ${t.idx}/${t.total}` : ''}</div>` : ''}
  <label class="f"><span>Nota</span><textarea class="in" name="note" placeholder="Adicionar observação...">${esc(t.note || '')}</textarea></label>
  </div></div>
  <div class="txacts">${isNew ? '' : `<button type="button" class="btn" data-act="${t.canceled ? 'uncancel-tx' : 'cancel-tx'}" data-id="${t.id}" style="margin-bottom:10px">${I(t.canceled ? 'repeat' : 'x')} ${t.canceled ? 'Reativar lançamento' : 'Cancelar lançamento'}</button>
  <button type="button" class="btn danger" data-act="del-tx" data-id="${t.id}" style="margin-bottom:12px">${I('trash')} Excluir transação</button>`}
  <button class="btn primary" type="submit">${isNew ? 'Adicionar' : 'Salvar alterações'}</button></div>
  </form>`, 'txsheet');
  const f = $('#txf'); f._r = { ...r }; f._orig = isNew ? null : t;
  const fillCats = (ty, sel) => {
    $('#fcat').innerHTML = '<option value="">Sem categoria</option>' + S.categories.filter(c => c.type === ty).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')).map(c => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${c.icon} ${esc(c.name)}</option>`).join('');
  };
  fillCats(type, t.categoryId);
  f.addEventListener('click', e => {
    const ft = e.target.closest('[data-ft]');
    if (ft) { const ty = ft.dataset.ft; f.type.value = ty; $$('#ftype button').forEach(b => b.classList.toggle('on', b.dataset.ft === ty)); fillCats(ty, ''); f.querySelector('.box b').textContent = ty === 'receita' ? 'Recebido' : 'Pago'; }
    const ch = e.target.closest('[data-grp] button');
    if (ch) { const g = ch.parentElement.dataset.grp; f._r[g] = ch.dataset.v; $$('button', ch.parentElement).forEach(b => b.classList.toggle('on', b === ch));
      if (g === 'end') { $('#funtil').style.display = ch.dataset.v === 'ate' ? '' : 'none'; $('#fcount').style.display = ch.dataset.v === 'parcelas' ? '' : 'none'; $('#findef').style.display = ch.dataset.v === 'indefinido' ? '' : 'none'; } }
  });
  $('#frep').addEventListener('change', e => { $('#repbox').style.display = e.target.checked ? '' : 'none'; });
  f.amount.addEventListener('blur', () => { const v = parseMoney(f.amount.value); if (v) f.amount.value = num2(v); });
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const amount = r2(parseMoney(f.amount.value));
    if (!(amount > 0)) { toast('Informe um valor'); return; }
    if (!f.date.value) { toast('Informe a data'); return; }
    const base = { type: f.type.value, amount, date: f.date.value, desc: f.desc.value.trim(), categoryId: f.categoryId.value, accountId: f.accountId.value, paid: f.paid.checked, note: f.note.value.trim() };
    const repOn = f.rep.checked, R = { ...f._r, until: f.until.value, count: parseInt(f.count.value) || 12 };
    if (repOn && R.end === 'ate' && !R.until) { toast('Informe a data final'); return; }
    const o = f._orig;
    if (!o) {
      const news = repOn ? genSeries(base, R) : [{ ...base, id: uid() }];
      const lim = overFreeLimit(news);
      if (lim) { closeModal(); paywall(`Mais de ${FREE_LIM[lim.ty]} ${lim.ty === 'receita' ? 'receitas' : 'despesas'} por mês (${MES3[+lim.ym.slice(5) - 1]}/${lim.ym.slice(2, 4)})`); return; }
      S.transactions.push(...news);
    } else if (!o.lote) {
      if (repOn) { S.transactions = S.transactions.filter(x => x.id !== o.id); S.transactions.push(...genSeries(base, R)); }
      else { Object.assign(o, base); syncDebtFromTx(o); }
    } else {
      const scope = await ask('Lançamento recorrente', 'Aplicar a alteração em:', [['one', 'Só nesta'], ['next', 'Nesta e nas próximas', 'primary']]);
      if (!scope) return;
      if (scope === 'one') { Object.assign(o, base); if (!repOn) { delete o.lote; delete o.recur; o.total = 0; } syncDebtFromTx(o); }
      else {
        const same = repOn && base.date === o.date && JSON.stringify({ f: R.freq, e: R.end, u: R.until, c: R.count }) === JSON.stringify({ f: o.recur?.freq, e: o.recur?.end, u: o.recur?.until || '', c: o.recur?.count });
        if (same) {
          for (const x of S.transactions) if (x.lote === o.lote && x.date >= o.date) { Object.assign(x, { type: base.type, amount: base.amount, desc: base.desc, categoryId: base.categoryId, accountId: base.accountId, note: base.note }); }
          o.paid = base.paid; syncDebtFromTx(o);
        } else {
          S.transactions = S.transactions.filter(x => !(x.lote === o.lote && x.date >= o.date));
          if (repOn) S.transactions.push(...genSeries(base, R, o.lote)); else S.transactions.push({ ...base, id: uid() });
        }
      }
    }
    save(); closeModal(); render(); toast('Salvo');
  });
}
async function cancelTx(id, on) {
  const t = S.transactions.find(x => x.id === id); if (!t) return;
  const nm = esc(t.desc || cat(t.categoryId)?.name || '') + ' · ' + brl(t.amount);
  const msg = on ? 'O lançamento continua na lista como CANCELADO, mas não entra mais nos saldos, totais e gráficos.' : 'O lançamento volta a contar nos saldos e totais.';
  const opts = t.lote ? [['one', on ? 'Só este' : 'Reativar só este', on ? 'danger' : 'primary'], ['next', on ? 'Este e os próximos' : 'Este e os próximos', on ? 'danger' : 'primary']] : [['one', on ? 'Cancelar lançamento' : 'Reativar', on ? 'danger' : 'primary']];
  const scope = await ask((on ? 'Cancelar ' : 'Reativar ') + nm + '?', msg, opts);
  if (!scope) return;
  for (const x of S.transactions) if (x.id === id || (scope === 'next' && t.lote && x.lote === t.lote && x.date >= t.date)) { if (on) { x.canceled = true; x.paid = false; } else delete x.canceled; syncDebtFromTx(x); }
  save(); closeModal(); render(); toast(on ? 'Lançamento cancelado' : 'Lançamento reativado');
}
async function delTx(id) {
  const t = S.transactions.find(x => x.id === id); if (!t) return;
  let scope = 'one';
  if (t.lote) { scope = await ask('Excluir lançamento recorrente', esc(t.desc || cat(t.categoryId)?.name || ''), [['one', 'Só este', 'danger'], ['next', 'Este e os próximos', 'danger'], ['all', 'Toda a série', 'danger']]); }
  else { scope = await ask('Excluir lançamento?', `${esc(t.desc || cat(t.categoryId)?.name || '')} · ${brl(t.amount)}`, [['one', 'Excluir', 'danger']]); }
  if (!scope) return;
  const kill = x => x.id === id || (scope === 'next' && x.lote === t.lote && x.date >= t.date) || (scope === 'all' && x.lote === t.lote);
  const gone = new Set(S.transactions.filter(kill).map(x => x.id));
  S.transactions = S.transactions.filter(x => !gone.has(x.id));
  for (const d of S.debts) for (const i of d.installments) if (gone.has(i.txId)) delete i.txId;
  save(); closeModal(); render(); toast('Excluído');
}

/* ======================= Contas / categorias / dívidas ======================= */
const COLORS = ['#ec7000', '#cc092f', '#820ad1', '#005ca9', '#00a868', '#ffcc00', '#111827', '#0ea5e9', '#ef4444', '#14b8a6', '#6b7280', '#f97316'];
function accForm(id) {
  const a = id ? acc(id) : { name: '', kind: V.accTab, type: 'Conta corrente', initial: 0, color: COLORS[S.accounts.length % COLORS.length], dueDay: '', limit: '' };
  const isCard = a.kind === 'cartao';
  const bc0 = S.settings.bankCountry || 'BR', B = window.BANKS || {};
  openModal(`<h3>${id ? 'Editar' : 'Nova'} ${isCard ? 'cartão' : 'conta'}</h3><form id="af">
  <div class="bankpick"><button type="button" class="bankbtn" id="bkbtn"><span id="bkprev">${accLogo(a.name || a.logo ? a : { name: '?', color: 'var(--card2)' }, 'banklogo')}</span><span class="grow"><b id="bkname">${a.logo ? esc(a.bankName || a.name) : 'Escolher banco'}</b><small class="muted">Busque por país ou pelo nome</small></span>${I('down')}</button>
  <div id="bkpanel" class="bkpanel" style="display:${a.logo || id ? 'none' : 'block'}"><div class="bkrow"><select class="in" id="bkc">${Object.entries(B).map(([k, v]) => `<option value="${k}" ${k === bc0 ? 'selected' : ''}>${v[0]}</option>`).join('')}<option value="ALL">🌎 Todos os países</option></select><input class="in" id="bkq" placeholder="Buscar banco..." autocomplete="off"></div>
  <div class="bklist" id="bkl"></div></div></div>
  <input type="hidden" name="logo" value="${esc(a.logo || '')}"><input type="hidden" name="bankName" value="${esc(a.bankName || '')}">
  <label class="f" id="fname" style="${a.logo || (!id) ? 'display:none' : ''}"><span>Nome ${isCard ? 'do cartão' : 'da conta'}</span><input class="in" name="name" value="${esc(a.name)}" placeholder="${isCard ? 'Ex.: Cartão da loja' : 'Ex.: Carteira, Cofrinho'}"></label>
  ${isCard ? `<div class="row"><label class="f" style="flex:1"><span>Dia de vencimento</span><input class="in" name="dueDay" inputmode="numeric" value="${esc(a.dueDay || '')}"></label><label class="f" style="flex:1"><span>Limite</span><input class="in" name="limit" inputmode="decimal" value="${a.limit ? num2(a.limit) : ''}"></label></div>`
      : `<label class="f"><span>Tipo</span><select class="in" name="type">${['Conta corrente', 'Poupança', 'Carteira', 'Investimento', 'Conta salário'].map(x => `<option ${a.type === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
  <div class="row"><label class="f" style="flex:1"><span>Agência</span><input class="in" name="agency" inputmode="numeric" value="${esc(a.agency || '')}" placeholder="Opcional"></label><label class="f" style="flex:1.3"><span>Número da conta</span><input class="in" name="number" value="${esc(a.number || '')}" placeholder="Opcional"></label></div>
  <label class="f"><span>Saldo inicial</span><input class="in" name="initial" inputmode="decimal" value="${num2(a.initial || 0)}"></label>
  <p class="muted small" style="margin-top:-8px">O saldo da conta = saldo inicial + lançamentos pagos/recebidos + pendentes já vencidos.</p>`}
  <div class="box between" style="margin-bottom:14px"><span><b>${isCard ? 'Cartão padrão' : 'Conta padrão'}</b><small class="muted" style="display:block;font-size:12px">Já vem escolhida ao lançar uma transação</small></span><label class="switch"><input type="checkbox" name="isDefault" ${a.isDefault || !S.accounts.length ? 'checked' : ''}><i></i></label></div>
  <input type="hidden" name="color" value="${a.color}"><button class="btn primary">Salvar</button></form>`);
  const f = $('#af');
  const listBanks = () => {
    const c = $('#bkc').value, q = $('#bkq').value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const all = c === 'ALL' ? Object.values(B).flatMap(v => v[1]) : (B[c]?.[1] || []);
    const seen = new Set(), L = all.filter(x => !seen.has(x[1]) && seen.add(x[1]) && (!q || x[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q)));
    $('#bkl').innerHTML = L.map(([n, d, col]) => `<button type="button" class="bkit ${f.logo.value === d ? 'on' : ''}" data-bk="${d}" data-n="${esc(n)}" data-col="${col}">${accLogo({ name: n, logo: d, color: col }, 'banklogo sm')}<span>${esc(n)}</span></button>`).join('')
      + `<button type="button" class="bkit" data-bk="" data-n="">${accLogo({ name: '+', color: 'var(--muted)' }, 'banklogo sm')}<span>Outro (sem logotipo)</span></button>`;
  };
  listBanks();
  $('#bkc').addEventListener('change', () => { S.settings.bankCountry = $('#bkc').value === 'ALL' ? S.settings.bankCountry : $('#bkc').value; listBanks(); });
  $('#bkq').addEventListener('input', listBanks);
  f.addEventListener('click', e => {
    const b = e.target.closest('[data-c]'); if (b) { f.color.value = b.dataset.c; $$('.colors button', f).forEach(x => x.classList.toggle('on', x === b)); }
    if (e.target.closest('#bkbtn')) { const p = $('#bkpanel'); p.style.display = p.style.display === 'none' ? 'block' : 'none'; if (p.style.display === 'block') $('#bkq').focus(); }
    const k = e.target.closest('[data-bk]');
    if (k) {
      const prevBank = f.bankName.value, n = k.dataset.n, d = k.dataset.bk;
      f.logo.value = d; f.bankName.value = n;
      if (n) f.name.value = n; else if (f.name.value.trim() === prevBank) f.name.value = '';
      $('#fname').style.display = d ? 'none' : '';
      if (k.dataset.col) f.color.value = k.dataset.col;
      $('#bkprev').innerHTML = accLogo({ name: f.name.value || n || '?', logo: d, color: f.color.value }, 'banklogo');
      $('#bkname').textContent = n || 'Outro banco'; $('#bkpanel').style.display = 'none';
      if (!d) f.name.focus();
    }
  });
  f.addEventListener('submit', e => {
    e.preventDefault();
    const name = (f.logo.value ? f.bankName.value : f.name.value.trim()) || f.name.value.trim();
    if (!name) { toast('Escolha o banco ou digite um nome'); $('#bkpanel').style.display = 'block'; return; }
    const o = { name, color: f.color.value, kind: a.kind || 'conta', logo: f.logo.value, bankName: f.bankName.value };
    if (isCard) { o.dueDay = f.dueDay.value; o.limit = parseMoney(f.limit.value); o.initial = 0; } else { o.type = f.type.value; o.initial = r2(parseMoney(f.initial.value)); o.agency = f.agency.value.trim(); o.number = f.number.value.trim(); }
    let target = a;
    if (id) Object.assign(a, o); else { target = { id: 'acc_' + uid(), isDefault: false, ...o }; S.accounts.push(target); }
    if (f.isDefault.checked) S.accounts.forEach(x => x.isDefault = x === target); else if (target.isDefault && S.accounts.length > 1) { target.isDefault = false; }
    if (!S.accounts.some(x => x.isDefault)) S.accounts[0].isDefault = true;
    save(); closeModal(); render();
  });
}
const EMOJIS = '💰 📈 🎁 ✈️ 🏷️ 💵 🏦 💳 💧 ⚡ 🌐 📱 🏠 🚗 ⛽ 🛒 🍔 🍕 ☕ 🍺 💈 💊 🏥 🎓 📚 👶 🐶 🎉 🎮 🎬 👕 💄 🏋️ ⚽ 🧾 💡 🔧 🧹 🎵 🚌 🚕 🛵 🏨 🎂 🙏 💼 🖥️ 📦'.split(' ');
function catForm(id) {
  const c = id ? cat(id) : { name: '', type: V.catTab, icon: V.catTab === 'receita' ? '💰' : '🏷️' };
  openModal(`<h3>${id ? 'Editar' : 'Nova'} categoria</h3><form id="cf">
  ${seg('x', [['receita', 'Receita', 'rec'], ['despesa', 'Despesa', 'desp']], c.type, 'rd').replace(/data-act="set"/g, 'type="button"')}
  <input type="hidden" name="type" value="${c.type}"><input type="hidden" name="icon" value="${c.icon}">
  <label class="f"><span>Nome</span><input class="in" name="name" value="${esc(c.name)}" required></label>
  <div class="muted" style="margin-bottom:8px">Ícone</div><div class="emojis">${EMOJIS.map(e => `<button type="button" data-e="${e}" class="${c.icon === e ? 'on' : ''}">${e}</button>`).join('')}</div>
  <button class="btn primary">Salvar</button></form>`);
  const f = $('#cf');
  f.addEventListener('click', e => {
    const b = e.target.closest('[data-e]'); if (b) { f.icon.value = b.dataset.e; $$('.emojis button', f).forEach(x => x.classList.toggle('on', x === b)); }
    const s = e.target.closest('.seg button'); if (s) { f.type.value = s.dataset.v; $$('.seg button', f).forEach(x => x.classList.toggle('on', x === s)); }
  });
  f.addEventListener('submit', e => {
    e.preventDefault();
    const o = { name: f.name.value.trim(), type: f.type.value, icon: f.icon.value };
    if (id) Object.assign(c, o); else S.categories.push({ id: 'cat_' + uid(), ...o });
    save(); closeModal(); render();
  });
}
function catSelect(type, sel, name = 'categoryId') {
  return `<select class="in" name="${name}"><option value="">Sem categoria</option>${S.categories.filter(c => c.type === type).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')).map(c => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${c.icon} ${esc(c.name)}</option>`).join('')}</select>`;
}
const accSelect = (sel, name = 'accountId') => `<select class="in" name="${name}">${S.accounts.map(a => `<option value="${a.id}" ${a.id === sel ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select>`;
function debtForm(id) {
  const d = id ? S.debts.find(x => x.id === id) : null;
  if (d) {
    const unpaid = d.installments.find(i => !i.paid);
    openModal(`<h3>Editar dívida</h3><form id="df">
    <label class="f"><span>Nome</span><input class="in" name="name" value="${esc(d.name)}" required></label>
    <label class="f"><span>Descrição</span><input class="in" name="desc" value="${esc(d.desc || '')}"></label>
    ${unpaid ? `<label class="f"><span>Valor das parcelas em aberto</span><input class="in" name="amount" inputmode="decimal" value="${num2(unpaid.amount)}"></label>` : ''}
    <button class="btn primary">Salvar</button></form>`);
    $('#df').addEventListener('submit', e => {
      e.preventDefault(); const f = e.target; d.name = f.name.value.trim(); d.desc = f.desc.value.trim();
      if (f.amount) { const v = r2(parseMoney(f.amount.value)); if (v > 0) for (const i of d.installments) if (!i.paid) { i.amount = v; const t = S.transactions.find(x => x.id === i.txId); if (t) t.amount = v; } }
      save(); closeModal(); render();
    });
    return;
  }
  const consig = S.categories.find(c => c.type === 'despesa' && /empr|consig/i.test(c.name));
  openModal(`<h3>Nova dívida</h3><form id="df">
  <label class="f"><span>Nome</span><input class="in" name="name" required placeholder="Ex.: Acordo Bradesco"></label>
  <label class="f"><span>Descrição</span><input class="in" name="desc" placeholder="Opcional"></label>
  <div class="row"><label class="f" style="flex:1"><span>Valor da parcela</span><input class="in" name="amount" inputmode="decimal" required></label>
  <label class="f" style="flex:1"><span>Nº de parcelas</span><input class="in" name="n" inputmode="numeric" value="1" required></label></div>
  <div class="row"><label class="f" style="flex:1"><span>1ª parcela</span><input class="in" type="date" name="date" value="${T0}" required></label>
  <label class="f" style="flex:1"><span>Já pagas</span><input class="in" name="paid" inputmode="numeric" value="0"></label></div>
  <div class="box"><div class="between"><b>Lançar parcelas como despesa</b><label class="switch"><input type="checkbox" name="gen" checked><i></i></label></div>
  <p class="muted small">As parcelas em aberto aparecem no Início/Calendário, e marcar uma parcela como paga aqui também marca o lançamento. Parcelas já pagas não geram lançamento.</p>
  <label class="f"><span>Conta</span>${accSelect(defAcc()?.id)}</label><label class="f"><span>Categoria</span>${catSelect('despesa', consig?.id)}</label></div>
  <button class="btn primary">Adicionar</button></form>`);
  $('#df').addEventListener('submit', e => {
    e.preventDefault(); const f = e.target;
    const amount = r2(parseMoney(f.amount.value)), n = Math.max(1, parseInt(f.n.value) || 1), paidN = Math.min(n, parseInt(f.paid.value) || 0);
    if (!(amount > 0)) return toast('Informe o valor da parcela');
    const debt = { id: 'debt_' + uid(), name: f.name.value.trim(), desc: f.desc.value.trim(), installments: [] };
    const L = newLote(), day = +f.date.value.slice(8);
    for (let k = 0; k < n; k++) {
      const date = addMonthsDay(f.date.value, k, day), paid = k < paidN, inst = { n: k + 1, date, amount, paid };
      if (f.gen.checked && !paid) { const t = { id: uid(), type: 'despesa', amount, date, desc: debt.name, categoryId: f.categoryId.value, accountId: f.accountId.value, paid, note: debt.desc, lote: L, idx: k + 1, total: n, recur: { freq: 'mensal', end: 'parcelas', count: n } }; S.transactions.push(t); inst.txId = t.id; }
      debt.installments.push(inst);
    }
    S.debts.push(debt); V.open['d' + debt.id] = true;
    save(); closeModal(); render(); toast('Dívida adicionada');
  });
}
function loanGo() {
  const r = loanCalc(); if (!r) return;
  const cons = S.categories.find(c => c.type === 'despesa' && /empr/i.test(c.name)) || S.categories.find(c => c.type === 'despesa' && /consig/i.test(c.name));
  const nx = ymAdd(T0.slice(0, 7), 1);
  openModal(`<h3>Concretizar empréstimo</h3><p class="muted">${r.n}x de ${brl(r.pmt)} · total ${brl(r.total)}</p><form id="lf">
  <label class="f"><span>Nome</span><input class="in" name="name" value="Empréstimo" required></label>
  <label class="f"><span>Conta</span>${accSelect(defAcc()?.id)}</label>
  <label class="f"><span>Categoria das parcelas</span>${catSelect('despesa', cons?.id)}</label>
  <label class="f"><span>Mês da 1ª parcela</span><input class="in" type="month" name="first" value="${nx}"></label>
  <div class="box between"><span>Dividir 40% dia 15 / 60% dia 30</span><label class="switch"><input type="checkbox" name="split" checked><i></i></label></div>
  <div class="box"><div class="between"><span>Lançar valor recebido (${brl(r.pv)}) como receita</span><label class="switch"><input type="checkbox" name="inc"><i></i></label></div>
  <label class="f" style="margin:10px 0 0"><span>Data do crédito</span><input class="in" type="date" name="incDate" value="${T0}"></label></div>
  <div class="box between"><span>Registrar também em Dívidas</span><label class="switch"><input type="checkbox" name="debt" checked><i></i></label></div>
  <button class="btn primary">Gerar lançamentos</button></form>`);
  $('#lf').addEventListener('submit', e => {
    e.preventDefault(); const f = e.target, name = f.name.value.trim() || 'Empréstimo';
    const L = newLote(), out = [], debt = { id: 'debt_' + uid(), name, desc: `${r.n}x de ${brl(r.pmt)} · juros ${(r.i * 100).toFixed(2).replace('.', ',')}% a.m.`, installments: [] };
    let ym = f.first.value || nx, k = 0;
    const total = f.split.checked ? r.n * 2 : r.n;
    for (let p = 1; p <= r.n; p++) {
      const [y, m] = ym.split('-').map(Number), last = dim(y, m - 1);
      const parts = f.split.checked ? [[`${ym}-15`, r2(r.pmt * .4)], [`${ym}-${pad(Math.min(30, last))}`, r2(r.pmt - r2(r.pmt * .4))]] : [[`${ym}-${pad(Math.min(30, last))}`, r2(r.pmt)]];
      for (const [date, amount] of parts) {
        k++; const t = { id: uid(), type: 'despesa', amount, date, desc: `${name} ${p}/${r.n}${f.split.checked ? (date.endsWith('15') ? ' (40%)' : ' (60%)') : ''}`, categoryId: f.categoryId.value, accountId: f.accountId.value, paid: false, note: '', lote: L, idx: k, total };
        out.push(t); if (f.debt.checked) debt.installments.push({ n: k, date, amount, paid: false, txId: t.id });
      }
      ym = ymAdd(ym, 1);
    }
    if (f.inc.checked) { const rc = S.categories.find(c => c.type === 'receita' && /outros/i.test(c.name)); out.push({ id: uid(), type: 'receita', amount: r2(r.pv), date: f.incDate.value || T0, desc: name + ' (crédito)', categoryId: rc?.id || '', accountId: f.accountId.value, paid: false, note: '' }); }
    S.transactions.push(...out); if (f.debt.checked) S.debts.push(debt);
    save(); closeModal(); toast(`${out.length} lançamentos criados`); V.tab = 'inicio'; V.sub = null; render(false);
  });
}

/* ======================= Relatórios ======================= */
function cashMatrix(Y) {
  const rows = [], mon = [...Array(12).keys()];
  const ends = mon.map(m => `${Y}-${pad(m + 1)}-${pad(dim(Y, m))}`);
  const starts = mon.map(m => `${Y}-${pad(m + 1)}-01`);
  const txY = LIVE().filter(t => accOk(t) && t.date.startsWith(String(Y)));
  const byCat = ty => {
    const ids = [...new Set(txY.filter(t => t.type === ty).map(t => t.categoryId || ''))];
    return ids.map(id => ({ label: cat(id)?.name || 'Sem categoria', vals: mon.map(m => r2(txY.filter(t => t.type === ty && (t.categoryId || '') === id && +t.date.slice(5, 7) === m + 1).reduce((s, t) => s + +t.amount, 0))) })).sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
  };
  const tot = (L) => mon.map(m => r2(L.reduce((s, r) => s + r.vals[m], 0)));
  rows.push({ label: 'Saldo inicial', vals: starts.map(s => balanceAt(addDays(s, -1))), kind: 'h', noTotal: true });
  rows.push({ label: 'RECEITAS', kind: 'sec' });
  const R = byCat('receita'); rows.push(...R); const TR = tot(R); rows.push({ label: 'Total de receitas', vals: TR, kind: 'h' });
  rows.push({ label: 'DESPESAS', kind: 'sec' });
  const D = byCat('despesa'); rows.push(...D); const TD = tot(D); rows.push({ label: 'Total de despesas', vals: TD, kind: 'h' });
  rows.push({ label: 'Saldo do mês', vals: mon.map(m => r2(TR[m] - TD[m])), kind: 'h' });
  rows.push({ label: 'Saldo acumulado', vals: ends.map(e => balanceAt(e)), kind: 'h', noTotal: true, last: true });
  for (const r of rows) if (r.vals) r.total = r.noTotal ? (r.last ? r.vals[11] : r.vals[0]) : r2(r.vals.reduce((s, v) => s + v, 0));
  return rows;
}
function loadXLSX() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  return new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'vendor/xlsx.full.min.js'; s.onload = () => res(window.XLSX); s.onerror = () => rej(new Error('net')); document.head.appendChild(s); });
}
async function saveFile(blob, name) {
  const file = new File([blob], name, { type: blob.type });
  if (navigator.canShare && navigator.canShare({ files: [file] }) && /iPhone|iPad|Android/i.test(navigator.userAgent)) {
    try { await navigator.share({ files: [file], title: name }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
}
async function pickYear(title) {
  const ys = new Set(S.transactions.map(t => +t.date.slice(0, 4))); ys.add(+T0.slice(0, 4));
  const list = [...ys].sort();
  const y = await ask(title, 'Escolha o ano' + (V.acc !== 'all' ? ` (conta: ${esc(acc(V.acc)?.name)})` : ' (todas as contas)'), list.map(y => [String(y), String(y), y === +T0.slice(0, 4) ? 'primary' : '']));
  return y ? +y : null;
}
async function repCaixa() {
  const Y = await pickYear('Planilha Controle de Caixa'); if (!Y) return;
  let X; try { X = await loadXLSX(); } catch (e) { return toast('Não foi possível carregar o gerador de Excel'); }
  const rows = cashMatrix(Y);
  const aoa = [[`Controle de Caixa ${Y}${V.acc !== 'all' ? ' - ' + acc(V.acc)?.name : ''}`], [], ['Descrição', ...MES3, 'Total']];
  for (const r of rows) aoa.push(r.vals ? [r.label, ...r.vals, r.total] : [r.label]);
  const ws = X.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [{ wch: 26 }, ...Array(13).fill({ wch: 12 })];
  for (const k of Object.keys(ws)) if (k[0] !== '!' && typeof ws[k].v === 'number') ws[k].z = '#,##0.00';
  const wb = X.utils.book_new(); X.utils.book_append_sheet(wb, ws, 'Controle de Caixa ' + Y);
  const out = X.write(wb, { bookType: 'xlsx', type: 'array' });
  saveFile(new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `controle-de-caixa-${Y}.xlsx`);
}
async function repPdf() {
  const Y = await pickYear('Controle de Caixa em PDF'); if (!Y) return;
  const rows = cashMatrix(Y);
  $('#print').innerHTML = `<h2 style="margin:0 0 6px">Controle de Caixa ${Y}${V.acc !== 'all' ? ' – ' + esc(acc(V.acc)?.name) : ''}</h2><div style="margin-bottom:8px">${esc(S.profile.name || '')} · gerado em ${fmtD(T0)}</div>
  <table><tr class="h"><td>Descrição</td>${MES3.map(m => `<td>${m}</td>`).join('')}<td>Total</td></tr>
  ${rows.map(r => r.vals ? `<tr class="${r.kind === 'h' ? 'h' : ''}"><td>${esc(r.label)}</td>${r.vals.map(v => `<td>${num2(v)}</td>`).join('')}<td>${num2(r.total)}</td></tr>` : `<tr><td colspan="14"><b>${r.label}</b></td></tr>`).join('')}</table>`;
  toast('Na tela de impressão, escolha "Salvar como PDF" ou compartilhe');
  setTimeout(() => window.print(), 400);
}
async function repExcel() {
  const Y = await pickYear('Exportar para Excel'); if (!Y) return;
  let X; try { X = await loadXLSX(); } catch (e) { return toast('Não foi possível carregar o gerador de Excel'); }
  const rows = cashMatrix(Y).filter(r => r.label !== 'Saldo inicial');
  const a1 = [['Categoria', ...MES3, 'Total']];
  for (const r of rows) a1.push(r.vals ? [r.label, ...r.vals, r.total] : [r.label]);
  const tx = sortTx(S.transactions.filter(t => accOk(t) && t.date.startsWith(String(Y))), 'data');
  const a2 = [['Data', 'Descrição', 'Categoria', 'Conta', 'Tipo', 'Valor', 'Situação', 'Lote', 'Nota']];
  for (const t of tx) a2.push([fmtD(t.date), t.desc, cat(t.categoryId)?.name || '', acc(t.accountId)?.name || '', t.type === 'receita' ? 'Receita' : 'Despesa', t.type === 'receita' ? +t.amount : -t.amount, t.canceled ? 'Cancelado' : t.paid ? 'Realizado' : 'Pendente', t.lote || '', t.note || '']);
  const wb = X.utils.book_new();
  const w1 = X.utils.aoa_to_sheet(a1); w1['!cols'] = [{ wch: 24 }, ...Array(13).fill({ wch: 12 })];
  const w2 = X.utils.aoa_to_sheet(a2); w2['!cols'] = [{ wch: 10 }, { wch: 28 }, { wch: 18 }, { wch: 16 }, { wch: 9 }, { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 24 }];
  for (const w of [w1, w2]) for (const k of Object.keys(w)) if (k[0] !== '!' && typeof w[k].v === 'number') w[k].z = '#,##0.00';
  X.utils.book_append_sheet(wb, w1, 'Por categoria'); X.utils.book_append_sheet(wb, w2, 'Lançamentos');
  const out = X.write(wb, { bookType: 'xlsx', type: 'array' });
  saveFile(new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `hankx-financas-${Y}.xlsx`);
}
async function repCsv() {
  const Y = await pickYear('Fluxo de Caixa Diário'); if (!Y) return;
  const lines = ['Data;Entradas;Saídas;Saldo do dia;Saldo acumulado'];
  let bal = balanceAt(`${Y - 1}-12-31`);
  for (let d = `${Y}-01-01`; d <= `${Y}-12-31`; d = addDays(d, 1)) {
    const L = LIVE().filter(t => accOk(t) && t.date === d);
    const inc = sumType(L, 'receita'), out = sumType(L, 'despesa'); bal = r2(bal + inc - out);
    if (L.length) lines.push([fmtD(d), num2(inc), num2(out), num2(inc - out), num2(bal)].join(';'));
  }
  saveFile(new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), `fluxo-de-caixa-diario-${Y}.csv`);
}

/* ======================= Perfil ======================= */
function resizeImage(file) {
  return new Promise((res, rej) => {
    const img = new Image(); img.onload = () => {
      const s = 320, c = document.createElement('canvas'); c.width = c.height = s;
      const k = Math.max(s / img.width, s / img.height), w = img.width * k, h = img.height * k;
      c.getContext('2d').drawImage(img, (s - w) / 2, (s - h) / 2, w, h); res(c.toDataURL('image/jpeg', 0.82)); URL.revokeObjectURL(img.src);
    }; img.onerror = rej; img.src = URL.createObjectURL(file);
  });
}
function readProfileForm() {
  const p = S.profile;
  p.name = $('#pName').value.trim(); p.birth = $('#pBirth').value; p.cep = $('#pCep').value.trim();
  p.city = $('#pCity').value.trim(); p.uf = $('#pUf').value; p.email = $('#pEmail').value.trim();
}
async function cepLookup(cep) {
  const c = cep.replace(/\D/g, ''); if (c.length !== 8) return;
  try {
    const r = await fetch(`https://viacep.com.br/ws/${c}/json/`); const j = await r.json();
    if (j.erro) return toast('CEP não encontrado');
    $('#pCity').value = j.localidade || ''; $('#pUf').value = j.uf || ''; $('#pCep').value = c.slice(0, 5) + '-' + c.slice(5);
  } catch (e) { toast('Não foi possível consultar o CEP'); }
}

/* ======================= Eventos ======================= */
document.addEventListener('click', async e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const act = el.dataset.act, id = el.dataset.id;
  if (act === 'close-bk') { if (e.target === el) { if (ask._res) { const r = ask._res; ask._res = null; r(null); } else closeModal(); } return; }
  switch (act) {
    case 'close-modal': if (ask._res) { const r = ask._res; ask._res = null; r(null); } else closeModal(); break;
    case 'tab': V.tab = el.dataset.v; V.sub = null; V.calDay = null; V.projSel = null; render(false); break;
    case 'go': { const sub = el.dataset.sub, lock = { dividas: 'Controle de dívidas', emprestimos: 'Simulador de empréstimos', orientacao: 'Orientação de pagamentos' }[sub];
      if (lock && needPremium(lock)) break; V.tab = 'ajustes'; V.sub = sub; render(false); break; }
    case 'premium': paywall(); break;
    case 'delete-account': deleteAccount(); break;
    case 'back': V.sub = null; render(false); break;
    case 'acc': V.acc = id; render(); break;
    case 'set': { const k = el.dataset.k; let v = el.dataset.v; if (k === 'chart' && v !== 'resumo' && needPremium('Gráficos completos')) break; if (k === 'projN' || k === 'balN') v = +v; if (k === 'balN') V.balsel = null; V[k] = v; if (k === 'projN') V.projSel = null; if (k === 'mode' && v === 'periodo') { const [a, b] = range('mensal'); V.from = a; V.to = b; } render(); break; }
    case 'nav': { const d = +el.dataset.d; if (el.dataset.m === 'm') V.ym = ymAdd(V.ym, d); else V.year += d; V.calDay = null; render(); break; }
    case 'nav-today': V.ym = T0.slice(0, 7); V.year = +T0.slice(0, 4); V.calDay = null; render(); break;
    case 'new-tx': txForm(); break;
    case 'edit-tx': { const t = S.transactions.find(x => x.id === id); if (t) txForm(t); break; }
    case 'toggle-paid': { const t = S.transactions.find(x => x.id === id); if (t) { t.paid = !t.paid; syncDebtFromTx(t); save(); render(); toast(t.paid ? (t.type === 'receita' ? 'Marcado como recebido' : 'Marcado como pago') : 'Marcado como pendente'); } break; }
    case 'del-tx': delTx(id); break;
    case 'cancel-tx': cancelTx(id, true); break;
    case 'uncancel-tx': cancelTx(id, false); break;
    case 'cycle-home': V.homeType = { todos: 'despesa', despesa: 'receita', receita: 'todos' }[V.homeType]; render(); break;
    case 'search': V.searching = !V.searching; if (!V.searching) V.q = ''; V.focusQ = true; render(); break;
    case 'calday': V.calDay = V.calDay === el.dataset.d ? null : el.dataset.d; render(); break;
    case 'projsel': { const i = +el.dataset.i, k = el.dataset.key || 'projSel'; V[k] = V[k] === i ? null : i; render(); break; }
    case 'toggle-open': V.open[el.dataset.k] = !V.open[el.dataset.k]; render(); break;
    case 'theme': S.settings[TK()[1]] = el.dataset.v; save(); applyTheme(); render(); break;
    case 'desktheme': S.settings.deskTheme = el.dataset.v; save(); applyTheme(); render(); break;
    case 'skin': if (el.dataset.v !== 'padrao' && needPremium('Temas e perfis de interface')) break; S.settings[TK()[0]] = el.dataset.v; save(); applyTheme(); render(); break;
    case 'save-profile': readProfileForm(); save(); toast('Perfil salvo'); render(); break;
    case 'del-photo': S.profile.photo = ''; save(); render(); break;
    case 'acc-edit': if (!id && S.accounts.length >= 1 && needPremium('Várias contas e cartões')) break; accForm(id); break;
    case 'acc-default': S.accounts.forEach(a => a.isDefault = a.id === id); save(); render(); break;
    case 'acc-del': {
      const a = acc(id), n = S.transactions.filter(t => t.accountId === id).length;
      if (S.accounts.length === 1) return toast('Mantenha pelo menos uma conta');
      const r = await ask(`Excluir ${esc(a.name)}?`, n ? `${n} lançamentos desta conta também serão excluídos.` : '', [['y', 'Excluir', 'danger']]);
      if (!r) return; S.accounts = S.accounts.filter(x => x.id !== id); S.transactions = S.transactions.filter(t => t.accountId !== id);
      if (V.acc === id) V.acc = 'all'; if (!S.accounts.some(x => x.isDefault)) S.accounts[0].isDefault = true; save(); render(); break;
    }
    case 'cat-edit': catForm(id); break;
    case 'cat-del': {
      const c = cat(id), n = S.transactions.filter(t => t.categoryId === id).length;
      const r = await ask(`Excluir categoria ${esc(c.name)}?`, n ? `${n} lançamentos ficarão sem categoria.` : '', [['y', 'Excluir', 'danger']]);
      if (!r) return; S.categories = S.categories.filter(x => x.id !== id); S.transactions.forEach(t => { if (t.categoryId === id) t.categoryId = ''; }); save(); render(); break;
    }
    case 'debt-edit': debtForm(id); break;
    case 'debt-del': {
      const d = S.debts.find(x => x.id === id), linked = d.installments.filter(i => i.txId).length;
      const r = await ask(`Excluir ${esc(d.name)}?`, '', linked ? [['all', 'Excluir dívida e lançamentos', 'danger'], ['debt', 'Excluir só a dívida', 'danger']] : [['debt', 'Excluir', 'danger']]);
      if (!r) return; if (r === 'all') { const ids = new Set(d.installments.map(i => i.txId)); S.transactions = S.transactions.filter(t => !ids.has(t.id)); }
      S.debts = S.debts.filter(x => x.id !== id); save(); render(); break;
    }
    case 'inst': {
      const d = S.debts.find(x => x.id === id), i = d.installments[+el.dataset.k]; i.paid = !i.paid;
      const t = S.transactions.find(x => x.id === i.txId); if (t) t.paid = i.paid; save(); render(); break;
    }
    case 'loan-go': loanGo(); break;
    case 'admin-reload': AD.stats = null; adminLoad(); break;
    case 'admin-user': adminUser(id); break;
    case 'cloud-save': await cloudPush(); toast(CL.err || 'Salvo na nuvem'); render(); break;
    case 'logout': { const r = await ask('Sair do app?', 'Seus lançamentos continuam salvos neste aparelho.', [['y', 'Sair', 'danger']]); if (r) logout(); break; }
    case 'rep-caixa': if (needPremium('Relatórios em Excel, PDF e CSV')) break; repCaixa(); break;
    case 'rep-pdf': if (needPremium('Relatórios em Excel, PDF e CSV')) break; repPdf(); break;
    case 'rep-excel': if (needPremium('Relatórios em Excel, PDF e CSV')) break; repExcel(); break;
    case 'rep-csv': if (needPremium('Relatórios em Excel, PDF e CSV')) break; repCsv(); break;
    case 'backup': saveFile(new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' }), `hankx-backup-${T0}.json`); toast('Backup gerado'); break;
    case 'restore': {
      const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
      inp.onchange = async () => {
        try {
          const j = JSON.parse(await inp.files[0].text());
          if (!j || !Array.isArray(j.transactions) || !Array.isArray(j.accounts)) throw 0;
          const r = await ask('Restaurar backup?', `${j.transactions.length} lançamentos e ${j.accounts.length} contas. Os dados atuais serão substituídos.`, [['y', 'Restaurar', 'primary']]);
          if (!r) return; localStorage.setItem(KEY, JSON.stringify(j)); load(); save(); applyTheme(); V.acc = 'all'; render(false); toast('Backup restaurado');
        } catch (err) { toast('Arquivo de backup inválido'); }
      };
      inp.click(); break;
    }
    case 'clear': {
      const r = await ask('Limpar dados?', 'Apaga todos os lançamentos e dívidas e zera o saldo inicial das contas' + (syncOn() ? ', também na nuvem' : '') + '. Contas, categorias, perfil e tema são mantidos. Faça um backup antes.', [['y', 'Apagar tudo', 'danger']]);
      if (!r) return; S.transactions = []; S.debts = []; S.accounts.forEach(a => a.initial = 0); save(); render(); toast('Dados apagados'); break;
    }
  }
});

document.addEventListener('change', async e => {
  const el = e.target;
  if (el.dataset.chg) { V[el.dataset.chg] = el.value; render(); }
  if (el.id === 'photo' && el.files[0]) { try { readProfileForm(); S.profile.photo = await resizeImage(el.files[0]); save(); render(); } catch (err) { toast('Imagem inválida'); } }
  if (el.id === 'pCep') cepLookup(el.value);
});
document.addEventListener('input', e => {
  const el = e.target;
  if (el.id === 'adq') { AD.q = el.value; clearTimeout(AD.t); AD.t = setTimeout(() => { adminLoad().then(() => { const q = $('#adq'); if (q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }); }, 400); return; }
  if (el.dataset.inp === 'q') { V.q = el.value; const pos = el.selectionStart; render(); const q = $('#q'); q.focus(); q.setSelectionRange(pos, pos); }
  if (el.dataset.loan) { V.loan[el.dataset.loan] = el.value; $('#loanres').innerHTML = loanResult(); }
  if (el.id === 'pCep' && el.value.replace(/\D/g, '').length === 8) cepLookup(el.value);
});
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { if (S.settings[TK()[1]] === 'auto') { applyTheme(); render(); } });

/* ======================= Início ======================= */
boot();
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
