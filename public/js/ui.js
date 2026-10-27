// Utilitários de interface: seletores, sons, tema, notificações e confete.

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function ler(k, padrao) { try { return localStorage.getItem(k) ?? padrao; } catch { return padrao; } }
export function gravar(k, v) { try { localStorage.setItem(k, v); } catch { /* sem armazenamento */ } }

export const primeiroNome = n => String(n || '').trim().split(/\s+/)[0] || 'Aluno';
export const rnd = a => a[Math.floor(Math.random() * a.length)];
export function embaralhar(a) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

export function hoje(d = new Date()) { return d.toLocaleDateString('sv-SE'); } // AAAA-MM-DD local

export function fmtTempo(seg) {
  seg = Math.round(seg || 0);
  if (seg < 60) return seg + ' s';
  const m = Math.round(seg / 60);
  if (m < 60) return m + ' min';
  return Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0') + ' min';
}

export function fmtData(ms) {
  if (!ms) return '—';
  const d = new Date(ms), dias = Math.floor((new Date(hoje()) - new Date(hoje(d))) / 864e5);
  if (dias <= 0) return 'hoje, ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (dias === 1) return 'ontem';
  if (dias < 7) return `há ${dias} dias`;
  return d.toLocaleDateString('pt-BR');
}

export function avatar(nome, foto, cls = '') {
  if (foto) return `<img class="avatar ${cls}" src="${esc(foto)}" alt="" referrerpolicy="no-referrer">`;
  const ini = String(nome || '?').trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
  return `<span class="avatar ${cls}">${esc(ini)}</span>`;
}

export function toast(msg, tipo = '') {
  let box = $('#toasts');
  if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.append(box); }
  const t = document.createElement('div');
  t.className = 'toast ' + tipo; t.innerHTML = msg; box.append(t);
  setTimeout(() => t.classList.add('sai'), 3600);
  setTimeout(() => t.remove(), 4100);
}

export function modal(conteudo, cls = '') {
  const fundo = document.createElement('div');
  fundo.className = 'modal-fundo';
  fundo.innerHTML = `<div class="modal ${cls}" role="dialog" aria-modal="true"><button class="modal-x" aria-label="Fechar">✕</button><div class="modal-corpo">${conteudo}</div></div>`;
  document.body.append(fundo);
  const fechar = () => { fundo.remove(); removeEventListener('keydown', esc_); };
  const esc_ = e => { if (e.key === 'Escape') fechar(); };
  addEventListener('keydown', esc_);
  fundo.addEventListener('click', e => { if (e.target === fundo) fechar(); });
  fundo.querySelector('.modal-x').onclick = fechar;
  return { el: fundo.querySelector('.modal-corpo'), fechar };
}

// ---------- Sons (Web Audio, sem arquivos) ----------
let actx;
function bip(freq, dur, tipo = 'sine', vol = 0.06, quando = 0) {
  if (!som.ativo) return;
  try {
    actx ??= new (window.AudioContext || window.webkitAudioContext)();
    const t = actx.currentTime + quando, o = actx.createOscillator(), g = actx.createGain();
    o.type = tipo; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(actx.destination); o.start(t); o.stop(t + dur + 0.02);
  } catch { /* áudio indisponível */ }
}
export const som = {
  ativo: ler('tn_som', '1') === '1',
  tecla() { bip(600 + Math.random() * 80, 0.035, 'triangle', 0.03); },
  erro() { bip(140, 0.14, 'square', 0.035); },
  pop() { bip(880, 0.06, 'sine', 0.07); bip(1320, 0.07, 'sine', 0.05, 0.04); },
  sucesso() { [523, 659, 784, 1047].forEach((f, i) => bip(f, 0.2, 'triangle', 0.07, i * 0.09)); },
  falha() { [392, 330, 262].forEach((f, i) => bip(f, 0.22, 'sawtooth', 0.025, i * 0.12)); },
  alternar() { this.ativo = !this.ativo; gravar('tn_som', this.ativo ? '1' : '0'); return this.ativo; }
};

// ---------- Tema claro/escuro ----------
export function aplicarTema() {
  const t = ler('tn_tema', '');
  if (t) document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme;
}
export function alternarTema() {
  const atual = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  gravar('tn_tema', atual === 'dark' ? 'light' : 'dark'); aplicarTema();
}

// ---------- Confete ----------
export function confete() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.createElement('canvas'); c.className = 'confete'; document.body.append(c);
  const W = c.width = innerWidth, H = c.height = innerHeight, g = c.getContext('2d');
  const cores = ['#8b5cf6', '#06b6d4', '#f472b6', '#facc15', '#34d399', '#fb923c'];
  const ps = Array.from({ length: 150 }, () => ({
    x: W / 2 + (Math.random() - 0.5) * 240, y: H * 0.35, vx: (Math.random() - 0.5) * 15, vy: -Math.random() * 15 - 4,
    r: Math.random() * 7 + 4, c: rnd(cores), a: Math.random() * 6, va: (Math.random() - 0.5) * 0.3
  }));
  const t0 = performance.now();
  (function f(t) {
    g.clearRect(0, 0, W, H);
    for (const p of ps) {
      p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.a += p.va;
      g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.fillStyle = p.c; g.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); g.restore();
    }
    if (t - t0 < 3000) requestAnimationFrame(f); else c.remove();
  })(t0);
}

export const GOOGLE_SVG = `<svg viewBox="0 0 48 48" width="22" height="22" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>`;
