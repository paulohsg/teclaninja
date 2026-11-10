// Aplicativo do aluno.
import { MODO, observarLogin, cadastrarAluno, entrarAluno, perfilPendente, sair, lerAluno, salvarAluno, registrarSessao, lerTurma, listarTurmas, salvarRanking, lerRanking, ehProfessor, observarCurso, observarAluno, salvarFoto, lerConfig } from './store.js';
import { LICOES, MODULOS, FRASES, gerarExercicios, palavrasPara } from './licoes.js';
import { criarTeclado, criarMaos, passos, codeDe } from './teclado.js';
import { Motor } from './motor.js';
import { icone } from './icones.js';
import { JOGOS, iniciarJogo } from './jogos.js';
import { nivelDe, novoAluno, normalizar, registrarLicao, registrarJogo, CONQUISTAS, sequencia, teclasAprendidas, licaoLiberada, meta3, decTecla, dadosRanking, precisaoGeral, licoesFeitas, totalEstrelas, soProgresso } from './progresso.js';
import { CATEGORIAS, ITENS, avatarDe, avatarSvg, situacao } from './avatar.js';
import { $, $$, esc, toast, som, confete, aplicarTema, alternarTema, fmtTempo, ler, gravar, avatar, primeiroNome, rnd, modal, reduzirImagem } from './ui.js';

const app = $('#app');
const S = { user: null, aluno: null, limpeza: null, liberado: true, fotosLiberadas: true, pararCurso: null, pararAluno: null };

aplicarTema();
addEventListener('hashchange', rotear);
// Resultados guardados sem internet são enviados quando a conexão volta.
addEventListener('online', () => { if (S.aluno && S.liberado) enviarPendentes(); });
observarLogin(async user => {
  if (!user) {
    S.pararCurso?.(); S.pararAluno?.(); S.pararCurso = S.pararAluno = null;
    S.user = S.aluno = null; S.liberado = true;
    return telaLogin();
  }
  // Contas Google são só para professores; alunos entram com nome, turma e senha.
  if (!user.aluno && !ehProfessor(user.email) && MODO === 'firebase') {
    await sair();
    return telaLogin('Esta conta não é de professor. Alunos entram com nome, turma e senha.');
  }
  S.user = user;
  let novo = false;
  try {
    // O professor pode pausar o curso; professores nunca ficam bloqueados.
    S.liberado = user.aluno ? await acompanharCurso() : true;
    let a = await lerAluno(user.uid);
    novo = !a;
    if (!a) a = novoAluno(perfilPendente(user.uid) || (user.aluno ? await perfilDaChave(user) : user));
    a = normalizar(a);
    // Progresso que ficou guardado neste computador por falta de internet.
    const pend = lerPend(user.uid);
    if (!novo && pend?.progresso && (pend.progresso.xp || 0) >= (a.xp || 0)) Object.assign(a, pend.progresso);
    if (!user.aluno) Object.assign(a, { nome: user.nome, email: user.email, foto: user.foto || a.foto });
    a.uid = user.uid; a.email = user.email; a.ultimoAcesso = Date.now();
    S.aluno = a;
    // Com o curso pausado, o banco só aceita criar o perfil de quem acabou de se cadastrar.
    if (novo || S.liberado) {
      await salvarAluno(user.uid, novo || !user.aluno ? a : soProgresso(a));
      if (a.turma) await salvarRanking(user.uid, dadosRanking(a)).catch(e => console.warn('ranking:', e.code || e));
    }
  } catch (e) {
    console.error(e);
    await sair().catch(() => {});
    return telaLogin(novo && e?.code === 'permission-denied'
      ? 'Não encontramos seu cadastro e o "Primeiro acesso" está fechado. Peça ao professor para liberar.'
      : 'Não foi possível carregar seus dados. Verifique a internet e tente de novo.');
  }
  if (user.aluno) {
    S.pararAluno?.();
    // Se o professor trocar ou bloquear a foto, a mudança chega na hora.
    observarAluno(user.uid, d => {
      if (!S.aluno || (d.foto || '') === S.aluno.foto && !!d.fotoBloqueada === !!S.aluno.fotoBloqueada) return;
      S.aluno.foto = d.foto || ''; S.aluno.fotoBloqueada = !!d.fotoBloqueada;
      atualizarTopo();
    }).then(f => { S.pararAluno = f; }).catch(e => console.warn(e));
  }
  montarShell(); rotear();
  if (S.liberado) enviarPendentes();
}).catch(e => {
  console.error(e);
  telaLogin('Não foi possível conectar ao servidor. Verifique a internet e recarregue a página.');
});

/** Liga o aviso em tempo real do professor. Resolve com o estado inicial (liberado ou não). */
function acompanharCurso() {
  S.pararCurso?.();
  return new Promise(resolve => {
    let primeiro = true;
    observarCurso((lib, dados = {}) => {
      S.fotosLiberadas = dados.fotosLiberadas !== false;
      if (primeiro) { primeiro = false; resolve(lib); return; }
      if (lib === S.liberado) return;
      S.liberado = lib;
      if (!S.aluno || !$('#conteudo')) return;
      toast(lib ? 'O professor liberou o curso. Bons estudos!' : 'O professor pausou o curso.', lib ? 'ok' : '', lib ? 'party-popper' : 'lock');
      rotear();
    }).then(parar => { S.pararCurso = parar; }).catch(e => { console.error(e); if (primeiro) { primeiro = false; resolve(true); } });
  });
}

/* ------------- Salvamento com fila (resultados não se perdem sem internet) ------------- */
const chavePend = uid => 'tn_pend_' + uid;
function lerPend(uid) { try { return JSON.parse(ler(chavePend(uid), '') || 'null'); } catch { return null; } }
function gravarPend(uid, p) { gravar(chavePend(uid), p ? JSON.stringify(p) : ''); }

let fila = Promise.resolve(true);
// Sem internet o Firebase não dá erro: fica esperando. Depois de 8 s consideramos "sem conexão".
const comPrazo = p => Promise.race([p, new Promise((_, falha) => setTimeout(() => falha(Object.assign(new Error('sem conexão'), { code: 'timeout' })), 8000))]);
/** Envia o que estiver guardado (progresso + sessões). Devolve true se tudo foi enviado. */
function enviarPendentes() {
  const enviar = async () => {
    const a = S.aluno, p = a && lerPend(a.uid);
    if (!p) return true;
    try {
      // O aluno nunca grava foto, nome ou turma junto com o progresso (soProgresso),
      // assim não desfaz uma troca feita pelo professor.
      await comPrazo(salvarAluno(a.uid, p.progresso));
      while (p.sessoes.length) {
        try { await comPrazo(registrarSessao(a.uid, p.sessoes[0])); }
        catch (e) { if (e?.code !== 'permission-denied') throw e; } // já tinha sido enviada antes
        p.sessoes.shift(); gravarPend(a.uid, p);
      }
      if (lerPend(a.uid)?.progresso?.xp === p.progresso.xp) gravarPend(a.uid, null);
      if (a.turma) await salvarRanking(a.uid, dadosRanking(a)).catch(e => console.warn('ranking:', e.code || e));
      return true;
    } catch (e) { console.warn('Não foi possível enviar agora:', e.code || e); S.erroEnvio = e?.code; return false; }
  };
  return (fila = fila.then(enviar, enviar));
}

/** Reconstrói o perfil a partir do login (caso o cadastro tenha sido interrompido). */
async function perfilDaChave(user) {
  const partes = user.uid.split('.'), codigo = (partes.pop() || '').toUpperCase();
  const cap = s => s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const t = await lerTurma(codigo).catch(() => null);
  const [primeiro = '', ultimo = ''] = partes.map(cap);
  return { uid: user.uid, email: user.email, primeiro, ultimo, nome: `${primeiro} ${ultimo}`.trim(), turma: codigo, turmaNome: t?.nome || '', escola: t?.escola || '' };
}

/* ================================ Login ================================ */
const NOME_OK = /^[\p{L}\p{M}0-9' .-]{1,30}$/u;
const nomeBonito = s => String(s || '').trim().replace(/\s+/g, ' ').toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());

const ERROS_LOGIN = {
  'auth/email-already-in-use': 'Já existe um cadastro com esse nome nesta turma. Use a aba "Entrar". Se esqueceu a senha, fale com o professor.',
  'auth/invalid-credential': 'Nome, turma ou senha incorretos. Se é seu primeiro acesso, use a aba "Primeiro acesso".',
  'auth/invalid-login-credentials': 'Nome, turma ou senha incorretos. Se é seu primeiro acesso, use a aba "Primeiro acesso".',
  'auth/wrong-password': 'Senha incorreta. Se esqueceu a senha, fale com o professor.',
  'auth/user-not-found': 'Não encontramos esse aluno nesta turma. Se é seu primeiro acesso, use a aba "Primeiro acesso".',
  'auth/too-many-requests': 'Muitas tentativas seguidas. Espere alguns minutos e tente de novo.',
  'auth/network-request-failed': 'Sem conexão com a internet. Verifique a rede e tente de novo.',
  'auth/operation-not-allowed': 'O login por senha ainda não foi ativado no Firebase. Professor: veja o README (Parte 3).'
};

function telaLogin(erro = '') {
  limpar();
  let modo = 'entrar', turmas = [], cadastroAberto = true;
  app.innerHTML = `<div class="login">
    <section class="login-hero">
      <div class="logo grande"><span class="logo-ic">${icone('keyboard')}</span><span>Tecla<b>Ninja</b></span></div>
      <h1>Digite rápido.<br><span class="grad">Sem olhar para o teclado.</span></h1>
      <p class="sub">Um curso de digitação completo no teclado <b>ABNT2</b>, com lições curtas, jogos e desafios. Treine, ganhe XP e suba de nível!</p>
      <ul class="feat">
        <li><span>${icone('book-open')}</span><div><b>${LICOES.length} lições</b><small>da fileira base aos textos completos</small></div></li>
        <li><span>${icone('gamepad-2')}</span><div><b>${JOGOS.length} jogos</b><small>meteoros, naves, corrida e mais</small></div></li>
        <li><span>${icone('award')}</span><div><b>Conquistas e ranking</b><small>dispute com a sua turma</small></div></li>
      </ul>
      <div class="teclas-deco" aria-hidden="true">${'ASDF JKLÇ'.split('').map((c, i) => c === ' ' ? '<i class="gap"></i>' : `<span style="--i:${i}">${c}</span>`).join('')}</div>
    </section>
    <section class="login-card">
      <div class="abas-login" role="tablist">
        <button type="button" role="tab" data-modo="entrar" class="ativo">Entrar</button>
        <button type="button" role="tab" data-modo="cadastro">Primeiro acesso</button>
      </div>
      ${MODO === 'demo' ? `<p class="aviso">${icone('info')} <b>Modo demonstração.</b> O Firebase ainda não foi configurado, então tudo fica salvo só neste navegador.</p>` : ''}
      <form id="f-login" class="form-col" data-modo="entrar" novalidate>
        <label>Escola<select id="l-escola" required disabled><option>Carregando...</option></select></label>
        <label>Turma<select id="l-turma" required disabled></select></label>
        <div class="duas">
          <label>Primeiro nome<input id="l-primeiro" required maxlength="30" autocomplete="off" placeholder="Ex.: Ana"></label>
          <label>Último sobrenome<input id="l-ultimo" required maxlength="30" autocomplete="off" placeholder="Ex.: Souza"></label>
        </div>
        <label>Senha<input id="l-senha" type="password" required minlength="4" maxlength="30" autocomplete="current-password"></label>
        <label class="so-cadastro">Repita a senha<input id="l-senha2" type="password" minlength="4" maxlength="30" autocomplete="new-password"></label>
        <p class="aviso so-cadastro" id="l-fechado" hidden>${icone('lock')} O primeiro acesso está fechado agora. Peça ao professor para liberar no painel.</p>
        <p class="mini so-cadastro">Crie uma senha fácil de lembrar, com <b>pelo menos 4 caracteres</b>, e anote em um lugar seguro. Use sempre o mesmo nome e sobrenome para entrar.</p>
        <button class="bt grande" id="l-bt">Entrar</button>
      </form>
      <p class="erro-msg" id="l-msg" role="alert">${esc(erro)}</p>
      <p class="mini">É professor(a)? <a href="professor.html">Acesse o painel do professor</a></p>
    </section>
  </div>`;
  const form = $('#f-login'), selE = $('#l-escola'), selT = $('#l-turma'), msg = $('#l-msg'), bt = $('#l-bt');
  const escolaDe = t => t.escola || 'Sem escola';

  $$('.abas-login button').forEach(b => b.onclick = () => {
    modo = b.dataset.modo; form.dataset.modo = modo; msg.textContent = '';
    $$('.abas-login button').forEach(x => x.classList.toggle('ativo', x === b));
    bt.textContent = modo === 'cadastro' ? 'Criar meu acesso' : 'Entrar';
    $('#l-senha').autocomplete = modo === 'cadastro' ? 'new-password' : 'current-password';
    mostrarFechado();
  });
  const mostrarFechado = () => { $('#l-fechado').hidden = cadastroAberto; bt.disabled = modo === 'cadastro' && !cadastroAberto; };
  lerConfig().then(cfg => { cadastroAberto = cfg.cadastroLiberado !== false; mostrarFechado(); }).catch(() => {});

  function preencherTurmas() {
    const lista = turmas.filter(t => escolaDe(t) === selE.value).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true }));
    selT.innerHTML = `<option value="">Escolha a turma</option>` + lista.map(t => `<option value="${esc(t.codigo)}">${esc(t.nome)}</option>`).join('');
    selT.disabled = !lista.length;
    const salva = ler('tn_turma', '');
    if (lista.some(t => t.codigo === salva)) selT.value = salva;
  }
  selE.onchange = () => { gravar('tn_escola', selE.value); preencherTurmas(); };
  selT.onchange = () => gravar('tn_turma', selT.value);

  listarTurmas().then(ts => {
    turmas = ts;
    const escolas = [...new Set(ts.map(escolaDe))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    if (!escolas.length) {
      selE.innerHTML = '<option>Nenhuma turma cadastrada</option>';
      msg.textContent = 'Ainda não há turmas cadastradas. O professor precisa criar a turma no painel.';
      return;
    }
    selE.innerHTML = `<option value="">Escolha a escola</option>` + escolas.map(e => `<option>${esc(e)}</option>`).join('');
    selE.disabled = false;
    const salva = ler('tn_escola', '');
    if (escolas.includes(salva)) selE.value = salva; else if (escolas.length === 1) selE.value = escolas[0];
    preencherTurmas();
  }).catch(e => {
    console.error(e);
    selE.innerHTML = '<option>Erro ao carregar</option>';
    msg.textContent = 'Não foi possível carregar as turmas. Verifique a internet e recarregue a página.';
  });

  form.onsubmit = async e => {
    e.preventDefault();
    msg.textContent = '';
    const primeiro = nomeBonito($('#l-primeiro').value), ultimo = nomeBonito($('#l-ultimo').value);
    const senha = $('#l-senha').value, turma = turmas.find(t => t.codigo === selT.value);
    const falha = !turma ? 'Escolha a escola e a turma.'
      : !/\p{L}/u.test(primeiro) || !/\p{L}/u.test(ultimo) ? 'Digite seu primeiro nome e seu último sobrenome.'
      : primeiro.includes(' ') ? 'No primeiro nome, digite só uma palavra (ex.: Ana).'
      : !NOME_OK.test(primeiro) || !NOME_OK.test(ultimo) ? 'Use só letras no nome e no sobrenome (sem símbolos).'
      : senha.length < 4 ? 'A senha precisa ter pelo menos 4 caracteres.'
      : modo === 'cadastro' && senha !== $('#l-senha2').value ? 'As duas senhas não são iguais.' : '';
    if (falha) { msg.textContent = falha; return; }
    bt.disabled = true;
    try {
      if (modo === 'cadastro') {
        // Confere de novo na hora (o professor pode ter fechado o primeiro acesso agora há pouco).
        cadastroAberto = (await lerConfig().catch(() => ({}))).cadastroLiberado !== false;
        if (!cadastroAberto) { mostrarFechado(); return; }
        await cadastrarAluno({ primeiro, ultimo, turma, senha });
      }
      else await entrarAluno({ primeiro, ultimo, codigo: turma.codigo, senha });
    } catch (err) {
      if (!ERROS_LOGIN[err?.code]) console.error(err);
      msg.textContent = ERROS_LOGIN[err?.code] || 'Não foi possível entrar: ' + (err?.message || err);
      bt.disabled = false;
    }
  };
}

/* ================================ Estrutura ================================ */
function montarShell() {
  app.innerHTML = `<header class="topo">
    <a class="logo" href="#/inicio"><span class="logo-ic">${icone('keyboard')}</span><span>Tecla<b>Ninja</b></span></a>
    <nav class="menu">
      <a href="#/inicio" data-r="inicio"><span class="mi">${icone('house')}</span><span class="mt">Início</span></a>
      <a href="#/jogos" data-r="jogos"><span class="mi">${icone('gamepad-2')}</span><span class="mt">Jogos</span></a>
      <a href="#/avatar" data-r="avatar"><span class="mi">${icone('shirt')}</span><span class="mt">Avatar</span></a>
      <a href="#/conquistas" data-r="conquistas"><span class="mi">${icone('award')}</span><span class="mt">Conquistas</span></a>
      <a href="#/ranking" data-r="ranking"><span class="mi">${icone('trophy')}</span><span class="mt">Ranking</span></a>
      <a href="#/guia" data-r="guia"><span class="mi">${icone('hand')}</span><span class="mt">Guia</span></a>
    </nav>
    <div class="topo-dir">
      <button class="ico" id="bt-som" title="Ligar/desligar sons">${icone(som.ativo ? 'volume-2' : 'volume-x')}</button>
      <button class="ico" id="bt-tema" title="Tema claro/escuro">${icone('sun-moon')}</button>
      <button class="usuario" id="usuario"></button>
    </div>
  </header>
  <main id="conteudo"></main>`;
  $('#bt-som').onclick = e => { e.currentTarget.innerHTML = icone(som.alternar() ? 'volume-2' : 'volume-x'); };
  $('#bt-tema').onclick = alternarTema;
  $('#usuario').onclick = menuUsuario;
  atualizarTopo();
}

function atualizarTopo() {
  const a = S.aluno, nv = nivelDe(a.xp), u = $('#usuario');
  if (!u) return;
  u.innerHTML = `${avatar(a.nome, a.foto)}<span class="u-info"><b>${esc(primeiroNome(a.nome))}</b><small>Nv ${nv.n} · ${a.xp} XP</small></span>`;
}

function menuUsuario(e) {
  e.stopPropagation();
  const velho = $('.menu-user'); if (velho) return velho.remove();
  const a = S.aluno, m = document.createElement('div');
  m.className = 'menu-user';
  m.innerHTML = `<div class="mu-cab">${avatar(a.nome, a.foto, 'g')}<div><b>${esc(a.nome)}</b>${a.escola ? `<small>${esc(a.escola)}</small>` : ''}${a.turmaNome ? `<small>Turma: ${esc(a.turmaNome)}</small>` : ''}${S.user?.aluno ? '' : `<small>${esc(a.email)}</small>`}</div></div>
    ${ehProfessor(a.email) ? `<a href="professor.html">${icone('school')} Painel do professor</a>` : ''}
    ${S.user?.aluno ? `<button id="mu-foto">${icone('camera')} Trocar foto</button>` : ''}
    <button id="mu-sair">${icone('log-out')} Sair</button>`;
  document.body.append(m);
  const fechar = () => { m.remove(); removeEventListener('click', fechar); };
  setTimeout(() => addEventListener('click', fechar));
  $('#mu-sair', m).onclick = () => sair();
  $('#mu-foto', m)?.addEventListener('click', () => { fechar(); trocarFoto(); });
}

/* ============================== Foto de perfil ============================== */
function trocarFoto() {
  const a = S.aluno;
  const bloqueio = a.fotoBloqueada ? 'Seu professor bloqueou a troca da sua foto.'
    : !S.fotosLiberadas ? 'A troca de fotos está desligada pelo professor no momento.'
    : !S.liberado ? 'O curso está pausado. Troque a foto durante a aula.' : '';
  const m = modal(`<div class="foto-modal">
    <h2>Sua foto de perfil</h2>
    <div class="foto-previa" id="fp">${avatar(a.nome, a.foto, 'xg')}</div>
    ${bloqueio ? `<p class="aviso">${icone('lock')} ${bloqueio}</p>` : `
      <p class="muted">Escolha uma imagem. Ela aparece para a sua turma no ranking. Use uma imagem adequada para a escola: o professor pode trocar ou remover a qualquer momento.</p>
      <div class="acoes">
        <label class="bt sec">${icone('folder-open')} Escolher imagem<input type="file" id="fp-arq" accept="image/*" hidden></label>
        <button class="bt" id="fp-salvar" disabled>Salvar foto</button>
        ${a.foto ? '<button class="bt perigo" id="fp-remover">Remover foto</button>' : ''}
      </div>
      <p class="erro-msg" id="fp-msg"></p>`}
  </div>`);
  let nova = null;
  const msg = t => { const el = $('#fp-msg', m.el); if (el) el.textContent = t; };
  $('#fp-arq', m.el)?.addEventListener('change', async e => {
    msg('');
    try {
      nova = await reduzirImagem(e.target.files[0]);
      $('#fp', m.el).innerHTML = avatar(a.nome, nova, 'xg');
      $('#fp-salvar', m.el).disabled = false;
    } catch (err) { msg(err.message); }
  });
  const gravarFoto = async (foto, bt) => {
    bt.disabled = true; msg('');
    try {
      await salvarFoto(a.uid, foto);
      a.foto = foto; atualizarTopo(); m.fechar();
      toast(foto ? 'Foto atualizada!' : 'Foto removida.', 'ok', 'camera');
      if (location.hash.startsWith('#/ranking')) rotear();
    } catch (err) {
      console.error(err); bt.disabled = false;
      msg(err?.code === 'permission-denied' ? 'Não foi possível trocar a foto agora (o professor pode ter bloqueado).' : 'Não foi possível salvar. Verifique a internet.');
    }
  };
  $('#fp-salvar', m.el)?.addEventListener('click', e => gravarFoto(nova, e.currentTarget));
  $('#fp-remover', m.el)?.addEventListener('click', e => gravarFoto('', e.currentTarget));
}

function limpar() { if (S.limpeza) { try { S.limpeza(); } catch { /* ok */ } S.limpeza = null; } }

function rotear() {
  if (!S.aluno || !$('#conteudo')) return;
  limpar();
  $('.menu-user')?.remove();
  const [rota, param] = location.hash.replace(/^#\/?/, '').split('/');
  $$('.menu a').forEach(x => x.classList.toggle('ativo', x.dataset.r === (rota || 'inicio') || (rota === 'jogo' && x.dataset.r === 'jogos')));
  const c = $('#conteudo');
  c.className = ''; c.innerHTML = ''; scrollTo(0, 0);
  if (!S.liberado) { $$('.menu a').forEach(x => x.classList.remove('ativo')); return telaPausa(c); }
  const telas = { licao: () => telaLicao(c, param), jogos: () => telaJogos(c), jogo: () => telaJogo(c, param), avatar: () => telaAvatar(c), conquistas: () => telaConquistas(c), ranking: () => telaRanking(c), guia: () => telaGuia(c) };
  (telas[rota] || (() => telaInicio(c)))();
}

function telaPausa(c) {
  const a = S.aluno, nv = nivelDe(a.xp);
  c.innerHTML = `<div class="pagina"><section class="card pausa">
    <div class="pausa-ic" aria-hidden="true">${icone('lock')}</div>
    <h1>O curso está pausado</h1>
    <p class="muted">Seu professor pausou as lições e os jogos por enquanto. Eles voltam na próxima aula, e esta tela muda sozinha quando o curso for liberado.</p>
    <div class="res-nums">
      <div><b>${licoesFeitas(a)}/${LICOES.length}</b><small>lições</small></div>
      <div><b>${nv.n}</b><small>nível · ${esc(nv.nome)}</small></div>
      <div><b>${a.xp}</b><small>XP</small></div>
      <div><b>${a.melhorPpm || 0}</b><small>melhor PPM</small></div>
    </div>
    <p class="mini">${icone('lightbulb')} Até lá: costas apoiadas, pulsos retos e olhos na tela!</p>
  </section></div>`;
}

/** Guarda o progresso (e a sessão, se houver) e tenta enviar. Sem internet, fica na fila. */
async function salvarTudo(sessao) {
  if (!S.liberado || !S.aluno) return;
  const uid = S.aluno.uid, p = lerPend(uid) || { sessoes: [] };
  if (sessao) p.sessoes.push({ ...sessao, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8) });
  p.progresso = soProgresso(S.aluno);
  gravarPend(uid, p);
  if (!(await enviarPendentes())) {
    toast(S.erroEnvio === 'permission-denied'
      ? 'O servidor não aceitou salvar agora (o curso pode ter sido pausado). Seu resultado ficou guardado neste computador.'
      : 'Sem conexão agora. Seu resultado ficou guardado neste computador e será enviado quando a internet voltar.', 'erro');
  }
}

function anunciar(out) {
  for (const c of out.conquistas || []) toast(`<b>Nova conquista!</b><br>${esc(c.nome)}`, 'conq', c.icone);
  if (out.subiu) { const nv = nivelDe(S.aluno.xp); toast(`<b>Subiu de nível!</b><br>Nível ${nv.n}: ${nv.nome}`, 'conq', 'trending-up'); confete(); }
  atualizarTopo();
}

/* ================================ Início ================================ */
const DICAS = [
  'Precisão primeiro, velocidade depois. A velocidade vem com o tempo!',
  'Sinta as saliências do F e do J: elas guiam seus dedos sem olhar.',
  'Depois de cada tecla, o dedo volta para a fileira base.',
  'O Shift é sempre da mão oposta à letra maiúscula.',
  'Mantenha os pulsos retos e os ombros relaxados.',
  '15 minutos por dia valem mais do que 2 horas uma vez por semana.',
  'Errou? Sem pânico. Respire e continue no seu ritmo.'
];

const estrelasHtml = (n, max = 3) => `<span class="estrelas">${Array.from({ length: max }, (_, i) => `<i class="${i < n ? 'on' : ''}">${icone('star')}</i>`).join('')}</span>`;

function telaInicio(c) {
  const a = S.aluno, nv = nivelDe(a.xp);
  const feitas = licoesFeitas(a), total = LICOES.length;
  const prox = LICOES.find((l, i) => !a.licoes[l.id]?.concluida && liberada(i)) || LICOES.at(-1);
  const seq = sequencia(a.dias);
  c.innerHTML = `
  <section class="hero">
    <div class="hero-txt">
      <p class="ola">Olá, ${esc(primeiroNome(a.nome))}!</p>
      <h1>${feitas === 0 ? 'Vamos começar sua jornada ninja?' : feitas === total ? 'Você concluiu o curso!' : 'Bora continuar treinando?'}</h1>
      <p class="sub">${icone('lightbulb')} ${rnd(DICAS)}</p>
      <a class="bt grande" href="#/licao/${prox.id}">${icone('play')} ${feitas ? 'Continuar' : 'Começar'}: ${esc(prox.titulo)}</a>
    </div>
    <div class="hero-nivel">
      <div class="anel" style="--p:${nv.pct}"><div><b>${nv.n}</b><small>nível</small></div></div>
      <div class="nivel-info"><b>${nv.nome}</b><div class="barra"><i style="width:${nv.pct * 100}%"></i></div>
        <small>${a.xp} XP${nv.prox ? ` · faltam ${nv.prox - a.xp} para o próximo nível` : ' · nível máximo!'}</small></div>
    </div>
  </section>
  <section class="stats">
    ${stat(icone('book-open'), `${feitas}/${total}`, 'lições concluídas')}
    ${stat(icone('star'), totalEstrelas(a), 'estrelas')}
    ${stat(icone('zap'), a.melhorPpm || 0, 'melhor PPM')}
    ${stat(icone('target'), precisaoGeral(a) ? precisaoGeral(a) + '%' : '—', 'precisão geral')}
    ${stat(icone('flame'), seq, seq === 1 ? 'dia seguido' : 'dias seguidos')}
    ${stat(icone('clock'), fmtTempo(a.stats.tempo), 'de prática')}
  </section>
  <h2 class="secao">Sua trilha</h2>
  <section class="modulos">${MODULOS.map(m => moduloHtml(m)).join('')}</section>`;
  $$('.licao.bloq', c).forEach(x => x.addEventListener('click', e => { e.preventDefault(); toast('Conclua a lição anterior para liberar esta.', '', 'lock'); }));
}

const stat = (ic, v, rot) => `<div class="stat"><span class="s-ic">${ic}</span><b>${v}</b><small>${rot}</small></div>`;

function moduloHtml(m) {
  const a = S.aluno;
  const lics = LICOES.map((l, i) => ({ l, i })).filter(x => x.l.modulo === m.id);
  const feitas = lics.filter(x => a.licoes[x.l.id]?.concluida).length;
  return `<div class="modulo${feitas === lics.length ? ' completo' : ''}">
    <div class="mod-cab"><span class="mod-ic">${icone(m.icone)}</span><div><h3>${m.nome}</h3><p>${m.desc}</p></div><span class="mod-prog">${feitas}/${lics.length}</span></div>
    <div class="licoes">${lics.map(({ l, i }) => {
      const p = a.licoes[l.id], lib = liberada(i);
      const cls = p?.concluida ? 'feita' : lib ? 'livre' : 'bloq';
      return `<a class="licao ${cls}" href="#/licao/${l.id}"><span class="lnum">${lib ? i + 1 : icone('lock')}</span><span class="ltit">${esc(l.titulo)}</span>${estrelasHtml(p?.estrelas || 0)}</a>`;
    }).join('')}</div></div>`;
}

/** Professores têm o curso todo liberado para praticar. */
const liberada = idx => !S.user?.aluno || licaoLiberada(S.aluno, idx);
const letrasJogos = () => (S.user?.aluno ? teclasAprendidas(S.aluno) : "abcdefghijklmnopqrstuvwxyzç");

/* ================================ Lição ================================ */
function telaLicao(c, id) {
  const idx = LICOES.findIndex(l => l.id === id), lic = LICOES[idx];
  if (!lic) { location.hash = '#/inicio'; return; }
  if (!liberada(idx)) { toast('Conclua as lições anteriores primeiro.', '', 'lock'); location.hash = '#/inicio'; return; }
  const mod = MODULOS.find(m => m.id === lic.modulo);
  let exercicios = gerarExercicios(lic), i = 0, motor = null, kd = null, total;
  const zerar = () => { total = { acertos: 0, erros: 0, seg: 0, errosTecla: {} }; i = 0; };
  zerar();
  const tirarKd = () => { if (kd) removeEventListener('keydown', kd); kd = null; };
  const aoEnter = fn => { tirarKd(); kd = e => { if (e.key === 'Enter') { e.preventDefault(); fn(); } }; addEventListener('keydown', kd); };
  S.limpeza = () => { motor?.destruir(); tirarKd(); };

  intro();

  function intro() {
    const novasCodes = lic.novas ? [...lic.novas].map(codeDe) : lic.destaque || [];
    c.innerHTML = `<div class="pagina">
      <div class="crumb"><a href="#/inicio">${icone('arrow-left')} Início</a> <span>·</span> ${icone(mod.icone)} ${esc(mod.nome)}</div>
      ${lic.tipo === 'teoria' ? guiaHtml() : ''}
      <section class="card licao-intro">
        <p class="tag">Lição ${idx + 1} de ${LICOES.length}</p>
        <h1>${esc(lic.titulo)}</h1>
        ${lic.novas ? `<div class="novas">${[...lic.novas].map(ch => `<span class="keycap" data-dedo="${passos(ch)[0]?.dedo}">${esc(ch.toUpperCase())}</span>`).join('')}</div>` : ''}
        <div class="dica-box">${icone('lightbulb', 'dica-ic')}<div>${lic.dica}</div></div>
        <div class="kb-wrap"><div id="kb"></div><div id="maos"></div></div>
        <div class="regras">
          <span>${icone('circle-check')} Passar: <b>85%</b> de precisão</span>
          ${lic.meta ? `<span>${estrelasHtml(2)} <b>92%</b> + <b>${lic.meta} PPM</b></span><span>${estrelasHtml(3)} <b>96%</b> + <b>${meta3(lic)} PPM</b></span>` : `<span>${estrelasHtml(3)} <b>96%</b> de precisão</span>`}
        </div>
        <div class="acoes"><button class="bt grande" id="comecar">Começar <kbd>Enter</kbd></button></div>
      </section></div>`;
    const kb = criarTeclado($('#kb', c)), maos = criarMaos($('#maos', c));
    kb.marcar(novasCodes.filter(Boolean));
    maos.destacar(novasCodes.map(cd => $(`#kb [data-code="${cd}"]`, c)?.dataset.dedo).filter(Boolean));
    montarGuiaTeclado(c);
    $('#comecar', c).onclick = exercicio;
    aoEnter(exercicio);
  }

  function exercicio() {
    tirarKd(); motor?.destruir();
    const ocultar = ler('tn_ocultar_kb', '0') === '1';
    c.innerHTML = `<div class="treino">
      <div class="treino-topo">
        <a href="#/inicio" class="bt sec pequeno">${icone('x')} Sair</a>
        <div class="tt"><small>Lição ${idx + 1}</small><b>${esc(lic.titulo)}</b></div>
        <div class="passos-ex" title="Exercícios">${exercicios.map((_, j) => `<i class="${j < i ? 'feito' : j === i ? 'atual' : ''}"></i>`).join('')}</div>
        <div class="mini-stats"><span>${icone('zap')} <b id="ppm">0</b> PPM</span><span>${icone('target')} <b id="prec">100</b>%</span></div>
      </div>
      <div class="barra fina"><i id="prog" style="width:0"></i></div>
      <div class="texto" id="texto"></div>
      <div class="dica-linha" id="dica"></div>
      <div class="kb-wrap${ocultar ? ' oculto' : ''}" id="kbw"><div id="kb"></div><div id="maos"></div></div>
      <div class="treino-rodape">
        <label class="chk"><input type="checkbox" id="ocultar"${ocultar ? ' checked' : ''}> ${icone('eye-off')} Modo ninja: esconder teclado</label>
        <button class="bt sec pequeno" id="reiniciar">${icone('rotate-ccw')} Reiniciar exercício</button>
      </div></div>`;
    scrollTo({ top: 0 });
    $('#ocultar', c).onchange = e => { gravar('tn_ocultar_kb', e.target.checked ? '1' : '0'); $('#kbw', c).classList.toggle('oculto', e.target.checked); e.target.blur(); };
    $('#reiniciar', c).onclick = e => { e.currentTarget.blur(); exercicio(); };
    motor = new Motor({
      alvo: $('#texto', c), texto: exercicios[i],
      teclado: criarTeclado($('#kb', c)), maos: criarMaos($('#maos', c)), dica: $('#dica', c),
      onProgresso: s => { $('#ppm', c).textContent = s.ppm; $('#prec', c).textContent = s.precisao; $('#prog', c).style.width = s.progresso * 100 + '%'; },
      onFim: s => {
        total.acertos += s.acertos; total.erros += s.erros; total.seg += s.seg;
        for (const [k, n] of Object.entries(s.errosTecla)) total.errosTecla[k] = (total.errosTecla[k] || 0) + n;
        i++;
        $('#texto', c).insertAdjacentHTML('beforeend', `<div class="feito-ok">${icone('check')}</div>`);
        som.pop();
        setTimeout(() => (i < exercicios.length ? exercicio() : resultado()), 650);
      }
    });
  }

  async function resultado() {
    const min = total.seg / 60, tot = total.acertos + total.erros;
    const r = { ...total, ppm: min > 0 ? Math.round(total.acertos / 5 / min) : 0, precisao: tot ? Math.round(total.acertos * 1000 / tot) / 10 : 100 };
    const out = registrarLicao(S.aluno, lic, r);
    const prox = LICOES[idx + 1];
    const passou = out.estrelas > 0;
    const piores = Object.entries(r.errosTecla).sort((a, b) => b[1] - a[1]).slice(0, 5);
    scrollTo({ top: 0 });
    c.innerHTML = `<div class="pagina"><section class="card resultado ${passou ? 'ok' : 'nao'}">
      <div class="res-estrelas">${[0, 1, 2].map(k => `<i class="${k < out.estrelas ? 'on' : ''}" style="--d:${k * 0.25}s">${icone('star')}</i>`).join('')}</div>
      <h1>${passou ? ['', 'Lição concluída!', 'Muito bem!', 'Perfeito, ninja!'][out.estrelas] : 'Quase lá!'}</h1>
      <p class="muted">${passou ? (out.estrelas < 3 ? dicaMelhorar(lic, r) : 'Você dominou esta lição. Bora para a próxima!') : 'Sua precisão ficou abaixo de 85%. Vá com calma: precisão primeiro, velocidade depois!'}</p>
      <div class="res-nums">
        <div><b>${r.ppm}</b><small>PPM</small></div>
        <div><b>${r.precisao}%</b><small>precisão</small></div>
        <div><b>${fmtTempo(r.seg)}</b><small>tempo</small></div>
        <div><b>+${out.xp}</b><small>XP</small></div>
        <div><b>+${out.moedas}</b><small>moedas</small></div>
      </div>
      ${piores.length ? `<div class="res-erros"><small>Teclas em que você mais errou:</small>${piores.map(([k, n]) => `<span class="keycap pequena" data-dedo="${passos(k).at(-1)?.dedo}">${k === ' ' ? 'espaço' : esc(k)}<sub>${n}</sub></span>`).join('')}</div>` : ''}
      <div class="acoes">
        <button class="bt sec" id="repetir">${icone('rotate-ccw')} Repetir</button>
        ${passou && prox ? `<a class="bt" href="#/licao/${prox.id}">Próxima lição ${icone('arrow-right')} <kbd>Enter</kbd></a>` : ''}
        ${passou && !prox ? `<a class="bt" href="#/jogos">${icone('gamepad-2')} Ir para os jogos</a>` : ''}
        <a class="bt sec" href="#/inicio">${icone('house')} Início</a>
      </div></section></div>`;
    if (out.estrelas === 3) { confete(); som.sucesso(); } else if (passou) som.sucesso(); else som.falha();
    const repetir = () => { exercicios = gerarExercicios(lic); zerar(); exercicio(); };
    $('#repetir', c).onclick = repetir;
    aoEnter(passou && prox ? () => { location.hash = '#/licao/' + prox.id; } : repetir);
    anunciar(out);
    await salvarTudo({ tipo: 'licao', ref: lic.id, titulo: lic.titulo, ppm: r.ppm, precisao: r.precisao, seg: Math.round(r.seg), estrelas: out.estrelas, xp: out.xp, data: Date.now() });
  }
}

function dicaMelhorar(lic, r) {
  if (!lic.meta) return 'Para 3 estrelas, tente chegar a 96% de precisão.';
  if (r.precisao < 92) return `Para mais estrelas, foque na precisão (meta: 92% ou mais).`;
  if (r.ppm < lic.meta) return `Boa precisão! Agora tente chegar a ${lic.meta} PPM para ganhar 2 estrelas.`;
  return `Para 3 estrelas: ${meta3(lic)} PPM com 96% de precisão. Você consegue!`;
}

/* ================================ Guia ================================ */
function guiaHtml() {
  return `<section class="card guia">
    <h2>${icone('armchair')} Postura correta</h2>
    <div class="guia-grid">
      <div class="g-item"><span>${icone('person-standing')}</span><p><b>Costas apoiadas</b> no encosto da cadeira e <b>pés no chão</b>.</p></div>
      <div class="g-item"><span>${icone('biceps-flexed')}</span><p><b>Cotovelos</b> perto do corpo, dobrados em um ângulo de mais ou menos 90°.</p></div>
      <div class="g-item"><span>${icone('hand')}</span><p><b>Pulsos retos e soltos</b>, sem apoiar com força na mesa enquanto digita.</p></div>
      <div class="g-item"><span>${icone('monitor')}</span><p><b>Tela a um braço de distância</b>, com o topo na altura dos olhos.</p></div>
      <div class="g-item"><span>${icone('eye')}</span><p><b>Olhos na tela</b>, não no teclado! No começo é difícil, mas vale a pena.</p></div>
      <div class="g-item"><span>${icone('pause')}</span><p>A cada 30 minutos, <b>faça uma pausa</b> e alongue mãos, braços e pescoço.</p></div>
    </div>
    <h2>${icone('house')} A fileira base</h2>
    <p>É a "casa" dos seus dedos. Sempre que não estiver apertando uma tecla, os dedos descansam aqui:</p>
    <ul class="lista">
      <li>Mão esquerda: <span class="keycap pequena" data-dedo="L5">A</span><span class="keycap pequena" data-dedo="L4">S</span><span class="keycap pequena" data-dedo="L3">D</span><span class="keycap pequena" data-dedo="L2">F</span> — mão direita: <span class="keycap pequena" data-dedo="R2">J</span><span class="keycap pequena" data-dedo="R3">K</span><span class="keycap pequena" data-dedo="R4">L</span><span class="keycap pequena" data-dedo="R5">Ç</span></li>
      <li>As teclas <b>F</b> e <b>J</b> têm <b>pequenas saliências</b>. Encontre-as com os indicadores sem olhar.</li>
      <li>Os <b>polegares</b> ficam sobre a barra de espaço.</li>
      <li>Dedos levemente <b>curvados</b>, como se segurassem uma bolinha. Toque nas teclas de leve.</li>
      <li>Depois de apertar uma tecla, o dedo <b>volta para a fileira base</b>.</li>
    </ul>
    <h2>${icone('palette')} Mapa dos dedos</h2>
    <p>Cada cor mostra qual dedo aperta cada tecla. As mãos acendem o dedo certo durante as lições.</p>
    <div class="kb-wrap"><div id="kb-guia"></div><div id="maos-guia"></div></div>
    <div class="legenda-dedos">${[['L5', 'Mínimos'], ['L4', 'Anelares'], ['L3', 'Médios'], ['L2', 'Indicador esq.'], ['R2', 'Indicador dir.'], ['T', 'Polegares']].map(([d, n]) => `<span><i class="dot" data-dedo="${d}"></i>${n}</span>`).join('')}</div>
    <h2>${icone('keyboard')} O teclado ABNT2</h2>
    <ul class="lista">
      <li>É o padrão brasileiro: tem a tecla <b>Ç</b> ao lado do L e teclas próprias para os acentos.</li>
      <li>Os acentos <b>´ ~ ^ \`</b> são teclas "mortas": aperte e solte o acento, <b>depois</b> aperte a vogal.</li>
      <li>Para maiúsculas, use o <b>Shift da mão oposta</b> à letra.</li>
      <li>No Windows, confira em <i>Configurações → Hora e idioma → Idioma → Português (Brasil) → Teclado</i>: deve estar <b>Português (Brasil ABNT2)</b>.</li>
    </ul>
  </section>`;
}

function montarGuiaTeclado(c) {
  const kg = $('#kb-guia', c);
  if (!kg) return;
  criarTeclado(kg); criarMaos($('#maos-guia', c)).destacar(['L5', 'L4', 'L3', 'L2', 'R2', 'R3', 'R4', 'R5', 'T']);
}

function telaGuia(c) {
  c.innerHTML = `<div class="pagina"><h1 class="titulo-pg">${icone('hand', 'tit')} Guia de digitação</h1>${guiaHtml()}
    <div class="acoes"><a class="bt" href="#/licao/l00">Praticar a posição das mãos ${icone('arrow-right')}</a></div></div>`;
  montarGuiaTeclado(c);
}

/* ================================ Jogos ================================ */
function telaJogos(c) {
  const a = S.aluno, letras = letrasJogos();
  c.innerHTML = `<div class="pagina">
    <h1 class="titulo-pg">${icone('gamepad-2', 'tit')} Jogos</h1>
    <div class="jogos-topo"><p class="muted">Os jogos usam as letras que você já aprendeu nas lições (<span class="mono">${esc(letras.toUpperCase())}</span>). Quanto mais lições, mais desafios! Cada partida dá <b>moedas</b> para a loja do avatar.</p>
      <a class="moedas-tag" href="#/avatar">${avatarSvg(a.avatar, { tam: 30, so: 'cabeca' })}${icone('coins')} <b>${a.moedas}</b></a></div>
    <div class="jogos-grid">${JOGOS.map(j => `<a class="jogo-card${j.novo ? ' destaque' : ''}" href="#/jogo/${j.id}" style="--cor:${j.cor}">
      <span class="j-ic">${icone(j.icone)}</span>${j.novo ? '<span class="selo-novo">Novo</span>' : ''}<h3>${j.nome}</h3><p>${j.desc}</p>
      <div class="j-rod"><span>${icone('trophy')} Recorde: <b>${a.jogos[j.id]?.recorde || 0}</b></span><span class="bt pequeno">Jogar</span></div></a>`).join('')}
    </div></div>`;
}

function telaJogo(c, id) {
  const j = JOGOS.find(x => x.id === id);
  if (!j) { location.hash = '#/jogos'; return; }
  const a = S.aluno;
  let inst = null, kd = null;
  const tirarKd = () => { if (kd) removeEventListener('keydown', kd); kd = null; };
  S.limpeza = () => { inst?.destruir(); tirarKd(); };
  c.innerHTML = `<div class="pagina jogo-pg" style="--cor:${j.cor}">
    <div class="jogo-cab"><a href="#/jogos" class="bt sec pequeno">${icone('arrow-left')} Jogos</a><h1>${icone(j.icone, 'tit')} ${j.nome}</h1><span class="recorde">${icone('trophy')} Recorde: <b id="rec">${a.jogos[j.id]?.recorde || 0}</b></span></div>
    <div class="jogo-area" id="area"></div></div>`;
  const area = $('#area', c);
  inicio();

  function inicio() {
    area.innerHTML = `<div class="jogo-inicio"><span class="j-ic grande">${icone(j.icone)}</span><h2>${j.nome}</h2><p>${j.desc}</p>
      <ol>${j.como.map(x => `<li>${x}</li>`).join('')}</ol>
      <button class="bt grande" id="jogar">Jogar <kbd>Enter</kbd></button></div>`;
    $('#jogar', area).onclick = jogar;
    kd = e => { if (e.key === 'Enter') { e.preventDefault(); jogar(); } };
    addEventListener('keydown', kd);
  }

  function jogar() {
    tirarKd(); inst?.destruir();
    area.innerHTML = '<div class="jogo-palco" id="jp"></div>';
    const letras = letrasJogos();
    inst = iniciarJogo(j.id, $('#jp', area), { letras, palavras: palavrasPara(letras), frases: FRASES, avatar: S.aluno.avatar, onFim: fim });
  }

  async function fim(res) {
    inst = null;
    const out = registrarJogo(S.aluno, j.id, res);
    $('#rec', c).textContent = S.aluno.jogos[j.id].recorde;
    const ov = document.createElement('div');
    ov.className = 'jogo-fim';
    ov.innerHTML = `<div class="card">
      <h2>${out.recorde ? icone('trophy', 'tit') + ' Novo recorde!' : 'Fim de jogo!'}</h2>
      <div class="pontos-grandes">${res.pontos}<small>pontos</small></div>
      ${res.detalhe ? `<p class="muted">${esc(res.detalhe)}</p>` : ''}
      <p class="xp">+${out.xp} XP · ${icone('coins')} +${out.moedas} moedas</p>
      <div class="acoes"><button class="bt" id="denovo">${icone('rotate-ccw')} Jogar de novo <kbd>Enter</kbd></button><a class="bt sec" href="#/jogos">Outros jogos</a></div></div>`;
    area.append(ov);
    if (out.recorde && res.pontos > 0) { confete(); som.sucesso(); }
    $('#denovo', ov).onclick = jogar;
    setTimeout(() => { kd = e => { if (e.key === 'Enter') { e.preventDefault(); jogar(); } }; addEventListener('keydown', kd); }, 500);
    anunciar(out);
    await salvarTudo({ tipo: 'jogo', ref: j.id, titulo: j.nome, pontos: res.pontos, ppm: res.ppm || 0, precisao: res.precisao || 0, seg: Math.round(res.seg || 0), xp: out.xp, data: Date.now() });
  }
}

/* ============================== Conquistas ============================== */
function telaConquistas(c) {
  const a = S.aluno;
  const erros = Object.entries(a.stats.errosTecla || {}).map(([k, n]) => [decTecla(k), n]).sort((x, y) => y[1] - x[1]);
  const ganhas = CONQUISTAS.filter(x => a.conquistas[x.id]).length;
  c.innerHTML = `<div class="pagina">
    <h1 class="titulo-pg">${icone('award', 'tit')} Conquistas <small>${ganhas}/${CONQUISTAS.length}</small></h1>
    <div class="conq-grid">${CONQUISTAS.map(x => `<div class="conq ${a.conquistas[x.id] ? 'on' : ''}"><span class="c-ic">${icone(x.icone)}</span><b>${x.nome}</b><small>${x.desc}</small></div>`).join('')}</div>
    <h2 class="secao">${icone('flame', 'tit')} Seus pontos fracos</h2>
    <section class="card">${erros.length ? `<p class="muted">Quanto mais vermelha a tecla, mais você erra nela. Treine com calma essas teclas!</p>
      <div class="kb-wrap"><div id="kb-calor"></div></div>
      <div class="res-erros">${erros.slice(0, 8).map(([k, n]) => `<span class="keycap pequena" data-dedo="${passos(k).at(-1)?.dedo}">${k === ' ' ? 'espaço' : esc(k)}<sub>${n}</sub></span>`).join('')}</div>`
      : '<p class="muted">Faça algumas lições para ver aqui as teclas em que você mais erra.</p>'}</section></div>`;
  if (erros.length) {
    const mapa = {};
    for (const [ch, n] of erros) { const cd = codeDe(ch); if (cd) mapa[cd] = (mapa[cd] || 0) + n; }
    criarTeclado($('#kb-calor', c), { cores: false }).calor(mapa);
  }
}

/* ================================ Ranking ================================ */
async function telaRanking(c) {
  const a = S.aluno;
  c.innerHTML = `<div class="pagina"><h1 class="titulo-pg">${icone('trophy', 'tit')} Ranking ${a.turmaNome ? `<small>${esc(a.turmaNome)}</small>` : ''}</h1><div id="rk" class="card"><div class="spinner"></div></div></div>`;
  if (!a.turma) { $('#rk', c).innerHTML = '<p class="muted">Entre em uma turma para ver o ranking.</p>'; return; }
  try {
    await salvarRanking(a.uid, dadosRanking(a)).catch(e => console.warn("ranking:", e.code || e));
    const lista = await lerRanking(a.turma);
    if (!$('#rk', c)) return;
    $('#rk', c).innerHTML = `<ol class="ranking">${lista.map((r, i) => `<li class="${r.uid === a.uid ? 'eu' : ''}">
      <span class="pos ${['ouro', 'prata', 'bronze'][i] || ''}">${i + 1}</span>${!r.foto && r.avatar && Object.keys(r.avatar).length ? `<span class="avatar boneco-av">${avatarSvg(r.avatar, { tam: 34, so: 'cabeca' })}</span>` : avatar(r.nome, r.foto)}<span class="rk-nome">${esc(r.nome)}${r.uid === a.uid ? ' <small>(você)</small>' : ''}</span>
      <span class="rk-det">Nv ${r.nivel} · ${r.licoes} lições · ${r.melhorPpm} PPM</span><b class="rk-xp">${r.xp} XP</b></li>`).join('')}</ol>`;
  } catch (e) { console.error(e); $('#rk', c).innerHTML = '<p class="erro-msg">Não foi possível carregar o ranking.</p>'; }
}

/* ================================ Avatar ================================ */
const textoReq = it => it.req.nivel ? `Chegue ao nível ${it.req.nivel}` : `Conquista: ${CONQUISTAS.find(c => c.id === it.req.conquista)?.nome || ''}`;
const MOSTRA_CABECA = new Set(['pele', 'rosto', 'chapeu']);

function telaAvatar(c) {
  const a = S.aluno;
  let cat = ler('tn_av_cat', 'pele');
  if (!CATEGORIAS.some(k => k.id === cat)) cat = 'pele';
  desenhar();

  function desenhar() {
    const av = avatarDe(a.avatar), base = { ...a, nivel: nivelDe(a.xp).n };
    c.innerHTML = `<div class="pagina">
      <div class="cab-pg"><h1 class="titulo-pg">${icone('shirt', 'tit')} Meu avatar</h1><span class="moedas-tag">${icone('coins')} <b>${a.moedas}</b> moedas</span></div>
      <div class="avatar-pg">
        <section class="card av-palco">
          <div class="av-boneco">${avatarSvg(av, { tam: 132 })}</div>
          <b>${esc(primeiroNome(a.nome))}</b>
          <p class="mini muted">Ganhe moedas nas lições (cada estrela nova vale 5) e nos jogos. Alguns itens são liberados por nível ou por conquista. Seu avatar aparece no ranking e no Parkour Ninja.</p>
        </section>
        <section class="card av-loja">
          <div class="av-abas" role="tablist">${CATEGORIAS.map(k => `<button type="button" role="tab" data-cat="${k.id}" class="${k.id === cat ? 'ativo' : ''}">${icone(k.icone)}<span>${k.nome}</span></button>`).join('')}</div>
          <div class="av-itens">${ITENS.filter(i => i.cat === cat).map(i => {
            const st = situacao(base, i), usando = av[cat] === i.id;
            const rot = usando ? `${icone('check')} Usando` : st === 'livre' ? 'Usar' : st === 'comprar' ? `${icone('coins')} ${i.preco}` : `${icone('lock')} ${esc(textoReq(i))}`;
            return `<button type="button" class="av-item ${st}${usando ? ' usando' : ''}" data-item="${i.id}">
              <span class="av-prev">${avatarSvg({ ...av, [cat]: i.id }, MOSTRA_CABECA.has(cat) ? { tam: 64, so: 'cabeca' } : { tam: 50 })}</span>
              <b>${esc(i.nome)}</b><small>${rot}</small></button>`;
          }).join('')}</div>
        </section>
      </div></div>`;
    $$('[data-cat]', c).forEach(b => b.onclick = () => { cat = b.dataset.cat; gravar('tn_av_cat', cat); desenhar(); });
    $$('[data-item]', c).forEach(b => b.onclick = () => escolher(ITENS.find(i => i.id === b.dataset.item), base));
  }

  function escolher(it, base) {
    const st = situacao(base, it);
    if (st === 'bloqueado') return toast(`${esc(it.nome)}: ${esc(textoReq(it))}.`, '', 'lock');
    if (st === 'comprar') {
      if ((a.moedas || 0) < it.preco) return toast(`Faltam <b>${it.preco - (a.moedas || 0)}</b> moedas para comprar ${esc(it.nome)}. Jogue e faça lições para ganhar mais!`, '', 'coins');
      const m = modal(`<div class="centro-txt"><div class="av-prev grande">${avatarSvg({ ...avatarDe(a.avatar), [it.cat]: it.id }, { tam: 110 })}</div>
        <h2>Comprar ${esc(it.nome)}?</h2><p class="muted">Custa <b>${it.preco}</b> moedas. Você tem <b>${a.moedas}</b>.</p>
        <div class="acoes"><button class="bt" id="av-sim">${icone('shopping-bag')} Comprar e usar</button><button class="bt sec" id="av-nao">Agora não</button></div></div>`);
      $('#av-nao', m.el).onclick = m.fechar;
      $('#av-sim', m.el).onclick = () => {
        m.fechar();
        a.moedas -= it.preco; a.itens = [...new Set([...(a.itens || []), it.id])];
        som.sucesso(); toast(`Você comprou <b>${esc(it.nome)}</b>!`, 'ok', 'shopping-bag');
        vestir(it);
      };
      return;
    }
    vestir(it);
  }

  function vestir(it) {
    a.avatar = { ...avatarDe(a.avatar), [it.cat]: it.id };
    // Conquista "Estiloso" e outras que dependem dos itens.
    const novas = CONQUISTAS.filter(x => !a.conquistas[x.id] && x.ok(a));
    for (const x of novas) a.conquistas[x.id] = Date.now();
    if (novas.length) { a.xp += novas.length * 25; anunciar({ conquistas: novas }); }
    som.pop(); desenhar(); salvarTudo(null);
  }
}
