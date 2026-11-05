/* Auditoria de Vendas — app (PWA). Sem dependências externas. */
'use strict';

const CFG = window.APP_CONFIG || {};
const DEMO = typeof window.DEMO_API === 'function';
const APP_VERSION = '1.5.0';
const MIN_SERVER = '1.5.0';

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
const isConsulta = () => !!(S.user && S.user.perfil === 'Consulta');
const veAnalises = () => isMaster() || isConsulta();
const inicioPerfil = () => isConsulta() ? 'painel' : 'rota';
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
  Vendas: 'vendas', Ticket: 'ticket', Responsavel: 'resp', Assinatura: 'assin', Email: 'email',
  Vendas1: 'v1', Vendas2: 'v2', Vendas3: 'v3'
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
        v1: q.venda.Vendas1 != null ? +q.venda.Vendas1 : base.v1, v2: q.venda.Vendas2 != null ? +q.venda.Vendas2 : base.v2, v3: q.venda.Vendas3 != null ? +q.venda.Vendas3 : base.v3,
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
    if (veAnalises()) loadAnal();
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
  // busca logos novos; os que não foram encontrados são tentados de novo a cada 30 min
  const falta = lojasAll().filter(l => { const g = S.logos[l.IdLoja]; return l.Logo && (!g || g.path !== l.Logo || (!g.data && Date.now() - (g.at || 0) > 30 * 60e3)); }).map(l => l.IdLoja);
  if (!falta.length) return;
  logosBusy = true;
  try {
    for (let i = 0; i < falta.length; i += 10) {
      const r = await api('logos', { ids: falta.slice(i, i + 10) });
      Object.keys(r.logos).forEach(id => { S.logos[id] = Object.assign({}, r.logos[id], { at: Date.now() }); });
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
const SELO = (c, s = 4) => `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="34" fill="none" stroke="${c}" stroke-width="${s}"/><path d="M32 55 Q39 47 46 46.5 Q50 46.3 51.5 43 Q54 37 55 29 Q56 23 58.5 23 Q61 23 61 29 Q61 45 63 54 Q63.7 57.2 64.3 59.1" fill="none" stroke="${c}" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"/><path d="M29 67 Q47 56 71 60" fill="none" stroke="${c}" stroke-width="${s}" stroke-linecap="round"/></svg>`;
const SHOP_LOGO = window.SHOP_LOGO || 'icons/shopping-logo.png';

function temaAtual() { try { return localStorage.getItem('tema') || 'auto'; } catch (e) { return S.temaMem || 'auto'; } }
function aplicarTema(t) {
  const root = document.documentElement;
  if (t === 'light' || t === 'dark') root.setAttribute('data-theme', t); else root.removeAttribute('data-theme');
  const escuro = t === 'dark' || (t !== 'light' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', escuro ? '#11392f' : '#17705c');
}
function setTema(t) { S.temaMem = t; try { if (t === 'auto') localStorage.removeItem('tema'); else localStorage.setItem('tema', t); } catch (e) { /* só nesta sessão */ } aplicarTema(t); }

const CFG_PADRAO = { rota_dias: 30, pts_prazo: 10, pts_atraso_curto: 5, pts_atraso_longo: 2, pts_motivo: 3, pts_correcao: -5, pts_exclusao: -10, pts_sequencia: 5, pts_conquista: 20, desafio_titulo: '', desafio_tipo: 'prazo', desafio_meta: 90, desafio_ate: '',
  div_limite: 5, mapa_vendas_verm: 30000, mapa_vendas_verde: 80000, mapa_m2_verm: 600, mapa_m2_verde: 1500, mapa_cresc_verm: 0, mapa_cresc_verde: 10, mapa_div_verde: 2, mapa_div_verm: 5 };
const cfg = k => (S.data && S.data.config && k in S.data.config) ? S.data.config[k] : CFG_PADRAO[k];
/* Quantos dias para trás contam como atraso (config do master), limitado aos dados guardados no aparelho */
function janelaAtraso() {
  let n = Math.max(1, Math.min(60, Math.round(+cfg('rota_dias') || 30)));
  if (S.data && S.data.corte) n = Math.min(n, diasEntre(today(), S.data.corte));
  return Math.max(1, n);
}
/* Lojas eventuais (Mercado Produtor, eventos…): só são esperadas dentro do período definido pelo master */
const ehEventual = l => !!l && l.Operacao === 'Eventual';
function lojaEsperada(l, dia) {
  if (!l || l['Situação'] === 'Inativo') return false;
  if (!ehEventual(l)) return true;
  return !!l.Inicio && dia >= l.Inicio && (!l.Fim || dia <= l.Fim);
}
function periodoTxt(l) {
  if (!ehEventual(l)) return '';
  if (!l.Inicio) return 'sem período definido';
  return 'opera ' + (l.Fim ? `de ${dShort(l.Inicio)} a ${dShort(l.Fim)}` : `desde ${dShort(l.Inicio)}`);
}
/* eventual entra na rota se o período cruza a janela de atrasos */
const naRota = l => {
  if (!l || l['Situação'] === 'Inativo' || l.Rota === 'Não') return false;
  if (!ehEventual(l)) return true;
  if (!l.Inicio || l.Inicio > ontem()) return false;
  return !l.Fim || l.Fim >= addDias(ontem(), -janelaAtraso());
};
const lojasRota = () => lojasAll().filter(naRota);
function diasEsperadosNoMes(l, mes) {
  if (!l || l['Situação'] === 'Inativo') return 0;
  const nd = daysIn(mes);
  if (!ehEventual(l)) return nd;
  let n = 0; for (let i = 1; i <= nd; i++) if (lojaEsperada(l, mes + '-' + pad(i))) n++;
  return n;
}
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
  const l = lojaById(lojaId);
  const out = [];
  const d = new Date();
  for (let i = 1; i <= n; i++) {
    d.setDate(d.getDate() - 1);
    const k = ymdOf(d);
    if (lojaEsperada(l, k) && !M.byLojaData.has(lojaId + '|' + k) && !mot.has(k)) out.push(k);
  }
  return out.sort();   // mais antigo primeiro
}
function lojasAtivas() { return lojasAll().filter(l => l['Situação'] !== 'Inativo'); }
function proximaPendente(lojaId, data, modo) {
  if (modo !== 'dia') {
    // rota / atrasadas: termina os dias da mesma loja e segue para a próxima loja da rota
    const n = modo === 'atrasadas' && S.ui.atrasoDias ? Math.min(S.ui.atrasoDias, janelaAtraso()) : janelaAtraso();
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
  const it = isConsulta() ? [['painel', 'Painel', ICON.chart], ['lojas', 'Lojas', ICON.store], ['mais', 'Conta', ICON.user]]
    : [['rota', 'Rota', ICON.route], ['lojas', 'Lojas', ICON.store], ['historico', 'Histórico', ICON.hist]].concat(isMaster() ? [['painel', 'Painel', ICON.chart]] : []).concat([['mais', 'Conta', ICON.user]]);
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
  const visiveis = lojasAll().filter(l => (isMaster() && S.ui.inativas) || l['Situação'] !== 'Inativo');
  const eventuais = visiveis.filter(ehEventual);
  const modoEv = S.ui.filtro === 'eventuais';
  // eventual fora do período não aparece nas listas do dia (só no filtro "Eventuais")
  const ativas = visiveis.filter(l => !ehEventual(l) || lojaEsperada(l, ref));
  const nAtr = S.ui.atrasoDias ? Math.min(S.ui.atrasoDias, janelaAtraso()) : janelaAtraso();
  const mk = l => ({ l, i: lojaInfo(l, ref), atr: naRota(l) ? diasAtrasados(l.IdLoja, nAtr) : [] });
  const infosAtivas = ativas.map(mk);
  const infos = modoEv ? eventuais.map(mk) : infosAtivas;
  const lanc = infosAtivas.filter(x => x.i.kind === 'ok' || x.i.kind === 'pend').length;
  const atrLojas = infosAtivas.filter(x => x.atr.length).length;
  const atrDias = infosAtivas.reduce((s, x) => s + x.atr.length, 0);
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
    if (modoEv) return (lojaEsperada(b.l, ref) - lojaEsperada(a.l, ref)) || a.l.NomeFantasia.localeCompare(b.l.NomeFantasia, 'pt-BR');
    if (ord === 'nome') return a.l.NomeFantasia.localeCompare(b.l.NomeFantasia, 'pt-BR');
    if (ord === 'coleta') return (a.i.ultima || '').localeCompare(b.i.ultima || '');
    if (ord === 'dias') return a.i.dias - b.i.dias || a.l.NomeFantasia.localeCompare(b.l.NomeFantasia, 'pt-BR');
    return String(a.l.Luc).localeCompare(String(b.l.Luc), 'pt-BR', { numeric: true });
  });
  const pct = ativas.length ? Math.round(lanc / ativas.length * 100) : 0;
  const pendCount = ativas.length - lanc;

  const search = S.ui.buscaAberta || S.ui.busca ? `<div class="search gutter"><input id="busca" type="search" placeholder="Buscar por nome, LUC, segmento…" value="${esc(S.ui.busca)}" autocomplete="off"></div>` : '';
  const html = `
  ${topbar({ title: 'Lojas', sub: CFG.nomeShopping || '', actions: `${isMaster() ? `<button class="icon-btn" data-act="novaLoja" aria-label="Cadastrar nova loja" title="Cadastrar nova loja">${ICON.plus}</button>` : ''}<button class="icon-btn" data-act="toggleBusca" aria-label="Buscar">${ICON.search}</button>`, search })}
  <main><div class="wrap">
    <div class="gutter section" style="display:grid;gap:10px">
      ${solPend ? `<button class="alert warn" data-act="verSolic" style="border:0;text-align:left;width:100%"><div><b>${solPend} solicitaç${solPend > 1 ? 'ões' : 'ão'} de alteração</b> aguardando sua aprovação. Toque para ver.</div></button>` : ''}
      ${modoAtr ? `<div class="alert ${atrDias ? 'warn' : 'ok'}"><div>${atrDias ? `<b>${atrLojas} loja${atrLojas > 1 ? 's' : ''}</b> com dias sem lançamento nos últimos ${nAtr} dias (${atrDias} dia${atrDias > 1 ? 's' : ''} no total). Toque em <b>+ Lançar</b> para começar pelo dia mais antigo; depois de salvar, o app leva ao próximo.` : `Nenhuma loja com dias em atraso nos últimos ${nAtr} dias.`}</div></div>` : ''}
      ${modoEv ? `<div class="alert warn"><div><b>Lojas eventuais</b> (Mercado Produtor, eventos, feiras): só contam como pendentes dentro do período em que operam${isMaster() ? '. Defina o início e o fim na tela de cada loja' : ''}. Aqui dá para lançar a venda de qualquer dia em que ela abriu.</div></div>` : ''}
      <div class="card today" ${modoAtr || modoEv ? 'hidden' : ''}>
        <div class="today-head">
          <div class="today-big num">${lanc}<small> de ${ativas.length} lojas lançadas</small></div>
          <label class="date-chip">${ICON.cal.replace('<svg', '<svg width="16" height="16"')}${esc(refLabel)}<input type="date" id="refDate" value="${ref}" max="${today()}" aria-label="Data de referência"></label>
        </div>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <div class="muted" style="font-size:13px">Vendas de ${esc(diaLongo(ref))}. ${pendCount ? pendCount + ' loja' + (pendCount > 1 ? 's' : '') + ' sem lançamento.' : 'Todas as lojas lançadas.'}</div>
      </div>
      <div class="chips" role="group" aria-label="Filtros">
        ${isMaster() ? `<button class="chip" data-act="novaLoja" style="border-color:var(--brand);color:var(--brand)">+ Nova loja</button>` : ''}
        <button class="chip" data-filtro="todas" aria-pressed="${S.ui.filtro === 'todas'}">Todas<b>${ativas.length}</b></button>
        <button class="chip" data-filtro="pendentes" aria-pressed="${S.ui.filtro === 'pendentes'}">Pendentes<b>${pendCount}</b></button>
        <button class="chip" data-filtro="lancadas" aria-pressed="${S.ui.filtro === 'lancadas'}">Lançadas<b>${lanc}</b></button>
        <button class="chip" data-filtro="atrasadas" aria-pressed="${modoAtr}">Atrasadas<b>${atrLojas}</b></button>
        ${eventuais.length ? `<button class="chip" data-filtro="eventuais" aria-pressed="${modoEv}">Eventuais<b>${eventuais.length}</b></button>` : ''}
        ${modoAtr ? `<select class="chip" id="fAtraso" aria-label="Período">${Array.from(new Set([7, 15, 30, 60, nAtr])).filter(n => n <= janelaAtraso() || n === nAtr).sort((a, b) => a - b).map(n => `<option value="${n}" ${nAtr === n ? 'selected' : ''}>Últimos ${n} dias</option>`).join('')}</select>` : ''}
        <select class="chip" id="fPiso" aria-label="Piso"><option value="">Todos os pisos</option>${pisos.map(p => `<option ${S.ui.piso === p ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select>
        <select class="chip" id="fOrdem" aria-label="Ordenar">
          ${[['luc', 'Ordem: LUC'], ['nome', 'Ordem: Nome'], ['coleta', 'Coleta mais antiga'], ['dias', 'Menos dias lançados']].map(([k, l]) => `<option value="${k}" ${ord === k ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
        ${isMaster() ? `<button class="chip" data-act="toggleInativas" aria-pressed="${S.ui.inativas}">Mostrar inativas</button>` : ''}
      </div>
    </div>
    <div class="list">
      ${list.length ? list.map((x) => { const { l, i } = x; return `
      <div class="store" role="button" tabindex="0" data-loja="${esc(l.IdLoja)}">
        ${avatar(l)}
        <div class="store-main">
          <div class="store-name">${esc(l.NomeFantasia)}${l['Situação'] === 'Inativo' ? ' <span class="badge">inativa</span>' : l.Rota === 'Não' ? ' <span class="badge" style="background:var(--soft);color:var(--muted)">fora da rota</span>' : ''}</div>
          <div class="store-meta">${ehEventual(l) ? `<b style="color:var(--warn)">Eventual</b> · ${esc(periodoTxt(l))}` : `LUC ${esc(l.Luc)} · ${esc(l.Piso || '—')} · ${esc(l.Segmento || l.Categoria || '')}`}</div>
          <div class="store-prog num"><span class="bar"><i style="width:${Math.round(i.dias / i.total * 100)}%"></i></span>${i.dias}/${i.total} dias · ${i.ultima ? 'coleta ' + esc(dShort(i.ultima) + ' ' + i.ultima.slice(11, 16)) : 'sem coleta'}</div>
        </div>
        <div class="store-side">
          ${modoAtr ? `<span class="status st-no">Faltam ${x.atr.length}</span>${isConsulta() ? '' : `<button class="quick" data-registrar="${esc(l.IdLoja)}" data-data="${x.atr[0]}" data-modo="atrasadas">+ Lançar ${dShort(x.atr[0])}</button>`}`
            : modoEv && !lojaEsperada(l, ref) ? `<span class="status" style="background:var(--soft);color:var(--muted)">Fora do período</span>${isConsulta() ? '' : `<button class="quick" data-registrar="${esc(l.IdLoja)}" data-data="${ref}" data-modo="dia">+ Venda</button>`}`
            : `${statusPill(i.kind)}${i.kind === 'ok' || i.kind === 'pend' || isConsulta() ? '' : `<button class="quick" data-registrar="${esc(l.IdLoja)}" data-data="${ref}" data-modo="dia">+ Venda</button>`}`}
        </div>
      </div>`; }).join('') : `<div class="empty">${ICON.store}<div>${modoAtr ? 'Nenhuma loja em atraso.' : modoEv ? 'Nenhuma loja eventual.' : 'Nenhuma loja encontrada.'}</div></div>`}
    </div>
  </div></main>
  ${isConsulta() ? '' : `<button class="fab" data-registrar="" data-data="${ref}" data-modo="dia">${ICON.plus}Registrar venda</button>`}
  ${navbar('lojas')}`;
  return { html };
};

/* ---------- Minha rota de hoje ---------- */
VIEWS.rota = () => {
  if (isConsulta()) return VIEWS.painel();
  const ontemD = ontem();
  const rl = lojasRota().sort(ordemRota);
  const jan = janelaAtraso();
  const itens = rl.map(l => ({ l, d: diasAtrasados(l.IdLoja, jan) }));
  const pend = itens.filter(x => x.d.length);
  const itOntem = itens.filter(x => lojaEsperada(x.l, ontemD));
  const ontemFeitas = itOntem.filter(x => !x.d.includes(ontemD)).length;
  const totOntem = itOntem.length;
  const nEv = lojasAtivas().filter(ehEventual).length;
  const atrasos = itens.reduce((s, x) => s + x.d.filter(k => k !== ontemD).length, 0);
  const pct = totOntem ? Math.round(ontemFeitas / totOntem * 100) : 0;
  const prox = pend[0];
  const fora = lojasAtivas().filter(l => !ehEventual(l) && l.Rota === 'Não').length;
  const porPiso = {};
  pend.forEach(x => { const p = x.l.Piso || 'Sem piso'; (porPiso[p] = porPiso[p] || []).push(x); });
  const chipDias = ds => {
    const o = ds.includes(ontemD) ? '<span class="status st-no">Ontem</span>' : '';
    const outros = ds.filter(k => k !== ontemD);
    return `<span class="status st-mot">Faltam ${ds.length} dia${ds.length > 1 ? 's' : ''}</span>` + o +
      (outros.length ? `<span class="muted" style="font-size:12px;align-self:center">${outros.length === 1 ? 'atraso: ' + dShort(outros[0]) : 'mais antigo: ' + dShort(outros[0])}</span>` : '');
  };
  const html = `
  ${topbar({ title: 'Minha rota de hoje', sub: diaLongo(today()).replace(/^./, c => c.toUpperCase()) })}
  <main><div class="wrap">
    <div class="gutter section" style="display:grid;gap:12px">
      ${isMaster() && solicAll().some(x => x.Status === 'Pendente') ? `<button class="alert warn" data-act="verSolic" style="border:0;text-align:left;width:100%"><div><b>Há solicitações de alteração</b> aguardando sua aprovação. Toque para ver.</div></button>` : ''}
      <div class="card today">
        <div class="today-head"><div class="today-big num">${ontemFeitas}<small> de ${totOntem} lojas com a venda de ontem</small></div></div>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <div class="muted" style="font-size:13px">${atrasos ? `E mais <b>${atrasos}</b> lançamento${atrasos > 1 ? 's' : ''} em atraso nos últimos ${jan} dias.` : `Nenhum atraso nos últimos ${jan} dias.`}</div>
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
        <div class="store-side"><button class="quick" data-registrar="${esc(x.l.IdLoja)}" data-data="${x.d[0]}" data-modo="rota" title="Começa pelo dia mais antigo">+ Lançar ${dShort(x.d[0])}</button></div>
      </div>`).join('')}</div>`).join('')}
    <div class="gutter section" style="display:grid;gap:8px">
      <div class="muted" style="font-size:12.5px">A rota mostra as lojas sem a venda de ontem e as que estão com dias em atraso (últimos ${jan} dias), na ordem de piso e LUC. O botão de cada loja abre sempre o dia mais antigo que falta. Dias com motivo registrado não contam como atraso. Lojas eventuais só entram nos dias do período em que operam.${fora ? ` ${fora} loja${fora > 1 ? 's' : ''} fora da rota.` : ''}</div>
      ${nEv ? `<button class="btn" data-act="verEventuais">${ICON.store}Lojas eventuais (${nEv})</button>` : ''}
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
    <div class="field" style="margin-top:14px"><label for="rotaDias">Contar como atraso os últimos quantos dias?</label>
      <select id="rotaDias">${[7, 15, 30, 45, 60].map(n => `<option value="${n}" ${+cfg('rota_dias') === n ? 'selected' : ''}>${n} dias</option>`).join('')}</select>
      <div class="hint">Vale para a rota de todos os auditores e para o filtro "Atrasadas".</div></div>
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
  const dias = +$('#rotaDias').value;
  const mudouDias = dias !== +cfg('rota_dias');
  if (!Object.keys(mud).length && !mudouDias) return back();
  if (!DEMO && !navigator.onLine) { $('#rotaErr').innerHTML = '<div class="alert bad">Alterar a rota precisa de internet.</div>'; return; }
  const btn = $('[data-act="saveRota"]'); btn.disabled = true;
  try {
    if (Object.keys(mud).length) { const r = await api('salvarRota', { mudancas: mud }); if (S.data) S.data.lojas = r.lojas; }
    if (mudouDias) { const r2 = await api('salvarConfig', { valores: { rota_dias: dias } }); if (S.data) S.data.config = r2.config; }
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
      if (rotaLs.length && rotaLs.every(l => !lojaEsperada(l, addDias(D, -1)) || coberto(l.IdLoja, addDias(D, -1), D))) { seq++; if (seq >= 3) j.itens.sequencia++; } else seq = 0;
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
      for (let i = 1; i <= 7 && !falta; i++) { const dd = addDias(D, -i); for (const l of rotaLs) if (lojaEsperada(l, dd) && !coberto(l.IdLoja, dd, D)) { falta = true; break; } }
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
  const rotaOntem = rotaLs.filter(l => lojaEsperada(l, ontemD));
  const ontemOk = rotaOntem.filter(l => coberto(l.IdLoja, ontemD, hoje)).length;
  const atrasosAgora = rotaLs.reduce((t, l) => t + diasAtrasados(l.IdLoja, janelaAtraso()).length, 0);
  const val = { lista, totLanc, pctPrazo: totLanc ? Math.round(totPrazo / totLanc * 100) : 0, ontemOk, rotaTotal: rotaOntem.length, atrasosAgora, P };
  gameCache = { key, val };
  return val;
}

function painelAbas() {
  let a = S.ui.painelAba || 'vendas';
  if (a === 'equipe' && !isMaster()) a = 'vendas';
  return `<div class="seg" role="group" style="font-size:13px">${[['vendas', 'Auditoria'], ['com21', 'Lojista'], ['mapa', 'Mapa']].concat(isMaster() ? [['equipe', 'Equipe']] : []).map(([k, l]) => `<button data-paba="${k}" aria-pressed="${a === k}">${l}</button>`).join('')}</div>`;
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
        <div class="kpi"><span class="l">Atrasos na rota</span><span class="v num">${g.atrasosAgora}</span><span class="d muted">últimos ${janelaAtraso()} dias</span></div>
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
  const cmp = compararLoja(l, mes, todas, doMes);

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
    if (v) { cls += v._pending ? ' mot' : ' ok'; { const txt = int(v.vendas); inner += `<small class="num" style="font-size:${txt.length > 6 ? 7.5 : txt.length > 5 ? 8.5 : 9.5}px;letter-spacing:-.02em">${esc(txt)}</small>`; } act = `data-venda="${esc(v.id)}"`; }
    else if (ds > hoje) { cls += ' fut'; act = 'disabled'; }
    else if (isConsulta()) { cls += lojaEsperada(l, ds) ? ' miss' : ' off'; act = 'disabled'; }
    else if (!lojaEsperada(l, ds) && l['Situação'] !== 'Inativo') { cls += ' off'; act = `data-registrar="${esc(l.IdLoja)}" data-data="${ds}"`; }
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
        <div class="tags"><span class="tag">LUC ${esc(l.Luc)}</span><span class="tag">${esc(l.Piso)}</span><span class="tag">${esc(l.Tipo)}</span>${ehEventual(l) ? `<span class="tag">Eventual · ${esc(periodoTxt(l))}</span>` : ''}${l['Situação'] === 'Inativo' ? '<span class="tag">Inativa</span>' : ''}</div>
      </div>
    </div>
    <div class="gutter" ${isConsulta() ? 'hidden' : ''}>
      <div class="actions" style="${isMaster() ? '' : 'grid-template-columns:1.4fr 1fr'}">
        <button class="btn primary" data-registrar="${esc(l.IdLoja)}" data-data="">${ICON.dollar}Registrar venda</button>
        <button class="btn" data-act="motivo" data-id="${esc(l.IdLoja)}">${ICON.note}Motivo</button>
        ${isMaster() ? `<button class="btn" data-act="editLoja" data-id="${esc(l.IdLoja)}">${ICON.edit}Editar</button>` : ''}
      </div>
      ${isMaster() ? `<div class="card" style="margin-top:10px;padding:12px 14px;display:grid;gap:12px">
        <label style="display:flex;align-items:center;gap:12px;cursor:pointer"><span style="flex:1"><b>Loja ativa</b><br><span class="muted" style="font-size:12.5px">Inativa some da lista dos auditores, da rota e das pendências.</span></span>
          <input type="checkbox" class="switch" data-lojaflag="Situação" data-id="${esc(l.IdLoja)}" ${l['Situação'] !== 'Inativo' ? 'checked' : ''} aria-label="Loja ativa"></label>
        <label style="display:flex;align-items:center;gap:12px;cursor:pointer"><span style="flex:1"><b>Na rota diária</b><br><span class="muted" style="font-size:12.5px">Desligue se o auditor não passa nela todos os dias.</span></span>
          <input type="checkbox" class="switch" data-lojaflag="Rota" data-id="${esc(l.IdLoja)}" ${l.Rota !== 'Não' ? 'checked' : ''} ${l['Situação'] === 'Inativo' ? 'disabled' : ''} aria-label="Na rota diária"></label>
        <div style="display:grid;gap:8px"><b>Operação</b>
          <div class="seg">${['Fixa', 'Eventual'].map(o => `<button type="button" data-act="setOperacao" data-op="${o}" data-id="${esc(l.IdLoja)}" aria-pressed="${(ehEventual(l) ? 'Eventual' : 'Fixa') === o}">${o}</button>`).join('')}</div>
          ${ehEventual(l) ? `<span class="muted" style="font-size:12.5px">Eventual só conta como pendente entre o início e o fim. Sem fim = continua operando.</span>
          <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:end">
            <label class="field" style="gap:4px"><span style="font-size:12.5px;font-weight:700">Início</span><input class="input" type="date" id="opIni" value="${esc(l.Inicio || '')}" style="min-height:44px;font-size:15px;padding:8px"></label>
            <label class="field" style="gap:4px"><span style="font-size:12.5px;font-weight:700">Fim</span><input class="input" type="date" id="opFim" value="${esc(l.Fim || '')}" style="min-height:44px;font-size:15px;padding:8px"></label>
            <button class="btn primary" data-act="salvarPeriodo" data-id="${esc(l.IdLoja)}" style="min-height:44px">Salvar</button>
          </div>` : '<span class="muted" style="font-size:12.5px">Use "Eventual" para Mercado Produtor, feiras e eventos que operam só em alguns períodos.</span>'}
        </div>
      </div>` : ''}
    </div>
    <div class="gutter section">
      <div class="month-nav" style="margin-bottom:10px">
        <button class="cal-nav" data-act="lojaMes" data-mes="${addMonth(mes, -1)}" aria-label="Mês anterior">${ICON.left}</button>
        <strong>${esc(mesNome(mes))}</strong>
        <button class="cal-nav" data-act="lojaMes" data-mes="${addMonth(mes, 1)}" aria-label="Próximo mês" ${mes >= hoje.slice(0, 7) ? 'disabled' : ''}>${ICON.right}</button>
      </div>
      <div class="kpis">
        <div class="kpi wide"><span class="l">Vendas no mês</span><span class="v num">${money(tot)}</span>${cmp.d(tot, cmp.pm && cmp.pm.v, 'mês ant.')}${cmp.d(tot, cmp.ly && cmp.ly.v, 'ano ant.')}</div>
        <div class="kpi"><span class="l">Tickets</span><span class="v num">${int(tk)}</span>${cmp.d(tk, cmp.pm && cmp.pm.t, 'mês ant.')}${cmp.d(tk, cmp.ly && cmp.ly.t, 'ano ant.')}</div>
        <div class="kpi"><span class="l">Ticket médio</span><span class="v num">${tk ? money(tot / tk) : '—'}</span>${tk ? cmp.d(tot / tk, cmp.pm && cmp.pm.t ? cmp.pm.v / cmp.pm.t : null, 'mês ant.') + cmp.d(tot / tk, cmp.ly && cmp.ly.t ? cmp.ly.v / cmp.ly.t : null, 'ano ant.') : ''}</div>
        <div class="kpi"><span class="l">Venda por m²</span><span class="v num">${abl ? money(tot / abl) : '—'}</span>${abl ? cmp.d(tot / abl, cmp.pm && cmp.pm.v / abl, 'mês ant.') + cmp.d(tot / abl, cmp.ly && cmp.ly.v / abl, 'ano ant.') : ''}</div>
        <div class="kpi wide"><span class="l">Dias lançados</span><span class="v num">${new Set(doMes.map(v => v.data)).size}/${ehEventual(l) ? diasEsperadosNoMes(l, mes) || nd : nd}</span>${ehEventual(l) ? `<span class="d muted">dias esperados no período</span>` : ''}</div>
      </div>
      <div class="muted" style="font-size:12px;margin-top:8px">${esc(cmp.txt)}</div>
    </div>
    ${veAnalises() ? cardCom21Loja(l, mes) : ''}
    <div class="gutter section">
      <div class="card cal">
        <div class="cal-grid">${['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(x => `<span class="cal-dow">${x}</span>`).join('')}${cells}</div>
        <div class="legend"><span><i style="background:var(--ok-soft);border:1px solid var(--ok)"></i>Lançado</span><span><i style="border:1px dashed var(--bad)"></i>Pendente (toque para lançar)</span><span><i style="background:var(--warn-soft);border:1px solid var(--warn)"></i>Motivo / na fila</span>${ehEventual(l) ? '<span><i style="border:1px solid var(--line)"></i>Fora do período</span>' : ''}</div>
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

/* Comparação da loja com o mês anterior e o mesmo mês do ano passado.
   Mês em andamento: compara o mesmo período (dias 1 até o último dia lançado). */
function compararLoja(l, mes, todas, doMes) {
  const atual = mes === today().slice(0, 7);
  const ate = atual ? Math.max(0, ...doMes.map(v => +v.data.slice(8, 10))) || +today().slice(8, 10) : 31;
  const mensal = (S.data && S.data.mensal) || {};
  const tot = (m) => {
    const loc = todas.filter(v => v.data.startsWith(m) && +v.data.slice(8, 10) <= ate);
    const mm = mensal[m] && mensal[m][l.IdLoja];
    if (ate >= 31 && mm) return { v: mm[0], t: mm[1] };
    if (loc.length) return { v: loc.reduce((s, v) => s + (+v.vendas || 0), 0), t: loc.reduce((s, v) => s + (+v.ticket || 0), 0) };
    return null;
  };
  const pmM = addMonth(mes, -1), lyM = addMonth(mes, -12);
  const d = (x, y, lab) => {
    if (y == null || !isFinite(y) || !y) return '';
    const p = (x / y - 1) * 100;
    return `<span class="d ${p >= 0 ? 'up' : 'down'}">${p >= 0 ? '▲' : '▼'} ${Math.abs(p).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% ${lab}</span>`;
  };
  const per = m => atual ? `1–${ate} de ${MESES[+m.slice(5) - 1]}${m.slice(0, 4) !== mes.slice(0, 4) ? '/' + m.slice(0, 4) : ''}` : mesNome(m);
  return { pm: tot(pmM), ly: tot(lyM), d, txt: `Comparação: mês ant. = ${per(pmM)} · ano ant. = ${per(lyM)}.` };
}

function vendaRow(v, o = {}) {
  const loja = lojaById(v.loja);
  const nome = (loja && loja.NomeFantasia) || v.nome || v.loja;
  const t = o.semLoja ? dBR(v.data) : nome;
  if (isConsulta()) { return `<button class="row" data-venda="${esc(v.id)}"><div><div class="t">${esc(t)}</div><div class="s">${esc(o.semLoja ? diaLongo(v.data) : dBR(v.data))}</div></div><div class="v num">${money(v.vendas)}<small>${int(v.ticket)} ticket${+v.ticket === 1 ? '' : 's'}</small></div></button>`; }
  const s = o.reg ? `venda de ${dShort(v.data)} · ${audNome(v.auditor)}${v.resp ? ' · ' + v.resp : ''}`
    : o.semLoja ? `${audNome(v.auditor)}${v.resp ? ' · resp. ' + v.resp : ''}` : `${audNome(v.auditor)}${v.resp ? ' · ' + v.resp : ''}`;
  return `<button class="row" data-venda="${esc(v.id)}">
    <div><div class="t">${esc(t)}${v._pending ? (v._error ? '<span class="badge err">erro</span>' : '<span class="badge">na fila</span>') : solicPendente(v.id) ? '<span class="badge">alteração pedida</span>' : ''}</div><div class="s">${esc(s)}</div></div>
    <div class="v num">${money(v.vendas)}<small>${o.reg ? 'às ' + esc(String(v.hora || '').slice(11, 16)) : int(v.ticket) + ' ticket' + (+v.ticket === 1 ? '' : 's')}</small></div>
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
      ${[['Data', dBR(v.data)], ['Loja', loja.NomeFantasia || v.nome], ['LUC', loja.Luc]].concat(isConsulta() ? [] : [['Auditor', audNome(v.auditor)], ['Responsável', v.resp]]).concat([['Vendas', money(v.vendas)]])
    .concat(partesDe(loja).map((n, i) => ['  ' + n, v['v' + (i + 1)] === '' || v['v' + (i + 1)] == null ? '—' : money(v['v' + (i + 1)])])).concat([['Ticket', int(v.ticket)],
    ['Contrato', v.contrato], ['ABL', v.abl], ['Piso', v.piso], ['Tipo', v.tipo], ['Categoria', v.categoria], ['Segmento', v.segmento]]).concat(isConsulta() ? [] : [['Registrado em', dtBR(v.hora)], ['E-mail', v.email], ['Código', v.id]])
      .map(([k, x]) => `<dt>${k}</dt><dd>${esc(x) || '—'}</dd>`).join('')}
    </dl>
    <div class="gutter section" ${isConsulta() ? 'hidden' : ''}>
      <h3 class="h2">Assinatura</h3>
      <div class="sig-img" id="sigBox">${v._sig ? `<img src="${v._sig}" alt="Assinatura">` : v.assin ? '<span class="muted">Carregando assinatura…</span>' : '<span class="muted">Sem assinatura</span>'}</div>
    </div>
    ${sp ? `<div class="gutter section"><button class="alert warn" data-solic="${esc(sp.id_solicitacao)}" style="border:0;text-align:left;width:100%"><div><b>${sp.Tipo === 'Exclusão' ? 'Exclusão' : 'Alteração'} solicitada</b> por ${esc(sp.Solicitante)}${sp.Tipo === 'Exclusão' ? '' : ': ' + esc(resumoSolic(sp))}. ${isMaster() ? 'Toque para aprovar ou recusar.' : 'Aguardando o master.'}</div></button></div>` : ''}
    ${isConsulta() ? '' : podeEditar ? `<div class="gutter section" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
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
      if (!v._sig && v.assin && !isConsulta()) {
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
  if (isConsulta()) return VIEWS.painel();
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
      ${editing ? '' : `<button type="button" class="btn" data-act="naoAbriu" style="width:100%;color:var(--warn)">${ICON.note}A loja não abriu neste dia</button>`}
      <div id="dupBox"></div>
      <div class="field" id="fdVendas">
        <label for="vVendas">Vendas<span class="req">*</span></label>
        <input class="input money num" id="vVendas" inputmode="numeric" autocomplete="off" value="${editing ? money(editing.vendas) : ''}" placeholder="R$ 0,00">
        <div class="hint" id="vVendasHint">Digite só os números; os centavos entram automaticamente.</div>
        <div id="partesBox" style="display:grid;gap:10px"></div>
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
      // lojas com partes (cinema): três campos e o total é a soma
      let partes = [], pc = [];
      const montarPartes = () => {
        const lj = lojaById($('#vLoja').value);
        const novas = partesDe(lj);
        if (novas.join('|') === partes.join('|')) return;
        partes = novas;
        const box = $('#partesBox');
        if (!partes.length) { box.innerHTML = ''; fV.readOnly = false; $('#vVendasHint').textContent = 'Digite só os números; os centavos entram automaticamente.'; S.getPartes = () => null; return; }
        const ed = editing && editing.loja === lj.IdLoja ? editing : null;
        pc = partes.map((_, i) => ed && ed['v' + (i + 1)] !== '' && ed['v' + (i + 1)] != null ? Math.round(+ed['v' + (i + 1)] * 100) : (ed && i === 0 && (ed.v1 === '' || ed.v1 == null) ? Math.round(+ed.vendas * 100) : null));
        box.innerHTML = partes.map((n, i) => `<label class="field" style="gap:4px;margin:0"><span style="font-size:13px;font-weight:700">${esc(n)}</span><input class="input money num" data-parte="${i}" inputmode="numeric" autocomplete="off" placeholder="R$ 0,00" value="${pc[i] == null ? '' : money(pc[i] / 100)}"></label>`).join('');
        fV.readOnly = true;
        $('#vVendasHint').textContent = 'Total calculado: soma de ' + partes.join(', ').replace(/, ([^,]*)$/, ' e $1') + '.';
        const soma = () => { cents = pc.some(x => x != null) ? pc.reduce((a, b) => a + (b || 0), 0) : null; fV.value = cents == null ? '' : money(cents / 100); updTM(); };
        $$('[data-parte]', box).forEach(inp => {
          inp.addEventListener('input', () => {
            S.outlierOk = false; $('#outBox').innerHTML = ''; fieldErr('fdVendas', '');
            const d = inp.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
            pc[+inp.dataset.parte] = d ? parseInt(d.slice(0, 13), 10) : null;
            inp.value = pc[+inp.dataset.parte] == null ? '' : money(pc[+inp.dataset.parte] / 100);
            soma();
          });
          inp.addEventListener('focus', () => setTimeout(() => inp.setSelectionRange(inp.value.length, inp.value.length), 0));
        });
        S.getPartes = () => pc.map(x => (x || 0) / 100);
        soma();
      };
      S.getPartes = () => null;
      fV.addEventListener('input', () => {
        if (fV.readOnly) return;
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
      $('#vLoja').addEventListener('change', () => { montarPartes(); upd(); });
      $('#vData').addEventListener('change', upd);
      montarPartes();
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
  const pv = S.getPartes && S.getPartes();
  if (pv) pv.forEach((x, i) => { venda['Vendas' + (i + 1)] = x; });
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

function naoAbriu() {
  const c = cur().p;
  const loja = $('#vLoja').value, data = $('#vData').value;
  if (!loja) return fieldErr('fdLoja', 'Selecione a loja.');
  if (!data || data > today()) return fieldErr('fdData', 'Informe uma data até hoje.');
  if (merged().byLojaData.get(loja + '|' + data)) return toast('Já existe venda lançada para esta loja neste dia.');
  enqueue({ type: 'motivo', motivo: { id: uid(), loja, motivo: `Loja não abriu em ${dBR(data)}`, data: data + ' 12:00:00' } });
  const lj = lojaById(loja) || {};
  replace('proxima', { salva: { loja: lj.NomeFantasia, data, naoAbriu: true }, prox: proximaPendente(loja, data, c.modo || 'dia') });
}

/* ---------- Depois de salvar: próxima loja da rota ---------- */
VIEWS.proxima = (p) => {
  const sv = p.salva, nx = p.prox || {};
  const off = !navigator.onLine && !DEMO;
  const html = `
  ${topbar({ title: 'Venda salva', backBtn: true })}
  <main><div class="wrap gutter" style="display:grid;gap:16px;padding-block:20px">
    <div class="alert ${sv.naoAbriu ? 'warn' : 'ok'}"><div><b>${esc(sv.loja)}</b> · ${esc(dBR(sv.data))} · ${sv.naoAbriu ? '<b>não abriu</b> (registrado como motivo)' : `<b class="num">${money(sv.vendas)}</b>`}<br>${off ? 'Salvo no aparelho. Será enviado quando houver internet.' : 'Salvo e enviado para a planilha.'}</div></div>
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
      <div class="field"><span class="label">Operação</span>
        <div class="seg">${['Fixa', 'Eventual'].map(x => `<button type="button" data-segval="${x}" data-opform="1" aria-pressed="${(l.Operacao || 'Fixa') === x}">${x}</button>`).join('')}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <label class="field" style="gap:4px"><span style="font-size:13px;font-weight:700">Início (eventual)</span><input class="input" type="date" id="lInicio" value="${esc(l.Inicio || '')}"></label>
          <label class="field" style="gap:4px"><span style="font-size:13px;font-weight:700">Fim (eventual)</span><input class="input" type="date" id="lFim" value="${esc(l.Fim || '')}"></label>
        </div>
        <div class="hint">Eventual (Mercado Produtor, feiras, eventos) só conta como pendente entre o início e o fim.</div></div>
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
  if (isConsulta()) return VIEWS.painel();
  const abas = [['vendas', 'Vendas'], ['solic', 'Solicitações'], ['motivos', 'Motivos']].concat(isMaster() ? [['alteracoes', 'Alterações'], ['acessos', 'Acessos']] : []);
  const t = abas.some(a => a[0] === S.ui.histTab) ? S.ui.histTab : 'vendas';
  const segs = `<div class="chips" role="group" style="padding-top:0">${abas.map(([k, l]) => `<button class="chip" data-htab="${k}" aria-pressed="${t === k}">${l}</button>`).join('')}</div>`;
  let body = '';
  if (t === 'vendas') {
    const mes = S.ui.histMes || today().slice(0, 7);
    const porReg = (S.ui.histOrdem || 'registro') === 'registro';
    const chave = v => porReg ? String(v.hora || v.data).slice(0, 10) : v.data;
    ensureMes(mes);
    if (porReg) ensureMes(addMonth(mes, -1));   // vendas registradas neste mês podem ser do mês anterior
    const busca = norm(S.ui.histBusca);
    let list = merged().list.filter(v => chave(v).startsWith(mes));
    if (S.ui.histAud) list = list.filter(v => audNome(v.auditor) === S.ui.histAud);
    if (busca) list = list.filter(v => { const l = lojaById(v.loja); return norm((l ? l.NomeFantasia + ' ' + l.Luc : v.nome) + ' ' + v.resp).includes(busca); });
    list.sort((a, b) => porReg ? String(b.hora).localeCompare(String(a.hora)) : b.data.localeCompare(a.data) || String(b.hora).localeCompare(String(a.hora)));
    const tot = list.reduce((s, v) => s + (+v.vendas || 0), 0);
    const auds = Array.from(new Set(merged().list.filter(v => chave(v).startsWith(mes)).map(v => audNome(v.auditor)).filter(Boolean))).sort();
    const groups = {};
    list.forEach(v => { const k = chave(v); (groups[k] = groups[k] || []).push(v); });
    const lim = S.ui.histLim || 12;
    const keys = Object.keys(groups).sort().reverse();
    body = `
      <div class="gutter section" style="display:grid;gap:12px">
        <div class="seg" role="group">${[['registro', 'Por registro'], ['data', 'Por data da venda']].map(([k, lb]) => `<button data-hordem="${k}" aria-pressed="${(S.ui.histOrdem || 'registro') === k}">${lb}</button>`).join('')}</div>
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
      ${keys.slice(0, lim).map(k => `<div class="group-h"><span>${porReg ? (k === today() ? 'Registradas hoje · ' : k === ontem() ? 'Registradas ontem · ' : 'Registradas em ') : 'Vendas de '}${esc(diaLongo(k))}</span><span class="num">${groups[k].length} · ${moneyShort(groups[k].reduce((s, v) => s + (+v.vendas || 0), 0))}</span></div>
        <div class="list">${groups[k].map(v => vendaRow(v, { reg: porReg })).join('')}</div>`).join('') || (S.loadingMes === mes ? '' : '<div class="empty">' + ICON.hist + '<div>Nenhum lançamento neste mês.</div></div>')}
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
  if (!veAnalises()) return VIEWS.rota();
  if (!d) return { html: topbar({ title: 'Painel' }) + '<main><div class="loading">Carregando…</div></main>' + navbar('painel') };
  if (S.ui.painelAba === 'equipe' && isMaster()) return VIEWS.equipe();
  if (S.ui.painelAba === 'com21') return VIEWS.analises();
  if (S.ui.painelAba === 'mapa') return VIEWS.mapa();
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
  const diasCorridos = daysIn(mes);   // todos os dias do mês
  // esperado = lojas fixas × dias do mês + eventuais só nos dias do período
  let esperadas = 0, lancadasEsp = 0;
  lojasAtivas().forEach(l => { const e = diasEsperadosNoMes(l, mes); esperadas += e; lancadasEsp += Math.min(e, ((d.mensal[mes] || {})[l.IdLoja] || [0, 0, 0])[2]); });
  const cobertura = esperadas ? Math.min(100, lancadasEsp / esperadas * 100) : 0;
  const nFixas = lojasAtivas().filter(l => !ehEventual(l)).length;
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
  ${topbar({ title: 'Painel', sub: 'Vendas coletadas pela auditoria' })}
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
        <div class="kpi"><span class="l">Vendas diárias lançadas</span><span class="v num">${cobertura.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%</span><span class="d muted">${int(lancadasEsp)} de ${int(esperadas)} esperadas (${nFixas} lojas fixas × ${diasCorridos} dias${esperadas > nFixas * diasCorridos ? ' + eventuais no período' : ''})</span></div>
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

/* Planta baixa (espaços retangulares por piso, gerados a partir da planta do shopping). luc/nome = sugestão inicial; o master troca no app. */
window.MAPA_PLANTA = window.MAPA_PLANTA || {"L1":{"w":1900,"h":1445,"corredor":[[20,995,1170,360],[60,25,410,480],[1190,1215,520,210],[1190,985,540,140],[110,775,260,220],[240,1355,950,30],[430,695,60,300],[1710,1315,150,110],[1730,975,150,100]],"espacos":[{"id":"L1-01","x":65,"y":20,"w":410,"h":480,"luc":"001","nome":"Renner","vaga":false},{"id":"L1-02","x":110,"y":810,"w":80,"h":150,"luc":"104","nome":"Kopenhagen","vaga":false},{"id":"L1-03","x":275,"y":870,"w":90,"h":235,"luc":"101","nome":"Taco","vaga":false},{"id":"L1-04","x":445,"y":990,"w":85,"h":130,"luc":"111","nome":"Zeiss","vaga":false},{"id":"L1-05","x":530,"y":990,"w":95,"h":130,"luc":"112","nome":"Dalia Franco","vaga":false},{"id":"L1-06","x":625,"y":990,"w":130,"h":145,"luc":"113","nome":"Nação Rubro Negra","vaga":false},{"id":"L1-07","x":755,"y":990,"w":120,"h":215,"luc":"143","nome":"Hering Store","vaga":false},{"id":"L1-08","x":875,"y":990,"w":75,"h":215,"luc":"142","nome":"Melissa","vaga":false},{"id":"L1-09","x":950,"y":990,"w":95,"h":215,"luc":"141","nome":"Santa Lolla","vaga":false},{"id":"L1-10","x":1045,"y":990,"w":110,"h":215,"luc":"140","nome":"Fit store","vaga":false},{"id":"L1-11","x":1155,"y":990,"w":135,"h":130,"luc":"138","nome":"World Free","vaga":false},{"id":"L1-12","x":1290,"y":990,"w":135,"h":130,"luc":"136","nome":"Marias Ejje","vaga":false},{"id":"L1-13","x":1425,"y":990,"w":135,"h":130,"luc":"134","nome":"Brave","vaga":false},{"id":"L1-14","x":1560,"y":990,"w":145,"h":130,"luc":"132","nome":"Bless","vaga":false},{"id":"L1-15","x":1705,"y":990,"w":130,"h":90,"luc":"130","nome":"O Boticário","vaga":false},{"id":"L1-16","x":20,"y":1030,"w":170,"h":50,"luc":"105","nome":"X Case","vaga":false},{"id":"L1-17","x":20,"y":1080,"w":170,"h":90,"luc":"106","nome":"Puket","vaga":false},{"id":"L1-18","x":20,"y":1170,"w":170,"h":90,"luc":"107","nome":"AD","vaga":false},{"id":"L1-19","x":1560,"y":1180,"w":65,"h":25,"luc":"Q104","nome":"Hygge","vaga":false},{"id":"L1-20","x":1260,"y":1205,"w":70,"h":105,"luc":"122","nome":"Altezza Prata","vaga":false},{"id":"L1-21","x":1330,"y":1205,"w":130,"h":105,"luc":"124","nome":"Altezza Joias","vaga":false},{"id":"L1-22","x":1460,"y":1205,"w":100,"h":105,"luc":"126","nome":"Rubi Ótica e Joalheria","vaga":false},{"id":"L1-23","x":1625,"y":1205,"w":80,"h":55,"luc":"128B","nome":"Empadinhas Express","vaga":false},{"id":"L1-24","x":235,"y":1260,"w":370,"h":125,"luc":"109","nome":"Black Buffalo For Man","vaga":false},{"id":"L1-25","x":605,"y":1260,"w":175,"h":125,"luc":"114","nome":"Black Buffalo Relaxing","vaga":false},{"id":"L1-26","x":780,"y":1260,"w":170,"h":125,"luc":"116","nome":"Unisporte","vaga":false},{"id":"L1-27","x":950,"y":1260,"w":190,"h":125,"luc":"118","nome":"My place","vaga":false},{"id":"L1-28","x":1625,"y":1260,"w":80,"h":50,"luc":"128A","nome":"Bob's","vaga":false},{"id":"L1-29","x":155,"y":1315,"w":35,"h":40,"luc":"108","nome":"1Instante","vaga":false},{"id":"L1-30","x":1140,"y":1340,"w":485,"h":85,"luc":"","nome":"","vaga":true},{"id":"L1-31","x":1745,"y":1310,"w":120,"h":115,"luc":"129","nome":"Anacapri","vaga":false},{"id":"L1-32","x":1645,"y":1385,"w":100,"h":40,"luc":"127","nome":"Lupo","vaga":false}]},"L2":{"w":1895,"h":1455,"corredor":[[1280,985,590,450],[70,25,410,480],[20,805,330,550],[700,1005,580,200],[350,1005,350,100],[380,1275,320,100],[780,1205,340,50],[440,735,50,270],[160,500,110,310]],"espacos":[{"id":"L2-01","x":70,"y":20,"w":410,"h":485,"luc":"001","nome":"Renner","vaga":false},{"id":"L2-02","x":195,"y":545,"w":35,"h":50,"luc":"Q201","nome":"Cherry bomb","vaga":false},{"id":"L2-03","x":195,"y":735,"w":35,"h":20,"luc":"Q204","nome":"Sabores Belgas","vaga":false},{"id":"L2-04","x":25,"y":795,"w":135,"h":100,"luc":"222","nome":"Go Coffee","vaga":false},{"id":"L2-05","x":265,"y":795,"w":105,"h":210,"luc":"219/221","nome":"Ortobom pop-up","vaga":false},{"id":"L2-06","x":25,"y":895,"w":135,"h":110,"luc":"220","nome":"Gigante da Colina","vaga":false},{"id":"L2-07","x":265,"y":1005,"w":105,"h":100,"luc":"214","nome":"Avatim","vaga":false},{"id":"L2-08","x":455,"y":1005,"w":75,"h":120,"luc":"213","nome":"Espaço Laser","vaga":false},{"id":"L2-09","x":530,"y":1005,"w":100,"h":100,"luc":"212","nome":"Green Lab","vaga":false},{"id":"L2-10","x":700,"y":1005,"w":1175,"h":200,"luc":"205","nome":"Lojas Americanas","vaga":false},{"id":"L2-11","x":25,"y":1035,"w":170,"h":140,"luc":"217","nome":"Mr.Cat","vaga":false},{"id":"L2-12","x":370,"y":1055,"w":65,"h":70,"luc":"Q208","nome":"Mia Semi Joias","vaga":false},{"id":"L2-13","x":25,"y":1175,"w":170,"h":95,"luc":"216","nome":"Cacau Show","vaga":false},{"id":"L2-14","x":285,"y":1150,"w":65,"h":25,"luc":"Q205","nome":"Gotrix","vaga":false},{"id":"L2-15","x":405,"y":1175,"w":30,"h":30,"luc":"Q206","nome":"Toys Kids","vaga":false},{"id":"L2-16","x":455,"y":1175,"w":75,"h":30,"luc":"","nome":"","vaga":true},{"id":"L2-17","x":530,"y":1175,"w":35,"h":30,"luc":"Q208","nome":"Mia Semi Joias","vaga":false},{"id":"L2-18","x":575,"y":1175,"w":35,"h":30,"luc":"Q208","nome":"Mia Semi Joias","vaga":false},{"id":"L2-19","x":1280,"y":1205,"w":595,"h":230,"luc":"201","nome":"Cine Show","vaga":false},{"id":"L2-20","x":25,"y":1270,"w":170,"h":100,"luc":"215","nome":"Littera","vaga":false},{"id":"L2-21","x":230,"y":1270,"w":120,"h":100,"luc":"210","nome":"Espaço Facial","vaga":false},{"id":"L2-22","x":350,"y":1270,"w":85,"h":100,"luc":"209","nome":"Barbero Joel Rodrigues","vaga":false},{"id":"L2-23","x":435,"y":1270,"w":95,"h":100,"luc":"208","nome":"Mahogany","vaga":false},{"id":"L2-24","x":530,"y":1270,"w":80,"h":100,"luc":"207","nome":"Voltz","vaga":false},{"id":"L2-25","x":610,"y":1270,"w":90,"h":100,"luc":"206","nome":"Dra Marcia Filgueiras","vaga":false}]},"L3":{"w":1920,"h":1450,"corredor":[[290,1000,1580,370],[250,20,230,480],[20,790,150,560],[1130,1370,740,60],[70,20,180,210],[260,800,110,200],[430,730,60,270],[1430,970,470,30],[150,360,115,440]],"espacos":[{"id":"L3-01","x":260,"y":30,"w":205,"h":465,"luc":"03A09","nome":"Adventure Kids","vaga":false},{"id":"L3-02","x":165,"y":375,"w":35,"h":50,"luc":"Q301","nome":"Boliche Big Apple","vaga":false},{"id":"L3-03","x":200,"y":525,"w":25,"h":50,"luc":"Q302","nome":"Jotas Cabines Fotográficas","vaga":false},{"id":"L3-04","x":200,"y":685,"w":25,"h":50,"luc":"Q303","nome":"Hygge","vaga":false},{"id":"L3-05","x":25,"y":795,"w":140,"h":100,"luc":"307","nome":"","vaga":true},{"id":"L3-06","x":260,"y":795,"w":100,"h":100,"luc":"308","nome":"","vaga":true},{"id":"L3-07","x":25,"y":895,"w":90,"h":75,"luc":"","nome":"","vaga":true},{"id":"L3-08","x":115,"y":895,"w":50,"h":105,"luc":"","nome":"","vaga":true},{"id":"L3-09","x":260,"y":895,"w":100,"h":105,"luc":"308B","nome":"A Casa da Maçã","vaga":false},{"id":"L3-10","x":275,"y":1000,"w":85,"h":90,"luc":"","nome":"","vaga":true},{"id":"L3-11","x":360,"y":1000,"w":80,"h":90,"luc":"","nome":"","vaga":true},{"id":"L3-12","x":440,"y":1000,"w":90,"h":90,"luc":"","nome":"","vaga":true},{"id":"L3-13","x":645,"y":1000,"w":110,"h":90,"luc":"312","nome":"Tasca Da Manjerona","vaga":false},{"id":"L3-14","x":1425,"y":970,"w":450,"h":250,"luc":"201","nome":"Cine Show","vaga":false},{"id":"L3-15","x":25,"y":1030,"w":175,"h":60,"luc":"306","nome":"","vaga":true},{"id":"L3-16","x":25,"y":1090,"w":175,"h":90,"luc":"303B","nome":"Lume Café","vaga":false},{"id":"L3-17","x":25,"y":1180,"w":175,"h":175,"luc":"303A4","nome":"Baby Kids","vaga":false},{"id":"L3-18","x":290,"y":1150,"w":45,"h":30,"luc":"","nome":"Quiosque","vaga":false},{"id":"L3-19","x":360,"y":1180,"w":245,"h":175,"luc":"315","nome":"Vino!","vaga":false},{"id":"L3-20","x":605,"y":1180,"w":350,"h":210,"luc":"316","nome":"","vaga":true},{"id":"L3-21","x":1130,"y":1220,"w":745,"h":210,"luc":"201","nome":"Cine Show","vaga":false}]},"L4":{"w":1715,"h":1445,"corredor":[[25,1005,1640,350],[65,25,420,420],[25,795,350,210],[745,1355,950,70],[435,735,60,270],[265,445,220,60]],"espacos":[{"id":"L4-01","x":120,"y":20,"w":135,"h":105,"luc":"10","nome":"Arizona Grill","vaga":false},{"id":"L4-02","x":255,"y":20,"w":120,"h":105,"luc":"","nome":"","vaga":true},{"id":"L4-03","x":70,"y":155,"w":100,"h":85,"luc":"16","nome":"Milky Moo","vaga":false},{"id":"L4-04","x":345,"y":155,"w":135,"h":85,"luc":"12","nome":"Spoleto","vaga":false},{"id":"L4-05","x":345,"y":240,"w":135,"h":135,"luc":"13","nome":"Bob's","vaga":false},{"id":"L4-06","x":275,"y":375,"w":205,"h":130,"luc":"15","nome":"Santa Ceia Gastronomia","vaga":false},{"id":"L4-07","x":745,"y":995,"w":925,"h":430,"luc":"201","nome":"Cine Show","vaga":false},{"id":"L4-08","x":20,"y":1080,"w":180,"h":275,"luc":"","nome":"Expansão","vaga":true},{"id":"L4-09","x":235,"y":1080,"w":510,"h":300,"luc":"","nome":"Expansão","vaga":true}]}};

/* ============================ Lojista (Com21), análises e mapa ============================ */
const baseContrato = c => String(c == null ? '' : c).split('-')[0].trim();
const variacao = (a, b) => (b ? (a / b - 1) * 100 : null);
const pctTxt = (p, casas = 1) => p == null || !isFinite(p) ? '—' : (p > 0 ? '+' : p < 0 ? '−' : '') + Math.abs(p).toLocaleString('pt-BR', { maximumFractionDigits: casas }) + '%';
const deltaTag = (p, lab, inverso) => p == null || !isFinite(p) ? '' : `<span class="d ${(inverso ? p <= 0 : p >= 0) ? 'up' : 'down'}">${p >= 0 ? '▲' : '▼'} ${Math.abs(p).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% ${lab}</span>`;
const somaObj = o => Object.values(o || {}).reduce((s, v) => s + (+v || 0), 0);
const totaisMes = o => { const r = {}; for (const k in (o || {})) r[k] = o[k][0]; return r; };
const ablNum = l => parseFloat(String((l && l.ABL) || '').replace(',', '.')) || 0;
const partesDe = l => String((l && l.Partes) || '').split(';').map(x => x.trim()).filter(Boolean).slice(0, 3);
const tituloCase = s => String(s || '').toLowerCase().replace(/(^|[\s/(-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());

async function loadAnal(force) {
  if (!veAnalises() || S.analBusy) return;
  if (!force && S.anal && Date.now() - (S.analAt || 0) < 20 * 60e3) return;
  if (!DEMO && !navigator.onLine) { if (force) toast('Sem internet.'); return; }
  S.analBusy = true; S.analErr = '';
  if (force) refresh();
  try {
    const r = await api('analises');
    delete r.ok;
    S.anal = r; S.analAt = Date.now();
    KV.set('anal', { r, at: S.analAt });
  } catch (e) { S.analErr = e.message; }
  S.analBusy = false;
  refresh();
}

/* contrato -> lojas do app (ativas primeiro) */
let lojaContratoCache = { ver: -1, map: null };
function lojasPorContrato() {
  if (lojaContratoCache.ver === S.ver && lojaContratoCache.map) return lojaContratoCache.map;
  const m = new Map();
  lojasAll().forEach(l => {
    const c = baseContrato(l.Contrato); if (!c) return;
    if (!m.has(c)) m.set(c, []);
    m.get(c).push(l);
  });
  m.forEach(arr => arr.sort((a, b) => (a['Situação'] === 'Inativo') - (b['Situação'] === 'Inativo') || (partesDe(b).length - partesDe(a).length)));
  lojaContratoCache = { ver: S.ver, map: m };
  return m;
}
const lojaDoContrato = c => (lojasPorContrato().get(c) || [])[0] || null;
function ablContrato(c) {
  const ls = (lojasPorContrato().get(c) || []);
  const at = ls.filter(l => l['Situação'] !== 'Inativo');
  return (at.length ? at : ls).reduce((s, l) => s + ablNum(l), 0);
}
function nomeContrato(c) {
  const l = lojaDoContrato(c);
  if (l) return l.NomeFantasia;
  const k = S.anal && S.anal.contratos[c];
  return k ? tituloCase(k.nome) : 'Contrato ' + c;
}

/* dados do Com21 de um mês, com o mesmo período quando o mês ainda está incompleto */
function com21Mes(m) {
  const A = S.anal; if (!A) return null;
  const parcial = !!(A.comp && A.comp.mes === m && A.comp.ate < daysIn(m));
  return {
    cur: totaisMes(A.mensal[m]),
    raw: A.mensal[m] || {},
    ly: parcial ? A.comp.ly : totaisMes(A.mensal[addMonth(m, -12)]),
    pm: parcial ? A.comp.ant : totaisMes(A.mensal[addMonth(m, -1)]),
    parcial, ate: parcial ? A.comp.ate : daysIn(m)
  };
}
function mesesCom21() { return S.anal ? Object.keys(S.anal.mensal).sort() : []; }
function mesAnalise() {
  const ms = mesesCom21();
  let m = S.ui.anMes;
  if (!m || (ms.length && !ms.includes(m) && S.ui.painelAba !== 'mapa')) m = S.anal && S.anal.ultima ? S.anal.ultima.slice(0, 7) : today().slice(0, 7);
  return m;
}

/* ---------- Gráfico de barras em pares (ano atual × ano anterior) ---------- */
function pairChart(items) {
  const W = 340, H = 160, top = 8, bottom = 22;
  const max = Math.max(1, ...items.map(i => Math.max(i.a || 0, i.b || 0)));
  const nice = (() => { const p = Math.pow(10, Math.floor(Math.log10(max))); const m = max / p; return [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find(x => m <= x) * p; })();
  const y = v => top + (H - top - bottom) * (1 - v / nice);
  const bw = W / items.length;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico comparativo">`;
  [0.5, 1].forEach(f => { s += `<line x1="0" x2="${W}" y1="${y(nice * f)}" y2="${y(nice * f)}" stroke="var(--line)" stroke-dasharray="3 3"/><text x="${W}" y="${y(nice * f) - 3}" text-anchor="end" font-size="9" fill="var(--muted)">${esc(moneyShort(nice * f))}</text>`; });
  s += `<line x1="0" x2="${W}" y1="${y(0)}" y2="${y(0)}" stroke="var(--line)"/>`;
  items.forEach((it, i) => {
    const x = i * bw, w = bw * 0.36;
    s += `<g data-bar="par" data-key="${esc(it.key)}" data-value="${it.a || 0}" data-extra="${it.b || 0}" style="cursor:pointer">
      <rect x="${x}" y="${top}" width="${bw}" height="${H - top - bottom}" fill="transparent"/>
      <rect x="${x + bw * 0.12}" y="${y(it.b || 0)}" width="${w}" height="${Math.max(it.b ? 1.5 : 0, y(0) - y(it.b || 0))}" rx="2" fill="var(--line)"/>
      <rect x="${x + bw * 0.12 + w}" y="${y(it.a || 0)}" width="${w}" height="${Math.max(it.a ? 1.5 : 0, y(0) - y(it.a || 0))}" rx="2" fill="${it.hl ? 'var(--brand-strong)' : 'var(--brand)'}"/>
      <text x="${x + bw / 2}" y="${H - 6}" text-anchor="middle" font-size="9.5" fill="var(--muted)">${esc(it.label)}</text></g>`;
  });
  return s + '</svg>';
}

function semCom21Html(titulo) {
  return `<div class="gutter section" style="display:grid;gap:12px">
    ${S.analBusy ? '<div class="loading">Carregando dados do Com21…</div>' : S.analErr ? `<div class="alert bad"><div>${esc(S.analErr)}</div></div>` : `<div class="empty" style="padding:24px 8px">${ICON.chart}<div>${esc(titulo)}</div></div>`}
    ${isMaster() && !S.analBusy ? `<button class="btn primary" data-act="importar">${ICON.sync}Importar relatório do Com21</button>` : ''}
    ${!S.analBusy ? `<button class="btn" data-act="analRecarregar">${ICON.sync}Buscar dados de novo</button>` : ''}
  </div>`;
}

/* ---------- Painel > Lojista (Com21) ---------- */
VIEWS.analises = () => {
  if (!S.anal && !S.analBusy && !S.analErr) loadAnal();
  const A = S.anal;
  const vazio = !A || !Object.keys(A.mensal || {}).length;
  const head = `${topbar({ title: 'Painel', sub: 'Vendas declaradas no Com21', actions: `<button class="icon-btn" data-act="analRecarregar" aria-label="Atualizar análises" title="Atualizar análises">${ICON.chart}</button>` })}
  <main><div class="wrap"><div class="gutter" style="padding-top:14px">${painelAbas()}</div>`;
  if (vazio) return { html: head + semCom21Html(A ? 'Ainda não há vendas do Com21 na planilha.' : 'Carregando…') + `</div></main>${navbar('painel')}` };

  const ms = mesesCom21();
  const m = ms.includes(mesAnalise()) ? mesAnalise() : ms[ms.length - 1];
  const D = com21Mes(m);
  const lim = +A.limite || +cfg('div_limite') || 5;
  const tot = somaObj(D.cur), tLy = somaObj(D.ly), tPm = somaObj(D.pm);
  const per = D.parcial ? ` (1 a ${D.ate})` : '';
  // SSS: mesmas lojas com venda nos dois períodos
  let sA = 0, sB = 0, nS = 0;
  for (const c in D.cur) { if (D.cur[c] > 0 && (D.ly[c] || 0) > 0) { sA += D.cur[c]; sB += D.ly[c]; nS++; } }
  // venda por m²
  let vM = 0, aM = 0;
  for (const c in D.cur) { const a = ablContrato(c); if (a > 0 && D.cur[c] > 0) { vM += D.cur[c]; aM += a; } }
  const nDecl = Object.values(D.cur).filter(v => v > 0).length;
  // auditoria × lojista
  const cz = (A.cruz || {})[m] || {};
  let au = 0, lo = 0, diasCz = 0;
  const div = Object.keys(cz).map(c => { const [a, b, n, nd] = cz[c]; au += a; lo += b; diasCz += n; return { c, a, b, n, nd, p: b ? (a - b) / b * 100 : (a ? 100 : 0) }; })
    .sort((x, y) => Math.abs(y.p) - Math.abs(x.p) || y.nd - x.nd);
  const acima = div.filter(x => Math.abs(x.p) > lim || x.nd > 0);
  const divTotal = lo ? (au - lo) / lo * 100 : null;
  // 13 meses
  const serie = []; for (let i = 12; i >= 0; i--) { const mm = addMonth(m, -i); serie.push({ key: mm, label: MESES[+mm.slice(5) - 1].slice(0, 3), a: somaObj(totaisMes(A.mensal[mm])), b: somaObj(totaisMes(A.mensal[addMonth(mm, -12)])), hl: mm === m }); }
  // dia da semana
  const dw = Array.from({ length: 7 }, () => ({ s: 0, n: 0 }));
  Object.keys(A.diario).forEach(k => { if (k.startsWith(m)) { const w = new Date(k + 'T12:00:00').getDay(); dw[w].s += A.diario[k]; dw[w].n++; } });
  const dwItems = [1, 2, 3, 4, 5, 6, 0].map(w => ({ label: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'][w], value: dw[w].n ? dw[w].s / dw[w].n : 0, key: String(w), extra: dw[w].n }));
  // ranking
  const by = S.ui.anRank || 'vendas';
  const linhas = Object.keys(D.cur).filter(c => D.cur[c] > 0).map(c => {
    const a = ablContrato(c);
    return { c, nome: nomeContrato(c), v: D.cur[c], m2: a ? D.cur[c] / a : null, cr: (D.ly[c] || 0) > 0 ? variacao(D.cur[c], D.ly[c]) : null, loja: lojaDoContrato(c) };
  });
  const rk = linhas.filter(r => by === 'vendas' ? true : by === 'm2' ? r.m2 != null : r.cr != null)
    .sort((x, y) => by === 'vendas' ? y.v - x.v : by === 'm2' ? y.m2 - x.m2 : y.cr - x.cr);
  const valR = r => by === 'vendas' ? r.v : by === 'm2' ? r.m2 : r.cr;
  const maxR = Math.max(1, ...rk.map(r => Math.abs(valR(r))));
  const mais = S.ui.anMais || {};
  // por ramo
  const ramo = {};
  for (const c in D.cur) {
    const k = S.anal.contratos[c]; const nm = tituloCase((k && k.ramo) || 'Sem ramo');
    const o = ramo[nm] || (ramo[nm] = { v: 0, ly: 0 }); o.v += D.cur[c]; o.ly += D.ly[c] || 0;
  }
  const ramos = Object.entries(ramo).filter(([, o]) => o.v > 0).sort((x, y) => y[1].v - x[1].v);
  // curva ABC
  const ord = linhas.slice().sort((x, y) => y.v - x.v);
  let acc = 0; const abc = { A: [], B: [], C: [] };
  ord.forEach(r => { acc += r.v; const sh = tot ? acc / tot : 1; (sh <= 0.8 || !abc.A.length ? abc.A : sh <= 0.95 ? abc.B : abc.C).push(r); });
  // altas e quedas (lojas com venda relevante no ano anterior)
  const comp = linhas.filter(r => r.cr != null && (D.ly[r.c] || 0) >= 5000).sort((x, y) => y.cr - x.cr);
  const altas = comp.slice(0, 5), quedas = comp.slice(-5).reverse().filter(r => r.cr < 0);
  // contratos do Com21 sem loja no app
  const semLoja = linhas.filter(r => !r.loja).sort((x, y) => y.v - x.v);
  const ultTxt = A.ultima ? dBR(A.ultima) : '—';
  const rowLink = r => r.loja ? `data-loja="${esc(r.loja.IdLoja)}" data-lojames="${m}"` : '';

  const html = head + `
    <div class="gutter section" style="display:grid;gap:12px">
      <div class="month-nav">
        <button class="cal-nav" data-act="anMes" data-mes="${addMonth(m, -1)}" ${m <= ms[0] ? 'disabled' : ''} aria-label="Mês anterior">${ICON.left}</button>
        <strong>${esc(mesNome(m))}${D.parcial ? ` <span class="muted" style="font-weight:600;font-size:13px">até dia ${D.ate}</span>` : ''}</strong>
        <button class="cal-nav" data-act="anMes" data-mes="${addMonth(m, 1)}" ${m >= ms[ms.length - 1] ? 'disabled' : ''} aria-label="Próximo mês">${ICON.right}</button>
      </div>
      <div class="kpis">
        <div class="kpi wide"><span class="l">Vendas declaradas pelos lojistas</span><span class="v num">${money(tot)}</span>${deltaTag(variacao(tot, tLy), 'vs. ' + MESES[+m.slice(5) - 1] + '/' + (+m.slice(0, 4) - 1) + per)}${deltaTag(variacao(tot, tPm), 'vs. mês anterior' + per)}</div>
        <div class="kpi"><span class="l">SSS (mesmas lojas)</span><span class="v num">${pctTxt(variacao(sA, sB))}</span><span class="d muted">${nS} lojas com venda nos dois anos</span></div>
        <div class="kpi"><span class="l">Venda por m²</span><span class="v num">${aM ? money(vM / aM) : '—'}</span><span class="d muted">${aM ? int(aM) + ' m² com ABL cadastrada' : 'cadastre a ABL das lojas'}</span></div>
        <div class="kpi"><span class="l">Lojas que declararam</span><span class="v num">${nDecl}</span><span class="d muted">com venda no mês</span></div>
        <div class="kpi"><span class="l">Auditoria × lojista</span><span class="v num">${divTotal == null ? '—' : pctTxt(divTotal)}</span><span class="d ${acima.length ? 'down' : 'muted'}">${diasCz ? `${acima.length} loja${acima.length === 1 ? '' : 's'} fora do limite de ${String(lim).replace('.', ',')}%` : 'sem dias para comparar'}</span></div>
      </div>
      <div class="muted" style="font-size:12.5px">Com21 até ${ultTxt}${S.analAt ? ' · atualizado ' + new Date(S.analAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : ''}${S.analBusy ? ' · atualizando…' : ''}.${D.parcial ? ' Mês incompleto: as comparações usam o mesmo período (1 a ' + D.ate + ').' : ''} SSS compara só as lojas que venderam nos dois períodos.</div>
      ${isMaster() ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><button class="btn" data-act="importar">${ICON.sync}Importar Com21</button><button class="btn" data-act="faixas">${ICON.chart}Limites</button></div>` : ''}
    </div>
    <div class="gutter section">
      <h3 class="h2">Últimos 13 meses</h3>
      <div class="card chart"><div class="tip num" id="tipPar"><span style="display:inline-block;width:10px;height:10px;background:var(--brand);border-radius:2px"></span> ${esc(m.slice(0, 4))} e anteriores &nbsp; <span style="display:inline-block;width:10px;height:10px;background:var(--line);border-radius:2px"></span> mesmo mês do ano anterior. Toque num mês.</div>${pairChart(serie)}</div>
    </div>
    <div class="section">
      <h3 class="h2 gutter">Auditoria × lojista <span style="text-transform:none;letter-spacing:0;font-weight:600">nos dias lançados pelos dois</span></h3>
      <div class="list">${div.slice(0, mais.div ? 200 : 8).map(x => { const l = lojaDoContrato(x.c); const ruim = Math.abs(x.p) > lim || x.nd > 0; return `<button class="row" style="grid-template-columns:1fr auto" ${l ? `data-act="comparar" data-id="${esc(l.IdLoja)}" data-mes="${m}"` : ''}>
        <div><div class="t">${esc(nomeContrato(x.c))}</div><div class="s">Auditoria ${moneyShort(x.a)} · lojista ${moneyShort(x.b)} · ${x.n} dia${x.n === 1 ? '' : 's'}${x.nd ? ` · <b style="color:var(--bad)">${x.nd} com diferença</b>` : ''}</div></div>
        <div class="v num"><span class="status ${ruim ? 'st-no' : 'st-ok'}">${pctTxt(x.p)}</span></div></button>`; }).join('') || '<div class="empty">Nenhum dia com lançamento da auditoria e do lojista neste mês.</div>'}
      ${div.length > 8 ? `<button class="more" data-act="anMais" data-k="div">${mais.div ? 'Mostrar menos' : 'Ver todas as ' + div.length + ' lojas'}</button>` : ''}</div>
      <div class="gutter muted" style="font-size:12px;margin-top:6px">Diferença = (auditoria − lojista) ÷ lojista, somando só os dias que existem nos dois. Um dia conta como "com diferença" quando passa de ${String(lim).replace('.', ',')}%. Toque para ver dia a dia.</div>
    </div>
    <div class="section">
      <div class="gutter" style="display:grid;gap:10px;margin-bottom:10px">
        <h3 class="h2" style="margin:0">Ranking de lojas</h3>
        <div class="seg">${[['vendas', 'Vendas'], ['m2', 'R$ por m²'], ['cresc', 'Cresc. a/a']].map(([k, l]) => `<button data-anrank="${k}" aria-pressed="${by === k}">${l}</button>`).join('')}</div>
      </div>
      <div class="list">${rk.slice(0, mais.rank ? 300 : 10).map((r, i) => { const v = valR(r); return `<button class="hbar" ${rowLink(r)}><span class="n"><span class="rank num">${i + 1}</span>${esc(r.nome)}</span><span class="val num">${by === 'vendas' ? moneyShort(v) : by === 'm2' ? money(v) : pctTxt(v)}</span><span class="bar"><i style="width:${(Math.abs(v) / maxR * 100).toFixed(1)}%;${by === 'cresc' && v < 0 ? 'background:var(--bad)' : ''}"></i></span></button>`; }).join('') || '<div class="empty">Sem dados.</div>'}
      ${rk.length > 10 ? `<button class="more" data-act="anMais" data-k="rank">${mais.rank ? 'Mostrar só as 10 primeiras' : 'Ver todas as ' + rk.length + ' lojas'}</button>` : ''}</div>
      ${by === 'm2' ? '<div class="gutter muted" style="font-size:12px;margin-top:6px">Só lojas com ABL (m²) no cadastro.</div>' : by === 'cresc' ? `<div class="gutter muted" style="font-size:12px;margin-top:6px">Comparado com ${MESES[+m.slice(5) - 1]} de ${+m.slice(0, 4) - 1}${per}.</div>` : ''}
    </div>
    <div class="section">
      <h3 class="h2 gutter">Altas e quedas sobre o ano anterior</h3>
      <div class="list">${altas.concat(quedas).map(r => `<button class="row" style="grid-template-columns:1fr auto" ${rowLink(r)}><div><div class="t">${esc(r.nome)}</div><div class="s">${moneyShort(r.v)} · antes ${moneyShort(D.ly[r.c])}</div></div><div class="v num ${r.cr >= 0 ? 'up' : 'down'}">${pctTxt(r.cr)}</div></button>`).join('') || '<div class="empty">Sem lojas para comparar com o ano anterior.</div>'}</div>
    </div>
    <div class="section">
      <h3 class="h2 gutter">Por ramo de atividade</h3>
      <div class="list">${ramos.slice(0, mais.ramo ? 99 : 8).map(([n, o]) => `<div class="hbar"><span class="n">${esc(n)}</span><span class="val num">${moneyShort(o.v)} <span class="muted" style="font-weight:600">${tot ? Math.round(o.v / tot * 100) : 0}%</span>${o.ly ? ` <span class="${o.v >= o.ly ? 'up' : 'down'}" style="font-size:12px">${pctTxt(variacao(o.v, o.ly), 0)}</span>` : ''}</span><span class="bar"><i style="width:${(o.v / (ramos[0][1].v || 1) * 100).toFixed(1)}%"></i></span></div>`).join('')}
      ${ramos.length > 8 ? `<button class="more" data-act="anMais" data-k="ramo">${mais.ramo ? 'Mostrar menos' : 'Ver os ' + ramos.length + ' ramos'}</button>` : ''}</div>
    </div>
    <div class="gutter section">
      <h3 class="h2">Curva ABC</h3>
      <div class="kpis">${['A', 'B', 'C'].map(k => `<div class="kpi"><span class="l">Curva ${k}</span><span class="v num">${abc[k].length} lojas</span><span class="d muted">${tot ? Math.round(abc[k].reduce((s, r) => s + r.v, 0) / tot * 100) : 0}% das vendas</span></div>`).join('')}</div>
      <div class="muted" style="font-size:12.5px;margin-top:8px">A = lojas que somam 80% das vendas; B = os 15% seguintes; C = os últimos 5%.</div>
      <div class="list" style="margin-top:10px;border-radius:12px">${abc.A.map(r => `<button class="hbar" ${rowLink(r)}><span class="n"><span class="rank num" style="background:var(--brand);color:var(--surface)">A</span>${esc(r.nome)}</span><span class="val num">${moneyShort(r.v)} <span class="muted" style="font-weight:600">${tot ? (r.v / tot * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : 0}%</span></span></button>`).join('')}</div>
    </div>
    <div class="gutter section">
      <h3 class="h2">Média por dia da semana</h3>
      <div class="card chart"><div class="tip num" id="tipDow">Toque num dia.</div>${barChart(dwItems, 'dow')}</div>
    </div>
    ${isMaster() && semLoja.length ? `<div class="section"><h3 class="h2 gutter">No Com21, mas sem loja no app <span>${semLoja.length}</span></h3>
      <div class="list">${semLoja.slice(0, mais.sem ? 99 : 5).map(r => { const k = A.contratos[r.c] || {}; return `<div class="row" style="grid-template-columns:1fr auto"><div><div class="t">${esc(tituloCase(k.nome || r.c))}</div><div class="s">Contrato ${esc(r.c)} · LUC ${esc(k.luc || '—')}</div></div><div class="v num">${moneyShort(r.v)}</div></div>`; }).join('')}
      ${semLoja.length > 5 ? `<button class="more" data-act="anMais" data-k="sem">${mais.sem ? 'Mostrar menos' : 'Ver todos'}</button>` : ''}</div>
      <div class="gutter muted" style="font-size:12px;margin-top:6px">Para ligar, preencha o Contrato no cadastro da loja (o número do Com21).</div></div>` : ''}
  </div></main>
  ${navbar('painel')}`;
  return {
    html,
    mount() {
      $$('[data-bar]').forEach(b => b.addEventListener('click', () => {
        const kind = b.dataset.bar, key = b.dataset.key;
        $$('[data-bar="' + kind + '"]').forEach(x => x.setAttribute('opacity', x === b ? '1' : '.55'));
        if (kind === 'par') $('#tipPar').textContent = `${mesNome(key)}: ${money(+b.dataset.value)} · ano anterior ${money(+b.dataset.extra)} (${pctTxt(variacao(+b.dataset.value, +b.dataset.extra))})`;
        if (kind === 'dow') $('#tipDow').textContent = `${DOW[+key]}: média de ${money(+b.dataset.value)} (${b.dataset.extra} dia${+b.dataset.extra === 1 ? '' : 's'})`;
      }));
    }
  };
};

/* ---------- Loja: cartão com o Com21 ---------- */
function cardCom21Loja(l, mes) {
  const c = baseContrato(l.Contrato);
  if (!S.anal) { loadAnal(); return ''; }
  if (!c) return `<div class="gutter section"><div class="muted" style="font-size:12.5px">Sem contrato no cadastro: não dá para comparar com o Com21.</div></div>`;
  const D = com21Mes(mes);
  const lojista = D.cur[c];
  const cz = ((S.anal.cruz || {})[mes] || {})[c];
  const lim = +S.anal.limite || 5;
  const p = cz && cz[1] ? (cz[0] - cz[1]) / cz[1] * 100 : null;
  const partes = D.raw[c] && partesDe(l).length ? partesDe(l).map((n, i) => `${n} ${moneyShort(D.raw[c][i + 1])}`).join(' · ') : '';
  if (lojista == null && !cz) return `<div class="gutter section"><div class="card" style="padding:12px 14px;display:grid;gap:4px"><b>Lojista (Com21)</b><span class="muted" style="font-size:13px">Sem vendas declaradas em ${esc(mesNome(mes))}${S.anal.ultima ? ' (Com21 até ' + dBR(S.anal.ultima) + ')' : ''}.</span></div></div>`;
  return `<div class="gutter section"><div class="card" style="padding:14px;display:grid;gap:8px">
    <div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline"><b>Lojista (Com21)</b><span class="muted" style="font-size:12px">até ${esc(dBR(S.anal.ultima))}</span></div>
    <div class="num" style="font-size:22px;font-weight:800">${money(lojista || 0)}${deltaTag(variacao(lojista || 0, D.ly[c]), 'vs. ano ant.' + (D.parcial ? ' (mesmo período)' : ''))}</div>
    ${partes ? `<div class="muted" style="font-size:12.5px">${esc(partes)}</div>` : ''}
    ${cz ? `<div style="font-size:13.5px">Nos <b>${cz[2]}</b> dias lançados pelos dois: auditoria <b>${money(cz[0])}</b> × lojista <b>${money(cz[1])}</b> <span class="status ${Math.abs(p) > lim || cz[3] ? 'st-no' : 'st-ok'}" style="margin-left:4px">${pctTxt(p)}</span>${cz[3] ? `<br><span style="color:var(--bad);font-size:12.5px">${cz[3]} dia${cz[3] > 1 ? 's' : ''} com diferença acima de ${String(lim).replace('.', ',')}%</span>` : ''}</div>` : '<div class="muted" style="font-size:12.5px">Nenhum dia com lançamento dos dois para comparar.</div>'}
    <button class="btn" data-act="comparar" data-id="${esc(l.IdLoja)}" data-mes="${mes}">${ICON.cal}Comparar dia a dia</button>
  </div></div>`;
}

/* ---------- Comparar dia a dia (auditoria × Com21) ---------- */
VIEWS.comparar = (p) => {
  const l = lojaById(p.id);
  if (!l) return { html: topbar({ title: 'Comparar', backBtn: true }) + '<div class="empty">Loja não encontrada.</div>' };
  const c = baseContrato(l.Contrato);
  S.lojCache = S.lojCache || {};
  const dados = S.lojCache[c];
  if (!dados && !(S.lojBusy || {})[c]) {
    S.lojBusy = Object.assign({}, S.lojBusy, { [c]: true });
    api('lojistaContrato', { contrato: c }).then(r => { S.lojCache[c] = r; }).catch(e => { S.lojCache[c] = { erro: e.message }; }).finally(() => { S.lojBusy[c] = false; refresh(); });
  }
  const mes = p.mes || today().slice(0, 7);
  const lim = (S.anal && +S.anal.limite) || +cfg('div_limite') || 5;
  const M = merged();
  let corpo = '';
  if (!dados) corpo = '<div class="loading">Buscando os dados do Com21…</div>';
  else if (dados.erro) corpo = `<div class="gutter"><div class="alert bad"><div>${esc(dados.erro)}</div></div></div>`;
  else {
    const loj = {}; dados.lojista.forEach(x => { if (x[0].startsWith(mes)) loj[x[0]] = x; });
    const partes = partesDe(l);
    let sa = 0, sl = 0;
    const linhas = [];
    for (let d = daysIn(mes); d >= 1; d--) {
      const k = mes + '-' + pad(d);
      if (k > today()) continue;
      const au = k in dados.auditoria ? dados.auditoria[k] : (lojasPorContrato().get(c) || []).reduce((s, x) => { const v = M.byLojaData.get(x.IdLoja + '|' + k); return v ? (s || 0) + (+v.vendas || 0) : s; }, null);
      const lo = loj[k] ? loj[k][1] : null;
      if (au == null && lo == null) continue;
      const pd = au != null && lo != null ? (lo ? (au - lo) / lo * 100 : (au ? 100 : 0)) : null;
      if (pd != null) { sa += au; sl += lo; }
      linhas.push(`<div class="row" style="grid-template-columns:1fr auto">
        <div><div class="t">${esc(diaLongo(k))}</div><div class="s">Auditoria ${au == null ? '<b>sem lançamento</b>' : money(au)} · lojista ${lo == null ? '<b>não declarou</b>' : money(lo)}${lo != null && partes.length ? '<br>' + partes.map((n, i) => n + ' ' + money(loj[k][i + 2])).join(' · ') : ''}</div></div>
        <div class="v">${pd == null ? '<span class="status" style="background:var(--soft);color:var(--muted)">—</span>' : `<span class="status ${Math.abs(pd) > lim ? 'st-no' : 'st-ok'}">${pctTxt(pd)}</span>`}</div></div>`);
    }
    corpo = `<div class="gutter section"><div class="kpis">
        <div class="kpi"><span class="l">Auditoria</span><span class="v num">${money(sa)}</span><span class="d muted">dias com os dois</span></div>
        <div class="kpi"><span class="l">Lojista</span><span class="v num">${money(sl)}</span><span class="d muted">mesmos dias</span></div>
        <div class="kpi wide"><span class="l">Diferença</span><span class="v num">${sl ? pctTxt((sa - sl) / sl * 100) : '—'}</span><span class="d muted">limite aceitável por dia: ${String(lim).replace('.', ',')}%</span></div></div></div>
      <div class="list">${linhas.join('') || '<div class="empty">Sem dados neste mês.</div>'}</div>`;
  }
  const html = `${topbar({ title: l.NomeFantasia, sub: 'Auditoria × lojista (Com21)', backBtn: true })}
  <main><div class="wrap">
    <div class="gutter section"><div class="month-nav">
      <button class="cal-nav" data-act="lojaMes" data-mes="${addMonth(mes, -1)}" aria-label="Mês anterior">${ICON.left}</button>
      <strong>${esc(mesNome(mes))}</strong>
      <button class="cal-nav" data-act="lojaMes" data-mes="${addMonth(mes, 1)}" ${mes >= today().slice(0, 7) ? 'disabled' : ''} aria-label="Próximo mês">${ICON.right}</button></div></div>
    ${corpo}
  </div></main>`;
  return { html };
};

/* ---------- Mapa de calor ---------- */
const lucNorm = s => String(s || '').toUpperCase().replace(/[+\s]/g, '').replace(/^0+(?=[0-9A-Z])/, '');
function lojaPorLuc(luc) {
  const n = lucNorm(luc); if (!n) return null;
  const cand = lojasAll().filter(l => { const x = lucNorm(l.Luc); return x === n || (x.startsWith(n) && !/[0-9]/.test(x.charAt(n.length))) || x.split('/')[0] === n; });
  cand.sort((a, b) => (a['Situação'] === 'Inativo') - (b['Situação'] === 'Inativo') || ehEventual(a) - ehEventual(b) || partesDe(b).length - partesDe(a).length);
  return cand[0] || null;
}
function contratoPorLuc(luc) {
  if (!S.anal) return '';
  const n = lucNorm(luc); if (!n) return '';
  let best = '', dt = '';
  for (const [c, k] of Object.entries(S.anal.contratos)) { if (lucNorm(k.luc) === n && k.ultima > dt) { best = c; dt = k.ultima; } }
  return best;
}
function mapaLinhas() { const o = {}; ((S.data && S.data.mapa) || []).forEach(r => { o[r.Espaco] = r; }); return o; }
function resolverEspaco(e, linhas) {
  const r = (linhas || mapaLinhas())[e.id];
  if (r) {
    if (r.IdLoja) { const l = lojaById(r.IdLoja); if (l) return { loja: l, contrato: baseContrato(l.Contrato), nome: l.NomeFantasia, escolhido: true }; }
    if (r.Contrato) return { loja: lojaDoContrato(r.Contrato), contrato: r.Contrato, nome: nomeContrato(r.Contrato), escolhido: true };
    return { vazio: true, nome: r.Rotulo || 'Disponível', escolhido: true };
  }
  if (e.vaga) return { vazio: true, nome: e.nome === 'Expansão' ? 'Expansão' : 'Disponível' };
  const l = lojaPorLuc(e.luc);
  if (l) return { loja: l, contrato: baseContrato(l.Contrato), nome: l.NomeFantasia };
  const c = contratoPorLuc(e.luc);
  if (c) return { contrato: c, nome: nomeContrato(c) };
  return { nome: e.nome || ('LUC ' + e.luc), semLoja: true };
}
const MET = {
  vendas: { nome: 'Vendas', ks: ['mapa_vendas_verm', 'mapa_vendas_verde'], fmt: v => kShort(v).replace('mi', 'M').replace('k', 'K'), unid: v => moneyShort(v) },
  m2: { nome: 'R$ por m²', ks: ['mapa_m2_verm', 'mapa_m2_verde'], fmt: v => int(v), unid: v => money(v) + '/m²' },
  cresc: { nome: 'Cresc. a/a', ks: ['mapa_cresc_verm', 'mapa_cresc_verde'], fmt: v => pctTxt(v, 0), unid: v => pctTxt(v) },
  div: { nome: 'Divergência', ks: ['mapa_div_verm', 'mapa_div_verde'], fmt: v => pctTxt(v, 0).replace('+', ''), unid: v => pctTxt(v).replace('+', ''), inverso: true }
};
function faixa(met, v) {
  if (v == null || !isFinite(v)) return 'na';
  const [kr, kg] = MET[met].ks; const r = +cfg(kr), g = +cfg(kg);
  if (MET[met].inverso) return v <= g ? 'ok' : v > r ? 'bad' : 'mid';
  return v < r ? 'bad' : v >= g ? 'ok' : 'mid';
}
function legendaFaixas(met) {
  const [kr, kg] = MET[met].ks; const r = +cfg(kr), g = +cfg(kg);
  const f = met === 'vendas' ? moneyShort : met === 'm2' ? (v => money(v)) : (v => String(v).replace('.', ',') + '%');
  const it = MET[met].inverso
    ? [['ok', 'até ' + f(g)], ['mid', f(g) + ' a ' + f(r)], ['bad', 'acima de ' + f(r)]]
    : [['bad', 'abaixo de ' + f(r)], ['mid', f(r) + ' a ' + f(g)], ['ok', f(g) + ' ou mais']];
  return it.concat([['na', 'sem dados / disponível']]).map(([k, t]) => `<span><i class="hm-${k}"></i>${esc(t)}</span>`).join('');
}
/* valor de um espaço: fonte 'com21' (lojista) ou 'aud' (auditoria) */
function valoresEspaco(res, m, fonte) {
  const out = { vendas: null, m2: null, cresc: null, div: null };
  if (!res || res.vazio || (!res.contrato && !res.loja)) return out;
  const c = res.contrato;
  const abl = c ? ablContrato(c) : ablNum(res.loja);
  if (fonte === 'aud') {
    const ids = c ? (lojasPorContrato().get(c) || []).map(l => l.IdLoja) : [res.loja.IdLoja];
    const tot = mm => { const o = (S.data && S.data.mensal[mm]) || {}; let s = null; ids.forEach(id => { if (o[id]) s = (s || 0) + o[id][0]; }); return s; };
    out.vendas = tot(m);
    const fechado = m < today().slice(0, 7);
    const ly = tot(addMonth(m, -12));
    if (out.vendas != null && fechado && ly) out.cresc = variacao(out.vendas, ly);
  } else if (S.anal && c) {
    const D = com21Mes(m);
    out.vendas = c in D.cur ? D.cur[c] : null;
    if (out.vendas != null && D.ly[c]) out.cresc = variacao(out.vendas, D.ly[c]);
  }
  if (out.vendas != null && abl > 0) out.m2 = out.vendas / abl;
  if (S.anal && c) { const cz = ((S.anal.cruz || {})[m] || {})[c]; if (cz && cz[1]) out.div = Math.abs(cz[0] - cz[1]) / cz[1] * 100; }
  return out;
}

VIEWS.mapa = () => {
  const P = window.MAPA_PLANTA;
  if (!S.anal && !S.analBusy && !S.analErr) loadAnal();
  const pisos = P ? Object.keys(P) : [];
  const piso = pisos.includes(S.ui.mapaPiso) ? S.ui.mapaPiso : pisos[0];
  const met = S.ui.mapaMet || 'vendas';
  let fonte = S.ui.mapaFonte || (S.anal && S.anal.ultima ? 'com21' : 'aud');
  if (met === 'div') fonte = 'com21';
  const ms = fonte === 'com21' ? mesesCom21() : Object.keys((S.data && S.data.mensal) || {}).sort();
  let m = S.ui.anMes || (fonte === 'com21' && S.anal && S.anal.ultima ? S.anal.ultima.slice(0, 7) : today().slice(0, 7));
  if (ms.length && !ms.includes(m)) m = ms[ms.length - 1];
  const edit = S.ui.mapaEdit && isMaster();
  const head = `${topbar({ title: 'Painel', sub: 'Mapa de calor por piso' })}
  <main><div class="wrap"><div class="gutter" style="padding-top:14px">${painelAbas()}</div>`;
  if (!P) return { html: head + '<div class="empty">Planta não encontrada no app.</div></div></main>' + navbar('painel') };
  const F = P[piso];
  const linhasMapa = mapaLinhas();
  const itens = F.espacos.map(e => { const r = resolverEspaco(e, linhasMapa); const vals = valoresEspaco(r, m, fonte); return { e, r, vals, v: vals[met] }; });
  // rótulo só no maior pedaço de cada loja
  const chave = it => it.r.loja ? 'L' + it.r.loja.IdLoja : it.r.contrato ? 'C' + it.r.contrato : 'E' + it.e.id;
  const maior = {};
  itens.forEach(it => { const k = chave(it); if (!maior[k] || it.e.w * it.e.h > maior[k].e.w * maior[k].e.h) maior[k] = it; });
  const zoom = S.ui.mapaZoom || 1;
  const sel = S.ui.mapaSel ? itens.find(it => it.e.id === S.ui.mapaSel) : null;
  let svg = `<svg viewBox="0 0 ${F.w} ${F.h}" class="planta" style="width:${zoom * 100}%" role="img" aria-label="Planta do piso ${esc(piso)}">`;
  F.corredor.forEach(c => { svg += `<rect x="${c[0]}" y="${c[1]}" width="${c[2]}" height="${c[3]}" class="hm-corr"/>`; });
  itens.forEach(it => {
    const { e } = it;
    const fx = edit ? (it.r.vazio ? 'na' : it.r.semLoja ? 'na' : 'edit') : (it.r.vazio ? 'na' : faixa(met, it.v));
    svg += `<g data-esp="${e.id}" style="cursor:pointer"><rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" class="hm-${fx}${sel && sel.e.id === e.id ? ' hm-sel' : ''}"/>`;
    const lab = edit ? (it.r.vazio ? (it.r.nome === 'Expansão' ? 'Expansão' : 'Vago') : it.r.nome) : (it.v == null || maior[chave(it)] !== it ? '' : MET[met].fmt(it.v));
    if (lab) {
      const txt = edit ? lab.slice(0, Math.max(3, Math.floor(e.w / 17))) : lab;
      const fs = Math.min(edit ? 30 : 44, e.w / (txt.length * 0.6 + 0.4), e.h * 0.42);
      if (fs >= (edit ? 12 : 15)) svg += `<text x="${e.x + e.w / 2}" y="${e.y + e.h / 2 + fs * 0.36}" font-size="${fs.toFixed(0)}" class="hm-txt">${esc(txt)}</text>`;
    }
    svg += '</g>';
  });
  svg += '</svg>';
  const lista = itens.filter(it => !it.r.vazio && maior[chave(it)] === it).sort((a, b) => (b.v == null ? -Infinity : b.v) - (a.v == null ? -Infinity : a.v));
  const vagos = itens.filter(it => it.r.vazio).length;
  const selHtml = sel ? (() => {
    const r = sel.r, v = sel.vals;
    return `<div class="card" style="padding:14px;display:grid;gap:8px;border-left:6px solid var(--hm-${r.vazio ? 'na' : faixa(met, sel.v)})">
      <div style="display:flex;justify-content:space-between;gap:8px"><div><b style="font-size:16px">${esc(r.nome)}</b><div class="muted" style="font-size:12.5px">Espaço ${esc(sel.e.id)}${sel.e.luc ? ' · LUC na planta ' + esc(sel.e.luc) : ''}${r.escolhido ? ' · escolhido pelo master' : ''}</div></div><button class="icon-btn" data-act="mapaFechar" aria-label="Fechar">${ICON.x}</button></div>
      ${r.vazio ? '<span class="muted">Espaço sem loja.</span>' : `<div class="kpis" style="grid-template-columns:1fr 1fr">${Object.keys(MET).map(k => `<div class="kpi" style="padding:10px"><span class="l">${MET[k].nome}</span><span class="v num" style="font-size:17px">${v[k] == null ? '—' : MET[k].unid(v[k])}</span></div>`).join('')}</div>`}
      <div style="display:grid;grid-template-columns:${r.loja && isMaster() ? '1fr 1fr' : '1fr'};gap:8px">
        ${r.loja ? `<button class="btn" data-loja="${esc(r.loja.IdLoja)}" data-lojames="${m}">${ICON.store}Abrir loja</button>` : ''}
        ${isMaster() ? `<button class="btn" data-act="mapaTrocar" data-id="${esc(sel.e.id)}">${ICON.edit}Trocar loja</button>` : ''}
      </div></div>`;
  })() : '';
  const html = head + `
    <div class="gutter section" style="display:grid;gap:10px">
      <div class="seg">${pisos.map(p => `<button data-mpiso="${p}" aria-pressed="${p === piso}">${p}</button>`).join('')}</div>
      <div class="seg" style="font-size:12.5px">${Object.keys(MET).map(k => `<button data-mmet="${k}" aria-pressed="${met === k}">${MET[k].nome}</button>`).join('')}</div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        ${met === 'div' ? '<span class="muted" style="font-size:12.5px">Divergência compara auditoria × lojista</span>' : `<div class="seg" style="flex:1;min-width:220px;font-size:12.5px">${[['com21', 'Lojista (Com21)'], ['aud', 'Auditoria']].map(([k, l]) => `<button data-mfonte="${k}" aria-pressed="${fonte === k}">${l}</button>`).join('')}</div>`}
      </div>
      <div class="month-nav">
        <button class="cal-nav" data-act="anMes" data-mes="${addMonth(m, -1)}" ${ms.length && m <= ms[0] ? 'disabled' : ''} aria-label="Mês anterior">${ICON.left}</button>
        <strong>${esc(mesNome(m))}${fonte === 'com21' && S.anal && S.anal.comp && S.anal.comp.mes === m && S.anal.comp.ate < daysIn(m) ? ` <span class="muted" style="font-weight:600;font-size:13px">até dia ${S.anal.comp.ate}</span>` : ''}</strong>
        <button class="cal-nav" data-act="anMes" data-mes="${addMonth(m, 1)}" ${ms.length && m >= ms[ms.length - 1] ? 'disabled' : ''} aria-label="Próximo mês">${ICON.right}</button>
      </div>
      ${fonte === 'com21' && !S.anal ? `<div class="alert warn"><div>${S.analBusy ? 'Carregando os dados do Com21…' : 'Sem dados do Com21 neste aparelho ainda.'}</div></div>` : ''}
      ${edit ? '<div class="alert warn"><div><b>Modo edição.</b> Toque num espaço para escolher a loja que fica nele. Os nomes mostram a loja atual de cada espaço.</div></div>' : ''}
    </div>
    <div class="planta-wrap gutter"><div class="planta-scroll">${svg}</div>
      <div class="planta-zoom">${[[1, '1×'], [1.7, '2×'], [2.6, '3×']].map(([z, l]) => `<button data-act="mapaZoom" data-z="${z}" aria-pressed="${zoom === z}">${l}</button>`).join('')}</div></div>
    <div class="gutter" style="display:grid;gap:10px;padding-top:10px">
      ${edit ? '' : `<div class="legend hm-legend">${legendaFaixas(met)}</div>`}
      ${selHtml}
      ${isMaster() ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><button class="btn ${edit ? 'primary' : ''}" data-act="mapaEdit">${ICON.edit}${edit ? 'Concluir edição' : 'Escolher lojas'}</button><button class="btn" data-act="faixas">${ICON.chart}Faixas de cor</button></div>` : ''}
    </div>
    <div class="section">
      <h3 class="h2 gutter">Lojas do ${esc(piso)} <span>${lista.length}${vagos ? ' · ' + vagos + ' espaço' + (vagos > 1 ? 's' : '') + ' vago' + (vagos > 1 ? 's' : '') : ''}</span></h3>
      <div class="list">${lista.map(it => `<button class="row" style="grid-template-columns:auto 1fr auto;gap:12px" data-esp="${it.e.id}"><span class="hm-dot hm-${faixa(met, it.v)}"></span><div><div class="t">${esc(it.r.nome)}</div><div class="s">${it.r.loja ? 'LUC ' + esc(it.r.loja.Luc) : it.r.contrato ? 'Contrato ' + esc(it.r.contrato) : 'sem loja ligada'}</div></div><div class="v num">${it.v == null ? '—' : esc(MET[met].unid(it.v))}</div></button>`).join('')}</div>
    </div>
  </div></main>
  ${navbar('painel')}`;
  return { html };
};

/* ---------- Escolher a loja de um espaço (master) ---------- */
VIEWS.mapaEspaco = (p) => {
  const P = window.MAPA_PLANTA || {};
  let e = null; Object.values(P).forEach(f => f.espacos.forEach(x => { if (x.id === p.id) e = x; }));
  if (!e || !isMaster()) return { html: topbar({ title: 'Espaço', backBtn: true }) + '<div class="empty">Espaço não encontrado.</div>' };
  const r = resolverEspaco(e);
  const sug = (() => { const x = Object.assign({}, e); return resolverEspaco(x, {}); })();
  const piso = p.id.slice(0, 2);
  const ls = lojasAll().slice().sort((a, b) => (a['Situação'] === 'Inativo') - (b['Situação'] === 'Inativo') || ((a.Piso === piso) ? 0 : 1) - ((b.Piso === piso) ? 0 : 1) || String(a.Luc).localeCompare(String(b.Luc), 'pt-BR', { numeric: true }));
  const contratosLivres = S.anal ? Object.keys(S.anal.contratos).filter(c => !lojaDoContrato(c)).sort((a, b) => (S.anal.contratos[b].ultima || '').localeCompare(S.anal.contratos[a].ultima || '')) : [];
  const opt = (val, t, s, on) => `<button class="row" style="grid-template-columns:1fr auto" data-act="escolher" data-val="${esc(val)}" data-busca="${esc(norm(t + ' ' + s))}"><div><div class="t">${esc(t)}</div><div class="s">${esc(s)}</div></div><div class="v">${on ? '<span class="status st-ok">Atual</span>' : ''}</div></button>`;
  const html = `${topbar({ title: 'Espaço ' + p.id, sub: 'Qual loja fica aqui?', backBtn: true })}
  <main><div class="wrap">
    <div class="gutter section" style="display:grid;gap:8px">
      <div class="card" style="padding:12px 14px"><b>Agora:</b> ${esc(r.nome)}${r.escolhido ? '' : ' <span class="muted">(sugestão pela LUC da planta)</span>'}<div class="muted" style="font-size:12.5px">${e.luc ? 'LUC na planta: ' + esc(e.luc) + ' · ' : ''}${Math.round(e.w)}×${Math.round(e.h)} no desenho</div></div>
      <div class="search" style="padding:0"><input id="espBusca" type="search" placeholder="Buscar loja, LUC ou contrato…" value="${esc(S.ui.espBusca || '')}" autocomplete="off"></div>
      <div id="espErr"></div>
    </div>
    <div class="list" id="espOpts">
      ${opt('', 'Usar a sugestão da planta', sug.nome, !r.escolhido)}
      ${opt('V:Disponível', 'Disponível (espaço vago)', 'fica cinza no mapa', r.escolhido && r.vazio && r.nome === 'Disponível')}
      ${opt('V:Expansão', 'Expansão / obra', 'fica cinza no mapa', r.escolhido && r.vazio && r.nome === 'Expansão')}
      ${ls.map(l => opt('L:' + l.IdLoja, l.NomeFantasia, `LUC ${l.Luc} · ${l.Piso || '—'}${l.Contrato ? ' · contrato ' + l.Contrato : ''}${l['Situação'] === 'Inativo' ? ' · inativa' : ''}`, r.escolhido && r.loja && r.loja.IdLoja === l.IdLoja)).join('')}
      ${contratosLivres.length ? `<div class="group-h"><span>Só no Com21 (sem cadastro no app)</span></div>` + contratosLivres.map(c => { const k = S.anal.contratos[c]; return opt('C:' + c, tituloCase(k.nome), `Contrato ${c} · LUC ${k.luc} · último dado ${dBR(k.ultima)}`, r.escolhido && !r.loja && r.contrato === c); }).join('') : ''}
    </div>
  </div></main>`;
  return { html, mount() { filtrarEscolhas(); } };
};
function filtrarEscolhas() {
  const q = norm(S.ui.espBusca || '');
  $$('#espOpts [data-busca]').forEach(b => { b.hidden = !!q && !b.dataset.busca.includes(q) && b.dataset.val !== ''; });
}
async function escolherEspaco(id, val) {
  if (!DEMO && !navigator.onLine) { $('#espErr').innerHTML = '<div class="alert bad">Alterar o mapa precisa de internet.</div>'; return; }
  const m = val === '' ? null : val.startsWith('L:') ? { IdLoja: val.slice(2) } : val.startsWith('C:') ? { Contrato: val.slice(2) } : { Rotulo: val.slice(2) };
  if (m) m.Piso = id.slice(0, 2);
  $$('#espOpts button').forEach(b => { b.disabled = true; });
  try {
    const r = await api('salvarMapa', { mudancas: { [id]: m } });
    if (S.data) S.data.mapa = r.mapa;
    S.ver++; await persist();
    S.ui.espBusca = '';
    toast('Mapa atualizado.');
    back();
  } catch (e) { $('#espErr').innerHTML = `<div class="alert bad">${esc(e.message)}</div>`; $$('#espOpts button').forEach(b => { b.disabled = false; }); }
}

/* ---------- Faixas de cor e limites (master) ---------- */
VIEWS.faixas = () => {
  if (!isMaster()) return VIEWS.painel();
  const campo = (k, rot, hint) => `<div class="field"><label for="cf_${k}">${rot}</label><input class="input num" id="cf_${k}" data-fx="${k}" inputmode="decimal" value="${esc(String(cfg(k)).replace('.', ','))}">${hint ? `<div class="hint">${hint}</div>` : ''}</div>`;
  const bloco = (met, t, a, b, hint) => `<div class="card" style="padding:14px;display:grid;gap:10px"><b>${t}</b><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${a}${b}</div><div class="hm-legend legend" style="margin:0">${legendaFaixas(met)}</div>${hint ? `<div class="hint muted" style="font-size:12.5px">${hint}</div>` : ''}</div>`;
  const html = `${topbar({ title: 'Faixas de cor e limites', backBtn: true })}
  <main class="form-main"><div class="wrap gutter" style="display:grid;gap:14px;padding-top:14px">
    <div class="muted" style="font-size:13.5px">Defina a partir de quando cada loja fica <b style="color:var(--hm-bad)">vermelha</b>, <b style="color:#b8860b">amarela</b> ou <b style="color:var(--hm-ok)">verde</b> no mapa. Vale para todas as lojas e para todos que veem o mapa.</div>
    ${bloco('vendas', 'Vendas do mês (R$)', campo('mapa_vendas_verm', 'Vermelho abaixo de'), campo('mapa_vendas_verde', 'Verde a partir de'))}
    ${bloco('m2', 'Venda por m² no mês (R$/m²)', campo('mapa_m2_verm', 'Vermelho abaixo de'), campo('mapa_m2_verde', 'Verde a partir de'))}
    ${bloco('cresc', 'Crescimento sobre o mesmo mês do ano anterior (%)', campo('mapa_cresc_verm', 'Vermelho abaixo de'), campo('mapa_cresc_verde', 'Verde a partir de'), 'Use número negativo para queda (ex.: -5).')}
    ${bloco('div', 'Divergência auditoria × lojista (%)', campo('mapa_div_verde', 'Verde até'), campo('mapa_div_verm', 'Vermelho acima de'), 'Aqui quanto menor, melhor.')}
    <div class="card" style="padding:14px;display:grid;gap:10px"><b>Análises</b>${campo('div_limite', 'Diferença aceitável por dia entre auditoria e lojista (%)', 'Dias acima disso aparecem como "com diferença" nas análises e na comparação dia a dia.')}</div>
    <div id="fxErr"></div>
  </div></main>
  <div class="formbar"><button class="btn" data-act="back">Cancelar</button><button class="btn primary" data-act="saveFaixas">${ICON.check}Salvar</button></div>`;
  return { html, form: true };
};
async function saveFaixas() {
  if (!DEMO && !navigator.onLine) { $('#fxErr').innerHTML = '<div class="alert bad">Precisa de internet.</div>'; return; }
  const valores = {}; let erro = '';
  $$('[data-fx]').forEach(i => { const v = i.value.trim().replace(/\./g, '').replace(',', '.'); if (!/^-?\d+(\.\d+)?$/.test(v)) erro = 'Use apenas números.'; valores[i.dataset.fx] = +v; });
  const par = (a, b, msg) => { if (!erro && valores[a] > valores[b]) erro = msg; };
  par('mapa_vendas_verm', 'mapa_vendas_verde', 'Vendas: o limite do vermelho deve ser menor que o do verde.');
  par('mapa_m2_verm', 'mapa_m2_verde', 'Venda por m²: o limite do vermelho deve ser menor que o do verde.');
  par('mapa_cresc_verm', 'mapa_cresc_verde', 'Crescimento: o limite do vermelho deve ser menor que o do verde.');
  par('mapa_div_verde', 'mapa_div_verm', 'Divergência: o limite do verde deve ser menor que o do vermelho.');
  if (erro) { $('#fxErr').innerHTML = `<div class="alert bad">${esc(erro)}</div>`; return; }
  const btn = $('[data-act="saveFaixas"]'); btn.disabled = true;
  try {
    const r = await api('salvarConfig', { valores });
    if (S.data) S.data.config = r.config;
    if (S.anal) S.anal.limite = r.config.div_limite;
    S.ver++; await persist();
    toast('Faixas salvas.');
    back();
    if (S.anal && valores.div_limite !== undefined) loadAnal(true);
  } catch (e) { $('#fxErr').innerHTML = `<div class="alert bad">${esc(e.message)}</div>`; btn.disabled = false; }
}

/* ---------- Importar o relatório do Com21 (master) ---------- */
const nrmCab = s => norm(s).replace(/[^a-z0-9]/g, '');
const CAB_COM21 = ['datadavenda', 'numerodocontrato', 'loja', 'nomefantasia', 'tipodeloja', 'ramodeatividade', 'vendas1', 'vendas2', 'vendas3', 'vendastotais'];
function numBR(v) {
  if (typeof v === 'number') return v;
  let s = String(v == null ? '' : v).replace(/[^\d,.-]/g, '');
  if (!s) return 0;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s); return isNaN(n) ? 0 : n;
}
function ymdCom21(v) {
  if (typeof v === 'number' && v > 20000 && v < 80000) { const d = new Date(Math.round((v - 25569) * 864e5)); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); }
  const s = String(v == null ? '' : v).trim();
  let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/); if (m) return m[3] + '-' + pad(m[2]) + '-' + pad(m[1]);
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[0] : '';
}
async function lerArquivoCom21(file) {
  if (!file) return;
  S.imp = { lendo: true, nome: file.name }; render();
  try {
    if (!window.XLSX) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
    const buf = await file.arrayBuffer();
    const wb = window.XLSX.read(buf, { type: 'array', raw: /\.csv$/i.test(file.name) });
    let rows = null, pos = null;
    for (const nome of wb.SheetNames) {
      const aoa = window.XLSX.utils.sheet_to_json(wb.Sheets[nome], { header: 1, raw: true, defval: '' });
      for (let i = 0; i < Math.min(15, aoa.length); i++) {
        const cab = aoa[i].map(nrmCab);
        if (cab.includes('datadavenda') && cab.includes('vendastotais')) { pos = CAB_COM21.map(c => cab.indexOf(c)); rows = aoa.slice(i + 1); break; }
      }
      if (rows) break;
    }
    if (!rows) throw new Error('Não encontrei as colunas "Data da Venda" e "Vendas Totais". Use o relatório de vendas totais do Com21.');
    const linhas = []; let ign = 0;
    rows.forEach(r => {
      const g = k => pos[k] < 0 ? '' : r[pos[k]];
      const d = ymdCom21(g(0)), c = String(g(1) == null ? '' : g(1)).trim();
      if (!d || !c) { if (r.some(x => x !== '' && x != null)) ign++; return; }
      const v1 = numBR(g(6)), v2 = numBR(g(7)), v3 = numBR(g(8));
      const tot = pos[9] < 0 || g(9) === '' ? v1 + v2 + v3 : numBR(g(9));
      linhas.push([d, c, String(g(2)).trim(), String(g(3)).trim(), String(g(4)).trim(), String(g(5)).trim(), v1, v2, v3, Math.round(tot * 100) / 100]);
    });
    if (!linhas.length) throw new Error('O arquivo não tem linhas de venda.');
    const ds = linhas.map(l => l[0]).sort();
    const contratos = Array.from(new Set(linhas.map(l => l[1])));
    S.imp = { nome: file.name, linhas, ign, de: ds[0], ate: ds[ds.length - 1], contratos, total: linhas.reduce((s, l) => s + l[9], 0) };
  } catch (e) { S.imp = { erro: e.message }; }
  render();
}
async function enviarImportacao() {
  const I = S.imp; if (!I || !I.linhas || I.enviando) return;
  if (!DEMO && !navigator.onLine) return toast('Importar precisa de internet.');
  I.enviando = true; I.feito = 0; render();
  const TAM = 8000;
  try {
    for (let i = 0; i < I.linhas.length; i += TAM) {
      await api('importarLojista', { linhas: I.linhas.slice(i, i + TAM), inicio: i === 0, ultima: i + TAM >= I.linhas.length, de: I.de, ate: I.ate, contratos: I.contratos, totalLinhas: I.linhas.length });
      I.feito = Math.min(I.linhas.length, i + TAM);
      const b = $('#impProg'); if (b) { b.style.width = (I.feito / I.linhas.length * 100).toFixed(0) + '%'; $('#impProgTxt').textContent = int(I.feito) + ' de ' + int(I.linhas.length) + ' linhas enviadas'; }
    }
    S.imp = { ok: `${int(I.linhas.length)} linhas importadas (${dBR(I.de)} a ${dBR(I.ate)}).` };
    toast('Vendas do Com21 importadas.');
    loadAnal(true);
  } catch (e) { I.enviando = false; I.erroEnvio = e.message + (I.feito ? ` (${int(I.feito)} linhas já tinham sido enviadas; importe o arquivo de novo para completar)` : ''); }
  render();
}
async function importarColado() {
  if (!DEMO && !navigator.onLine) return toast('Precisa de internet.');
  const btn = $('[data-act="impColado"]'); if (btn) { btn.disabled = true; btn.lastChild.textContent = 'Processando…'; }
  try {
    const r = await api('importarColado');
    S.imp = { ok: `${int(r.linhas)} linhas importadas da aba Com21_Colar (${dBR(r.de)} a ${dBR(r.ate)}).` };
    loadAnal(true);
  } catch (e) { S.imp = { erro: e.message }; }
  render();
}
VIEWS.importar = () => {
  if (!isMaster()) return VIEWS.painel();
  const I = S.imp || {};
  const html = `${topbar({ title: 'Importar vendas do Com21', backBtn: true })}
  <main><div class="wrap gutter" style="display:grid;gap:14px;padding-top:14px">
    ${I.ok ? `<div class="alert ok"><div>${esc(I.ok)}</div></div>` : ''}
    ${I.erro ? `<div class="alert bad"><div>${esc(I.erro)}</div></div>` : ''}
    <div class="card" style="padding:16px;display:grid;gap:12px">
      <b>1. Pelo arquivo do Com21</b>
      <div class="muted" style="font-size:13.5px">Escolha o relatório de vendas totais (.xlsx) exportado do Com21, com as colunas Data da Venda, Numero Do Contrato, Loja, Nome Fantasia, Vendas1, Vendas2, Vendas3 e Vendas Totais. Pode ser de um mês ou de vários.</div>
      <label class="btn primary" style="position:relative">${ICON.plus}Escolher arquivo<input type="file" id="impArq" accept=".xlsx,.xls,.csv" style="position:absolute;inset:0;opacity:0"></label>
      ${I.lendo ? `<div class="loading">Lendo ${esc(I.nome)}…</div>` : ''}
      ${I.linhas ? `<div class="kpis">
        <div class="kpi wide"><span class="l">${esc(I.nome)}</span><span class="v num">${dBR(I.de)} a ${dBR(I.ate)}</span></div>
        <div class="kpi"><span class="l">Linhas</span><span class="v num">${int(I.linhas.length)}</span>${I.ign ? `<span class="d muted">${I.ign} ignoradas</span>` : ''}</div>
        <div class="kpi"><span class="l">Contratos</span><span class="v num">${int(I.contratos.length)}</span></div>
        <div class="kpi wide"><span class="l">Vendas totais no arquivo</span><span class="v num">${money(I.total)}</span></div></div>
        <div class="alert warn"><div>As vendas desses contratos entre ${dBR(I.de)} e ${dBR(I.ate)} que já estiverem na planilha serão <b>substituídas</b> pelas do arquivo. O resto fica como está.</div></div>
        ${I.erroEnvio ? `<div class="alert bad"><div>${esc(I.erroEnvio)}</div></div>` : ''}
        ${I.enviando ? `<div class="bar"><i id="impProg" style="width:${I.feito ? (I.feito / I.linhas.length * 100).toFixed(0) : 2}%"></i></div><div class="muted num" id="impProgTxt" style="font-size:13px">Enviando…</div>`
          : `<button class="btn primary" data-act="impEnviar">${ICON.check}Enviar para a planilha</button>`}` : ''}
    </div>
    <div class="card" style="padding:16px;display:grid;gap:10px">
      <b>2. Ou colando na planilha</b>
      <div class="muted" style="font-size:13.5px">Abra a planilha, vá na aba <b>Com21_Colar</b>, cole o relatório a partir da célula A1 (com ou sem o cabeçalho) e toque no botão abaixo. A aba é limpa depois de processar.</div>
      <button class="btn" data-act="impColado">${ICON.sync}Processar a aba Com21_Colar</button>
    </div>
    <div class="muted" style="font-size:12.5px">Os dados ficam na aba <b>Vendas_Lojista</b>. O cinema, a Littera e a Fini entram pelo total; no cinema o app guarda também bilheteria (Vendas1), bomboniere (Vendas2) e publicidade (Vendas3).</div>
  </div></main>`;
  return { html };
};

/* ---------- Juntar as lojas do cinema (master) ---------- */
function cinemaSeparado() {
  return lojasAll().filter(l => /^20102-/.test(String(l.Contrato).trim()) && l['Situação'] !== 'Inativo');
}
VIEWS.cinema = () => {
  const ps = cinemaSeparado();
  const n = merged().list.filter(v => ps.some(l => l.IdLoja === v.loja)).length;
  const html = `${topbar({ title: 'Cinema numa loja só', backBtn: true })}
  <main><div class="wrap gutter" style="display:grid;gap:14px;padding-top:14px">
    ${ps.length ? `<div class="card" style="padding:16px;display:grid;gap:10px">
      <div>Hoje o cinema está em <b>${ps.length} lojas</b>: ${ps.map(l => esc(l.NomeFantasia)).join(', ')}.</div>
      <div>O app vai:</div>
      <ul style="margin:0;padding-left:20px;display:grid;gap:6px;font-size:14px">
        <li>criar a loja <b>Cine Show</b> (LUC 201, contrato 20102), com os campos Bilheteria, Bomboniere e Publicidade no lançamento;</li>
        <li>somar os lançamentos antigos por dia (cada parte no seu campo) na loja nova${n ? ` (${int(n)} lançamentos carregados neste aparelho; os demais são somados na planilha)` : ''};</li>
        <li>guardar os lançamentos originais na aba <b>Dados_Arquivo</b>;</li>
        <li>deixar as ${ps.length} lojas antigas inativas.</li>
      </ul>
      <div class="alert warn"><div>Faça quando ninguém estiver lançando o cinema. Não dá para desfazer pelo app (os originais ficam guardados na aba Dados_Arquivo).</div></div>
      <div id="cineErr"></div>
      <button class="btn primary" data-act="cinemaGo">${ICON.check}Juntar agora</button></div>` : '<div class="alert ok"><div>O cinema já está numa loja só.</div></div>'}
  </div></main>`;
  return { html };
};
async function unificarCinema() {
  if (!DEMO && !navigator.onLine) { $('#cineErr').innerHTML = '<div class="alert bad">Precisa de internet.</div>'; return; }
  if (S.queue.some(q => q.type === 'venda' && cinemaSeparado().some(l => l.IdLoja === q.venda.Loja))) { $('#cineErr').innerHTML = '<div class="alert bad">Há lançamentos do cinema na fila deste aparelho. Sincronize antes.</div>'; return; }
  const btn = $('[data-act="cinemaGo"]'); btn.disabled = true; btn.lastChild.textContent = 'Juntando… (pode levar até 1 minuto)';
  try {
    const r = await api('unificarCinema');
    S.lojaFetched = new Set(); S.mesFetched = new Set();
    toast(r.jaFeito ? 'O cinema já estava unificado.' : `Pronto: ${int(r.lancamentos)} lançamentos viraram ${int(r.dias)} dias em ${r.loja.NomeFantasia}.`);
    await sync({ full: true, quiet: false });
    back();
  } catch (e) { $('#cineErr').innerHTML = `<div class="alert bad">${esc(e.message)}</div>`; btn.disabled = false; btn.lastChild.textContent = 'Juntar agora'; }
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
        <div style="min-width:0;flex:1"><div style="font-weight:800;font-size:17px">${esc(S.user.nome)}</div><div class="muted" style="font-size:13px">${isMaster() ? 'Master — pode alterar todas as informações' : isConsulta() ? 'Consulta — vê painéis, análises e o mapa' : 'Auditor(a) — lança vendas e solicita alterações'}</div></div>
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
      <button class="btn" style="width:100%" data-act="recarregarLogos">${ICON.sync}Recarregar logos das lojas</button>
      <button class="btn" style="width:100%" data-act="rotaConfig">${ICON.route}Lojas da rota diária</button>
      <button class="btn" style="width:100%" data-act="regras">${ICON.chart}Regras e pontuação da equipe</button>
      <h3 class="h2" style="margin:8px 0 0">Lojista e mapa</h3>
      <button class="btn" style="width:100%" data-act="importar">${ICON.sync}Importar vendas do Com21</button>
      <button class="btn" style="width:100%" data-act="faixas">${ICON.chart}Faixas de cor do mapa e limites</button>
      ${cinemaSeparado().length ? `<button class="btn" style="width:100%" data-act="cinema">${ICON.store}Juntar as ${cinemaSeparado().length} lojas do cinema</button>` : ''}
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
      ${S.avisoTroca ? '<div class="alert warn"><div>O app foi conectado a outra planilha. Entre de novo com a sua senha.</div></div>' : ''}
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
      <div><div class="t">${esc(a.nome)}</div><div class="s">${a.perfil || 'Auditor'}</div></div>
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
      <div class="field"><span class="label">Perfil</span>${seg('perfil', ['Auditor', 'Consulta', 'Master'], a.perfil)}
        <div class="hint">Master altera tudo e aprova correções. Auditor lança vendas e pede correções. Consulta só vê painéis, análises, mapa e os totais das lojas (sem assinaturas).</div></div>
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
    S.avisoTroca = false;
    await persist();
    S.stack = [{ v: inicioPerfil(), p: {} }];
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
  S.user = null; S.confirmLogout = false; S.anal = null; S.analAt = 0; S.lojCache = {};
  try { KV.set('anal', null); } catch (e) { /* ok */ }
  await persist();
  S.stack = [{ v: 'login', p: {} }];
  render(); loadAuditores();
}

/* Quando o app passa a usar outra planilha: limpa os dados guardados e pede login de novo.
   O que estava na fila não é enviado automaticamente para a planilha nova. */
async function trocouServidor() {
  S.data = null; S.user = null; S.lastSync = 0; S.auditoresLogin = []; S.anal = null;
  try { await KV.set('anal', null); } catch (e) { /* ok */ }
  S.vmap = new Map(); S.lojaFetched = new Set(); S.mesFetched = new Set();
  S.queue.forEach(q => { q.error = 'Feito antes da troca de planilha. Envie para a planilha nova só se for um lançamento real; senão, descarte.'; q.retry = false; });
  S.avisoTroca = true;
  S.ver++;
  try { await KV.set('auditores', null); } catch (e) { /* ok */ }
  await persist();
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
  const t = e.target.closest('[data-esp],[data-anrank],[data-mpiso],[data-mmet],[data-mfonte],[data-act],[data-hordem],[data-tema],[data-jog],[data-paba],[data-rotatoggle],[data-gmes],[data-aud],[data-segval],[data-solic],[data-ptipo],[data-tab],[data-loja],[data-registrar],[data-venda],[data-filtro],[data-htab],[data-rank],[data-resp],[data-mot],[data-step],[data-who],[data-sit]');
  if (!t || t.disabled) return;
  const d = t.dataset;
  if (d.tab) return tab(d.tab);
  if (d.esp) { if (S.ui.mapaEdit && isMaster()) return go('mapaEspaco', { id: d.esp }); S.ui.mapaSel = S.ui.mapaSel === d.esp ? '' : d.esp; return refresh(); }
  if (d.anrank) { S.ui.anRank = d.anrank; return refresh(); }
  if (d.mpiso) { S.ui.mapaPiso = d.mpiso; S.ui.mapaSel = ''; return refresh(); }
  if (d.mmet) { S.ui.mapaMet = d.mmet; return refresh(); }
  if (d.mfonte) { S.ui.mapaFonte = d.mfonte; return refresh(); }
  if (d.hordem) { S.ui.histOrdem = d.hordem; S.ui.histLim = 12; return render(); }
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
    if (isConsulta()) return;
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
    case 'verEventuais': S.ui.filtro = 'eventuais'; return tab('lojas');
    case 'naoAbriu': return naoAbriu();
    case 'setOperacao': case 'salvarPeriodo': {
      const l = lojaById(d.id); if (!l) return;
      const loja = Object.assign({}, l); delete loja._pending;
      if (d.act === 'setOperacao') { if ((ehEventual(l) ? 'Eventual' : 'Fixa') === d.op) return; loja.Operacao = d.op; }
      else {
        loja.Inicio = $('#opIni').value; loja.Fim = $('#opFim').value;
        if (!loja.Inicio) return toast('Informe a data de início.');
        if (loja.Fim && loja.Fim < loja.Inicio) return toast('O fim não pode ser antes do início.');
      }
      enqueue({ type: 'loja', loja, logo: '' });
      toast(d.act === 'setOperacao' ? `Loja marcada como ${d.op.toLowerCase()}.` : 'Período salvo.');
      return refresh();
    }
    case 'recarregarLogos': S.logos = {}; persistLogos(); toast('Buscando os logos de novo…'); return loadLogos();
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
      { const ob = $('[data-opform][aria-pressed="true"]'); base.Operacao = ob ? ob.dataset.segval : 'Fixa'; base.Inicio = $('#lInicio').value; base.Fim = $('#lFim').value;
        if (base.Inicio && base.Fim && base.Fim < base.Inicio) { toast('O fim não pode ser antes do início.'); return; } }
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
    case 'saveUrl': {
      const novo = $('#cfgUrl').value.trim();
      if (novo === S.apiUrl) return toast('Endereço sem mudança.');
      S.apiUrl = novo;
      return trocouServidor().then(() => { S.stack = [{ v: 'login', p: {} }]; render(); loadAuditores(); });
    }
    case 'setupGo': {
      const u = $('#setUrl').value.trim();
      if (!/^https:\/\/script\.google(usercontent)?\.com\/.+/.test(u)) { $('#setErr').innerHTML = '<div class="alert bad">O endereço deve começar com https://script.google.com/</div>'; return; }
      const mudou = S.apiUrl && S.apiUrl !== u;
      S.apiUrl = u;
      return (mudou ? trocouServidor() : persist()).then(() => { S.stack = [{ v: 'login', p: {} }]; render(); loadAuditores(); });
    }
    case 'resetUrl': S.stack = [{ v: 'setup', p: {} }]; return render();
    case 'loginGo': return doLogin();
    case 'importar': S.imp = null; return go('importar');
    case 'faixas': return go('faixas');
    case 'cinema': return go('cinema');
    case 'cinemaGo': return unificarCinema();
    case 'impEnviar': return enviarImportacao();
    case 'impColado': return importarColado();
    case 'analRecarregar': return loadAnal(true);
    case 'anMes': S.ui.anMes = d.mes; return refresh();
    case 'mapaZoom': S.ui.mapaZoom = +d.z; return refresh();
    case 'mapaEdit': S.ui.mapaEdit = !S.ui.mapaEdit; S.ui.mapaSel = ''; return refresh();
    case 'mapaTrocar': return go('mapaEspaco', { id: d.id });
    case 'mapaFechar': S.ui.mapaSel = ''; return refresh();
    case 'escolher': return escolherEspaco(cur().p.id, d.val);
    case 'saveFaixas': return saveFaixas();
    case 'comparar': return go('comparar', { id: d.id, mes: d.mes });
    case 'anMais': S.ui.anMais = Object.assign({}, S.ui.anMais, { [d.k]: !(S.ui.anMais || {})[d.k] }); return refresh();
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
  if (id === 'espBusca') { S.ui.espBusca = e.target.value; filtrarEscolhas(); }
});
document.addEventListener('change', e => {
  const id = e.target.id;
  const fd = e.target.closest && e.target.closest('.field.invalid'); if (fd) fieldErr(fd.id, '');
  if (id === 'refDate') { S.ui.ref = e.target.value && e.target.value !== ontem() ? e.target.value : ''; render(); }
  if (id === 'fPiso') { S.ui.piso = e.target.value; persist(); render(); }
  if (id === 'fOrdem') { S.ui.ordem = e.target.value; persist(); render(); }
  if (id === 'fAtraso') { S.ui.atrasoDias = +e.target.value; render(); }
  if (e.target.dataset && e.target.dataset.lojaflag) {
    const l = lojaById(e.target.dataset.id); if (!l) return;
    const campo = e.target.dataset.lojaflag;
    const loja = Object.assign({}, l); delete loja._pending;
    loja[campo] = campo === 'Situação' ? (e.target.checked ? 'Ativo' : 'Inativo') : (e.target.checked ? 'Sim' : 'Não');
    enqueue({ type: 'loja', loja, logo: '' });
    toast(campo === 'Situação' ? (e.target.checked ? 'Loja ativada.' : 'Loja desativada.') : (e.target.checked ? 'Loja voltou para a rota.' : 'Loja retirada da rota.'));
    return refresh();
  }
  if (e.target.dataset && e.target.dataset.rotachk) { S.rotaEdit[e.target.dataset.rotachk] = e.target.checked ? 'Sim' : 'Não'; const n = $('#rotaCount'); if (n) n.textContent = rotaConfigResumo(); }
  if (id === 'hAud') { S.ui.histAud = e.target.value; render(); }
  if (id === 'impArq') lerArquivoCom21(e.target.files[0]);
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
  const urlAntes = S.apiUrl;
  if (CFG.apiUrl) S.apiUrl = CFG.apiUrl;
  if (urlAntes && S.apiUrl && urlAntes !== S.apiUrl) await trocouServidor();
  rebuildFromData();
  if (!DEMO && !S.apiUrl) { S.stack = [{ v: 'setup', p: {} }]; return render(); }
  if (!S.user) { S.stack = [{ v: 'login', p: {} }]; render(); return loadAuditores(); }
  S.stack = [{ v: inicioPerfil(), p: {} }];
  try { const an = await KV.get('anal'); if (an && an.r) { S.anal = an.r; S.analAt = an.at || 0; } } catch (e) { /* sem cache */ }
  render();
  sync({ full: true });
})();
