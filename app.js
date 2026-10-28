/* Auditoria de Vendas — app (PWA). Sem dependências externas. */
'use strict';

const CFG = window.APP_CONFIG || {};
const DEMO = typeof window.DEMO_API === 'function';
const APP_VERSION = '1.1.0';
const MIN_SERVER = '1.1.0';

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
let histOk = true;
function cur() { return S.stack[S.stack.length - 1]; }
function go(v, p = {}) {
  S.stack.push({ v, p });
  try { history.pushState({ d: S.stack.length }, ''); } catch (e) { histOk = false; }
  render(); window.scrollTo(0, 0);
}
function replace(v, p = {}) { S.stack[S.stack.length - 1] = { v, p }; render(); window.scrollTo(0, 0); }
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
    ${S.serverOld ? '<div class="demo-banner gutter">O código da planilha (Code.gs) está desatualizado. Atualize o Apps Script para a versão ' + MIN_SERVER + '.</div>' : ''}
    <div class="top-row gutter">
      ${backBtn ? `<button class="icon-btn" data-act="back" aria-label="Voltar">${ICON.back}</button>` : ''}
      <h1>${esc(title)}${sub ? `<span class="sub">${esc(sub)}</span>` : ''}</h1>
      ${actions}
      <button class="icon-btn${syncCls}" data-act="sync" id="syncBtn" aria-label="Sincronizar" title="${offline ? 'Sem internet' : 'Sincronizar'}">${offline ? ICON.cloudOff : ICON.sync}${pend ? `<span class="sync-dot">${pend}</span>` : ''}</button>
    </div>${search}</div></header>`;
}

function navbar(active) {
  const it = [['lojas', 'Lojas', ICON.store], ['historico', 'Histórico', ICON.hist], ['painel', 'Painel', ICON.chart], ['mais', 'Conta', ICON.user]];
  return `<nav class="nav">${it.map(([k, l, i]) => `<button data-tab="${k}" ${active === k ? 'aria-current="page"' : ''}>${i}<span>${l}</span></button>`).join('')}</nav>`;
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
  const pisos = Array.from(new Set(lojasAll().map(l => l.Piso).filter(Boolean))).sort();
  let list = infos.filter(x => {
    if (S.ui.piso && x.l.Piso !== S.ui.piso) return false;
    if (S.ui.filtro === 'pendentes' && (x.i.kind === 'ok' || x.i.kind === 'pend')) return false;
    if (S.ui.filtro === 'lancadas' && !(x.i.kind === 'ok' || x.i.kind === 'pend')) return false;
    if (busca && !norm(x.l.NomeFantasia + ' ' + x.l.Luc + ' ' + x.l.Segmento + ' ' + x.l.Categoria + ' ' + x.l.Contrato).includes(busca)) return false;
    return true;
  });
  const ord = S.ui.ordem;
  list.sort((a, b) => {
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
      <div class="card today">
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
        <select class="chip" id="fPiso" aria-label="Piso"><option value="">Todos os pisos</option>${pisos.map(p => `<option ${S.ui.piso === p ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select>
        <select class="chip" id="fOrdem" aria-label="Ordenar">
          ${[['luc', 'Ordem: LUC'], ['nome', 'Ordem: Nome'], ['coleta', 'Coleta mais antiga'], ['dias', 'Menos dias lançados']].map(([k, l]) => `<option value="${k}" ${ord === k ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
        <button class="chip" data-act="toggleInativas" aria-pressed="${S.ui.inativas}">Mostrar inativas</button>
      </div>
    </div>
    <div class="list">
      ${list.length ? list.map(({ l, i }) => `
      <div class="store" role="button" tabindex="0" data-loja="${esc(l.IdLoja)}">
        ${avatar(l)}
        <div class="store-main">
          <div class="store-name">${esc(l.NomeFantasia)}${l['Situação'] === 'Inativo' ? ' <span class="badge">inativa</span>' : ''}</div>
          <div class="store-meta">LUC ${esc(l.Luc)} · ${esc(l.Piso || '—')} · ${esc(l.Segmento || l.Categoria || '')}</div>
          <div class="store-prog num"><span class="bar"><i style="width:${Math.round(i.dias / i.total * 100)}%"></i></span>${i.dias}/${i.total} dias · ${i.ultima ? 'coleta ' + esc(dShort(i.ultima) + ' ' + i.ultima.slice(11, 16)) : 'sem coleta'}</div>
        </div>
        <div class="store-side">
          ${statusPill(i.kind)}
          ${i.kind === 'ok' || i.kind === 'pend' ? '' : `<button class="quick" data-registrar="${esc(l.IdLoja)}" data-data="${ref}">+ Venda</button>`}
        </div>
      </div>`).join('') : `<div class="empty">${ICON.store}<div>Nenhuma loja encontrada.</div></div>`}
    </div>
  </div></main>
  <button class="fab" data-registrar="" data-data="${ref}">${ICON.plus}Registrar venda</button>
  ${navbar('lojas')}`;
  return { html };
};

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
          <input class="input num" id="vTicket" type="number" inputmode="numeric" min="0" step="1" value="${editing ? esc(editing.ticket) : ''}" placeholder="0">
          <button type="button" data-step="-1" aria-label="Diminuir">−</button>
          <button type="button" data-step="1" aria-label="Aumentar">+</button>
        </div>
        <div class="hint" id="tmHint"></div>
      </div>
      <div class="field" id="fdResp">
        <label for="vResp">Responsável<span class="req">*</span></label>
        <input class="input" id="vResp" autocomplete="off" autocapitalize="words" value="${esc(editing ? editing.resp : '')}" placeholder="Nome de quem informou">
        <div class="sugs" id="respSugs"></div>
      </div>
      <div class="field" id="fdSig">
        <span class="label">Assinatura${editing ? '' : '<span class="req" style="color:var(--brand)"> *</span>'}</span>
        ${editing ? '<div class="hint">Deixe em branco para manter a assinatura já registrada.</div>' : ''}
        <div class="sig-wrap"><canvas id="sig"></canvas><div class="sig-ph">Assine aqui</div><button type="button" class="clear" data-act="sigClear">Limpar</button></div>
      </div>
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
      fV.addEventListener('input', () => {
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
        const resps = (S.data && S.data.responsaveis[lj]) || [];
        const sug = Array.from(new Set(resps.concat([S.user.nome]))).slice(0, 7);
        $('#respSugs').innerHTML = sug.map(n => `<button type="button" data-resp="${esc(n)}">${esc(n)}</button>`).join('');
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
  const c = cur().p;
  const editing = c.edit ? merged().byId.get(c.edit) : null;
  const data = $('#vData').value, loja = $('#vLoja').value, cents = S.getCents(), ticket = $('#vTicket').value, resp = $('#vResp').value.trim();
  let ok = true;
  const chk = (id, cond, msg) => { fieldErr(id, cond ? '' : msg); if (!cond) ok = false; };
  chk('fdData', data && data <= today(), 'Informe uma data até hoje.');
  chk('fdLoja', !!loja, 'Selecione a loja.');
  chk('fdVendas', cents != null, 'Informe o valor das vendas.');
  chk('fdTicket', ticket !== '' && +ticket >= 0 && Number.isInteger(+ticket), 'Informe a quantidade de tickets.');
  chk('fdResp', !!resp, 'Informe o responsável.');
  chk('fdSig', editing || S.sigPad.hasInk(), 'Peça a assinatura do responsável.');
  const ex = loja && data ? merged().byLojaData.get(loja + '|' + data) : null;
  if (ex && (!editing || ex.id !== editing.id)) { ok = false; toast('Já existe lançamento desta loja nesta data.'); }
  if (!ok) { const f = $('.field.invalid'); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
  const venda = { VendaId: editing ? editing.id : uid(), Data: data, Loja: loja, Vendas: cents / 100, Ticket: +ticket, Responsavel: resp, HoraRegistro: new Date().toISOString() };
  const assinatura = S.sigPad.hasInk() ? S.sigPad.toDataURL() : '';
  // se já havia na fila uma versão não enviada, substitui
  const prev = S.queue.find(q => q.type === 'venda' && q.venda.VendaId === venda.VendaId);
  if (prev) S.queue = S.queue.filter(q => q !== prev);
  enqueue({ type: 'venda', venda, assinatura: assinatura || (prev && prev.assinatura) || '', hora: prev ? prev.hora : nowStr() });
  toast(navigator.onLine || DEMO ? 'Venda salva. Enviando para a planilha…' : 'Venda salva no aparelho. Será enviada quando houver internet.');
  back();
}

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
  const t = S.ui.histTab;
  const segs = `<div class="seg" role="group">${[['vendas', 'Vendas'], ['solic', 'Solicitações'], ['motivos', 'Motivos'], ['acessos', 'Acessos']].map(([k, l]) => `<button data-htab="${k}" aria-pressed="${t === k}">${l}</button>`).join('')}</div>`;
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
  } else {
    const ac = (S.data && S.data.acessos) || [];
    body = `<div class="section"><div class="list">${ac.map(a => `<div class="row"><div><div class="t">${esc(a.auditor)}</div><div class="s">${esc(dtBR(a.data))}</div></div><div class="v"><span class="status ${a.tipo === 'Login' ? 'st-ok' : 'st-mot'}">${a.tipo === 'Login' ? 'Entrou' : 'Saiu'}</span></div></div>`).join('') || '<div class="empty">Sem registros.</div>'}</div></div>`;
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
          <input class="input num" id="pTicket" type="number" inputmode="numeric" min="0" value="${esc(v.ticket)}"></div>
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
    if (tk === '' || +tk < 0) { fieldErr('fdPTicket', 'Informe o ticket.'); return; }
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
  if (!d) return { html: topbar({ title: 'Painel' }) + '<main><div class="loading">Carregando…</div></main>' + navbar('painel') };
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
      ${isAtual ? '<div class="muted" style="font-size:12.5px">Dados da última sincronização' + (S.lastSync ? ' (' + new Date(S.lastSync).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ')' : '') + '. Lançamentos ainda na fila entram após o envio.</div>' : ''}
    </div>
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
        <span class="avatar" style="border-radius:50%;background:hsl(${hueOf(S.user.nome)} 42% 38%)">${esc(initials(S.user.nome))}</span>
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
    ${isMaster() ? `<div class="gutter section">
      <h3 class="h2">Lojas</h3>
      <button class="btn" style="width:100%" data-act="novaLoja">${ICON.plus}Cadastrar nova loja</button>
    </div>` : ''}
    ${S.installEvt ? `<div class="gutter section"><h3 class="h2">Aplicativo</h3><button class="btn primary" style="width:100%" data-act="install">Instalar na tela inicial</button></div>` : ''}
    <div class="gutter section">
      <h3 class="h2">Servidor</h3>
      <div class="card" style="padding:16px;display:grid;gap:10px">
        ${DEMO ? '<div class="muted">Modo demonstração: os dados ficam só nesta página.</div>' : `
        <div class="field"><label for="cfgUrl">Endereço do App da Web (Apps Script)</label>
        <input class="input" id="cfgUrl" value="${esc(S.apiUrl)}" style="font-size:13px" ${CFG.apiUrl ? 'readonly' : ''}></div>
        ${CFG.apiUrl ? '<div class="hint muted" style="font-size:12.5px">Definido no arquivo config.js.</div>' : '<button class="btn" data-act="saveUrl">Salvar endereço</button>'}`}
        <div class="muted" style="font-size:12.5px">Versão ${APP_VERSION}${S.data && S.data.version ? ' · servidor ' + esc(S.data.version) : ''}</div>
      </div>
    </div>
  </div></main>
  ${navbar('mais')}`;
  return { html };
};

/* ---------- Login e configuração ---------- */
VIEWS.setup = () => ({
  html: `<main><div class="login gutter">
    <div class="brand-mark"><span class="logo">${ICON.mall}</span><h1>Auditoria de Vendas</h1><div class="muted">Primeiro acesso neste aparelho</div></div>
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
      <div class="brand-mark"><span class="logo">${ICON.mall}</span><h1>Auditoria de Vendas</h1><div class="muted">${esc(CFG.nomeShopping || '')}</div></div>
      <div class="field"><span class="label">Quem está usando?</span>
        <div class="who">${auds.length ? auds.map(a => `<button data-who="${esc(a.nome)}" aria-pressed="${sel === a.nome}"><span class="avatar" style="background:hsl(${hueOf(a.nome)} 42% 38%)">${esc(initials(a.nome))}</span>${esc(a.nome)}</button>`).join('') : '<div class="loading">Carregando auditores…</div>'}</div></div>
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
    S.stack = [{ v: 'lojas', p: {} }];
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
  const fn = VIEWS[c.v] || VIEWS.lojas;
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
let refreshT = null;
function refresh(soft) {
  if (current && current.form) { updateChrome(); return; }
  clearTimeout(refreshT);
  refreshT = setTimeout(() => {
    const y = window.scrollY; render(); if (soft || true) window.scrollTo(0, y);
  }, soft ? 250 : 0);
}
function updateChrome() {
  const b = $('#syncBtn'); if (!b) return;
  const offline = !DEMO && !navigator.onLine;
  b.classList.toggle('spin', S.syncing);
  b.innerHTML = (offline ? ICON.cloudOff : ICON.sync) + (S.queue.length ? `<span class="sync-dot">${S.queue.length}</span>` : '');
}

/* ============================ Eventos ============================ */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act],[data-solic],[data-ptipo],[data-tab],[data-loja],[data-registrar],[data-venda],[data-filtro],[data-htab],[data-rank],[data-resp],[data-mot],[data-step],[data-who],[data-sit]');
  if (!t || t.disabled) return;
  const d = t.dataset;
  if (d.tab) return tab(d.tab);
  if (d.solic) return go('solic', { id: d.solic });
  if (d.ptipo) { $$('[data-ptipo]').forEach(b => b.setAttribute('aria-pressed', b === t)); $('#pCampos').hidden = d.ptipo === 'Exclusão'; return; }
  if (d.registrar !== undefined) { e.stopPropagation(); return go('registrar', { loja: d.registrar, data: d.data || ontem() }); }
  if (d.venda) return go('venda', { id: d.venda });
  if (d.loja) return go('loja', { id: d.loja, mes: d.lojames || '' });
  if (d.filtro) { S.ui.filtro = d.filtro; persist(); return render(); }
  if (d.htab) { S.ui.histTab = d.htab; return render(); }
  if (d.rank) { S.ui.rankBy = d.rank; return refresh(); }
  if (d.resp) { $('#vResp').value = d.resp; fieldErr('fdResp', ''); return; }
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
  if (id === 'busca') { S.ui.busca = e.target.value; debounceRender(); }
  if (id === 'hBusca') { S.ui.histBusca = e.target.value; debounceRender(); }
});
document.addEventListener('change', e => {
  const id = e.target.id;
  const fd = e.target.closest && e.target.closest('.field.invalid'); if (fd) fieldErr(fd.id, '');
  if (id === 'refDate') { S.ui.ref = e.target.value && e.target.value !== ontem() ? e.target.value : ''; render(); }
  if (id === 'fPiso') { S.ui.piso = e.target.value; persist(); render(); }
  if (id === 'fOrdem') { S.ui.ordem = e.target.value; persist(); render(); }
  if (id === 'hAud') { S.ui.histAud = e.target.value; render(); }
});
let drT = null;
function debounceRender() { clearTimeout(drT); drT = setTimeout(render, 180); }

window.addEventListener('online', () => { updateChrome(); sync({ full: true }); });
window.addEventListener('offline', updateChrome);
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); S.installEvt = e; });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && S.user && Date.now() - S.lastSync > 5 * 60e3) sync({ full: true }); });
setInterval(() => { if (S.user && S.queue.length) sync({ full: false }); }, 60e3);

/* ============================ Início ============================ */
(async function start() {
  if (!DEMO && 'serviceWorker' in navigator && location.protocol === 'https:') {
    try { navigator.serviceWorker.register('sw.js'); } catch (e) { /* sem modo offline */ }
  }
  let st = null;
  try { st = await KV.get('state'); } catch (e) { /* vazio */ }
  try { S.logos = (await KV.get('logos')) || {}; } catch (e) { /* vazio */ }
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
  S.stack = [{ v: 'lojas', p: {} }];
  render();
  sync({ full: true });
})();
