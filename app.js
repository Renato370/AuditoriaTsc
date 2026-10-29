/* Auditoria de Vendas — app (PWA). Sem dependências externas. */
'use strict';

const CFG = window.APP_CONFIG || {};
const DEMO = typeof window.DEMO_API === 'function';
const APP_VERSION = '1.3.0';
const MIN_SERVER = '1.3.0';

/* ============================ Utilidades ============================ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const NUM = new Intl.NumberFormat('pt-BR');
const money = v => BRL.format(+v || 0);
const moneyShort = v => {
  v = +v || 0;
  if (Math.abs(v) >= 1e6) return 'R$ ' + (v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' mi';
  if (Math.abs(v) >= 1e4) return 'R$ ' + (v / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mil';
  return BRL.format(v);
};
const kShort = v => { v = +v || 0; return v >= 1e6 ? (v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'mi' : v >= 1e3 ? (v / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: v >= 1e4 ? 0 : 1 }) + 'k' : String(Math.round(v)); };
const int = v => NUM.format(Math.round(+v || 0));
const pad = n => String(n).padStart(2, '0');
const ymdOf = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const today = () => ymdOf(new Date());
const ontem = () => { const d = new Date(); d.setDate(d.getDate() - 1); return ymdOf(d); };
const isMaster = () => !!(S.user && S.user.perfil === 'Master');
const verLt = (a, b) => { const x = String(a || '0').split('.').map(Number), y = String(b).split('.').map(Number); for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) < (y[i] || 0); } return false; };
const nowStr = () => { const d = new Date(); return ymdOf(d) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); };
const dBR = s => s ? s.slice(8, 10) + '/' + s.slice(5, 7) + '/' + s.slice(0, 4) : '';
const dShort = s => s ? s.slice(8, 10) + '/' + s.slice(5, 7) : '';
const dtBR = s => s ? dBR(s.slice(0, 10)) + (s.length > 10 ? ' ' + s.slice(11, 16) : '') : '';
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const DOW = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const mesNome = m => MESES[+m.slice(5, 7) - 1] + ' ' + m.slice(0, 4);
const daysIn = m => new Date(+m.slice(0, 4), +m.slice(5, 7), 0).getDate();
const addMonth = (m, n) => { const d = new Date(+m.slice(0, 4), +m.slice(5, 7) - 1 + n, 1); return d.getFullYear() + '-' + pad(d.getMonth() + 1); };
const diaLongo = s => { const d = new Date(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)); return DOW[d.getDay()] + ', ' + d.getDate() + ' de ' + MESES[d.getMonth()]; };
const uid = () => Array.from(crypto.getRandomValues(new Uint8Array(4))).map(b => b.toString(16).padStart(2, '0')).join('');
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const initials = s => String(s || '?').replace(/[^\p{L}\p{N} ]/gu, ' ').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
const HUES = [160, 200, 25, 280, 340, 45, 120, 230, 0, 185];
const hueOf = s => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return HUES[h % HUES.length]; };

const ICON = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  sync: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>',
  cloudOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 2 20 20"/><path d="M5.8 5.8A6 6 0 0 0 6.5 17H17m3.6-1.2A4.5 4.5 0 0 0 17.5 9h-1A7 7 0 0 0 9.4 4.3"/></svg>',
  store: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5 4.5 4h15L21 9.5"/><path d="M3 9.5a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12v8h14v-8"/><path d="M10 20v-5h4v5"/></svg>',
  hist: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  dollar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 2v20M17 6.5C17 4.6 14.8 4 12 4S7 5 7 7.5s2.5 3 5 3.5 5.5 1 5.5 3.7S15 19.5 12 19.5s-5.5-.8-5.5-3"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  note: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
  right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  route: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H16a3.5 3.5 0 0 0 0-7H8a3.5 3.5 0 0 1 0-7h7.5"/></svg>',
  mall: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l1 13H5Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>'
};

/* ============================ Armazenamento local ============================ */
const KV = (() => {
  let dbp = null;
  const mem = {};
  function db() {
    if (!dbp) {
      dbp = new Promise((res, rej) => {
        try {
          const r = indexedDB.open('auditoria-vendas', 1);
          r.onupgradeneeded = () => r.result.createObjectStore('kv');
          r.onsuccess = () => res(r.result);
          r.onerror = () => rej(r.error);
        } catch (e) { rej(e); }
      }).catch(() => null);
    }
    return dbp;
  }
  async function get(k) {
    const d = await db();
    if (!d) return mem[k];
    return new Promise(res => {
      try {
        const q = d.transaction('kv').objectStore('kv').get(k);
        q.onsuccess = () => res(q.result);
        q.onerror = () => res(mem[k]);
      } catch (e) { res(mem[k]); }
    });
  }
  async function set(k, v) {
    mem[k] = v;
    const d = await db();
    if (!d) return;
    return new Promise(res => {
      try {
        const tx = d.transaction('kv', 'readwrite');
        tx.objectStore('kv').put(v, k);
        tx.oncomplete = () => res();
        tx.onerror = () => res();
      } catch (e) { res(); }
    });
  }
  return { get, set };
})();

/* ============================ Estado ============================ */
const COLMAP = {
  VendaId: 'id', HoraRegistro: 'hora', Data: 'data', Auditor: 'auditor', Contrato: 'contrato', Loja: 'loja',
  'Nome Fantasia': 'nome', ABL: 'abl', Piso: 'piso', Tipo: 'tipo', Categoria: 'categoria', Segmento: 'segmento',
  Vendas: 'vendas', Ticket: 'ticket', Responsavel: 'resp', Assinatura: 'assin', Email: 'email'
};

const S = {
  apiUrl: '',
  user: null,          // {id, nome, senha}
  data: null,          // resposta do bootstrap
  vmap: new Map(),     // vendas conhecidas do servidor (id -> venda)
  queue: [],           // alterações aguardando envio
  logos: {},
  lojaFetched: new Set(),
  mesFetched: new Set(),
  lastSync: 0,
  syncing: false,
  syncErr: '',
  ver: 0,              // muda sempre que os dados mudam
  stack: [{ v: 'lojas', p: {} }],
  ui: { filtro: 'todas', piso: '', ordem: 'luc', busca: '', inativas: false, ref: '', histTab: 'vendas', histMes: '', histAud: '', histBusca: '', painelMes: '', rankBy: 'vendas', buscaAberta: false },
  installEvt: null,
  fotos: {},
  audList: null,
  auditoresLogin: []
};

function rowsToVendas(cols, rows) {
  const keys = cols.map(c => COLMAP[c] || c);
  return rows.map(r => { const o = {}; keys.forEach((k, i) => { o[k] = r[i]; }); return o; });
}

async function persist() {
  await KV.set('state', {
    apiUrl: S.apiUrl, user: S.user, data: S.data, queue: S.queue, lastSync: S.lastSync, ui: { filtro: S.ui.filtro, ordem: S.ui.ordem, piso: S.ui.piso, inativas: S.ui.inativas }
  });
}
async function persistLogos() { await KV.set('logos', S.logos); }

/* ============================ Acesso ao servidor ============================ */
async function api(action, payload = {}, opts = {}) {
  const body = Object.assign({ action }, payload);
  if (opts.auth !== false && S.user) body.auth = { id: S.user.id, nome: S.user.nome, senha: S.user.senha };
  let j;
  if (DEMO) {
    await new Promise(r => setTimeout(r, 120));
    j = window.DEMO_API(JSON.stringify(body));
  } else {
    if (!S.apiUrl) throw Object.assign(new Error('Endereço do servidor não configurado'), { config: true });
    let r;
    try {
      r = await fetch(S.apiUrl, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'text/plain;charset=utf-8' }, redirect: 'follow' });
    } catch (e) {
      throw Object.assign(new Error('Sem conexão com o servidor'), { network: true });
    }
    try { j = await r.json(); } catch (e) {
      throw Object.assign(new Error('Resposta inválida do servidor. Confira se o App da Web foi publicado com acesso "Qualquer pessoa".'), { network: true });
    }
  }
  if (!j.ok) {
    const e = new Error(String(j.error || 'Erro no servidor').replace(/^(AUTH|DUPLICADO|PERMISSAO):\s*/, ''));
    e.server = true;
    if (/^AUTH/.test(j.error)) e.auth = true;
    if (/^DUPLICADO/.test(j.error)) e.dup = true;
    throw e;
  }
  return j;
}

function applyBootstrap(b) {
  const vendas = rowsToVendas(b.cols, b.vendas);
  // substitui as vendas recentes; mantém as antigas carregadas sob demanda
  for (const [id, v] of S.vmap) if (v.data >= b.corte) S.vmap.delete(id);
  vendas.forEach(v => S.vmap.set(v.id, v));
  S.data = Object.assign({}, b, { vendas, solicitacoes: b.solicitacoes || [] });
  S.serverOld = verLt(b.version, MIN_SERVER);
  if (b.me && S.user && b.me.perfil !== S.user.perfil) { S.user.perfil = b.me.perfil; }
  S.ver++;
}

function rebuildFromData() {
  S.vmap = new Map();
  if (S.data && S.data.vendas) S.data.vendas.forEach(v => S.vmap.set(v.id, v));
  S.ver++;
}

/* Vendas = servidor + fila local (ainda não enviada) */
let mergedCache = { ver: -1, qlen: -1, list: [], byId: new Map() };
function merged() {
  const qsig = S.queue.length + ':' + S.queue.map(q => q.qid + (q.error || '')).join(',');
  if (mergedCache.ver === S.ver && mergedCache.qlen === qsig) return mergedCache;
  const byId = new Map(S.vmap);
  for (const q of S.queue) {
    if (q.type === 'venda') {
      const base = byId.get(q.venda.VendaId) || {};
      const loja = lojaById(q.venda.Loja) || {};
      byId.set(q.venda.VendaId, Object.assign({}, base, {
        id: q.venda.VendaId, data: q.venda.Data, loja: q.venda.Loja, vendas: +q.venda.Vendas, ticket: +q.venda.Ticket,
        resp: q.venda.Responsavel, hora: base.hora || q.hora, auditor: base.auditor || (S.user && S.user.nome),
        nome: loja.NomeFantasia, contrato: loja.Contrato, abl: loja.ABL, piso: loja.Piso, tipo: loja.Tipo,
        categoria: loja.Categoria, segmento: loja.Segmento, assin: base.assin || '', email: base.email || '',
        _pending: true, _error: q.error || '', _sig: q.assinatura || base._sig
      }));
    } else if (q.type === 'excluirVenda') {
      byId.delete(q.id);
    }
  }
  const list = Array.from(byId.values());
  const byLojaData = new Map();
  for (const v of list) byLojaData.set(v.loja + '|' + v.data, v);
  mergedCache = { ver: S.ver, qlen: qsig, list, byId, byLojaData };
  return mergedCache;
}

function motivosAll() {
  const base = (S.data && S.data.motivos) || [];
  const pend = S.queue.filter(q => q.type === 'motivo').map(q => Object.assign({}, q.motivo, { auditor: S.user && S.user.id, _pending: true, _error: q.error || '' }));
  return base.concat(pend);
}

function solicAll() {
  const base = (S.data && S.data.solicitacoes) || [];
  const pend = S.queue.filter(q => q.type === 'solic').map(q => Object.assign({}, q.solic, { Solicitante: S.user && S.user.nome, Status: 'Pendente', _pending: true, _error: q.error || '' }));
  return base.concat(pend);
}
function solicPendente(vendaId) { return solicAll().find(x => x.VendaId === vendaId && x.Status === 'Pendente'); }

function lojas() { return (S.data && S.data.lojas) || []; }
function lojaById(id) {
  const q = S.queue.filter(x => x.type === 'loja' && x.loja.IdLoja === id).pop();
  if (q) return q.loja;
  return lojas().find(l => l.IdLoja === id);
}
function lojasAll() {
  const list = lojas().slice();
  for (const q of S.queue) {
    if (q.type !== 'loja') continue;
    const i = list.findIndex(l => l.IdLoja === q.loja.IdLoja);
    if (i >= 0) list[i] = Object.assign({}, list[i], q.loja, { _pending: true });
    else list.push(Object.assign({}, q.loja, { _pending: true }));
  }
  return list;
}
function audNome(x) {
  if (!x) return '';
  const a = ((S.data && S.data.auditores) || []).find(a => a.id === x);
  return a ? a.nome : x;
}

/* ============================ Fila e sincronização ============================ */
function enqueue(item) {
  item.qid = uid();
  item.at = Date.now();
  S.queue.push(item);
  S.ver++;
  persist();
  sync({ full: false });
}

let syncTimer = null;
async function sync({ full = true, quiet = true } = {}) {
  if (!S.user) return;
  if (S.syncing) { S.syncAgain = S.syncAgain || full; return; }
  if (!DEMO && !navigator.onLine) { S.syncErr = 'Sem internet'; updateChrome(); return; }
  S.syncing = true; updateChrome();
  try {
    for (const item of S.queue.slice()) {
      if (item.error && !item.retry) continue;
      try {
        await pushItem(item);
        S.queue = S.queue.filter(q => q.qid !== item.qid);
        S.ver++;
      } catch (e) {
        if (e.auth) throw e;
        if (e.server) { item.error = e.message; item.retry = false; S.ver++; if (!quiet) toast(e.message); }
        else throw e;
      }
    }
    await persist();
    if (full) {
      const b = await api('bootstrap');
      applyBootstrap(b);
      S.lastSync = Date.now();
    }
    S.syncErr = '';
  } catch (e) {
    S.syncErr = e.message;
    if (e.auth) { toast('Sua senha mudou ou o acesso expirou. Entre novamente.'); return logout(true); }
    if (!quiet) toast(e.message);
  } finally {
    S.syncing = false;
    await persist();
    refresh();
    loadLogos();
    loadFotos();
    if (S.syncAgain !== undefined) { const f = S.syncAgain; S.syncAgain = undefined; sync({ full: f }); }
  }
}

async function pushItem(item) {
  if (item.type === 'venda') {
    const r = await api('salvarVenda', { venda: item.venda, assinatura: item.assinatura || undefined });
    if (r.row) { const v = rowsToVendas(r.cols, [r.row])[0]; S.vmap.set(v.id, v); if (S.data) upsertRecent(v); }
  } else if (item.type === 'excluirVenda') {
    await api('excluirVenda', { id: item.id });
    S.vmap.delete(item.id);
    if (S.data) S.data.vendas = S.data.vendas.filter(v => v.id !== item.id);
  } else if (item.type === 'motivo') {
    const r = await api('salvarMotivo', { motivo: item.motivo });
    if (S.data) S.data.motivos = S.data.motivos.concat([r.motivo]);
  } else if (item.type === 'solic') {
    const r = await api('solicitar', { solic: item.solic });
    if (S.data && r.solicitacao) S.data.solicitacoes = (S.data.solicitacoes || []).filter(x => x.id_solicitacao !== r.solicitacao.id_solicitacao).concat([r.solicitacao]);
  } else if (item.type === 'loja') {
    const r = await api('salvarLoja', { loja: item.loja, logo: item.logo || undefined });
    if (S.data && r.loja) {
      const i = S.data.lojas.findIndex(l => l.IdLoja === r.loja.IdLoja);
      if (i >= 0) S.data.lojas[i] = r.loja; else S.data.lojas.push(r.loja);
      if (item.logo) { S.logos[r.loja.IdLoja] = { path: r.loja.Logo, data: item.logo }; persistLogos(); }
    }
  }
}
function upsertRecent(v) {
  const i = S.data.vendas.findIndex(x => x.id === v.id);
  if (v.data >= S.data.corte) { if (i >= 0) S.data.vendas[i] = v; else S.data.vendas.push(v); }
  const st = S.data.stats[v.loja] || (S.data.stats[v.loja] = { ultima: '', total: 0 });
  if (i < 0) st.total++;
  if (v.hora > st.ultima) st.ultima = v.hora;
}

let logosBusy = false;
async function loadLogos() {
  if (logosBusy || !S.user || (!DEMO && !navigator.onLine)) return;
  const falta = lojasAll().filter(l => l.Logo && (!S.logos[l.IdLoja] || S.logos[l.IdLoja].path !== l.Logo)).map(l => l.IdLoja);
  if (!falta.length) return;
  logosBusy = true;
  try {
    for (let i = 0; i < falta.length; i += 10) {
      const r = await api('logos', { ids: falta.slice(i, i + 10) });
      Object.assign(S.logos, r.logos);
      await persistLogos();
      refresh(true);
    }
  } catch (e) { /* tenta de novo na próxima sincronização */ }
  logosBusy = false;
}

/* Busca no servidor o histórico completo de uma loja / um mês antigo */
async function ensureLoja(id) {
  if (S.lojaFetched.has(id) || (!DEMO && !navigator.onLine)) return;
  S.lojaFetched.add(id);
  try {
    const r = await api('vendas', { loja: id });
    rowsToVendas(r.cols, r.rows).forEach(v => S.vmap.set(v.id, v));
    S.ver++; refresh();
  } catch (e) { S.lojaFetched.delete(id); }
}
async function ensureMes(m) {
  if (!S.data || m + '-01' >= S.data.corte || S.mesFetched.has(m) || (!DEMO && !navigator.onLine)) return;
  S.mesFetched.add(m);
  S.loadingMes = m; refresh();
  try {
    const r = await api('vendas', { de: m + '-01', ate: m + '-' + pad(daysIn(m)) });
    rowsToVendas(r.cols, r.rows).forEach(v => S.vmap.set(v.id, v));
    S.ver++;
  } catch (e) { S.mesFetched.delete(m); toast('Não foi possível carregar ' + mesNome(m)); }
  S.loadingMes = ''; refresh();
}

/* ============================ Navegação ============================ */
let refreshT = null;
let histOk = true;
function cur() { return S.stack[S.stack.length - 1]; }
function go(v, p = {}) {
  clearTimeout(refreshT);
  S.stack.push({ v, p });
  try { history.pushState({ d: S.stack.length }, ''); } catch (e) { histOk = false; }
  render(); window.scrollTo(0, 0);
}
function replace(v, p = {}) { clearTimeout(refreshT); S.stack[S.stack.length - 1] = { v, p }; render(); window.scrollTo(0, 0); }
function back() {
  if (S.stack.length <= 1) return;
  if (histOk) { try { history.back(); return; } catch (e) { /* segue */ } }
  S.stack.pop(); render();
}
window.addEventListener('popstate', () => {
  if (S.stack.length > 1) { S.stack.pop(); render(); }
});
function tab(v) {
  const n = S.stack.length - 1;
  S.stack = [{ v, p: {} }];
  if (n > 0 && histOk) { try { history.go(-n); } catch (e) { /* ignora */ } }
  render(); window.scrollTo(0, 0);
}

let toastT = null;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 3200);
}

/* ============================ Marca, tema e configurações ============================ */
const SELO = (c, s = 4) => `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="34" fill="none" stroke="${c}" stroke-width="${s}"/><path d="M32 55 Q39 47 46 46.5 Q50 46.3 51.5 43 Q54 37 55 29 Q56 23 58.5 23 Q61 23 61 29 Q61 45 64.5 58 Q66.5 66 61.5 66.5 Q57 67 56.5 61.5" fill="none" stroke="${c}" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"/><path d="M29 67 Q47 56 71 60" fill="none" stroke="${c}" stroke-width="${s}" stroke-linecap="round"/></svg>`;
const SHOP_LOGO = window.SHOP_LOGO || 'icons/shopping-logo.png';

function temaAtual() { try { return localStorage.getItem('tema') || 'auto'; } catch (e) { return S.temaMem || 'auto'; } }
function aplicarTema(t) {
  const root = document.documentElement;
  if (t === 'light' || t === 'dark') root.setAttribute('data-theme', t); else root.removeAttribute('data-theme');
  const escuro = t === 'dark' || (t !== 'light' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', escuro ? '#11392f' : '#17705c');
}
function setTema(t) { S.temaMem = t; try { if (t === 'auto') localStorage.removeItem('tema'); else localStorage.setItem('tema', t); } catch (e) { /* só nesta sessão */ } aplicarTema(t); }

const CFG_PADRAO = { pts_prazo: 10, pts_atraso_curto: 5, pts_atraso_longo: 2, pts_motivo: 3, pts_correcao: -5, pts_exclusao: -10, pts_sequencia: 5, pts_conquista: 20, desafio_titulo: '', desafio_tipo: 'prazo', desafio_meta: 90, desafio_ate: '' };
const cfg = k => (S.data && S.data.config && k in S.data.config) ? S.data.config[k] : CFG_PADRAO[k];
const lojasRota = () => lojasAll().filter(l => l['Situação'] !== 'Inativo' && l.Rota !== 'Não');
const naRota = l => l && l['Situação'] !== 'Inativo' && l.Rota !== 'Não';
const addDias = (ymd, n) => { const d = new Date(ymd.slice(0, 10) + 'T12:00:00'); d.setDate(d.getDate() + n); return ymdOf(d); };
const diasEntre = (a, b) => Math.round((Date.parse(a.slice(0, 10) + 'T12:00:00Z') - Date.parse(b.slice(0, 10) + 'T12:00:00Z')) / 864e5);

/* ============================ Fotos dos auditores ============================ */
function audInfo(nomeOuId) {
  const lists = [((S.data && S.data.auditores) || []), S.auditoresLogin || [], S.audList || []];
  for (const l of lists) { const a = l.find(x => x.nome === nomeOuId || x.id === nomeOuId); if (a) return a; }
  return null;
}
function audAvatar(nomeOuId, size = 38) {
  const a = audInfo(nomeOuId);
  const nome = a ? a.nome : (audNome(nomeOuId) || '?');
  const src = a && a.foto && S.fotos[a.foto];
  const st = `width:${size}px;height:${size}px;border-radius:50%;font-size:${Math.round(size * .36)}px;flex:none;`;
  return src ? `<span class="avatar" style="${st}"><img src="${src}" alt="" style="object-fit:cover"></span>`
    : `<span class="avatar" style="${st}background:hsl(${hueOf(nome)} 42% 38%)">${esc(initials(nome))}</span>`;
}
let fotosBusy = false;
async function loadFotos() {
  if (fotosBusy || (!DEMO && !navigator.onLine)) return;
  const paths = new Set();
  [((S.data && S.data.auditores) || []), S.auditoresLogin || [], S.audList || []].forEach(l => l.forEach(a => { if (a.foto && !(a.foto in S.fotos)) paths.add(a.foto); }));
  if (!paths.size) return;
  fotosBusy = true;
  try {
    const r = await api('fotosAuditores', { paths: Array.from(paths) }, { auth: false });
    paths.forEach(p => { S.fotos[p] = (r.fotos && r.fotos[p]) || ''; });
    await KV.set('fotos', S.fotos);
    const senha = $('#senha') ? $('#senha').value : '';
    refresh(true);
    if (senha) setTimeout(() => { if ($('#senha')) $('#senha').value = senha; }, 300);
  } catch (e) { /* tenta depois */ }
  fotosBusy = false;
}

/* ============================ Nova versão do app ============================ */
async function checkUpdate() {
  if (DEMO || location.protocol !== 'https:') return;
  try {
    const r = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' });
    const j = await r.json();
    if (j.version && verLt(APP_VERSION, j.version)) { S.updateAvail = j.version; updateChrome(true); }
  } catch (e) { /* sem internet */ }
}
async function doUpdate() {
  toast('Atualizando o app…');
  try {
    if ('serviceWorker' in navigator) { const regs = await navigator.serviceWorker.getRegistrations(); await Promise.all(regs.map(r => r.update().catch(() => {}))); }
    if (window.caches) { const ks = await caches.keys(); await Promise.all(ks.map(k => caches.delete(k))); }
  } catch (e) { /* segue */ }
  location.reload();
}

/* ============================ Atrasos e rota de coleta ============================ */
const PISO_ORD = p => { const m = String(p || '').match(/^L(\d+)$/i); return m ? +m[1] : 50; };
function ordemRota(a, b) {
  return PISO_ORD(a.Piso) - PISO_ORD(b.Piso) || String(a.Piso).localeCompare(String(b.Piso)) || String(a.Luc).localeCompare(String(b.Luc), 'pt-BR', { numeric: true });
}
function diasAtrasados(lojaId, n) {
  const M = merged();
  const mot = new Set(motivosAll().filter(m => m.loja === lojaId).map(m => m.data.slice(0, 10)));
  const out = [];
  const d = new Date();
  for (let i = 1; i <= n; i++) {
    d.setDate(d.getDate() - 1);
    const k = ymdOf(d);
    if (!M.byLojaData.has(lojaId + '|' + k) && !mot.has(k)) out.push(k);
  }
  return out.sort();   // mais antigo primeiro
}
function lojasAtivas() { return lojasAll().filter(l => l['Situação'] !== 'Inativo'); }
function proximaPendente(lojaId, data, modo) {
  if (modo !== 'dia') {
    // rota / atrasadas: termina os dias da mesma loja e segue para a próxima loja da rota
    const n = modo === 'atrasadas' ? (S.ui.atrasoDias || 7) : 7;
    const mesma = naRota(lojaById(lojaId)) ? diasAtrasados(lojaId, n) : [];
    const ord = lojasRota().sort(ordemRota);
    const todas = ord.map(l => ({ l, d: diasAtrasados(l.IdLoja, n) })).filter(x => x.d.length);
    const total = todas.reduce((s, x) => s + x.d.length, 0);
    if (mesma.length) return { loja: lojaById(lojaId), data: mesma[0], resta: total, modo };
    if (!todas.length) return { resta: 0, modo };
    const idx = ord.findIndex(l => l.IdLoja === lojaId);
    const prox = todas.find(x => ord.indexOf(x.l) > idx) || todas[0];
    return { loja: prox.l, data: prox.d[0], resta: total, modo };
  }
  const M = merged();
  const ord = lojasRota().sort(ordemRota);
  const motDia = new Set(motivosAll().filter(m => m.data.slice(0, 10) === data).map(m => m.loja));
  const pend = ord.filter(l => !M.byLojaData.has(l.IdLoja + '|' + data) && !motDia.has(l.IdLoja));
  if (!pend.length) return { resta: 0, modo, data };
  const idx = ord.findIndex(l => l.IdLoja === lojaId);
  const depois = pend.find(l => ord.indexOf(l) > idx) || pend[0];
  return { loja: depois, data, resta: pend.length, modo };
}

/* Alerta de valor fora do padrão: compara com a mediana da loja */
function foraDoPadrao(lojaId, data, valor, ignorarId) {
  if (valor === 0) return { msg: 'A venda está <b>zerada</b>. Confirme se a loja realmente não vendeu nada neste dia.' };
  const dow = new Date(data + 'T12:00:00').getDay();
  const hist = merged().list.filter(v => v.loja === lojaId && v.id !== ignorarId && v.data !== data && +v.vendas > 0).sort((a, b) => b.data.localeCompare(a.data));
  let base = hist.filter(v => new Date(v.data + 'T12:00:00').getDay() === dow).slice(0, 8);
  let ref;
  if (dow === 0) ref = 'nos últimos domingos'; else if (dow === 6) ref = 'nos últimos sábados'; else ref = 'nas últimas ' + DOW[dow] + 's-feiras';
  if (base.length < 3) { base = hist.slice(0, 20); ref = 'nos últimos lançamentos'; }
  if (base.length < 3) return null;
  const vals = base.map(v => +v.vendas).sort((a, b) => a - b);
  const med = vals.length % 2 ? vals[(vals.length - 1) / 2] : (vals[vals.length / 2 - 1] + vals[vals.length / 2]) / 2;
  if (valor > med * 5) return { msg: `<b>${money(valor)}</b> é ${Math.round(valor / med)} vezes maior que o normal desta loja (cerca de <b>${money(med)}</b> ${ref}). Confira se não sobrou um zero ou se a vírgula está certa.` };
  if (valor < med * 0.2) return { msg: `<b>${money(valor)}</b> está muito abaixo do normal desta loja (cerca de <b>${money(med)}</b> ${ref}). Confira se não faltou um dígito.` };
  return null;
}

/* ============================ Componentes ============================ */
function avatar(loja, size) {
  const lg = loja && S.logos[loja.IdLoja];
  const st = size ? ` style="width:${size}px;height:${size}px"` : '';
  if (lg && lg.data) return `<span class="avatar"${st}><img src="${lg.data}" alt=""></span>`;
  const nome = loja ? loja.NomeFantasia : '?';
  return `<span class="avatar"${st} style="${size ? `width:${size}px;height:${size}px;` : ''}background:hsl(${hueOf(nome)} 42% 38%)">${esc(initials(nome))}</span>`;
}

function topbar({ title, sub = '', backBtn = false, actions = '', search = '' }) {
  const pend = S.queue.length;
  const syncCls = S.syncing ? ' spin' : '';
  const offline = !DEMO && !navigator.onLine;
  return `<header class="top"><div class="wrap">
    ${DEMO ? '<div class="demo-banner gutter">Demonstração com dados de exemplo — senha de todos: 1234 · Renato é o master</div>' : ''}
    ${S.updateAvail ? `<button class="demo-banner gutter" data-act="doUpdate" style="display:block;width:100%;border:0;background:var(--brand-strong);color:var(--surface);font-weight:700">Nova versão ${esc(S.updateAvail)} disponível. Toque aqui para atualizar.</button>` : ''}
    ${S.serverOld ? '<div class="demo-banner gutter">O código da planilha (Code.gs) está desatualizado. Atualize o Apps Script para a versão ' + MIN_SERVER + '.</div>' : ''}
    <div class="top-row gutter">
      ${backBtn ? `<button class="icon-btn" data-act="back" aria-label="Voltar">${ICON.back}</button>` : ''}
      ${backBtn ? '' : `<span class="hdr-logo">${SELO('currentColor', 5)}</span>`}
      <h1>${esc(title)}${sub ? `<span class="sub">${esc(sub)}</span>` : ''}</h1>
      ${actions}
      <button class="icon-btn${syncCls}" data-act="sync" id="syncBtn" aria-label="Sincronizar" title="${offline ? 'Sem internet' : 'Sincronizar'}">${offline ? ICON.cloudOff : ICON.sync}${pend ? `<span class="sync-dot">${pend}</span>` : ''}</button>
    </div>${search}</div></header>`;
}

function navbar(active) {
  const it = [['rota', 'Rota', ICON.route], ['lojas', 'Lojas', ICON.store], ['historico', 'Histórico', ICON.hist]].concat(isMaster() ? [['painel', 'Painel', ICON.chart]] : []).concat([['mais', 'Conta', ICON.user]]);
  return `<nav class="nav" style="grid-template-columns:repeat(${it.length},1fr)">${it.map(([k, l, i]) => `<button data-tab="${k}" ${active === k ? 'aria-current="page"' : ''}>${i}<span>${l}</span></button>`).join('')}</nav>`;
}

function statusPill(kind) {
  if (kind === 'ok') return `<span class="status st-ok">${ICON.check}Lançado</span>`;
  if (kind === 'pend') return `<span class="status st-pend">${ICON.clock}Na fila</span>`;
  if (kind === 'mot') return `<span class="status st-mot">${ICON.note}Motivo</span>`;
  return `<span class="status st-no">${ICON.x}Pendente</span>`;
}

/* ============================ Cálculos ============================ */
function lojaInfo(l, ref) {
  const M = merged();
  const v = M.byLojaData.get(l.IdLoja + '|' + ref);
  const mes = ref.slice(0, 7);
  let dias = 0;
  const seen = new Set();
  for (const x of M.list) if (x.loja === l.IdLoja && x.data.startsWith(mes) && !seen.has(x.data)) { seen.add(x.data); dias++; }
  const st = (S.data && S.data.stats[l.IdLoja]) || { ultima: '', total: 0 };
  let ultima = st.ultima;
  for (const q of S.queue) if (q.type === 'venda' && q.venda.Loja === l.IdLoja && q.hora > ultima) ultima = q.hora;
  let kind = v ? (v._pending ? 'pend' : 'ok') : 'no';
  if (!v && motivosAll().some(m => m.loja === l.IdLoja && m.data.slice(0, 10) === ref)) kind = 'mot';
  return { venda: v, dias, total: daysIn(mes), ultima, kind };
}

/* ============================ Telas ============================ */
const VIEWS = {};

/* ---------- Lojas ---------- */
VIEWS.lojas = () => {
  const ref = S.ui.ref || ontem();
  const refLabel = ref === ontem() ? 'Ontem' : ref === today() ? 'Hoje' : dBR(ref);
  const solPend = isMaster() ? solicAll().filter(x => x.Status === 'Pendente').length : 0;
  const busca = norm(S.ui.busca);
  const ativas = lojasAll().filter(l => S.ui.inativas || l['Situação'] !== 'Inativo');
  const infos = ativas.map(l => ({ l, i: lojaInfo(l, ref) }));
  const lanc = infos.filter(x => x.i.kind === 'ok' || x.i.kind === 'pend').length;
  const nAtr = S.ui.atrasoDias || 7;
  infos.forEach(x => { x.atr = naRota(x.l) ? diasAtrasados(x.l.IdLoja, nAtr) : []; });
  const atrLojas = infos.filter(x => x.atr.length).length;
  const atrDias = infos.reduce((s, x) => s + x.atr.length, 0);
  const modoAtr = S.ui.filtro === 'atrasadas';
  const pisos = Array.from(new Set(lojasAll().map(l => l.Piso).filter(Boolean))).sort();
  let list = infos.filter(x => {
    if (S.ui.piso && x.l.Piso !== S.ui.piso) return false;
    if (S.ui.filtro === 'pendentes' && (x.i.kind === 'ok' || x.i.kind === 'pend')) return false;
    if (S.ui.filtro === 'lancadas' && !(x.i.kind === 'ok' || x.i.kind === 'pend')) return false;
    if (modoAtr && !x.atr.length) return false;
    if (busca && !norm(x.l.NomeFantasia + ' ' + x.l.Luc + ' ' + x.l.Segmento + ' ' + x.l.Categoria + ' ' + x.l.Contrato).includes(busca)) return false;
    return true;
  });
  const ord = S.ui.ordem;
  list.sort((a, b) => {
    if (modoAtr) return b.atr.length - a.atr.length || ordemRota(a.l, b.l);
    if (ord === 'nome') return a.l.NomeFantasia.localeCompare(b.l.NomeFantasia, 'pt-BR');
    if (ord === 'coleta') return (a.i.ultima || '').localeCompare(b.i.ultima || '');
    if (ord === 'dias') return a.i.dias - b.i.dias || a.l.NomeFantasia.localeCompare(b.l.NomeFantasia, 'pt-BR');
    return String(a.l.Luc).localeCompare(String(b.l.Luc), 'pt-BR', { numeric: true });
  });
  const pct = ativas.length ? Math.round(lanc / ativas.length * 100) : 0;
  const pendCount = ativas.length - lanc;

  const search = S.ui.buscaAberta || S.ui.busca ? `<div class="search gutter"><input id="busca" type="search" placeholder="Buscar por nome, LUC, segmento…" value="${esc(S.ui.busca)}" autocomplete="off"></div>` : '';
  const html = `
  ${topbar({ title: 'Lojas', sub: CFG.nomeShopping || '', actions: `<button class="icon-btn" data-act="toggleBusca" aria-label="Buscar">${ICON.search}</button>`, search })}
  <main><div class="wrap">
    <div class="gutter section" style="display:grid;gap:10px">
      ${solPend ? `<button class="alert warn" data-act="verSolic" style="border:0;text-align:left;width:100%"><div><b>${solPend} solicitaç${solPend > 1 ? 'ões' : 'ão'} de alteração</b> aguardando sua aprovação. Toque para ver.</div></button>` : ''}
      ${modoAtr ? `<div class="alert ${atrDias ? 'warn' : 'ok'}"><div>${atrDias ? `<b>${atrLojas} loja${atrLojas > 1 ? 's' : ''}</b> com dias sem lançamento nos últimos ${nAtr} dias (${atrDias} dia${atrDias > 1 ? 's' : ''} no total). Toque em <b>+ Lançar</b> para começar pelo dia mais antigo; depois de salvar, o app leva ao próximo.` : `Nenhuma loja com dias em atraso nos últimos ${nAtr} dias.`}</div></div>` : ''}
      <div class="card today" ${modoAtr ? 'hidden' : ''}>
        <div class="today-head">
          <div class="today-big num">${lanc}<small> de ${ativas.length} lojas lançadas</small></div>
          <label class="date-chip">${ICON.cal.replace('<svg', '<svg width="16" height="16"')}${esc(refLabel)}<input type="date" id="refDate" value="${ref}" max="${today()}" aria-label="Data de referência"></label>
        </div>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <div class="muted" style="font-size:13px">Vendas de ${esc(diaLongo(ref))}. ${pendCount ? pendCount + ' loja' + (pendCount > 1 ? 's' : '') + ' sem lançamento.' : 'Todas as lojas lançadas.'}</div>
      </div>
      <div class="chips" role="group" aria-label="Filtros">
        <button class="chip" data-filtro="todas" aria-pressed="${S.ui.filtro === 'todas'}">Todas<b>${ativas.length}</b></button>
        <button class="chip" data-filtro="pendentes" aria-pressed="${S.ui.filtro === 'pendentes'}">Pendentes<b>${pendCount}</b></button>
        <button class="chip" data-filtro="lancadas" aria-pressed="${S.ui.filtro === 'lancadas'}">Lançadas<b>${lanc}</b></button>
        <button class="chip" data-filtro="atrasadas" aria-pressed="${modoAtr}">Atrasadas<b>${atrLojas}</b></button>
        ${modoAtr ? `<select class="chip" id="fAtraso" aria-label="Período">${[7, 15, 30].map(n => `<option value="${n}" ${nAtr === n ? 'selected' : ''}>Últimos ${n} dias</option>`).join('')}</select>` : ''}
        <select class="chip" id="fPiso" aria-label="Piso"><option value="">Todos os pisos</option>${pisos.map(p => `<option ${S.ui.piso === p ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select>
        <select class="chip" id="fOrdem" aria-label="Ordenar">
          ${[['luc', 'Ordem: LUC'], ['nome', 'Ordem: Nome'], ['coleta', 'Coleta mais antiga'], ['dias', 'Menos dias lançados']].map(([k, l]) => `<option value="${k}" ${ord === k ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
        <button class="chip" data-act="toggleInativas" aria-pressed="${S.ui.inativas}">Mostrar inativas</button>
      </div>
    </div>
    <div class="list">
      ${list.length ? list.map((x) => { const { l, i } = x; return `
      <div class="store" role="button" tabindex="0" data-loja="${esc(l.IdLoja)}">
        ${avatar(l)}
        <div class="store-main">
          <div class="store-name">${esc(l.NomeFantasia)}${l['Situação'] === 'Inativo' ? ' <span class="badge">inativa</span>' : l.Rota === 'Não' ? ' <span class="badge" style="background:var(--soft);color:var(--muted)">fora da rota</span>' : ''}</div>
          <div class="store-meta">LUC ${esc(l.Luc)} · ${esc(l.Piso || '—')} · ${esc(l.Segmento || l.Categoria || '')}</div>
          <div class="store-prog num"><span class="bar"><i style="width:${Math.round(i.dias / i.total * 100)}%"></i></span>${i.dias}/${i.total} dias · ${i.ultima ? 'coleta ' + esc(dShort(i.ultima) + ' ' + i.ultima.slice(11, 16)) : 'sem coleta'}</div>
        </div>
        <div class="store-side">
          ${modoAtr ? `<span class="status st-no">${x.atr.length} dia${x.atr.length > 1 ? 's' : ''}</span><button class="quick" data-registrar="${esc(l.IdLoja)}" data-data="${x.atr[0]}" data-modo="atrasadas">+ Lançar ${dShort(x.atr[0])}</button>`
            : `${statusPill(i.kind)}${i.kind === 'ok' || i.kind === 'pend' ? '' : `<button class="quick" data-registrar="${esc(l.IdLoja)}" data-data="${ref}" data-modo="dia">+ Venda</button>`}`}
        </div>
      </div>`; }).join('') : `<div class="empty">${ICON.store}<div>${modoAtr ? 'Nenhuma loja em atraso.' : 'Nenhuma loja encontrada.'}</div></div>`}
    </div>
  </div></main>
  <button class="fab" data-registrar="" data-data="${ref}" data-modo="dia">${ICON.plus}Registrar venda</button>
  ${navbar('lojas')}`;
  return { html };
};

/* ---------- Minha rota de hoje ---------- */
VIEWS.rota = () => {
  const ontemD = ontem();
  const rl = lojasRota().sort(ordemRota);
  const itens = rl.map(l => ({ l, d: diasAtrasados(l.IdLoja, 7) }));
  const pend = itens.filter(x => x.d.length);
  const ontemFeitas = itens.filter(x => !x.d.includes(ontemD)).length;
  const atrasos = itens.reduce((s, x) => s + x.d.filter(k => k !== ontemD).length, 0);
  const pct = rl.length ? Math.round(ontemFeitas / rl.length * 100) : 0;
  const prox = pend[0];
  const fora = lojasAtivas().length - rl.length;
  const porPiso = {};
  pend.forEach(x => { const p = x.l.Piso || 'Sem piso'; (porPiso[p] = porPiso[p] || []).push(x); });
  const chipDias = ds => {
    const o = ds.includes(ontemD) ? '<span class="status st-no">Ontem</span>' : '';
    const outros = ds.filter(k => k !== ontemD);
    return o + (outros.length ? `<span class="status st-mot">${outros.length === 1 ? dShort(outros[0]) : outros.length + ' atrasados'}</span>` : '');
  };
  const html = `
  ${topbar({ title: 'Minha rota de hoje', sub: diaLongo(today()).replace(/^./, c => c.toUpperCase()) })}
  <main><div class="wrap">
    <div class="gutter section" style="display:grid;gap:12px">
      ${isMaster() && solicAll().some(x => x.Status === 'Pendente') ? `<button class="alert warn" data-act="verSolic" style="border:0;text-align:left;width:100%"><div><b>Há solicitações de alteração</b> aguardando sua aprovação. Toque para ver.</div></button>` : ''}
      <div class="card today">
        <div class="today-head"><div class="today-big num">${ontemFeitas}<small> de ${rl.length} lojas com a venda de ontem</small></div></div>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <div class="muted" style="font-size:13px">${atrasos ? `E mais <b>${atrasos}</b> lançamento${atrasos > 1 ? 's' : ''} em atraso nos últimos 7 dias.` : 'Nenhum atraso nos últimos 7 dias.'}</div>
      </div>
      ${prox ? `<button class="btn primary" style="min-height:64px;font-size:16.5px;display:grid;grid-template-columns:auto 1fr auto;text-align:left;gap:12px" data-act="proxRota" data-pl="${esc(prox.l.IdLoja)}" data-pd="${prox.d[0]}">
        ${ICON.dollar}<span style="min-width:0"><span style="display:block">Lançar próxima loja</span><span style="display:block;font-weight:600;font-size:13.5px;opacity:.9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(prox.l.NomeFantasia)} · ${esc(prox.l.Piso || '')} · venda de ${dShort(prox.d[0])}</span></span>${ICON.right}</button>`
      : `<div class="alert ok"><div><b>Rota concluída.</b> Todas as lojas da rota estão em dia.</div></div>`}
    </div>
    ${Object.keys(porPiso).sort((a, b) => PISO_ORD(a) - PISO_ORD(b) || a.localeCompare(b)).map(p => `
      <div class="group-h"><span>${esc(p)}</span><span>${porPiso[p].length} loja${porPiso[p].length > 1 ? 's' : ''}</span></div>
      <div class="list">${porPiso[p].map(x => `<div class="store" role="button" tabindex="0" data-loja="${esc(x.l.IdLoja)}">
        ${avatar(x.l)}
        <div class="store-main"><div class="store-name">${esc(x.l.NomeFantasia)}</div><div class="store-meta">LUC ${esc(x.l.Luc)} · ${esc(x.l.Segmento || x.l.Categoria || '')}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">${chipDias(x.d)}</div></div>
        <div class="store-side"><button class="quick" data-registrar="${esc(x.l.IdLoja)}" data-data="${x.d[0]}" data-modo="rota">+ Lançar ${dShort(x.d[0])}</button></div>
      </div>`).join('')}</div>`).join('')}
    <div class="gutter section" style="display:grid;gap:8px">
      <div class="muted" style="font-size:12.5px">A rota mostra as lojas sem a venda de ontem e as que estão com dias em atraso (últimos 7 dias), na ordem de piso e LUC. Dias com motivo registrado não contam como atraso.${fora ? ` ${fora} loja${fora > 1 ? 's' : ''} fora da rota.` : ''}</div>
      ${isMaster() ? `<button class="btn" data-act="rotaConfig">${ICON.route}Escolher lojas da rota</button>` : ''}
    </div>
  </div></main>
  ${navbar('rota')}`;
  return { html };
};

function rotaConfigResumo() {
  const n = lojasAtivas().filter(l => (S.rotaEdit[l.IdLoja] || l.Rota || 'Sim') !== 'Não').length;
  return `${n} de ${lojasAtivas().length} lojas na rota`;
}
VIEWS.rotaConfig = () => {
  const ls = lojasAtivas().sort(ordemRota);
  const grupos = {};
  ls.forEach(l => { const p = l.Piso || 'Sem piso'; (grupos[p] = grupos[p] || []).push(l); });
  const html = `
  ${topbar({ title: 'Lojas da rota', backBtn: true })}
  <main class="form-main"><div class="wrap">
    <div class="gutter section"><div class="alert warn"><div>Desmarque as lojas que o auditor <b>não visita todos os dias</b>. Elas saem da rota diária e da contagem de atrasos, mas continuam na lista de Lojas e podem ser lançadas normalmente.</div></div>
    <div style="font-weight:700;margin-top:12px" id="rotaCount">${rotaConfigResumo()}</div></div>
    ${Object.keys(grupos).sort((a, b) => PISO_ORD(a) - PISO_ORD(b) || a.localeCompare(b)).map(p => `<div class="group-h"><span>${esc(p)}</span></div>
      <div class="list">${grupos[p].map(l => `<label class="row" style="grid-template-columns:auto 1fr auto;cursor:pointer">${avatar(l, 38)}<div><div class="t">${esc(l.NomeFantasia)}</div><div class="s">LUC ${esc(l.Luc)} · ${esc(l.Tipo || '')}</div></div>
        <input type="checkbox" class="switch" data-rotachk="${esc(l.IdLoja)}" ${(S.rotaEdit[l.IdLoja] || l.Rota || 'Sim') !== 'Não' ? 'checked' : ''} aria-label="${esc(l.NomeFantasia)} na rota"></label>`).join('')}</div>`).join('')}
    <div class="gutter" id="rotaErr" style="padding-top:12px"></div>
  </div></main>
  <div class="formbar"><button class="btn" data-act="back">Cancelar</button><button class="btn primary" data-act="saveRota">${ICON.check}Salvar rota</button></div>`;
  return { html, form: true };
};
async function saveRota() {
  const mud = {};
  Object.keys(S.rotaEdit || {}).forEach(id => { const l = lojaById(id); if (l && (l.Rota || 'Sim') !== S.rotaEdit[id]) mud[id] = S.rotaEdit[id]; });
  if (!Object.keys(mud).length) return back();
  if (!DEMO && !navigator.onLine) { $('#rotaErr').innerHTML = '<div class="alert bad">Alterar a rota precisa de internet.</div>'; return; }
  const btn = $('[data-act="saveRota"]'); btn.disabled = true;
  try {
    const r = await api('salvarRota', { mudancas: mud });
    if (S.data) S.data.lojas = r.lojas;
    S.ver++; await persist();
    toast('Rota atualizada.');
    back();
  } catch (e) { $('#rotaErr').innerHTML = `<div class="alert bad">${esc(e.message)}</div>`; btn.disabled = false; }
}

/* ---------- Gamificação (por enquanto só o master vê) ---------- */
const CONQUISTAS = [
  { k: 'madrugador', ic: '🌅', nome: 'Madrugador', desc: '10 lançamentos antes das 11h no mesmo dia' },
  { k: 'maofirme', ic: '✋', nome: 'Mão firme', desc: '30 lançamentos seguidos sem nenhuma correção aprovada' },
  { k: 'rota', ic: '🗺️', nome: 'Rota completa', desc: 'Todas as lojas da rota de um piso (com 3 lojas ou mais) lançadas no mesmo dia' },
  { k: 'zerou', ic: '🧹', nome: 'Zerou atrasadas', desc: 'Terminar um dia de trabalho sem nenhum atraso na rota nos últimos 7 dias' },
  { k: 'maratona', ic: '🏃', nome: 'Maratonista', desc: '50 lançamentos no mesmo dia' },
  { k: 'precisao', ic: '🎯', nome: 'Precisão 100%', desc: 'Fechar o mês com 100 lançamentos ou mais e nenhuma correção (conta quando o mês termina)' }
];
const REGRAS = [
  ['prazo', 'pts_prazo', 'Venda lançada no prazo', 'até 1 dia depois da data da venda'],
  ['curto', 'pts_atraso_curto', 'Venda lançada com 2 ou 3 dias de atraso', ''],
  ['longo', 'pts_atraso_longo', 'Venda lançada com 4 dias ou mais de atraso', ''],
  ['motivo', 'pts_motivo', 'Motivo registrado', 'quando a loja não passou a venda'],
  ['correcao', 'pts_correcao', 'Correção aprovada em um lançamento seu', ''],
  ['exclusao', 'pts_exclusao', 'Exclusão aprovada', 'lançamento indevido'],
  ['sequencia', 'pts_sequencia', 'Dia de sequência, a partir do 3º dia', 'dia trabalhado em que a venda de ontem de todas as lojas da rota estava lançada'],
  ['conquista', 'pts_conquista', 'Conquista desbloqueada', 'cada conquista conta uma vez por mês']
];

let gameCache = { key: '', val: null };
function gamificacao(mes) {
  const key = mes + '|' + S.ver + '|' + S.queue.length + '|' + JSON.stringify((S.data && S.data.config) || {}) + '|' + today();
  if (gameCache.key === key) return gameCache.val;
  const M = merged();
  const rotaLs = lojasRota();
  const hoje = today();
  const reg = new Map();      // loja|data -> dia do primeiro registro
  for (const v of M.list) { const k = v.loja + '|' + v.data; const h = String(v.hora || '').slice(0, 10) || v.data; if (!reg.has(k) || h < reg.get(k)) reg.set(k, h); }
  const motReg = new Map();   // motivo registrado no dia X justifica X e X-1
  for (const m of motivosAll()) { const d0 = m.data.slice(0, 10); [d0, addDias(d0, -1)].forEach(dd => { const k = m.loja + '|' + dd; if (!motReg.has(k) || d0 < motReg.get(k)) motReg.set(k, d0); }); }
  const coberto = (id, dia, ate) => { const r = reg.get(id + '|' + dia); if (r && r <= ate) return true; const m = motReg.get(id + '|' + dia); return !!(m && m <= ate); };
  const aprov = solicAll().filter(x => x.Status === 'Aprovada');
  const corrigidas = new Set(aprov.map(x => x.VendaId));
  const jog = {};
  const J = n => jog[n] || (jog[n] = { nome: n, pts: 0, itens: { prazo: 0, curto: 0, longo: 0, motivo: 0, correcao: 0, exclusao: 0, sequencia: 0, conquista: 0 }, lanc: [], dias: new Set(), conq: {}, prog: {} });
  for (const v of M.list) {
    const h = String(v.hora || ''); if (!h.startsWith(mes)) continue;
    const j = J(audNome(v.auditor) || '(sem auditor)'); j.lanc.push(v); j.dias.add(h.slice(0, 10));
    const at = diasEntre(h, v.data);
    if (at <= 1) j.itens.prazo++; else if (at <= 3) j.itens.curto++; else j.itens.longo++;
  }
  for (const m of motivosAll()) if (m.data.startsWith(mes)) J(audNome(m.auditor) || m.auditor).itens.motivo++;
  for (const x of aprov) {
    if (!String(x.DataResolucao || '').startsWith(mes)) continue;
    const v = M.byId.get(x.VendaId) || S.vmap.get(x.VendaId);
    J(v ? audNome(v.auditor) : x.Solicitante).itens[x.Tipo === 'Exclusão' ? 'exclusao' : 'correcao']++;
  }
  const porPiso = {};
  rotaLs.forEach(l => { (porPiso[l.Piso || '—'] = porPiso[l.Piso || '—'] || []).push(l.IdLoja); });
  const P = { prazo: 'pts_prazo', curto: 'pts_atraso_curto', longo: 'pts_atraso_longo', motivo: 'pts_motivo', correcao: 'pts_correcao', exclusao: 'pts_exclusao', sequencia: 'pts_sequencia', conquista: 'pts_conquista' };
  for (const j of Object.values(jog)) {
    const dias = Array.from(j.dias).sort();
    let seq = 0, max = 0;
    for (const D of dias) {
      if (rotaLs.length && rotaLs.every(l => coberto(l.IdLoja, addDias(D, -1), D))) { seq++; if (seq >= 3) j.itens.sequencia++; } else seq = 0;
      max = Math.max(max, seq);
    }
    j.seqAtual = seq; j.seqMax = max;
    const porDia = {};
    j.lanc.forEach(v => { const d0 = v.hora.slice(0, 10); (porDia[d0] = porDia[d0] || []).push(v); });
    const cedo = Math.max(0, ...Object.values(porDia).map(a => a.filter(v => v.hora.slice(11, 13) < '11').length));
    const maxDia = Math.max(0, ...Object.values(porDia).map(a => a.length));
    let run = 0, best = 0;
    j.lanc.slice().sort((a, b) => a.hora.localeCompare(b.hora)).forEach(v => { if (corrigidas.has(v.id)) run = 0; else { run++; best = Math.max(best, run); } });
    let rotaOk = false, rotaBest = 0;
    for (const arr of Object.values(porDia)) {
      const grp = {};
      arr.forEach(v => { const l = lojaById(v.loja); if (!l) return; const k = v.data + '|' + (l.Piso || '—'); (grp[k] = grp[k] || new Set()).add(v.loja); });
      for (const [k, set] of Object.entries(grp)) {
        const tot = porPiso[k.split('|')[1]] || [];
        if (tot.length >= 3) { const c = tot.filter(id => set.has(id)).length; rotaBest = Math.max(rotaBest, c / tot.length); if (c === tot.length) rotaOk = true; }
      }
    }
    let zer = false;
    for (const D of dias) {
      let falta = false;
      for (let i = 1; i <= 7 && !falta; i++) { const dd = addDias(D, -i); for (const l of rotaLs) if (!coberto(l.IdLoja, dd, D)) { falta = true; break; } }
      if (!falta && rotaLs.length) { zer = true; break; }
    }
    const corr = j.itens.correcao + j.itens.exclusao;
    const fechado = mes < hoje.slice(0, 7);
    j.conq = { madrugador: cedo >= 10, maofirme: best >= 30, rota: rotaOk, zerou: zer, maratona: maxDia >= 50, precisao: fechado && j.lanc.length >= 100 && corr === 0 };
    j.prog = { madrugador: [cedo, 10], maofirme: [best, 30], rota: [Math.round(rotaBest * 100), 100], zerou: [zer ? 1 : 0, 1], maratona: [maxDia, 50], precisao: [corr ? 0 : j.lanc.length, 100] };
    j.itens.conquista = Object.values(j.conq).filter(Boolean).length;
    j.precisao = j.lanc.length ? Math.max(0, Math.round((1 - corr / j.lanc.length) * 1000) / 10) : null;
    j.pontualidade = j.lanc.length ? Math.round(j.itens.prazo / j.lanc.length * 100) : null;
    j.pts = Object.keys(P).reduce((t, k) => t + j.itens[k] * (+cfg(P[k]) || 0), 0);
    j.hoje = (porDia[hoje] || []).length;
  }
  const lista = Object.values(jog).filter(j => j.lanc.length || j.itens.motivo || j.itens.correcao || j.itens.exclusao).sort((a, b) => b.pts - a.pts || b.lanc.length - a.lanc.length);
  // equipe
  const totLanc = lista.reduce((t, j) => t + j.lanc.length, 0);
  const totPrazo = lista.reduce((t, j) => t + j.itens.prazo, 0);
  const ontemD = ontem();
  const ontemOk = rotaLs.filter(l => coberto(l.IdLoja, ontemD, hoje)).length;
  const atrasosAgora = rotaLs.reduce((t, l) => t + diasAtrasados(l.IdLoja, 7).length, 0);
  const val = { lista, totLanc, pctPrazo: totLanc ? Math.round(totPrazo / totLanc * 100) : 0, ontemOk, rotaTotal: rotaLs.length, atrasosAgora, P };
  gameCache = { key, val };
  return val;
}

function painelAbas() {
  const a = S.ui.painelAba || 'vendas';
  return `<div class="seg" role="group">${[['vendas', 'Vendas'], ['equipe', 'Equipe e pontos']].map(([k, l]) => `<button data-paba="${k}" aria-pressed="${a === k}">${l}</button>`).join('')}</div>`;
}

function desafioCard(g, mes) {
  const t = String(cfg('desafio_titulo') || '').trim();
  if (!t) return `<div class="card" style="padding:14px 16px;display:grid;gap:6px"><b>Desafio do mês</b><span class="muted" style="font-size:13.5px">Nenhum desafio definido. Crie um em Regras e pontuação.</span></div>`;
  const tipo = cfg('desafio_tipo'), meta = +cfg('desafio_meta') || 0, ate = cfg('desafio_ate');
  let atual, pct, txt;
  if (tipo === 'atrasos') { atual = g.atrasosAgora; pct = atual === 0 ? 100 : Math.max(0, 100 - atual); txt = atual === 0 ? 'Meta atingida: nenhum atraso na rota.' : `Faltam ${atual} lançamento${atual > 1 ? 's' : ''} em atraso para zerar.`; }
  else if (tipo === 'lancamentos') { atual = g.totLanc; pct = meta ? Math.min(100, atual / meta * 100) : 0; txt = `${int(atual)} de ${int(meta)} lançamentos no mês.`; }
  else { atual = g.pctPrazo; pct = meta ? Math.min(100, atual / meta * 100) : 0; txt = `${atual}% dos lançamentos no prazo (meta: ${meta}%).`; }
  return `<div class="card" style="padding:14px 16px;display:grid;gap:8px">
    <div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline"><b>🏁 ${esc(t)}</b>${ate ? `<span class="muted" style="font-size:12.5px">até ${esc(dBR(ate))}</span>` : ''}</div>
    <div class="bar"><i style="width:${pct.toFixed(0)}%"></i></div><span class="muted" style="font-size:13px">${esc(txt)}</span></div>`;
}

VIEWS.equipe = () => {
  const mesAtual = today().slice(0, 7), mesAnt = addMonth(mesAtual, -1);
  const mes = S.ui.gameMes === mesAnt ? mesAnt : mesAtual;
  const g = gamificacao(mes);
  const medalhas = j => CONQUISTAS.filter(c => j.conq[c.k]).map(c => `<span title="${esc(c.nome)}">${c.ic}</span>`).join('');
  const html = `
  ${topbar({ title: 'Painel', sub: 'Equipe e pontuação' })}
  <main><div class="wrap">
    <div class="gutter" style="padding-top:14px;display:grid;gap:12px">${painelAbas()}
      <div class="alert warn" style="font-size:13px"><div>Só você (master) vê esta tela por enquanto. Os pontos são calculados com os dados da planilha.</div></div>
      <div class="chips" style="padding-block:0">${[[mesAtual, 'Este mês'], [mesAnt, 'Mês passado']].map(([k, l]) => `<button class="chip" data-gmes="${k}" aria-pressed="${mes === k}">${l} · ${MESES[+k.slice(5) - 1]}</button>`).join('')}</div>
      ${desafioCard(g, mes)}
      ${mes === mesAtual ? `<div class="kpis">
        <div class="kpi"><span class="l">Meta do dia</span><span class="v num">${g.ontemOk}/${g.rotaTotal}</span><span class="d muted">lojas da rota com a venda de ontem</span></div>
        <div class="kpi"><span class="l">Atrasos na rota</span><span class="v num">${g.atrasosAgora}</span><span class="d muted">últimos 7 dias</span></div>
      </div>` : ''}
    </div>
    <div class="section">
      <h3 class="h2 gutter">Ranking de ${esc(MESES[+mes.slice(5) - 1])}</h3>
      <div class="list">${g.lista.map((j, i) => `<button class="row" style="grid-template-columns:28px auto 1fr auto;gap:12px" data-jog="${esc(j.nome)}">
        <span class="num" style="font-weight:800;font-size:18px;color:${i === 0 ? 'var(--warn)' : 'var(--muted)'}">${i + 1}º</span>
        ${audAvatar(j.nome, 42)}
        <div><div class="t">${esc(j.nome)} <span style="font-size:15px">${medalhas(j)}</span></div>
        <div class="s">${j.lanc.length} lanç.${j.pontualidade != null ? ` · ${j.pontualidade}% no prazo` : ''}${j.precisao != null ? ` · precisão ${String(j.precisao).replace('.', ',')}%` : ''}${j.seqAtual >= 2 ? ` · 🔥 ${j.seqAtual} dias` : ''}${mes === mesAtual ? ` · hoje ${j.hoje}` : ''}</div></div>
        <div class="v num" style="font-size:20px">${int(j.pts)}<small>pontos</small></div></button>`).join('') || '<div class="empty">Sem lançamentos neste mês.</div>'}</div>
    </div>
    <div class="gutter section"><button class="btn" style="width:100%" data-act="regras">${ICON.chart}Regras e pontuação</button></div>
  </div></main>
  ${navbar('painel')}`;
  return { html };
};

VIEWS.jogador = (p) => {
  const g = gamificacao(p.mes);
  const j = g.lista.find(x => x.nome === p.nome);
  if (!j) return { html: topbar({ title: 'Auditor', backBtn: true }) + '<main><div class="empty">Sem dados neste mês.</div></main>' };
  const pos = g.lista.indexOf(j) + 1;
  const html = `
  ${topbar({ title: j.nome, sub: 'Desempenho de ' + mesNome(p.mes), backBtn: true })}
  <main><div class="wrap">
    <div class="gutter" style="display:flex;gap:16px;align-items:center;padding-block:18px">${audAvatar(j.nome, 72)}
      <div><div class="num" style="font-size:34px;font-weight:800;line-height:1">${int(j.pts)} <span style="font-size:15px;color:var(--muted)">pontos</span></div>
      <div class="muted">${pos}º lugar no ranking${j.seqAtual >= 2 ? ` · 🔥 ${j.seqAtual} dias de sequência` : ''}</div></div></div>
    <div class="gutter"><div class="kpis">
      <div class="kpi"><span class="l">Lançamentos</span><span class="v num">${j.lanc.length}</span></div>
      <div class="kpi"><span class="l">Dias trabalhados</span><span class="v num">${j.dias.size}</span></div>
      <div class="kpi"><span class="l">No prazo</span><span class="v num">${j.pontualidade == null ? '—' : j.pontualidade + '%'}</span></div>
      <div class="kpi"><span class="l">Precisão</span><span class="v num">${j.precisao == null ? '—' : String(j.precisao).replace('.', ',') + '%'}</span></div>
    </div></div>
    <div class="section"><h3 class="h2 gutter">De onde vieram os pontos</h3>
      <div class="list">${REGRAS.map(([k, ck, nome]) => { const q = j.itens[k], v = +cfg(ck) || 0; return `<div class="row" style="grid-template-columns:1fr auto"><div><div class="t" style="white-space:normal;font-weight:600">${esc(nome)}</div><div class="s">${q} × ${v > 0 ? '+' : ''}${v}</div></div><div class="v num ${q * v < 0 ? 'down' : q * v > 0 ? 'up' : ''}">${q * v > 0 ? '+' : ''}${int(q * v)}</div></div>`; }).join('')}
      <div class="row" style="grid-template-columns:1fr auto"><div class="t">Total</div><div class="v num">${int(j.pts)}</div></div></div></div>
    <div class="section"><h3 class="h2 gutter">Conquistas</h3>
      <div class="list">${CONQUISTAS.map(c => { const [a, b] = j.prog[c.k] || [0, 1]; const ok = j.conq[c.k]; return `<div class="row" style="grid-template-columns:auto 1fr auto;gap:12px;${ok ? '' : 'opacity:.75'}"><span style="font-size:26px;${ok ? '' : 'filter:grayscale(1)'}">${c.ic}</span>
        <div><div class="t">${esc(c.nome)}</div><div class="s" style="white-space:normal">${esc(c.desc)}</div>${ok ? '' : `<div class="bar" style="height:5px;margin-top:6px"><i style="width:${Math.min(100, a / b * 100).toFixed(0)}%"></i></div>`}</div>
        <div class="v">${ok ? '<span class="status st-ok">Conquistada</span>' : `<span class="muted num" style="font-size:12.5px">${c.k === 'rota' ? a + '%' : c.k === 'zerou' ? '' : Math.min(a, b) + '/' + b}</span>`}</div></div>`; }).join('')}</div></div>
  </div></main>`;
  return { html };
};

VIEWS.regras = () => {
  const m = isMaster();
  const html = `
  ${topbar({ title: 'Regras e pontuação', backBtn: true })}
  <main class="${m ? 'form-main' : ''}"><div class="wrap">
    <div class="gutter section muted" style="font-size:13.5px">Cada auditor soma pontos no mês pelo que faz no app. O ranking zera no início de cada mês. Os pontos valem também para os lançamentos antigos, então ao mudar um valor tudo é recalculado.</div>
    <div class="section"><h3 class="h2 gutter">O que vale pontos</h3>
      <div class="list">${REGRAS.map(([k, ck, nome, det]) => `<div class="row" style="grid-template-columns:1fr auto;gap:12px"><div><div class="t" style="white-space:normal;font-weight:600">${esc(nome)}</div>${det ? `<div class="s" style="white-space:normal">${esc(det)}</div>` : ''}</div>
        ${m ? `<input class="input num" data-cfg="${ck}" value="${esc(cfg(ck))}" inputmode="numeric" style="width:84px;min-height:44px;text-align:center;font-weight:800;padding:8px">` : `<b class="num ${+cfg(ck) < 0 ? 'down' : 'up'}">${+cfg(ck) > 0 ? '+' : ''}${cfg(ck)}</b>`}</div>`).join('')}</div>
      ${m ? '<div class="gutter hint muted" style="font-size:12.5px;margin-top:6px">Use número negativo para tirar pontos (ex.: -5).</div>' : ''}</div>
    <div class="section"><h3 class="h2 gutter">Conquistas (${cfg('pts_conquista') > 0 ? '+' : ''}${cfg('pts_conquista')} cada)</h3>
      <div class="list">${CONQUISTAS.map(c => `<div class="row" style="grid-template-columns:auto 1fr;gap:12px"><span style="font-size:24px">${c.ic}</span><div><div class="t">${esc(c.nome)}</div><div class="s" style="white-space:normal">${esc(c.desc)}</div></div></div>`).join('')}</div></div>
    ${m ? `<div class="gutter section"><h3 class="h2">Desafio do mês</h3>
      <div class="fields" style="padding-block:4px">
        <div class="field"><label for="dTit">Título</label><input class="input" id="dTit" value="${esc(cfg('desafio_titulo'))}" placeholder="Ex.: Zerar os atrasos do L3"></div>
        <div class="field"><label for="dTipo">Como medir</label><select id="dTipo">${[['prazo', '% dos lançamentos no prazo'], ['lancamentos', 'Número de lançamentos da equipe no mês'], ['atrasos', 'Zerar os atrasos da rota (últimos 7 dias)']].map(([k, l]) => `<option value="${k}" ${cfg('desafio_tipo') === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        <div class="field"><label for="dMeta">Meta</label><input class="input num" id="dMeta" inputmode="numeric" value="${esc(cfg('desafio_meta'))}"><div class="hint">Para "% no prazo", use a porcentagem (ex.: 90). Para "zerar atrasos", a meta é ignorada.</div></div>
        <div class="field"><label for="dAte">Prazo final</label><input class="input" type="date" id="dAte" value="${esc(cfg('desafio_ate'))}"></div>
        <div class="hint">Deixe o título em branco para não ter desafio.</div>
      </div><div id="regErr"></div></div>` : ''}
  </div></main>
  ${m ? `<div class="formbar"><button class="btn" data-act="back">Cancelar</button><button class="btn primary" data-act="saveRegras">${ICON.check}Salvar regras</button></div>` : ''}`;
  return { html, form: m };
};
async function saveRegras() {
  if (!DEMO && !navigator.onLine) { $('#regErr').innerHTML = '<div class="alert bad">Alterar as regras precisa de internet.</div>'; return; }
  const valores = {};
  let erro = '';
  $$('[data-cfg]').forEach(i => { const v = i.value.trim().replace(',', '.'); if (!/^-?\d+(\.\d+)?$/.test(v)) erro = 'Use apenas números nos pontos.'; valores[i.dataset.cfg] = +v; });
  if (erro) { $('#regErr').innerHTML = `<div class="alert bad">${erro}</div>`; return; }
  Object.assign(valores, { desafio_titulo: $('#dTit').value.trim(), desafio_tipo: $('#dTipo').value, desafio_meta: +($('#dMeta').value || 0), desafio_ate: $('#dAte').value });
  const btn = $('[data-act="saveRegras"]'); btn.disabled = true;
  try {
    const r = await api('salvarConfig', { valores });
    if (S.data) S.data.config = r.config;
    S.ver++; await persist();
    toast('Regras salvas. Pontos recalculados.');
    back();
  } catch (e) { $('#regErr').innerHTML = `<div class="alert bad">${esc(e.message)}</div>`; btn.disabled = false; }
}

/* ---------- Detalhe da loja ---------- */
VIEWS.loja = (p) => {
  const l = lojaById(p.id) || lojasAll().find(x => x.IdLoja === p.id);
  if (!l) return { html: topbar({ title: 'Loja', backBtn: true }) + '<div class="empty">Loja não encontrada.</div>' };
  ensureLoja(l.IdLoja);
  const mes = p.mes || today().slice(0, 7);
  const M = merged();
  const todas = M.list.filter(v => v.loja === l.IdLoja).sort((a, b) => b.data.localeCompare(a.data));
  const doMes = todas.filter(v => v.data.startsWith(mes));
  const tot = doMes.reduce((s, v) => s + (+v.vendas || 0), 0);
  const tk = doMes.reduce((s, v) => s + (+v.ticket || 0), 0);
  const abl = parseFloat(String(l.ABL).replace(',', '.')) || 0;
  const mots = motivosAll().filter(m => m.loja === l.IdLoja).sort((a, b) => b.data.localeCompare(a.data));
  const st = (S.data && S.data.stats[l.IdLoja]) || { total: 0 };
  const totalReg = Math.max(st.total, todas.length);
  const fetched = S.lojaFetched.has(l.IdLoja);

  // calendário
  const first = new Date(+mes.slice(0, 4), +mes.slice(5, 7) - 1, 1).getDay();
  const nd = daysIn(mes);
  const hoje = today();
  const motDias = new Set(mots.map(m => m.data.slice(0, 10)));
  let cells = '';
  for (let i = 0; i < first; i++) cells += '<span class="day blank"></span>';
  for (let d = 1; d <= nd; d++) {
    const ds = mes + '-' + pad(d);
    const v = M.byLojaData.get(l.IdLoja + '|' + ds);
    let cls = 'day', inner = `${d}`, act = '';
    if (v) { cls += v._pending ? ' mot' : ' ok'; inner += `<small>${esc(kShort(v.vendas))}</small>`; act = `data-venda="${esc(v.id)}"`; }
    else if (ds > hoje) { cls += ' fut'; act = 'disabled'; }
    else if (motDias.has(ds)) { cls += ' mot'; inner += '<small>motivo</small>'; act = `data-registrar="${esc(l.IdLoja)}" data-data="${ds}"`; }
    else { cls += ' miss'; act = `data-registrar="${esc(l.IdLoja)}" data-data="${ds}"`; }
    if (ds === hoje) cls += ' sel';
    cells += `<button class="${cls}" ${act} aria-label="${d} de ${MESES[+mes.slice(5, 7) - 1]}">${inner}</button>`;
  }

  const lim = p.lim || 15;
  const html = `
  ${topbar({ title: 'Detalhes da loja', backBtn: true })}
  <main><div class="wrap">
    <div class="hero gutter">
      ${avatar(l)}
      <div style="min-width:0">
        <h2>${esc(l.NomeFantasia)}</h2>
        <div class="tags"><span class="tag">LUC ${esc(l.Luc)}</span><span class="tag">${esc(l.Piso)}</span><span class="tag">${esc(l.Tipo)}</span>${l['Situação'] === 'Inativo' ? '<span class="tag">Inativa</span>' : ''}</div>
      </div>
    </div>
    <div class="gutter">
      <div class="actions" style="${isMaster() ? '' : 'grid-template-columns:1.4fr 1fr'}">
        <button class="btn primary" data-registrar="${esc(l.IdLoja)}" data-data="">${ICON.dollar}Registrar venda</button>
        <button class="btn" data-act="motivo" data-id="${esc(l.IdLoja)}">${ICON.note}Motivo</button>
        ${isMaster() ? `<button class="btn" data-act="editLoja" data-id="${esc(l.IdLoja)}">${ICON.edit}Editar</button>` : ''}
      </div>
    </div>
    <div class="gutter section">
      <div class="month-nav" style="margin-bottom:10px">
        <button class="cal-nav" data-act="lojaMes" data-mes="${addMonth(mes, -1)}" aria-label="Mês anterior">${ICON.left}</button>
        <strong>${esc(mesNome(mes))}</strong>
        <button class="cal-nav" data-act="lojaMes" data-mes="${addMonth(mes, 1)}" aria-label="Próximo mês" ${mes >= hoje.slice(0, 7) ? 'disabled' : ''}>${ICON.right}</button>
      </div>
      <div class="kpis">
        <div class="kpi wide"><span class="l">Vendas no mês</span><span class="v num">${money(tot)}</span></div>
        <div class="kpi"><span class="l">Tickets</span><span class="v num">${int(tk)}</span></div>
        <div class="kpi"><span class="l">Ticket médio</span><span class="v num">${tk ? money(tot / tk) : '—'}</span></div>
        <div class="kpi"><span class="l">Dias lançados</span><span class="v num">${new Set(doMes.map(v => v.data)).size}/${nd}</span></div>
        <div class="kpi"><span class="l">Venda por m²</span><span class="v num">${abl ? money(tot / abl) : '—'}</span></div>
      </div>
    </div>
    <div class="gutter section">
      <div class="card cal">
        <div class="cal-grid">${['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(x => `<span class="cal-dow">${x}</span>`).join('')}${cells}</div>
        <div class="legend"><span><i style="background:var(--ok-soft);border:1px solid var(--ok)"></i>Lançado</span><span><i style="border:1px dashed var(--bad)"></i>Pendente (toque para lançar)</span><span><i style="background:var(--warn-soft);border:1px solid var(--warn)"></i>Motivo / na fila</span></div>
      </div>
    </div>
    <div class="section">
      <h3 class="h2 gutter">Lançamentos <span class="num">${int(totalReg)} no total${fetched ? '' : ''}</span></h3>
      <div class="list">
        ${todas.slice(0, lim).map(v => vendaRow(v, { semLoja: true })).join('') || '<div class="empty">Nenhum lançamento.</div>'}
        ${todas.length > lim ? `<button class="more" data-act="lojaMais">Ver mais ${Math.min(30, todas.length - lim)}</button>` : ''}
        ${!fetched && totalReg > todas.length ? '<div class="loading">Carregando histórico completo…</div>' : ''}
      </div>
    </div>
    ${mots.length ? `<div class="section"><h3 class="h2 gutter">Motivos registrados <span>${mots.length}</span></h3><div class="list">${mots.slice(0, 10).map(motivoRow).join('')}</div></div>` : ''}
    <div class="section">
      <h3 class="h2 gutter">Cadastro</h3>
      <dl class="dl">
        ${[['Nome fantasia', l.NomeFantasia], ['LUC', l.Luc], ['Tipo', l.Tipo], ['Categoria', l.Categoria], ['Segmento', l.Segmento], ['Piso', l.Piso], ['Contrato', l.Contrato], ['ABL (m²)', l.ABL === '' ? '' : String(l.ABL).replace('.', ',')], ['Situação', l['Situação']]].map(([k, v]) => `<dt>${k}</dt><dd>${esc(v) || '—'}</dd>`).join('')}
      </dl>
    </div>
  </div></main>`;
  return { html };
};

function vendaRow(v, o = {}) {
  const loja = lojaById(v.loja);
  const nome = (loja && loja.NomeFantasia) || v.nome || v.loja;
  const t = o.semLoja ? dBR(v.data) : nome;
  const s = o.semLoja ? `${audNome(v.auditor)}${v.resp ? ' · resp. ' + v.resp : ''}` : `${audNome(v.auditor)}${v.resp ? ' · ' + v.resp : ''}`;
  return `<button class="row" data-venda="${esc(v.id)}">
    <div><div class="t">${esc(t)}${v._pending ? (v._error ? '<span class="badge err">erro</span>' : '<span class="badge">na fila</span>') : solicPendente(v.id) ? '<span class="badge">alteração pedida</span>' : ''}</div><div class="s">${esc(s)}</div></div>
    <div class="v num">${money(v.vendas)}<small>${int(v.ticket)} ticket${+v.ticket === 1 ? '' : 's'}</small></div>
  </button>`;
}
function motivoRow(m) {
  const loja = lojaById(m.loja);
  return `<div class="row" style="grid-template-columns:1fr">
    <div><div class="t" style="white-space:normal">${esc(m.motivo)}${m._pending ? '<span class="badge">na fila</span>' : ''}</div>
    <div class="s">${esc(dtBR(m.data))} · ${esc(audNome(m.auditor))}${loja ? ' · ' + esc(loja.NomeFantasia) : ''}</div></div></div>`;
}

/* ---------- Detalhe do lançamento ---------- */
VIEWS.venda = (p) => {
  const v = merged().byId.get(p.id) || S.vmap.get(p.id);
  if (!v) return { html: topbar({ title: 'Lançamento', backBtn: true }) + '<main><div class="empty">Este lançamento foi excluído.</div></main>' };
  const loja = lojaById(v.loja) || {};
  const q = S.queue.find(x => x.type === 'venda' && x.venda.VendaId === v.id);
  // auditor pode editar o próprio lançamento enquanto ainda não foi enviado
  const naoEnviado = q && !S.vmap.has(v.id);
  const podeEditar = isMaster() || naoEnviado;
  const sp = solicPendente(v.id);
  const html = `
  ${topbar({ title: 'Lançamento', backBtn: true })}
  <main><div class="wrap">
    <div class="gutter big-value">
      <span class="muted">${esc(loja.NomeFantasia || v.nome)} · ${esc(diaLongo(v.data))}</span>
      <span class="v num">${money(v.vendas)}</span>
      <span class="muted num">${int(v.ticket)} tickets${+v.ticket ? ' · ticket médio ' + money(v.vendas / v.ticket) : ''}</span>
    </div>
    ${q && q.error ? `<div class="gutter" style="margin-bottom:12px"><div class="alert bad"><div><b>Não foi enviado:</b> ${esc(q.error)}</div><button data-act="descartar" data-qid="${q.qid}">Descartar este lançamento</button></div></div>` : ''}
    ${v._pending && !(q && q.error) ? '<div class="gutter" style="margin-bottom:12px"><div class="alert warn">Salvo no aparelho. Será enviado para a planilha assim que houver internet.</div></div>' : ''}
    <dl class="dl">
      ${[['Data', dBR(v.data)], ['Loja', loja.NomeFantasia || v.nome], ['LUC', loja.Luc], ['Auditor', audNome(v.auditor)], ['Responsável', v.resp], ['Vendas', money(v.vendas)], ['Ticket', int(v.ticket)],
    ['Contrato', v.contrato], ['ABL', v.abl], ['Piso', v.piso], ['Tipo', v.tipo], ['Categoria', v.categoria], ['Segmento', v.segmento], ['Registrado em', dtBR(v.hora)], ['E-mail', v.email], ['Código', v.id]]
      .map(([k, x]) => `<dt>${k}</dt><dd>${esc(x) || '—'}</dd>`).join('')}
    </dl>
    <div class="gutter section">
      <h3 class="h2">Assinatura</h3>
      <div class="sig-img" id="sigBox">${v._sig ? `<img src="${v._sig}" alt="Assinatura">` : v.assin ? '<span class="muted">Carregando assinatura…</span>' : '<span class="muted">Sem assinatura</span>'}</div>
    </div>
    ${sp ? `<div class="gutter section"><button class="alert warn" data-solic="${esc(sp.id_solicitacao)}" style="border:0;text-align:left;width:100%"><div><b>${sp.Tipo === 'Exclusão' ? 'Exclusão' : 'Alteração'} solicitada</b> por ${esc(sp.Solicitante)}${sp.Tipo === 'Exclusão' ? '' : ': ' + esc(resumoSolic(sp))}. ${isMaster() ? 'Toque para aprovar ou recusar.' : 'Aguardando o master.'}</div></button></div>` : ''}
    ${podeEditar ? `<div class="gutter section" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <button class="btn" data-act="editVenda" data-id="${esc(v.id)}">${ICON.edit}Editar</button>
      <button class="btn danger" data-act="askDel" data-id="${esc(v.id)}">${ICON.trash}Excluir</button>
    </div>` : sp ? '' : `<div class="gutter section"><button class="btn" style="width:100%" data-act="pedirAlteracao" data-id="${esc(v.id)}">${ICON.edit}Solicitar alteração</button>
      <div class="hint muted" style="font-size:12.5px;margin-top:8px">Encontrou um erro no valor, na data ou no responsável? Peça a correção; o master aprova e a planilha é ajustada.</div></div>`}
    <div class="gutter" id="delBox" hidden>
      <div class="alert bad"><div>Excluir o lançamento de ${esc(loja.NomeFantasia || '')} em ${esc(dBR(v.data))}? A linha será apagada da planilha.</div>
      <div style="display:flex;gap:10px"><button class="btn danger solid" data-act="delVenda" data-id="${esc(v.id)}">Excluir</button><button class="btn" data-act="cancelDel">Cancelar</button></div></div>
    </div>
  </div></main>`;
  return {
    html,
    mount() {
      if (!v._sig && v.assin) {
        api('arquivo', { path: v.assin }).then(r => {
          const b = $('#sigBox'); if (!b) return;
          b.innerHTML = r.data ? `<img src="${r.data}" alt="Assinatura">` : '<span class="muted">Arquivo da assinatura não encontrado no Drive</span>';
        }).catch(() => { const b = $('#sigBox'); if (b) b.innerHTML = '<span class="muted">Assinatura disponível quando houver internet</span>'; });
      }
    }
  };
};

/* ---------- Formulário de venda ---------- */
VIEWS.registrar = (p) => {
  const editing = p.edit ? (merged().byId.get(p.edit) || null) : null;
  const lojaId = editing ? editing.loja : (p.loja || '');
  const data = editing ? editing.data : (p.data || ontem());
  const lojasAtivas = lojasAll().filter(l => l['Situação'] !== 'Inativo' || l.IdLoja === lojaId).sort((a, b) => a.NomeFantasia.localeCompare(b.NomeFantasia, 'pt-BR'));
  const html = `
  ${topbar({ title: editing ? 'Editar lançamento' : 'Registro de venda', backBtn: true })}
  <main class="form-main"><div class="wrap gutter">
    <form id="fVenda" class="fields" novalidate>
      <div class="field" id="fdData">
        <label for="vData">Data<span class="req">*</span></label>
        <input class="input" type="date" id="vData" value="${data}" max="${today()}" required>
        <div class="hint" id="vDataHint">${esc(diaLongo(data))}</div>
      </div>
      <div class="field">
        <label for="vAud">Auditor</label>
        <input class="input" id="vAud" value="${esc(editing ? audNome(editing.auditor) : S.user.nome)}" readonly>
      </div>
      <div class="field" id="fdLoja">
        <label for="vLoja">Loja<span class="req">*</span></label>
        <select id="vLoja" required><option value="">Selecione a loja</option>${lojasAtivas.map(l => `<option value="${esc(l.IdLoja)}" ${l.IdLoja === lojaId ? 'selected' : ''}>${esc(l.NomeFantasia)} — LUC ${esc(l.Luc)}</option>`).join('')}</select>
      </div>
      <div id="dupBox"></div>
      <div class="field" id="fdVendas">
        <label for="vVendas">Vendas<span class="req">*</span></label>
        <input class="input money num" id="vVendas" inputmode="numeric" autocomplete="off" value="${editing ? money(editing.vendas) : ''}" placeholder="R$ 0,00">
        <div class="hint">Digite só os números; os centavos entram automaticamente.</div>
      </div>
      <div class="field" id="fdTicket">
        <label for="vTicket">Ticket<span class="req">*</span></label>
        <div class="stepper">
          <input class="input num" id="vTicket" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="off" value="${editing ? esc(Math.round(+editing.ticket)) : ''}" placeholder="0">
          <button type="button" data-step="-1" aria-label="Diminuir">−</button>
          <button type="button" data-step="1" aria-label="Aumentar">+</button>
        </div>
        <div class="hint" id="tmHint"></div>
      </div>
      <div class="field" id="fdResp">
        <label for="vResp">Responsável<span class="req">*</span></label>
        <input class="input" id="vResp" autocomplete="off" autocapitalize="words" value="${esc(editing ? editing.resp : '')}" placeholder="Nome de quem informou">
        <div class="hint" id="respHint"></div>
        <div class="sugs" id="respSugs"></div>
      </div>
      <div class="field" id="fdSig">
        <span class="label">Assinatura${editing ? '' : '<span class="req" style="color:var(--brand)"> *</span>'}</span>
        ${editing ? '<div class="hint">Deixe em branco para manter a assinatura já registrada.</div>' : ''}
        <div class="sig-wrap"><canvas id="sig"></canvas><div class="sig-ph">Assine aqui</div><button type="button" class="clear" data-act="sigClear">Limpar</button></div>
      </div>
      <div id="outBox"></div>
      <div id="formErr"></div>
    </form>
  </div></main>
  <div class="formbar"><button class="btn" data-act="back">Cancelar</button><button class="btn primary" data-act="saveVenda">${ICON.check}Salvar</button></div>`;
  return {
    html, form: true,
    mount() {
      const pad = SigPad($('#sig'));
      S.sigPad = pad;
      const fV = $('#vVendas');
      let cents = editing ? Math.round(+editing.vendas * 100) : null;
      S.outlierOk = false;
      fV.addEventListener('input', () => {
        S.outlierOk = false; $('#outBox').innerHTML = '';
        const d = fV.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
        cents = d ? parseInt(d.slice(0, 13), 10) : null;
        fV.value = cents == null ? '' : money(cents / 100);
        updTM();
      });
      fV.addEventListener('focus', () => setTimeout(() => fV.setSelectionRange(fV.value.length, fV.value.length), 0));
      S.getCents = () => cents;
      const updTM = () => {
        const t = +$('#vTicket').value;
        $('#tmHint').textContent = cents != null && t > 0 ? 'Ticket médio: ' + money(cents / 100 / t) : '';
      };
      $('#vTicket').addEventListener('input', updTM);
      updTM();
      const upd = () => {
        const lj = $('#vLoja').value, dt = $('#vData').value;
        $('#vDataHint').textContent = dt ? diaLongo(dt) : '';
        const ex = lj && dt ? merged().byLojaData.get(lj + '|' + dt) : null;
        $('#dupBox').innerHTML = ex && (!editing || ex.id !== editing.id)
          ? `<div class="alert warn"><div>Já existe lançamento desta loja em ${esc(dBR(dt))}: <b>${money(ex.vendas)}</b>.</div><button type="button" data-venda="${esc(ex.id)}">Abrir lançamento existente</button></div>` : '';
        // responsáveis usados recentemente nesta loja (mais recente primeiro)
        const locais = merged().list.filter(v => v.loja === lj && v.resp).sort((a, b) => String(b.hora).localeCompare(String(a.hora))).map(v => String(v.resp).trim());
        const resps = (S.data && S.data.responsaveis[lj]) || [];
        const sug = Array.from(new Set(locais.concat(resps).filter(Boolean))).slice(0, 6);
        if (!sug.includes(S.user.nome)) sug.push(S.user.nome);
        $('#respSugs').innerHTML = sug.map(n => `<button type="button" data-resp="${esc(n)}">${esc(n)}</button>`).join('');
        const fr = $('#vResp');
        if (!editing && (fr.value === '' || fr.dataset.auto === '1')) {
          fr.value = lj && sug.length > 1 ? sug[0] : '';
          fr.dataset.auto = fr.value ? '1' : '';
        }
        $('#respHint').textContent = fr.dataset.auto === '1' ? 'Último responsável desta loja. Se foi outra pessoa, toque em outro nome ou digite.' : '';
      };
      $('#vLoja').addEventListener('change', upd);
      $('#vData').addEventListener('change', upd);
      upd();
      if (!lojaId) $('#vLoja').focus();
    }
  };
};

function SigPad(canvas) {
  const ctx = canvas.getContext('2d');
  let ink = false, drawing = false, last = null;
  function size() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#111';
    ink = false;
  }
  size();
  const pos = e => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  canvas.addEventListener('pointerdown', e => { e.preventDefault(); fieldErr('fdSig', ''); drawing = true; last = pos(e); canvas.setPointerCapture(e.pointerId); ctx.beginPath(); ctx.arc(last.x, last.y, 1.1, 0, Math.PI * 2); ctx.fillStyle = '#111'; ctx.fill(); ink = true; canvas.parentNode.querySelector('.sig-ph').hidden = true; });
  canvas.addEventListener('pointermove', e => {
    if (!drawing) return;
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of evs) { const p = pos(ev); ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke(); last = p; }
  });
  const end = () => { drawing = false; };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
  return {
    hasInk: () => ink,
    clear() { ctx.clearRect(0, 0, canvas.width, canvas.height); ink = false; canvas.parentNode.querySelector('.sig-ph').hidden = false; },
    toDataURL() {
      const w = Math.min(600, canvas.width), h = Math.round(canvas.height * w / canvas.width);
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.drawImage(canvas, 0, 0, w, h);
      return c.toDataURL('image/png');
    }
  };
}

function fieldErr(id, msg) {
  const f = $('#' + id); if (!f) return;
  f.classList.toggle('invalid', !!msg);
  let e = f.querySelector('.err');
  if (msg) { if (!e) { e = document.createElement('div'); e.className = 'err'; f.appendChild(e); } e.textContent = msg; }
  else if (e) e.remove();
}

function saveVenda() {
  if (S.salvando) return;
  const c = cur().p;
  const editing = c.edit ? merged().byId.get(c.edit) : null;
  const data = $('#vData').value, loja = $('#vLoja').value, cents = S.getCents(), ticket = $('#vTicket').value, resp = $('#vResp').value.trim();
  let ok = true;
  const chk = (id, cond, msg) => { fieldErr(id, cond ? '' : msg); if (!cond) ok = false; };
  chk('fdData', data && data <= today(), 'Informe uma data até hoje.');
  chk('fdLoja', !!loja, 'Selecione a loja.');
  chk('fdVendas', cents != null, 'Informe o valor das vendas.');
  chk('fdTicket', /^\d+$/.test(ticket), 'Informe a quantidade de tickets (número inteiro, sem vírgula).');
  chk('fdResp', !!resp, 'Informe o responsável.');
  chk('fdSig', editing || S.sigPad.hasInk(), 'Peça a assinatura do responsável.');
  const ex = loja && data ? merged().byLojaData.get(loja + '|' + data) : null;
  if (ex && (!editing || ex.id !== editing.id)) { ok = false; toast('Já existe lançamento desta loja nesta data.'); }
  if (!ok) { const f = $('.field.invalid'); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
  const fora = S.outlierOk ? null : foraDoPadrao(loja, data, cents / 100, editing && editing.id);
  if (fora) {
    $('#outBox').innerHTML = `<div class="alert warn"><div><b>Confira o valor.</b> ${fora.msg}</div><div style="display:flex;gap:14px;flex-wrap:wrap"><button type="button" data-act="outlierOk">Está correto, salvar</button><button type="button" data-act="outlierFix">Corrigir o valor</button></div></div>`;
    $('#outBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  S.salvando = true; setTimeout(() => { S.salvando = false; }, 1200);
  const venda = { VendaId: editing ? editing.id : uid(), Data: data, Loja: loja, Vendas: cents / 100, Ticket: +ticket, Responsavel: resp, HoraRegistro: new Date().toISOString() };
  const assinatura = S.sigPad.hasInk() ? S.sigPad.toDataURL() : '';
  // se já havia na fila uma versão não enviada, substitui
  const prev = S.queue.find(q => q.type === 'venda' && q.venda.VendaId === venda.VendaId);
  if (prev) S.queue = S.queue.filter(q => q !== prev);
  enqueue({ type: 'venda', venda, assinatura: assinatura || (prev && prev.assinatura) || '', hora: prev ? prev.hora : nowStr() });
  if (editing) {
    toast(navigator.onLine || DEMO ? 'Lançamento atualizado.' : 'Alteração salva no aparelho. Será enviada quando houver internet.');
    return back();
  }
  const lj = lojaById(loja) || {};
  replace('proxima', { salva: { loja: lj.NomeFantasia, data, vendas: cents / 100 }, prox: proximaPendente(loja, data, c.modo || 'dia') });
}

/* ---------- Depois de salvar: próxima loja da rota ---------- */
VIEWS.proxima = (p) => {
  const sv = p.salva, nx = p.prox || {};
  const off = !navigator.onLine && !DEMO;
  const html = `
  ${topbar({ title: 'Venda salva', backBtn: true })}
  <main><div class="wrap gutter" style="display:grid;gap:16px;padding-block:20px">
    <div class="alert ok"><div><b>${esc(sv.loja)}</b> · ${esc(dBR(sv.data))} · <b class="num">${money(sv.vendas)}</b><br>${off ? 'Salvo no aparelho. Será enviado quando houver internet.' : 'Salvo e enviado para a planilha.'}</div></div>
    ${nx.loja ? `
    <h3 class="h2" style="margin:0">${nx.modo === 'dia' ? 'Próxima loja pendente' : nx.loja && sv.loja === nx.loja.NomeFantasia ? 'Próximo dia em atraso desta loja' : 'Próxima loja da rota'}</h3>
    <div class="card" style="padding:16px;display:grid;grid-template-columns:52px 1fr;gap:14px;align-items:center">
      ${avatar(nx.loja, 52)}
      <div style="min-width:0"><div style="font-weight:800;font-size:18px">${esc(nx.loja.NomeFantasia)}</div>
      <div class="muted" style="font-size:13.5px">LUC ${esc(nx.loja.Luc)} · ${esc(nx.loja.Piso || '—')} · venda de ${esc(dBR(nx.data))}</div></div>
    </div>
    <button class="btn primary" style="min-height:56px;font-size:16px" data-registrar="${esc(nx.loja.IdLoja)}" data-data="${nx.data}" data-modo="${nx.modo}">${ICON.dollar}Lançar ${esc(nx.loja.NomeFantasia)}</button>
    <div class="muted" style="font-size:13px;text-align:center">${nx.modo !== 'dia' ? `Faltam ${nx.resta} lançamento${nx.resta > 1 ? 's' : ''} na rota (ontem e atrasados).` : `Faltam ${nx.resta} loja${nx.resta > 1 ? 's' : ''} para ${esc(dBR(nx.data))}, na ordem de piso e LUC.`}</div>`
    : `<div class="empty" style="padding:24px">${ICON.check}<div style="font-weight:700;color:var(--fg)">${nx.modo !== 'dia' ? 'Rota concluída. Nenhuma loja pendente.' : 'Todas as lojas lançadas para ' + esc(dBR(nx.data || sv.data)) + '.'}</div></div>`}
    <button class="btn" data-act="back">Voltar para a lista</button>
  </div></main>`;
  return { html };
};

/* ---------- Motivo ---------- */
VIEWS.motivo = (p) => {
  const l = lojaById(p.loja);
  const rapidos = ['Gerente ausente', 'Sistema indisponível', 'Loja fechada', 'Responsável em atendimento', 'Totais ainda não fechados', 'Funcionários sem acesso ao sistema'];
  const html = `
  ${topbar({ title: 'Informar motivo', backBtn: true })}
  <main class="form-main"><div class="wrap gutter">
    <div class="fields">
      <div class="alert warn">Use quando não foi possível coletar a venda da loja. Fica registrado com data, hora e auditor.</div>
      <div class="field"><label for="mLoja">Loja<span class="req">*</span></label>
        <select id="mLoja">${lojasAll().filter(x => x['Situação'] !== 'Inativo' || x.IdLoja === p.loja).sort((a, b) => a.NomeFantasia.localeCompare(b.NomeFantasia, 'pt-BR')).map(x => `<option value="${esc(x.IdLoja)}" ${l && x.IdLoja === l.IdLoja ? 'selected' : ''}>${esc(x.NomeFantasia)} — LUC ${esc(x.Luc)}</option>`).join('')}</select></div>
      <div class="field" id="fdMot"><label for="mTxt">Motivo<span class="req">*</span></label>
        <textarea id="mTxt" placeholder="Descreva o que aconteceu"></textarea>
        <div class="sugs">${rapidos.map(r => `<button type="button" data-mot="${esc(r)}">${esc(r)}</button>`).join('')}</div></div>
    </div>
  </div></main>
  <div class="formbar"><button class="btn" data-act="back">Cancelar</button><button class="btn primary" data-act="saveMotivo">${ICON.check}Salvar motivo</button></div>`;
  return { html, form: true };
};

/* ---------- Cadastro de loja ---------- */
VIEWS.lojaForm = (p) => {
  const l = p.id ? lojaById(p.id) : { Situação: 'Ativo' };
  const uniq = k => Array.from(new Set(lojasAll().map(x => x[k]).filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b), 'pt-BR'));
  const dl = k => `<datalist id="dl${k}">${uniq(k).map(v => `<option value="${esc(v)}">`).join('')}</datalist>`;
  const f = (k, label, extra = '') => `<div class="field" id="fd${k}"><label for="l${k}">${label}</label><input class="input" id="l${k}" value="${esc(l[k] == null ? '' : l[k])}" ${extra}></div>`;
  const html = `
  ${topbar({ title: p.id ? 'Editar loja' : 'Nova loja', backBtn: true })}
  <main class="form-main"><div class="wrap gutter">
    <div class="fields">
      <div class="field"><span class="label">Logo</span>
        <div style="display:flex;gap:14px;align-items:center">${avatar(l, 64).replace('class="avatar"', 'class="avatar" id="logoPrev"')}
        <label class="btn" style="position:relative">Escolher imagem<input type="file" id="lLogo" accept="image/*" style="position:absolute;inset:0;opacity:0"></label></div></div>
      ${f('NomeFantasia', 'Nome fantasia<span class="req">*</span>')}
      ${f('Luc', 'LUC')}
      ${f('Tipo', 'Tipo', 'list="dlTipo"')}${dl('Tipo')}
      ${f('Categoria', 'Categoria', 'list="dlCategoria"')}${dl('Categoria')}
      ${f('Segmento', 'Segmento', 'list="dlSegmento"')}${dl('Segmento')}
      ${f('Piso', 'Piso', 'list="dlPiso"')}${dl('Piso')}
      ${f('Contrato', 'Contrato', 'inputmode="numeric"')}
      ${f('ABL', 'ABL (m²)', 'inputmode="decimal"')}
      <div class="field"><span class="label">Aparece na rota diária?</span>
        <div class="seg">${['Sim', 'Não'].map(x => `<button type="button" data-segval="${x}" data-rotaval="1" aria-pressed="${(l.Rota || 'Sim') === x}">${x}</button>`).join('')}</div>
        <div class="hint">Use "Não" para lojas que o auditor não visita todos os dias. Elas continuam na lista de Lojas.</div></div>
      <div class="field"><span class="label">Situação</span>
        <div class="seg" id="lSit">${['Ativo', 'Inativo'].map(s => `<button type="button" data-sit="${s}" aria-pressed="${(l['Situação'] || 'Ativo') === s}">${s}</button>`).join('')}</div></div>
    </div>
  </div></main>
  <div class="formbar"><button class="btn" data-act="back">Cancelar</button><button class="btn primary" data-act="saveLoja">${ICON.check}Salvar loja</button></div>`;
  return {
    html, form: true,
    mount() {
      S.newLogo = '';
      $('#lLogo').addEventListener('change', async e => {
        const file = e.target.files[0]; if (!file) return;
        try {
          S.newLogo = await resizeImage(file, 400);
          $('#logoPrev').outerHTML = `<span class="avatar" id="logoPrev" style="width:64px;height:64px"><img src="${S.newLogo}" alt=""></span>`;
        } catch (err) { toast('Não foi possível ler a imagem.'); }
      });
    }
  };
};
function resizeImage(file, max) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src); res(c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

/* ---------- Histórico ---------- */
VIEWS.historico = () => {
  const abas = [['vendas', 'Vendas'], ['solic', 'Solicitações'], ['motivos', 'Motivos']].concat(isMaster() ? [['alteracoes', 'Alterações'], ['acessos', 'Acessos']] : []);
  const t = abas.some(a => a[0] === S.ui.histTab) ? S.ui.histTab : 'vendas';
  const segs = `<div class="chips" role="group" style="padding-top:0">${abas.map(([k, l]) => `<button class="chip" data-htab="${k}" aria-pressed="${t === k}">${l}</button>`).join('')}</div>`;
  let body = '';
  if (t === 'vendas') {
    const mes = S.ui.histMes || today().slice(0, 7);
    ensureMes(mes);
    const busca = norm(S.ui.histBusca);
    let list = merged().list.filter(v => v.data.startsWith(mes));
    if (S.ui.histAud) list = list.filter(v => audNome(v.auditor) === S.ui.histAud);
    if (busca) list = list.filter(v => { const l = lojaById(v.loja); return norm((l ? l.NomeFantasia + ' ' + l.Luc : v.nome) + ' ' + v.resp).includes(busca); });
    list.sort((a, b) => b.data.localeCompare(a.data) || String(b.hora).localeCompare(String(a.hora)));
    const tot = list.reduce((s, v) => s + (+v.vendas || 0), 0);
    const auds = Array.from(new Set(merged().list.filter(v => v.data.startsWith(mes)).map(v => audNome(v.auditor)).filter(Boolean))).sort();
    const groups = {};
    list.forEach(v => { (groups[v.data] = groups[v.data] || []).push(v); });
    const lim = S.ui.histLim || 12;
    const keys = Object.keys(groups).sort().reverse();
    body = `
      <div class="gutter section" style="display:grid;gap:12px">
        <div class="month-nav">
          <button class="cal-nav" data-act="histMes" data-mes="${addMonth(mes, -1)}" aria-label="Mês anterior">${ICON.left}</button>
          <strong>${esc(mesNome(mes))}</strong>
          <button class="cal-nav" data-act="histMes" data-mes="${addMonth(mes, 1)}" aria-label="Próximo mês" ${mes >= today().slice(0, 7) ? 'disabled' : ''}>${ICON.right}</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr auto;gap:8px">
          <input class="input" id="hBusca" type="search" placeholder="Buscar loja ou responsável" value="${esc(S.ui.histBusca)}" style="min-height:44px;font-size:15px;padding:9px 12px">
          <select class="chip" id="hAud" aria-label="Auditor" style="min-height:44px"><option value="">Todos</option>${auds.map(a => `<option ${S.ui.histAud === a ? 'selected' : ''}>${esc(a)}</option>`).join('')}</select>
        </div>
        <div class="kpis">
          <div class="kpi"><span class="l">Lançamentos</span><span class="v num">${int(list.length)}</span></div>
          <div class="kpi"><span class="l">Total</span><span class="v num">${moneyShort(tot)}</span></div>
        </div>
      </div>
      ${S.loadingMes === mes ? '<div class="loading">Carregando ' + esc(mesNome(mes)) + '…</div>' : ''}
      ${keys.slice(0, lim).map(k => `<div class="group-h"><span>${esc(diaLongo(k))}</span><span class="num">${money(groups[k].reduce((s, v) => s + (+v.vendas || 0), 0))}</span></div>
        <div class="list">${groups[k].map(v => vendaRow(v)).join('')}</div>`).join('') || (S.loadingMes === mes ? '' : '<div class="empty">' + ICON.hist + '<div>Nenhum lançamento neste mês.</div></div>')}
      ${keys.length > lim ? '<button class="more" data-act="histMais">Ver dias anteriores</button>' : ''}`;
  } else if (t === 'solic') {
    const all = solicAll().slice().sort((a, b) => (a.Status === 'Pendente' ? 0 : 1) - (b.Status === 'Pendente' ? 0 : 1) || String(b.DataPedido).localeCompare(String(a.DataPedido)));
    body = `<div class="section">
      ${isMaster() ? '' : '<div class="gutter muted" style="font-size:13px;margin-bottom:10px">Suas solicitações. Para pedir uma correção, abra o lançamento e toque em "Solicitar alteração".</div>'}
      <div class="list">${all.map(solicRowHtml).join('') || '<div class="empty">' + ICON.edit + '<div>Nenhuma solicitação.</div></div>'}</div></div>`;
  } else if (t === 'motivos') {
    const ms = motivosAll().slice().sort((a, b) => b.data.localeCompare(a.data));
    body = `<div class="section"><div class="list">${ms.slice(0, 200).map(motivoRow).join('') || '<div class="empty">Nenhum motivo registrado.</div>'}</div></div>`;
  } else if (t === 'alteracoes') {
    const al = (S.data && S.data.alteracoes) || [];
    body = `<div class="section"><div class="gutter muted" style="font-size:13px;margin-bottom:10px">Tudo o que foi editado ou excluído, com o valor anterior. Fica também na aba "Alteracoes" da planilha.</div>
      <div class="list">${al.map(a => `<div class="row" style="grid-template-columns:1fr">
        <div><div class="t" style="white-space:normal">${esc(a.Descricao)}</div>
        ${a.Campo ? `<div class="s" style="white-space:normal"><b>${esc(a.Campo)}:</b> <span style="text-decoration:line-through">${esc(a.Antes || '—')}</span> → <b style="color:var(--brand)">${esc(a.Depois || '—')}</b></div>` : ''}
        <div class="s">${esc(a.Usuario)} · ${esc(dtBR(a.Data))}${a.Origem && a.Origem !== 'Edição direta' ? ' · ' + esc(a.Origem) : ''}</div></div></div>`).join('') || '<div class="empty">Nenhuma alteração registrada ainda.</div>'}</div></div>`;
  } else {
    const ac = (S.data && S.data.acessos) || [];
    body = `<div class="section"><div class="list">${ac.map(a => `<div class="row" style="grid-template-columns:auto 1fr auto">${audAvatar(a.auditor, 34)}<div><div class="t">${esc(a.auditor)}</div><div class="s">${esc(dtBR(a.data))}</div></div><div class="v"><span class="status ${a.tipo === 'Login' ? 'st-ok' : 'st-mot'}">${a.tipo === 'Login' ? 'Entrou' : 'Saiu'}</span></div></div>`).join('') || '<div class="empty">Sem registros.</div>'}</div></div>`;
  }
  return { html: `${topbar({ title: 'Histórico' })}<main><div class="wrap"><div class="gutter" style="padding-top:14px">${segs}</div>${body}</div></main>${navbar('historico')}` };
};

/* ---------- Solicitações de alteração ---------- */
function resumoSolic(s) {
  const p = [];
  if (s.NovaData && s.NovaData !== s.DataAtual) p.push('data ' + dBR(s.DataAtual) + ' → ' + dBR(s.NovaData));
  if (s.NovasVendas !== '' && s.NovasVendas != null && +s.NovasVendas !== +s.VendasAtual) p.push('vendas ' + money(s.VendasAtual) + ' → ' + money(s.NovasVendas));
  if (s.NovoTicket !== '' && s.NovoTicket != null && +s.NovoTicket !== +s.TicketAtual) p.push('ticket ' + int(s.TicketAtual) + ' → ' + int(s.NovoTicket));
  if (s.NovoResponsavel && s.NovoResponsavel !== s.ResponsavelAtual) p.push('responsável ' + (s.ResponsavelAtual || '—') + ' → ' + s.NovoResponsavel);
  return p.join(' · ') || 'sem mudanças';
}
function solicStatus(s) {
  if (s._error) return '<span class="status st-no">Erro</span>';
  if (s._pending) return `<span class="status st-pend">${ICON.clock}Na fila</span>`;
  if (s.Status === 'Aprovada') return `<span class="status st-ok">${ICON.check}Aprovada</span>`;
  if (s.Status === 'Recusada') return `<span class="status st-no">${ICON.x}Recusada</span>`;
  return `<span class="status st-mot">${ICON.clock}Pendente</span>`;
}
function solicRowHtml(s) {
  const l = lojaById(s.Loja);
  return `<button class="row" data-solic="${esc(s.id_solicitacao)}">
    <div><div class="t">${esc(l ? l.NomeFantasia : s.Loja || 'Lançamento')} · ${esc(dShort(s.DataAtual || ''))}</div>
    <div class="s">${esc(s.Tipo === 'Exclusão' ? 'Excluir lançamento' : resumoSolic(s))}</div>
    <div class="s">${esc(s.Solicitante || '')}${s.DataPedido ? ' · ' + esc(dtBR(s.DataPedido)) : ''}</div></div>
    <div class="v">${solicStatus(s)}</div></button>`;
}

VIEWS.pedir = (p) => {
  const v = merged().byId.get(p.id);
  if (!v) return { html: topbar({ title: 'Solicitar alteração', backBtn: true }) + '<main><div class="empty">Lançamento não encontrado.</div></main>' };
  const loja = lojaById(v.loja) || {};
  const tipo = p.tipo || 'Alteração';
  const html = `
  ${topbar({ title: 'Solicitar alteração', backBtn: true })}
  <main class="form-main"><div class="wrap gutter">
    <div class="fields">
      <div class="card" style="padding:14px 16px;display:grid;gap:2px">
        <span class="muted" style="font-size:13px">Lançamento atual</span>
        <b>${esc(loja.NomeFantasia || v.nome)} · ${esc(dBR(v.data))}</b>
        <span class="num">${money(v.vendas)} · ${int(v.ticket)} tickets · resp. ${esc(v.resp || '—')}</span>
      </div>
      <div class="seg" role="group">${['Alteração', 'Exclusão'].map(t => `<button type="button" data-ptipo="${t}" aria-pressed="${tipo === t}">${t === 'Alteração' ? 'Corrigir dados' : 'Excluir lançamento'}</button>`).join('')}</div>
      <div id="pCampos" ${tipo === 'Exclusão' ? 'hidden' : ''} style="display:grid;gap:18px">
        <div class="field" id="fdPData"><label for="pData">Data correta</label>
          <input class="input" type="date" id="pData" value="${v.data}" max="${today()}"></div>
        <div class="field" id="fdPVendas"><label for="pVendas">Valor correto das vendas</label>
          <input class="input money num" id="pVendas" inputmode="numeric" value="${money(v.vendas)}"></div>
        <div class="field" id="fdPTicket"><label for="pTicket">Ticket correto</label>
          <input class="input num" id="pTicket" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="6" value="${esc(Math.round(+v.ticket))}"></div>
        <div class="field"><label for="pResp">Responsável correto</label>
          <input class="input" id="pResp" value="${esc(v.resp || '')}"></div>
        <div id="pDup"></div>
      </div>
      <div class="field" id="fdPMot"><label for="pMot">Motivo da solicitação<span class="req">*</span></label>
        <textarea id="pMot" placeholder="Ex.: digitei R$ 345,00 mas o correto é R$ 3.450,00"></textarea></div>
    </div>
  </div></main>
  <div class="formbar"><button class="btn" data-act="back">Cancelar</button><button class="btn primary" data-act="enviarPedido" data-id="${esc(v.id)}">${ICON.check}Enviar solicitação</button></div>`;
  return {
    html, form: true,
    mount() {
      const f = $('#pVendas');
      let cents = Math.round(+v.vendas * 100);
      f.addEventListener('input', () => { const d = f.value.replace(/\D/g, '').replace(/^0+(?=\d)/, ''); cents = d ? parseInt(d.slice(0, 13), 10) : null; f.value = cents == null ? '' : money(cents / 100); });
      S.getPCents = () => cents;
      const dup = () => { const dt = $('#pData').value; const ex = merged().byLojaData.get(v.loja + '|' + dt); $('#pDup').innerHTML = ex && ex.id !== v.id ? `<div class="alert warn">Já existe outro lançamento desta loja em ${esc(dBR(dt))} (${money(ex.vendas)}). A solicitação será recusada pela planilha se for aprovada assim.</div>` : ''; };
      $('#pData').addEventListener('change', dup);
    }
  };
};

function enviarPedido(id) {
  const v = merged().byId.get(id);
  const tipo = ($('[data-ptipo][aria-pressed="true"]') || { dataset: { ptipo: 'Alteração' } }).dataset.ptipo;
  const motivo = $('#pMot').value.trim();
  if (!motivo) { fieldErr('fdPMot', 'Explique o que está errado.'); return; }
  const solic = { id_solicitacao: uid(), VendaId: id, Loja: v.loja, Tipo: tipo, Motivo: motivo, DataPedido: new Date().toISOString(),
    DataAtual: v.data, VendasAtual: +v.vendas, TicketAtual: +v.ticket, ResponsavelAtual: v.resp || '' };
  if (tipo === 'Alteração') {
    const cents = S.getPCents();
    if (cents == null) { fieldErr('fdPVendas', 'Informe o valor.'); return; }
    const tk = $('#pTicket').value;
    if (!/^\d+$/.test(tk)) { fieldErr('fdPTicket', 'Informe o ticket (número inteiro).'); return; }
    Object.assign(solic, { NovaData: $('#pData').value || v.data, NovasVendas: cents / 100, NovoTicket: +tk, NovoResponsavel: $('#pResp').value.trim() || v.resp });
    if (resumoSolic(solic) === 'sem mudanças') { toast('Altere pelo menos um campo, ou escolha "Excluir lançamento".'); return; }
  }
  enqueue({ type: 'solic', solic });
  toast('Solicitação enviada para o master.');
  back();
}

VIEWS.solic = (p) => {
  const s = solicAll().find(x => x.id_solicitacao === p.id);
  if (!s) return { html: topbar({ title: 'Solicitação', backBtn: true }) + '<main><div class="empty">Solicitação não encontrada.</div></main>' };
  const l = lojaById(s.Loja) || {};
  const v = merged().byId.get(s.VendaId);
  const linha = (k, a, b) => `<dt>${k}</dt><dd>${a === b || b === '' || b == null ? esc(a || '—') : `<span class="muted" style="text-decoration:line-through">${esc(a || '—')}</span><br><span style="color:var(--brand)">${esc(b)}</span>`}</dd>`;
  const pode = isMaster() && s.Status === 'Pendente' && !s._pending;
  const html = `
  ${topbar({ title: 'Solicitação', backBtn: true })}
  <main class="${pode ? 'form-main' : ''}"><div class="wrap">
    <div class="gutter big-value" style="gap:8px">
      <span class="muted">${esc(l.NomeFantasia || s.Loja)} · pedido por ${esc(s.Solicitante || '')}${s.DataPedido ? ' em ' + esc(dtBR(s.DataPedido)) : ''}</span>
      <span style="font-size:24px;font-weight:800">${s.Tipo === 'Exclusão' ? 'Excluir lançamento' : 'Corrigir lançamento'}</span>
      <span>${solicStatus(s)}</span>
    </div>
    <dl class="dl">
      ${s.Tipo === 'Exclusão'
        ? linha('Data', dBR(s.DataAtual)) + linha('Vendas', money(s.VendasAtual)) + linha('Ticket', int(s.TicketAtual)) + linha('Responsável', s.ResponsavelAtual)
        : linha('Data', dBR(s.DataAtual), dBR(s.NovaData)) + linha('Vendas', money(s.VendasAtual), money(s.NovasVendas)) + linha('Ticket', int(s.TicketAtual), int(s.NovoTicket)) + linha('Responsável', s.ResponsavelAtual, s.NovoResponsavel)}
      <dt>Motivo</dt><dd style="white-space:pre-wrap">${esc(s.Motivo)}</dd>
      ${s.Status !== 'Pendente' ? `<dt>${esc(s.Status)} por</dt><dd>${esc(s.ResolvidoPor)}${s.DataResolucao ? ' · ' + esc(dtBR(s.DataResolucao)) : ''}</dd>${s.Resposta ? `<dt>Resposta</dt><dd>${esc(s.Resposta)}</dd>` : ''}` : ''}
    </dl>
    ${v ? `<div class="gutter section"><button class="btn" style="width:100%" data-venda="${esc(v.id)}">Abrir lançamento</button></div>` : ''}
    ${pode ? `<div class="gutter section"><div class="field"><label for="sResp">Resposta (opcional)</label><textarea id="sResp" style="min-height:80px" placeholder="Visível para quem pediu"></textarea></div><div id="sErr" style="margin-top:12px"></div></div>` : ''}
  </div></main>
  ${pode ? `<div class="formbar"><button class="btn danger" data-act="resolver" data-id="${esc(s.id_solicitacao)}" data-ok="0">${ICON.x}Recusar</button><button class="btn primary" data-act="resolver" data-id="${esc(s.id_solicitacao)}" data-ok="1">${ICON.check}Aprovar${s.Tipo === 'Exclusão' ? ' e excluir' : ' e corrigir'}</button></div>` : ''}`;
  return { html, form: pode };
};

async function resolver(id, aprovar) {
  if (!DEMO && !navigator.onLine) { toast('Aprovar ou recusar precisa de internet.'); return; }
  const btns = $$('[data-act="resolver"]'); btns.forEach(b => { b.disabled = true; });
  try {
    const r = await api('resolverSolicitacao', { id, aprovar, resposta: ($('#sResp') || {}).value || '' });
    if (r.row) { const nv = rowsToVendas(r.cols, [r.row])[0]; const old = S.vmap.get(nv.id); S.vmap.set(nv.id, nv); if (S.data) { S.data.vendas = S.data.vendas.filter(x => x.id !== nv.id); upsertRecent(nv); } if (old && old.data !== nv.data) S.ver++; }
    if (r.excluida) { S.vmap.delete(r.excluida); if (S.data) S.data.vendas = S.data.vendas.filter(x => x.id !== r.excluida); }
    if (S.data) S.data.solicitacoes = S.data.solicitacoes.map(x => x.id_solicitacao === id ? r.solicitacao : x);
    S.ver++; persist();
    toast(aprovar ? 'Aprovada. A planilha foi corrigida.' : 'Solicitação recusada.');
    back();
  } catch (e) {
    const b = $('#sErr'); if (b) b.innerHTML = `<div class="alert bad">${esc(e.message)}</div>`;
    btns.forEach(b => { b.disabled = false; });
  }
}

/* ---------- Painel ---------- */
VIEWS.painel = () => {
  const d = S.data;
  if (!isMaster()) return VIEWS.rota();
  if (!d) return { html: topbar({ title: 'Painel' }) + '<main><div class="loading">Carregando…</div></main>' + navbar('painel') };
  if (S.ui.painelAba === 'equipe') return VIEWS.equipe();
  const meses = Object.keys(d.mensal).sort();
  const mes = S.ui.painelMes || today().slice(0, 7);
  const sum = m => { const o = d.mensal[m] || {}; let v = 0, t = 0, n = 0, lj = 0; for (const k in o) { v += o[k][0]; t += o[k][1]; n += o[k][2]; lj++; } return { v, t, n, lj }; };
  const isAtualM = mes === today().slice(0, 7);
  // mês em andamento: compara com os mesmos dias do mês de referência
  const periodo = (m, ate) => { let v = 0, t = 0; for (let i = 1; i <= Math.min(ate, daysIn(m)); i++) { const x = d.diario[m + '-' + pad(i)]; if (x) { v += x[0]; t += x[1]; } } return { v, t }; };
  const a = sum(mes);
  const corteDia = isAtualM ? Math.max(1, ...Object.keys(d.diario).filter(k => k.startsWith(mes)).map(k => +k.slice(8, 10))) : 31;
  const pm = isAtualM ? periodo(addMonth(mes, -1), corteDia) : sum(addMonth(mes, -1));
  const ly = isAtualM ? periodo(addMonth(mes, -12), corteDia) : sum(addMonth(mes, -12));
  const lblPm = isAtualM ? 'vs. 1–' + corteDia + ' de ' + MESES[+addMonth(mes, -1).slice(5) - 1] : 'vs. mês anterior';
  const delta = (x, y) => y ? (x / y - 1) * 100 : null;
  const dl = (x, y, lab) => { const p = delta(x, y); return p == null ? '' : `<span class="d ${p >= 0 ? 'up' : 'down'}">${p >= 0 ? '▲' : '▼'} ${Math.abs(p).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% ${lab}</span>`; };
  const ativas = lojasAll().filter(l => l['Situação'] !== 'Inativo').length;
  const isAtual = mes === today().slice(0, 7);
  const diasCorridos = isAtual ? +today().slice(8, 10) : daysIn(mes);
  const cobertura = ativas && diasCorridos ? Math.min(100, a.n / (ativas * diasCorridos) * 100) : 0;
  // vendas por dia
  const nd = daysIn(mes);
  const dias = []; for (let i = 1; i <= nd; i++) { const k = mes + '-' + pad(i); dias.push({ k, v: (d.diario[k] || [0])[0], n: (d.diario[k] || [0, 0, 0])[2] }); }
  // por categoria
  const cat = {};
  const o = d.mensal[mes] || {};
  for (const id in o) { const l = lojaById(id); const c = (l && l.Categoria) || 'Sem categoria'; cat[c] = (cat[c] || 0) + o[id][0]; }
  const cats = Object.entries(cat).sort((x, y) => y[1] - x[1]);
  const maxCat = cats.length ? cats[0][1] : 1;
  // ranking
  const by = S.ui.rankBy;
  const rank = Object.keys(o).map(id => {
    const l = lojaById(id) || { NomeFantasia: id, ABL: 0 };
    const abl = parseFloat(String(l.ABL).replace(',', '.')) || 0;
    const [v, t] = o[id];
    return { id, nome: l.NomeFantasia, v, t, m2: abl ? v / abl : 0, tm: t ? v / t : 0 };
  }).filter(r => by === 'vendas' ? r.v > 0 : by === 'm2' ? r.m2 > 0 : r.tm > 0)
    .sort((x, y) => (by === 'vendas' ? y.v - x.v : by === 'm2' ? y.m2 - x.m2 : y.tm - x.tm));
  const rk = S.ui.rankAll ? rank : rank.slice(0, 10);
  const val = r => by === 'vendas' ? r.v : by === 'm2' ? r.m2 : r.tm;
  const maxR = rank.length ? val(rank[0]) : 1;
  // 12 meses
  const ult = []; for (let i = 11; i >= 0; i--) { const m = addMonth(mes, -i); ult.push({ m, v: sum(m).v }); }

  const html = `
  ${topbar({ title: 'Painel', sub: 'Vendas declaradas pelas lojas' })}
  <main><div class="wrap">
    <div class="gutter" style="padding-top:14px">${painelAbas()}</div>
    <div class="gutter section" style="display:grid;gap:12px">
      <div class="month-nav">
        <button class="cal-nav" data-act="painelMes" data-mes="${addMonth(mes, -1)}" ${meses.length && mes <= meses[0] ? 'disabled' : ''} aria-label="Mês anterior">${ICON.left}</button>
        <strong>${esc(mesNome(mes))}</strong>
        <button class="cal-nav" data-act="painelMes" data-mes="${addMonth(mes, 1)}" ${mes >= today().slice(0, 7) ? 'disabled' : ''} aria-label="Próximo mês">${ICON.right}</button>
      </div>
      <div class="kpis">
        <div class="kpi wide"><span class="l">Vendas totais</span><span class="v num">${money(a.v)}</span>${dl(a.v, pm.v, lblPm)}${ly.v ? dl(a.v, ly.v, (isAtualM ? 'vs. mesmo período de ' : 'vs. ') + mesNome(addMonth(mes, -12))) : ''}</div>
        <div class="kpi"><span class="l">Tickets</span><span class="v num">${int(a.t)}</span>${dl(a.t, pm.t, 'mês ant.')}</div>
        <div class="kpi"><span class="l">Ticket médio</span><span class="v num">${a.t ? money(a.v / a.t) : '—'}</span>${a.t && pm.t ? dl(a.v / a.t, pm.v / pm.t, 'mês ant.') : ''}</div>
        <div class="kpi"><span class="l">Lojas com venda</span><span class="v num">${a.lj}</span><span class="d muted">${ativas} lojas ativas</span></div>
        <div class="kpi"><span class="l">Cobertura</span><span class="v num">${cobertura.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%</span><span class="d muted">${int(a.n)} de ${int(ativas * diasCorridos)} lojas-dia</span></div>
      </div>
      ${isMaster() ? `<button class="btn" data-act="relatorio" data-mes="${mes}">${ICON.chart}Baixar relatório de ${esc(MESES[+mes.slice(5) - 1])} (Excel)</button>` : ''}
      ${isAtual ? '<div class="muted" style="font-size:12.5px">Dados da última sincronização' + (S.lastSync ? ' (' + new Date(S.lastSync).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ')' : '') + '. Lançamentos ainda na fila entram após o envio.</div>' : ''}
    </div>
    ${isMaster() ? painelAuditores(mes) : ''}
    <div class="gutter section">
      <h3 class="h2">Vendas por dia</h3>
      <div class="card chart"><div class="tip num" id="tipDia">Toque em uma barra para ver o dia.</div>${barChart(dias.map(x => ({ label: x.k.slice(8), value: x.v, key: x.k, extra: x.n })), 'dia')}</div>
    </div>
    <div class="gutter section">
      <h3 class="h2">Últimos 12 meses</h3>
      <div class="card chart"><div class="tip num" id="tipMes">Toque em um mês para abrir.</div>${barChart(ult.map(x => ({ label: MESES[+x.m.slice(5) - 1].slice(0, 3), value: x.v, key: x.m, hl: x.m === mes })), 'mes')}</div>
    </div>
    <div class="section">
      <h3 class="h2 gutter">Por categoria</h3>
      <div class="list">${cats.map(([c, v]) => `<div class="hbar"><span class="n">${esc(c)}</span><span class="val num">${moneyShort(v)} <span class="muted" style="font-weight:600">${a.v ? Math.round(v / a.v * 100) : 0}%</span></span><span class="bar"><i style="width:${(v / maxCat * 100).toFixed(1)}%"></i></span></div>`).join('') || '<div class="empty">Sem vendas neste mês.</div>'}</div>
    </div>
    <div class="section">
      <div class="gutter" style="display:grid;gap:10px;margin-bottom:10px">
        <h3 class="h2" style="margin:0">Ranking de lojas</h3>
        <div class="seg">${[['vendas', 'Vendas'], ['m2', 'R$ por m²'], ['tm', 'Ticket médio']].map(([k, l]) => `<button data-rank="${k}" aria-pressed="${by === k}">${l}</button>`).join('')}</div>
      </div>
      <div class="list">${rk.map((r, i) => `<button class="hbar" data-loja="${esc(r.id)}" data-lojames="${mes}"><span class="n"><span class="rank num">${i + 1}</span>${esc(r.nome)}</span><span class="val num">${by === 'vendas' ? moneyShort(r.v) : money(val(r))}</span><span class="bar"><i style="width:${(val(r) / maxR * 100).toFixed(1)}%"></i></span></button>`).join('') || '<div class="empty">Sem dados.</div>'}
      ${rank.length > 10 ? `<button class="more" data-act="rankAll">${S.ui.rankAll ? 'Mostrar só as 10 primeiras' : 'Ver todas as ' + rank.length + ' lojas'}</button>` : ''}</div>
    </div>
  </div></main>
  ${navbar('painel')}`;
  return {
    html,
    mount() {
      $$('[data-bar]').forEach(b => b.addEventListener('click', () => {
        const kind = b.dataset.bar, key = b.dataset.key, v = +b.dataset.value;
        $$('[data-bar="' + kind + '"]').forEach(x => x.setAttribute('opacity', x === b ? '1' : '.55'));
        if (kind === 'dia') $('#tipDia').textContent = `${diaLongo(key)}: ${money(v)} · ${b.dataset.extra} lojas`;
        else { S.ui.painelMes = key; refresh(); }
      }));
    }
  };
};

function painelAuditores(mes) {
  const pa = (S.data.porAuditor || {})[mes] || {};
  const sols = solicAll().filter(s => String(s.DataPedido || '').startsWith(mes));
  const nomes = new Set(Object.keys(pa).concat(sols.map(s => s.Solicitante).filter(Boolean)));
  ((S.data && S.data.auditores) || []).forEach(a => nomes.add(a.nome));
  const rows = Array.from(nomes).map(n => {
    const ss = sols.filter(s => s.Solicitante === n);
    return { n, reg: pa[n] || 0, corr: ss.length, aprov: ss.filter(s => s.Status === 'Aprovada').length, pend: ss.filter(s => s.Status === 'Pendente').length };
  }).filter(r => r.reg || r.corr || audInfo(r.n)).sort((a, b) => b.reg - a.reg || a.n.localeCompare(b.n, 'pt-BR'));
  const max = Math.max(1, ...rows.map(r => r.reg));
  return `<div class="section">
    <h3 class="h2 gutter">Auditores no mês <span style="text-transform:none;letter-spacing:0;font-weight:600">só o master vê</span></h3>
    <div class="list">${rows.map(r => `<div class="hbar" style="grid-template-columns:auto minmax(0,1fr) auto;column-gap:12px">
      ${audAvatar(r.n, 36)}
      <span style="min-width:0"><span class="n" style="display:block">${esc(r.n)}</span>
      <span class="muted" style="font-size:12.5px">${r.corr ? `${r.corr} correç${r.corr > 1 ? 'ões' : 'ão'} pedida${r.corr > 1 ? 's' : ''}${r.aprov ? ` · ${r.aprov} aprovada${r.aprov > 1 ? 's' : ''}` : ''}${r.pend ? ` · ${r.pend} pendente${r.pend > 1 ? 's' : ''}` : ''}${r.reg ? ` · ${(r.corr / r.reg * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% dos lançamentos` : ''}` : 'Nenhuma correção pedida'}</span></span>
      <span class="val num">${int(r.reg)}<span class="muted" style="font-weight:600;font-size:12px"> lanç.</span></span>
      <span class="bar" style="grid-column:2 / -1"><i style="width:${(r.reg / max * 100).toFixed(1)}%"></i></span></div>`).join('') || '<div class="empty">Sem lançamentos neste mês.</div>'}</div>
    <div class="gutter muted" style="font-size:12px;margin-top:6px">Lançamentos contados pela data em que foram registrados no app.</div>
  </div>`;
}

function loadScript(src) {
  return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Não foi possível carregar o gerador de Excel. Verifique a internet.')); document.head.appendChild(s); });
}

async function baixarRelatorio(mes) {
  const btn = $('[data-act="relatorio"]'); if (btn) { btn.disabled = true; btn.lastChild.textContent = 'Gerando relatório…'; }
  try {
    if (S.data && mes + '-01' < S.data.corte && !S.mesFetched.has(mes)) {
      if (!DEMO && !navigator.onLine) throw new Error('Para meses antigos o relatório precisa de internet.');
      await ensureMes(mes);
      if (!S.mesFetched.has(mes)) throw new Error('Não foi possível carregar os lançamentos de ' + mesNome(mes) + '.');
    }
    if (!window.XLSX) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
    const X = window.XLSX;
    const nd = daysIn(mes);
    const vendas = merged().list.filter(v => v.data.startsWith(mes)).sort((a, b) => a.data.localeCompare(b.data) || String(a.nome).localeCompare(String(b.nome)));
    const por = {};
    vendas.forEach(v => { const o = por[v.loja] || (por[v.loja] = { v: 0, t: 0, dias: new Set() }); o.v += +v.vendas || 0; o.t += +v.ticket || 0; o.dias.add(v.data); });
    const lojasRel = lojasAll().filter(l => l['Situação'] !== 'Inativo' || por[l.IdLoja]).sort((a, b) => String(a.Luc).localeCompare(String(b.Luc), 'pt-BR', { numeric: true }));
    const abl = l => parseFloat(String(l.ABL).replace(',', '.')) || 0;
    const head1 = ['LUC', 'Loja', 'Contrato', 'Tipo', 'Categoria', 'Segmento', 'Piso', 'ABL (m²)', 'Vendas (R$)', 'Tickets', 'Ticket médio (R$)', 'Venda por m² (R$)', 'Dias lançados', 'Dias no mês', 'Dias sem lançamento', 'Situação'];
    const aoa = [['Relatório de vendas — ' + mesNome(mes) + ' — ' + (CFG.nomeShopping || '')], ['Gerado em ' + new Date().toLocaleString('pt-BR') + ' por ' + S.user.nome], [], head1];
    lojasRel.forEach((l, i) => {
      const o = por[l.IdLoja] || { v: 0, t: 0, dias: new Set() };
      const r = 5 + i;
      aoa.push([l.Luc, l.NomeFantasia, l.Contrato, l.Tipo, l.Categoria, l.Segmento, l.Piso, abl(l) || null, Math.round(o.v * 100) / 100, o.t,
        { f: `IF(J${r}>0,I${r}/J${r},"")` }, { f: `IF(H${r}>0,I${r}/H${r},"")` }, o.dias.size, nd, { f: `N${r}-M${r}` }, l['Situação']]);
    });
    const last = 4 + lojasRel.length;
    aoa.push(['', 'TOTAL', '', '', '', '', '', { f: `SUM(H5:H${last})` }, { f: `SUM(I5:I${last})` }, { f: `SUM(J5:J${last})` }, { f: `IF(J${last + 1}>0,I${last + 1}/J${last + 1},"")` }, { f: `IF(H${last + 1}>0,I${last + 1}/H${last + 1},"")` }, { f: `SUM(M5:M${last})` }, '', { f: `SUM(O5:O${last})` }, '']);
    const ws1 = X.utils.aoa_to_sheet(aoa);
    const fmt = (ws, col, z, r0, r1) => { for (let r = r0; r <= r1; r++) { const c = ws[col + r]; if (c) c.z = z; } };
    ['I', 'K', 'L'].forEach(c => fmt(ws1, c, '#,##0.00', 5, last + 1));
    fmt(ws1, 'H', '#,##0.00', 5, last + 1);
    ws1['!cols'] = [8, 30, 11, 12, 22, 22, 8, 10, 15, 10, 15, 16, 13, 11, 18, 10].map(w => ({ wch: w }));
    ws1['!autofilter'] = { ref: `A4:P${last}` };
    const head2 = ['Data', 'LUC', 'Loja', 'Contrato', 'Vendas (R$)', 'Ticket', 'Responsável', 'Auditor', 'Registrado em', 'Código'];
    const rows2 = [head2].concat(vendas.map(v => {
      const l = lojaById(v.loja) || {};
      const [y, m, d] = v.data.split('-').map(Number);
      return [{ t: 'n', v: (Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 864e5, z: 'dd/mm/yyyy' }, l.Luc || '', l.NomeFantasia || v.nome, v.contrato || l.Contrato || '', +v.vendas || 0, +v.ticket || 0, v.resp || '', audNome(v.auditor), dtBR(v.hora || ''), v.id];
    }));
    const ws2 = X.utils.aoa_to_sheet(rows2);
    fmt(ws2, 'A', 'dd/mm/yyyy', 2, rows2.length); fmt(ws2, 'E', '#,##0.00', 2, rows2.length);
    ws2['!cols'] = [11, 8, 30, 11, 14, 8, 20, 18, 17, 10].map(w => ({ wch: w }));
    ws2['!autofilter'] = { ref: `A1:J${rows2.length}` };
    const wb = X.utils.book_new();
    X.utils.book_append_sheet(wb, ws1, 'Resumo por loja');
    X.utils.book_append_sheet(wb, ws2, 'Lançamentos');
    X.writeFile(wb, `Vendas ${mesNome(mes)}.xlsx`);
    toast('Relatório baixado.');
  } catch (e) {
    toast(e.message);
  }
  if (btn) { btn.disabled = false; btn.lastChild.textContent = 'Baixar relatório de ' + MESES[+mes.slice(5) - 1] + ' (Excel)'; }
}

function barChart(items, kind) {
  const W = 340, H = 150, top = 8, bottom = 22, left = 4;
  const max = Math.max(1, ...items.map(i => i.value));
  const n = items.length, bw = (W - left) / n;
  const nice = (() => { const p = Math.pow(10, Math.floor(Math.log10(max))); const m = max / p; return [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find(x => m <= x) * p; })();
  const y = v => top + (H - top - bottom) * (1 - v / nice);
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico de barras">`;
  [0.5, 1].forEach(f => { s += `<line x1="0" x2="${W}" y1="${y(nice * f)}" y2="${y(nice * f)}" stroke="var(--line)" stroke-dasharray="3 3"/><text x="${W}" y="${y(nice * f) - 3}" text-anchor="end" font-size="9" fill="var(--muted)">${esc(moneyShort(nice * f))}</text>`; });
  s += `<line x1="0" x2="${W}" y1="${y(0)}" y2="${y(0)}" stroke="var(--line)"/>`;
  items.forEach((it, i) => {
    const x = left + i * bw, h = y(0) - y(it.value);
    const fill = it.hl ? 'var(--brand-strong)' : 'var(--brand)';
    s += `<g data-bar="${kind}" data-key="${it.key}" data-value="${it.value}" data-extra="${it.extra || 0}" style="cursor:pointer" opacity="${it.hl === false ? .6 : 1}">
      <rect x="${x}" y="${top}" width="${bw}" height="${H - top - bottom}" fill="transparent"/>
      <rect x="${x + bw * .15}" y="${y(it.value)}" width="${bw * .7}" height="${Math.max(it.value ? 1.5 : 0, h)}" rx="${Math.min(3, bw * .2)}" fill="${fill}"/>
      ${n <= 12 || i % 5 === 0 || i === n - 1 ? `<text x="${x + bw / 2}" y="${H - 6}" text-anchor="middle" font-size="9.5" fill="var(--muted)">${esc(it.label)}</text>` : ''}</g>`;
  });
  return s + '</svg>';
}

/* ---------- Conta / sincronização ---------- */
VIEWS.mais = () => {
  const errs = S.queue.filter(q => q.error);
  const qdesc = q => {
    if (q.type === 'venda') { const l = lojaById(q.venda.Loja); return `Venda · ${l ? l.NomeFantasia : ''} · ${dBR(q.venda.Data)} · ${money(q.venda.Vendas)}`; }
    if (q.type === 'motivo') { const l = lojaById(q.motivo.loja); return `Motivo · ${l ? l.NomeFantasia : ''}`; }
    if (q.type === 'loja') return `Cadastro · ${q.loja.NomeFantasia}`;
    if (q.type === 'solic') return `Solicitação de ${q.solic.Tipo === 'Exclusão' ? 'exclusão' : 'alteração'}`;
    return 'Exclusão de lançamento';
  };
  const html = `
  ${topbar({ title: 'Conta' })}
  <main><div class="wrap">
    <div class="gutter section">
      <div class="card" style="padding:16px;display:flex;gap:14px;align-items:center">
        ${audAvatar(S.user.id, 52)}
        <div style="min-width:0;flex:1"><div style="font-weight:800;font-size:17px">${esc(S.user.nome)}</div><div class="muted" style="font-size:13px">${isMaster() ? 'Master — pode alterar todas as informações' : 'Auditor(a) — lança vendas e solicita alterações'}</div></div>
        <button class="btn" data-act="logout">Sair</button>
      </div>
    </div>
    <div class="gutter section">
      <h3 class="h2">Sincronização</h3>
      <div class="card" style="padding:16px;display:grid;gap:12px">
        <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap">
          <div><div style="font-weight:700">${S.syncing ? 'Sincronizando…' : S.queue.length ? S.queue.length + ' alteração(ões) aguardando envio' : 'Tudo enviado para a planilha'}</div>
          <div class="muted" style="font-size:13px">${S.lastSync ? 'Última atualização: ' + new Date(S.lastSync).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'Ainda não sincronizado'}${S.syncErr ? ' · ' + esc(S.syncErr) : ''}</div></div>
          <button class="btn primary" data-act="syncNow" ${S.syncing ? 'disabled' : ''}>${ICON.sync}Sincronizar</button>
        </div>
        ${S.queue.length ? `<div class="list" style="border-radius:10px;border:1px solid var(--line)">${S.queue.map(q => `<div class="row" style="grid-template-columns:1fr auto"><div><div class="t" style="white-space:normal;font-size:14px">${esc(qdesc(q))}</div>${q.error ? `<div class="s" style="color:var(--bad);white-space:normal">${esc(q.error)}</div>` : '<div class="s">Na fila</div>'}</div>${q.error ? `<div style="display:grid;gap:6px"><button class="quick" data-act="retry" data-qid="${q.qid}">Tentar</button><button class="quick" style="color:var(--bad)" data-act="descartar" data-qid="${q.qid}">Descartar</button></div>` : ''}</div>`).join('')}</div>` : ''}
        ${errs.length ? '<div class="alert bad">Alguns itens foram recusados pela planilha. Corrija ou descarte.</div>' : ''}
      </div>
    </div>
    ${isMaster() ? `<div class="gutter section" style="display:grid;gap:10px">
      <h3 class="h2" style="margin:0">Cadastros</h3>
      <button class="btn" style="width:100%" data-act="auditores">${ICON.user}Auditores: nome, senha, foto e perfil</button>
      <button class="btn" style="width:100%" data-act="novaLoja">${ICON.plus}Cadastrar nova loja</button>
      <button class="btn" style="width:100%" data-act="rotaConfig">${ICON.route}Lojas da rota diária</button>
      <button class="btn" style="width:100%" data-act="regras">${ICON.chart}Regras e pontuação da equipe</button>
    </div>` : ''}
    ${S.installEvt ? `<div class="gutter section"><h3 class="h2">Aplicativo</h3><button class="btn primary" style="width:100%" data-act="install">Instalar na tela inicial</button></div>` : ''}
    <div class="gutter section">
      <h3 class="h2">Aparência</h3>
      <div class="seg" role="group" aria-label="Tema">${[['auto', 'Automático'], ['light', 'Claro'], ['dark', 'Escuro']].map(([k, l]) => `<button data-tema="${k}" aria-pressed="${temaAtual() === k}">${l}</button>`).join('')}</div>
      <div class="hint muted" style="font-size:12.5px;margin-top:8px">Automático segue o tema do celular.</div>
    </div>
    ${!isMaster() ? `<div class="gutter muted" style="font-size:12.5px;padding-block:8px 20px">Versão ${APP_VERSION}</div>` : `<div class="gutter section">
      <h3 class="h2">Servidor</h3>
      <div class="card" style="padding:16px;display:grid;gap:10px">
        ${DEMO ? '<div class="muted">Modo demonstração: os dados ficam só nesta página.</div>' : `
        <div class="field"><label for="cfgUrl">Endereço do App da Web (Apps Script)</label>
        <input class="input" id="cfgUrl" value="${esc(S.apiUrl)}" style="font-size:13px" ${CFG.apiUrl ? 'readonly' : ''}></div>
        ${CFG.apiUrl ? '<div class="hint muted" style="font-size:12.5px">Definido no arquivo config.js.</div>' : '<button class="btn" data-act="saveUrl">Salvar endereço</button>'}`}
        <div class="muted" style="font-size:12.5px">Versão ${APP_VERSION}${S.data && S.data.version ? ' · servidor ' + esc(S.data.version) : ''}</div>
      </div>
    </div>`}
  </div></main>
  ${navbar('mais')}`;
  return { html };
};

/* ---------- Login e configuração ---------- */
VIEWS.setup = () => ({
  html: `<main><div class="login gutter">
    <div class="brand-mark"><span class="logo">${SELO('#fff', 4)}</span><h1>Auditoria de Vendas</h1><img class="shop-logo" src="${SHOP_LOGO}" alt="Teresópolis Shopping"><div class="muted">Primeiro acesso neste aparelho</div></div>
    <div class="field"><label for="setUrl">Endereço do App da Web</label>
      <input class="input" id="setUrl" placeholder="https://script.google.com/macros/s/…/exec" style="font-size:14px" value="${esc(S.apiUrl)}">
      <div class="hint">Copie o endereço que o Apps Script mostrou ao publicar (termina em /exec).</div></div>
    <div id="setErr"></div>
    <button class="btn primary" data-act="setupGo" style="min-height:52px">Conectar</button>
  </div></main>`
});

VIEWS.login = () => {
  const auds = S.auditoresLogin;
  const sel = S.ui.loginSel || '';
  return {
    html: `<main>${DEMO ? '<div class="demo-banner gutter">Demonstração com dados de exemplo — senha de todos: 1234 · Renato é o master</div>' : ''}<div class="login gutter">
      <div class="brand-mark"><span class="logo">${SELO('#fff', 4)}</span><h1>Auditoria de Vendas</h1><img class="shop-logo" src="${SHOP_LOGO}" alt="${esc(CFG.nomeShopping || 'Teresópolis Shopping')}"></div>
      <div class="field"><span class="label">Quem está usando?</span>
        <div class="who">${auds.length ? auds.map(a => `<button data-who="${esc(a.nome)}" aria-pressed="${sel === a.nome}">${audAvatar(a.nome, 42)}${esc(a.nome)}</button>`).join('') : '<div class="loading">Carregando auditores…</div>'}</div></div>
      <div class="field" id="fdSenha"><label for="senha">Senha</label>
        <input class="input" id="senha" type="password" inputmode="numeric" autocomplete="current-password" placeholder="Sua senha"></div>
      <div id="loginErr"></div>
      <button class="btn primary" data-act="loginGo" style="min-height:52px">Entrar</button>
      ${!DEMO && !CFG.apiUrl ? '<button class="btn" data-act="resetUrl" style="border:0;background:none;color:var(--muted)">Trocar endereço do servidor</button>' : ''}
    </div></main>`,
    form: true
  };
};

async function loadAuditores() {
  try {
    const r = await api('auditores', {}, { auth: false });
    if (JSON.stringify(r.auditores) === JSON.stringify(S.auditoresLogin)) return;
    S.auditoresLogin = r.auditores;
    await KV.set('auditores', r.auditores);
  } catch (e) {
    const c = await KV.get('auditores');
    if (c) S.auditoresLogin = c;
    else { const b = $('#loginErr'); if (b) b.innerHTML = `<div class="alert bad">${esc(e.message)}</div>`; return; }
  }
  if (cur().v === 'login') {
    const senha = $('#senha') ? $('#senha').value : '';
    render();
    if (senha && $('#senha')) $('#senha').value = senha;
  }
  loadFotos();
}

/* ---------- Cadastro de auditores (master) ---------- */
async function carregarAuditores() {
  try { const r = await api('listarAuditores'); S.audList = r.auditores; S.audErr = ''; loadFotos(); }
  catch (e) { S.audErr = e.message; }
  if (cur().v === 'auditores') render();
}
VIEWS.auditores = () => {
  if (!S.audList && !S.audErr) carregarAuditores();
  const l = (S.audList || []).slice().sort((a, b) => (a.situacao === 'Inativo') - (b.situacao === 'Inativo') || a.nome.localeCompare(b.nome, 'pt-BR'));
  const html = `
  ${topbar({ title: 'Auditores', backBtn: true })}
  <main><div class="wrap">
    <div class="gutter section"><button class="btn primary" style="width:100%" data-act="novoAud">${ICON.plus}Cadastrar auditor</button></div>
    ${S.audErr ? `<div class="gutter"><div class="alert bad">${esc(S.audErr)}</div></div>` : ''}
    ${!S.audList && !S.audErr ? '<div class="loading">Carregando…</div>' : ''}
    <div class="list">${l.map(a => `<button class="row" style="grid-template-columns:auto 1fr auto" data-aud="${esc(a.id)}">
      ${audAvatar(a.id, 44)}
      <div><div class="t">${esc(a.nome)}</div><div class="s">${a.perfil === 'Master' ? 'Master' : 'Auditor'}</div></div>
      <div class="v">${a.situacao === 'Inativo' ? '<span class="status st-no">Inativo</span>' : '<span class="status st-ok">Ativo</span>'}</div></button>`).join('')}</div>
  </div></main>`;
  return { html };
};
VIEWS.audForm = (p) => {
  const a = p.id ? (S.audList || []).find(x => x.id === p.id) : { perfil: 'Auditor', situacao: 'Ativo' };
  if (!a) return { html: topbar({ title: 'Auditor', backBtn: true }) + '<div class="empty">Não encontrado.</div>' };
  const self = S.user && a.id === S.user.id;
  const seg = (name, opts, val) => `<div class="seg" data-segname="${name}">${opts.map(o => `<button type="button" data-segval="${o}" aria-pressed="${val === o}" ${self ? 'disabled' : ''}>${o}</button>`).join('')}</div>`;
  const html = `
  ${topbar({ title: p.id ? 'Editar auditor' : 'Novo auditor', backBtn: true })}
  <main class="form-main"><div class="wrap gutter">
    <div class="fields">
      <div class="field"><span class="label">Foto</span>
        <div style="display:flex;gap:16px;align-items:center"><span id="audPrev">${p.id ? audAvatar(a.id, 72) : `<span class="avatar" style="width:72px;height:72px;border-radius:50%;background:var(--soft);color:var(--muted)">${ICON.user.replace('<svg', '<svg width="34" height="34"')}</span>`}</span>
        <label class="btn" style="position:relative">${p.id && a.foto ? 'Trocar foto' : 'Escolher foto'}<input type="file" id="audFoto" accept="image/*" capture="user" style="position:absolute;inset:0;opacity:0"></label></div></div>
      <div class="field" id="fdAudNome"><label for="audNome">Nome<span class="req">*</span></label>
        <input class="input" id="audNome" value="${esc(a.nome || '')}" autocapitalize="words" autocomplete="off">
        ${p.id ? '<div class="hint">Os lançamentos antigos continuam com o nome anterior.</div>' : ''}</div>
      <div class="field" id="fdAudSenha"><label for="audSenha">${p.id ? 'Nova senha' : 'Senha'}${p.id ? '' : '<span class="req">*</span>'}</label>
        <input class="input" id="audSenha" inputmode="numeric" autocomplete="off" placeholder="${p.id ? 'Deixe em branco para manter a atual' : 'Mínimo 4 caracteres'}">
        <div class="hint">A senha atual não é exibida por segurança.</div></div>
      <div class="field"><span class="label">Perfil</span>${seg('perfil', ['Auditor', 'Master'], a.perfil)}
        <div class="hint">Master altera tudo e aprova correções. Auditor lança vendas e pede correções.</div></div>
      <div class="field"><span class="label">Situação</span>${seg('situacao', ['Ativo', 'Inativo'], a.situacao)}
        <div class="hint">${self ? 'Você não pode mudar o seu próprio perfil nem se desativar.' : 'Inativo não consegue entrar no app, mas o histórico dele é mantido.'}</div></div>
      <div id="audErr"></div>
    </div>
  </div></main>
  <div class="formbar"><button class="btn" data-act="back">Cancelar</button><button class="btn primary" data-act="saveAud" data-id="${esc(a.id || '')}">${ICON.check}Salvar</button></div>`;
  return {
    html, form: true,
    mount() {
      S.audFoto = '';
      $('#audFoto').addEventListener('change', async e => {
        const f = e.target.files[0]; if (!f) return;
        try { S.audFoto = await resizeImage(f, 320); $('#audPrev').innerHTML = `<span class="avatar" style="width:72px;height:72px;border-radius:50%"><img src="${S.audFoto}" alt="" style="object-fit:cover"></span>`; }
        catch (err) { toast('Não foi possível ler a imagem.'); }
      });
    }
  };
};
async function saveAud(id) {
  if (!DEMO && !navigator.onLine) { $('#audErr').innerHTML = '<div class="alert bad">Cadastrar auditores precisa de internet.</div>'; return; }
  const nome = $('#audNome').value.trim(), senha = $('#audSenha').value.trim();
  const segv = n => { const b = $(`[data-segname="${n}"] [aria-pressed="true"]`); return b ? b.dataset.segval : ''; };
  if (!nome) return fieldErr('fdAudNome', 'Informe o nome.');
  if (!id && !senha) return fieldErr('fdAudSenha', 'Defina uma senha.');
  if (senha && senha.length < 4) return fieldErr('fdAudSenha', 'A senha precisa ter pelo menos 4 caracteres.');
  const btn = $('[data-act="saveAud"]'); btn.disabled = true;
  try {
    const r = await api('salvarAuditor', { auditor: { id: id || undefined, nome, senha, perfil: segv('perfil'), situacao: segv('situacao') }, foto: S.audFoto || undefined });
    const novo = r.auditor;
    if (S.audFoto && novo.foto) { S.fotos[novo.foto] = S.audFoto; KV.set('fotos', S.fotos); }
    const i = (S.audList || []).findIndex(x => x.id === novo.id);
    if (i >= 0) S.audList[i] = novo; else (S.audList = S.audList || []).push(novo);
    if (S.data) { const j = S.data.auditores.findIndex(x => x.id === novo.id); const pub = { id: novo.id, nome: novo.nome, foto: novo.foto, perfil: novo.perfil }; if (j >= 0) S.data.auditores[j] = pub; else S.data.auditores.push(pub); }
    if (S.user && novo.id === S.user.id) { S.user.nome = novo.nome; if (senha) S.user.senha = senha; }
    await persist();
    toast(id ? 'Auditor atualizado.' : 'Auditor cadastrado.');
    back();
    sync({ full: true });
  } catch (e) {
    $('#audErr').innerHTML = `<div class="alert bad">${esc(e.message)}</div>`;
    btn.disabled = false;
  }
}

async function doLogin() {
  const nome = S.ui.loginSel, senha = ($('#senha').value || '').trim();
  const err = $('#loginErr');
  if (!nome) { err.innerHTML = '<div class="alert bad">Escolha seu nome.</div>'; return; }
  if (!senha) { err.innerHTML = '<div class="alert bad">Digite a senha.</div>'; return; }
  const btn = $('[data-act="loginGo"]'); btn.disabled = true; btn.textContent = 'Entrando…';
  try {
    const r = await api('login', { auth: { nome, senha } }, { auth: false });
    S.user = { id: r.user.id, nome: r.user.nome, senha, perfil: r.user.perfil || 'Auditor' };
    await persist();
    S.stack = [{ v: 'rota', p: {} }];
    render();
    toast('Olá, ' + S.user.nome.split(' ')[0] + '! Carregando lojas…');
    await sync({ full: true, quiet: false });
  } catch (e) {
    err.innerHTML = `<div class="alert bad">${esc(e.auth ? 'Senha incorreta.' : e.message)}</div>`;
    btn.disabled = false; btn.textContent = 'Entrar';
  }
}

async function logout(silent) {
  if (!silent && S.queue.length) {
    if (!S.confirmLogout) { S.confirmLogout = true; toast('Há ' + S.queue.length + ' item(ns) não enviados. Toque em Sair de novo para sair mesmo assim.'); setTimeout(() => { S.confirmLogout = false; }, 5000); return; }
  }
  if (!silent) { try { await api('logout'); } catch (e) { /* sem internet: segue */ } }
  S.user = null; S.confirmLogout = false;
  await persist();
  S.stack = [{ v: 'login', p: {} }];
  render(); loadAuditores();
}

/* ============================ Render ============================ */
let current = null;
function render() {
  const c = cur();
  const fn = VIEWS[c.v] || VIEWS.rota;
  current = fn(c.p) || {};
  const app = $('#app');
  // preserva a busca focada ao redesenhar
  const focusId = document.activeElement && document.activeElement.id;
  const selStart = document.activeElement && document.activeElement.selectionStart;
  app.innerHTML = current.html;
  if (focusId && (focusId === 'busca' || focusId === 'hBusca')) {
    const el = $('#' + focusId); if (el) { el.focus(); try { el.setSelectionRange(selStart, selStart); } catch (e) { /* */ } }
  }
  if (current.mount) current.mount();
}
/* Redesenha só se não houver formulário aberto (para não perder o que está sendo digitado) */
function refresh(soft) {
  if (current && current.form) { updateChrome(); return; }
  clearTimeout(refreshT);
  refreshT = setTimeout(() => {
    if (current && current.form) return updateChrome();   // um formulário abriu nesse meio-tempo
    const y = window.scrollY; render(); window.scrollTo(0, y);
  }, soft ? 250 : 0);
}
function updateChrome(full) {
  if (full && !(current && current.form)) return refresh(true);
  const b = $('#syncBtn'); if (!b) return;
  const offline = !DEMO && !navigator.onLine;
  b.classList.toggle('spin', S.syncing);
  b.innerHTML = (offline ? ICON.cloudOff : ICON.sync) + (S.queue.length ? `<span class="sync-dot">${S.queue.length}</span>` : '');
}

/* ============================ Eventos ============================ */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act],[data-tema],[data-jog],[data-paba],[data-rotatoggle],[data-gmes],[data-aud],[data-segval],[data-solic],[data-ptipo],[data-tab],[data-loja],[data-registrar],[data-venda],[data-filtro],[data-htab],[data-rank],[data-resp],[data-mot],[data-step],[data-who],[data-sit]');
  if (!t || t.disabled) return;
  const d = t.dataset;
  if (d.tab) return tab(d.tab);
  if (d.tema) { setTema(d.tema); $$('[data-tema]').forEach(b => b.setAttribute('aria-pressed', b === t)); return; }
  if (d.paba) { S.ui.painelAba = d.paba; render(); return window.scrollTo(0, 0); }
  if (d.gmes) { S.ui.gameMes = d.gmes; return refresh(); }
  if (d.jog) return go('jogador', { nome: d.jog, mes: S.ui.gameMes || today().slice(0, 7) });
  if (d.solic) return go('solic', { id: d.solic });
  if (d.aud) return go('audForm', { id: d.aud });
  if (d.segval) { $$('[data-segval]', t.parentNode).forEach(b => b.setAttribute('aria-pressed', b === t)); return; }
  if (d.ptipo) { $$('[data-ptipo]').forEach(b => b.setAttribute('aria-pressed', b === t)); $('#pCampos').hidden = d.ptipo === 'Exclusão'; return; }
  if (d.registrar !== undefined) {
    e.stopPropagation();
    const par = { loja: d.registrar, data: d.data || ontem(), modo: d.modo || 'dia' };
    return cur().v === 'proxima' ? replace('registrar', par) : go('registrar', par);
  }
  if (d.venda) return go('venda', { id: d.venda });
  if (d.loja) return go('loja', { id: d.loja, mes: d.lojames || '' });
  if (d.filtro) { S.ui.filtro = d.filtro; persist(); return render(); }
  if (d.htab) { S.ui.histTab = d.htab; return render(); }
  if (d.rank) { S.ui.rankBy = d.rank; return refresh(); }
  if (d.resp) { const r = $('#vResp'); r.value = d.resp; r.dataset.auto = ''; $('#respHint').textContent = ''; fieldErr('fdResp', ''); return; }
  if (d.mot) { const ta = $('#mTxt'); ta.value = ta.value ? ta.value + '. ' + d.mot : d.mot; return; }
  if (d.step) { const i = $('#vTicket'); i.value = Math.max(0, (+i.value || 0) + +d.step); i.dispatchEvent(new Event('input')); return; }
  if (d.who) { S.ui.loginSel = d.who; $$('[data-who]').forEach(b => b.setAttribute('aria-pressed', b.dataset.who === d.who)); $('#senha').focus(); return; }
  if (d.sit) { $$('[data-sit]').forEach(b => b.setAttribute('aria-pressed', b === t)); return; }
  const c = cur();
  switch (d.act) {
    case 'back': return back();
    case 'sync': case 'syncNow': return sync({ full: true, quiet: false });
    case 'toggleBusca': S.ui.buscaAberta = !S.ui.buscaAberta; if (!S.ui.buscaAberta) S.ui.busca = ''; render(); { const b = $('#busca'); if (b) b.focus(); } return;
    case 'toggleInativas': S.ui.inativas = !S.ui.inativas; persist(); return render();
    case 'lojaMes': c.p.mes = d.mes; return refresh();
    case 'lojaMais': c.p.lim = (c.p.lim || 15) + 30; return refresh();
    case 'histMes': S.ui.histMes = d.mes; S.ui.histLim = 12; render(); return window.scrollTo(0, 0);
    case 'histMais': S.ui.histLim = (S.ui.histLim || 12) + 12; return refresh();
    case 'painelMes': S.ui.painelMes = d.mes; return refresh();
    case 'rankAll': S.ui.rankAll = !S.ui.rankAll; return refresh();
    case 'motivo': return go('motivo', { loja: d.id });
    case 'verSolic': S.ui.histTab = 'solic'; return tab('historico');
    case 'outlierOk': S.outlierOk = true; return saveVenda();
    case 'outlierFix': $('#outBox').innerHTML = ''; { const f = $('#vVendas'); f.focus(); f.scrollIntoView({ block: 'center' }); } return;
    case 'doUpdate': return doUpdate();
    case 'relatorio': return baixarRelatorio(d.mes);
    case 'auditores': S.audList = null; S.audErr = ''; return go('auditores');
    case 'novoAud': return go('audForm', {});
    case 'saveAud': return saveAud(d.id);
    case 'rotaConfig': S.rotaEdit = {}; return go('rotaConfig');
    case 'saveRota': return saveRota();
    case 'regras': return go('regras');
    case 'saveRegras': return saveRegras();
    case 'proxRota': return go('registrar', { loja: d.pl, data: d.pd, modo: 'rota' });
    case 'pedirAlteracao': return go('pedir', { id: d.id });
    case 'enviarPedido': return enviarPedido(d.id);
    case 'resolver': return resolver(d.id, d.ok === '1');
    case 'editLoja': return go('lojaForm', { id: d.id });
    case 'novaLoja': return go('lojaForm', {});
    case 'editVenda': return go('registrar', { edit: d.id });
    case 'askDel': $('#delBox').hidden = false; return $('#delBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
    case 'cancelDel': $('#delBox').hidden = true; return;
    case 'delVenda': {
      const q = S.queue.find(x => x.type === 'venda' && x.venda.VendaId === d.id);
      const known = S.vmap.has(d.id);
      if (q) S.queue = S.queue.filter(x => x !== q);
      if (known) enqueue({ type: 'excluirVenda', id: d.id }); else { S.ver++; persist(); }
      toast('Lançamento excluído.');
      return back();
    }
    case 'sigClear': return S.sigPad && S.sigPad.clear();
    case 'saveVenda': return saveVenda();
    case 'saveMotivo': {
      const txt = $('#mTxt').value.trim();
      if (!txt) { fieldErr('fdMot', 'Descreva o motivo.'); return; }
      enqueue({ type: 'motivo', motivo: { id: uid(), loja: $('#mLoja').value, motivo: txt, data: nowStr() } });
      toast('Motivo registrado.');
      return back();
    }
    case 'saveLoja': {
      const val = k => ($('#l' + k).value || '').trim();
      if (!val('NomeFantasia')) { fieldErr('fdNomeFantasia', 'Informe o nome fantasia.'); return; }
      const base = c.p.id ? Object.assign({}, lojaById(c.p.id)) : { IdLoja: uid(), Logo: '' };
      ['NomeFantasia', 'Luc', 'Tipo', 'Categoria', 'Segmento', 'Piso', 'Contrato'].forEach(k => { base[k] = val(k); });
      const abl = val('ABL').replace(/\./g, '').replace(',', '.');
      base.ABL = abl === '' ? '' : +abl;
      { const rb = $('[data-rotaval][aria-pressed="true"]'); base.Rota = rb ? rb.dataset.segval : 'Sim'; }
      base['Situação'] = ($('[data-sit][aria-pressed="true"]') || {}).dataset ? $('[data-sit][aria-pressed="true"]').dataset.sit : 'Ativo';
      delete base._pending;
      const item = { type: 'loja', loja: base, logo: S.newLogo || '' };
      if (S.newLogo) { S.logos[base.IdLoja] = { path: 'local', data: S.newLogo }; }
      enqueue(item);
      toast('Loja salva.');
      return back();
    }
    case 'descartar': S.queue = S.queue.filter(q => q.qid !== d.qid); S.ver++; persist(); toast('Item descartado.'); return cur().v === 'venda' ? back() : render();
    case 'retry': { const q = S.queue.find(x => x.qid === d.qid); if (q) { q.retry = true; q.error = ''; } return sync({ full: false, quiet: false }); }
    case 'logout': return logout(false);
    case 'install': if (S.installEvt) { S.installEvt.prompt(); S.installEvt = null; } return;
    case 'saveUrl': S.apiUrl = $('#cfgUrl').value.trim(); persist(); toast('Endereço salvo.'); return sync({ full: true, quiet: false });
    case 'setupGo': {
      const u = $('#setUrl').value.trim();
      if (!/^https:\/\/script\.google(usercontent)?\.com\/.+/.test(u)) { $('#setErr').innerHTML = '<div class="alert bad">O endereço deve começar com https://script.google.com/</div>'; return; }
      S.apiUrl = u; persist();
      S.stack = [{ v: 'login', p: {} }]; render(); return loadAuditores();
    }
    case 'resetUrl': S.stack = [{ v: 'setup', p: {} }]; return render();
    case 'loginGo': return doLogin();
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'senha') doLogin();
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('store')) { e.preventDefault(); e.target.click(); }
});
document.addEventListener('input', e => {
  const id = e.target.id;
  const fd = e.target.closest && e.target.closest('.field.invalid'); if (fd) fieldErr(fd.id, '');
  if (id === 'vTicket' || id === 'pTicket') { const c = e.target.value.replace(/\D/g, '').slice(0, 6); if (c !== e.target.value) e.target.value = c; }
  if (id === 'vResp') e.target.dataset.auto = '';
  if (id === 'busca') { S.ui.busca = e.target.value; debounceRender(); }
  if (id === 'hBusca') { S.ui.histBusca = e.target.value; debounceRender(); }
});
document.addEventListener('change', e => {
  const id = e.target.id;
  const fd = e.target.closest && e.target.closest('.field.invalid'); if (fd) fieldErr(fd.id, '');
  if (id === 'refDate') { S.ui.ref = e.target.value && e.target.value !== ontem() ? e.target.value : ''; render(); }
  if (id === 'fPiso') { S.ui.piso = e.target.value; persist(); render(); }
  if (id === 'fOrdem') { S.ui.ordem = e.target.value; persist(); render(); }
  if (id === 'fAtraso') { S.ui.atrasoDias = +e.target.value; render(); }
  if (e.target.dataset && e.target.dataset.rotachk) { S.rotaEdit[e.target.dataset.rotachk] = e.target.checked ? 'Sim' : 'Não'; const n = $('#rotaCount'); if (n) n.textContent = rotaConfigResumo(); }
  if (id === 'hAud') { S.ui.histAud = e.target.value; render(); }
});
let drT = null;
function debounceRender() { clearTimeout(drT); drT = setTimeout(render, 180); }

window.addEventListener('online', () => { updateChrome(); sync({ full: true }); });
window.addEventListener('offline', updateChrome);
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); S.installEvt = e; });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  checkUpdate();
  if (S.user && Date.now() - S.lastSync > 5 * 60e3) sync({ full: true });
});
setInterval(() => { if (S.user && S.queue.length) sync({ full: false }); }, 60e3);

/* ============================ Início ============================ */
(async function start() {
  aplicarTema(temaAtual());
  try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => aplicarTema(temaAtual())); } catch (e) { /* navegador antigo */ }
  setTimeout(() => { const sp = document.getElementById('splash'); if (sp) { sp.classList.add('out'); setTimeout(() => sp.remove(), 450); } }, 350);
  if (!DEMO && 'serviceWorker' in navigator && location.protocol === 'https:') {
    try { navigator.serviceWorker.register('sw.js'); } catch (e) { /* sem modo offline */ }
  }
  let st = null;
  try { st = await KV.get('state'); } catch (e) { /* vazio */ }
  try { S.logos = (await KV.get('logos')) || {}; } catch (e) { /* vazio */ }
  try { S.fotos = (await KV.get('fotos')) || {}; } catch (e) { /* vazio */ }
  checkUpdate();
  if (st) {
    S.apiUrl = st.apiUrl || '';
    S.user = st.user || null;
    S.data = st.data || null;
    S.queue = st.queue || [];
    S.lastSync = st.lastSync || 0;
    Object.assign(S.ui, st.ui || {});
  }
  if (CFG.apiUrl) S.apiUrl = CFG.apiUrl;
  rebuildFromData();
  if (!DEMO && !S.apiUrl) { S.stack = [{ v: 'setup', p: {} }]; return render(); }
  if (!S.user) { S.stack = [{ v: 'login', p: {} }]; render(); return loadAuditores(); }
  S.stack = [{ v: 'rota', p: {} }];
  render();
  sync({ full: true });
})();
