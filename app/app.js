/* HANKX Finanças — app pessoal de controle financeiro (PWA, dados salvos no aparelho) */
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
    v: 1,
    profile: { name: '', birth: '', cep: '', city: '', uf: '', email: '', photo: '' },
    settings: { theme: 'dark', skin: 'padrao' },
    accounts: [{ id: 'acc_' + uid(), name: 'Minha conta', kind: 'conta', type: 'Conta corrente', initial: 0, color: '#ec7000', isDefault: true }],
    categories: DEF_CATS.map(([type, name, icon]) => ({ id: 'cat_' + uid(), type, name, icon })),
    transactions: [],
    debts: []
  };
}
let S;
function load() {
  try { const raw = localStorage.getItem(KEY); S = raw ? JSON.parse(raw) : defaults(); } catch (e) { S = defaults(); }
  const d = defaults();
  for (const k of Object.keys(d)) if (S[k] === undefined) S[k] = d[k];
  if (!S.accounts.length) S.accounts = d.accounts;
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Não foi possível salvar (memória cheia?)'); }
}

const cat = id => S.categories.find(c => c.id === id);
const acc = id => S.accounts.find(a => a.id === id);
const defAcc = () => (S.accounts.find(a => a.isDefault) || S.accounts[0]);
const sign = t => t.type === 'receita' ? +t.amount : -t.amount;

/* ======================= Estado de tela ======================= */
const T0 = today();
const V = {
  tab: 'inicio', sub: null, acc: 'all', mode: 'mensal', ym: T0.slice(0, 7), year: +T0.slice(0, 4),
  from: T0.slice(0, 8) + '01', to: T0, status: 'todos', type: 'todos', sort: 'data', q: '', searching: false,
  calView: 'saldo', calDay: null, chart: 'projecao', projN: 6, projSel: null, tblMode: 'mes',
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
const stOk = (t, st = V.status) => st === 'todos' || (st === 'pendentes' ? !t.paid : t.paid);
function txIn(a, b, o = {}) {
  const st = o.status ?? V.status, ty = o.type ?? 'todos';
  return S.transactions.filter(t => accOk(t) && t.date >= a && t.date <= b && stOk(t, st) && (ty === 'todos' || t.type === ty));
}
function initialSum() {
  return S.accounts.filter(a => V.acc === 'all' ? a.kind !== 'cartao' : a.id === V.acc).reduce((s, a) => s + (+a.initial || 0), 0);
}
function balanceAt(date, paidOnly = false) {
  let s = initialSum();
  for (const t of S.transactions) if (accOk(t) && t.date <= date && (!paidOnly || t.paid)) s += sign(t);
  return r2(s);
}
function accBalance(a) {
  let s = +a.initial || 0;
  for (const t of S.transactions) if (t.accountId === a.id && t.paid) s += sign(t);
  return r2(s);
}
const sumType = (list, ty) => r2(list.filter(t => t.type === ty).reduce((s, t) => s + +t.amount, 0));
function sortTx(list, by = V.sort) {
  return list.slice().sort(by === 'valor' ? (a, b) => b.amount - a.amount || a.date.localeCompare(b.date) : (a, b) => a.date.localeCompare(b.date) || (a.type === b.type ? 0 : a.type === 'receita' ? -1 : 1));
}

/* ======================= Componentes ======================= */
function accChips() {
  const chips = S.accounts.map(a => `<button class="accchip ${V.acc === a.id ? 'on' : ''}" style="${V.acc === a.id ? `background:${a.color}` : ''}" data-act="acc" data-id="${a.id}">${esc(a.name.length > 11 ? a.name.split(' ')[0] : a.name)}</button>`).join('');
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
  const late = !t.paid && t.date < T0 && t.type === 'despesa';
  return `<div class="tx ${t.type} ${t.paid ? 'paid' : ''}" data-act="edit-tx" data-id="${t.id}">
    ${o.when ? `<div class="when">${fmtDS(t.date)}${late ? ' · <span class="red">atrasada</span>' : ''}</div>` : ''}
    <div class="txm"><div class="ticon">${c ? c.icon : I(t.type === 'receita' ? 'cash' : 'card')}</div>
    <div class="tinfo"><div class="tname">${esc(name)}${parc}${rep}</div><div class="tsub">${esc(a?.name || 'Sem conta')}${c && t.desc && t.desc !== c.name ? ' · ' + esc(c.name) : ''}${o.date ? ' · ' + fmtD(t.date) : ''}</div></div>
    <div class="tval">${o.signed ? (t.type === 'despesa' ? '-' : '+') : ''}${brl(t.amount)}</div>
    <button class="chk" data-act="toggle-paid" data-id="${t.id}" aria-label="Marcar como pago">${I(t.paid ? 'check' : 'circle')}</button>
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
  const conta = balanceAt('9999-12-31', true), dia = balanceAt(T0);
  const pct = rec > 0 ? Math.max(0, Math.min(1, per / rec)) : 0;
  const C = 2 * Math.PI * 50;
  const p = S.profile, nm = (p.name || 'você').toUpperCase();
  const soon = S.transactions.filter(t => accOk(t) && !t.paid && t.type === 'despesa' && t.date <= addDays(T0, 7) && t.date >= addDays(T0, -60)).sort((x, y) => x.date.localeCompare(y.date));
  const shown = list.filter(t => V.homeType === 'todos' || t.type === V.homeType);
  return `
  <div class="hello"><svg class="deco" viewBox="0 0 400 100" preserveAspectRatio="none"><path d="M0 80 Q120 70 200 45 T400 5" stroke="var(--green)" fill="none" stroke-width="1.5"/>${[150, 170, 190, 210, 230, 250, 270].map((x, i) => `<rect x="${x}" y="${30 + (i * 13) % 25}" width="7" height="${20 + (i * 17) % 22}" fill="var(--green)" opacity=".5"/>`).join('')}</svg>
    <span class="muted" style="font-size:20px">Olá, <b style="color:var(--text)">${esc(nm)}</b></span>
    <button class="avatar" data-act="go" data-sub="perfil" style="${p.photo ? `background-image:url(${p.photo})` : ''}">${p.photo ? '' : esc((p.name || '?')[0].toUpperCase())}</button></div>
  ${accChips()}
  ${seg('mode', [['mensal', 'Mensal'], ['anual', 'Anual'], ['periodo', 'Período']], V.mode)}
  ${periodNav()}
  ${pills('status', [['todos', 'Todos'], ['pendentes', 'Pendentes'], ['realizados', 'Realizados']], V.status, 'plain')}
  <div class="card">
    <div class="summary">
      <div class="ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" stroke="var(--card2)" stroke-width="13" fill="none"/><circle cx="60" cy="60" r="50" stroke="var(--accent)" stroke-width="13" fill="none" stroke-linecap="round" stroke-dasharray="${C * pct} ${C}"/></svg><div class="t"><b>${Math.round(pct * 100)}%</b><small>saldo</small></div></div>
      <div>
        <div class="lbl">Saldo acumulado ${I('trend', 'green')}</div><div class="big">${brl(acum)}</div>
        <div class="small muted" style="margin-top:4px">Saldo da conta: <b style="color:var(--text)">${brl(conta)}</b></div>
      </div>
    </div>
    <div class="hr" style="margin:14px 0 10px"></div>
    <div class="between"><div><div class="lbl">Saldo do período</div><b class="${per >= 0 ? 'green' : 'red'}" style="font-size:18px">${brl(per)}</b></div>
    <div style="text-align:right"><div class="lbl">Saldo do dia</div><b class="${dia >= 0 ? 'green' : 'red'}" style="font-size:18px">${brl(dia)}</b></div></div>
    <div class="rd2"><div class="rdbox r"><span class="green">Receitas</span><b class="green">${brl(rec)}</b></div><div class="rdbox d"><span class="red">Despesas</span><b class="red">${brl(desp)}</b></div></div>
  </div>
  ${soon.length ? `<div class="alert"><div class="h">${I('bell')} Vencimentos próximos</div>${soon.slice(0, 6).map(t => `<div class="it" data-act="edit-tx" data-id="${t.id}"><span>${esc(t.desc || cat(t.categoryId)?.name || '')} <small class="${t.date < T0 ? 'red' : 'muted'}">&nbsp;${t.date < T0 ? 'atrasada ' : ''}${fmtD(t.date).slice(0, 5)}</small></span><b class="red">${brl(t.amount)}</b></div>`).join('')}${soon.length > 6 ? `<small class="muted">+ ${soon.length - 6} outros</small>` : ''}</div>` : ''}
  <div class="between"><h2>Próximos</h2><button class="ib" data-act="cycle-home">${I('filter')}${V.homeType !== 'todos' ? `<small class="accent">${V.homeType}</small>` : ''}</button></div>
  ${shown.length ? sortTx(shown, 'data').map(t => txRow(t, { when: true, signed: true })).join('') : '<div class="empty">Nenhum lançamento neste período.</div>'}`;
}

function scrCalendario() {
  const [y, m] = V.ym.split('-').map(Number);
  const first = new Date(y, m - 1, 1).getDay(), n = dim(y, m - 1);
  const ty = V.type;
  const month = txIn(`${V.ym}-01`, `${V.ym}-${pad(n)}`, { type: ty });
  const byDay = {};
  for (const t of month) (byDay[t.date] ||= []).push(t);
  let bal = (() => { let s = initialSum(); for (const t of S.transactions) if (accOk(t) && t.date < `${V.ym}-01` && stOk(t) && (ty === 'todos' || t.type === ty)) s += sign(t); return s; })();
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
  <div class="cal"><div class="wd">${['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(x => `<div>${x}</div>`).join('')}</div><div class="grid">${cells}</div></div>
  ${three(rec, desp, r2(rec - desp))}
  <div class="between"><h2 style="font-size:17px;color:var(--muted)">${V.calDay ? `Dia ${fmtD(V.calDay)} <button class="accent small" data-act="calday" data-d="${V.calDay}">(ver mês)</button>` : `Transações do mês (${month.length})`}</h2>${sortBar()}</div>
  ${txGrouped(sortTx(list))}`;
}

function scrTransacoes() {
  const [a, b] = range();
  let list = txIn(a, b);
  const rec = sumType(list, 'receita'), desp = sumType(list, 'despesa');
  if (V.type !== 'todos') list = list.filter(t => t.type === V.type);
  if (V.q) { const q = V.q.toLowerCase(); list = list.filter(t => [t.desc, cat(t.categoryId)?.name, t.note, acc(t.accountId)?.name, t.lote].join(' ').toLowerCase().includes(q)); }
  return `
  <div class="titlebar"><h1>Transações</h1><button class="ib" data-act="search">${I('search')}</button></div>
  ${V.searching ? `<input class="in" id="q" placeholder="Buscar descrição, categoria, nota..." value="${esc(V.q)}" data-inp="q" style="margin-bottom:12px">` : ''}
  ${seg('mode', [['mensal', 'Mensal'], ['anual', 'Anual'], ['todos', 'Todos'], ['periodo', 'Período']], V.mode)}
  ${periodNav()}
  ${accChips()}
  ${pills('status', [['todos', 'Todos'], ['pendentes', 'Pendentes'], ['realizados', 'Realizados']], V.status, 'plain')}
  ${three(rec, desp, r2(rec - desp))}
  ${seg('type', [['todos', 'Todos'], ['receita', 'Receita', 'rec'], ['despesa', 'Despesa', 'desp']], V.type)}
  <div class="between" style="margin:14px 0 4px"><span class="muted">${list.length} transações</span>${sortBar()}</div>
  ${txGrouped(sortTx(list), { year: V.mode !== 'mensal' })}`;
}

/* ---------- Gráficos ---------- */
const PALETTE = ['#f87171', '#fb923c', '#fbbf24', '#f43f5e', '#a78bfa', '#38bdf8', '#34d399', '#f472b6', '#facc15', '#60a5fa', '#c084fc', '#2dd4bf', '#fca5a5', '#94a3b8'];
function monthsData(startYm, n) {
  const out = []; let ym = startYm;
  for (let i = 0; i < n; i++) {
    const [y, m] = ym.split('-').map(Number), end = `${ym}-${pad(dim(y, m - 1))}`;
    const L = txIn(`${ym}-01`, end, { status: 'todos' });
    out.push({ ym, label: `${m}/${String(y).slice(2)}`, rec: sumType(L, 'receita'), desp: sumType(L, 'despesa'), saldo: balanceAt(end) });
    ym = ymAdd(ym, 1);
  }
  return out;
}
function projChart(D) {
  const W = 360, H = 270, L = 34, R = 8, Tp = 14, B = 26;
  const maxV = Math.max(1, ...D.flatMap(d => [d.rec, d.desp, d.saldo]));
  const minV = Math.min(0, ...D.map(d => d.saldo));
  const step = niceStep((maxV - minV) / 4), top = Math.ceil(maxV / step) * step, bot = Math.floor(minV / step) * step;
  const yv = v => Tp + (top - v) / (top - bot) * (H - Tp - B);
  const gw = (W - L - R) / D.length, bw = Math.min(26, gw * 0.32);
  let g = '';
  for (let v = bot; v <= top + 1e-6; v += step) g += `<line x1="${L}" x2="${W - R}" y1="${yv(v)}" y2="${yv(v)}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${L - 6}" y="${yv(v) + 4}" text-anchor="end" font-size="10" fill="var(--muted)">${kfmt(v)}</text>`;
  const z = yv(0);
  D.forEach((d, i) => {
    const cx = L + gw * i + gw / 2, x1 = cx - bw - 2, x2 = cx + 2;
    const bar = (x, v, col) => { const y = yv(v); const h = Math.max(1, z - y); return `<rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="4" fill="${col}"/>` + (D.length <= 12 && h > 34 ? `<text transform="translate(${x + bw / 2 + 4},${y + 6}) rotate(90)" font-size="10" font-weight="700" fill="#0b0f16">${Math.round(v).toLocaleString('pt-BR')}</text>` : ''); };
    g += bar(x1, d.rec, '#34d399') + bar(x2, d.desp, '#f87171');
    if (D.length <= 12 || i % Math.ceil(D.length / 8) === 0) g += `<text x="${cx}" y="${H - 8}" text-anchor="middle" font-size="10" fill="var(--muted)">${d.label}</text>`;
    g += `<rect x="${L + gw * i}" y="0" width="${gw}" height="${H - B}" fill="transparent" data-act="projsel" data-i="${i}"/>`;
  });
  const pts = D.map((d, i) => `${L + gw * i + gw / 2},${yv(d.saldo)}`).join(' ');
  if (V.projSel != null && D[V.projSel]) { const cx = L + gw * V.projSel + gw / 2; g += `<line x1="${cx}" x2="${cx}" y1="${Tp}" y2="${H - B}" stroke="var(--text)" stroke-width="1"/>`; }
  g += `<polyline points="${pts}" fill="none" stroke="#38bdf8" stroke-width="2.4" stroke-linejoin="round"/>`;
  D.forEach((d, i) => { g += `<text x="${L + gw * i + gw / 2}" y="${yv(d.saldo) - 6}" text-anchor="middle" font-size="10" fill="#38bdf8">${D.length <= 12 ? Math.round(d.saldo).toLocaleString('pt-BR') : ''}</text>`; });
  if (V.projSel != null && D[V.projSel]) { const d = D[V.projSel]; g += `<circle cx="${L + gw * V.projSel + gw / 2}" cy="${yv(d.saldo)}" r="5" fill="#fff" stroke="#38bdf8" stroke-width="3"/>`; }
  const sel = V.projSel != null && D[V.projSel] ? D[V.projSel] : null;
  return `<div class="chartwrap">${sel ? `<div class="tooltip" style="left:${V.projSel < D.length / 2 ? '45%' : '8%'};top:40px"><b>${sel.label}</b><div class="green">Receita: ${brl(sel.rec)}</div><div class="red">Despesa: ${brl(sel.desp)}</div><div style="color:#38bdf8">Saldo: ${brl(sel.saldo)}</div></div>` : ''}
  <svg viewBox="0 0 ${W} ${H}" width="100%">${g}</svg></div>
  <div class="legend"><span><i style="background:#34d399"></i>Receita</span><span><i style="background:#f87171"></i>Despesa</span><span><i style="background:#38bdf8;border-radius:2px;height:4px"></i>Saldo</span></div>`;
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
  const C = 2 * Math.PI * 70; let off = 0, g = '';
  arr.forEach((x, i) => {
    const f = tot ? x.total / tot : 0, len = C * f;
    g += `<circle cx="100" cy="100" r="70" fill="none" stroke="${PALETTE[i % PALETTE.length]}" stroke-width="38" stroke-dasharray="${Math.max(0, len - 1.5)} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 100 100)"/>`;
    const mid = (off + len / 2) / C * 2 * Math.PI - Math.PI / 2;
    if (f >= 0.06) g += `<text x="${100 + 70 * Math.cos(mid)}" y="${100 + 70 * Math.sin(mid) + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">${Math.round(f * 100)}%</text>`;
    off += len;
  });
  if (!arr.length) g = `<circle cx="100" cy="100" r="70" fill="none" stroke="var(--card2)" stroke-width="38"/>`;
  return `<svg viewBox="0 0 200 200" width="62%" style="display:block;margin:6px auto 14px">${g}</svg>`;
}
function scrGraficos() {
  let body = '';
  if (V.chart === 'projecao') {
    const D = monthsData(T0.slice(0, 7), V.projN);
    body = `${pills('projN', [[6, '6 Meses'], [12, '12 Meses'], [24, '24 Meses']], V.projN)}
    <div class="card"><div style="text-align:center;font-weight:700;font-size:18px;margin-bottom:6px">Fluxo de Caixa - ${V.projN} Meses</div>${projChart(D)}</div>
    ${pills('tblMode', [['mes', 'Mês'], ['ano', 'Ano'], ['periodo', 'Período']], V.tblMode)}
    ${periodNav(V.tblMode === 'mes' ? 'mensal' : V.tblMode === 'ano' ? 'anual' : 'periodo')}
    ${flowTable()}`;
  } else if (V.chart === 'categoria') {
    const { arr, tot } = catAgg(V.catType, V.catMode);
    body = `${seg('catType', [['receita', 'Receita', 'rec'], ['despesa', 'Despesa', 'desp']], V.catType, 'rd')}
    ${pills('catMode', [['mensal', 'Mensal'], ['anual', 'Anual'], ['periodo', 'Período']], V.catMode)}
    ${periodNav(V.catMode)}
    <div class="card">${donut(arr, tot)}<div class="between" style="padding:12px 4px;border-top:1px solid var(--line)"><span class="muted">Total do período</span><b style="font-size:20px">${brl(tot)}</b></div>
    <div class="catlist">${arr.map((x, i) => { const c = cat(x.id); const op = V.open['c' + x.id]; return `<div class="it" data-act="toggle-open" data-k="c${x.id}"><span class="dot" style="background:${PALETTE[i % PALETTE.length]}"></span><span class="nm">${esc(c?.name || 'Sem categoria')}</span><small class="muted">${x.n}x</small><b>${brl(x.total)}</b><small class="muted" style="width:38px;text-align:right">${Math.round(x.total / tot * 100)}%</small>${I(op ? 'up' : 'right')}</div>${op ? x.list.map(t => `<div class="between small" style="padding:4px 26px"><span class="muted">${fmtD(t.date)} · ${esc(t.desc || '')}</span><span>${brl(t.amount)}</span></div>`).join('') : ''}`; }).join('')}</div></div>`;
  } else {
    const mode = V.rankMode === 'mes' ? 'mensal' : V.rankMode === 'ano' ? 'anual' : 'periodo';
    const R = catAgg('receita', mode), D = catAgg('despesa', mode);
    const rank = (o, col) => { const mx = Math.max(1, ...o.arr.map(x => x.total)); return o.arr.length ? `<div class="rank">${o.arr.slice(0, 10).map(x => `<div class="it"><span>${esc(cat(x.id)?.name || 'Sem categoria')}</span><div class="bar" style="width:${Math.max(2, x.total / mx * 78)}%;background:${col}"><em>${kfmt(x.total)}</em></div></div>`).join('')}</div>` : '<div class="empty">Sem dados</div>'; };
    body = `${pills('rankMode', [['mes', 'Mês Atual'], ['ano', 'Ano'], ['periodo', 'Período']], V.rankMode)}
    ${periodNav(mode)}
    <div class="card"><div class="between"><b style="font-size:18px">Maiores Receitas por Categoria</b><b class="green">${brl(R.tot)}</b></div>${rank(R, '#34d399')}</div>
    <div class="card"><div class="between"><b style="font-size:18px">Maiores Despesas por Categoria</b><b class="red">${brl(D.tot)}</b></div>${rank(D, '#f87171')}</div>`;
  }
  return `<h1>Gráficos</h1>${accChips()}${seg('chart', [['projecao', 'Projeção'], ['categoria', 'Categoria'], ['ranking', 'Ranking']], V.chart)}${body}`;
}

/* ---------- Ajustes ---------- */
const SKINS = [['padrao', '⚙️', 'Padrão', 'Tema padrão'], ['feminino', '🌸', 'Feminino', 'Tons de rosa'], ['masculino', '🌊', 'Masculino', 'Tons de azul'], ['minimal', '⬜', 'Minimal', 'Clean & moderno'], ['windows', '🪟', 'Windows', 'Estilo Windows'], ['dos', '🖥️', 'MS-DOS', 'Verde no preto']];
function li(act, icon, title, sub, cls = '', extra = '') {
  return `<button class="li ${cls}" data-act="${act}" ${extra}>${I(icon)}<span class="tx2"><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</span>${cls ? '' : I('right')}</button>`;
}
function scrAjustes() {
  const st = S.settings;
  return `<div class="titlebar"><div><h1 style="margin-bottom:4px">Ajustes</h1><div class="muted" style="font-size:18px">${esc(S.profile.email || 'Seus dados ficam salvos neste aparelho')}</div></div>
  <img src="icons/icon-192.png" alt="HANKX" style="width:62px;height:62px;border-radius:16px"></div>
  <div class="sect">APARÊNCIA</div>
  <div class="card"><div class="muted" style="margin-bottom:10px">Tema</div>
    <div class="opts">${[['light', 'sun', 'Claro'], ['dark', 'moon', 'Escuro'], ['auto', 'phone', 'Auto']].map(([v, ic, l]) => `<button class="opt ${st.theme === v ? 'on' : ''}" data-act="theme" data-v="${v}"><span class="e accent" style="color:${st.theme === v ? 'var(--accent)' : 'var(--muted)'}">${I(ic)}</span><b>${l}</b></button>`).join('')}</div>
    <div class="muted" style="margin:16px 0 10px">Perfil de Interface</div>
    <div class="opts">${SKINS.map(([v, e, l, s]) => `<button class="opt ${st.skin === v ? 'on' : ''}" data-act="skin" data-v="${v}"><span class="e">${e}</span><b>${l}</b><small>${s}</small></button>`).join('')}</div></div>
  <div class="sect">PERFIL</div>
  <div class="list">${li('go', 'user', 'Meu Perfil', '', '', 'data-sub="perfil"')}</div>
  <div class="sect">FERRAMENTAS</div>
  <div class="list">${li('go', 'spark', 'Orientação', 'O que pagar primeiro', '', 'data-sub="orientacao"')}${li('go', 'calc', 'Empréstimos', 'Simular parcelas e gerar lançamentos', '', 'data-sub="emprestimos"')}</div>
  <div class="sect">GESTÃO</div>
  <div class="list">${li('go', 'dollar', 'Contas', '', '', 'data-sub="contas"')}${li('go', 'shield', 'Categorias', '', '', 'data-sub="categorias"')}${li('go', 'card', 'Dívidas', '', '', 'data-sub="dividas"')}</div>
  <div class="sect">RELATÓRIOS</div>
  <div class="list">${li('rep-caixa', 'sheet', 'Planilha Controle de Caixa', 'Modelo Cash Control: descrições nas linhas, meses nas colunas, receitas, despesas e saldos (.xlsx)', 'c-green')}
  ${li('rep-pdf', 'file', 'Planilha Controle de Caixa em PDF', 'Mesmo modelo da planilha, pronto para imprimir (.pdf)', 'c-red')}
  ${li('rep-excel', 'sheet', 'Exportar para Excel', 'Receitas e despesas por categoria e mês, com saldo do mês e acumulado (.xlsx)', 'c-green')}
  ${li('rep-csv', 'chart', 'Exportar Fluxo de Caixa Diário', 'Lista diária de entradas, saídas e saldo acumulado (.csv)', 'c-blue')}</div>
  <div class="sect">DADOS</div>
  <div class="list">${li('backup', 'dl', 'Fazer backup', 'Gera arquivo .json para salvar no dispositivo', 'c-blue')}${li('restore', 'ul', 'Restaurar backup', 'Importar arquivo .json de backup', 'c-blue')}${li('clear', 'trash', 'Limpar dados', 'Apaga todos os lançamentos e reseta saldo', 'c-red')}</div>
  <p class="muted small" style="text-align:center;margin-top:24px">HANKX Finanças · os dados ficam somente neste aparelho.<br>Faça backup com frequência.</p>`;
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
  ${V.accTab === 'conta' ? `<div class="card between"><span class="muted" style="font-size:18px">Saldo total em caixa</span><b style="font-size:22px">${brl(total)}</b></div>` : ''}
  ${contas.map(a => `<div class="card" style="${a.isDefault ? 'border-color:var(--accent)' : ''}"><div class="row" style="align-items:flex-start">
    <div class="banklogo" style="background:${a.color}">${esc(a.name.split(' ')[0].slice(0, 6))}</div>
    <div style="flex:1;min-width:0"><div class="between"><b style="font-size:19px">${esc(a.name)}</b>${a.isDefault ? '<span class="badge done" style="padding:2px 10px;font-size:12px">Padrão</span>' : ''}</div>
    <div class="muted small">${esc(a.kind === 'cartao' ? `Cartão${a.dueDay ? ' · vence dia ' + a.dueDay : ''}${a.limit ? ' · limite ' + brl(+a.limit) : ''}` : a.type || 'Conta corrente')}</div>
    <div class="between"><b style="font-size:19px;margin-top:6px">${brl(a.kind === 'cartao' ? -S.transactions.filter(t => t.accountId === a.id && !t.paid && t.type === 'despesa').reduce((s, t) => s + +t.amount, 0) : accBalance(a))}</b>
    <span><button class="ib" data-act="acc-default" data-id="${a.id}" style="color:${a.isDefault ? 'var(--accent)' : 'var(--muted)'}">${I('star')}</button><button class="ib" data-act="acc-edit" data-id="${a.id}">${I('pen')}</button><button class="ib" data-act="acc-del" data-id="${a.id}">${I('trash')}</button></span></div></div></div></div>`).join('')}
  <button class="ad" data-act="acc-edit">+ Adicionar ${V.accTab === 'conta' ? 'conta' : 'cartão'}</button>
  ${V.accTab === 'cartao' ? '<p class="muted small" style="margin-top:12px">No cartão, o valor exibido é o total de despesas ainda não pagas lançadas nele.</p>' : ''}`;
}
function scrCategorias() {
  const L = S.categories.filter(c => c.type === V.catTab).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  return `${backHead('Categorias', `<button class="ib" data-act="cat-edit">${I('plus')}</button>`)}
  ${seg('catTab', [['receita', 'Receita', 'rec'], ['despesa', 'Despesa', 'desp']], V.catTab, 'rd')}
  ${L.map(c => `<div class="catrow ${c.type === 'receita' ? 'rec' : ''}"><div class="em">${c.icon}</div><div class="nm">${esc(c.name)}</div><button class="ib" data-act="cat-edit" data-id="${c.id}">${I('pen')}</button><button class="ib" data-act="cat-del" data-id="${c.id}">${I('trash')}</button></div>`).join('')}`;
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
  <div class="card between"><span class="muted" style="font-size:18px">Total em aberto</span><b class="red" style="font-size:22px">${brl(total)}</b></div>
  ${S.debts.length ? '' : '<div class="empty">Nenhuma dívida cadastrada.<br><small>Toque em + para adicionar.</small></div>'}
  ${S.debts.map(d => {
    const s = debtStats(d), op = V.open['d' + d.id];
    return `<div class="card"><div class="between" style="align-items:flex-start"><div><b style="font-size:20px">${esc(d.name)}</b>${d.desc ? `<div class="muted">${esc(d.desc)}</div>` : ''}</div>
    <span style="white-space:nowrap;flex:none"><button class="ib" data-act="debt-edit" data-id="${d.id}">${I('pen')}</button><button class="ib" data-act="debt-del" data-id="${d.id}">${I('trash')}</button></span></div>
    <div class="stats3"><div><small>Total</small><b>${brl(s.tot)}</b></div><div><small>Pagas</small><b class="green">${s.paid}/${s.n}</b></div><div><small>Remanescente</small><b class="red">${brl(s.rem)}</b></div></div>
    <div class="between">${s.rem <= 0 ? '<span class="badge done">Quitada</span>' : s.late ? '<span class="badge late">Atrasada</span>' : '<span class="badge ok">Em dia</span>'}
    <button class="muted" data-act="toggle-open" data-k="d${d.id}" style="font-size:17px">Parcelas ${I(op ? 'up' : 'down')}</button></div>
    ${op ? `<div class="hr" style="margin:14px -18px"></div>${d.installments.map((i, k) => `<button class="inst ${i.paid ? 'paid' : ''}" data-act="inst" data-id="${d.id}" data-k="${k}">${I(i.paid ? 'check' : 'circle')}<span class="nm">Parcela ${i.n}/${s.n}</span><span class="dt ${!i.paid && i.date < T0 ? 'red' : ''}">${fmtD(i.date)}</span><span class="v">${brl(+i.amount)}</span></button>`).join('')}` : ''}</div>`;
  }).join('')}`;
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
  if (!r) return `<div class="card empty" style="font-size:19px;padding:40px 20px">Preencha os campos para ver a simulação da parcela.</div>`;
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
  <div class="row" style="margin:10px 0 6px">${I('calc', 'accent')}<h1 style="margin:0;font-size:30px">Empréstimos</h1></div>
  <p class="muted" style="font-size:17px;margin-top:4px">Simule as parcelas e, ao concretizar, divida cada parcela em 40% no dia 15 e 60% no dia 30.</p>
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
  const pend = S.transactions.filter(t => accOk(t) && !t.paid && t.type === 'despesa' && t.date <= horizon);
  const income = S.transactions.filter(t => accOk(t) && !t.paid && t.type === 'receita' && t.date <= horizon).reduce((s, t) => s + +t.amount, 0);
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

/* ======================= Render ======================= */
function applyTheme() {
  const st = S.settings, b = document.body;
  const dark = st.theme === 'auto' ? matchMedia('(prefers-color-scheme: dark)').matches : st.theme === 'dark';
  b.className = (dark || st.skin === 'dos' ? '' : 'light ') + 'skin-' + st.skin;
  const meta = $('meta[name=theme-color]'); if (meta) meta.content = getComputedStyle(b).getPropertyValue('--bg2').trim() || '#12161f';
}
const TABS = [['inicio', 'home', 'Início'], ['calendario', 'cal', 'Calendário'], ['transacoes', 'list', 'Transações'], ['graficos', 'pie', 'Gráficos'], ['ajustes', 'gear', 'Ajustes']];
function render(keepScroll = true) {
  const y = window.scrollY;
  let h;
  if (V.tab === 'ajustes' && V.sub) h = ({ perfil: scrPerfil, contas: scrContas, categorias: scrCategorias, dividas: scrDividas, emprestimos: scrEmprestimos, orientacao: scrOrientacao })[V.sub]();
  else h = ({ inicio: scrInicio, calendario: scrCalendario, transacoes: scrTransacoes, graficos: scrGraficos, ajustes: scrAjustes })[V.tab]();
  $('#main').innerHTML = h;
  $('#tabbar').innerHTML = TABS.map(([k, ic, l]) => `<button class="${V.tab === k ? 'on' : ''}" data-act="tab" data-v="${k}">${I(ic)}<span>${l}</span></button>`).join('');
  $('#fab').innerHTML = I('plus');
  $('#fab').classList.toggle('hide', V.tab === 'ajustes' || V.tab === 'graficos');
  if (keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
  if (V.searching) { const q = $('#q'); if (q && document.activeElement !== q && V.focusQ) { q.focus(); V.focusQ = false; } }
}

/* ======================= Modal / toast ======================= */
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('on'), 2400); }
function openModal(html) {
  $('#modal').innerHTML = `<div class="bk" data-act="close-bk"><div class="sheet"><div class="grab"></div>${html}</div></div>`;
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
  <label class="f"><span>Valor</span><input class="in amount" name="amount" inputmode="decimal" placeholder="0,00" value="${t.amount !== '' ? num2(t.amount) : ''}" required></label>
  <label class="f"><span>Data</span><input class="in" type="date" name="date" value="${t.date}" required></label>
  <label class="f"><span>Descrição</span><input class="in" name="desc" value="${esc(t.desc)}" placeholder="Ex.: Conta de luz"></label>
  <label class="f"><span>Categoria</span><select class="in" name="categoryId" id="fcat"></select></label>
  <label class="f"><span>Conta</span><select class="in" name="accountId">${accOpts}</select></label>
  <div class="box between"><b>${type === 'receita' ? 'Recebido' : 'Pago'}</b><label class="switch"><input type="checkbox" name="paid" ${t.paid ? 'checked' : ''}><i></i></label></div>
  <div class="box"><div class="between"><b style="font-size:19px">Repetir</b><label class="switch"><input type="checkbox" name="rep" id="frep" ${rep ? 'checked' : ''}><i></i></label></div>
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
  ${isNew ? '' : `<button type="button" class="btn danger" data-act="del-tx" data-id="${t.id}" style="margin-bottom:12px">${I('trash')} Excluir transação</button>`}
  <button class="btn primary" type="submit">${isNew ? 'Adicionar' : 'Salvar alterações'}</button>
  </form>`);
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
      S.transactions.push(...(repOn ? genSeries(base, R) : [{ ...base, id: uid() }]));
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
  openModal(`<h3>${id ? 'Editar' : 'Nova'} ${isCard ? 'cartão' : 'conta'}</h3><form id="af">
  <label class="f"><span>Nome ${isCard ? 'do cartão' : 'do banco/conta'}</span><input class="in" name="name" value="${esc(a.name)}" required placeholder="${isCard ? 'Ex.: Nubank' : 'Ex.: Itaú'}"></label>
  ${isCard ? `<div class="row"><label class="f" style="flex:1"><span>Dia de vencimento</span><input class="in" name="dueDay" inputmode="numeric" value="${esc(a.dueDay || '')}"></label><label class="f" style="flex:1"><span>Limite</span><input class="in" name="limit" inputmode="decimal" value="${a.limit ? num2(a.limit) : ''}"></label></div>`
      : `<label class="f"><span>Tipo</span><select class="in" name="type">${['Conta corrente', 'Poupança', 'Carteira', 'Investimento', 'Conta salário'].map(x => `<option ${a.type === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
  <label class="f"><span>Saldo inicial</span><input class="in" name="initial" inputmode="decimal" value="${num2(a.initial || 0)}"></label>
  <p class="muted small" style="margin-top:-8px">O saldo da conta = saldo inicial + lançamentos marcados como pagos/recebidos.</p>`}
  <div class="muted" style="margin-bottom:8px">Cor</div><div class="colors">${COLORS.map(c => `<button type="button" data-c="${c}" class="${a.color === c ? 'on' : ''}" style="background:${c}"></button>`).join('')}</div>
  <input type="hidden" name="color" value="${a.color}"><button class="btn primary">Salvar</button></form>`);
  const f = $('#af');
  f.addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (b) { f.color.value = b.dataset.c; $$('.colors button', f).forEach(x => x.classList.toggle('on', x === b)); } });
  f.addEventListener('submit', e => {
    e.preventDefault();
    const o = { name: f.name.value.trim(), color: f.color.value, kind: a.kind || 'conta' };
    if (isCard) { o.dueDay = f.dueDay.value; o.limit = parseMoney(f.limit.value); o.initial = 0; } else { o.type = f.type.value; o.initial = r2(parseMoney(f.initial.value)); }
    if (id) Object.assign(a, o); else S.accounts.push({ id: 'acc_' + uid(), isDefault: false, ...o });
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
  const txY = S.transactions.filter(t => accOk(t) && t.date.startsWith(String(Y)));
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
  for (const t of tx) a2.push([fmtD(t.date), t.desc, cat(t.categoryId)?.name || '', acc(t.accountId)?.name || '', t.type === 'receita' ? 'Receita' : 'Despesa', t.type === 'receita' ? +t.amount : -t.amount, t.paid ? 'Realizado' : 'Pendente', t.lote || '', t.note || '']);
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
    const L = S.transactions.filter(t => accOk(t) && t.date === d);
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
    case 'tab': V.tab = el.dataset.v; V.sub = null; V.calDay = null; V.projSel = null; render(false); break;
    case 'go': V.tab = 'ajustes'; V.sub = el.dataset.sub; render(false); break;
    case 'back': V.sub = null; render(false); break;
    case 'acc': V.acc = id; render(); break;
    case 'set': { const k = el.dataset.k; let v = el.dataset.v; if (k === 'projN') v = +v; V[k] = v; if (k === 'projN') V.projSel = null; if (k === 'mode' && v === 'periodo') { const [a, b] = range('mensal'); V.from = a; V.to = b; } render(); break; }
    case 'nav': { const d = +el.dataset.d; if (el.dataset.m === 'm') V.ym = ymAdd(V.ym, d); else V.year += d; V.calDay = null; render(); break; }
    case 'nav-today': V.ym = T0.slice(0, 7); V.year = +T0.slice(0, 4); V.calDay = null; render(); break;
    case 'new-tx': txForm(); break;
    case 'edit-tx': { const t = S.transactions.find(x => x.id === id); if (t) txForm(t); break; }
    case 'toggle-paid': { const t = S.transactions.find(x => x.id === id); if (t) { t.paid = !t.paid; syncDebtFromTx(t); save(); render(); toast(t.paid ? (t.type === 'receita' ? 'Marcado como recebido' : 'Marcado como pago') : 'Marcado como pendente'); } break; }
    case 'del-tx': delTx(id); break;
    case 'cycle-home': V.homeType = { todos: 'despesa', despesa: 'receita', receita: 'todos' }[V.homeType]; render(); break;
    case 'search': V.searching = !V.searching; if (!V.searching) V.q = ''; V.focusQ = true; render(); break;
    case 'calday': V.calDay = V.calDay === el.dataset.d ? null : el.dataset.d; render(); break;
    case 'projsel': { const i = +el.dataset.i; V.projSel = V.projSel === i ? null : i; render(); break; }
    case 'toggle-open': V.open[el.dataset.k] = !V.open[el.dataset.k]; render(); break;
    case 'theme': S.settings.theme = el.dataset.v; save(); applyTheme(); render(); break;
    case 'skin': S.settings.skin = el.dataset.v; save(); applyTheme(); render(); break;
    case 'save-profile': readProfileForm(); save(); toast('Perfil salvo'); render(); break;
    case 'del-photo': S.profile.photo = ''; save(); render(); break;
    case 'acc-edit': accForm(id); break;
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
    case 'rep-caixa': repCaixa(); break;
    case 'rep-pdf': repPdf(); break;
    case 'rep-excel': repExcel(); break;
    case 'rep-csv': repCsv(); break;
    case 'backup': saveFile(new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' }), `hankx-backup-${T0}.json`); toast('Backup gerado'); break;
    case 'restore': {
      const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
      inp.onchange = async () => {
        try {
          const j = JSON.parse(await inp.files[0].text());
          if (!j || !Array.isArray(j.transactions) || !Array.isArray(j.accounts)) throw 0;
          const r = await ask('Restaurar backup?', `${j.transactions.length} lançamentos e ${j.accounts.length} contas. Os dados atuais serão substituídos.`, [['y', 'Restaurar', 'primary']]);
          if (!r) return; localStorage.setItem(KEY, JSON.stringify(j)); load(); applyTheme(); V.acc = 'all'; render(false); toast('Backup restaurado');
        } catch (err) { toast('Arquivo de backup inválido'); }
      };
      inp.click(); break;
    }
    case 'clear': {
      const r = await ask('Limpar dados?', 'Apaga todos os lançamentos e dívidas e zera o saldo inicial das contas. Contas, categorias, perfil e tema são mantidos. Faça um backup antes.', [['y', 'Apagar tudo', 'danger']]);
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
  if (el.dataset.inp === 'q') { V.q = el.value; const pos = el.selectionStart; render(); const q = $('#q'); q.focus(); q.setSelectionRange(pos, pos); }
  if (el.dataset.loan) { V.loan[el.dataset.loan] = el.value; $('#loanres').innerHTML = loanResult(); }
  if (el.id === 'pCep' && el.value.replace(/\D/g, '').length === 8) cepLookup(el.value);
});
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { if (S.settings.theme === 'auto') { applyTheme(); render(); } });

/* ======================= Início ======================= */
load(); applyTheme(); render(false);
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
