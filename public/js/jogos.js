// Jogos de digitação. Cada jogo recebe (el, ctx) e devolve { destruir }.
// ctx = { letras, palavras, frases, onFim(resultado) }
import { som, esc, rnd, embaralhar } from './ui.js';
import { Motor } from './motor.js';
import { criarTeclado, codeDe } from './teclado.js';

export const JOGOS = [
  { id: 'chuva', nome: 'Chuva de Meteoros', icone: '☄️', cor: '#f97316',
    desc: 'Letras caem do céu! Digite cada letra para destruir o meteoro antes que ele atinja a cidade.',
    como: ['Digite a letra que aparece no meteoro.', 'A cada 15 acertos, o nível sobe e tudo fica mais rápido.', 'Você tem 3 vidas. Errar zera o combo!'] },
  { id: 'galaxia', nome: 'Defesa Galáctica', icone: '🚀', cor: '#8b5cf6',
    desc: 'Naves inimigas trazem palavras. Digite a palavra inteira para disparar seu laser.',
    como: ['Digite a primeira letra para mirar em uma nave.', 'Termine a palavra para destruí-la.', 'Se uma nave passar da linha do escudo, você perde um escudo.'] },
  { id: 'corrida', nome: 'Corrida Turbo', icone: '🏎️', cor: '#ef4444',
    desc: 'Cada letra certa acelera seu carro. Digite a frase e chegue antes dos rivais!',
    como: ['Escolha a dificuldade dos rivais.', 'Digite a frase: cada acerto faz o carro andar.', 'Erros não fazem o carro andar — precisão é velocidade!'] },
  { id: 'toupeira', nome: 'Caça-Toupeiras', icone: '🐹', cor: '#22c55e',
    desc: 'Uma toupeira aparece em uma tecla. Aperte a tecla certa antes que ela fuja!',
    como: ['Aperte a tecla onde a toupeira aparecer.', 'Quanto mais rápido, mais pontos. A toupeira dourada vale o dobro!', 'Ative o modo ninja para esconder as letras do teclado.'] },
  { id: 'teste', nome: 'Desafio 60 segundos', icone: '⏱️', cor: '#06b6d4',
    desc: 'Teste de velocidade: quantas palavras por minuto você consegue digitar?',
    como: ['O cronômetro começa na primeira tecla.', 'Digite o máximo que conseguir em 60 segundos.', 'PPM = palavras por minuto (cada 5 caracteres contam como 1 palavra).'] }
];

function ouvirTeclas(fn) {
  const h = e => {
    if (e.ctrlKey || e.metaKey || (e.altKey && !e.getModifierState?.('AltGraph'))) return;
    if (e.key.length !== 1) return;
    e.preventDefault(); fn(e.key.toLowerCase(), e);
  };
  addEventListener('keydown', h);
  return () => removeEventListener('keydown', h);
}

const hudSet = (el, k, v) => { const x = el.querySelector(`[data-h="${k}"]`); if (x) x.innerHTML = v; };
const coracoes = n => '❤️'.repeat(Math.max(0, n)) + '🖤'.repeat(Math.max(0, 3 - n));

function banner(palco, txt) {
  const b = document.createElement('div'); b.className = 'banner'; b.textContent = txt; palco.append(b);
  setTimeout(() => b.remove(), 1400);
}

/* ============================ Chuva de Meteoros ============================ */
function chuva(el, ctx) {
  el.innerHTML = `<div class="hud"><span>⭐ <b data-h="pontos">0</b></span><span>📈 Nível <b data-h="nivel">1</b></span><span>🔥 Combo <b data-h="combo">0</b></span><span data-h="vidas">${coracoes(3)}</span></div>
    <div class="palco chuva"><div class="cidade"></div></div>`;
  const palco = el.querySelector('.palco'), letras = [...ctx.letras];
  let itens = [], pontos = 0, nivel = 1, combo = 0, vidas = 3, acertos = 0, erros = 0, ultimo = 0, raf, acabou = false;
  const t0 = performance.now(); let ant = t0;
  const hud = () => { hudSet(el, 'pontos', pontos); hudSet(el, 'nivel', nivel); hudSet(el, 'combo', combo); hudSet(el, 'vidas', coracoes(vidas)); };
  function spawn() {
    const ch = rnd(letras), d = document.createElement('div');
    d.className = 'meteoro'; d.innerHTML = `<span>${esc(ch)}</span>`; d.style.left = (3 + Math.random() * 88) + '%';
    palco.append(d); itens.push({ ch, el: d, y: -60 });
  }
  function remover(it, cls) { itens = itens.filter(x => x !== it); it.el.classList.add(cls); setTimeout(() => it.el.remove(), 400); }
  function loop(t) {
    if (acabou) return;
    const dt = Math.min(0.05, (t - ant) / 1000); ant = t;
    if (t - ultimo > Math.max(420, 1500 - (nivel - 1) * 110)) { spawn(); ultimo = t; }
    const vel = 42 + nivel * 13, lim = palco.clientHeight - 70;
    for (const it of [...itens]) {
      it.y += vel * dt; it.el.style.transform = `translateY(${it.y}px)`;
      if (it.y > lim) {
        remover(it, 'impacto'); vidas--; combo = 0; som.erro(); hud();
        palco.classList.remove('treme'); void palco.offsetWidth; palco.classList.add('treme');
        if (vidas <= 0) return fim();
      }
    }
    raf = requestAnimationFrame(loop);
  }
  const parar = ouvirTeclas(k => {
    if (acabou) return;
    const alvos = itens.filter(i => i.ch === k);
    if (alvos.length) {
      const it = alvos.reduce((a, b) => (a.y > b.y ? a : b));
      remover(it, 'boom'); combo++; acertos++; pontos += 10 * nivel + Math.min(combo, 30); som.pop();
      if (acertos % 15 === 0) { nivel++; banner(palco, `Nível ${nivel}!`); }
    } else { erros++; combo = 0; som.erro(); }
    hud();
  });
  raf = requestAnimationFrame(loop);
  function fim() {
    acabou = true; cancelAnimationFrame(raf); parar();
    ctx.onFim({ pontos, acertos, erros, seg: (performance.now() - t0) / 1000, detalhe: `Chegou ao nível ${nivel}` });
  }
  return { destruir() { acabou = true; cancelAnimationFrame(raf); parar(); } };
}

/* ============================ Defesa Galáctica ============================ */
function galaxia(el, ctx) {
  el.innerHTML = `<div class="hud"><span>⭐ <b data-h="pontos">0</b></span><span>🌊 Onda <b data-h="onda">1</b></span><span>🛡️ <b data-h="escudos">3</b> escudos</span></div>
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
  const t0 = performance.now(); let ant = t0;
  const hud = () => { hudSet(el, 'pontos', pontos); hudSet(el, 'onda', onda); hudSet(el, 'escudos', escudos); };
  const novaOnda = () => { restantes = 4 + onda * 2; aviso = { txt: `Onda ${onda}`, t: 2 }; hud(); };
  novaOnda();
  function spawn() {
    const max = 3 + onda;
    let ops = palavras.filter(p => p.length <= max && !inimigos.some(i => i.p[0] === p[0]));
    if (!ops.length) ops = palavras.filter(p => !inimigos.some(i => i.p[0] === p[0]));
    if (!ops.length) return;
    const p = rnd(ops); g.font = FONTE; const w = g.measureText(p).width;
    inimigos.push({ p, d: 0, x: 30 + w / 2 + Math.random() * Math.max(10, W - 60 - w), y: -20, v: 20 + onda * 5 + Math.random() * 8 });
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
      if (i.y > H - 72) {
        inimigos = inimigos.filter(x => x !== i); if (alvo === i) alvo = null;
        escudos--; dano = 0.5; explodir(i.x, i.y, '#fb7185'); som.erro(); hud();
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
      const sel = i === alvo;
      g.fillStyle = sel ? '#f472b6' : '#a78bfa'; g.beginPath(); g.ellipse(i.x, i.y, 19, 7, 0, 0, 7); g.fill();
      g.fillStyle = 'rgba(186,230,253,.85)'; g.beginPath(); g.ellipse(i.x, i.y - 4, 8, 7, 0, Math.PI, 0); g.fill();
      const w = g.measureText(i.p).width, tx = i.x - w / 2, ty = i.y + 24;
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
      erros++; const e = alvo.p[alvo.d]; errosTecla[e] = (errosTecla[e] || 0) + 1; som.erro(); return;
    }
    alvo.d++; acertos++; lasers.push({ x: alvo.x, y: alvo.y, t: 0.15 }); som.tecla();
    if (alvo.d >= alvo.p.length) {
      pontos += alvo.p.length * 10 * onda; explodir(alvo.x, alvo.y, '#67e8f9'); som.pop();
      inimigos = inimigos.filter(i => i !== alvo); alvo = null; hud();
    }
  });
  raf = requestAnimationFrame(loop);
  function fim() {
    acabou = true; cancelAnimationFrame(raf); parar(); removeEventListener('resize', dimensionar);
    ctx.onFim({ pontos, acertos, erros, errosTecla, seg: (performance.now() - t0) / 1000, detalhe: `Chegou à onda ${onda}` });
  }
  return { destruir() { acabou = true; cancelAnimationFrame(raf); parar(); removeEventListener('resize', dimensionar); } };
}

/* ============================== Corrida Turbo ============================== */
const carro = cor => `<svg viewBox="0 0 64 32" width="64" height="32" aria-hidden="true"><path d="M6 20 L12 10 Q14 7 18 7 L38 7 Q42 7 45 10 L52 16 L58 17 Q62 18 62 22 L62 25 L2 25 L2 22 Q2 20 6 20Z" fill="${cor}"/><path d="M16 10 L22 10 L22 16 L12 16Z M25 10 L37 10 Q40 10 42 13 L44 16 L25 16Z" fill="#cfefff"/><circle cx="16" cy="25" r="6" fill="#1f2937"/><circle cx="16" cy="25" r="2.5" fill="#d1d5db"/><circle cx="48" cy="25" r="6" fill="#1f2937"/><circle cx="48" cy="25" r="2.5" fill="#d1d5db"/></svg>`;

function corrida(el, ctx) {
  let motor = null, raf, timer, acabou = false;
  el.innerHTML = `<div class="escolha"><h3>Escolha a dificuldade dos rivais</h3><div class="dif">
    <button class="bt sec" data-d="0">🐢 Fácil<small>rivais a 12, 18 e 24 PPM</small></button>
    <button class="bt sec" data-d="1">🐇 Médio<small>rivais a 20, 28 e 36 PPM</small></button>
    <button class="bt sec" data-d="2">🐆 Difícil<small>rivais a 30, 42 e 55 PPM</small></button></div></div>`;
  el.querySelectorAll('[data-d]').forEach(b => (b.onclick = () => iniciar(+b.dataset.d)));

  function iniciar(dif) {
    const ppms = [[12, 18, 24], [20, 28, 36], [30, 42, 55]][dif];
    const texto = embaralhar(ctx.frases).slice(0, 2).join(' ');
    const total = [...texto].length;
    const corredores = [{ nome: 'Você', cor: '#8b5cf6', voce: true }, ...ppms.map((p, i) => ({ nome: `Robô ${p} PPM`, cor: ['#f97316', '#06b6d4', '#ef4444'][i], ppm: p }))];
    el.innerHTML = `<div class="pista">${corredores.map((c, k) => `<div class="faixa${c.voce ? ' voce' : ''}"><span class="nome">${c.nome}</span><div class="carro" id="car${k}">${carro(c.cor)}</div><div class="chegada"></div></div>`).join('')}</div>
      <div class="contagem" id="cont">3</div>
      <div class="hud"><span>⚡ <b data-h="ppm">0</b> PPM</span><span>🎯 <b data-h="prec">100</b>%</span></div>
      <div class="texto corrida-texto" id="txt"></div>`;
    const txt = el.querySelector('#txt'), cont = el.querySelector('#cont');
    txt.textContent = texto;
    const pos = k => el.querySelector('#car' + k);
    const mover = (k, p) => { pos(k).style.left = `calc(${Math.min(1, p) * 100}% - ${Math.min(1, p) * 64}px)`; };
    let n = 3, tIni = 0, chegadas = [];
    timer = setInterval(() => {
      n--;
      if (n > 0) { cont.textContent = n; som.tecla(); return; }
      clearInterval(timer); cont.textContent = 'VAI!'; som.pop(); setTimeout(() => cont.classList.add('some'), 600);
      tIni = performance.now();
      motor = new Motor({
        alvo: txt, texto,
        onProgresso: s => { mover(0, s.progresso); hudSet(el, 'ppm', s.ppm); hudSet(el, 'prec', s.precisao); },
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
      const pontos = Math.round((base + s.ppm * 5) * (s.precisao / 100));
      const medalha = ['🥇 1º lugar!', '🥈 2º lugar', '🥉 3º lugar', '4º lugar'][lugar - 1];
      cont.classList.remove('some'); cont.textContent = medalha;
      if (lugar === 1) som.sucesso();
      setTimeout(() => ctx.onFim({ ...s, pontos, detalhe: `${medalha} · ${s.ppm} PPM · ${s.precisao}% de precisão`, extra: lugar === 1 && dif === 2 ? { venceuDificil: true } : {} }), 1400);
    }
  }
  return { destruir() { acabou = true; clearInterval(timer); cancelAnimationFrame(raf); motor?.destruir(); } };
}

/* ============================== Caça-Toupeiras ============================== */
function toupeira(el, ctx) {
  const DUR = 45;
  el.innerHTML = `<div class="hud"><span>⭐ <b data-h="pontos">0</b></span><span>⏱️ <b data-h="tempo">${DUR}</b>s</span><span>🎯 <b data-h="acertos">0</b> acertos</span>
    <label class="chk"><input type="checkbox" id="ninja"> 🥷 Modo ninja</label></div>
    <div class="palco toupeira-palco"><div id="kb"></div></div>`;
  const kb = criarTeclado(el.querySelector('#kb')); kb.el.classList.add('kb-toupeira');
  el.querySelector('#ninja').onchange = e => kb.el.classList.toggle('sem-rotulos', e.target.checked);
  const letras = [...ctx.letras].filter(c => codeDe(c));
  let atual = null, tecla = null, dourada = false, tAp = 0, janela = 1700, pontos = 0, acertos = 0, erros = 0, errosTecla = {}, prox, acabou = false;
  const t0 = performance.now();
  const hud = () => { hudSet(el, 'pontos', pontos); hudSet(el, 'acertos', acertos); };
  function esconder() { tecla?.classList.remove('mole', 'dourada'); tecla = null; atual = null; }
  function aparecer() {
    if (acabou) return;
    atual = rnd(letras.length > 1 ? letras.filter(c => c !== atual) : letras);
    tecla = kb.el.querySelector(`[data-code="${codeDe(atual)}"]`);
    dourada = Math.random() < 0.12;
    tecla.classList.add('mole'); if (dourada) tecla.classList.add('dourada');
    tAp = performance.now();
    prox = setTimeout(() => { const t = tecla; esconder(); t?.classList.add('fugiu'); setTimeout(() => t?.classList.remove('fugiu'), 400); setTimeout(aparecer, 300); }, janela);
  }
  function flutuar(t, txt) {
    const r = t.getBoundingClientRect(), pr = el.querySelector('.palco').getBoundingClientRect();
    const f = document.createElement('div'); f.className = 'flutua'; f.textContent = txt;
    f.style.left = r.left - pr.left + r.width / 2 + 'px'; f.style.top = r.top - pr.top + 'px';
    el.querySelector('.palco').append(f); setTimeout(() => f.remove(), 800);
  }
  const parar = ouvirTeclas((k, e) => {
    if (acabou || !atual) return;
    if (k === atual) {
      clearTimeout(prox);
      const pts = Math.round(20 + 80 * Math.max(0, 1 - (performance.now() - tAp) / janela)) * (dourada ? 2 : 1);
      pontos += pts; acertos++; janela = Math.max(650, janela - 30);
      const t = tecla; t.classList.add('pegou'); flutuar(t, '+' + pts); setTimeout(() => t.classList.remove('pegou'), 300);
      esconder(); som.pop(); hud(); setTimeout(aparecer, 220);
    } else {
      erros++; errosTecla[atual] = (errosTecla[atual] || 0) + 1; kb.flash(e.code, false); som.erro();
    }
  });
  const relogio = setInterval(() => {
    const resta = Math.max(0, DUR - (performance.now() - t0) / 1000);
    hudSet(el, 'tempo', Math.ceil(resta));
    if (resta <= 0) fim();
  }, 200);
  aparecer();
  function fim() {
    if (acabou) return;
    acabou = true; clearInterval(relogio); clearTimeout(prox); parar(); esconder();
    ctx.onFim({ pontos, acertos, erros, errosTecla, seg: DUR, detalhe: `${acertos} toupeiras acertadas` });
  }
  return { destruir() { acabou = true; clearInterval(relogio); clearTimeout(prox); parar(); } };
}

/* ============================ Desafio 60 segundos ============================ */
function teste(el, ctx) {
  const DUR = 60;
  const texto = embaralhar(ctx.frases).join(' ');
  el.innerHTML = `<div class="hud"><span>⏱️ <b data-h="tempo">${DUR}</b>s</span><span>⚡ <b data-h="ppm">0</b> PPM</span><span>🎯 <b data-h="prec">100</b>%</span></div>
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

const FUNCOES = { chuva, galaxia, corrida, toupeira, teste };
export const iniciarJogo = (id, el, ctx) => FUNCOES[id](el, ctx);
