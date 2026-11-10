// Avatar de blocos do aluno: catálogo de itens, regras de liberação e desenho (SVG e canvas).
// O boneco é feito só de retângulos e polígonos numa grade de 16 x 32 unidades
// (cabeça 8x8, tronco 8x10, braços 3x10, pernas 4x9). Assim o mesmo desenho serve
// para a tela do avatar (SVG), o ranking e os jogos (canvas).

export const CATEGORIAS = [
  { id: 'pele', nome: 'Pele', icone: 'hand' },
  { id: 'rosto', nome: 'Rosto', icone: 'user-round' },
  { id: 'chapeu', nome: 'Cabeça', icone: 'crown' },
  { id: 'camisa', nome: 'Camisa', icone: 'shirt' },
  { id: 'calca', nome: 'Calça', icone: 'footprints' },
  { id: 'costas', nome: 'Costas', icone: 'wand-sparkles' }
];

// preco = moedas na loja; req = liberado por nível ou conquista; sem nada = grátis.
export const ITENS = [
  // Pele
  { id: 'pele1', cat: 'pele', nome: 'Clara', cor: '#f6d5bd' },
  { id: 'pele2', cat: 'pele', nome: 'Média', cor: '#e2a982' },
  { id: 'pele3', cat: 'pele', nome: 'Morena', cor: '#b97a50' },
  { id: 'pele4', cat: 'pele', nome: 'Escura', cor: '#8a5233' },
  { id: 'pele5', cat: 'pele', nome: 'Bem escura', cor: '#5e3622' },
  { id: 'pele6', cat: 'pele', nome: 'Amarela clássica', cor: '#f5c842' },
  { id: 'pele7', cat: 'pele', nome: 'Verde alienígena', cor: '#7ed957', preco: 80 },
  { id: 'pele8', cat: 'pele', nome: 'Azul gelo', cor: '#8fd3fe', preco: 80 },
  { id: 'pele9', cat: 'pele', nome: 'Robô metálico', cor: '#b8c2cc', req: { nivel: 4 } },

  // Rosto
  { id: 'sorriso', cat: 'rosto', nome: 'Sorriso' },
  { id: 'feliz', cat: 'rosto', nome: 'Muito feliz' },
  { id: 'serio', cat: 'rosto', nome: 'Concentrado' },
  { id: 'surpreso', cat: 'rosto', nome: 'Surpreso', preco: 30 },
  { id: 'oculos', cat: 'rosto', nome: 'Óculos escuros', preco: 90 },
  { id: 'mascara', cat: 'rosto', nome: 'Máscara ninja', req: { conquista: 'base' } },
  { id: 'robo', cat: 'rosto', nome: 'Visor robô', preco: 160 },

  // Cabeça
  { id: 'nenhum', cat: 'chapeu', nome: 'Nada' },
  { id: 'cabelo', cat: 'chapeu', nome: 'Cabelo curto', cor: '#3b2416' },
  { id: 'cabelo2', cat: 'chapeu', nome: 'Cabelo loiro', cor: '#e8c15a' },
  { id: 'bone', cat: 'chapeu', nome: 'Boné roxo', cor: '#7c3aed', preco: 40 },
  { id: 'bone2', cat: 'chapeu', nome: 'Boné verde', cor: '#16a34a', preco: 40 },
  { id: 'bandana', cat: 'chapeu', nome: 'Faixa ninja', cor: '#e11d48', req: { conquista: 'primeira' } },
  { id: 'fones', cat: 'chapeu', nome: 'Fones gamer', preco: 120 },
  { id: 'palha', cat: 'chapeu', nome: 'Chapéu de palha', preco: 100 },
  { id: 'cartola', cat: 'chapeu', nome: 'Cartola', preco: 220 },
  { id: 'astronauta', cat: 'chapeu', nome: 'Capacete espacial', req: { conquista: 'ppm35' } },
  { id: 'coroa', cat: 'chapeu', nome: 'Coroa', req: { conquista: 'grao' } },

  // Camisa
  { id: 'camisa-roxa', cat: 'camisa', nome: 'Roxa', cor: '#7c3aed' },
  { id: 'camisa-azul', cat: 'camisa', nome: 'Azul', cor: '#2563eb' },
  { id: 'camisa-verde', cat: 'camisa', nome: 'Verde', cor: '#16a34a' },
  { id: 'camisa-vermelha', cat: 'camisa', nome: 'Vermelha', cor: '#dc2626' },
  { id: 'camisa-branca', cat: 'camisa', nome: 'Branca', cor: '#f1f5f9' },
  { id: 'listrada', cat: 'camisa', nome: 'Listrada', cor: '#0ea5e9', cor2: '#f8fafc', padrao: 'listras', preco: 60 },
  { id: 'cerrado', cat: 'camisa', nome: 'Cerrado', cor: '#15803d', cor2: '#facc15', padrao: 'faixa', preco: 90 },
  { id: 'estrela', cat: 'camisa', nome: 'Estrela', cor: '#1e1b4b', cor2: '#facc15', padrao: 'estrela', preco: 130 },
  { id: 'ninja', cat: 'camisa', nome: 'Roupa ninja', cor: '#1f2937', cor2: '#e11d48', padrao: 'faixa', req: { nivel: 3 } },
  { id: 'teclado', cat: 'camisa', nome: 'Camisa teclado', cor: '#f8fafc', cor2: '#7c3aed', padrao: 'teclas', preco: 200 },
  { id: 'dourada', cat: 'camisa', nome: 'Armadura dourada', cor: '#eab308', cor2: '#a16207', padrao: 'armadura', req: { nivel: 7 } },

  // Calça
  { id: 'calca-azul', cat: 'calca', nome: 'Jeans', cor: '#1e40af' },
  { id: 'calca-preta', cat: 'calca', nome: 'Preta', cor: '#1f2937' },
  { id: 'calca-cinza', cat: 'calca', nome: 'Cinza', cor: '#64748b' },
  { id: 'calca-bege', cat: 'calca', nome: 'Bege', cor: '#c8a97e' },
  { id: 'calca-roxa', cat: 'calca', nome: 'Roxa', cor: '#6d28d9', preco: 40 },
  { id: 'calca-camuflada', cat: 'calca', nome: 'Camuflada', cor: '#4d5d2a', cor2: '#7a8b45', padrao: 'manchas', preco: 90 },
  { id: 'calca-dourada', cat: 'calca', nome: 'Dourada', cor: '#ca8a04', req: { conquista: 'dias7' } },

  // Costas
  { id: 'nada', cat: 'costas', nome: 'Nada' },
  { id: 'mochila', cat: 'costas', nome: 'Mochila', cor: '#f97316', preco: 50 },
  { id: 'capa', cat: 'costas', nome: 'Capa de herói', cor: '#dc2626', preco: 150 },
  { id: 'capa2', cat: 'costas', nome: 'Capa roxa', cor: '#7c3aed', req: { conquista: 'gamer' } },
  { id: 'asas', cat: 'costas', nome: 'Asas', cor: '#f8fafc', req: { conquista: 'dias3' } },
  { id: 'jato', cat: 'costas', nome: 'Mochila a jato', preco: 300 },
  { id: 'espadas', cat: 'costas', nome: 'Espadas ninja', req: { conquista: 'parkour' } }
];

const POR_ID = Object.fromEntries(ITENS.map(i => [i.id, i]));
export const PADRAO = { pele: 'pele2', rosto: 'sorriso', chapeu: 'nenhum', camisa: 'camisa-roxa', calca: 'calca-azul', costas: 'nada' };

/** Avatar completo e válido (itens desconhecidos voltam para o padrão). */
export function avatarDe(av = {}) {
  const r = {};
  for (const c of CATEGORIAS) { const it = POR_ID[av?.[c.id]]; r[c.id] = it && it.cat === c.id ? it.id : PADRAO[c.id]; }
  return r;
}

/** Situação de um item para o aluno: 'livre' (pode usar), 'comprar' ou 'bloqueado'. */
export function situacao(a, it) {
  if (it.req) {
    const ok = it.req.nivel ? (a.nivel || 1) >= it.req.nivel : !!a.conquistas?.[it.req.conquista];
    return ok ? 'livre' : 'bloqueado';
  }
  if (it.preco && !(a.itens || []).includes(it.id)) return 'comprar';
  return 'livre';
}

/* ------------------------------- Desenho ------------------------------- */
// Formas: { r: [x, y, w, h], c } retângulo  |  { p: [[x,y], ...], c } polígono. Opcional: a (opacidade).
const R = (x, y, w, h, c, a) => ({ r: [x, y, w, h], c, a });
const P = (pts, c, a) => ({ p: pts, c, a });
const escurecer = (hex, f = 0.78) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = s => Math.round(((n >> s) & 255) * f);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
};

/** Lista de formas do boneco. t = tempo em segundos (anima chamas e pernas); passo = balanço das pernas (-1 a 1). */
export function formas(avEntrada, { t = 0, passo = 0 } = {}) {
  const av = avatarDe(avEntrada), it = k => POR_ID[av[k]];
  const pele = it('pele').cor, cam = it('camisa'), cal = it('calca'), cos = it('costas'), ch = it('chapeu');
  const f = [], olho = '#1f1b2e';
  const dl = passo * 1.2, dr = -passo * 1.2;

  // Costas (atrás do corpo)
  if (cos.id === 'capa' || cos.id === 'capa2') f.push(P([[3, 12], [13, 12], [14.5, 29], [1.5, 29]], escurecer(cos.cor, 0.85)));
  if (cos.id === 'asas') {
    f.push(P([[5, 14], [-2, 8], [-4.5, 13], [-3, 19], [3, 20]], '#e2e8f0'), P([[11, 14], [18, 8], [20.5, 13], [19, 19], [13, 20]], '#e2e8f0'));
    f.push(P([[4, 15], [-1, 11], [-2.5, 14], [2, 17]], '#ffffff'), P([[12, 15], [17, 11], [18.5, 14], [14, 17]], '#ffffff'));
  }
  if (cos.id === 'jato') {
    f.push(R(0.2, 12.5, 2.6, 8, '#94a3b8'), R(13.2, 12.5, 2.6, 8, '#94a3b8'), R(0.2, 12.5, 2.6, 1.4, '#e11d48'), R(13.2, 12.5, 2.6, 1.4, '#e11d48'));
    const fl = 3 + Math.sin(t * 30) * 1.2;
    f.push(P([[0.4, 20.5], [2.6, 20.5], [1.5, 20.5 + fl]], '#f97316'), P([[13.4, 20.5], [15.6, 20.5], [14.5, 20.5 + fl]], '#f97316'));
    f.push(P([[0.9, 20.5], [2.1, 20.5], [1.5, 20.5 + fl * 0.6]], '#fde047'), P([[13.9, 20.5], [15.1, 20.5], [14.5, 20.5 + fl * 0.6]], '#fde047'));
  }
  if (cos.id === 'espadas') {
    f.push(P([[1, 10], [2, 9], [13, 24], [12, 25]], '#cbd5e1'), P([[15, 10], [14, 9], [3, 24], [4, 25]], '#cbd5e1'));
    f.push(R(0.2, 8.6, 2.2, 2.2, '#7c2d12'), R(13.6, 8.6, 2.2, 2.2, '#7c2d12'));
  }
  if (cos.id === 'mochila') f.push(R(2.6, 13, 10.8, 8, escurecer(cos.cor)));

  // Pernas
  f.push(R(4, 22 + Math.max(0, dl), 4, 9 - Math.abs(dl), cal.cor), R(8, 22 + Math.max(0, dr), 4, 9 - Math.abs(dr), escurecer(cal.cor, 0.9)));
  if (cal.padrao === 'manchas') f.push(R(4.6, 23.5, 1.8, 1.4, cal.cor2), R(9, 25, 2, 1.5, cal.cor2), R(5.5, 27, 1.6, 1.4, cal.cor2), R(8.6, 28.2, 1.4, 1.2, cal.cor2));
  f.push(R(4, 30 - Math.max(0, -dl) * 0, 4, 1, '#111827'), R(8, 30, 4, 1, '#111827'));

  // Tronco e braços
  f.push(R(4, 12, 8, 10, cam.cor));
  const cor2 = cam.cor2;
  if (cam.padrao === 'listras') for (let y = 13; y < 22; y += 2.4) f.push(R(4, y, 8, 1.1, cor2));
  if (cam.padrao === 'faixa') f.push(R(4, 19, 8, 1.4, cor2));
  if (cam.padrao === 'estrela') f.push(P([[8, 13.6], [8.9, 15.8], [11.2, 15.9], [9.4, 17.3], [10.1, 19.6], [8, 18.2], [5.9, 19.6], [6.6, 17.3], [4.8, 15.9], [7.1, 15.8]], cor2));
  if (cam.padrao === 'teclas') for (let y = 14; y < 21; y += 2.2) for (let x = 4.6; x < 11.5; x += 2.3) f.push(R(x, y, 1.7, 1.6, cor2));
  if (cam.padrao === 'armadura') f.push(R(4, 12, 8, 1.4, cor2), R(7.4, 13.4, 1.2, 8.6, cor2), R(4, 20.6, 8, 1.4, cor2));
  if (cos.id === 'mochila') f.push(R(5, 12, 1.2, 8, escurecer(cos.cor)), R(9.8, 12, 1.2, 8, escurecer(cos.cor)));
  if (cos.id === 'capa' || cos.id === 'capa2') f.push(R(4, 12, 1.4, 1.4, '#facc15'), R(10.6, 12, 1.4, 1.4, '#facc15'));
  const braco = escurecer(cam.cor, 0.9);
  f.push(R(1, 12 - dr * 0.4, 3, 8, braco), R(12, 12 - dl * 0.4, 3, 8, braco));
  f.push(R(1, 20 - dr * 0.4, 3, 2, pele), R(12, 20 - dl * 0.4, 3, 2, pele));

  // Cabeça
  f.push(R(4, 4, 8, 8, pele), R(4, 11.2, 8, 0.8, escurecer(pele, 0.88)));
  rosto(f, av.rosto, olho);
  chapeu(f, ch);
  return f;
}

function rosto(f, id, olho) {
  if (id === 'sorriso') f.push(R(6, 6.8, 1, 1.5, olho), R(9, 6.8, 1, 1.5, olho), R(5.8, 9.4, 0.7, 0.7, olho), R(6.4, 10, 3.2, 0.7, olho), R(9.5, 9.4, 0.7, 0.7, olho));
  if (id === 'feliz') f.push(P([[5.6, 8], [6.5, 6.8], [7.4, 8], [6.9, 8], [6.5, 7.5], [6.1, 8]], olho), P([[8.6, 8], [9.5, 6.8], [10.4, 8], [9.9, 8], [9.5, 7.5], [9.1, 8]], olho), P([[5.8, 9.2], [10.2, 9.2], [9.4, 10.8], [6.6, 10.8]], '#7f1d1d'), R(7, 10.1, 2, 0.7, '#f87171'));
  if (id === 'serio') f.push(P([[5.6, 6.2], [7.6, 6.8], [7.6, 7.2], [5.6, 6.7]], olho), P([[10.4, 6.2], [8.4, 6.8], [8.4, 7.2], [10.4, 6.7]], olho), R(6, 7.6, 1.2, 1.1, olho), R(8.8, 7.6, 1.2, 1.1, olho), R(6.6, 10, 2.8, 0.6, olho));
  if (id === 'surpreso') f.push(R(5.8, 6.5, 1.4, 1.8, olho), R(8.8, 6.5, 1.4, 1.8, olho), R(7.2, 9.4, 1.6, 1.8, olho));
  if (id === 'oculos') f.push(R(5, 6.6, 6, 0.6, '#111'), R(5.2, 6.9, 2.4, 1.6, '#111'), R(8.4, 6.9, 2.4, 1.6, '#111'), R(5.6, 7.1, 0.7, 0.4, '#64748b'), R(8.8, 7.1, 0.7, 0.4, '#64748b'), R(6.4, 10, 3.2, 0.7, olho), R(9.5, 9.4, 0.7, 0.7, olho));
  if (id === 'mascara') f.push(R(4, 8.6, 8, 3.4, '#1f2937'), R(4, 5, 8, 1.4, '#1f2937'), R(5.8, 7, 1.4, 1, '#fff'), R(8.8, 7, 1.4, 1, '#fff'), R(6.2, 7.2, 0.7, 0.7, olho), R(9.2, 7.2, 0.7, 0.7, olho));
  if (id === 'robo') f.push(R(4.6, 6.2, 6.8, 2.6, '#0f172a'), R(5.2, 6.9, 5.6, 1.2, '#22d3ee'), R(6.2, 9.8, 3.6, 1, '#475569'), R(6.6, 10, 0.6, 0.6, '#22d3ee'), R(7.7, 10, 0.6, 0.6, '#22d3ee'), R(8.8, 10, 0.6, 0.6, '#22d3ee'));
}

function chapeu(f, ch) {
  const c = ch.cor;
  if (ch.id === 'cabelo' || ch.id === 'cabelo2') f.push(R(3.6, 3.2, 8.8, 2.2, c), R(3.6, 5.4, 1.2, 2.6, c), R(11.2, 5.4, 1.2, 2.6, c), R(7, 5.4, 3, 0.8, c));
  if (ch.id === 'bone' || ch.id === 'bone2') f.push(R(3.6, 2.4, 8.8, 3, c), R(3, 5, 10, 1, escurecer(c, 0.7)), R(7.4, 2.4, 1.2, 0.8, '#fff'));
  if (ch.id === 'bandana') f.push(R(4, 5, 8, 1.4, c), P([[12, 5], [15.5, 3.6], [15.2, 5.2], [12, 6.4]], c), P([[12, 5.6], [15, 7.4], [14.2, 8], [12, 6.4]], escurecer(c)));
  if (ch.id === 'fones') f.push(R(3.4, 2.6, 9.2, 1, '#111827'), R(3.4, 2.6, 1, 4, '#111827'), R(11.6, 2.6, 1, 4, '#111827'), R(2.4, 6.2, 2, 3.4, '#7c3aed'), R(11.6, 6.2, 2, 3.4, '#7c3aed'), R(2.7, 6.6, 0.6, 2.6, '#22d3ee'), R(12.7, 6.6, 0.6, 2.6, '#22d3ee'));
  if (ch.id === 'palha') f.push(R(4.6, 1.2, 6.8, 3, '#e9c46a'), R(4.6, 3.2, 6.8, 0.9, '#c0392b'), R(0.6, 4, 14.8, 1.1, '#d4a845'), R(5.2, 1.6, 1, 1.6, '#f4dc9a'));
  if (ch.id === 'cartola') f.push(R(5, -1, 6, 5, '#111827'), R(5, 2.4, 6, 0.9, '#e11d48'), R(3.4, 4, 9.2, 0.9, '#111827'));
  if (ch.id === 'coroa') f.push(P([[4.4, 4.2], [4.4, 1], [6, 2.6], [8, 0.4], [10, 2.6], [11.6, 1], [11.6, 4.2]], '#facc15'), R(4.4, 3.4, 7.2, 0.8, '#eab308'), R(7.5, 2.4, 1, 1, '#e11d48'), R(5.2, 2.8, 0.8, 0.8, '#3b82f6'), R(10, 2.8, 0.8, 0.8, '#22c55e'));
  if (ch.id === 'astronauta') f.push(R(2.8, 2.6, 10.4, 10.2, '#bae6fd', 0.35), R(2.8, 2.6, 10.4, 0.8, '#e2e8f0'), R(2.8, 2.6, 0.8, 10.2, '#e2e8f0'), R(12.4, 2.6, 0.8, 10.2, '#e2e8f0'), R(2.8, 12, 10.4, 1, '#cbd5e1'), R(4, 3.8, 1.2, 2.4, '#fff', 0.7));
}

/** SVG do avatar. so = 'cabeca' mostra só a cabeça (para listas e ranking). */
export function avatarSvg(av, { tam = 96, so = 'corpo', cls = '' } = {}) {
  const vb = so === 'cabeca' ? '1.5 0.5 13 13' : '-5 -1.5 26 34';
  const fs = formas(av).map(s => s.r
    ? `<rect x="${s.r[0]}" y="${s.r[1]}" width="${s.r[2]}" height="${s.r[3]}" fill="${s.c}"${s.a != null ? ` opacity="${s.a}"` : ''}/>`
    : `<polygon points="${s.p.map(q => q.join(',')).join(' ')}" fill="${s.c}"${s.a != null ? ` opacity="${s.a}"` : ''}/>`).join('');
  const alt = so === 'cabeca' ? tam : Math.round(tam * 34 / 26);
  return `<svg class="boneco${cls ? ' ' + cls : ''}" viewBox="${vb}" width="${tam}" height="${alt}" shape-rendering="crispEdges" aria-hidden="true">${fs}</svg>`;
}

/** Desenha o avatar num canvas. (x, y) = ponto entre os pés; esc = pixels por unidade. */
export function desenharAvatar(g, av, x, y, esc, opc = {}) {
  g.save();
  g.translate(x - 8 * esc, y - 31 * esc);
  if (opc.virar) { g.translate(16 * esc, 0); g.scale(-1, 1); }
  for (const s of formas(av, opc)) {
    g.globalAlpha = s.a ?? 1; g.fillStyle = s.c;
    if (s.r) g.fillRect(s.r[0] * esc, s.r[1] * esc, s.r[2] * esc, s.r[3] * esc);
    else { g.beginPath(); s.p.forEach(([px, py], i) => (i ? g.lineTo(px * esc, py * esc) : g.moveTo(px * esc, py * esc))); g.closePath(); g.fill(); }
  }
  g.restore();
}
