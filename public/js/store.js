// Camada de dados: Firebase (login Google + Firestore) ou modo demonstração (localStorage).
import { firebaseConfig, PROFESSORES } from './config.js';

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

// Alunos entram com nome + turma + senha. Por trás, o Firebase usa um e-mail interno
// (nunca recebe mensagens) no formato primeiro.ultimo.codigo@aluno.teclaninja.example
export const DOMINIO_LOGIN = 'aluno.teclaninja.example';
const SUFIXO_SENHA = '#TeclaNinja'; // o Firebase exige senhas com 6+ caracteres
export const slug = s => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
export const chaveAluno = (primeiro, ultimo, codigo) => [slug(primeiro), slug(ultimo), slug(codigo)].join('.');
const emailDe = chave => chave + '@' + DOMINIO_LOGIN;
const erroAuth = code => Object.assign(new Error(code), { code });

function usuarioDe(u) {
  if (!u) return null;
  const email = u.email || '';
  if (email.endsWith('@' + DOMINIO_LOGIN)) return { uid: email.split('@')[0], email, nome: '', foto: '', aluno: true };
  return { uid: u.uid, nome: u.displayName || email, email, foto: u.photoURL || '', aluno: false };
}

let pendente = null;
/** Dados do cadastro que acabou de ser feito (usados para criar o perfil do aluno). */
export const perfilPendente = uid => (pendente?.uid === uid ? pendente : null);

/* --------------------------- Modo demonstração --------------------------- */
const LS = {
  ler(k, p) { try { return JSON.parse(localStorage.getItem('tn_demo_' + k)) ?? p; } catch { return p; } },
  gravar(k, v) { try { localStorage.setItem('tn_demo_' + k, JSON.stringify(v)); } catch { /* sem armazenamento */ } }
};
const ouvintes = [];
const notificar = () => ouvintes.forEach(f => f(LS.ler('auth', null)));
function turmaDemo() {
  const t = LS.ler('turmas', {});
  if (!t.DEMO) { t.DEMO = { codigo: 'DEMO', nome: '1º Ano A', escola: 'Escola Demonstração', criadaEm: Date.now() }; LS.gravar('turmas', t); }
}

/* ------------------------------- Login ------------------------------- */
export async function observarLogin(cb) {
  if (MODO === 'demo') { turmaDemo(); ouvintes.push(cb); cb(LS.ler('auth', null)); return; }
  const { auth, Au } = await fb();
  Au.onAuthStateChanged(auth, u => cb(usuarioDe(u)));
}

/** Login do professor (conta Google). */
export async function entrarGoogle() {
  const { auth, Au } = await fb();
  const p = new Au.GoogleAuthProvider();
  p.setCustomParameters({ prompt: 'select_account' });
  await Au.signInWithPopup(auth, p);
}

/** Login do professor no modo demonstração. */
export function entrarDemo(nome, email) {
  LS.gravar('auth', { uid: 'demo-' + slug(email || nome), nome, email: email || slug(nome) + '@demo.local', foto: '', aluno: false });
  notificar();
}

/** Primeiro acesso do aluno: cria a conta com nome, turma e senha. */
export async function cadastrarAluno({ primeiro, ultimo, turma, senha }) {
  const uid = chaveAluno(primeiro, ultimo, turma.codigo), email = emailDe(uid);
  pendente = { uid, email, primeiro, ultimo, nome: `${primeiro} ${ultimo}`, escola: turma.escola || '', turma: turma.codigo, turmaNome: turma.nome };
  if (MODO === 'demo') {
    const c = LS.ler('contas', {});
    if (c[uid]) throw erroAuth('auth/email-already-in-use');
    c[uid] = senha; LS.gravar('contas', c);
    LS.gravar('auth', { uid, email, aluno: true }); notificar();
    return;
  }
  const { auth, Au } = await fb();
  await Au.createUserWithEmailAndPassword(auth, email, senha + SUFIXO_SENHA);
}

/** Login do aluno com nome, turma e senha. */
export async function entrarAluno({ primeiro, ultimo, codigo, senha }) {
  const uid = chaveAluno(primeiro, ultimo, codigo), email = emailDe(uid);
  if (MODO === 'demo') {
    if (LS.ler('contas', {})[uid] !== senha) throw erroAuth('auth/invalid-credential');
    LS.gravar('auth', { uid, email, aluno: true }); notificar();
    return;
  }
  const { auth, Au } = await fb();
  await Au.signInWithEmailAndPassword(auth, email, senha + SUFIXO_SENHA);
}

/** Só no modo demonstração: apaga a senha para o aluno cadastrar uma nova. */
export function liberarNovaSenhaDemo(uid) { const c = LS.ler('contas', {}); delete c[uid]; LS.gravar('contas', c); }
export function definirSenhaDemo(uid, senha) { const c = LS.ler('contas', {}); c[uid] = senha; LS.gravar('contas', c); }

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
  // Com id (gerado no aparelho), reenviar a mesma sessão não cria uma cópia: as regras só deixam criar.
  if (s.id) await F.setDoc(F.doc(db, 'alunos', uid, 'sessoes', s.id), limpo(s));
  else await F.addDoc(F.collection(db, 'alunos', uid, 'sessoes'), limpo(s));
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
  return r.docs.map(d => d.data());
}

export async function lerTurma(codigo) {
  if (!codigo) return null;
  if (MODO === 'demo') return LS.ler('turmas', {})[codigo] || null;
  const { db, F } = await fb();
  const s = await F.getDoc(F.doc(db, 'turmas', codigo));
  return s.exists() ? s.data() : null;
}

export async function criarTurma(nome, escola = '') {
  const t = { codigo: gerarCodigo(), nome, escola, criadaEm: Date.now() };
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

/* ------------------------- Liberar / pausar o curso ------------------------- */
// Documento config/curso = { liberado, fotosLiberadas, cadastroLiberado }. Sem documento (ou sem o campo), vale "liberado".
const ouvintesCurso = [];

/** Avisa em tempo real se o curso está liberado: cb(liberado, dados). Devolve uma função para parar de ouvir. */
export async function observarCurso(cb) {
  if (MODO === 'demo') {
    const avisar = () => { const d = LS.ler('curso', {}); cb(d.liberado !== false, d); };
    const h = e => { if (e.key === 'tn_demo_curso') avisar(); };
    addEventListener('storage', h); ouvintesCurso.push(avisar);
    avisar();
    return () => { removeEventListener('storage', h); const i = ouvintesCurso.indexOf(avisar); if (i >= 0) ouvintesCurso.splice(i, 1); };
  }
  const { db, F } = await fb();
  // Se as regras ainda não foram atualizadas e a leitura falhar, o curso segue liberado.
  return F.onSnapshot(F.doc(db, 'config', 'curso'),
    s => { const d = s.exists() ? s.data() : {}; cb(d.liberado !== false, d); },
    e => { console.warn('Não foi possível ler a liberação do curso:', e.code || e); cb(true, {}); });
}

async function gravarConfig(dados) {
  dados = { ...dados, atualizadoEm: Date.now() };
  if (MODO === 'demo') { LS.gravar('curso', { ...LS.ler('curso', {}), ...dados }); ouvintesCurso.forEach(f => f()); return; }
  const { db, F } = await fb();
  await F.setDoc(F.doc(db, 'config', 'curso'), dados, { merge: true });
}

/** Professor liga ou desliga o curso para todos os alunos. */
export const definirCurso = liberado => gravarConfig({ liberado: !!liberado });

/** Professor abre ou fecha o "Primeiro acesso" (cadastro de alunos novos). */
export const definirCadastro = liberado => gravarConfig({ cadastroLiberado: !!liberado });

/** Lê as configurações uma vez (usado na tela de login, antes de entrar). */
export async function lerConfig() {
  if (MODO === 'demo') return LS.ler('curso', {});
  const { db, F } = await fb();
  const s = await F.getDoc(F.doc(db, 'config', 'curso'));
  return s.exists() ? s.data() : {};
}

/** Professor permite ou não que os alunos troquem a própria foto. */
export const definirFotos = liberadas => gravarConfig({ fotosLiberadas: !!liberadas });

/* ------------------------------- Fotos ------------------------------- */
/** Troca (ou remove, com foto = '') a foto do aluno. Usado pelo aluno e pelo professor. */
export async function salvarFoto(uid, foto) {
  if (MODO === 'demo') {
    for (const k of ['alunos', 'ranking']) { const t = LS.ler(k, {}); if (t[uid]) { t[uid].foto = foto; LS.gravar(k, t); } }
    return;
  }
  const { db, F } = await fb();
  await F.setDoc(F.doc(db, 'alunos', uid), { foto }, { merge: true });
  await F.updateDoc(F.doc(db, 'ranking', uid), { foto }).catch(e => console.warn('ranking:', e.code || e));
}

/** Professor impede (ou volta a permitir) que um aluno troque a foto. */
export async function bloquearFoto(uid, bloqueada) {
  if (MODO === 'demo') { const t = LS.ler('alunos', {}); if (t[uid]) { t[uid].fotoBloqueada = !!bloqueada; LS.gravar('alunos', t); } return; }
  const { db, F } = await fb();
  await F.setDoc(F.doc(db, 'alunos', uid), { fotoBloqueada: !!bloqueada }, { merge: true });
}

/** Avisa quando o documento do aluno muda (ex.: o professor trocou a foto). */
export async function observarAluno(uid, cb) {
  if (MODO === 'demo') {
    const h = e => { if (e.key === 'tn_demo_alunos') { const a = LS.ler('alunos', {})[uid]; if (a) cb(a); } };
    addEventListener('storage', h);
    return () => removeEventListener('storage', h);
  }
  const { db, F } = await fb();
  return F.onSnapshot(F.doc(db, 'alunos', uid), d => { if (d.exists()) cb(d.data()); }, e => console.warn('aluno:', e.code || e));
}
