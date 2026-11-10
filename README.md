# ⌨️ TeclaNinja — Curso de Digitação ABNT2

Curso de digitação online, em português, para adolescentes. Tem 87 lições, 6 jogos, um avatar de blocos personalizável (com loja de itens), conquistas, ranking da turma e um painel para o professor acompanhar o progresso de cada aluno.

Site no ar: **https://teclaninja.netlify.app** (painel do professor: https://teclaninja.netlify.app/professor.html).

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
| 🧩 Combinações difíceis | NH, LH, CH · ÃO/ÕES · QU/GU · RR/SS · Ç com acentos · só mão esquerda · só mão direita |
| 🗂️ Palavras temáticas | esportes, animais do Brasil, comidas, tecnologia, profissões, natureza, música, escola |
| 💬 Frases do dia a dia | ditados, frases motivacionais, perguntas, diálogos com aspas, mensagens, pontuação completa |
| 🧮 Números no mundo real | datas e horários, dinheiro, endereços, e-mails e sites, contas, receita |
| 🔬 Textos: ciência e natureza | corpo humano, água, fotossíntese, Sistema Solar, dinossauros, animais |
| 🇧🇷 Textos: Brasil e história | indígenas, Independência, abolição, Brasília e Goiânia, Cerrado, festas |
| 🌍 Textos: tecnologia e mundo | computadores, segurança na internet, teclado, IA, Olimpíadas, espaço |
| 🏆 Desafios finais | 6 textos longos (5 partes cada), com metas de 34 a 40 PPM |

Em todas as lições o teclado na tela acende a próxima tecla e as mãos mostram qual dedo usar. O "modo ninja" esconde o teclado.

**Jogos:** os jogos usam só as letras que o aluno já aprendeu, e as lições de palavras sorteiam palavras diferentes a cada tentativa.

| Jogo | Como funciona |
|---|---|
| Parkour Ninja (novo) | O avatar do aluno corre numa pista de obstáculos de blocos. Digitar a palavra do obstáculo faz ele pular; quem digita antes corre em turbo. Bandeiras salvam o estágio; quem cai volta para a última bandeira. |
| Chuva de Meteoros | Letras caindo. Meteoros especiais (vida, congelar, bomba) e, a partir do nível 3, o Super Meteoro com uma palavra inteira. |
| Defesa Galáctica | Naves com palavras. Nave verde devolve um escudo, multiplicador para palavras sem erro e a Nave-mãe (chefão) a cada 4 ondas. |
| Corrida Turbo | Corrida contra 3 robôs digitando uma frase. 15 acertos seguidos ligam o nitro (pontos extras). |
| Caça-Toupeiras | Toupeiras nas teclas, com níveis, várias toupeiras ao mesmo tempo, toupeira dourada (+2 s) e bombas (tiram pontos e tempo). |
| Desafio 60 segundos | Teste de velocidade (PPM). |

**Avatar e moedas:** cada aluno monta um boneco de blocos (pele, rosto, cabeça, camisa, calça e costas) no menu **Avatar**. As moedas vêm das lições (2 por tentativa + 5 por estrela nova) e dos jogos. Alguns itens se compram com moedas; outros são liberados por nível ou conquista (ex.: a coroa só para quem termina o Desafio final). O avatar aparece no ranking e corre no Parkour Ninja. As moedas só servem para itens visuais: não mudam nota, XP ou ranking.

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


### 6. Publicar o site (Netlify)
O site está no **Netlify** (https://teclaninja.netlify.app), ligado a este repositório do GitHub: **toda mudança enviada para a `main` é publicada sozinha** em 1 ou 2 minutos (pasta publicada: `public`).

Para o login funcionar no Netlify, o endereço precisa estar liberado no Firebase (já deve estar feito; confira se o login do professor der erro de domínio):
1. No Firebase, menu **Criação → Authentication → Configurações → Domínios autorizados**.
2. **Adicionar domínio** → `teclaninja.netlify.app` → **Adicionar**.

> Depois de uma atualização, peça aos alunos para recarregar a página com **Ctrl + Shift + R**.

---

## Primeira aula

1. Abra `https://SEU-SITE/professor.html` e entre com sua conta Google.
2. Na aba **Turmas**, crie as turmas informando a **escola** e o **nome da turma** (ex.: "Colégio Estadual Machado de Assis" + "1º Ano A"). Escreva o nome da escola sempre igual.
3. Ainda na aba **Turmas**, confira se o botão **Primeiro acesso** está **liberado**.
4. Passe o endereço do site para os alunos.
5. No **Primeiro acesso**, cada aluno escolhe a escola e a turma na lista, digita o **primeiro nome** e o **último sobrenome** e cria uma **senha de pelo menos 4 caracteres**.
6. Depois que a turma toda se cadastrar, **feche o Primeiro acesso** (aba Turmas). Assim ninguém consegue se cadastrar com o nome de um colega nem criar contas de fora da escola.
7. Nas próximas vezes, o aluno usa a aba **Entrar** com os mesmos dados. Acentos e maiúsculas não fazem diferença ("João" = "joao").

> Dois alunos com o mesmo primeiro nome e último sobrenome na mesma turma: o segundo pode usar o nome do meio no lugar do sobrenome.

### Primeiro acesso (cadastro de alunos novos)
Na aba **Turmas** há um botão **liga/desliga** do Primeiro acesso:
- **Liberado:** alunos novos conseguem se cadastrar.
- **Fechado:** a aba "Primeiro acesso" da tela de login mostra um aviso e o banco de dados recusa cadastros novos. Quem já tem cadastro entra normalmente.

Deixe liberado só enquanto a turma se cadastra (ou quando alguém precisa refazer a senha) e feche depois.

### Pausar o curso fora da aula
No topo do painel do professor há um botão **liga/desliga** ("Curso liberado" / "Curso pausado"). Ele vale para **todos os alunos** e muda na hora:
- **Pausado:** os alunos veem a tela "O curso está pausado" e não conseguem fazer lições nem jogos. Quem estiver no meio de uma lição é interrompido. Mesmo que alguém tente burlar pelo navegador, o banco de dados recusa salvar progresso.
- **Liberado:** a tela dos alunos volta sozinha, sem precisar recarregar a página.
- Com o curso pausado, alunos novos ainda conseguem fazer o primeiro acesso (só o cadastro).

### Fotos de perfil
- O aluno troca a própria foto pelo menu do nome (canto superior direito) → **📷 Trocar foto**. A imagem é reduzida para uma miniatura e aparece no topo e no ranking da turma.
- No painel, a aba **📷 Fotos** mostra as fotos de todos os alunos. Ali você pode:
  - **Trocar** ou **Remover** a foto de qualquer aluno (a mudança aparece para ele na hora);
  - **Bloquear troca** de um aluno específico;
  - desligar a troca de fotos para **todos** com o botão do topo da aba.
- As regras do banco garantem isso: com bloqueio, o aluno não consegue trocar a foto nem pelo navegador.

### Professor praticando
Entrando no curso (`index.html`) com a sua conta Google de professor, todas as lições e todas as letras dos jogos ficam liberadas, e o botão de pausa não bloqueia você.

### Quando um aluno esquece a senha
1. No painel do professor, clique no aluno e abra **"O aluno esqueceu a senha?"**. Copie o login que aparece ali.
2. No Firebase, vá em **Authentication → Usuários**, cole o login na busca, clique nos três pontinhos (⋮) → **Excluir conta**.
3. Libere o **Primeiro acesso** (aba Turmas), se estiver fechado.
4. O aluno faz o **Primeiro acesso** de novo, com o mesmo nome, sobrenome e turma, e cria outra senha. **O progresso é mantido.** Depois, feche o Primeiro acesso de novo.

## Painel do professor

- Resumo da turma: alunos ativos, % do curso concluído, PPM e precisão médios, tempo total.
- Tabela de alunos com ordenação (clique no título da coluna) e busca.
- **Filtro de turma:** com uma turma escolhida, o painel lê só os alunos dela (abre mais rápido e gasta menos a cota gratuita do Firebase). O painel lembra a última turma escolhida. "Todas as turmas" lê todos os alunos.
- Clique em um aluno para ver: avatar, gráfico da evolução da velocidade, estrelas em cada lição, teclas em que mais erra, jogos, conquistas e atividades recentes. Também dá para excluí-lo.
- **Excluir aluno** apaga o progresso, mas o login dele continua no Firebase. O painel mostra o passo a passo para apagar o login também (Authentication → Usuários).
- **Exportar planilha (CSV)**: abre no Excel ou Google Planilhas.

### Segurança (o que as regras do banco garantem)
- Cada aluno só vê o **ranking da própria turma**. Pessoas de fora não veem nomes nem fotos.
- O aluno não consegue mudar o próprio nome, turma ou escola, nem colocar um nome qualquer no ranking.
- O XP só sobe aos poucos e o ranking precisa ser igual ao perfil, então "trapacear" pelo navegador não leva ninguém ao topo.
- Com o **Primeiro acesso fechado**, ninguém novo consegue se cadastrar.

> Limite: como o curso roda no navegador, um aluno muito esperto ainda consegue marcar lições como feitas pelo console do navegador. As regras impedem que isso vire XP alto de uma vez nem apareça como nome falso no ranking.

---

## Dicas e problemas comuns

- **Teclado:** os alunos precisam estar com o layout **Português (Brasil ABNT2)** no sistema. Senão o Ç e os acentos não funcionam.
- **Chromebook:** em *Configurações → Dispositivo → Teclado e entradas → Métodos de entrada*, deixe **Português (Brasil)** como método ativo. Os acentos funcionam normalmente (´ + a = á). A tecla de "Caps Lock" do teclado na tela corresponde à tecla de pesquisa/iniciador do Chromebook.
- **Celular/tablet:** o curso foi feito para teclado físico.
- **"Não foi possível carregar os dados" no painel:** o e-mail do professor não está nas regras do Firestore ou as regras não foram publicadas.
- **Aluno vê "O login por senha ainda não foi ativado":** falta ativar o provedor **E-mail/senha** (Parte 3).
- **A lista de escolas aparece vazia ou com erro:** crie uma turma no painel e confira se as regras do `firestore.rules` foram publicadas (Parte 4).
- **O botão liga/desliga mostra erro:** as regras novas do `firestore.rules` não foram publicadas (Parte 4).
- **Excluir uma turma:** os alunos dela deixam de conseguir entrar, porque o login usa a turma. O progresso continua salvo. (Pelo mesmo motivo não dá para trocar um aluno de turma: ele precisaria se cadastrar de novo na turma nova.)
- **"O primeiro acesso está fechado" na tela do aluno:** libere o Primeiro acesso na aba Turmas.
- **"Sem conexão agora. Seu resultado ficou guardado neste computador":** a internet caiu no fim da lição ou do jogo. O resultado fica guardado no navegador e é enviado sozinho quando a internet volta (ou na próxima vez que o aluno entrar no mesmo computador).
- **O ranking aparece vazio ou com erro depois de uma atualização:** as regras novas do `firestore.rules` não foram publicadas (Parte 4).
- **Popup de login do professor não abre:** permita popups para o site no navegador.

## Estrutura dos arquivos

```
teclaninja/
├── README.md            este guia
├── firebase.json        configuração do Firebase (regras do banco)
├── firestore.rules      regras de segurança do banco (copiar no console do Firebase)
└── public/              o site (é esta pasta que o Netlify publica)
    ├── index.html       curso (alunos)
    ├── professor.html   painel do professor
    ├── css/style.css
    └── js/
        ├── config.js    ← SUAS CONFIGURAÇÕES
        ├── app.js       telas do aluno (lições, jogos, avatar, ranking)
        ├── professor.js painel do professor
        ├── licoes.js    conteúdo das lições (edite aqui para mudar textos)
        ├── jogos.js     os 6 jogos
        ├── avatar.js    avatar de blocos: itens da loja, preços e desenho
        ├── motor.js     motor de digitação (PPM, precisão)
        ├── entrada.js   captura do que o aluno digita (acentos no Chromebook)
        ├── teclado.js   layout ABNT2, mapa de dedos, desenho do teclado e das mãos
        ├── progresso.js XP, níveis, estrelas, moedas e conquistas
        ├── store.js     login e banco de dados
        ├── icones.js    ícones (Lucide)
        └── ui.js        utilidades (sons, tema, avisos)
```
