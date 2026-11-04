# ⌨️ TeclaNinja — Curso de Digitação ABNT2

Curso de digitação online, em português, para adolescentes. Tem 35 lições, 5 jogos, conquistas, ranking da turma e um painel para o professor acompanhar o progresso de cada aluno.

- **Alunos** entram com **escola, turma, primeiro nome, último sobrenome e senha** (não precisam de conta Google).
- **Professores** entram com a conta Google.
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

## Colocar no ar (passo a passo)

O Firebase é um serviço do Google. O plano gratuito (Spark) é suficiente para várias turmas.

### 1. Criar o projeto
1. Acesse https://console.firebase.google.com e entre com sua conta Google.
2. Clique em **Adicionar projeto** → dê um nome (ex.: `teclaninja-escola`) → pode desativar o Google Analytics → **Criar projeto**.

### 2. Registrar o app Web
1. Na tela inicial do projeto, clique no ícone **`</>`** (Web).
2. Dê um apelido (ex.: `site`) e clique em **Registrar app**.
3. Vai aparecer um bloco `const firebaseConfig = { ... }`. Copie os valores para o arquivo **`public/js/config.js`**, substituindo os campos de exemplo.

### 3. Ativar os métodos de login
São dois: **E-mail/senha** (alunos) e **Google** (professor).

1. Menu **Criação → Authentication → Vamos começar**.
2. Aba **Método de login** → **Adicionar novo provedor** → **E-mail/senha** → ative só a primeira chave (**E-mail/senha**; deixe "Link do e-mail" desligado) → **Salvar**.
3. **Adicionar novo provedor** → **Google** → **Ativar** → escolha o e-mail de suporte → **Salvar**.

> Os alunos não usam e-mail de verdade. O site cria um login interno no formato `nome.sobrenome.codigo@aluno.teclaninja.example`, que nunca recebe mensagens.

### 4. Criar o banco de dados
1. Menu **Criação → Firestore Database → Criar banco de dados**.
2. Local: **southamerica-east1 (São Paulo)**.
3. Escolha **modo de produção** → **Criar**.
4. Vá na aba **Regras**, apague tudo, cole o conteúdo do arquivo **`firestore.rules`** e clique em **Publicar**.
   - Sempre que o arquivo `firestore.rules` mudar no repositório, copie e publique de novo.

### 5. Definir o(s) professor(es)
O e-mail do professor precisa estar em **dois lugares** (já está preenchido com `paulo15356@go.docente.senai.br`):
- `public/js/config.js` → lista `PROFESSORES`
- `firestore.rules` → função `professor()` (lembre de publicar as regras de novo se mudar)


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
2. Na aba **Turmas**, crie as turmas informando a **escola** e o **nome da turma** (ex.: "Colégio Estadual Machado de Assis" + "1º Ano A"). Escreva o nome da escola sempre igual.
3. Passe o endereço do site para os alunos.
4. No **Primeiro acesso**, cada aluno escolhe a escola e a turma na lista, digita o **primeiro nome** e o **último sobrenome** e cria uma **senha de pelo menos 4 caracteres**.
5. Nas próximas vezes, o aluno usa a aba **Entrar** com os mesmos dados. Acentos e maiúsculas não fazem diferença ("João" = "joao").

> Dois alunos com o mesmo primeiro nome e último sobrenome na mesma turma: o segundo pode usar o nome do meio no lugar do sobrenome.

### Quando um aluno esquece a senha
1. No painel do professor, clique no aluno e abra **"O aluno esqueceu a senha?"**. Copie o login que aparece ali.
2. No Firebase, vá em **Authentication → Usuários**, cole o login na busca, clique nos três pontinhos (⋮) → **Excluir conta**.
3. O aluno faz o **Primeiro acesso** de novo, com o mesmo nome, sobrenome e turma, e cria outra senha. **O progresso é mantido.**

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
- **Aluno vê "O login por senha ainda não foi ativado":** falta ativar o provedor **E-mail/senha** (Parte 3).
- **A lista de escolas aparece vazia ou com erro:** crie uma turma no painel e confira se as regras do `firestore.rules` foram publicadas (Parte 4).
- **Excluir uma turma:** os alunos dela deixam de conseguir entrar, porque o login usa a turma. O progresso continua salvo.
- **Popup de login do professor não abre:** permita popups para o site no navegador.

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
