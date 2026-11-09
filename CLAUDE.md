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

## Stack e estrutura

Site estático **sem build**: HTML + CSS + ES modules em `public/`. Nada de npm/bundler no projeto.
Backend: **Firebase** (Auth + Firestore), SDK 10.12.2 importado dinamicamente de `gstatic.com` só quando
`config.js` está preenchido. Sem config → **modo demonstração** (tudo em `localStorage`, chaves `tn_demo_*`).

```
public/index.html, professor.html   páginas (curso do aluno / painel do professor)
public/css/style.css                todo o CSS (tokens claro/escuro no topo; blocos novos vão no FIM)
public/js/config.js                 config do Firebase + PROFESSORES (editado pelo professor no GitHub)
public/js/app.js                    telas do aluno (login, início, lição, jogos, conquistas, ranking, guia, pausa, foto)
public/js/professor.js              painel (alunos, detalhe, turmas, fotos, CSV, botão pausar, dados de exemplo)
public/js/store.js                  camada de dados: Firebase ou demo (login, alunos, sessões, turmas, ranking, config, fotos)
public/js/licoes.js                 MODULOS (16) e LICOES (87: l00–l86), palavras, frases, geradores de exercícios
public/js/progresso.js              XP, níveis, estrelas, conquistas, liberação de lições, dados do ranking
public/js/motor.js                  motor de digitação (PPM, precisão, dicas de dedo)
public/js/entrada.js                captura de texto por <textarea> invisível (ver "Acentos")
public/js/teclado.js                layout ABNT2, dedo de cada tecla, desenho do teclado e das mãos (SVG)
public/js/jogos.js                  5 jogos: chuva, galaxia, corrida, toupeira, teste
public/js/icones.js                 ícones Lucide (ISC) embutidos; icone('nome', 'classe')
public/js/ui.js                     $, esc, toast(msg, tipo, icone), modal, sons, tema, confete, reduzirImagem
firestore.rules                     regras de segurança (o professor cola no console do Firebase)
.github/workflows/pages.yml         publica public/ no GitHub Pages (conta do GitHub com pendência de cobrança: Actions bloqueado)
```

## Modelo de dados (Firestore)

- `alunos/{id}` — id do aluno = `primeiro.ultimo.codigoturma` (slug, sem acento). Professor (Google) usa o uid.
  Campos: nome, primeiro, ultimo, escola, turma (código), turmaNome, xp, melhorPpm, licoes{lXX:{estrelas,ppm,precisao,tentativas,concluida}},
  jogos{}, conquistas{}, dias[], stats{tempo,acertos,erros,errosTecla{u<codepoint>:n}}, foto (data URL JPEG), fotoBloqueada.
- `alunos/{id}/sessoes/*` — histórico de lições/jogos (gráfico do painel).
- `ranking/{id}` — cópia pública resumida (nome curto, foto, turma, xp, nível, melhorPpm, lições).
- `turmas/{codigo}` — {codigo, nome, escola}. Leitura pública (a tela de login lista escolas/turmas).
- `config/curso` — {liberado, fotosLiberadas}. Sem documento = tudo liberado.
- Login do aluno = Firebase e-mail/senha com e-mail interno `id@aluno.teclaninja.example` e senha `senha + '#TeclaNinja'`
  (Firebase exige 6+ caracteres; o aluno usa 4+). "Esqueceu a senha": professor exclui a conta no console
  (Authentication → Usuários) e o aluno refaz o "Primeiro acesso"; o progresso fica (o doc usa o mesmo id).

## Regras de negócio que já existem (não quebrar)

- Lições liberam em sequência (`licaoLiberada`); **professor tem tudo liberado** e todas as letras nos jogos.
- Estrelas: passa com 85% de precisão; 2★ = 92% + meta PPM; 3★ = 96% + meta×1,3. Meta por lição em `licoes.js`.
- Curso pausado: aluno vê a tela "O curso está pausado" em tempo real; as regras do Firestore negam salvar progresso
  (`cursoLiberado()`), mas permitem criar o perfil no primeiro acesso.
- Fotos: aluno troca pelo menu; professor troca/remove/bloqueia na aba Fotos e pode desligar para todos.
  **O app do aluno nunca grava `foto`/`fotoBloqueada` junto com o progresso** (`semFoto()` em app.js) — senão
  desfaz a troca feita pelo professor. As regras exigem que a foto do ranking seja igual à do perfil.
- Escrever no ranking nunca pode derrubar a sessão: sempre `.catch()` silencioso.
- Lições do tipo `palavras` sorteiam palavras sem repetir; `teclas`/`revisao` geram exercícios; `texto`/`teoria` têm `exercicios` fixos.

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

## Depois de mudar algo

- Mudou `firestore.rules`? **Avise o professor** para copiar o arquivo e publicar em Firestore Database → Regras.
- Mudou só `public/`? Basta enviar para a `main`; peça para os alunos recarregarem com Ctrl+Shift+R.
- Publicação: GitHub Pages está configurado, mas o GitHub Actions da conta do professor estava bloqueado por
  pendência de cobrança; a alternativa sugerida foi Netlify ligado ao repositório (publish directory `public`).
  Confirme com o professor onde o site está hospedado antes de falar de deploy.

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
5. Sempre conferir: lições com acento (l22–l26), os 5 jogos, painel em 1366/1280/1024 px sem texto cortado,
   celular 390 px sem rolagem horizontal, modo escuro, e — se mexer em regras — tentativas de burla devem dar `permission-denied`.
