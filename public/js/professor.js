// Painel do professor: turmas, lista de alunos, detalhes e exportação.
import { MODO, observarLogin, entrarGoogle, entrarDemo, sair, ehProfessor, listarAlunos, listarTurmas, criarTurma, excluirTurma, lerSessoes, excluirAluno, salvarAluno, salvarRanking, registrarSessao, chaveAluno, DOMINIO_LOGIN, liberarNovaSenhaDemo, definirSenhaDemo, observarCurso, definirCurso, definirFotos, salvarFoto, bloquearFoto } from './store.js';
import { LICOES, MODULOS } from './licoes.js';
import { JOGOS } from './jogos.js';
import { criarTeclado, codeDe } from './teclado.js';
import { icone } from './icones.js';
import { nivelDe, CONQUISTAS, sequencia, decTecla, precisaoGeral, licoesFeitas, totalEstrelas, normalizar, novoAluno, dadosRanking, codTecla } from './progresso.js';
import { $, $$, esc, toast, aplicarTema, alternarTema, fmtTempo, fmtData, avatar, modal, GOOGLE_SVG, hoje, reduzirImagem } from './ui.js';

const app = $('#app');
const P = { user: null, turmas: [], alunos: [], turma: '', busca: '', ordem: 'nome', dir: 1, aba: 'alunos', pararCurso: null };
const DIA = 864e5;

aplicarTema();
observarLogin((u, erro) => {
  if (!u) return telaLogin(erro);
  if (MODO === 'demo' && u.email !== 'professor@demo.local') return telaLogin();
  if (MODO === 'firebase' && !ehProfessor(u.email)) return telaNegado(u);
  P.user = u; painel();
}).catch(e => {
  console.error(e);
  telaLogin('Não foi possível conectar ao servidor. Verifique a internet e recarregue a página.');
});

function telaLogin(erro = '') {
  app.innerHTML = `<div class="login centro"><section class="login-card">
    <div class="big-emoji">${icone('school')}</div>
    <h2>Painel do Professor</h2>
    <p class="muted">Acompanhe o progresso dos alunos do TeclaNinja.</p>
    ${MODO === 'firebase'
      ? `<button class="bt-google" id="entrar">${GOOGLE_SVG}<span>Entrar com Google</span></button>`
      : `<p class="aviso">${icone('info')} Modo demonstração: qualquer pessoa entra como professor. Configure o Firebase para proteger o painel.</p><button class="bt grande" id="demo">Entrar como professor (demo)</button>`}
    ${erro ? `<p class="erro-msg">${esc(erro)}</p>` : ''}
    <p class="mini"><a href="index.html">${icone('arrow-left')} Ir para o curso</a></p>
  </section></div>`;
  $('#entrar')?.addEventListener('click', () => entrarGoogle(false).catch(e => toast('Erro ao entrar: ' + esc(e.message), 'erro')));
  $('#demo')?.addEventListener('click', () => entrarDemo('Professor(a)', 'professor@demo.local'));
}

function telaNegado(u) {
  app.innerHTML = `<div class="login centro"><section class="login-card">
    <div class="big-emoji">${icone('lock')}</div><h2>Acesso restrito</h2>
    <p class="muted">A conta <b>${esc(u.email)}</b> não está cadastrada como professor.</p>
    <p class="mini">Para liberar, adicione o e-mail em <code>js/config.js</code> e em <code>firestore.rules</code>.</p>
    <button class="bt" id="sair">Entrar com outra conta</button> <a class="bt sec" href="index.html">Ir para o curso</a>
  </section></div>`;
  $('#sair').onclick = () => sair();
}

/* ================================ Painel ================================ */
function painel() {
  app.innerHTML = `<header class="topo prof">
    <a class="logo" href="professor.html"><span class="logo-ic">${icone('keyboard')}</span><span>Tecla<b>Ninja</b></span><span class="selo">Professor</span></a>
    <nav class="menu">
      <a href="#" data-aba="alunos"><span class="mi">${icone('users')}</span><span class="mt">Alunos</span></a>
      <a href="#" data-aba="turmas"><span class="mi">${icone('school')}</span><span class="mt">Turmas</span></a>
      <a href="#" data-aba="fotos"><span class="mi">${icone('camera')}</span><span class="mt">Fotos</span></a>
      <a href="index.html"><span class="mi">${icone('keyboard')}</span><span class="mt">Ver curso</span></a>
    </nav>
    <div class="topo-dir">
      <label class="interruptor" id="sw" title="Liga ou desliga as lições e os jogos para todos os alunos">
        <input type="checkbox" id="sw-curso" role="switch" disabled>
        <span class="trilho" aria-hidden="true"><span class="bolinha"></span></span>
        <span class="sw-txt" id="sw-txt">Carregando…</span>
      </label>
      <button class="ico" id="bt-tema" title="Tema claro/escuro">${icone('sun-moon')}</button>
      <span class="usuario estatico">${avatar(P.user.nome, P.user.foto)}<span class="u-info"><b>${esc(P.user.nome)}</b><small>${esc(P.user.email)}</small></span></span>
      <button class="ico" id="bt-sair" title="Sair">${icone('log-out')}</button>
    </div>
  </header>
  <main id="conteudo" class="pagina larga"></main>`;
  $('#bt-tema').onclick = alternarTema;
  $('#bt-sair').onclick = () => sair();
  // A aba Fotos sempre busca os dados mais recentes (para moderar as fotos novas).
  $$('[data-aba]').forEach(a => a.onclick = e => { e.preventDefault(); P.aba = a.dataset.aba; P.aba === 'fotos' ? carregar() : render(); });
  ligarInterruptor();
  carregar();
}

/** Botão liga/desliga do curso (vale para todos os alunos, em tempo real). */
function ligarInterruptor() {
  const sw = $('#sw-curso'), txt = $('#sw-txt'), caixa = $('#sw');
  const mostrar = (lib, dados = {}) => {
    P.fotosLiberadas = dados.fotosLiberadas !== false;
    atualizarSwitchFotos();
    sw.checked = lib; sw.disabled = false;
    caixa.classList.toggle('desligado', !lib);
    txt.textContent = lib ? 'Curso liberado' : 'Curso pausado';
    sw.setAttribute('aria-label', lib ? 'Curso liberado. Clique para pausar' : 'Curso pausado. Clique para liberar');
  };
  P.pararCurso?.();
  observarCurso(mostrar).then(f => { P.pararCurso = f; }).catch(e => console.error(e));
  sw.onchange = async () => {
    const lib = sw.checked;
    sw.disabled = true;
    try {
      await definirCurso(lib);
      mostrar(lib);
      toast(lib ? 'Curso liberado para todos os alunos.' : 'Curso pausado. Os alunos não conseguem fazer lições nem jogos até você liberar.', lib ? 'ok' : '', lib ? 'circle-check' : 'lock');
    } catch (err) {
      console.error(err);
      mostrar(!lib);
      toast('Não foi possível mudar. Confira se as regras novas do <code>firestore.rules</code> foram publicadas no Firebase.', 'erro');
    }
  };
}

async function carregar() {
  $('#conteudo').innerHTML = '<div class="spinner"></div>';
  try {
    [P.turmas, P.alunos] = await Promise.all([listarTurmas(), listarAlunos()]);
    P.alunos = P.alunos.filter(a => !ehProfessor(a.email)).map(normalizar);
  } catch (e) {
    console.error(e);
    $('#conteudo').innerHTML = `<div class="card"><p class="erro-msg">Não foi possível carregar os dados: ${esc(e.message)}</p><p class="muted">Confira se o seu e-mail está em <code>firestore.rules</code> e se as regras foram publicadas.</p></div>`;
    return;
  }
  render();
}

function render() {
  $$('[data-aba]').forEach(a => a.classList.toggle('ativo', a.dataset.aba === P.aba));
  ({ turmas: abaTurmas, fotos: abaFotos }[P.aba] || abaAlunos)();
}

const turmaDe = cod => P.turmas.find(t => t.codigo === cod);
const nomeTurma = cod => { const t = turmaDe(cod); return t ? t.nome : cod ? cod + ' (excluída)' : 'Sem turma'; };
const escolaDaTurma = (cod, a) => turmaDe(cod)?.escola || a?.escola || '';
const rotuloTurma = t => (t.escola ? t.escola + ' · ' : '') + t.nome;
const ordenarTurmas = ts => [...ts].sort((x, y) => rotuloTurma(x).localeCompare(rotuloTurma(y), 'pt-BR', { numeric: true }));

/* ================================ Alunos ================================ */
function linhaDados(a) {
  return {
    a, nome: a.nome || '', turma: nomeTurma(a.turma), escola: escolaDaTurma(a.turma, a), licoes: licoesFeitas(a), estrelas: totalEstrelas(a),
    ppm: a.melhorPpm || 0, precisao: precisaoGeral(a), tempo: a.stats.tempo || 0, xp: a.xp || 0, acesso: a.ultimoAcesso || 0
  };
}

function abaAlunos() {
  const c = $('#conteudo');
  const linhas = P.alunos.filter(a => !P.turma || a.turma === P.turma).map(linhaDados);
  const ativos = linhas.filter(l => Date.now() - l.acesso < 7 * DIA).length;
  const media = (f, comValor = false) => {
    const v = linhas.map(f).filter(x => !comValor || x > 0);
    return v.length ? v.reduce((s, x) => s + x, 0) / v.length : 0;
  };
  c.innerHTML = `
    <div class="cab-pg"><h1 class="titulo-pg">${icone('users', 'tit')} Acompanhamento dos alunos</h1></div>
    <div class="filtros">
      <select id="f-turma"><option value="">Todas as turmas</option>${ordenarTurmas(P.turmas).map(t => `<option value="${esc(t.codigo)}"${P.turma === t.codigo ? ' selected' : ''}>${esc(rotuloTurma(t))}</option>`).join('')}</select>
      <input id="f-busca" type="search" placeholder="Buscar aluno..." value="${esc(P.busca)}">
      <span class="esp"></span>
      <button class="bt sec pequeno" id="bt-atualizar">${icone('refresh-cw')} Atualizar</button>
      <button class="bt sec pequeno" id="bt-csv">${icone('download')} Exportar planilha (CSV)</button>
      ${MODO === 'demo' ? `<button class="bt pequeno" id="bt-exemplo">${icone('wand-sparkles')} Gerar alunos de exemplo</button>` : ''}
    </div>
    <section class="stats">
      ${stat(icone('users'), linhas.length, 'alunos')}
      ${stat(icone('activity'), ativos, 'ativos nos últimos 7 dias')}
      ${stat(icone('book-open'), Math.round(media(l => l.licoes / LICOES.length) * 100) + '%', 'do curso concluído (média)')}
      ${stat(icone('zap'), Math.round(media(l => l.ppm, true)), 'PPM médio')}
      ${stat(icone('target'), media(l => l.precisao, true).toFixed(1) + '%', 'precisão média')}
      ${stat(icone('clock'), fmtTempo(linhas.reduce((s, l) => s + l.tempo, 0)), 'de prática no total')}
    </section>
    <section class="card sem-pad"><div class="tabela-wrap" id="tabela"></div></section>`;
  $('#f-turma').onchange = e => { P.turma = e.target.value; abaAlunos(); };
  $('#f-busca').oninput = e => { P.busca = e.target.value; tabela(linhas); };
  $('#bt-atualizar').onclick = carregar;
  $('#bt-csv').onclick = () => exportarCsv(linhas);
  $('#bt-exemplo')?.addEventListener('click', gerarExemplo);
  tabela(linhas);
}

const stat = (ic, v, rot) => `<div class="stat"><span class="s-ic">${ic}</span><b>${v}</b><small>${rot}</small></div>`;

const COLUNAS = [
  ['nome', 'Aluno'], ['turma', 'Turma'], ['licoes', 'Progresso'], ['estrelas', 'Estrelas'], ['ppm', 'Melhor PPM'],
  ['precisao', 'Precisão'], ['tempo', 'Tempo'], ['xp', 'Nível / XP'], ['acesso', 'Último acesso']
];

function tabela(todas) {
  const b = P.busca.trim().toLowerCase();
  const linhas = todas.filter(l => !b || l.nome.toLowerCase().includes(b) || (l.a.email || '').toLowerCase().includes(b))
    .sort((x, y) => (typeof x[P.ordem] === 'string' ? x[P.ordem].localeCompare(y[P.ordem]) : x[P.ordem] - y[P.ordem]) * P.dir);
  const el = $('#tabela');
  if (!todas.length) {
    el.innerHTML = `<div class="vazio"><span>${icone('users')}</span><p>Nenhum aluno ainda.</p><p class="muted">Crie uma turma na aba <b>Turmas</b> e peça aos alunos para fazerem o primeiro acesso.</p></div>`;
    return;
  }
  el.innerHTML = `<table class="tabela"><thead><tr>${COLUNAS.map(([k, n]) => `<th data-k="${k}" class="${['estrelas', 'ppm', 'precisao', 'tempo', 'xp', 'acesso'].includes(k) ? 'num ' : ''}${P.ordem === k ? (P.dir > 0 ? 'asc' : 'desc') : ''}">${n}</th>`).join('')}</tr></thead>
    <tbody>${linhas.map(l => {
      const nv = nivelDe(l.xp), dias = (Date.now() - l.acesso) / DIA, pct = l.licoes / LICOES.length;
      return `<tr data-uid="${esc(l.a.uid)}" tabindex="0">
        <td><div class="cel-aluno">${avatar(l.nome, l.a.foto)}<div><b>${esc(l.nome)}</b>${String(l.a.email || '').endsWith('@' + DOMINIO_LOGIN) ? '' : `<small>${esc(l.a.email)}</small>`}</div></div></td>
        <td>${esc(l.turma)}${l.escola ? `<small class="muted d-block">${esc(l.escola)}</small>` : ''}</td>
        <td><div class="cel-prog"><div class="barra"><i style="width:${pct * 100}%"></i></div><small>${l.licoes}/${LICOES.length}</small></div></td>
        <td class="num">${l.estrelas}</td>
        <td class="num"><b>${l.ppm}</b></td>
        <td class="num">${l.precisao ? l.precisao + '%' : '—'}</td>
        <td class="num">${fmtTempo(l.tempo)}</td>
        <td class="num"><b>Nv ${nv.n}</b><small class="muted d-block">${l.xp} XP</small></td>
        <td class="num"><span class="selo-acesso ${dias < 2 ? 'v' : dias < 7 ? 'a' : 'r'}">${fmtData(l.acesso)}</span></td>
      </tr>`;
    }).join('') || `<tr><td colspan="9" class="muted centro-txt">Nenhum aluno encontrado.</td></tr>`}</tbody></table>`;
  $$('th', el).forEach(th => th.onclick = () => { const k = th.dataset.k; P.dir = P.ordem === k ? -P.dir : (k === 'nome' || k === 'turma' ? 1 : -1); P.ordem = k; tabela(todas); });
  $$('tbody tr[data-uid]', el).forEach(tr => {
    tr.onclick = () => detalhe(tr.dataset.uid);
    tr.onkeydown = e => { if (e.key === 'Enter') detalhe(tr.dataset.uid); };
  });
}

function exportarCsv(linhas) {
  const cab = ['Nome', 'Escola', 'Turma', 'Lições concluídas', 'Total de lições', 'Estrelas', 'Melhor PPM', 'Precisão geral (%)', 'Tempo de prática (min)', 'XP', 'Nível', 'Último acesso',
    ...LICOES.map((l, i) => `L${i + 1} estrelas`)];
  const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const corpo = linhas.map(l => [l.nome, l.escola, l.turma, l.licoes, LICOES.length, l.estrelas, l.ppm, String(l.precisao).replace('.', ','), Math.round(l.tempo / 60), l.xp, nivelDe(l.xp).n,
    l.acesso ? new Date(l.acesso).toLocaleString('pt-BR') : '', ...LICOES.map(x => l.a.licoes[x.id]?.estrelas ?? '')].map(q).join(';'));
  const blob = new Blob(['﻿' + [cab.map(q).join(';'), ...corpo].join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = `teclaninja-${P.turma || 'todas'}-${hoje()}.csv`; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* ============================ Detalhe do aluno ============================ */
async function detalhe(uid) {
  const a = P.alunos.find(x => x.uid === uid);
  if (!a) return;
  const nv = nivelDe(a.xp);
  const m = modal('<div class="spinner"></div>', 'larga');
  let sessoes = [];
  try { sessoes = await lerSessoes(uid); } catch (e) { console.error(e); }
  const erros = Object.entries(a.stats.errosTecla || {}).map(([k, n]) => [decTecla(k), n]).sort((x, y) => y[1] - x[1]);
  m.el.innerHTML = `
    <div class="det-cab">${avatar(a.nome, a.foto, 'g')}<div><h2>${esc(a.nome)}</h2><p class="muted">${esc(escolaDaTurma(a.turma, a))}${escolaDaTurma(a.turma, a) ? ' · ' : ''}${esc(nomeTurma(a.turma))}</p></div></div>
    ${String(a.email || '').endsWith('@' + DOMINIO_LOGIN) ? `<details class="caixa-senha"><summary>${icone('key-round')} O aluno esqueceu a senha?</summary>
      ${MODO === 'demo' ? `<p>No modo demonstração, clique abaixo. O aluno faz o <b>Primeiro acesso</b> de novo, com o mesmo nome e turma, e cria outra senha. O progresso é mantido.</p><button class="bt sec pequeno" id="d-senha">Liberar nova senha</button>`
      : `<ol>
        <li>Abra o <a href="https://console.firebase.google.com/project/_/authentication/users" target="_blank" rel="noopener">console do Firebase → Authentication → Usuários</a>.</li>
        <li>Na busca, cole o login do aluno: <code id="d-login">${esc(a.email)}</code> <button class="bt sec pequeno" id="d-copiar">${icone('copy')} Copiar</button></li>
        <li>Clique nos <b>três pontinhos (⋮)</b> da linha do aluno → <b>Excluir conta</b>.</li>
        <li>Peça ao aluno para fazer o <b>Primeiro acesso</b> de novo, com o <b>mesmo nome, sobrenome e turma</b>, criando uma nova senha. O progresso dele é mantido.</li>
      </ol>`}</details>` : ''}
    <section class="stats mini">
      ${stat(icone('award'), `Nv ${nv.n}`, nv.nome + ` · ${a.xp} XP`)}
      ${stat(icone('book-open'), `${licoesFeitas(a)}/${LICOES.length}`, 'lições')}
      ${stat(icone('star'), totalEstrelas(a), 'estrelas')}
      ${stat(icone('zap'), a.melhorPpm || 0, 'melhor PPM')}
      ${stat(icone('target'), precisaoGeral(a) ? precisaoGeral(a) + '%' : '—', 'precisão geral')}
      ${stat(icone('clock'), fmtTempo(a.stats.tempo), 'de prática')}
      ${stat(icone('flame'), sequencia(a.dias), 'dias seguidos')}
      ${stat(icone('calendar-days'), a.dias.length, 'dias praticados')}
    </section>
    <h3>${icone('chart-line')} Evolução da velocidade (PPM)</h3>
    <div id="grafico" class="grafico"></div>
    <h3>${icone('book-open')} Progresso nas lições</h3>
    <div class="det-mods">${MODULOS.map(md => `<div class="det-mod"><b>${icone(md.icone)} <span>${md.nome}</span></b><div class="det-lics">${LICOES.map((l, i) => ({ l, i })).filter(x => x.l.modulo === md.id).map(({ l, i }) => {
      const p = a.licoes[l.id];
      return `<span class="det-lic ${p?.concluida ? 'ok' : p ? 'tent' : ''}" title="${esc(l.titulo)}${p ? ` — ${p.estrelas}★, ${p.ppm} PPM, ${p.precisao}%, ${p.tentativas} tentativa(s)` : ' — não iniciada'}">${i + 1}<i>${'★'.repeat(p?.estrelas || 0) || '·'}</i></span>`;
    }).join('')}</div></div>`).join('')}</div>
    <div class="det-2col">
      <div><h3>${icone('flame')} Teclas com mais erros</h3>${erros.length ? `<div id="d-kb"></div><div class="res-erros">${erros.slice(0, 8).map(([k, n]) => `<span class="keycap pequena">${k === ' ' ? 'espaço' : esc(k)}<sub>${n}</sub></span>`).join('')}</div>` : '<p class="muted">Sem dados ainda.</p>'}</div>
      <div><h3>${icone('gamepad-2')} Jogos</h3><table class="tabela compacta"><tbody>${JOGOS.map(j => `<tr><td>${icone(j.icone)} ${j.nome}</td><td>${a.jogos[j.id]?.partidas || 0} partida(s)</td><td>${icone('trophy')} <b>${a.jogos[j.id]?.recorde || 0}</b></td></tr>`).join('')}</tbody></table>
        <h3>${icone('award')} Conquistas (${Object.keys(a.conquistas).length}/${CONQUISTAS.length})</h3>
        <div class="det-conq">${CONQUISTAS.map(x => `<span class="${a.conquistas[x.id] ? 'on' : ''}" title="${esc(x.nome)}: ${esc(x.desc)}">${icone(x.icone)}</span>`).join('')}</div></div>
    </div>
    <h3>${icone('history')} Atividades recentes</h3>
    ${sessoes.length ? `<div class="tabela-wrap"><table class="tabela compacta"><thead><tr><th>Data</th><th>Atividade</th><th>Resultado</th><th>Tempo</th></tr></thead><tbody>
      ${sessoes.slice(-15).reverse().map(s => `<tr><td>${new Date(s.data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</td><td>${icone(s.tipo === 'licao' ? 'book-open' : 'gamepad-2')} ${esc(s.titulo)}</td>
        <td>${s.tipo === 'licao' ? `${'★'.repeat(s.estrelas || 0) || 'não passou'} · ${s.ppm} PPM · ${s.precisao}%` : `${s.pontos} pts${s.ppm ? ` · ${s.ppm} PPM` : ''}`}</td><td>${fmtTempo(s.seg)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Nenhuma atividade registrada.</p>'}
    <div class="acoes fim"><button class="bt perigo pequeno" id="d-excluir">${icone('trash-2')} Excluir aluno e progresso</button></div>`;

  grafico($('#grafico', m.el), sessoes.filter(s => s.ppm > 0 && (s.tipo === 'licao' || s.ref === 'teste' || s.ref === 'corrida')));
  if (erros.length) {
    const mapa = {};
    for (const [ch, n] of erros) { const cd = codeDe(ch); if (cd) mapa[cd] = (mapa[cd] || 0) + n; }
    criarTeclado($('#d-kb', m.el), { cores: false }).calor(mapa);
  }
  $('#d-copiar', m.el)?.addEventListener('click', () => { navigator.clipboard?.writeText(a.email).then(() => toast('Login copiado!', 'ok'), () => {}); });
  $('#d-senha', m.el)?.addEventListener('click', () => { liberarNovaSenhaDemo(a.uid); toast('Pronto! O aluno já pode criar uma nova senha no Primeiro acesso.', 'ok'); });
  $('#d-excluir', m.el).onclick = async () => {
    if (!confirm(`Excluir ${a.nome} e todo o progresso? Esta ação não pode ser desfeita.`)) return;
    try { await excluirAluno(a.uid); P.alunos = P.alunos.filter(x => x.uid !== a.uid); m.fechar(); abaAlunos(); toast('Aluno excluído.'); }
    catch (err) { toast('Erro: ' + esc(err.message), 'erro'); }
  };
}

/** Gráfico de linha (uma série) com tooltip ao passar o mouse. */
function grafico(el, dados) {
  if (dados.length < 2) { el.innerHTML = '<p class="muted">Ainda não há atividades suficientes para o gráfico.</p>'; return; }
  const W = 720, H = 220, m = { l: 40, r: 16, t: 14, b: 28 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const max = Math.max(10, ...dados.map(d => d.ppm));
  const passo = max > 60 ? 20 : max > 30 ? 10 : 5, topo = Math.ceil(max / passo) * passo;
  const x = i => m.l + (dados.length === 1 ? iw / 2 : (i / (dados.length - 1)) * iw);
  const y = v => m.t + ih - (v / topo) * ih;
  const grade = []; for (let v = 0; v <= topo; v += passo) grade.push(v);
  const pts = dados.map((d, i) => `${x(i).toFixed(1)},${y(d.ppm).toFixed(1)}`).join(' ');
  const ultimo = dados.at(-1);
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Velocidade em PPM ao longo das atividades">
    ${grade.map(v => `<line x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}" class="g-grade"/><text x="${m.l - 8}" y="${y(v) + 4}" class="g-eixo" text-anchor="end">${v}</text>`).join('')}
    <text x="${m.l}" y="${H - 6}" class="g-eixo">${new Date(dados[0].data).toLocaleDateString('pt-BR')}</text>
    <text x="${W - m.r}" y="${H - 6}" class="g-eixo" text-anchor="end">${new Date(ultimo.data).toLocaleDateString('pt-BR')}</text>
    <polyline points="${pts}" class="g-linha"/>
    ${dados.length <= 40 ? dados.map((d, i) => `<circle cx="${x(i)}" cy="${y(d.ppm)}" r="4" class="g-ponto"/>`).join('') : ''}
    <circle cx="${x(dados.length - 1)}" cy="${y(ultimo.ppm)}" r="5" class="g-ponto fim"/>
    <text x="${x(dados.length - 1) - 8}" y="${y(ultimo.ppm) - 10}" class="g-rotulo" text-anchor="end">${ultimo.ppm} PPM</text>
    <line class="g-mira" y1="${m.t}" y2="${m.t + ih}" x1="0" x2="0" style="display:none"/>
    <rect x="${m.l}" y="${m.t}" width="${iw}" height="${ih}" fill="transparent" class="g-hit"/>
  </svg><div class="g-tip" hidden></div>`;
  const svg = $('svg', el), tip = $('.g-tip', el), mira = $('.g-mira', el);
  $('.g-hit', el).addEventListener('mousemove', ev => {
    const r = svg.getBoundingClientRect(), px = ((ev.clientX - r.left) / r.width) * W;
    const i = Math.max(0, Math.min(dados.length - 1, Math.round(((px - m.l) / iw) * (dados.length - 1))));
    const d = dados[i];
    mira.setAttribute('x1', x(i)); mira.setAttribute('x2', x(i)); mira.style.display = '';
    tip.hidden = false;
    tip.innerHTML = `<b>${d.ppm} PPM</b><span>${esc(d.titulo)}</span><small>${new Date(d.data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}${d.precisao ? ` · ${d.precisao}%` : ''}</small>`;
    const left = (x(i) / W) * r.width;
    tip.style.left = Math.min(r.width - 170, Math.max(0, left - 85)) + 'px';
    tip.style.top = Math.max(0, (y(d.ppm) / H) * r.height - 76) + 'px';
  });
  $('.g-hit', el).addEventListener('mouseleave', () => { tip.hidden = true; mira.style.display = 'none'; });
}

/* ================================ Turmas ================================ */
function abaTurmas() {
  const c = $('#conteudo');
  const escolas = [...new Set(P.turmas.map(t => t.escola).filter(Boolean))].sort((x, y) => x.localeCompare(y, 'pt-BR'));
  const grupos = escolas.concat(P.turmas.some(t => !t.escola) ? [''] : []);
  c.innerHTML = `<div class="cab-pg"><h1 class="titulo-pg">${icone('school', 'tit')} Turmas</h1></div>
    <section class="card">
      <h3>Criar nova turma</h3>
      <form id="f-nova" class="linha-form">
        <input name="escola" required maxlength="60" list="lista-escolas" placeholder="Escola (ex.: Colégio Estadual Machado de Assis)" value="${esc(escolas.length === 1 ? escolas[0] : '')}">
        <datalist id="lista-escolas">${escolas.map(e => `<option value="${esc(e)}">`).join('')}</datalist>
        <input name="nome" required maxlength="40" placeholder="Turma (ex.: 1º Ano A – Manhã)">
        <button class="bt">+ Criar turma</button>
      </form>
      <p class="muted mini">No primeiro acesso, o aluno escolhe a <b>escola</b> e a <b>turma</b> numa lista, digita o primeiro nome e o último sobrenome e cria uma senha. Escreva o nome da escola sempre igual, para as turmas ficarem juntas na lista.</p>
    </section>
    ${grupos.map(g => `<h2 class="secao">${g ? esc(g) : 'Sem escola'}</h2><div class="turmas-grid">${ordenarTurmas(P.turmas.filter(t => (t.escola || '') === g)).map(t => {
      const n = P.alunos.filter(a => a.turma === t.codigo).length;
      return `<div class="card turma"><h3>${esc(t.nome)}</h3>
        <p class="muted">${n} aluno(s) · criada em ${new Date(t.criadaEm).toLocaleDateString('pt-BR')}</p>
        <div class="acoes"><button class="bt sec pequeno" data-ver="${esc(t.codigo)}">${icone('eye')} Ver alunos</button><button class="bt perigo pequeno" data-excluir="${esc(t.codigo)}">${icone('trash-2')} Excluir</button></div></div>`;
    }).join('')}</div>`).join('') || '<p class="muted">Nenhuma turma criada ainda. Crie a primeira acima para os alunos conseguirem entrar.</p>'}`;
  $('#f-nova').onsubmit = async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const nome = f.get('nome').trim().replace(/\s+/g, ' '), escolaDigitada = f.get('escola').trim().replace(/\s+/g, ' ');
    const escola = escolas.find(x => x.toLowerCase() === escolaDigitada.toLowerCase()) || escolaDigitada;
    if (P.turmas.some(t => (t.escola || '').toLowerCase() === escola.toLowerCase() && t.nome.toLowerCase() === nome.toLowerCase())) { toast('Essa turma já existe nesta escola.', 'erro'); return; }
    try { const t = await criarTurma(nome, escola); P.turmas = [...P.turmas.filter(x => x.codigo !== t.codigo), t]; toast(`Turma <b>${esc(t.nome)}</b> criada!`, 'ok'); abaTurmas(); }
    catch (err) { toast('Erro ao criar turma: ' + esc(err.message), 'erro'); }
  };
  $$('[data-ver]', c).forEach(b => b.onclick = () => { P.turma = b.dataset.ver; P.aba = 'alunos'; render(); });
  $$('[data-excluir]', c).forEach(b => b.onclick = async () => {
    const n = P.alunos.filter(a => a.turma === b.dataset.excluir).length;
    if (!confirm(`Excluir esta turma?${n ? `\n\nAtenção: os ${n} aluno(s) desta turma não vão mais conseguir entrar, porque o login usa a turma. O progresso deles continua salvo.` : ''}`)) return;
    try { await excluirTurma(b.dataset.excluir); P.turmas = P.turmas.filter(t => t.codigo !== b.dataset.excluir); abaTurmas(); }
    catch (err) { toast('Erro: ' + esc(err.message), 'erro'); }
  });
}

/* ======================= Dados de exemplo (só no demo) ======================= */
async function gerarExemplo() {
  let t = P.turmas.find(x => x.codigo === 'DEMO');
  if (!t) { t = await criarTurma('1º Ano A', 'Escola Demonstração'); P.turmas = [...P.turmas.filter(x => x.codigo !== t.codigo), t]; }
  const nomes = ['Ana Beatriz Souza', 'Bruno Henrique Lima', 'Carla Mendes', 'Davi Oliveira', 'Eduarda Santos', 'Felipe Costa', 'Gabriela Rocha', 'Heitor Almeida', 'Isabela Ferreira', 'João Pedro Ribeiro', 'Larissa Gomes', 'Matheus Carvalho'];
  for (const [k, nome] of nomes.entries()) {
    const partes = nome.split(' '), primeiro = partes[0], ultimo = partes.at(-1);
    const uid = chaveAluno(primeiro, ultimo, t.codigo);
    const a = novoAluno({ uid, nome: `${primeiro} ${ultimo}`, primeiro, ultimo, email: uid + '@' + DOMINIO_LOGIN, escola: t.escola || '', turma: t.codigo, turmaNome: t.nome });
    definirSenhaDemo(uid, '1234');
    const nLic = Math.floor(Math.random() * LICOES.length * 0.9) + 1;
    const base = 8 + Math.random() * 12, sessoes = [];
    let tempo = Date.now() - 30 * DIA;
    LICOES.slice(0, nLic).forEach((l, i) => {
      tempo += Math.random() * 1.6 * DIA;
      const ppm = Math.round(base + i * (0.4 + Math.random() * 0.6) + (Math.random() - 0.5) * 6);
      const prec = Math.round((88 + Math.random() * 11.5) * 10) / 10;
      const est = prec >= 96 && ppm >= l.meta * 1.3 ? 3 : prec >= 92 && ppm >= l.meta ? 2 : 1;
      a.licoes[l.id] = { estrelas: est, ppm, precisao: prec, tentativas: 1 + Math.floor(Math.random() * 3), concluida: true, data: tempo };
      sessoes.push({ tipo: 'licao', ref: l.id, titulo: l.titulo, ppm, precisao: prec, seg: 90 + Math.round(Math.random() * 200), estrelas: est, data: tempo });
      a.dias.push(hoje(new Date(tempo)));
    });
    a.melhorPpm = Math.max(...sessoes.map(s => s.ppm));
    a.stats.tempo = sessoes.reduce((s, x) => s + x.seg, 0) + Math.random() * 1500;
    a.stats.acertos = Math.round(a.stats.tempo * 2.2); a.stats.erros = Math.round(a.stats.acertos * (0.03 + Math.random() * 0.07));
    for (const ch of 'açpqzxbn;é~'.split('')) if (Math.random() < 0.6) a.stats.errosTecla[codTecla(ch)] = Math.floor(Math.random() * 25) + 1;
    for (const j of JOGOS) if (Math.random() < 0.7) a.jogos[j.id] = { recorde: Math.floor(Math.random() * 900) + 50, partidas: 1 + Math.floor(Math.random() * 8) };
    a.xp = nLic * 45 + Math.floor(Math.random() * 300);
    a.ultimoAcesso = Date.now() - Math.random() * 12 * DIA;
    a.dias = [...new Set(a.dias)].sort();
    for (const cq of CONQUISTAS) if (cq.ok(a)) a.conquistas[cq.id] = Date.now();
    await salvarAluno(uid, a);
    await salvarRanking(uid, dadosRanking(a));
    for (const s of sessoes) await registrarSessao(uid, s);
  }
  toast('12 alunos de exemplo criados!', 'ok');
  carregar();
}

/* ================================ Fotos ================================ */
function atualizarSwitchFotos() {
  const sw = $('#sw-fotos'), caixa = $('#swf');
  if (!sw) return;
  sw.checked = P.fotosLiberadas !== false; sw.disabled = false;
  caixa.classList.toggle('desligado', !sw.checked);
  $('#swf-txt').textContent = sw.checked ? 'Alunos podem trocar a foto' : 'Troca de fotos desligada';
}

function abaFotos() {
  const c = $('#conteudo');
  const lista = P.alunos.filter(a => !P.turma || a.turma === P.turma).sort((x, y) => (x.nome || '').localeCompare(y.nome || '', 'pt-BR'));
  const comFoto = lista.filter(a => a.foto).length;
  c.innerHTML = `<div class="cab-pg"><h1 class="titulo-pg">${icone('camera', 'tit')} Fotos de perfil <small>${comFoto} de ${lista.length} com foto</small></h1></div>
    <section class="card config-fotos">
      <label class="interruptor" id="swf">
        <input type="checkbox" id="sw-fotos" role="switch">
        <span class="trilho" aria-hidden="true"><span class="bolinha"></span></span>
        <span class="sw-txt" id="swf-txt"></span>
      </label>
      <p class="muted mini">Desligado, nenhum aluno troca a foto. Você continua podendo trocar e remover qualquer foto aqui. Para um aluno só, use "Bloquear troca" no cartão dele.</p>
    </section>
    <div class="filtros">
      <button class="bt sec pequeno" id="ff-atualizar">${icone('refresh-cw')} Atualizar</button>
      <select id="ff-turma"><option value="">Todas as turmas</option>${ordenarTurmas(P.turmas).map(t => `<option value="${esc(t.codigo)}"${P.turma === t.codigo ? ' selected' : ''}>${esc(rotuloTurma(t))}</option>`).join('')}</select>
    </div>
    <div class="fotos-grid">${lista.map(a => `<div class="card foto-card" data-uid="${esc(a.uid)}">
        ${avatar(a.nome, a.foto, 'xg')}
        <b>${esc(a.nome)}</b><small class="muted">${esc(nomeTurma(a.turma))}</small>
        <div class="acoes">
          <label class="bt sec pequeno">${icone('folder-open')} Trocar<input type="file" accept="image/*" hidden data-trocar></label>
          <button class="bt perigo pequeno" data-remover${a.foto ? '' : ' disabled'}>Remover</button>
        </div>
        <label class="chk"><input type="checkbox" data-bloquear${a.fotoBloqueada ? ' checked' : ''}> ${icone('lock')} Bloquear troca</label>
      </div>`).join('') || '<p class="muted">Nenhum aluno nesta turma.</p>'}</div>`;
  atualizarSwitchFotos();
  $('#sw-fotos').onchange = async e => {
    const lib = e.target.checked; e.target.disabled = true;
    try { await definirFotos(lib); P.fotosLiberadas = lib; toast(lib ? 'Alunos já podem trocar a foto.' : 'Troca de fotos desligada para todos.', 'ok'); }
    catch (err) { console.error(err); toast('Não foi possível mudar. Confira se as regras novas do firestore.rules foram publicadas.', 'erro'); }
    atualizarSwitchFotos();
  };
  $('#ff-turma').onchange = e => { P.turma = e.target.value; abaFotos(); };
  $('#ff-atualizar').onclick = carregar;
  const alunoDe = el => P.alunos.find(a => a.uid === el.closest('.foto-card').dataset.uid);
  const trocar = async (a, foto) => {
    try { await salvarFoto(a.uid, foto); a.foto = foto; toast(foto ? `Foto de ${esc(a.nome)} trocada.` : `Foto de ${esc(a.nome)} removida.`, 'ok'); abaFotos(); }
    catch (err) { console.error(err); toast('Erro: ' + esc(err.message), 'erro'); }
  };
  $$('[data-trocar]', c).forEach(inp => inp.onchange = async () => {
    try { trocar(alunoDe(inp), await reduzirImagem(inp.files[0])); } catch (err) { toast(esc(err.message), 'erro'); }
  });
  $$('[data-remover]', c).forEach(b => b.onclick = () => trocar(alunoDe(b), ''));
  $$('[data-bloquear]', c).forEach(chk => chk.onchange = async () => {
    const a = alunoDe(chk);
    try { await bloquearFoto(a.uid, chk.checked); a.fotoBloqueada = chk.checked; toast(chk.checked ? `${esc(a.nome)} não pode mais trocar a foto.` : `${esc(a.nome)} pode trocar a foto de novo.`, 'ok'); }
    catch (err) { chk.checked = !chk.checked; toast('Erro: ' + esc(err.message), 'erro'); }
  });
}
