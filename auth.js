/* =====================================================
   SEN MART INTERNATIONAL — auth.js
   Customer login modal · account menu · shipment search

   The page talks to the backend only through `api` below.
   While AUTH_CONFIG.apiBase is null it runs against a built-in
   demo backend (demo account + sample shipments). To go live,
   point apiBase at a server implementing:

     POST {apiBase}/auth/login   { email, password } -> { token, user }
     GET  {apiBase}/me                                -> user
     GET  {apiBase}/shipments?q=&type=&customerCode=  -> shipment[]
     GET  {apiBase}/shipments                         -> shipment[] (all of the user's)
     POST {apiBase}/auth/logout
   Authenticated calls send `Authorization: Bearer <token>`.

   user     = { name, email, company, customerCode }
   shipment = { mode: 'ocean'|'air', hbl, mbl, ref, cntr, carrier,
                pol, pod, etd, eta, status, dates: { booked, departed,
                arrived, cleared, delivered } }
   status   = 'booked' | 'departed' | 'arrived' | 'cleared' | 'delivered'
   ===================================================== */

'use strict';

const AUTH_CONFIG = {
  apiBase: null,
  portalUrl: 'https://coolcopa0303-png.github.io/smallfreight/login/',
};
const SESSION_KEY = 'smintl_session';

// ======================== HELPERS ========================
function currentLang() {
  try { return localStorage.getItem('smintl_lang') === 'zh' ? 'zh' : 'en'; } catch { return 'en'; }
}
const T = (en, zh) => (currentLang() === 'zh' ? zh : en);

function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function readSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || null; } catch { return null; }
}
function writeSession(s) {
  try { s ? localStorage.setItem(SESSION_KEY, JSON.stringify(s)) : localStorage.removeItem(SESSION_KEY); } catch { /* storage blocked */ }
}

function initials(name) {
  return String(name || '?').trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return currentLang() === 'zh'
    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const norm = s => String(s || '').toUpperCase().replace(/[\s-]/g, '');

// ======================== DEMO BACKEND ========================
const demo = (() => {
  const users = [{
    email: 'demo@senmartintl.com', password: 'demo1234',
    user: { name: 'Alex Chen', email: 'demo@senmartintl.com', company: 'Pacific Home Goods LLC', customerCode: 'SM1024' },
  }];
  const shipments = {
    SM1024: [
      { mode: 'ocean', hbl: 'SMNY2409156', mbl: 'COSU6421837150', ref: 'PHG-PO-8831', cntr: 'CSNU7438120', carrier: 'COSCO',
        pol: 'Shanghai, CN', pod: 'New York, NY', etd: '2026-09-18', eta: '2026-10-21', status: 'departed',
        dates: { booked: '2026-09-09', departed: '2026-09-18' } },
      { mode: 'ocean', hbl: 'SMLA2409102', mbl: 'MEDUQY318204', ref: 'PHG-PO-8790', cntr: 'MSCU5521894', carrier: 'MSC',
        pol: 'Ningbo, CN', pod: 'Los Angeles, CA', etd: '2026-09-02', eta: '2026-10-01', status: 'arrived',
        dates: { booked: '2026-08-25', departed: '2026-09-02', arrived: '2026-10-01' } },
      { mode: 'air', hbl: 'SMAIR240988', mbl: '784-55210936', ref: 'PHG-PO-8802', cntr: '', carrier: 'China Southern',
        pol: 'Guangzhou, CN (CAN)', pod: 'New York, NY (JFK)', etd: '2026-09-27', eta: '2026-09-29', status: 'cleared',
        dates: { booked: '2026-09-24', departed: '2026-09-27', arrived: '2026-09-29', cleared: '2026-09-30' } },
      { mode: 'ocean', hbl: 'SMNY2408077', mbl: 'ONEYSHAE8812300', ref: 'PHG-PO-8714', cntr: 'TCNU1189430', carrier: 'ONE',
        pol: 'Yantian, CN', pod: 'New York, NY', etd: '2026-08-05', eta: '2026-09-08', status: 'delivered',
        dates: { booked: '2026-07-28', departed: '2026-08-05', arrived: '2026-09-08', cleared: '2026-09-10', delivered: '2026-09-12' } },
      { mode: 'ocean', hbl: 'SMNY2410011', mbl: '', ref: 'PHG-PO-8860', cntr: '', carrier: 'Evergreen',
        pol: 'Xiamen, CN', pod: 'New York, NY', etd: '2026-10-14', eta: '2026-11-17', status: 'booked',
        dates: { booked: '2026-10-03' } },
    ],
  };
  const delay = ms => new Promise(r => setTimeout(r, ms));
  const tokenFor = email => 'demo.' + btoa(email);
  const userFor = token => users.find(u => tokenFor(u.email) === token)?.user;

  return {
    async login(email, password) {
      await delay(600);
      const u = users.find(x => x.email === email.trim().toLowerCase() && x.password === password);
      if (!u) throw new AuthError('invalid');
      return { token: tokenFor(u.email), user: u.user };
    },
    async me(token) {
      await delay(150);
      const user = userFor(token);
      if (!user) throw new AuthError('unauthorized');
      return user;
    },
    async shipments(token, { q, type, customerCode } = {}) {
      await delay(q ? 450 : 250);
      const user = userFor(token);
      if (!user) throw new AuthError('unauthorized');
      let list = shipments[user.customerCode] || [];
      if (customerCode && norm(customerCode) !== norm(user.customerCode)) return [];
      if (q) {
        const needle = norm(q);
        const fields = type ? [type] : ['hbl', 'mbl', 'ref', 'cntr'];
        list = list.filter(s => fields.some(f => norm(s[f]) && norm(s[f]).includes(needle)));
      }
      return list;
    },
    async logout() { await delay(100); },
  };
})();

class AuthError extends Error {
  constructor(code) { super(code); this.code = code; }
}

// ======================== API ========================
const api = (() => {
  const base = AUTH_CONFIG.apiBase;

  async function call(path, { method = 'GET', body, token } = {}) {
    const res = await fetch(base + path, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 401) throw new AuthError(path === '/auth/login' ? 'invalid' : 'unauthorized');
    if (!res.ok) throw new AuthError('network');
    return res.status === 204 ? null : res.json();
  }

  if (!base) return { demo: true, ...demo };
  return {
    demo: false,
    login: (email, password) => call('/auth/login', { method: 'POST', body: { email, password } }),
    me: token => call('/me', { token }),
    shipments: (token, params = {}) => {
      const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
      return call(`/shipments${qs.toString() ? '?' + qs : ''}`, { token });
    },
    logout: token => call('/auth/logout', { method: 'POST', token }).catch(() => null),
  };
})();

// ======================== SESSION STATE ========================
let session = readSession();   // { token, user }
const listeners = [];
function onSessionChange(fn) { listeners.push(fn); }
function setSession(s) {
  session = s;
  writeSession(s);
  listeners.forEach(fn => fn(session));
}

async function verifySession() {
  if (!session) return;
  try {
    const user = await api.me(session.token);
    setSession({ ...session, user });
  } catch (err) {
    if (err.code === 'unauthorized') setSession(null);
  }
}

// ======================== LOGIN MODAL ========================
const ICON_CLOSE = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
const ICON_EYE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';

let modal = null;
let lastFocus = null;
let afterLogin = null;

function buildModal() {
  modal = document.createElement('div');
  modal.className = 'sm-modal';
  modal.hidden = true;
  modal.innerHTML = `
    <div class="sm-modal-backdrop" data-close></div>
    <div class="sm-modal-card" role="dialog" aria-modal="true" aria-labelledby="smLoginTitle">
      <button type="button" class="sm-modal-close" data-close aria-label="Close">${ICON_CLOSE}</button>
      <img src="logo.png" alt="Sen Mart International" class="sm-modal-logo" />
      <h2 id="smLoginTitle" data-zh="客户登录">Customer Log In</h2>
      <p class="sm-modal-sub" data-zh="登录以查看和追踪您的全部货物。">Log in to view and track all of your shipments.</p>
      <p class="sm-modal-notice" hidden></p>
      <form class="sm-login-form" novalidate>
        <label class="sm-field">
          <span data-zh="邮箱">Email</span>
          <input type="email" name="email" autocomplete="username" required />
        </label>
        <label class="sm-field">
          <span data-zh="密码">Password</span>
          <span class="sm-pass-wrap">
            <input type="password" name="password" autocomplete="current-password" required />
            <button type="button" class="sm-pass-toggle" aria-label="Show password">${ICON_EYE}</button>
          </span>
        </label>
        <p class="sm-form-error" role="alert" hidden></p>
        <button type="submit" class="btn-primary sm-login-submit"><span data-zh="登录">Log In</span></button>
      </form>
      ${api.demo ? `<div class="sm-demo-hint">
        <strong data-zh="演示账号">Demo account</strong>
        <span>demo@senmartintl.com · demo1234</span>
        <button type="button" class="sm-demo-fill" data-zh="一键填入">Fill in</button>
      </div>` : ''}
      <p class="sm-modal-foot"><span data-zh="还没有账号？">Don't have an account?</span> <a href="contact.html" data-zh="联系我们开通">Contact us to get one</a></p>
    </div>`;
  document.body.appendChild(modal);
  if (typeof applyLanguage === 'function') applyLanguage(currentLang());

  const form = modal.querySelector('form');
  const err = modal.querySelector('.sm-form-error');
  const submit = modal.querySelector('.sm-login-submit');
  const pass = form.elements.password;

  modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeLogin));
  modal.querySelector('.sm-pass-toggle').addEventListener('click', e => {
    pass.type = pass.type === 'password' ? 'text' : 'password';
    e.currentTarget.classList.toggle('on', pass.type === 'text');
  });
  modal.querySelector('.sm-demo-fill')?.addEventListener('click', () => {
    form.elements.email.value = 'demo@senmartintl.com';
    pass.value = 'demo1234';
    submit.focus();
  });
  modal.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLogin();
    if (e.key !== 'Tab') return;
    const f = [...modal.querySelectorAll('button, input, a[href]')].filter(el => !el.disabled && el.offsetParent);
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = form.elements.email.value.trim();
    const password = pass.value;
    err.hidden = true;
    if (!email || !password) {
      err.textContent = T('Please enter your email and password.', '请输入邮箱和密码。');
      err.hidden = false;
      (email ? pass : form.elements.email).focus();
      return;
    }
    submit.disabled = true;
    submit.classList.add('is-loading');
    try {
      const { token, user } = await api.login(email, password);
      setSession({ token, user });
      form.reset();
      const next = afterLogin;
      closeLogin();
      if (next) next();
    } catch (ex) {
      err.textContent = ex.code === 'invalid'
        ? T('Incorrect email or password.', '邮箱或密码不正确。')
        : T('Unable to reach the login service. Please try again.', '无法连接登录服务，请稍后再试。');
      err.hidden = false;
      pass.select();
    } finally {
      submit.disabled = false;
      submit.classList.remove('is-loading');
    }
  });
}

function openLogin({ notice, then } = {}) {
  if (!modal) buildModal();
  afterLogin = then || null;
  const n = modal.querySelector('.sm-modal-notice');
  n.textContent = notice || '';
  n.hidden = !notice;
  modal.querySelector('.sm-form-error').hidden = true;
  lastFocus = document.activeElement;
  modal.hidden = false;
  document.body.classList.add('sm-modal-open');
  requestAnimationFrame(() => {
    modal.classList.add('open');
    modal.querySelector('input[name="email"]').focus();
  });
}

function closeLogin() {
  if (!modal || modal.hidden) return;
  afterLogin = null;
  modal.classList.remove('open');
  document.body.classList.remove('sm-modal-open');
  setTimeout(() => { modal.hidden = true; }, 200);
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}

async function logout() {
  const token = session?.token;
  setSession(null);
  if (token) await api.logout(token);
}

// ======================== NAV ACCOUNT MENU ========================
let userMenu = null;

function renderNav() {
  const loginBtn = document.querySelector('.nav-login');
  if (!loginBtn) return;
  if (!userMenu) {
    userMenu = document.createElement('div');
    userMenu.className = 'sm-user';
    loginBtn.after(userMenu);
    document.addEventListener('click', e => {
      if (!userMenu.contains(e.target)) setMenuOpen(false);
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenuOpen(false); });
  }
  const user = session?.user;
  loginBtn.hidden = !!user;
  userMenu.hidden = !user;
  document.querySelectorAll('#mobileDrawer [data-auth-open]').forEach(el => {
    el.closest('li').hidden = !!user;
  });
  document.querySelectorAll('.sm-mobile-account').forEach(el => el.remove());
  if (!user) { userMenu.innerHTML = ''; return; }

  const first = String(user.name || '').split(/\s+/)[0];
  userMenu.innerHTML = `
    <button type="button" class="sm-user-btn" aria-haspopup="true" aria-expanded="false">
      <span class="sm-avatar">${esc(initials(user.name))}</span>
      <span class="sm-user-name">${esc(first)}</span>
      <svg class="sm-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
    <div class="sm-user-menu" role="menu">
      <div class="sm-user-head">
        <strong>${esc(user.name)}</strong>
        <span>${esc(user.company)}</span>
        <span class="sm-user-meta">${esc(user.email)} · ${T('Customer code', '客户代码')} <b>${esc(user.customerCode)}</b></span>
      </div>
      <a role="menuitem" href="track.html#my-shipments">${T('My Shipments', '我的货物')}</a>
      <a role="menuitem" href="track.html">${T('Track a Shipment', '货运追踪')}</a>
      <a role="menuitem" href="${esc(AUTH_CONFIG.portalUrl)}" target="_blank" rel="noopener">${T('Small Freight Portal', 'Small Freight 门户')} ↗</a>
      <button type="button" role="menuitem" class="sm-logout">${T('Log Out', '退出登录')}</button>
    </div>`;
  userMenu.querySelector('.sm-user-btn').addEventListener('click', () => setMenuOpen(!userMenu.classList.contains('open')));
  userMenu.querySelector('.sm-logout').addEventListener('click', () => { setMenuOpen(false); logout(); });

  // Mobile drawer: account entries in place of the Log In item
  const drawerList = document.querySelector('#mobileDrawer ul');
  if (drawerList) {
    const items = [
      `<li class="sm-mobile-account"><div class="sm-mobile-user"><span class="sm-avatar">${esc(initials(user.name))}</span><span><strong>${esc(user.name)}</strong><small>${esc(user.company)}</small></span></div></li>`,
      `<li class="sm-mobile-account"><a href="track.html#my-shipments" class="mobile-nav-link">${T('MY SHIPMENTS', '我的货物')}</a></li>`,
      `<li class="sm-mobile-account"><a href="#" class="mobile-nav-link sm-mobile-logout">${T('LOG OUT', '退出登录')}</a></li>`,
    ];
    const anchor = drawerList.querySelector('.mobile-cta')?.closest('li');
    items.forEach(html => {
      const tpl = document.createElement('template');
      tpl.innerHTML = html;
      drawerList.insertBefore(tpl.content.firstChild, anchor || null);
    });
    drawerList.querySelector('.sm-mobile-logout').addEventListener('click', e => { e.preventDefault(); logout(); });
  }
}

function setMenuOpen(open) {
  if (!userMenu) return;
  userMenu.classList.toggle('open', open);
  const btn = userMenu.querySelector('.sm-user-btn');
  if (btn) btn.setAttribute('aria-expanded', String(open));
}

// ======================== SHIPMENT RENDERING ========================
const STEPS = ['booked', 'departed', 'arrived', 'cleared', 'delivered'];
const STEP_LABEL = {
  booked: ['Booked', '已订舱'],
  departed: ['Departed', '已离港'],
  arrived: ['Arrived', '已到港'],
  cleared: ['Customs Cleared', '已清关'],
  delivered: ['Delivered', '已送达'],
};
const STATUS_LABEL = {
  booked: ['Booked', '已订舱'],
  departed: ['In Transit', '运输中'],
  arrived: ['Arrived at Port', '已到港'],
  cleared: ['Customs Cleared', '已清关'],
  delivered: ['Delivered', '已送达'],
};
const label = pair => T(pair[0], pair[1]);

function statusChip(status) {
  return `<span class="sm-chip sm-chip--${esc(status)}">${esc(label(STATUS_LABEL[status] || [status, status]))}</span>`;
}

function shipmentNumber(s) {
  return s.hbl || s.mbl || s.ref;
}

function shipmentBody(s) {
  const reached = STEPS.indexOf(s.status);
  const steps = STEPS.map((k, i) => `
    <li class="${i < reached ? 'done' : i === reached ? 'current' : ''}">
      <span class="sm-step-dot"></span>
      <span class="sm-step-label">${esc(label(STEP_LABEL[k]))}</span>
      <span class="sm-step-date">${s.dates?.[k] ? esc(fmtDate(s.dates[k])) : ''}</span>
    </li>`).join('');
  const meta = [
    ['HBL', s.hbl], ['MBL', s.mbl], [T('Reference', '参考号'), s.ref],
    [T('Container', '柜号'), s.cntr], [T('Carrier', '承运人'), s.carrier],
    [T('Mode', '运输方式'), s.mode === 'air' ? T('Air Freight', '空运') : T('Ocean Freight', '海运')],
  ].map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v || '—')}</dd></div>`).join('');
  return `
    <div class="sm-route">
      <div><small>${T('Origin', '起运港')}</small><b>${esc(s.pol)}</b><span>ETD ${esc(fmtDate(s.etd))}</span></div>
      <span class="sm-route-line" aria-hidden="true"></span>
      <div class="sm-route-end"><small>${T('Destination', '目的港')}</small><b>${esc(s.pod)}</b><span>ETA ${esc(fmtDate(s.eta))}</span></div>
    </div>
    <ol class="sm-steps">${steps}</ol>
    <dl class="sm-meta">${meta}</dl>`;
}

function shipmentCard(s) {
  return `
    <article class="sm-ship">
      <header class="sm-ship-head">
        <div><small>${s.hbl ? 'HBL' : s.mbl ? 'MBL' : 'REF'}</small><strong>${esc(shipmentNumber(s))}</strong></div>
        ${statusChip(s.status)}
      </header>
      ${shipmentBody(s)}
    </article>`;
}

function messageBox(html, tone = '') {
  return `<div class="sm-msg ${tone}">${html}</div>`;
}

const CONTACT_LINE = () => T(
  'Can\'t find it? Call <a href="tel:5169620966">516-962-0966</a> or email <a href="mailto:shakeh@senmartintl.com">shakeh@senmartintl.com</a>.',
  '找不到？请致电 <a href="tel:5169620966">516-962-0966</a> 或发送邮件至 <a href="mailto:shakeh@senmartintl.com">shakeh@senmartintl.com</a>。'
);

// ======================== SEARCH ========================
// Remembers the last search per result box so it can re-render on language change.
const lastSearch = new Map();

async function runSearch(resultEl, params) {
  lastSearch.set(resultEl, params);
  resultEl.hidden = false;
  if (!session) {
    resultEl.innerHTML = messageBox(
      `${T('Log in to search your shipments.', '请先登录以查询您的货物。')} <button type="button" class="sm-link-btn" data-auth-open>${T('Log In', '登录')}</button>`
    );
    openLogin({
      notice: T('Log in to see the status of your shipment.', '登录后即可查看货物状态。'),
      then: () => runSearch(resultEl, params),
    });
    return;
  }
  resultEl.innerHTML = messageBox(`<span class="sm-spinner"></span>${T('Searching…', '正在查询…')}`);
  try {
    const list = await api.shipments(session.token, params);
    if (lastSearch.get(resultEl) !== params) return;
    renderResults(resultEl, params, list);
  } catch (err) {
    if (err.code === 'unauthorized') { setSession(null); return runSearch(resultEl, params); }
    resultEl.innerHTML = messageBox(`${T('Unable to reach the tracking system.', '无法连接追踪系统。')} ${CONTACT_LINE()}`, 'error');
  }
}

function renderResults(resultEl, params, list) {
  resultEl.dataset.results = JSON.stringify(list);
  if (!list.length) {
    resultEl.innerHTML = messageBox(
      `${T('No shipment found for', '未找到货物：')} <b>${esc(params.q)}</b>. ${CONTACT_LINE()}`, 'warn');
    return;
  }
  const head = list.length > 1
    ? `<p class="sm-results-count">${T(`${list.length} shipments match`, `找到 ${list.length} 票货物`)}</p>` : '';
  resultEl.innerHTML = head + list.map(shipmentCard).join('');
}

function rerenderResults() {
  lastSearch.forEach((params, el) => {
    if (!el.dataset.results) return;
    try { renderResults(el, params, JSON.parse(el.dataset.results)); } catch { /* ignore */ }
  });
}

// Inline handlers used by the forms on index.html and track.html
function handleHeroTrack(e) {
  e.preventDefault();
  const input = document.getElementById('heroShipmentNumber');
  const code = document.getElementById('heroCustomerCode');
  const resultEl = document.getElementById('heroTrackResult');
  if (!input || !resultEl) return;
  const q = input.value.trim();
  if (!q) return flagEmpty(input);
  runSearch(resultEl, { q, customerCode: code ? code.value.trim() : '' });
}

function handleTrack(e) {
  e.preventDefault();
  const input = document.getElementById('trackInput');
  const resultEl = document.getElementById('trackResult');
  if (!input || !resultEl) return;
  const q = input.value.trim();
  if (!q) return flagEmpty(input);
  const tab = document.querySelector('.track-tab.active')?.dataset.tab || '';
  runSearch(resultEl, { q, type: tab });
}

function flagEmpty(input) {
  input.focus();
  input.classList.add('sm-invalid');
  setTimeout(() => input.classList.remove('sm-invalid'), 2000);
}

// ======================== MY SHIPMENTS (track.html) ========================
async function renderMyShipments() {
  const box = document.getElementById('myShipments');
  if (!box) return;
  const user = session?.user;
  if (!user) {
    box.innerHTML = `
      <div class="sm-mine-empty">
        <div>
          <h2>${T('My Shipments', '我的货物')}</h2>
          <p>${T('Log in to see every shipment under your account, with live status and milestones.', '登录后可查看您账户下的全部货物及实时状态和节点。')}</p>
        </div>
        <button type="button" class="btn-primary" data-auth-open>${T('Log In', '登录')}</button>
      </div>`;
    return;
  }
  box.innerHTML = `
    <div class="sm-mine-head">
      <div>
        <h2>${T('My Shipments', '我的货物')}</h2>
        <p>${esc(user.company)} · ${T('Customer code', '客户代码')} <b>${esc(user.customerCode)}</b></p>
      </div>
    </div>
    ${messageBox(`<span class="sm-spinner"></span>${T('Loading your shipments…', '正在加载您的货物…')}`)}`;
  try {
    const list = await api.shipments(session.token);
    if (session?.user !== user) return;
    const rows = list.map(s => `
      <details class="sm-row">
        <summary>
          <span class="sm-row-num"><small>${s.mode === 'air' ? T('Air', '空运') : T('Ocean', '海运')}</small>${esc(shipmentNumber(s))}</span>
          <span class="sm-row-route">${esc(s.pol)} → ${esc(s.pod)}</span>
          <span class="sm-row-eta">ETA ${esc(fmtDate(s.eta))}</span>
          ${statusChip(s.status)}
        </summary>
        <div class="sm-row-body">${shipmentBody(s)}</div>
      </details>`).join('');
    box.querySelector('.sm-msg').outerHTML = list.length
      ? `<div class="sm-rows">${rows}</div>`
      : messageBox(T('No shipments on your account yet.', '您的账户下暂无货物。'));
  } catch (err) {
    if (err.code === 'unauthorized') return setSession(null);
    box.querySelector('.sm-msg').outerHTML = messageBox(`${T('Unable to load your shipments.', '无法加载您的货物。')} ${CONTACT_LINE()}`, 'error');
  }
}

// ======================== WIRING ========================
function prefillCustomerCode() {
  const code = document.getElementById('heroCustomerCode');
  if (!code) return;
  if (session?.user && !code.value) code.value = session.user.customerCode;
  if (!session && code.value && code.dataset.prefilled) code.value = '';
  code.dataset.prefilled = session ? '1' : '';
}

document.addEventListener('click', e => {
  const trigger = e.target.closest('[data-auth-open]');
  if (!trigger) return;
  e.preventDefault();
  openLogin();
});

onSessionChange(() => {
  renderNav();
  renderMyShipments();
  prefillCustomerCode();
  lastSearch.forEach((params, el) => {
    if (!session) { el.hidden = true; el.innerHTML = ''; delete el.dataset.results; }
  });
  if (!session) lastSearch.clear();
});

// Re-render JS-built text after main.js switches language
document.getElementById('langToggle')?.addEventListener('click', () => {
  renderNav();
  renderMyShipments();
  rerenderResults();
});

// Keep tabs in sync when logging in/out in another tab
window.addEventListener('storage', e => {
  if (e.key !== SESSION_KEY) return;
  session = readSession();
  listeners.forEach(fn => fn(session));
});

renderNav();
renderMyShipments();
prefillCustomerCode();
verifySession();
if (location.hash === '#login' && !session) openLogin();
