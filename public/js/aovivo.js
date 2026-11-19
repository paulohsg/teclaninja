// Jogos ao vivo (a turma inteira ao mesmo tempo): Corrida ao vivo e Batalha de equipes.
//
// Usa o Realtime Database do Firebase, feito para atualizações rápidas (e que não cobra por leitura,
// ao contrário do Firestore). Cada turma tem no máximo uma sala, aberta pelo professor:
//   salas/{TURMA}/info              professor: tipo, estado (espera|jogando|fim), texto/nível, comecou...
//   salas/{TURMA}/roster/{authUid}  professor: nome e avatar (lidos do cadastro) e equipe (a|b)
//   salas/{TURMA}/jogadores/{authUid} o próprio aluno: id, pos (corrida) ou pts (batalha), erros, fim, t
// O professor escreve os nomes: assim ninguém aparece no telão com um nome falso.
// As regras (database.rules.json) limitam a velocidade de cada aluno (impede "trapaça" pelo navegador).
import { firebaseConfig } from './config.js';
import { MODO, baseFirebase } from './store.js';
import { FRASES, palavrasPara } from './licoes.js';
import { rnd, embaralhar, esc } from './ui.js';
import { desenharAvatar, avatarSvg } from './avatar.js';

const CDN = 'https://www.gstatic.com/firebasejs/10.12.2/';
/** O Realtime Database está configurado? (no modo demonstração tudo fica na memória da página) */
export const RT_CONFIGURADO = MODO === 'demo' || !!firebaseConfig.databaseURL;
export const TEMPO = { '.sv': 'timestamp' }; // "hora do servidor" na gravação
export const CONTAGEM = 4000;                // ms entre o professor clicar em "Começar" e a largada
export const LIMITE_CORRIDA = 5 * 60000;     // a corrida termina sozinha depois de 5 minutos

/* ------------------------------ Dados ------------------------------ */
let rtp = null, desvio = 0;
function rt() {
  return rtp ??= (async () => {
    const { app, auth } = await baseFirebase();
    const D = await import(CDN + 'firebase-database.js');
    const db = D.getDatabase(app, firebaseConfig.databaseURL);
    D.onValue(D.ref(db, '.info/serverTimeOffset'), s => { desvio = s.val() || 0; });
    return { D, db, auth };
  })();
}

// Modo demonstração: uma "árvore" na memória da página (só o painel do professor usa, com alunos robôs).
const demo = (() => {
  let arvore = {}, agendado = false;
  const ouvintes = new Set();
  const partes = c => c.split('/').filter(Boolean);
  const pegar = c => partes(c).reduce((o, k) => (o == null ? undefined : o[k]), arvore);
  const resolver = v => (v && typeof v === 'object' ? (v['.sv'] === 'timestamp' ? Date.now() : Object.fromEntries(Object.entries(v).map(([k, x]) => [k, resolver(x)]))) : v);
  function por(c, v) {
    const ps = partes(c);
    if (!ps.length) { arvore = v ?? {}; return; }
    let o = arvore;
    for (const k of ps.slice(0, -1)) o = (o[k] && typeof o[k] === 'object') ? o[k] : (o[k] = {});
    if (v == null) delete o[ps.at(-1)]; else o[ps.at(-1)] = resolver(v);
  }
  function avisar() {
    if (agendado) return; agendado = true;
    setTimeout(() => { agendado = false; ouvintes.forEach(l => l.cb(JSON.parse(JSON.stringify(pegar(l.c) ?? null)))); }, 0);
  }
  return {
    ouvir(c, cb) { const l = { c, cb }; ouvintes.add(l); setTimeout(() => cb(JSON.parse(JSON.stringify(pegar(c) ?? null))), 0); return () => ouvintes.delete(l); },
    gravar(c, v) { por(c, v); avisar(); },
    atualizar(c, obj) { for (const [k, v] of Object.entries(obj)) por(c + '/' + k, v); avisar(); }
  };
})();

/** Escuta um caminho. cb(valor) a cada mudança. Devolve uma função que para de escutar. */
export async function ouvir(caminho, cb) {
  if (MODO === 'demo') return demo.ouvir(caminho, cb);
  const { D, db } = await rt();
  return D.onValue(D.ref(db, caminho), s => cb(s.val()), e => { console.warn('ao vivo:', e.code || e); cb(null, e); });
}
export async function gravar(caminho, valor) {
  if (MODO === 'demo') return demo.gravar(caminho, valor);
  const { D, db } = await rt(); await D.set(D.ref(db, caminho), valor);
}
/** Atualiza vários campos de uma vez (chaves podem ter "/", ex.: { 'roster/x/equipe': 'a' }). */
export async function atualizar(caminho, obj) {
  if (MODO === 'demo') return demo.atualizar(caminho, obj);
  const { D, db } = await rt(); await D.update(D.ref(db, caminho), obj);
}
export const remover = caminho => gravar(caminho, null);

/** Identificador do login no Firebase (é a chave do jogador na sala). */
export async function meuUid() {
  if (MODO === 'demo') return 'demo-aluno';
  const { auth } = await rt(); return auth.currentUser?.uid || '';
}
/** Apaga o caminho se a internet do aluno cair (ou ele fechar a página). */
export async function apagarAoSair(caminho) {
  if (MODO === 'demo') return;
  const { D, db } = await rt(); await D.onDisconnect(D.ref(db, caminho)).remove();
}
/** Avisa quando a conexão cai e volta: cb(true/false). */
export async function ouvirConexao(cb) {
  if (MODO === 'demo') { cb(true); return () => {}; }
  const { D, db } = await rt();
  return D.onValue(D.ref(db, '.info/connected'), s => cb(!!s.val()));
}
/** Hora do servidor (em ms), para todos contarem o tempo igual. */
export const agora = () => Date.now() + desvio;

/* ------------------------------ Jogos ------------------------------ */
export const TIPOS = {
  corrida: { nome: 'Corrida ao vivo', icone: 'flag-triangle-right', desc: 'A turma inteira digita o mesmo texto ao mesmo tempo. Cada um vê o avatar dos colegas correndo.' },
  batalha: { nome: 'Batalha de equipes', icone: 'swords', desc: 'Dois times. Cada palavra certa manda tropas contra a base do outro time.' }
};
export const TEXTOS = [
  { id: 'base', nome: 'Fileira base (fácil)' },
  { id: 'frase', nome: 'Uma frase' },
  { id: 'duas', nome: 'Duas frases' }
];
export const NIVEIS = [
  { id: 'base', nome: 'Fileira base (fácil)', letras: 'asdfghjklç' },
  { id: 'alfabeto', nome: 'Todas as letras', letras: 'abcdefghijklmnopqrstuvwxyzç' },
  { id: 'longas', nome: 'Palavras longas (difícil)', letras: 'abcdefghijklmnopqrstuvwxyzç', min: 6 }
];
export const DURACOES = [2, 3, 5];
export const EQUIPES = {
  a: { nome: 'Time Azul', cor: '#2563eb', claro: '#93c5fd', camisa: 'camisa-azul' },
  b: { nome: 'Time Vermelho', cor: '#dc2626', claro: '#fca5a5', camisa: 'camisa-vermelha' }
};

/** Texto da corrida (o professor sorteia e todos digitam o mesmo). */
export function textoCorrida(op) {
  if (op === 'base') return embaralhar(palavrasPara('asdfghjklç').filter(p => p.length >= 2)).slice(0, 12).join(' ');
  return embaralhar(FRASES).slice(0, op === 'duas' ? 2 : 1).join(' ');
}
/** Palavras da batalha (cada aluno sorteia as suas, todas com as letras do nível). */
export function palavrasBatalha(nivelId) {
  const n = NIVEIS.find(x => x.id === nivelId) || NIVEIS[1];
  const todas = palavrasPara(n.letras).filter(p => p.length >= (n.min || 2) && p.length <= (n.min ? 12 : 7));
  return todas.length >= 8 ? todas : palavrasPara(n.letras);
}
export const proximaPalavra = (lista, anterior) => { let p; do p = rnd(lista); while (p === anterior && lista.length > 1); return p; };

/** Jogadores com nome e avatar (só os que o professor já registrou). */
export function jogadoresDe(sala) {
  const roster = sala?.roster || {}, jog = sala?.jogadores || {};
  return Object.keys(jog).filter(u => roster[u]).map(u => ({ uid: u, ...roster[u], ...jog[u] }));
}

/** Classificação da corrida: quem terminou primeiro na frente; depois, quem digitou mais. */
export function classificacao(sala) {
  const total = [...(sala?.info?.texto || '')].length || 1;
  const largada = (sala?.info?.comecou || 0) + CONTAGEM;
  return jogadoresDe(sala).map(j => {
    const ms = j.fim || Math.max(1, agora() - largada);
    return { ...j, pct: Math.min(1, (j.pos || 0) / total), ppm: j.pos ? Math.round((j.pos / 5) / (ms / 60000)) : 0 };
  }).sort((x, y) => (x.fim && y.fim ? x.fim - y.fim : x.fim ? -1 : y.fim ? 1 : (y.pos || 0) - (x.pos || 0)))
    .map((j, i) => ({ ...j, lugar: i + 1 }));
}

/** Placar da batalha. frente: 0,5 = meio; 1 = o Time Azul chegou à base vermelha; 0 = o contrário.
 *  Usa a MÉDIA de pontos por aluno, para times de tamanhos diferentes serem justos. */
export const ALCANCE = 180;
export function placarBatalha(sala) {
  const t = { a: { pts: 0, membros: [] }, b: { pts: 0, membros: [] } };
  for (const j of jogadoresDe(sala)) if (t[j.equipe]) { t[j.equipe].pts += j.pts || 0; t[j.equipe].membros.push(j); }
  for (const k of ['a', 'b']) { t[k].media = t[k].membros.length ? t[k].pts / t[k].membros.length : 0; t[k].membros.sort((x, y) => (y.pts || 0) - (x.pts || 0)); }
  const frente = Math.max(0, Math.min(1, 0.5 + (t.a.media - t.b.media) / ALCANCE));
  return { ...t, frente, destruida: frente >= 1 ? 'b' : frente <= 0 ? 'a' : null };
}
/** Quem venceu quando o tempo acaba (ou a base cai). */
export const vencedorDe = p => (p.destruida === 'b' ? 'a' : p.destruida === 'a' ? 'b' : p.frente > 0.5 ? 'a' : p.frente < 0.5 ? 'b' : 'empate');

/* ------------------------------ Pista (corrida) ------------------------------ */
/** Raias com os avatares correndo. Reaproveita os elementos para não piscar. */
export class Pista {
  constructor(el, { compacta = false } = {}) { this.el = el; this.raias = new Map(); el.classList.add('pista-viva'); el.classList.toggle('compacta', compacta); }
  mostrar(lista, { eu = '', terminou = {} } = {}) {
    const vistos = new Set();
    lista.forEach((j, i) => {
      vistos.add(j.uid);
      let r = this.raias.get(j.uid);
      if (!r) {
        r = document.createElement('div'); r.className = 'raia';
        r.innerHTML = `<span class="r-pos"></span><span class="r-nome">${esc(j.nome)}</span><div class="r-trilho"><span class="r-boneco">${avatarSvg(j.avatar, { tam: 22 })}</span></div><span class="r-ppm"></span>`;
        this.raias.set(j.uid, r);
      }
      r.classList.toggle('eu', j.uid === eu);
      r.classList.toggle('chegou', !!j.fim);
      r.style.order = i;
      r.querySelector('.r-pos').textContent = (j.lugar || i + 1) + 'º';
      r.querySelector('.r-boneco').style.left = `calc(${j.pct * 100}% - ${j.pct * 22}px)`;
      r.querySelector('.r-ppm').textContent = j.ppm ? j.ppm + ' PPM' : '';
      if (r.parentNode !== this.el) this.el.append(r);
    });
    for (const [u, r] of this.raias) if (!vistos.has(u)) { r.remove(); this.raias.delete(u); }
  }
}

/* ------------------------------ Arena (batalha) ------------------------------ */
/** Campo de batalha desenhado num canvas: duas bases, a linha de frente e as tropas. */
export class Arena {
  constructor(canvas) {
    this.cv = canvas; this.g = canvas.getContext('2d');
    this.placar = { frente: 0.5, a: { media: 0 }, b: { media: 0 } };
    this.frente = 0.5; this.tropas = []; this.faiscas = []; this.ultimos = { a: 0, b: 0 };
    this.vivo = true; this.ant = performance.now();
    this.medir = () => {
      const r = this.cv.parentElement.getBoundingClientRect(), dpr = devicePixelRatio || 1;
      this.W = r.width; this.H = r.height;
      this.cv.width = this.W * dpr; this.cv.height = this.H * dpr;
      this.cv.style.width = this.W + 'px'; this.cv.style.height = this.H + 'px';
      this.g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    this.medir(); addEventListener('resize', this.medir);
    const loop = t => { if (!this.vivo) return; this.passo(Math.min(0.05, (t - this.ant) / 1000), t / 1000); this.ant = t; requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
  /** Recebe o placar novo; cada ponto a mais de um time vira tropa marchando. */
  atualizar(p) {
    this.placar = p;
    for (const k of ['a', 'b']) {
      const novos = Math.floor((p[k].pts - this.ultimos[k]) / 4);
      if (novos > 0) { for (let i = 0; i < Math.min(novos, 6); i++) this.tropas.push({ k, x: 0, atraso: i * 0.25 }); this.ultimos[k] += novos * 4; }
      if (p[k].pts < this.ultimos[k]) this.ultimos[k] = p[k].pts;
    }
    if (this.tropas.length > 60) this.tropas.splice(0, this.tropas.length - 60);
  }
  passo(dt, seg) {
    const { g, W, H } = this, chao = H - 34, bx = 70, ex = W - 70;
    this.frente += (this.placar.frente - this.frente) * Math.min(1, dt * 3);
    const fx = bx + (ex - bx) * this.frente;
    // céu, montanhas de blocos e chão
    const ceu = g.createLinearGradient(0, 0, 0, H); ceu.addColorStop(0, '#38bdf8'); ceu.addColorStop(1, '#e0f2fe');
    g.fillStyle = ceu; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(30,41,59,.12)';
    for (let i = 0; i < 9; i++) { const w = 60 + (i * 37) % 50, h = 40 + (i * 53) % 70; g.fillRect((i * W) / 9, chao - h, w, h); }
    g.fillStyle = '#15803d'; g.fillRect(0, chao, W, H - chao);
    g.fillStyle = '#22c55e'; g.fillRect(0, chao, W, 8);
    // linha de frente
    g.fillStyle = 'rgba(250,204,21,.25)'; g.fillRect(fx - 26, chao - 70, 52, 70);
    g.fillStyle = '#facc15'; g.fillRect(fx - 2, chao - 86, 4, 86);
    g.fillStyle = this.frente >= 0.5 ? EQUIPES.a.cor : EQUIPES.b.cor;
    g.beginPath(); g.moveTo(fx + 2, chao - 86); g.lineTo(fx + 30, chao - 76); g.lineTo(fx + 2, chao - 66); g.fill();
    // bases (castelos de blocos) com barra de vida
    const vidaA = Math.min(1, this.frente * 2), vidaB = Math.min(1, (1 - this.frente) * 2);
    this.base(bx - 50, chao, EQUIPES.a, vidaA);
    this.base(ex - 10, chao, EQUIPES.b, vidaB);
    // tropas: saem da base e marcham até a linha de frente
    for (const tr of this.tropas) {
      if (tr.atraso > 0) { tr.atraso -= dt; continue; }
      tr.x += dt * 140;
      const x = tr.k === 'a' ? bx + 20 + tr.x : ex - 20 - tr.x;
      if ((tr.k === 'a' && x >= fx - 8) || (tr.k === 'b' && x <= fx + 8)) {
        tr.fim = true;
        for (let i = 0; i < 6; i++) this.faiscas.push({ x: fx, y: chao - 20 - Math.random() * 30, vx: (Math.random() - 0.5) * 160, vy: -Math.random() * 160, t: 0.5, c: EQUIPES[tr.k].claro });
        continue;
      }
      desenharAvatar(g, { camisa: EQUIPES[tr.k].camisa, chapeu: 'bandana', rosto: 'serio', pele: tr.k === 'a' ? 'pele2' : 'pele3' }, x, chao, 1.25, { passo: Math.sin(seg * 14 + tr.x), virar: tr.k === 'b' });
    }
    this.tropas = this.tropas.filter(t => !t.fim);
    for (const f of this.faiscas) { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 400 * dt; f.t -= dt; g.globalAlpha = Math.max(0, f.t * 2); g.fillStyle = f.c; g.fillRect(f.x, f.y, 4, 4); }
    g.globalAlpha = 1; this.faiscas = this.faiscas.filter(f => f.t > 0);
  }
  base(x, chao, eq, vida) {
    const { g } = this, h = 90;
    g.fillStyle = eq.cor; g.fillRect(x, chao - h, 60, h);
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x, chao - h, 60, 6);
    for (let i = 0; i < 4; i++) { g.fillStyle = eq.cor; g.fillRect(x + i * 17, chao - h - 12, 9, 12); }
    g.fillStyle = '#0f172a'; g.fillRect(x + 22, chao - 34, 16, 34);
    g.fillStyle = eq.claro; g.fillRect(x + 8, chao - 70, 10, 10); g.fillRect(x + 42, chao - 70, 10, 10);
    g.fillStyle = 'rgba(15,23,42,.5)'; g.fillRect(x - 4, chao - h - 26, 68, 8);
    g.fillStyle = vida > 0.3 ? '#22c55e' : '#ef4444'; g.fillRect(x - 4, chao - h - 26, 68 * vida, 8);
    if (vida <= 0) { g.fillStyle = 'rgba(15,23,42,.55)'; g.fillRect(x - 6, chao - h - 14, 72, h + 14); }
  }
  destruir() { this.vivo = false; removeEventListener('resize', this.medir); }
}
