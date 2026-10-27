// Aplicativo do aluno.
import { MODO, observarLogin, entrarGoogle, entrarDemo, sair, lerAluno, salvarAluno, registrarSessao, lerTurma, salvarRanking, lerRanking, ehProfessor } from './store.js';
import { LICOES, MODULOS, FRASES, gerarExercicios, palavrasPara } from './licoes.js';
import { criarTeclado, criarMaos, passos, codeDe } from './teclado.js';
import { Motor } from './motor.js';
import { JOGOS, iniciarJogo } from './jogos.js';
import { nivelDe, novoAluno, normalizar, registrarLicao, registrarJogo, CONQUISTAS, sequencia, teclasAprendidas, licaoLiberada, meta3, decTecla, dadosRanking, precisaoGeral, licoesFeitas, totalEstrelas } from './progresso.js';
import { $, $$, esc, toast, som, confete, aplicarTema, alternarTema, fmtTempo, ler, gravar, avatar, primeiroNome, rnd, GOOGLE_SVG } from './ui.js';

const app = $('#app');
const S = { user: null, aluno: null, limpeza: null };

aplicarTema();
addEventListener('hashchange', rotear);
observarLogin(async (user, erro) => {
  if (!user) { S.user = S.aluno = null; return telaLogin(erro); }
  S.user = user;
  try {
    let a = await lerAluno(user.uid);
    a = a ? normalizar(a) : novoAluno(user);
    Object.assign(a, { nome: user.nome, email: user.email, foto: user.foto || a.foto, ultimoAcesso: Date.now() });
    S.aluno = a;
    await salvarAluno(user.uid, a);
  } catch (e) {
    console.error(e);
    return telaLogin('Não foi possível carregar seus dados. Verifique a internet e tente de novo.');
  }
  if (!S.aluno.turma && !ehProfessor(user.email)) return telaTurma();
  montarShell(); rotear();
}).catch(e => {
  console.error(e);
  telaLogin('Não foi possível conectar ao servidor. Verifique a internet e recarregue a página.');
});

/* ================================ Login ================================ */
function telaLogin(erro = '') {
  limpar();
  app.innerHTML = `<div class="login">
    <section class="login-hero">
      <div class="logo grande"><span class="logo-ic">⌨️</span><span>Tecla<b>Ninja</b></span></div>
      <h1>Digite rápido.<br><span class="grad">Sem olhar para o teclado.</span></h1>
      <p class="sub">Um curso de digitação completo no teclado <b>ABNT2</b>, com lições curtas, jogos e desafios. Treine, ganhe XP e suba de nível!</p>
      <ul class="feat">
        <li><span>📚</span><div><b>${LICOES.length} lições</b><small>da fileira base aos textos completos</small></div></li>
        <li><span>🎮</span><div><b>${JOGOS.length} jogos</b><small>meteoros, naves, corrida e mais</small></div></li>
        <li><span>🏅</span><div><b>Conquistas e ranking</b><small>dispute com a sua turma</small></div></li>
      </ul>
      <div class="teclas-deco" aria-hidden="true">${'ASDF JKLÇ'.split('').map((c, i) => c === ' ' ? '<i class="gap"></i>' : `<span style="--i:${i}">${c}</span>`).join('')}</div>
    </section>
    <section class="login-card">
      <h2>Entrar</h2>
      ${MODO === 'firebase'
        ? `<p class="muted">Use sua conta Google para salvar seu progresso.</p>
           <button class="bt-google" id="entrar">${GOOGLE_SVG}<span>Entrar com Google</span></button>`
        : `<p class="aviso">🧪 <b>Modo demonstração.</b> O Firebase ainda não foi configurado, então o progresso fica salvo só neste navegador. Veja o LEIA-ME para ativar o login com Google.</p>
           <form id="f-demo" class="form-col"><label>Seu nome<input name="nome" required maxlength="40" placeholder="Ex.: Ana Souza" autocomplete="off"></label><button class="bt grande">Entrar</button></form>`}
      ${erro ? `<p class="erro-msg">${esc(erro)}</p>` : ''}
      <p class="mini">É professor(a)? <a href="professor.html">Acesse o painel do professor</a></p>
    </section>
  </div>`;
  $('#entrar')?.addEventListener('click', async e => {
    e.currentTarget.disabled = true;
    try { await entrarGoogle(); } catch (err) {
      console.error(err); e.currentTarget.disabled = false;
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') toast('Não foi possível entrar: ' + esc(err?.message || err), 'erro');
    }
  });
  $('#f-demo')?.addEventListener('submit', e => { e.preventDefault(); entrarDemo(new FormData(e.target).get('nome').trim()); });
}

function telaTurma() {
  limpar();
  app.innerHTML = `<div class="login centro"><section class="login-card">
    <div class="big-emoji">🏫</div>
    <h2>Olá, ${esc(primeiroNome(S.aluno.nome))}! 👋</h2>
    <p class="muted">Digite o <b>código da sua turma</b>. Seu professor vai passar esse código.</p>
    <form id="f-turma" class="form-col"><input name="codigo" maxlength="12" placeholder="Ex.: K7QF2M" autocomplete="off" class="codigo" required><button class="bt grande">Entrar na turma</button></form>
    <p class="erro-msg" id="msg"></p>
    ${MODO === 'demo' ? '<p class="mini">Demonstração: use o código <b>DEMO</b>.</p>' : ''}
    <button class="link" id="sair">Sair da conta</button>
  </section></div>`;
  $('#sair').onclick = () => sair();
  $('#f-turma').onsubmit = async e => {
    e.preventDefault();
    const codigo = new FormData(e.target).get('codigo').trim().toUpperCase();
    $('#msg').textContent = '';
    try {
      const t = await lerTurma(codigo);
      if (!t) { $('#msg').textContent = 'Código não encontrado. Confira com o professor.'; return; }
      Object.assign(S.aluno, { turma: t.codigo, turmaNome: t.nome });
      await salvarAluno(S.aluno.uid, S.aluno);
      await salvarRanking(S.aluno.uid, dadosRanking(S.aluno));
      toast(`Você entrou na turma <b>${esc(t.nome)}</b>! 🎉`, 'ok');
      montarShell(); location.hash = '#/inicio'; rotear();
    } catch (err) { console.error(err); $('#msg').textContent = 'Erro ao buscar a turma. Tente novamente.'; }
  };
}

/* ================================ Estrutura ================================ */
function montarShell() {
  app.innerHTML = `<header class="topo">
    <a class="logo" href="#/inicio"><span class="logo-ic">⌨️</span><span>Tecla<b>Ninja</b></span></a>
    <nav class="menu">
      <a href="#/inicio" data-r="inicio"><span class="mi">🏠</span><span class="mt">Início</span></a>
      <a href="#/jogos" data-r="jogos"><span class="mi">🎮</span><span class="mt">Jogos</span></a>
      <a href="#/conquistas" data-r="conquistas"><span class="mi">🏅</span><span class="mt">Conquistas</span></a>
      <a href="#/ranking" data-r="ranking"><span class="mi">🏆</span><span class="mt">Ranking</span></a>
      <a href="#/guia" data-r="guia"><span class="mi">✋</span><span class="mt">Guia</span></a>
    </nav>
    <div class="topo-dir">
      <button class="ico" id="bt-som" title="Ligar/desligar sons">${som.ativo ? '🔊' : '🔇'}</button>
      <button class="ico" id="bt-tema" title="Tema claro/escuro">🌓</button>
      <button class="usuario" id="usuario"></button>
    </div>
  </header>
  <main id="conteudo"></main>`;
  $('#bt-som').onclick = e => { e.currentTarget.textContent = som.alternar() ? '🔊' : '🔇'; };
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
  m.innerHTML = `<div class="mu-cab">${avatar(a.nome, a.foto, 'g')}<div><b>${esc(a.nome)}</b><small>${esc(a.email)}</small>${a.turmaNome ? `<small>Turma: ${esc(a.turmaNome)}</small>` : ''}</div></div>
    ${ehProfessor(a.email) ? '<a href="professor.html">👩‍🏫 Painel do professor</a>' : ''}
    <button id="mu-turma">🏫 Trocar de turma</button>
    <button id="mu-sair">🚪 Sair</button>`;
  document.body.append(m);
  const fechar = () => { m.remove(); removeEventListener('click', fechar); };
  setTimeout(() => addEventListener('click', fechar));
  $('#mu-sair', m).onclick = () => sair();
  $('#mu-turma', m).onclick = () => { limpar(); telaTurma(); };
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
  const telas = { licao: () => telaLicao(c, param), jogos: () => telaJogos(c), jogo: () => telaJogo(c, param), conquistas: () => telaConquistas(c), ranking: () => telaRanking(c), guia: () => telaGuia(c) };
  (telas[rota] || (() => telaInicio(c)))();
}

async function salvarTudo(sessao) {
  try {
    await salvarAluno(S.aluno.uid, S.aluno);
    await registrarSessao(S.aluno.uid, sessao);
    if (S.aluno.turma) await salvarRanking(S.aluno.uid, dadosRanking(S.aluno));
  } catch (e) {
    console.error(e);
    toast('⚠️ Não foi possível salvar o progresso. Verifique sua internet.', 'erro');
  }
}

function anunciar(out) {
  for (const c of out.conquistas || []) toast(`<span class="t-ic">${c.icone}</span><div><b>Nova conquista!</b><br>${esc(c.nome)}</div>`, 'conq');
  if (out.subiu) { const nv = nivelDe(S.aluno.xp); toast(`<span class="t-ic">⬆️</span><div><b>Subiu de nível!</b><br>Nível ${nv.n}: ${nv.nome}</div>`, 'conq'); confete(); }
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

const estrelasHtml = (n, max = 3) => `<span class="estrelas">${Array.from({ length: max }, (_, i) => `<i class="${i < n ? 'on' : ''}">★</i>`).join('')}</span>`;

function telaInicio(c) {
  const a = S.aluno, nv = nivelDe(a.xp);
  const feitas = licoesFeitas(a), total = LICOES.length;
  const prox = LICOES.find((l, i) => !a.licoes[l.id]?.concluida && licaoLiberada(a, i)) || LICOES.at(-1);
  const seq = sequencia(a.dias);
  c.innerHTML = `
  <section class="hero">
    <div class="hero-txt">
      <p class="ola">Olá, ${esc(primeiroNome(a.nome))}! 👋</p>
      <h1>${feitas === 0 ? 'Vamos começar sua jornada ninja?' : feitas === total ? 'Você concluiu o curso! 🎓' : 'Bora continuar treinando?'}</h1>
      <p class="sub">💡 ${rnd(DICAS)}</p>
      <a class="bt grande" href="#/licao/${prox.id}">▶ ${feitas ? 'Continuar' : 'Começar'}: ${esc(prox.titulo)}</a>
    </div>
    <div class="hero-nivel">
      <div class="anel" style="--p:${nv.pct}"><div><b>${nv.n}</b><small>nível</small></div></div>
      <div class="nivel-info"><b>${nv.nome}</b><div class="barra"><i style="width:${nv.pct * 100}%"></i></div>
        <small>${a.xp} XP${nv.prox ? ` · faltam ${nv.prox - a.xp} para o próximo nível` : ' · nível máximo!'}</small></div>
    </div>
  </section>
  <section class="stats">
    ${stat('📚', `${feitas}/${total}`, 'lições concluídas')}
    ${stat('⭐', totalEstrelas(a), 'estrelas')}
    ${stat('⚡', a.melhorPpm || 0, 'melhor PPM')}
    ${stat('🎯', precisaoGeral(a) ? precisaoGeral(a) + '%' : '—', 'precisão geral')}
    ${stat('🔥', seq, seq === 1 ? 'dia seguido' : 'dias seguidos')}
    ${stat('⏱️', fmtTempo(a.stats.tempo), 'de prática')}
  </section>
  <h2 class="secao">Sua trilha</h2>
  <section class="modulos">${MODULOS.map(m => moduloHtml(m)).join('')}</section>`;
  $$('.licao.bloq', c).forEach(x => x.addEventListener('click', e => { e.preventDefault(); toast('🔒 Conclua a lição anterior para liberar esta.'); }));
}

const stat = (ic, v, rot) => `<div class="stat"><span class="s-ic">${ic}</span><b>${v}</b><small>${rot}</small></div>`;

function moduloHtml(m) {
  const a = S.aluno;
  const lics = LICOES.map((l, i) => ({ l, i })).filter(x => x.l.modulo === m.id);
  const feitas = lics.filter(x => a.licoes[x.l.id]?.concluida).length;
  return `<div class="modulo${feitas === lics.length ? ' completo' : ''}">
    <div class="mod-cab"><span class="mod-ic">${m.icone}</span><div><h3>${m.nome}</h3><p>${m.desc}</p></div><span class="mod-prog">${feitas}/${lics.length}</span></div>
    <div class="licoes">${lics.map(({ l, i }) => {
      const p = a.licoes[l.id], lib = licaoLiberada(a, i);
      const cls = p?.concluida ? 'feita' : lib ? 'livre' : 'bloq';
      return `<a class="licao ${cls}" href="#/licao/${l.id}"><span class="lnum">${lib ? i + 1 : '🔒'}</span><span class="ltit">${esc(l.titulo)}</span>${estrelasHtml(p?.estrelas || 0)}</a>`;
    }).join('')}</div></div>`;
}

/* ================================ Lição ================================ */
function telaLicao(c, id) {
  const idx = LICOES.findIndex(l => l.id === id), lic = LICOES[idx];
  if (!lic) { location.hash = '#/inicio'; return; }
  if (!licaoLiberada(S.aluno, idx)) { toast('🔒 Conclua as lições anteriores primeiro.'); location.hash = '#/inicio'; return; }
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
      <div class="crumb"><a href="#/inicio">← Início</a> · ${mod.icone} ${esc(mod.nome)}</div>
      ${lic.tipo === 'teoria' ? guiaHtml() : ''}
      <section class="card licao-intro">
        <p class="tag">Lição ${idx + 1} de ${LICOES.length}</p>
        <h1>${esc(lic.titulo)}</h1>
        ${lic.novas ? `<div class="novas">${[...lic.novas].map(ch => `<span class="keycap" data-dedo="${passos(ch)[0]?.dedo}">${esc(ch.toUpperCase())}</span>`).join('')}</div>` : ''}
        <div class="dica-box">💡 ${lic.dica}</div>
        <div class="kb-wrap"><div id="kb"></div><div id="maos"></div></div>
        <div class="regras">
          <span>✅ Passar: <b>85%</b> de precisão</span>
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
        <a href="#/inicio" class="bt sec pequeno">✕ Sair</a>
        <div class="tt"><small>Lição ${idx + 1}</small><b>${esc(lic.titulo)}</b></div>
        <div class="passos-ex" title="Exercícios">${exercicios.map((_, j) => `<i class="${j < i ? 'feito' : j === i ? 'atual' : ''}"></i>`).join('')}</div>
        <div class="mini-stats"><span>⚡ <b id="ppm">0</b> PPM</span><span>🎯 <b id="prec">100</b>%</span></div>
      </div>
      <div class="barra fina"><i id="prog" style="width:0"></i></div>
      <div class="texto" id="texto"></div>
      <div class="dica-linha" id="dica"></div>
      <div class="kb-wrap${ocultar ? ' oculto' : ''}" id="kbw"><div id="kb"></div><div id="maos"></div></div>
      <div class="treino-rodape">
        <label class="chk"><input type="checkbox" id="ocultar"${ocultar ? ' checked' : ''}> 🥷 Modo ninja: esconder teclado</label>
        <button class="bt sec pequeno" id="reiniciar">↺ Reiniciar exercício</button>
      </div></div>`;
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
        $('#texto', c).insertAdjacentHTML('beforeend', '<div class="feito-ok">✓</div>');
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
    c.innerHTML = `<div class="pagina"><section class="card resultado ${passou ? 'ok' : 'nao'}">
      <div class="res-estrelas">${[0, 1, 2].map(k => `<i class="${k < out.estrelas ? 'on' : ''}" style="--d:${k * 0.25}s">★</i>`).join('')}</div>
      <h1>${passou ? ['', 'Lição concluída!', 'Muito bem!', 'Perfeito, ninja! 🥷'][out.estrelas] : 'Quase lá!'}</h1>
      <p class="muted">${passou ? (out.estrelas < 3 ? dicaMelhorar(lic, r) : 'Você dominou esta lição. Bora para a próxima!') : 'Sua precisão ficou abaixo de 85%. Vá com calma: precisão primeiro, velocidade depois!'}</p>
      <div class="res-nums">
        <div><b>${r.ppm}</b><small>PPM</small></div>
        <div><b>${r.precisao}%</b><small>precisão</small></div>
        <div><b>${fmtTempo(r.seg)}</b><small>tempo</small></div>
        <div><b>+${out.xp}</b><small>XP</small></div>
      </div>
      ${piores.length ? `<div class="res-erros"><small>Teclas em que você mais errou:</small>${piores.map(([k, n]) => `<span class="keycap pequena" data-dedo="${passos(k).at(-1)?.dedo}">${k === ' ' ? 'espaço' : esc(k)}<sub>${n}</sub></span>`).join('')}</div>` : ''}
      <div class="acoes">
        <button class="bt sec" id="repetir">↺ Repetir</button>
        ${passou && prox ? `<a class="bt" href="#/licao/${prox.id}">Próxima lição → <kbd>Enter</kbd></a>` : ''}
        ${passou && !prox ? '<a class="bt" href="#/jogos">🎮 Ir para os jogos</a>' : ''}
        <a class="bt sec" href="#/inicio">🏠 Início</a>
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
    <h2>🪑 Postura correta</h2>
    <div class="guia-grid">
      <div class="g-item"><span>🧍</span><p><b>Costas apoiadas</b> no encosto da cadeira e <b>pés no chão</b>.</p></div>
      <div class="g-item"><span>💪</span><p><b>Cotovelos</b> perto do corpo, dobrados em um ângulo de mais ou menos 90°.</p></div>
      <div class="g-item"><span>✋</span><p><b>Pulsos retos e soltos</b>, sem apoiar com força na mesa enquanto digita.</p></div>
      <div class="g-item"><span>🖥️</span><p><b>Tela a um braço de distância</b>, com o topo na altura dos olhos.</p></div>
      <div class="g-item"><span>👀</span><p><b>Olhos na tela</b>, não no teclado! No começo é difícil, mas vale a pena.</p></div>
      <div class="g-item"><span>⏸️</span><p>A cada 30 minutos, <b>faça uma pausa</b> e alongue mãos, braços e pescoço.</p></div>
    </div>
    <h2>🏠 A fileira base</h2>
    <p>É a "casa" dos seus dedos. Sempre que não estiver apertando uma tecla, os dedos descansam aqui:</p>
    <ul class="lista">
      <li>Mão esquerda: <span class="keycap pequena" data-dedo="L5">A</span><span class="keycap pequena" data-dedo="L4">S</span><span class="keycap pequena" data-dedo="L3">D</span><span class="keycap pequena" data-dedo="L2">F</span> — mão direita: <span class="keycap pequena" data-dedo="R2">J</span><span class="keycap pequena" data-dedo="R3">K</span><span class="keycap pequena" data-dedo="R4">L</span><span class="keycap pequena" data-dedo="R5">Ç</span></li>
      <li>As teclas <b>F</b> e <b>J</b> têm <b>pequenas saliências</b>. Encontre-as com os indicadores sem olhar.</li>
      <li>Os <b>polegares</b> ficam sobre a barra de espaço.</li>
      <li>Dedos levemente <b>curvados</b>, como se segurassem uma bolinha. Toque nas teclas de leve.</li>
      <li>Depois de apertar uma tecla, o dedo <b>volta para a fileira base</b>.</li>
    </ul>
    <h2>🎨 Mapa dos dedos</h2>
    <p>Cada cor mostra qual dedo aperta cada tecla. As mãos acendem o dedo certo durante as lições.</p>
    <div class="kb-wrap"><div id="kb-guia"></div><div id="maos-guia"></div></div>
    <div class="legenda-dedos">${[['L5', 'Mínimos'], ['L4', 'Anelares'], ['L3', 'Médios'], ['L2', 'Indicador esq.'], ['R2', 'Indicador dir.'], ['T', 'Polegares']].map(([d, n]) => `<span><i class="dot" data-dedo="${d}"></i>${n}</span>`).join('')}</div>
    <h2>🇧🇷 O teclado ABNT2</h2>
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
  c.innerHTML = `<div class="pagina"><h1 class="titulo-pg">✋ Guia de digitação</h1>${guiaHtml()}
    <div class="acoes"><a class="bt" href="#/licao/l00">Praticar a posição das mãos →</a></div></div>`;
  montarGuiaTeclado(c);
}

/* ================================ Jogos ================================ */
function telaJogos(c) {
  const a = S.aluno, letras = teclasAprendidas(a);
  c.innerHTML = `<div class="pagina">
    <h1 class="titulo-pg">🎮 Jogos</h1>
    <p class="muted">Os jogos usam as letras que você já aprendeu nas lições (<span class="mono">${esc(letras.toUpperCase())}</span>). Quanto mais lições, mais desafios!</p>
    <div class="jogos-grid">${JOGOS.map(j => `<a class="jogo-card" href="#/jogo/${j.id}" style="--cor:${j.cor}">
      <span class="j-ic">${j.icone}</span><h3>${j.nome}</h3><p>${j.desc}</p>
      <div class="j-rod"><span>🏆 Recorde: <b>${a.jogos[j.id]?.recorde || 0}</b></span><span class="bt pequeno">Jogar</span></div></a>`).join('')}
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
    <div class="jogo-cab"><a href="#/jogos" class="bt sec pequeno">← Jogos</a><h1>${j.icone} ${j.nome}</h1><span class="recorde">🏆 Recorde: <b id="rec">${a.jogos[j.id]?.recorde || 0}</b></span></div>
    <div class="jogo-area" id="area"></div></div>`;
  const area = $('#area', c);
  inicio();

  function inicio() {
    area.innerHTML = `<div class="jogo-inicio"><span class="j-ic grande">${j.icone}</span><h2>${j.nome}</h2><p>${j.desc}</p>
      <ol>${j.como.map(x => `<li>${x}</li>`).join('')}</ol>
      <button class="bt grande" id="jogar">Jogar <kbd>Enter</kbd></button></div>`;
    $('#jogar', area).onclick = jogar;
    kd = e => { if (e.key === 'Enter') { e.preventDefault(); jogar(); } };
    addEventListener('keydown', kd);
  }

  function jogar() {
    tirarKd(); inst?.destruir();
    area.innerHTML = '<div class="jogo-palco" id="jp"></div>';
    const letras = teclasAprendidas(S.aluno);
    inst = iniciarJogo(j.id, $('#jp', area), { letras, palavras: palavrasPara(letras), frases: FRASES, onFim: fim });
  }

  async function fim(res) {
    inst = null;
    const out = registrarJogo(S.aluno, j.id, res);
    $('#rec', c).textContent = S.aluno.jogos[j.id].recorde;
    const ov = document.createElement('div');
    ov.className = 'jogo-fim';
    ov.innerHTML = `<div class="card">
      <h2>${out.recorde ? '🏆 Novo recorde!' : 'Fim de jogo!'}</h2>
      <div class="pontos-grandes">${res.pontos}<small>pontos</small></div>
      ${res.detalhe ? `<p class="muted">${esc(res.detalhe)}</p>` : ''}
      <p class="xp">+${out.xp} XP</p>
      <div class="acoes"><button class="bt" id="denovo">↺ Jogar de novo <kbd>Enter</kbd></button><a class="bt sec" href="#/jogos">Outros jogos</a></div></div>`;
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
    <h1 class="titulo-pg">🏅 Conquistas <small>${ganhas}/${CONQUISTAS.length}</small></h1>
    <div class="conq-grid">${CONQUISTAS.map(x => `<div class="conq ${a.conquistas[x.id] ? 'on' : ''}"><span class="c-ic">${x.icone}</span><b>${x.nome}</b><small>${x.desc}</small></div>`).join('')}</div>
    <h2 class="secao">🔥 Seus pontos fracos</h2>
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
  c.innerHTML = `<div class="pagina"><h1 class="titulo-pg">🏆 Ranking ${a.turmaNome ? `<small>${esc(a.turmaNome)}</small>` : ''}</h1><div id="rk" class="card"><div class="spinner"></div></div></div>`;
  if (!a.turma) { $('#rk', c).innerHTML = '<p class="muted">Entre em uma turma para ver o ranking.</p>'; return; }
  try {
    await salvarRanking(a.uid, dadosRanking(a));
    const lista = await lerRanking(a.turma);
    if (!$('#rk', c)) return;
    $('#rk', c).innerHTML = `<ol class="ranking">${lista.map((r, i) => `<li class="${r.uid === a.uid ? 'eu' : ''}">
      <span class="pos">${['🥇', '🥈', '🥉'][i] || i + 1}</span>${avatar(r.nome, r.foto)}<span class="rk-nome">${esc(r.nome)}${r.uid === a.uid ? ' <small>(você)</small>' : ''}</span>
      <span class="rk-det">Nv ${r.nivel} · ${r.licoes} lições · ${r.melhorPpm} PPM</span><b class="rk-xp">${r.xp} XP</b></li>`).join('')}</ol>`;
  } catch (e) { console.error(e); $('#rk', c).innerHTML = '<p class="erro-msg">Não foi possível carregar o ranking.</p>'; }
}
