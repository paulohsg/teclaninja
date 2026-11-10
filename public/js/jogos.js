// Jogos de digitação. Cada jogo recebe (el, ctx) e devolve { destruir }.
// ctx = { letras, palavras, frases, onFim(resultado) }
import { som, esc, rnd, embaralhar } from './ui.js';
import { Motor } from './motor.js';
import { criarTeclado, codeDe } from './teclado.js';
import { ouvirDigitacao } from './entrada.js';
import { icone } from './icones.js';
import { desenharAvatar, avatarDe, ITENS } from './avatar.js';

export const JOGOS = [
  { id: 'parkour', nome: 'Parkour Ninja', icone: 'flag-triangle-right', cor: '#0ea5e9', novo: true,
    desc: 'Seu avatar corre por uma pista de obstáculos de blocos. Digite a palavra de cada obstáculo para pular!',
    como: ['Digite a palavra que aparece em cima do obstáculo antes de chegar nele: o avatar pula sozinho. Digitou antes? Ele corre em turbo!', 'Passe pela bandeira para salvar o estágio. Se cair, você volta para a última bandeira.', 'Palavra sem erro pega a moeda. Acertos seguidos aumentam o multiplicador!'] },
  { id: 'chuva', nome: 'Chuva de Meteoros', icone: 'cloud-hail', cor: '#f97316',
    desc: 'Letras caem do céu! Destrua os meteoros, pegue os especiais e enfrente o Super Meteoro.',
    como: ['Digite a letra que aparece no meteoro.', `Especiais: ${icone('heart')} ganha vida, ${icone('snowflake')} congela tudo, ${icone('bomb')} explode a tela.`, 'A partir do nível 3 vem o Super Meteoro: digite a palavra inteira. Errar zera o combo!'] },
  { id: 'galaxia', nome: 'Defesa Galáctica', icone: 'rocket', cor: '#8b5cf6',
    desc: 'Naves inimigas trazem palavras. Destrua as ondas e derrote a Nave-mãe a cada 4 ondas!',
    como: ['Digite a primeira letra para mirar em uma nave e termine a palavra.', 'Nave verde recupera um escudo. Palavras sem erro aumentam o multiplicador.', 'Na onda 4, 8, 12... chega a Nave-mãe: digite as palavras dela antes que chegue ao escudo.'] },
  { id: 'corrida', nome: 'Corrida Turbo', icone: 'car', cor: '#ef4444',
    desc: 'Cada letra certa acelera seu carro. Encha o nitro e chegue antes dos rivais!',
    como: ['Escolha a dificuldade dos rivais.', 'Digite a frase: cada acerto faz o carro andar.', '15 acertos seguidos ligam o NITRO: o carro dá um impulso e você ganha pontos extras.'] },
  { id: 'toupeira', nome: 'Caça-Toupeiras', icone: 'hammer', cor: '#22c55e',
    desc: 'Toupeiras aparecem nas teclas. Acerte as certas e cuidado com as bombas!',
    como: ['Aperte a tecla onde a toupeira aparecer. Quanto mais rápido, mais pontos.', 'A dourada vale o dobro e dá +2 segundos. A bomba tira pontos e tempo: não aperte!', 'A cada nível aparecem mais toupeiras ao mesmo tempo.'] },
  { id: 'teste', nome: 'Desafio 60 segundos', icone: 'timer', cor: '#06b6d4',
    desc: 'Teste de velocidade: quantas palavras por minuto você consegue digitar?',
    como: ['O cronômetro começa na primeira tecla.', 'Digite o máximo que conseguir em 60 segundos.', 'PPM = palavras por minuto (cada 5 caracteres contam como 1 palavra).'] }
];

// Cada caractere digitado chega em fn(letraMinuscula, { code }).
function ouvirTeclas(fn) {
  return ouvirDigitacao({ onTexto: (texto, code) => { for (const ch of texto) fn(ch.toLowerCase(), { code }); } });
}

const hudSet = (el, k, v) => { const x = el.querySelector(`[data-h="${k}"]`); if (x) x.innerHTML = v; };
const coracoes = n => `<span class="vidas" aria-label="${Math.max(0, n)} vidas">${[0, 1, 2].map(i => icone('heart', i < n ? 'cheio' : 'perdido')).join('')}</span>`;

function banner(palco, txt) {
  const b = document.createElement('div'); b.className = 'banner'; b.textContent = txt; palco.append(b);
  setTimeout(() => b.remove(), 1400);
}

/* ============================== Parkour Ninja ============================== */
// Pista de obstáculos de blocos. O avatar corre sozinho; cada obstáculo tem uma palavra.
// Palavra completa antes de chegar no obstáculo = pulo. Senão, o avatar cai e volta
// para a última bandeira (checkpoint). Cada bandeira é um estágio.
const TEMAS = [
  { topo: '#22c55e', lado: '#15803d', ceu: ['#38bdf8', '#e0f2fe'] },
  { topo: '#f59e0b', lado: '#b45309', ceu: ['#fb923c', '#fde68a'] },
  { topo: '#a855f7', lado: '#7e22ce', ceu: ['#6366f1', '#c7d2fe'] },
  { topo: '#06b6d4', lado: '#0e7490', ceu: ['#0f172a', '#1e3a8a'] },
  { topo: '#ec4899', lado: '#be185d', ceu: ['#f472b6', '#fce7f3'] }
];
const POR_ESTAGIO = 5; // obstáculos entre duas bandeiras

function parkour(el, ctx) {
  el.innerHTML = `<div class="hud"><span>${icone('star')} <b data-h="pontos">0</b></span><span>${icone('flag-triangle-right')} Estágio <b data-h="estagio">1</b></span><span>${icone('zap')} <b data-h="mult">x1</b></span><span>${icone('coins')} <b data-h="moedas">0</b></span><span data-h="vidas">${coracoes(3)}</span></div>
    <div class="palco obby"><canvas></canvas><div class="pk-palavra" aria-live="polite"></div></div>`;
  const palco = el.querySelector('.palco'), cv = el.querySelector('canvas'), g = cv.getContext('2d'), caixa = el.querySelector('.pk-palavra');
  let W = 0, H = 0;
  function dimensionar() {
    const r = palco.getBoundingClientRect(), dpr = devicePixelRatio || 1;
    W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px'; g.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  dimensionar(); addEventListener('resize', dimensionar);
  const chao = () => H - 96, ESC = 2.6, DECOLA = 58;

  const todas = ctx.palavras.filter(p => p.length >= 2);
  const recentes = [];
  function palavraPara(est) {
    const max = Math.min(10, 3 + Math.floor(est / 2)), min = est >= 6 ? 4 : 2;
    let ops = todas.filter(p => p.length >= min && p.length <= max && !recentes.includes(p));
    if (!ops.length) ops = todas.filter(p => p.length <= max);
    if (!ops.length) ops = todas;
    const p = rnd(ops); recentes.push(p); if (recentes.length > 12) recentes.shift();
    return p;
  }

  // Pista: obstáculos e bandeiras gerados aos poucos, à frente do jogador.
  let obst = [], bandeiras = [{ x: 0, est: 1, ativa: true }], fimX = 380, nGerados = 0;
  const TIPOS = ['buraco', 'lava', 'espinhos', 'muro', 'buraco', 'lava'];
  function gerar() {
    while (fimX < cam + W * 2.2) {
      const est = Math.floor(nGerados / POR_ESTAGIO) + 1;
      const tipo = nGerados < 2 ? 'buraco' : rnd(TIPOS);
      const w = tipo === 'muro' ? 46 : tipo === 'espinhos' ? 70 + Math.random() * 40 : 90 + Math.random() * 50;
      obst.push({ x: fimX, w, tipo, est, palavra: palavraPara(est), d: 0, pronto: false, passou: false, erro: false, moeda: Math.random() < 0.45 });
      nGerados++;
      fimX += w + 300 + Math.random() * 70;
      if (nGerados % POR_ESTAGIO === 0) { bandeiras.push({ x: fimX - 150, est: est + 1, ativa: false }); }
    }
  }

  let turbo = false, px = 120, py = 0, vy = 0, estado = 'espera', tEstado = 1.8, pulo = null, cam = 0;
  let pontos = 0, estagio = 1, vidas = 3, serie = 0, moedas = 0, acertos = 0, erros = 0, errosTecla = {};
  let parts = [], aviso = { txt: 'Prepare-se!', t: 1.6 }, raf, acabou = false;
  const t0 = performance.now(); let ant = t0;
  const vel = () => Math.min(230, 85 + (estagio - 1) * 7);
  const mult = () => 1 + Math.min(3, Math.floor(serie / 4));
  const hud = () => { hudSet(el, 'pontos', pontos); hudSet(el, 'estagio', estagio); hudSet(el, 'mult', 'x' + mult()); hudSet(el, 'moedas', moedas); hudSet(el, 'vidas', coracoes(vidas)); };
  const ativo = () => obst.find(o => !o.passou && !o.pronto);
  const proximo = () => obst.find(o => !o.passou);
  cam = px - W * 0.22; gerar();

  function mostrarPalavra() {
    const o = ativo();
    caixa.innerHTML = o ? `<span class="ok">${esc(o.palavra.slice(0, o.d))}</span><span class="atual">${esc(o.palavra[o.d] || '')}</span>${esc(o.palavra.slice(o.d + 1))}` : '';
  }
  mostrarPalavra();

  function particulas(x, y, cor, n = 18) {
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, v = 60 + Math.random() * 160; parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, t: 0.8, cor }); }
  }

  let queda = null;
  function falhar(o) {
    estado = 'caindo'; tEstado = 1.3; serie = 0; vidas--; queda = o; som.falha(); hud();
    vy = o.tipo === 'muro' || o.tipo === 'espinhos' ? -260 : 0;
    if (o.tipo === 'lava' || o.tipo === 'espinhos') particulas(px - cam, chao() - 20, o.tipo === 'lava' ? '#f97316' : '#e2e8f0');
    palco.classList.remove('treme'); void palco.offsetWidth; palco.classList.add('treme');
  }

  function renascer() {
    if (vidas <= 0) return fim();
    const b = [...bandeiras].reverse().find(x => x.ativa);
    px = b.x + (b.x ? 30 : 120); py = 0; vy = 0;
    // Os obstáculos depois da bandeira recebem palavras novas.
    for (const o of obst) if (o.x > px) Object.assign(o, { palavra: palavraPara(o.est), d: 0, pronto: false, passou: false, erro: false });
    estado = 'espera'; tEstado = 2.2; aviso = { txt: 'Tente de novo!', t: 1.4 };
    mostrarPalavra();
  }

  function loop(t) {
    if (acabou) return;
    const dt = Math.min(0.05, (t - ant) / 1000); ant = t;
    const v = vel();
    if (estado === 'espera') { tEstado -= dt; if (tEstado <= 0) estado = 'correndo'; }
    else if (estado === 'correndo') {
      // Turbo: com a palavra do próximo obstáculo já pronta, o avatar corre mais rápido.
      const o = proximo();
      turbo = !!o?.pronto;
      px += v * (turbo ? 1.9 : 1) * dt;
      if (o && px >= o.x - DECOLA) {
        if (o.pronto) { estado = 'pulando'; pulo = { x0: px, dist: o.w + DECOLA + 50, alt: o.tipo === 'muro' ? 125 : 95, o }; som.tecla(); }
        else falhar(o);
      }
      const b = bandeiras.find(x => !x.ativa && px >= x.x);
      if (b) {
        b.ativa = true; estagio = b.est; pontos += 50 * estagio; aviso = { txt: `Estágio ${estagio}!`, t: 1.4 };
        if (estagio % 5 === 1 && vidas < 3) { vidas++; aviso.txt += ' +1 vida'; }
        particulas(b.x - cam, chao() - 60, '#4ade80', 26); som.sucesso(); hud();
      }
    } else if (estado === 'pulando') {
      px += v * (turbo ? 1.6 : 1.15) * dt;
      const p = (px - pulo.x0) / pulo.dist;
      if (p >= 1) { py = 0; estado = 'correndo'; pulo.o.passou = true; }
      else py = -4 * pulo.alt * p * (1 - p);
    } else if (estado === 'caindo') {
      tEstado -= dt;
      if (queda.tipo === 'muro' || queda.tipo === 'espinhos') { vy += 900 * dt; py = Math.min(0, py + vy * dt); px -= 60 * dt; }
      else if (px < queda.x + 26) px += v * dt; // anda até a beira e cai
      else { vy += 900 * dt; py += vy * dt; if (queda.tipo === 'lava') py = Math.min(py, 22); }
      if (tEstado <= 0) renascer();
    }
    cam += (px - W * 0.22 - cam) * Math.min(1, dt * 8);
    gerar();
    obst = obst.filter(o => o.x + o.w > cam - 400);
    parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 500 * dt; p.t -= dt; }); parts = parts.filter(p => p.t > 0);
    aviso.t -= dt;
    desenhar(t / 1000);
    raf = requestAnimationFrame(loop);
  }

  // Desenho
  const nuvens = Array.from({ length: 7 }, (_, i) => ({ x: i * 260 + Math.random() * 120, y: 30 + Math.random() * 110, w: 70 + Math.random() * 70 }));
  const torres = Array.from({ length: 14 }, (_, i) => ({ x: i * 150 + Math.random() * 60, h: 60 + Math.random() * 140, w: 50 + Math.random() * 50 }));
  function bloco(x, y, w, h, topo, lado) {
    g.fillStyle = lado; g.fillRect(x, y, w, h);
    g.fillStyle = topo; g.fillRect(x, y, w, Math.min(14, h));
    g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x, y, w, 3);
    g.fillStyle = 'rgba(0,0,0,.12)'; for (let bx = x + 40; bx < x + w; bx += 40) g.fillRect(bx, y + 14, 2, h - 14);
  }
  function rotulo(o, x, y) {
    g.font = '700 18px "JetBrains Mono", ui-monospace, monospace';
    const w = g.measureText(o.palavra).width, sel = o === ativo();
    g.fillStyle = o.pronto ? 'rgba(22,163,74,.92)' : sel ? 'rgba(15,23,42,.92)' : 'rgba(15,23,42,.6)';
    g.beginPath(); g.roundRect ? g.roundRect(x - w / 2 - 9, y - 16, w + 18, 30, 8) : g.rect(x - w / 2 - 9, y - 16, w + 18, 30); g.fill();
    if (sel) { g.strokeStyle = '#facc15'; g.lineWidth = 2; g.stroke(); g.lineWidth = 1; }
    g.textBaseline = 'middle'; g.textAlign = 'left';
    const feito = o.palavra.slice(0, o.d);
    g.fillStyle = '#4ade80'; g.fillText(feito, x - w / 2, y);
    g.fillStyle = '#fff'; g.fillText(o.palavra.slice(o.d), x - w / 2 + g.measureText(feito).width, y);
  }
  function desenhar(seg) {
    const tema = TEMAS[(estagio - 1) % TEMAS.length], gy = chao();
    const ceu = g.createLinearGradient(0, 0, 0, H); ceu.addColorStop(0, tema.ceu[0]); ceu.addColorStop(1, tema.ceu[1]);
    g.fillStyle = ceu; g.fillRect(0, 0, W, H);
    // Fundo em blocos (paralaxe)
    g.fillStyle = 'rgba(255,255,255,.75)';
    for (const n of nuvens) { const x = ((n.x - cam * 0.15) % (W + 300) + W + 300) % (W + 300) - 150; g.fillRect(x, n.y, n.w, 18); g.fillRect(x + 14, n.y - 12, n.w * 0.5, 14); }
    g.fillStyle = 'rgba(30,41,59,.18)';
    for (const tr of torres) { const x = ((tr.x - cam * 0.4) % (W + 300) + W + 300) % (W + 300) - 150; g.fillRect(x, gy - tr.h, tr.w, tr.h); }
    // Chão com os buracos e a lava
    const buracos = obst.filter(o => o.tipo === 'buraco' || o.tipo === 'lava').map(o => [o.x - cam, o.x + o.w - cam, o]);
    let x0 = -10;
    for (const [a, b, o] of buracos.sort((p, q) => p[0] - q[0])) {
      if (b < 0 || a > W + 10) continue;
      if (a > x0) bloco(x0, gy, a - x0, H - gy, tema.topo, tema.lado);
      if (o.tipo === 'lava') {
        g.fillStyle = '#b91c1c'; g.fillRect(a, gy + 16, b - a, H - gy);
        g.fillStyle = '#f97316'; g.fillRect(a, gy + 16, b - a, 8);
        g.fillStyle = '#fde047'; for (let k = 0; k < 4; k++) { const bx = a + ((k * 37 + seg * 40) % Math.max(1, b - a)); g.fillRect(bx, gy + 18 + Math.sin(seg * 5 + k) * 3, 6, 6); }
      } else { g.fillStyle = 'rgba(15,23,42,.35)'; g.fillRect(a, gy, b - a, H - gy); }
      x0 = b;
    }
    if (x0 < W + 10) bloco(x0, gy, W + 10 - x0, H - gy, tema.topo, tema.lado);
    // Muros, espinhos, moedas e palavras
    for (const o of obst) {
      const x = o.x - cam;
      if (x > W + 60 || x + o.w < -60) continue;
      if (o.tipo === 'muro') { bloco(x, gy - 70, o.w, 70, '#ef4444', '#991b1b'); g.fillStyle = '#fecaca'; g.fillRect(x + 6, gy - 60, o.w - 12, 4); }
      if (o.tipo === 'espinhos') {
        g.fillStyle = '#94a3b8';
        for (let sx = x; sx < x + o.w - 8; sx += 16) { g.beginPath(); g.moveTo(sx, gy); g.lineTo(sx + 8, gy - 26); g.lineTo(sx + 16, gy); g.fill(); }
        g.fillStyle = '#e2e8f0'; for (let sx = x; sx < x + o.w - 8; sx += 16) { g.beginPath(); g.moveTo(sx + 6, gy - 10); g.lineTo(sx + 8, gy - 26); g.lineTo(sx + 9, gy - 10); g.fill(); }
      }
      const cx = x + o.w / 2, alto = o.tipo === 'muro' ? 150 : 120;
      if (o.moeda && !o.pegou) {
        const larg = Math.abs(Math.cos(seg * 4)) * 11 + 2;
        g.fillStyle = '#facc15'; g.beginPath(); g.ellipse(cx, gy - alto + 48, larg, 12, 0, 0, 7); g.fill();
        g.fillStyle = '#a16207'; g.fillRect(cx - 1.5, gy - alto + 42, 3, 12);
      }
      if (!o.passou) rotulo(o, cx, gy - alto);
    }
    // Bandeiras (checkpoints)
    for (const b of bandeiras) {
      const x = b.x - cam;
      if (!b.x || x < -60 || x > W + 60) continue;
      bloco(x - 30, gy - 8, 60, 8, b.ativa ? '#4ade80' : '#cbd5e1', b.ativa ? '#15803d' : '#64748b');
      g.fillStyle = '#e2e8f0'; g.fillRect(x - 2, gy - 90, 4, 82);
      g.fillStyle = b.ativa ? '#22c55e' : '#f43f5e'; g.beginPath(); g.moveTo(x + 2, gy - 90); g.lineTo(x + 40, gy - 78); g.lineTo(x + 2, gy - 66); g.fill();
      g.font = '800 13px Poppins, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#0f172a'; g.fillText(`Estágio ${b.est}`, x, gy - 100);
    }
    // Avatar
    const passo = estado === 'correndo' ? Math.sin(seg * 14) : estado === 'pulando' ? 0.8 : 0;
    if (turbo && estado !== 'caindo') {
      g.fillStyle = 'rgba(255,255,255,.7)';
      for (let k = 0; k < 4; k++) g.fillRect(px - cam - 40 - ((seg * 600 + k * 37) % 60), gy + py - 20 - k * 16, 26, 3);
    }
    desenharAvatar(g, ctx.avatar, px - cam, gy + py, ESC, { t: seg, passo: estado === 'correndo' ? Math.sin(seg * (turbo ? 22 : 14)) : passo });
    for (const p of parts) { g.globalAlpha = Math.max(0, p.t / 0.8); g.fillStyle = p.cor; g.fillRect(p.x, p.y, 5, 5); }
    g.globalAlpha = 1;
    if (aviso.t > 0) {
      g.font = '800 34px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = `rgba(15,23,42,${Math.min(0.5, aviso.t)})`; g.fillText(aviso.txt, W / 2 + 2, H * 0.3 + 2);
      g.fillStyle = `rgba(255,255,255,${Math.min(1, aviso.t)})`; g.fillText(aviso.txt, W / 2, H * 0.3);
    }
  }

  const parar = ouvirTeclas(k => {
    if (acabou || k === ' ' || estado === 'caindo') return;
    const o = ativo();
    if (!o) return;
    if (o.palavra[o.d] === k) {
      o.d++; acertos++; som.tecla();
      if (o.d >= o.palavra.length) {
        o.pronto = true; serie++;
        pontos += o.palavra.length * 10 * mult();
        if (o.moeda && !o.erro) { o.pegou = true; moedas++; particulas(o.x + o.w / 2 - cam, chao() - 70, '#facc15', 12); }
        som.pop(); hud();
      }
    } else {
      erros++; o.erro = true; serie = 0; som.erro(); hud();
      const e = o.palavra[o.d]; errosTecla[e] = (errosTecla[e] || 0) + 1;
      caixa.classList.remove('erro'); void caixa.offsetWidth; caixa.classList.add('erro');
    }
    mostrarPalavra();
  });
  raf = requestAnimationFrame(loop);

  function fim() {
    acabou = true; cancelAnimationFrame(raf); parar(); removeEventListener('resize', dimensionar);
    ctx.onFim({ pontos, acertos, erros, errosTecla, moedas, seg: (performance.now() - t0) / 1000, detalhe: `Chegou ao estágio ${estagio}`, extra: { estagio } });
  }
  return { destruir() { acabou = true; cancelAnimationFrame(raf); parar(); removeEventListener('resize', dimensionar); } };
}

/* ============================ Chuva de Meteoros ============================ */
// Especiais: cura (+1 vida), gelo (deixa tudo lento por 4 s) e bomba (explode todos).
// A partir do nível 3, a cada nível novo cai um Super Meteoro com uma palavra inteira.
const ESPECIAIS = { cura: 'heart', gelo: 'snowflake', bomba: 'bomb' };

function chuva(el, ctx) {
  el.innerHTML = `<div class="hud"><span>${icone('star')} <b data-h="pontos">0</b></span><span>${icone('trending-up')} Nível <b data-h="nivel">1</b></span><span>${icone('flame')} Combo <b data-h="combo">0</b></span><span>${icone('coins')} <b data-h="moedas">0</b></span><span data-h="vidas">${coracoes(3)}</span></div>
    <div class="palco chuva"><div class="cidade"></div></div>`;
  const palco = el.querySelector('.palco'), letras = [...ctx.letras];
  const palavrasChefe = ctx.palavras.filter(p => p.length >= 3 && p.length <= 6);
  let itens = [], chefe = null, pontos = 0, nivel = 1, combo = 0, vidas = 3, acertos = 0, erros = 0, errosTecla = {}, moedas = 0;
  let ultimo = 0, raf, acabou = false, gelo = 0;
  const t0 = performance.now(); let ant = t0;
  const hud = () => { hudSet(el, 'pontos', pontos); hudSet(el, 'nivel', nivel); hudSet(el, 'combo', combo); hudSet(el, 'moedas', moedas); hudSet(el, 'vidas', coracoes(vidas)); };
  function spawn() {
    const ch = rnd(letras), d = document.createElement('div');
    const sorte = Math.random();
    const tipo = nivel < 2 ? '' : vidas < 3 && sorte < 0.06 ? 'cura' : sorte < 0.12 ? 'gelo' : sorte < 0.16 ? 'bomba' : '';
    d.className = 'meteoro' + (tipo ? ' ' + tipo : '');
    d.innerHTML = `<span>${esc(ch)}</span>${tipo ? `<i>${icone(ESPECIAIS[tipo])}</i>` : ''}`;
    d.style.left = (3 + Math.random() * 88) + '%';
    palco.append(d); itens.push({ ch, el: d, y: -60, tipo });
  }
  function spawnChefe() {
    if (!palavrasChefe.length) return;
    const p = rnd(palavrasChefe), d = document.createElement('div');
    d.className = 'meteoro chefe'; d.style.left = (20 + Math.random() * 60) + '%';
    palco.append(d); chefe = { p, d: 0, el: d, y: -110 };
    desenharChefe(); banner(palco, 'Super Meteoro!');
  }
  const desenharChefe = () => { chefe.el.innerHTML = `<span><b>${esc(chefe.p.slice(0, chefe.d))}</b>${esc(chefe.p.slice(chefe.d))}</span>`; };
  function remover(it, cls) { itens = itens.filter(x => x !== it); it.el.classList.add(cls); setTimeout(() => it.el.remove(), 400); }
  function tremer() { palco.classList.remove('treme'); void palco.offsetWidth; palco.classList.add('treme'); }
  function loop(t) {
    if (acabou) return;
    const dt = Math.min(0.05, (t - ant) / 1000); ant = t;
    gelo = Math.max(0, gelo - dt); palco.classList.toggle('congelado', gelo > 0);
    const lento = gelo > 0 ? 0.35 : 1;
    if (t - ultimo > Math.max(420, 1500 - (nivel - 1) * 110) / lento) { spawn(); ultimo = t; }
    const vel = (42 + nivel * 13) * lento, lim = palco.clientHeight - 70;
    for (const it of [...itens]) {
      it.y += vel * dt; it.el.style.transform = `translateY(${it.y}px)`;
      if (it.y > lim) {
        remover(it, 'impacto');
        if (it.tipo) continue; // especial perdido não tira vida
        vidas--; combo = 0; som.erro(); hud(); tremer();
        if (vidas <= 0) return fim();
      }
    }
    if (chefe) {
      chefe.y += (16 + nivel * 3) * lento * dt; chefe.el.style.transform = `translateY(${chefe.y}px)`;
      if (chefe.y > lim - 40) {
        chefe.el.classList.add('impacto'); const e = chefe.el; setTimeout(() => e.remove(), 400); chefe = null;
        vidas -= 2; combo = 0; som.erro(); hud(); tremer();
        if (vidas <= 0) return fim();
      }
    }
    raf = requestAnimationFrame(loop);
  }
  function acertou(pts) { combo++; acertos++; pontos += pts + Math.min(combo, 30); if (combo % 10 === 0) moedas++; }
  const parar = ouvirTeclas(k => {
    if (acabou || k === ' ') return;
    // O Super Meteoro tem prioridade quando a letra é a próxima da palavra dele.
    if (chefe && chefe.p[chefe.d] === k) {
      chefe.d++; acertou(5 * nivel); som.tecla(); desenharChefe();
      if (chefe.d >= chefe.p.length) {
        pontos += 100 * nivel; moedas += 3; chefe.el.classList.add('boom'); const e = chefe.el; setTimeout(() => e.remove(), 400); chefe = null;
        banner(palco, 'Super Meteoro destruído!'); som.sucesso();
      }
      return hud();
    }
    const alvos = itens.filter(i => i.ch === k);
    if (alvos.length) {
      const it = alvos.reduce((a, b) => (a.y > b.y ? a : b));
      remover(it, 'boom'); acertou(10 * nivel); som.pop();
      if (it.tipo === 'cura') { vidas = Math.min(3, vidas + 1); banner(palco, '+1 vida!'); }
      if (it.tipo === 'gelo') { gelo = 4; banner(palco, 'Congelou!'); }
      if (it.tipo === 'bomba') { for (const x of [...itens]) { remover(x, 'boom'); pontos += 10 * nivel; acertos++; } banner(palco, 'Bum!'); tremer(); }
      if (acertos % 15 === 0) { nivel++; banner(palco, `Nível ${nivel}!`); if (nivel >= 3 && !chefe) setTimeout(() => !acabou && !chefe && spawnChefe(), 1500); }
    } else {
      erros++; combo = 0; som.erro();
      const esperado = chefe ? chefe.p[chefe.d] : itens.reduce((a, b) => (!a || b.y > a.y ? b : a), null)?.ch;
      if (esperado) errosTecla[esperado] = (errosTecla[esperado] || 0) + 1;
    }
    hud();
  });
  raf = requestAnimationFrame(loop);
  function fim() {
    acabou = true; cancelAnimationFrame(raf); parar();
    ctx.onFim({ pontos, acertos, erros, errosTecla, moedas, seg: (performance.now() - t0) / 1000, detalhe: `Chegou ao nível ${nivel}` });
  }
  return { destruir() { acabou = true; cancelAnimationFrame(raf); parar(); } };
}

/* ============================ Defesa Galáctica ============================ */
function galaxia(el, ctx) {
  el.innerHTML = `<div class="hud"><span>${icone('star')} <b data-h="pontos">0</b></span><span>${icone('waves')} Onda <b data-h="onda">1</b></span><span>${icone('shield')} <b data-h="escudos">3</b> escudos</span><span>${icone('zap')} <b data-h="mult">x1</b></span><span>${icone('coins')} <b data-h="moedas">0</b></span></div>
    <div class="palco espaco"><canvas></canvas></div>`;
  const palco = el.querySelector('.palco'), cv = el.querySelector('canvas'), g = cv.getContext('2d');
  const FONTE = '600 17px "JetBrains Mono", ui-monospace, monospace';
  let W = 0, H = 0;
  function dimensionar() {
    const r = palco.getBoundingClientRect(), dpr = devicePixelRatio || 1;
    W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px'; g.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  dimensionar(); addEventListener('resize', dimensionar);
  const estrelas = Array.from({ length: 100 }, () => ({ x: Math.random(), y: Math.random(), z: Math.random() * 0.8 + 0.2 }));
  const palavras = ctx.palavras.filter(p => p.length >= 2);
  let inimigos = [], alvo = null, lasers = [], parts = [], pontos = 0, onda = 1, escudos = 3, restantes = 0, spawnT = 0;
  let acertos = 0, erros = 0, errosTecla = {}, raf, acabou = false, aviso = { txt: 'Onda 1', t: 2 }, dano = 0;
  let serie = 0, moedas = 0, destruidas = 0, chefao = false;
  const mult = () => 1 + Math.min(3, Math.floor(serie / 4));
  const t0 = performance.now(); let ant = t0;
  const hud = () => { hudSet(el, 'pontos', pontos); hudSet(el, 'onda', onda); hudSet(el, 'escudos', escudos); hudSet(el, 'mult', 'x' + mult()); hudSet(el, 'moedas', moedas); };
  const novaOnda = () => {
    if (onda % 4 === 0) { restantes = 0; aviso = { txt: 'A Nave-mãe chegou!', t: 2.5 }; spawnChefe(); }
    else { restantes = 4 + onda * 2; aviso = { txt: `Onda ${onda}`, t: 2 }; }
    hud();
  };
  novaOnda();
  function spawnChefe() {
    const longas = palavras.filter(p => p.length >= 4 && p.length <= 8);
    const lista = embaralhar(longas.length >= 3 ? longas : palavras).slice(0, 3 + Math.floor(onda / 4));
    inimigos.push({ p: lista[0], fila: lista.slice(1), total: lista.length, d: 0, x: W / 2, y: -40, v: 7 + onda * 0.8, chefe: true });
  }
  function spawn() {
    const max = 3 + onda;
    let ops = palavras.filter(p => p.length <= max && !inimigos.some(i => i.p[0] === p[0]));
    if (!ops.length) ops = palavras.filter(p => !inimigos.some(i => i.p[0] === p[0]));
    if (!ops.length) return;
    const p = rnd(ops); g.font = FONTE; const w = g.measureText(p).width;
    const escudo = escudos < 3 && Math.random() < 0.12;
    inimigos.push({ p, d: 0, x: 30 + w / 2 + Math.random() * Math.max(10, W - 60 - w), y: -20, v: 20 + onda * 5 + Math.random() * 8, escudo });
    restantes--;
  }
  function explodir(x, y, cor) {
    for (let i = 0; i < 26; i++) { const a = Math.random() * 6.28, v = 40 + Math.random() * 160; parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0.7, cor }); }
  }
  function loop(t) {
    if (acabou) return;
    const dt = Math.min(0.05, (t - ant) / 1000); ant = t;
    if (restantes > 0 && t - spawnT > Math.max(900, 2600 - onda * 180)) { spawn(); spawnT = t; }
    if (restantes <= 0 && !inimigos.length) { onda++; novaOnda(); spawnT = t + 1200; }
    for (const i of [...inimigos]) {
      i.y += i.v * dt;
      if (i.y > H - 72 - (i.chefe ? 26 : 0)) {
        inimigos = inimigos.filter(x => x !== i); if (alvo === i) alvo = null;
        explodir(i.x, i.y, '#fb7185');
        if (i.escudo) continue; // a nave de escudo só vai embora
        escudos -= i.chefe ? 2 : 1; dano = 0.5; serie = 0; som.erro(); hud();
        if (escudos <= 0) { desenhar(dt); return fim(); }
      }
    }
    lasers.forEach(l => (l.t -= dt)); lasers = lasers.filter(l => l.t > 0);
    parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.t -= dt; }); parts = parts.filter(p => p.t > 0);
    aviso.t -= dt; dano = Math.max(0, dano - dt);
    desenhar(dt);
    raf = requestAnimationFrame(loop);
  }
  function caixa(x, y, w, h, r) { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); }
  function desenhar(dt) {
    const grd = g.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, '#0b0820'); grd.addColorStop(1, '#22125a');
    g.fillStyle = grd; g.fillRect(0, 0, W, H);
    for (const s of estrelas) { s.y += s.z * dt * 0.04; if (s.y > 1) s.y -= 1; g.fillStyle = `rgba(255,255,255,${s.z})`; g.fillRect(s.x * W, s.y * H, s.z * 2, s.z * 2); }
    const nx = W / 2, ny = H - 30;
    g.strokeStyle = `rgba(34,211,238,${0.2 + 0.2 * escudos})`; g.setLineDash([6, 8]); g.beginPath(); g.moveTo(0, H - 72); g.lineTo(W, H - 72); g.stroke(); g.setLineDash([]);
    g.lineWidth = 3;
    for (const l of lasers) { g.strokeStyle = `rgba(34,211,238,${l.t / 0.15})`; g.beginPath(); g.moveTo(nx, ny - 26); g.lineTo(l.x, l.y); g.stroke(); }
    g.lineWidth = 1;
    g.fillStyle = '#8b5cf6'; g.beginPath(); g.moveTo(nx, ny - 28); g.lineTo(nx + 24, ny + 14); g.lineTo(nx, ny + 5); g.lineTo(nx - 24, ny + 14); g.closePath(); g.fill();
    g.fillStyle = '#22d3ee'; g.beginPath(); g.arc(nx, ny - 6, 5, 0, 7); g.fill();
    g.font = FONTE; g.textBaseline = 'middle'; g.textAlign = 'left';
    for (const i of inimigos) {
      const sel = i === alvo, k = i.chefe ? 3 : 1;
      g.fillStyle = i.chefe ? (sel ? '#fb7185' : '#be123c') : i.escudo ? '#4ade80' : sel ? '#f472b6' : '#a78bfa';
      g.beginPath(); g.ellipse(i.x, i.y, 19 * k, 7 * k, 0, 0, 7); g.fill();
      g.fillStyle = 'rgba(186,230,253,.85)'; g.beginPath(); g.ellipse(i.x, i.y - 4 * k, 8 * k, 7 * k, 0, Math.PI, 0); g.fill();
      if (i.chefe) {
        for (let n = -2; n <= 2; n++) { g.fillStyle = (Math.floor(performance.now() / 200) + n) % 2 ? '#fde047' : '#f97316'; g.beginPath(); g.arc(i.x + n * 18, i.y + 6, 3.5, 0, 7); g.fill(); }
        const vida = (i.fila.length + 1) / i.total;
        g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(i.x - 50, i.y - 42, 100, 7);
        g.fillStyle = '#f43f5e'; g.fillRect(i.x - 50, i.y - 42, 100 * vida, 7);
      }
      if (i.escudo) { g.strokeStyle = '#bbf7d0'; g.lineWidth = 2; g.beginPath(); g.arc(i.x, i.y - 2, 24, 0, 7); g.stroke(); g.lineWidth = 1; }
      g.font = FONTE;
      const w = g.measureText(i.p).width, tx = i.x - w / 2, ty = i.y + 24 * (i.chefe ? 1.6 : 1);
      g.fillStyle = 'rgba(0,0,0,.6)'; caixa(tx - 7, ty - 12, w + 14, 24, 7); g.fill();
      if (sel) { g.strokeStyle = '#f472b6'; g.lineWidth = 2; caixa(tx - 7, ty - 12, w + 14, 24, 7); g.stroke(); g.lineWidth = 1; }
      const feito = i.p.slice(0, i.d);
      g.fillStyle = '#22d3ee'; g.fillText(feito, tx, ty);
      g.fillStyle = '#fff'; g.fillText(i.p.slice(i.d), tx + g.measureText(feito).width, ty);
    }
    for (const p of parts) { g.globalAlpha = Math.max(0, p.t / 0.7); g.fillStyle = p.cor; g.fillRect(p.x, p.y, 3, 3); }
    g.globalAlpha = 1;
    if (aviso.t > 0) { g.font = '800 34px Poppins, sans-serif'; g.textAlign = 'center'; g.fillStyle = `rgba(255,255,255,${Math.min(1, aviso.t)})`; g.fillText(aviso.txt, W / 2, H / 2 - 30); }
    if (dano > 0) { g.fillStyle = `rgba(244,63,94,${dano * 0.5})`; g.fillRect(0, 0, W, H); }
  }
  const parar = ouvirTeclas(k => {
    if (acabou) return;
    if (!alvo) {
      const c = inimigos.filter(i => i.p[0] === k);
      if (!c.length) { erros++; som.erro(); return; }
      alvo = c.reduce((a, b) => (a.y > b.y ? a : b));
    } else if (alvo.p[alvo.d] !== k) {
      erros++; const e = alvo.p[alvo.d]; errosTecla[e] = (errosTecla[e] || 0) + 1; serie = 0; som.erro(); hud(); return;
    }
    alvo.d++; acertos++; lasers.push({ x: alvo.x, y: alvo.y, t: 0.15 }); som.tecla();
    if (alvo.d >= alvo.p.length) {
      serie++; pontos += alvo.p.length * 10 * onda * mult(); som.pop();
      if (alvo.chefe && alvo.fila.length) {
        // A Nave-mãe perde uma parte e mostra a próxima palavra.
        explodir(alvo.x, alvo.y, '#fda4af'); alvo.p = alvo.fila.shift(); alvo.d = 0; alvo.y = Math.max(-20, alvo.y - 30); alvo = null; return hud();
      }
      explodir(alvo.x, alvo.y, alvo.chefe ? '#fde047' : '#67e8f9');
      if (alvo.chefe) { chefao = true; moedas += 5; pontos += 300 * onda; aviso = { txt: 'Nave-mãe destruída!', t: 2.2 }; som.sucesso(); }
      if (alvo.escudo && escudos < 3) { escudos++; aviso = { txt: '+1 escudo', t: 1.2 }; }
      if (++destruidas % 6 === 0) moedas++;
      inimigos = inimigos.filter(i => i !== alvo); alvo = null; hud();
    }
  });
  raf = requestAnimationFrame(loop);
  function fim() {
    acabou = true; cancelAnimationFrame(raf); parar(); removeEventListener('resize', dimensionar);
    ctx.onFim({ pontos, acertos, erros, errosTecla, moedas, seg: (performance.now() - t0) / 1000, detalhe: `Chegou à onda ${onda}${chefao ? ' · derrotou a Nave-mãe' : ''}`, extra: chefao ? { chefao: true } : {} });
  }
  return { destruir() { acabou = true; cancelAnimationFrame(raf); parar(); removeEventListener('resize', dimensionar); } };
}

/* ============================== Corrida Turbo ============================== */
const carro = cor => `<svg viewBox="0 0 64 32" width="64" height="32" aria-hidden="true"><path d="M6 20 L12 10 Q14 7 18 7 L38 7 Q42 7 45 10 L52 16 L58 17 Q62 18 62 22 L62 25 L2 25 L2 22 Q2 20 6 20Z" fill="${cor}"/><path d="M16 10 L22 10 L22 16 L12 16Z M25 10 L37 10 Q40 10 42 13 L44 16 L25 16Z" fill="#cfefff"/><circle cx="16" cy="25" r="6" fill="#1f2937"/><circle cx="16" cy="25" r="2.5" fill="#d1d5db"/><circle cx="48" cy="25" r="6" fill="#1f2937"/><circle cx="48" cy="25" r="2.5" fill="#d1d5db"/></svg>`;

function corrida(el, ctx) {
  let motor = null, raf, timer, acabou = false;
  el.innerHTML = `<div class="escolha"><h3>Escolha a dificuldade dos rivais</h3><div class="dif">
    <button class="bt sec" data-d="0">${icone('turtle')} Fácil<small>rivais a 12, 18 e 24 PPM</small></button>
    <button class="bt sec" data-d="1">${icone('rabbit')} Médio<small>rivais a 20, 28 e 36 PPM</small></button>
    <button class="bt sec" data-d="2">${icone('flame')} Difícil<small>rivais a 30, 42 e 55 PPM</small></button></div></div>`;
  el.querySelectorAll('[data-d]').forEach(b => (b.onclick = () => iniciar(+b.dataset.d)));

  function iniciar(dif) {
    const ppms = [[12, 18, 24], [20, 28, 36], [30, 42, 55]][dif];
    const texto = embaralhar(ctx.frases).slice(0, 2).join(' ');
    const total = [...texto].length;
    const corPlayer = ITENS.find(i => i.id === avatarDe(ctx.avatar).camisa)?.cor || '#8b5cf6';
    const corredores = [{ nome: 'Você', cor: corPlayer, voce: true }, ...ppms.map((p, i) => ({ nome: `Robô ${p} PPM`, cor: ['#f97316', '#06b6d4', '#ef4444'][i], ppm: p }))];
    el.innerHTML = `<div class="pista">${corredores.map((c, k) => `<div class="faixa${c.voce ? ' voce' : ''}"><span class="nome">${c.nome}</span><div class="carro" id="car${k}">${carro(c.cor)}</div><div class="chegada"></div></div>`).join('')}</div>
      <div class="contagem" id="cont">3</div>
      <div class="hud"><span>${icone('zap')} <b data-h="ppm">0</b> PPM</span><span>${icone('target')} <b data-h="prec">100</b>%</span>
        <span class="nitro-hud">${icone('flame')} Nitro <span class="nitro-barra"><i data-h="nitro"></i></span></span><span>${icone('rocket')} <b data-h="nitros">0</b></span></div>
      <div class="texto corrida-texto" id="txt"></div>`;
    const txt = el.querySelector('#txt'), cont = el.querySelector('#cont');
    txt.textContent = texto;
    const pos = k => el.querySelector('#car' + k);
    const mover = (k, p) => { pos(k).style.left = `calc(${Math.min(1, p) * 100}% - ${Math.min(1, p) * 64}px)`; };
    let n = 3, tIni = 0, chegadas = [];
    // Nitro: 15 acertos seguidos dão pontos extras e uma chama no carro.
    const NITRO = 15;
    let serie = 0, antA = 0, antE = 0, nitros = 0;
    const barra = () => { const b = el.querySelector('[data-h="nitro"]'); if (b) b.style.width = (serie / NITRO) * 100 + '%'; };
    function progresso(s) {
      if (s.erros > antE) serie = 0; else serie += s.acertos - antA;
      antA = s.acertos; antE = s.erros;
      if (serie >= NITRO) {
        serie = 0; nitros++; hudSet(el, 'nitros', nitros); som.pop();
        const c = pos(0); c.classList.remove('nitro'); void c.offsetWidth; c.classList.add('nitro');
        setTimeout(() => c.classList.remove('nitro'), 1500);
      }
      barra();
    }
    timer = setInterval(() => {
      n--;
      if (n > 0) { cont.textContent = n; som.tecla(); return; }
      clearInterval(timer); cont.textContent = 'VAI!'; som.pop(); setTimeout(() => cont.classList.add('some'), 600);
      tIni = performance.now();
      motor = new Motor({
        alvo: txt, texto,
        onProgresso: s => { mover(0, s.progresso); hudSet(el, 'ppm', s.ppm); hudSet(el, 'prec', s.precisao); progresso(s); },
        onFim: s => terminar(s)
      });
      raf = requestAnimationFrame(anima);
    }, 800);
    function anima(t) {
      if (acabou) return;
      const min = (t - tIni) / 60000;
      corredores.forEach((c, k) => {
        if (c.voce) return;
        const p = (c.ppm * 5 * min) / total; mover(k, p);
        if (p >= 1 && !chegadas.includes(k)) chegadas.push(k);
      });
      raf = requestAnimationFrame(anima);
    }
    function terminar(s) {
      const lugar = chegadas.length + 1;
      acabou = true; cancelAnimationFrame(raf);
      const base = [400, 250, 150, 80][lugar - 1];
      const pontos = Math.round((base + s.ppm * 5) * (s.precisao / 100)) + nitros * 40;
      const medalha = ['1º lugar!', '2º lugar', '3º lugar', '4º lugar'][lugar - 1];
      cont.classList.remove('some'); cont.textContent = medalha;
      if (lugar === 1) som.sucesso();
      setTimeout(() => ctx.onFim({ ...s, pontos, moedas: lugar === 1 ? 3 + dif * 2 : 0, detalhe: `${medalha} · ${s.ppm} PPM · ${s.precisao}% de precisão · ${nitros} nitro(s)`, extra: lugar === 1 && dif === 2 ? { venceuDificil: true } : {} }), 1400);
    }
  }
  return { destruir() { acabou = true; clearInterval(timer); cancelAnimationFrame(raf); motor?.destruir(); } };
}

/* ============================== Caça-Toupeiras ============================== */
// Níveis: a cada 8 acertos o nível sobe; do nível 3 em diante aparecem duas toupeiras,
// do nível 6 em diante, três. Bombas (a partir do nível 2) tiram pontos e tempo.
function toupeira(el, ctx) {
  const DUR = 45;
  el.innerHTML = `<div class="hud"><span>${icone('star')} <b data-h="pontos">0</b></span><span>${icone('timer')} <b data-h="tempo">${DUR}</b>s</span><span>${icone('trending-up')} Nível <b data-h="nivel">1</b></span><span>${icone('target')} <b data-h="acertos">0</b> acertos</span>
    <label class="chk"><input type="checkbox" id="ninja"> ${icone('eye-off')} Modo ninja</label></div>
    <div class="palco toupeira-palco"><div id="kb"></div></div>`;
  const kb = criarTeclado(el.querySelector('#kb')); kb.el.classList.add('kb-toupeira');
  el.querySelector('#ninja').onchange = e => { kb.el.classList.toggle('sem-rotulos', e.target.checked); e.target.blur(); };
  const letras = [...ctx.letras].filter(c => codeDe(c));
  let ativos = [], janela = 1800, pontos = 0, acertos = 0, erros = 0, errosTecla = {}, nivel = 1, extra = 0, moedas = 0, acabou = false;
  const t0 = performance.now(), timers = new Set();
  const depois = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
  const hud = () => { hudSet(el, 'pontos', pontos); hudSet(el, 'acertos', acertos); hudSet(el, 'nivel', nivel); };
  const quantas = () => (nivel >= 6 ? 3 : nivel >= 3 ? 2 : 1);
  const teclaDe = ch => kb.el.querySelector(`[data-code="${codeDe(ch)}"]`);

  function tirar(m) { ativos = ativos.filter(x => x !== m); clearTimeout(m.timer); timers.delete(m.timer); m.tecla.classList.remove('mole', 'dourada', 'bomba'); }
  function aparecer() {
    if (acabou) return;
    const normais = ativos.filter(m => m.tipo !== 'bomba').length;
    if (normais >= quantas()) return;
    const livres = letras.filter(c => !ativos.some(m => m.ch === c));
    if (!livres.length) return;
    const ch = rnd(livres), tecla = teclaDe(ch);
    const tipo = Math.random() < 0.12 ? 'dourada' : 'normal';
    const m = { ch, tecla, tipo, tAp: performance.now() };
    tecla.classList.add('mole'); if (tipo === 'dourada') tecla.classList.add('dourada');
    m.timer = depois(() => {
      tirar(m); tecla.classList.add('fugiu'); setTimeout(() => tecla.classList.remove('fugiu'), 400);
      depois(aparecer, 250);
    }, janela);
    ativos.push(m);
    // Às vezes uma bomba aparece junto (nunca na mesma tecla).
    if (nivel >= 2 && Math.random() < 0.18 + nivel * 0.02) bomba();
    if (ativos.filter(x => x.tipo !== 'bomba').length < quantas()) depois(aparecer, 350);
  }
  function bomba() {
    const livres = letras.filter(c => !ativos.some(m => m.ch === c));
    if (!livres.length || ativos.some(m => m.tipo === 'bomba')) return;
    const ch = rnd(livres), tecla = teclaDe(ch);
    const m = { ch, tecla, tipo: 'bomba' };
    tecla.classList.add('mole', 'bomba');
    m.timer = depois(() => tirar(m), 1500);
    ativos.push(m);
  }
  function flutuar(t, txt, ruim) {
    const r = t.getBoundingClientRect(), pr = el.querySelector('.palco').getBoundingClientRect();
    const f = document.createElement('div'); f.className = 'flutua' + (ruim ? ' ruim' : ''); f.textContent = txt;
    f.style.left = r.left - pr.left + r.width / 2 + 'px'; f.style.top = r.top - pr.top + 'px';
    el.querySelector('.palco').append(f); setTimeout(() => f.remove(), 800);
  }
  const parar = ouvirTeclas((k, e) => {
    if (acabou || k === ' ') return;
    const m = ativos.find(x => x.ch === k);
    if (m?.tipo === 'bomba') {
      tirar(m); pontos = Math.max(0, pontos - 50); extra -= 3; erros++; som.erro();
      flutuar(m.tecla, '-50  -3s', true); kb.flash(e.code, false); hud();
      return;
    }
    if (m) {
      const dourada = m.tipo === 'dourada';
      const pts = Math.round(20 + 80 * Math.max(0, 1 - (performance.now() - m.tAp) / janela)) * (dourada ? 2 : 1) * nivel;
      pontos += pts; acertos++; janela = Math.max(700, janela - 25);
      if (dourada) { extra += 2; moedas++; }
      const t = m.tecla; tirar(m); t.classList.add('pegou'); flutuar(t, '+' + pts + (dourada ? '  +2s' : '')); setTimeout(() => t.classList.remove('pegou'), 300);
      if (acertos % 8 === 0) { nivel++; banner(el.querySelector('.palco'), `Nível ${nivel}!`); }
      som.pop(); hud(); depois(aparecer, 200);
    } else {
      erros++; const alvo = ativos.find(x => x.tipo !== 'bomba');
      if (alvo) errosTecla[alvo.ch] = (errosTecla[alvo.ch] || 0) + 1;
      kb.flash(e.code, false); som.erro();
    }
  });
  const relogio = setInterval(() => {
    const resta = Math.max(0, DUR + extra - (performance.now() - t0) / 1000);
    hudSet(el, 'tempo', Math.ceil(resta));
    if (resta <= 0) fim();
  }, 200);
  aparecer();
  function fim() {
    if (acabou) return;
    acabou = true; clearInterval(relogio); timers.forEach(clearTimeout); parar(); [...ativos].forEach(tirar);
    ctx.onFim({ pontos, acertos, erros, errosTecla, moedas, seg: (performance.now() - t0) / 1000, detalhe: `${acertos} toupeiras · nível ${nivel}` });
  }
  return { destruir() { acabou = true; clearInterval(relogio); timers.forEach(clearTimeout); parar(); } };
}

/* ============================ Desafio 60 segundos ============================ */
function teste(el, ctx) {
  const DUR = 60;
  const texto = embaralhar(ctx.frases).join(' ');
  el.innerHTML = `<div class="hud"><span>${icone('timer')} <b data-h="tempo">${DUR}</b>s</span><span>${icone('zap')} <b data-h="ppm">0</b> PPM</span><span>${icone('target')} <b data-h="prec">100</b>%</span></div>
    <p class="instr">O cronômetro começa quando você digitar a primeira letra.</p>
    <div class="texto teste-texto" id="txt"></div>`;
  let acabou = false;
  const motor = new Motor({
    alvo: el.querySelector('#txt'), texto,
    onProgresso: s => { hudSet(el, 'ppm', s.ppm); hudSet(el, 'prec', s.precisao); },
    onFim: s => fim(s)
  });
  const relogio = setInterval(() => {
    if (!motor.inicio) return;
    const resta = DUR - (performance.now() - motor.inicio) / 1000;
    hudSet(el, 'tempo', Math.max(0, Math.ceil(resta)));
    if (resta <= 0) fim(motor.parar(motor.inicio + DUR * 1000));
  }, 100);
  function fim(s) {
    if (acabou) return;
    acabou = true; clearInterval(relogio);
    ctx.onFim({ ...s, pontos: Math.round(s.ppm * 10 * (s.precisao / 100)), detalhe: `${s.ppm} PPM com ${s.precisao}% de precisão` });
  }
  return { destruir() { acabou = true; clearInterval(relogio); motor.destruir(); } };
}

const FUNCOES = { parkour, chuva, galaxia, corrida, toupeira, teste };
export const iniciarJogo = (id, el, ctx) => FUNCOES[id](el, ctx);
