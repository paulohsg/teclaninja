# TeclaNinja — guia para o Claude

Curso de digitação online no teclado **ABNT2**, todo em português, para adolescentes de 14 a 16 anos.
O dono do repositório é o professor (Paulo, SENAI). Ele não é programador: responda em **português**,
com linguagem simples, e diga sempre o que ele precisa fazer no Firebase/GitHub (passo a passo, com
nomes de menus). O `README.md` é o guia para humanos; este arquivo é o contexto técnico para o Claude.

## Contexto de uso (importante)

- Alunos usam **Chromebooks simples da Samsung** (teclado ABNT2, ChromeOS, tela baixa ~1366×650 útil).
  Toda mudança visual deve caber nessa tela. Testar sempre em 1366×650.
- Contas Google dos alunos (`@aluno.educa.go.gov.br`, Seduc-GO) **bloqueiam login em apps de terceiros**
  (menores de 18). Por isso alunos **não** usam Google: entram com escola + turma + primeiro nome +
  último sobrenome + senha. Professores entram com Google.
- Alunos de Goiás: textos e exemplos podem citar Goiás, Goiânia, Cerrado, pequi etc.
- O professor pausa o curso fora da aula (botão no painel) para os alunos não fazerem em casa pelo celular.
- Os alunos jogam muito Roblox: jogos e avatar têm estética de blocos, mas com desenho e nomes próprios
  (nunca usar nome, logo, personagens ou arte de jogos existentes).

## Stack e estrutura

Site estático **sem build**: HTML + CSS + ES modules em `public/`. Nada de npm/bundler no projeto.
Backend: **Firebase** (Auth + Firestore), SDK 10.12.2 importado dinamicamente de `gstatic.com` só quando
`config.js` está preenchido. Sem config → **modo demonstração** (tudo em `localStorage`, chaves `tn_demo_*`).

```
public/index.html, professor.html   páginas (curso do aluno / painel do professor)
public/css/style.css                todo o CSS (tokens claro/escuro no topo; blocos novos vão no FIM)
public/js/config.js                 config do Firebase + PROFESSORES (editado pelo professor no GitHub)
public/js/app.js                    telas do aluno (login, início, lição, jogos, avatar/loja, conquistas, ranking, guia, pausa, foto)
public/js/professor.js              painel (alunos, detalhe, turmas, primeiro acesso, fotos, CSV, botão pausar, dados de exemplo)
public/js/store.js                  camada de dados: Firebase ou demo (login, alunos, sessões, turmas, ranking, config, fotos)
public/js/licoes.js                 MODULOS (16) e LICOES (87: l00–l86), palavras, frases, geradores de exercícios
public/js/progresso.js              XP, níveis, estrelas, moedas, conquistas, liberação de lições, soProgresso(), dados do ranking
public/js/avatar.js                 avatar de blocos: CATEGORIAS, ITENS (preço/requisito), formas(), avatarSvg(), desenharAvatar()
public/js/motor.js                  motor de digitação (PPM, precisão, dicas de dedo)
public/js/entrada.js                captura de texto por <textarea> invisível (ver "Acentos")
public/js/teclado.js                layout ABNT2, dedo de cada tecla, desenho do teclado e das mãos (SVG)
public/js/jogos.js                  6 jogos: parkour (novo, usa o avatar), chuva, galaxia, corrida, toupeira, teste
public/js/icones.js                 ícones Lucide (ISC) embutidos; icone('nome', 'classe')
public/js/ui.js                     $, esc, toast(msg, tipo, icone), modal, sons, tema, confete, reduzirImagem
firestore.rules                     regras de segurança (o professor cola no console do Firebase)
```

## Modelo de dados (Firestore)

- `alunos/{id}` — id do aluno = `primeiro.ultimo.codigoturma` (slug, sem acento). Professor (Google) usa o uid.
  Campos: nome, primeiro, ultimo, escola, turma (código), turmaNome, xp, melhorPpm, licoes{lXX:{estrelas,ppm,precisao,tentativas,concluida}},
  jogos{id:{recorde,partidas,...extras}}, conquistas{}, dias[], stats{tempo,acertos,erros,errosTecla{u<codepoint>:n}},
  moedas, avatar{pele,rosto,chapeu,camisa,calca,costas} (ids de ITENS), itens[] (comprados), foto (data URL JPEG), fotoBloqueada.
  Extras de jogos: `parkour.estagio` (maior estágio), `galaxia.chefao`, `corrida.venceuDificil` (números só sobem, marcas não voltam a falso).
- `alunos/{id}/sessoes/{sid}` — histórico de lições/jogos (gráfico do painel). `sid` é gerado no aparelho (reenvio não duplica).
- `ranking/{id}` — cópia resumida (uid, nome curto, foto, turma, xp, nivel, melhorPpm, licoes, avatar). Só esses campos.
- `turmas/{codigo}` — {codigo, nome, escola}. Leitura pública (a tela de login lista escolas/turmas).
- `config/curso` — {liberado, fotosLiberadas, cadastroLiberado}. Sem documento (ou sem o campo) = liberado.
- Login do aluno = Firebase e-mail/senha com e-mail interno `id@aluno.teclaninja.example` e senha `senha + '#TeclaNinja'`
  (Firebase exige 6+ caracteres; o aluno usa 4+). "Esqueceu a senha": professor exclui a conta no console
  (Authentication → Usuários) e o aluno refaz o "Primeiro acesso"; o progresso fica (o doc usa o mesmo id).

## Regras de negócio que já existem (não quebrar)

- Lições liberam em sequência (`licaoLiberada`); **professor tem tudo liberado** e todas as letras nos jogos.
- Estrelas: passa com 85% de precisão; 2★ = 92% + meta PPM; 3★ = 96% + meta×1,3. Meta por lição em `licoes.js`.
- Curso pausado: aluno vê a tela "O curso está pausado" em tempo real; as regras do Firestore negam salvar progresso
  (`cursoLiberado()`), mas permitem criar o perfil no primeiro acesso.
- Fotos: aluno troca pelo menu; professor troca/remove/bloqueia na aba Fotos e pode desligar para todos.
  **O aluno só grava `soProgresso(a)`** (progresso.js: xp, melhorPpm, licoes, jogos, conquistas, dias, stats, moedas,
  avatar, itens, ultimoAcesso) — nunca foto, nome, turma ou escola. Senão desfaz a troca feita pelo professor e as
  regras recusam. O perfil completo só é gravado no primeiro acesso (create).
- Primeiro acesso: botão na aba Turmas (`config/curso.cadastroLiberado`). Fechado = regras negam criar `alunos/{id}`;
  o app checa antes de criar a conta no Auth (`lerConfig()`), para não sobrar login sem perfil.
- Salvamento com fila (app.js `salvarTudo`/`enviarPendentes`): progresso + sessões vão para `localStorage`
  (`tn_pend_<uid>`) e são enviados com prazo de 8 s (o SDK do Firestore não dá erro offline, só espera).
  Reenvia no evento `online` e no próximo login. Sessão já enviada dá permission-denied no reenvio e é descartada.
- Moedas: lição = 2 + 5 por estrela nova; jogo = até 40 pelos pontos + até 60 coletadas no jogo (`r.moedas`).
  Só compram itens visuais do avatar. Itens com `req` (nível/conquista) não se compram.
- Escrever no ranking nunca pode derrubar a sessão: sempre `.catch()` silencioso.
- Lições do tipo `palavras` sorteiam palavras sem repetir; `teclas`/`revisao` geram exercícios; `texto`/`teoria` têm `exercicios` fixos.

## Regras do Firestore (o que já está protegido — testar se mexer)

- Ranking: leitura só da própria turma (`resource.data.turma == meuDoc().turma`; a consulta precisa ter
  `where('turma','==',...)`) ou professor. Escrita: campos fixos, xp/melhorPpm/foto/turma iguais ao perfil,
  `nome` = primeiro nome do perfil + inicial (`Ana S.`).
- Perfil (create pelo aluno): só com cadastro liberado, nome só com letras, turma = código do id e existente, xp 0.
- Perfil (update pelo aluno): curso liberado, não muda nome/turma/escola/uid/email, xp inteiro que só sobe (até +2000
  por gravação), melhorPpm ≤ 250, moedas ≥ 0, regras de foto.
- `aluno(id)` = e-mail interno `id@aluno.teclaninja.example`. Conta Google que não é professor não grava nada.
- Testes de regras: script com o SDK `firebase` no Node contra o emulador (tentativas válidas e de burla).

## Acentos e Chromebook (bug já corrigido — não voltar atrás)

No ChromeOS (e em outros sistemas), ´ + a = á chega como **texto composto**, não como `keydown`.
Por isso `entrada.js` mantém um `<textarea>` invisível focado (`focus({preventScroll:true})`) e entrega o texto
pelos eventos `input`/`compositionend`; o `keydown` serve só para saber a tecla física (acender o teclado).
Colar (`insertFromPaste`) é ignorado. **Nunca** voltar a ler letras só por `keydown`/`e.key`.

## Convenções

- Interface, comentários e textos em **português do Brasil**; nomes de funções em português (já é o padrão).
- **Sem emojis na interface.** Use `icone('nome')` de `icones.js`. Para um ícone novo: pegue o SVG em
  `lucide-static` (npm pack lucide-static@0.460.0) e acrescente ao objeto `I`.
- CSS: cores só por tokens (`--primaria`, `--texto`, `--muted`, `--surface`...), definidos para claro e escuro.
  Textos que podem crescer (nomes de alunos/escolas) precisam de `min-width: 0` no pai e `overflow-wrap: anywhere`.
- Conteúdo de lições: grafia correta (palavras sem acento só onde a grafia correta não tem acento),
  fatos verificáveis e adequados à idade. Todo caractere precisa ser digitável no ABNT2 (`passos(ch)` não vazio).
- Ao adicionar lições: ids sequenciais (`l87`…), módulo existente ou novo em `MODULOS`, `meta` coerente;
  alunos que já concluíram continuam na próxima. A conquista "Formado!" depende de `LICOES.length`.
- Commits em português, autor "Paulo" (o e-mail do professor já está em `config.js`). Trabalhar direto na `main`
  (o site é publicado a partir dela). Não versionar `teclaninja.zip`.
- Jogos: cada jogo é `fn(el, ctx)` → `{ destruir }` e chama `ctx.onFim({pontos, acertos, erros, errosTecla, seg,
  moedas?, detalhe, extra?})`. `ctx.avatar` traz o avatar do aluno. O palco precisa caber em 1366×650
  (`.jogo-pg .palco` usa `calc(100vh - 190px)`). Itens novos do avatar: acrescentar em `ITENS` e desenhar em `formas()`.

## Depois de mudar algo

- Mudou `firestore.rules`? **Avise o professor** para copiar o arquivo e publicar em Firestore Database → Regras.
- Mudou só `public/`? Basta enviar para a `main`; peça para os alunos recarregarem com Ctrl+Shift+R.
- Publicação: **Netlify** (https://teclaninja.netlify.app), ligado ao repositório, publica a pasta `public` a cada
  envio para a `main`. O workflow do GitHub Pages foi removido (o Actions da conta estava bloqueado).

## Como testar

Não há suíte de testes no repositório; testamos com **Playwright** (já instalado no ambiente: `require('playwright')`).

1. Servidor local: `cd public && python3 -m http.server 8765`.
2. **Modo demonstração**: como `config.js` está preenchido, intercepte-o no teste
   (`ctx.route('**/js/config.js', ...)` devolvendo `apiKey: "COLE_AQUI"`). Professor demo: botão `#demo`;
   "Gerar alunos de exemplo" (`#bt-exemplo`) popula o painel. Turma demo: escola "Escola Demonstração", turma "1º Ano A".
3. **Firebase real (emuladores)**: `npm pack firebase-tools` / `npx firebase emulators:start --only auth,firestore
   --project demo-teclaninja` (Java já existe) com `firestore.rules` copiado. No teste, intercepte `config.js`
   (projectId `demo-teclaninja`), sirva o SDK de um `npm pack firebase@10.12.2` no lugar de `gstatic.com`
   (bloqueado pelo proxy) e injete `connectAuthEmulator`/`connectFirestoreEmulator` em `store.js`.
   Professor no emulador: `signInWithCredential(GoogleAuthProvider.credential('{"sub":"p1","email":"<e-mail de PROFESSORES>","email_verified":true}'))`.
4. Digitação: `page.keyboard.type(ch)` serve para letras/ç; para acentos simule o Chromebook via CDP:
   `Input.imeSetComposition({text:'´'})` e depois `Input.insertText({text:'á'})`.
5. Sempre conferir: lições com acento (l22–l26), os 6 jogos e a tela Avatar, painel em 1366/1280/1024 px sem texto cortado,
   celular 390 px sem rolagem horizontal, modo escuro, e — se mexer em regras — tentativas de burla devem dar `permission-denied`.
