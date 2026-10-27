// Camada de dados: Firebase (login Google + Firestore) ou modo demonstração (localStorage).
import { firebaseConfig, PROFESSORES, DOMINIO_ALUNOS } from './config.js';

export const MODO = firebaseConfig.apiKey && !/^COLE/.test(firebaseConfig.apiKey) ? 'firebase' : 'demo';
export const ehProfessor = email => PROFESSORES.some(p => p.trim().toLowerCase() === String(email || '').toLowerCase());
const limpo = o => JSON.parse(JSON.stringify(o));

export function gerarCodigo() {
  const L = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => L[Math.floor(Math.random() * L.length)]).join('');
}

/* ------------------------------ Firebase ------------------------------ */
const CDN = 'https://www.gstatic.com/firebasejs/10.12.2/';
let fbp = null;
function fb() {
  return fbp ??= (async () => {
    const [A, Au, F] = await Promise.all(['firebase-app.js', 'firebase-auth.js', 'firebase-firestore.js'].map(f => import(CDN + f)));
    const app = A.initializeApp(firebaseConfig);
    return { auth: Au.getAuth(app), db: F.getFirestore(app), Au, F };
  })();
}
const usuarioDe = u => u && { uid: u.uid, nome: u.displayName || u.email, email: u.email, foto: u.photoURL || '' };

/* --------------------------- Modo demonstração --------------------------- */
const LS = {
  ler(k, p) { try { return JSON.parse(localStorage.getItem('tn_demo_' + k)) ?? p; } catch { return p; } },
  gravar(k, v) { try { localStorage.setItem('tn_demo_' + k, JSON.stringify(v)); } catch { /* sem armazenamento */ } }
};
const ouvintes = [];
const notificar = () => ouvintes.forEach(f => f(LS.ler('auth', null)));
function turmaDemo() {
  const t = LS.ler('turmas', {});
  if (!t.DEMO) { t.DEMO = { codigo: 'DEMO', nome: 'Turma Demonstração', criadaEm: Date.now() }; LS.gravar('turmas', t); }
}
const slug = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-');

/* ------------------------------- Login ------------------------------- */
export async function observarLogin(cb) {
  if (MODO === 'demo') { turmaDemo(); ouvintes.push(cb); cb(LS.ler('auth', null)); return; }
  const { auth, Au } = await fb();
  Au.onAuthStateChanged(auth, async u => {
    if (u && DOMINIO_ALUNOS && !ehProfessor(u.email) && !u.email.toLowerCase().endsWith('@' + DOMINIO_ALUNOS.toLowerCase())) {
      await Au.signOut(auth);
      cb(null, `Use sua conta Google da escola (@${DOMINIO_ALUNOS}).`);
      return;
    }
    cb(usuarioDe(u));
  });
}

export async function entrarGoogle(restringirDominio = true) {
  const { auth, Au } = await fb();
  const p = new Au.GoogleAuthProvider();
  p.setCustomParameters({ prompt: 'select_account', ...(restringirDominio && DOMINIO_ALUNOS ? { hd: DOMINIO_ALUNOS } : {}) });
  await Au.signInWithPopup(auth, p);
}

export function entrarDemo(nome, email) {
  LS.gravar('auth', { uid: 'demo-' + slug(email || nome), nome, email: email || slug(nome) + '@demo.local', foto: '' });
  notificar();
}

export async function sair() {
  if (MODO === 'demo') { LS.gravar('auth', null); notificar(); return; }
  const { auth, Au } = await fb(); await Au.signOut(auth);
}

/* ------------------------------- Alunos ------------------------------- */
export async function lerAluno(uid) {
  if (MODO === 'demo') return LS.ler('alunos', {})[uid] || null;
  const { db, F } = await fb();
  const s = await F.getDoc(F.doc(db, 'alunos', uid));
  return s.exists() ? s.data() : null;
}

export async function salvarAluno(uid, dados) {
  if (MODO === 'demo') { const t = LS.ler('alunos', {}); t[uid] = { ...(t[uid] || {}), ...limpo(dados) }; LS.gravar('alunos', t); return; }
  const { db, F } = await fb();
  await F.setDoc(F.doc(db, 'alunos', uid), limpo(dados), { merge: true });
}

export async function listarAlunos(turma) {
  if (MODO === 'demo') return Object.values(LS.ler('alunos', {})).filter(a => !turma || a.turma === turma);
  const { db, F } = await fb();
  const col = F.collection(db, 'alunos');
  const r = await F.getDocs(turma ? F.query(col, F.where('turma', '==', turma)) : col);
  return r.docs.map(d => d.data());
}

export async function excluirAluno(uid) {
  if (MODO === 'demo') {
    for (const k of ['alunos', 'sessoes', 'ranking']) { const t = LS.ler(k, {}); delete t[uid]; LS.gravar(k, t); }
    return;
  }
  const { db, F } = await fb();
  const ss = await F.getDocs(F.collection(db, 'alunos', uid, 'sessoes'));
  await Promise.all(ss.docs.map(d => F.deleteDoc(d.ref)));
  await F.deleteDoc(F.doc(db, 'ranking', uid));
  await F.deleteDoc(F.doc(db, 'alunos', uid));
}

/* ------------------------------ Sessões ------------------------------ */
export async function registrarSessao(uid, s) {
  if (MODO === 'demo') {
    const t = LS.ler('sessoes', {}); (t[uid] ??= []).push(limpo(s));
    if (t[uid].length > 300) t[uid] = t[uid].slice(-300);
    LS.gravar('sessoes', t); return;
  }
  const { db, F } = await fb();
  await F.addDoc(F.collection(db, 'alunos', uid, 'sessoes'), limpo(s));
}

export async function lerSessoes(uid, n = 300) {
  if (MODO === 'demo') return (LS.ler('sessoes', {})[uid] || []).slice(-n);
  const { db, F } = await fb();
  const r = await F.getDocs(F.query(F.collection(db, 'alunos', uid, 'sessoes'), F.orderBy('data', 'desc'), F.limit(n)));
  return r.docs.map(d => d.data()).reverse();
}

/* ------------------------------- Turmas ------------------------------- */
export async function listarTurmas() {
  if (MODO === 'demo') return Object.values(LS.ler('turmas', {}));
  const { db, F } = await fb();
  const r = await F.getDocs(F.collection(db, 'turmas'));
  return r.docs.map(d => d.data()).sort((a, b) => a.nome.localeCompare(b.nome));
}

export async function lerTurma(codigo) {
  if (!codigo) return null;
  if (MODO === 'demo') return LS.ler('turmas', {})[codigo] || null;
  const { db, F } = await fb();
  const s = await F.getDoc(F.doc(db, 'turmas', codigo));
  return s.exists() ? s.data() : null;
}

export async function criarTurma(nome) {
  const t = { codigo: gerarCodigo(), nome, criadaEm: Date.now() };
  if (MODO === 'demo') { const ts = LS.ler('turmas', {}); ts[t.codigo] = t; LS.gravar('turmas', ts); return t; }
  const { db, F } = await fb();
  await F.setDoc(F.doc(db, 'turmas', t.codigo), t);
  return t;
}

export async function excluirTurma(codigo) {
  if (MODO === 'demo') { const ts = LS.ler('turmas', {}); delete ts[codigo]; LS.gravar('turmas', ts); return; }
  const { db, F } = await fb();
  await F.deleteDoc(F.doc(db, 'turmas', codigo));
}

/* ------------------------------- Ranking ------------------------------- */
export async function salvarRanking(uid, r) {
  if (MODO === 'demo') { const t = LS.ler('ranking', {}); t[uid] = { uid, ...limpo(r) }; LS.gravar('ranking', t); return; }
  const { db, F } = await fb();
  await F.setDoc(F.doc(db, 'ranking', uid), { uid, ...limpo(r) });
}

export async function lerRanking(turma) {
  let lista;
  if (MODO === 'demo') lista = Object.values(LS.ler('ranking', {})).filter(r => r.turma === turma);
  else {
    const { db, F } = await fb();
    const r = await F.getDocs(F.query(F.collection(db, 'ranking'), F.where('turma', '==', turma)));
    lista = r.docs.map(d => d.data());
  }
  return lista.sort((a, b) => b.xp - a.xp);
}
