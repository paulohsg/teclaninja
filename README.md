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

**Jogos ao vivo (a turma inteira ao mesmo tempo):** o professor abre a sala no painel e os alunos entram pela tela de Jogos.

| Jogo ao vivo | Como funciona |
|---|---|
| Corrida ao vivo | Todos digitam o mesmo texto ao mesmo tempo. Cada aluno vê o avatar dos colegas correndo e a sua posição; no fim aparece o pódio. |
| Batalha de equipes | A turma é dividida em Time Azul e Time Vermelho. Cada palavra certa manda tropas contra a base do outro time; 10 palavras seguidas sem erro dobram o ataque. Vence quem derrubar a base inimiga ou estiver na frente quando o tempo acabar. A conta usa a média por aluno, então times de tamanhos diferentes são justos. |

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
O e-mail do professor precisa estar em **três lugares** (já está preenchido com `paulo15356@go.docente.senai.br`):
- `public/js/config.js` → lista `PROFESSORES`
- `firestore.rules` → função `professor()` (lembre de publicar as regras de novo se mudar)
- `database.rules.json` → as três linhas com o e-mail (regras dos jogos ao vivo; publicar de novo se mudar)


### 6. Publicar o site (Netlify)
O site está no **Netlify** (https://teclaninja.netlify.app), ligado a este repositório do GitHub: **toda mudança enviada para a `main` é publicada sozinha** em 1 ou 2 minutos (pasta publicada: `public`).

Para o login funcionar no Netlify, o endereço precisa estar liberado no Firebase (já deve estar feito; confira se o login do professor der erro de domínio):
1. No Firebase, menu **Criação → Authentication → Configurações → Domínios autorizados**.
2. **Adicionar domínio** → `teclaninja.netlify.app` → **Adicionar**.

> Depois de uma atualização, peça aos alunos para recarregar a página com **Ctrl + Shift + R**.

---

### 7. Jogos ao vivo: configurar o Realtime Database
Os jogos ao vivo usam o **Realtime Database**, um segundo banco do Firebase (grátis), feito para atualizações rápidas. Precisa ser criado uma vez só:

1. Acesse https://console.firebase.google.com e abra o projeto **teclaninja-escola**.
2. No menu da esquerda, clique em **Criação → Realtime Database** (se não aparecer, clique em **Todos os produtos** e procure "Realtime Database").
3. Clique em **Criar banco de dados**.
4. Em **Local do Realtime Database**, escolha **Estados Unidos (us-central1)** → **Próxima**. (Não existe opção no Brasil; os Estados Unidos são os mais perto e funcionam bem.)
5. Em **Regras de segurança**, escolha **Iniciar no modo bloqueado** → **Ativar**.
6. Na aba **Dados**, o endereço do banco aparece no topo, algo como `https://teclaninja-escola-default-rtdb.firebaseio.com/`. Ele precisa ser igual ao campo `databaseURL` do arquivo `public/js/config.js` (já está preenchido com esse endereço). Se for diferente:
   - no GitHub, abra `public/js/config.js`, clique no **lápis (Edit)**, troque o endereço do `databaseURL` pelo que aparece no Firebase (sem a barra `/` no final) e clique em **Commit changes**.
7. Clique na aba **Regras**, apague tudo, cole o conteúdo do arquivo **`database.rules.json`** deste repositório e clique em **Publicar**.
   - Sempre que o arquivo `database.rules.json` mudar no repositório, copie e publique de novo.

Pronto. Para testar: no painel, aba **Ao vivo**, abra uma sala; num outro computador, entre como aluno daquela turma e abra **Jogos**.

> Limites do plano grátis: **até 100 alunos conectados ao mesmo tempo** (uma ou duas turmas jogando juntas) e 10 GB de tráfego por mês (sobra muito para o uso na escola).

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

### Jogos ao vivo na aula
1. No painel, abra a aba **Ao vivo**, escolha a **turma** e o jogo:
   - **Corrida ao vivo:** escolha o texto (fileira base, uma frase ou duas frases).
   - **Batalha de equipes:** escolha as palavras (fileira base, todas as letras ou palavras longas) e a duração (2, 3 ou 5 minutos).
2. Clique em **Abrir sala**. Deixe essa tela aberta, de preferência no **projetor**: ela é o telão do jogo e é ela que dá a largada e encerra a partida. O botão de monitor deixa em tela cheia.
3. Peça aos alunos para abrir **Jogos**: aparece o quadro **"Ao vivo agora"**. Eles clicam em **Entrar** e os nomes aparecem no telão.
4. Clique em **Começar**. Há uma contagem de 3 segundos. Na batalha, os times são sorteados nessa hora; quem entrar atrasado vai para o time com menos alunos.
5. A partida termina sozinha (todos chegaram, a base caiu ou o tempo acabou) ou no botão **Encerrar agora**. Depois, use **Nova partida** para jogar de novo com a mesma turma, ou **Fechar sala**.

- Os nomes e os avatares no telão vêm do cadastro: o aluno não consegue aparecer com outro nome.
- Cada aluno ganha XP e moedas pela partida; vencer dá as conquistas **Campeão da turma** e **Trabalho em equipe**.
- Se o professor recarregar a página no meio da aula, a aba **Ao vivo** mostra as **Salas abertas** com o botão **Abrir telão**.
- No **modo demonstração**, o botão **Adicionar alunos robôs** enche a sala para você ver como fica.

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
- **Ao vivo**: abre a sala dos jogos ao vivo e mostra o telão (veja "Jogos ao vivo na aula").

### Segurança (o que as regras do banco garantem)
- Cada aluno só vê o **ranking da própria turma**. Pessoas de fora não veem nomes nem fotos.
- O aluno não consegue mudar o próprio nome, turma ou escola, nem colocar um nome qualquer no ranking.
- O XP só sobe aos poucos e o ranking precisa ser igual ao perfil, então "trapacear" pelo navegador não leva ninguém ao topo.
- Com o **Primeiro acesso fechado**, ninguém novo consegue se cadastrar.
- **Jogos ao vivo** (`database.rules.json`): só o professor abre salas e escreve nomes e times; cada aluno só vê a sala da própria turma e só mexe no próprio placar; a velocidade é limitada (não dá para "pular" para o fim da corrida nem mandar centenas de pontos de uma vez).

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

- **Aluno não vê o quadro "Ao vivo agora":** confira se ele está na turma da sala, se a sala está aberta no painel e se o Realtime Database foi criado (Parte 7). Peça para recarregar com **Ctrl + Shift + R**.
- **"Não foi possível abrir a sala" no painel:** as regras do `database.rules.json` não foram publicadas ou o `databaseURL` do `config.js` está diferente do endereço do banco (Parte 7).

## Estrutura dos arquivos

```
teclaninja/
├── README.md            este guia
├── firebase.json        configuração do Firebase (regras do banco)
├── firestore.rules      regras de segurança do banco (copiar no console do Firebase)
├── database.rules.json  regras do Realtime Database (jogos ao vivo)
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
        ├── aovivo.js    jogos ao vivo: salas, corrida, batalha, telão
        ├── avatar.js    avatar de blocos: itens da loja, preços e desenho
        ├── motor.js     motor de digitação (PPM, precisão)
        ├── entrada.js   captura do que o aluno digita (acentos no Chromebook)
        ├── teclado.js   layout ABNT2, mapa de dedos, desenho do teclado e das mãos
        ├── progresso.js XP, níveis, estrelas, moedas e conquistas
        ├── store.js     login e banco de dados
        ├── icones.js    ícones (Lucide)
        └── ui.js        utilidades (sons, tema, avisos)
```
