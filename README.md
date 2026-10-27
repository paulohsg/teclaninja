# ⌨️ TeclaNinja — Curso de Digitação ABNT2

Curso de digitação online, em português, para adolescentes. Tem 35 lições, 5 jogos, conquistas, ranking da turma e um painel para o professor acompanhar o progresso de cada aluno.

- **Alunos** entram somente com a conta Google.
- **O progresso** de cada aluno fica salvo na nuvem (Firebase).
- **O professor** acessa `professor.html` para ver a turma.

---

## O que tem no curso

| Módulo | Conteúdo |
|---|---|
| 🧘 Primeiros passos | Postura, posição das mãos, fileira base, mapa de dedos e ABNT2 |
| 🏠 Fileira base | F J · D K · S L · A Ç · G H · revisão |
| ⛰️ Fileira superior | E I · R U · T O · Q P · W Y · revisão |
| 🔽 Fileira inferior | V M · C , · N . · B X · Z ; · revisão do alfabeto |
| 🔠 Maiúsculas | Shift esquerdo, Shift direito, ? ! : |
| ✨ Acentuação ABNT2 | ´ (á é í ó ú) · ~ (ã õ) · ^ (â ê ô) · ` e ç |
| 🔢 Números e símbolos | 1–5 · 6–0 · @ # $ % & * ( ) - + = |
| 🚀 Textos | 6 textos curiosos para ganhar velocidade |

Em todas as lições o teclado na tela acende a próxima tecla e as mãos mostram qual dedo usar. O "modo ninja" esconde o teclado.

**Jogos:** Chuva de Meteoros, Defesa Galáctica, Corrida Turbo, Caça-Toupeiras e Desafio 60 segundos. Os jogos usam só as letras que o aluno já aprendeu.

**Estrelas:** passa com 85% de precisão. ⭐⭐ = 92% + a meta de PPM da lição. ⭐⭐⭐ = 96% + 30% acima da meta.

---

## Testar agora (modo demonstração)

Enquanto o Firebase não estiver configurado, o site funciona em **modo demonstração**: entra só com o nome, e os dados ficam salvos apenas no navegador. Serve para conhecer o curso.

O site precisa ser aberto por um servidor (abrir o arquivo com dois cliques não funciona). No computador, dentro da pasta `public`:

```
python -m http.server 8000
```

Depois abra http://localhost:8000. Na página do professor (http://localhost:8000/professor.html) há um botão **"Gerar alunos de exemplo"**.

---

## Colocar no ar com login Google (passo a passo)

O Firebase é um serviço do Google. O plano gratuito (Spark) é suficiente para várias turmas.

### 1. Criar o projeto
1. Acesse https://console.firebase.google.com e entre com sua conta Google.
2. Clique em **Adicionar projeto** → dê um nome (ex.: `teclaninja-escola`) → pode desativar o Google Analytics → **Criar projeto**.

### 2. Registrar o app Web
1. Na tela inicial do projeto, clique no ícone **`</>`** (Web).
2. Dê um apelido (ex.: `site`) e clique em **Registrar app**.
3. Vai aparecer um bloco `const firebaseConfig = { ... }`. Copie os valores para o arquivo **`public/js/config.js`**, substituindo os campos de exemplo.

### 3. Ativar o login com Google
1. Menu **Criação → Authentication → Vamos começar**.
2. Aba **Método de login** → **Google** → **Ativar** → escolha o e-mail de suporte → **Salvar**.

### 4. Criar o banco de dados
1. Menu **Criação → Firestore Database → Criar banco de dados**.
2. Local: **southamerica-east1 (São Paulo)**.
3. Escolha **modo de produção** → **Criar**.
4. Vá na aba **Regras**, apague tudo, cole o conteúdo do arquivo **`firestore.rules`** e clique em **Publicar**.

### 5. Definir o(s) professor(es)
O e-mail do professor precisa estar em **dois lugares** (já está preenchido com `paulo15356@go.docente.senai.br`):
- `public/js/config.js` → lista `PROFESSORES`
- `firestore.rules` → função `professor()` (lembre de publicar as regras de novo se mudar)

Opcional: em `config.js`, `DOMINIO_ALUNOS` aceita só contas de um domínio da escola (ex.: `"aluno.senai.br"`).

### 6. Publicar o site (Firebase Hosting)
Precisa do [Node.js](https://nodejs.org) instalado. No terminal, dentro da pasta `teclaninja`:

```
npm install -g firebase-tools
firebase login
firebase use --add        (escolha o projeto criado)
firebase deploy
```

No final aparece o endereço do site, algo como `https://teclaninja-escola.web.app`. O `firebase deploy` também publica as regras do banco.

> **Outra opção sem terminal:** arraste a pasta `public` em https://app.netlify.com/drop. Depois, no Firebase, vá em **Authentication → Configurações → Domínios autorizados** e adicione o endereço gerado pelo Netlify (ex.: `nome-aleatorio.netlify.app`).

---

## Primeira aula

1. Abra `https://SEU-SITE/professor.html` e entre com sua conta Google.
2. Na aba **Turmas**, crie a turma (ex.: "1º Ano A"). Aparece um **código** de 6 letras.
3. Passe o endereço do site e o código para os alunos.
4. Cada aluno entra com o Google e digita o código da turma no primeiro acesso.

## Painel do professor

- Resumo da turma: alunos ativos, % do curso concluído, PPM e precisão médios, tempo total.
- Tabela de alunos com ordenação (clique no título da coluna) e busca.
- Clique em um aluno para ver: gráfico da evolução da velocidade, estrelas em cada lição, teclas em que mais erra, jogos, conquistas e atividades recentes. Também dá para trocar o aluno de turma ou excluí-lo.
- **Exportar planilha (CSV)**: abre no Excel ou Google Planilhas.

---

## Dicas e problemas comuns

- **Teclado:** os alunos precisam estar com o layout **Português (Brasil ABNT2)** no sistema. Senão o Ç e os acentos não funcionam.
- **Celular/tablet:** o curso foi feito para teclado físico.
- **"Não foi possível carregar os dados" no painel:** o e-mail do professor não está nas regras do Firestore ou as regras não foram publicadas.
- **Login bloqueado com conta da escola:** algumas escolas (Google Workspace) bloqueiam apps de terceiros. Peça ao administrador da conta para permitir o app do Firebase, ou use `DOMINIO_ALUNOS` vazio.
- **Popup de login não abre:** permita popups para o site no navegador.

## Estrutura dos arquivos

```
teclaninja/
├── LEIA-ME.md
├── firebase.json        configuração do Firebase Hosting
├── firestore.rules      regras de segurança do banco
└── public/              o site
    ├── index.html       curso (alunos)
    ├── professor.html   painel do professor
    ├── css/style.css
    └── js/
        ├── config.js    ← SUAS CONFIGURAÇÕES
        ├── app.js       telas do aluno
        ├── professor.js painel do professor
        ├── licoes.js    conteúdo das lições (edite aqui para mudar textos)
        ├── jogos.js     os 5 jogos
        ├── motor.js     motor de digitação (PPM, precisão)
        ├── teclado.js   layout ABNT2, mapa de dedos, desenho do teclado e das mãos
        ├── progresso.js XP, níveis, estrelas e conquistas
        ├── store.js     login e banco de dados
        └── ui.js        utilidades (sons, tema, avisos)
```
