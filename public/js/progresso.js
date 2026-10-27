// Regras de progresso: XP, níveis, estrelas, conquistas e estatísticas do aluno.
import { LICOES } from './licoes.js';
import { hoje } from './ui.js';

export const IDS_JOGOS = ['chuva', 'galaxia', 'corrida', 'toupeira', 'teste'];

export const NIVEIS = [
  [0, 'Novato'], [120, 'Aprendiz'], [350, 'Digitador'], [700, 'Teclista Veloz'],
  [1100, 'Ninja das Teclas'], [1700, 'Mestre Ninja'], [2500, 'Lenda do Teclado']
];

export function nivelDe(xp = 0) {
  let i = 0;
  while (i + 1 < NIVEIS.length && xp >= NIVEIS[i + 1][0]) i++;
  const ini = NIVEIS[i][0], prox = NIVEIS[i + 1]?.[0];
  return { n: i + 1, nome: NIVEIS[i][1], xp, ini, prox, pct: prox ? (xp - ini) / (prox - ini) : 1 };
}

export function novoAluno(u) {
  return {
    uid: u.uid, nome: u.nome, email: u.email, foto: u.foto || '', turma: '', turmaNome: '',
    criadoEm: Date.now(), ultimoAcesso: Date.now(), xp: 0, melhorPpm: 0,
    licoes: {}, jogos: {}, conquistas: {}, dias: [],
    stats: { tempo: 0, acertos: 0, erros: 0, errosTecla: {} }
  };
}

/** Garante que documentos antigos/incompletos tenham todos os campos. */
export function normalizar(a) {
  const base = novoAluno(a);
  return { ...base, ...a, stats: { ...base.stats, ...(a.stats || {}) }, licoes: a.licoes || {}, jogos: a.jogos || {}, conquistas: a.conquistas || {}, dias: a.dias || [] };
}

// Chaves seguras para o Firestore (caracteres como "." não podem ser nomes de campo).
export const codTecla = ch => 'u' + ch.codePointAt(0);
export const decTecla = k => String.fromCodePoint(+k.slice(1));

export const meta3 = lic => Math.round(lic.meta * 1.3);

export function calcEstrelas(lic, ppm, prec) {
  if (prec < 85) return 0;
  let e = 1;
  if (prec >= 92 && ppm >= lic.meta) e = 2;
  if (prec >= 96 && ppm >= meta3(lic)) e = 3;
  return e;
}

export function licaoLiberada(a, idx) {
  return idx === 0 || !!a.licoes[LICOES[idx - 1]?.id]?.concluida;
}

export function sequencia(dias = []) {
  const set = new Set(dias);
  const d = new Date();
  if (!set.has(hoje(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(hoje(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

export const precisaoGeral = a => {
  const t = (a.stats?.acertos || 0) + (a.stats?.erros || 0);
  return t ? Math.round((a.stats.acertos * 1000) / t) / 10 : 0;
};
export const licoesFeitas = a => LICOES.filter(l => a.licoes?.[l.id]?.concluida).length;
export const totalEstrelas = a => Object.values(a.licoes || {}).reduce((s, l) => s + (l.estrelas || 0), 0);

/** Letras liberadas para os jogos (fileira base no mínimo). */
export function teclasAprendidas(a) {
  let s = 'asdfjklç';
  for (const l of LICOES) if (l.tipo === 'teclas' && a.licoes[l.id]?.concluida) s += l.novas;
  return [...new Set(s)].filter(c => /[a-zç]/.test(c)).join('');
}

const moduloOk = (a, m) => LICOES.filter(l => l.modulo === m).every(l => a.licoes[l.id]?.concluida);

export const CONQUISTAS = [
  { id: 'postura', icone: '🧘', nome: 'Postura de campeão', desc: 'Conclua a aula de postura e posição das mãos.', ok: a => a.licoes.l00?.concluida },
  { id: 'primeira', icone: '👣', nome: 'Primeiro passo', desc: 'Conclua sua primeira lição de teclas.', ok: a => !!a.licoes.l01?.concluida },
  { id: 'base', icone: '🏠', nome: 'Base sólida', desc: 'Conclua o módulo Fileira base.', ok: a => moduloOk(a, 'm1') },
  { id: 'superior', icone: '⛰️', nome: 'Nas alturas', desc: 'Conclua o módulo Fileira superior.', ok: a => moduloOk(a, 'm2') },
  { id: 'inferior', icone: '🔤', nome: 'Alfabeto completo', desc: 'Conclua o módulo Fileira inferior.', ok: a => moduloOk(a, 'm3') },
  { id: 'shift', icone: '🔠', nome: 'Shift master', desc: 'Conclua o módulo Maiúsculas e pontuação.', ok: a => moduloOk(a, 'm4') },
  { id: 'acentos', icone: '✨', nome: 'Mestre dos acentos', desc: 'Conclua o módulo Acentuação ABNT2.', ok: a => moduloOk(a, 'm5') },
  { id: 'numeros', icone: '🔢', nome: 'Calculadora humana', desc: 'Conclua o módulo Números e símbolos.', ok: a => moduloOk(a, 'm6') },
  { id: 'formado', icone: '🎓', nome: 'Formado!', desc: 'Conclua todas as lições do curso.', ok: a => licoesFeitas(a) === LICOES.length },
  { id: 'estrelas10', icone: '🌟', nome: 'Colecionador de estrelas', desc: 'Consiga 3 estrelas em 10 lições.', ok: a => Object.values(a.licoes).filter(l => l.estrelas === 3).length >= 10 },
  { id: 'perfeito', icone: '🎯', nome: 'Mira perfeita', desc: 'Termine uma lição com 100% de precisão.', ok: a => Object.entries(a.licoes).some(([id, l]) => id !== 'l00' && l.precisao >= 100) },
  { id: 'ppm20', icone: '🐇', nome: 'Dedos ligeiros', desc: 'Alcance 20 palavras por minuto.', ok: a => a.melhorPpm >= 20 },
  { id: 'ppm35', icone: '⚡', nome: 'Turbo', desc: 'Alcance 35 palavras por minuto.', ok: a => a.melhorPpm >= 35 },
  { id: 'ppm50', icone: '🚀', nome: 'Supersônico', desc: 'Alcance 50 palavras por minuto.', ok: a => a.melhorPpm >= 50 },
  { id: 'gamer', icone: '🎮', nome: 'Gamer', desc: 'Jogue todos os jogos pelo menos uma vez.', ok: a => IDS_JOGOS.every(id => a.jogos[id]?.partidas) },
  { id: 'podio', icone: '🏆', nome: 'Primeiro lugar', desc: 'Vença a Corrida Turbo no modo difícil.', ok: a => !!a.jogos.corrida?.venceuDificil },
  { id: 'dias3', icone: '🔥', nome: 'Constância', desc: 'Pratique 3 dias seguidos.', ok: a => sequencia(a.dias) >= 3 },
  { id: 'dias7', icone: '💎', nome: 'Imparável', desc: 'Pratique 7 dias seguidos.', ok: a => sequencia(a.dias) >= 7 },
  { id: 'hora', icone: '⏳', nome: 'Maratonista', desc: 'Acumule 1 hora de prática.', ok: a => (a.stats.tempo || 0) >= 3600 }
];

function aplicarStats(a, r) {
  const s = a.stats;
  s.tempo = (s.tempo || 0) + (r.seg || 0);
  s.acertos = (s.acertos || 0) + (r.acertos || 0);
  s.erros = (s.erros || 0) + (r.erros || 0);
  s.errosTecla ||= {};
  for (const [ch, n] of Object.entries(r.errosTecla || {})) {
    const k = codTecla(ch); s.errosTecla[k] = (s.errosTecla[k] || 0) + n;
  }
  const d = hoje();
  if (!a.dias.includes(d)) a.dias = [...a.dias, d].sort().slice(-120);
  a.ultimoAcesso = Date.now();
}

function finalizar(a, xp) {
  const n0 = nivelDe(a.xp).n;
  a.xp = (a.xp || 0) + xp;
  const novas = [];
  for (const c of CONQUISTAS) if (!a.conquistas[c.id] && c.ok(a)) { a.conquistas[c.id] = Date.now(); novas.push(c); }
  a.xp += novas.length * 25;
  return { xp: xp + novas.length * 25, conquistas: novas, subiu: nivelDe(a.xp).n > n0 };
}

export function registrarLicao(a, lic, r) {
  const est = calcEstrelas(lic, r.ppm, r.precisao);
  const ant = a.licoes[lic.id] || { estrelas: 0, ppm: 0, precisao: 0, tentativas: 0 };
  let xp = 2;
  if (est > 0 && !ant.concluida) xp += 20;
  if (est > (ant.estrelas || 0)) xp += 10 * (est - (ant.estrelas || 0));
  a.licoes[lic.id] = {
    estrelas: Math.max(est, ant.estrelas || 0), ppm: Math.max(r.ppm, ant.ppm || 0),
    precisao: Math.max(r.precisao, ant.precisao || 0), tentativas: (ant.tentativas || 0) + 1,
    concluida: !!ant.concluida || est > 0, data: Date.now()
  };
  aplicarStats(a, r);
  if (lic.tipo !== 'teoria' && r.precisao >= 90 && (r.acertos || 0) >= 60) a.melhorPpm = Math.max(a.melhorPpm || 0, r.ppm);
  return { estrelas: est, anterior: ant.estrelas || 0, ...finalizar(a, xp) };
}

export function registrarJogo(a, jogoId, r) {
  const j = a.jogos[jogoId] || { recorde: 0, partidas: 0 };
  const recorde = r.pontos > (j.recorde || 0);
  a.jogos[jogoId] = { ...j, recorde: Math.max(r.pontos, j.recorde || 0), partidas: (j.partidas || 0) + 1, data: Date.now(), ...(r.extra || {}) };
  aplicarStats(a, r);
  if (r.ppm && r.precisao >= 90 && (r.acertos || 0) >= 60) a.melhorPpm = Math.max(a.melhorPpm || 0, r.ppm);
  const xp = Math.min(40, 3 + Math.floor(r.pontos / 40));
  return { recorde, ...finalizar(a, xp) };
}

/** Dados públicos do aluno para o ranking da turma. */
export function dadosRanking(a) {
  const partes = String(a.nome || '').trim().split(/\s+/);
  const nome = partes[0] + (partes[1] ? ' ' + partes[1][0] + '.' : '');
  return { nome, foto: a.foto || '', turma: a.turma || '', xp: a.xp || 0, nivel: nivelDe(a.xp).n, melhorPpm: a.melhorPpm || 0, licoes: licoesFeitas(a) };
}
