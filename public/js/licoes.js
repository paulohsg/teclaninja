// Conteúdo do curso: módulos, lições, palavras e frases.
import { rnd, embaralhar } from './ui.js';

export const MODULOS = [
  { id: 'm0', nome: 'Primeiros passos', icone: '🧘', desc: 'Postura correta e posição das mãos no teclado.' },
  { id: 'm1', nome: 'Fileira base', icone: '🏠', desc: 'A "casa" dos seus dedos: A S D F G H J K L Ç.' },
  { id: 'm2', nome: 'Fileira superior', icone: '⛰️', desc: 'Q W E R T Y U I O P — os dedos sobem e voltam.' },
  { id: 'm3', nome: 'Fileira inferior', icone: '🔽', desc: 'Z X C V B N M , . ; — os dedos descem e voltam.' },
  { id: 'm4', nome: 'Maiúsculas e pontuação', icone: '🔠', desc: 'Shift, interrogação, exclamação e dois-pontos.' },
  { id: 'm5', nome: 'Acentuação ABNT2', icone: '✨', desc: '´ ~ ^ ` e Ç — o jeito brasileiro de digitar.' },
  { id: 'm6', nome: 'Números e símbolos', icone: '🔢', desc: 'A fileira dos números e os símbolos mais usados.' },
  { id: 'm7', nome: 'Textos e velocidade', icone: '🚀', desc: 'Textos curiosos para ganhar ritmo e velocidade.' }
];

// Palavras com grafia correta SEM acento (usadas nas lições de teclas e nos jogos).
export const PALAVRAS = `
a o e as os de da do das dos em no na nos nas um uma uns umas que se sem com para por mas ou mais menos muito pouco
tudo todo toda todos todas nada sempre nunca hoje ontem cedo tarde noite dia dias semana hora horas minuto tempo vez vezes
ele ela eles elas eu meu minha meus minhas seu sua seus suas isso isto esse essa este esta aquele aquela lado frente perto
longe dentro fora casa casas sala salas mesa mesas cama vida ano anos aqui ali sim bem mal bom boa amigo amiga amigos amigas
escola aluno aluna alunos livro livros caderno papel tela teclado mouse jogo jogar jogos time bola gol campo festa filme
filmes foto fotos selfie celular internet rede site link senha dado dados fase ponto pontos rua cidade mundo terra lua sol
mar rio lago ilha ilhas praia areia onda ondas vento chuva fogo gelo flor flores folha folhas fruta frutas uva uvas pera
manga banana laranja salada sopa arroz carne peixe queijo leite pizza bolo doce sal gato gata cachorro cavalo pato galo
galinha sapo tigre urso lobo coelho rato baleia polvo zebra girafa macaco formiga abelha aranha borboleta mosca ser estar
ter ir vir ver dar fazer dizer falar ler correr pular nadar andar ganhar perder treinar estudar digitar teclar olhar sentir
pensar saber querer poder gostar amar ajudar chegar sair voltar abrir fechar comer beber dormir acordar sonhar rir cantar
dançar desenhar pintar criar feliz legal forte lento alto baixo grande pequeno novo velho bonito lindo azul verde rosa roxo
preto branco cinza amarelo vermelho claro escuro certo errado junto livre porta janela parede chave carro moto bicicleta
trem barco foguete planeta estrela estrelas ninja magia mapa tesouro castelo espada escudo fada fadas fala falas falha
falhas faca faz feio feira fila filas filha filhas fio fim fome forma frio fugir fundo dama data dedo dedos dela dele
deles delas desde dica disse dois duas asa asas gala galas haja dada alga algas saga sagas ala alas faça faças salsa galha
galhas ideia ideias sede seda lisa leia lei leis sela seja sejas deixa diga kiwi karate kart web wifi show yoga hobby
cabeça laço moça poço graça praça peça força começo dança criança braço abraço onça aço quem quase quero quadro quatro
quinta quente parque homem horta hino hotel bicho filho olho olhos galho malha jeito jardim jovem jovens loja lojas rato
tatu suco sorte torta ruim teste texto tarefa trilha trigo pressa presa prato pedra pelo pele peso pista pirata pipoca
pote prova puxar quilo treino partida jogada golpe goleiro torcida equipe rodada placar medalha atleta eu tu oi sei lido
`.split(/\s+/).filter(Boolean);

export const FRASES = [
  'A prática constante transforma qualquer iniciante em um digitador rápido e preciso.',
  'Mantenha os olhos na tela e deixe que os dedos encontrem as teclas sozinhos.',
  'O segredo da velocidade é a precisão: primeiro acerte, depois acelere.',
  'Os indicadores repousam sobre as teclas F e J, que possuem pequenas saliências.',
  'Quem digita sem olhar para o teclado economiza tempo e energia todos os dias.',
  'A Lua se afasta da Terra cerca de quatro centímetros por ano.',
  'As abelhas conseguem reconhecer rostos humanos e se comunicam por meio de danças.',
  'O coração de uma baleia azul é tão grande quanto um carro pequeno.',
  'O cérebro humano consome cerca de vinte por cento da energia do corpo.',
  'Os flamingos são cor-de-rosa por causa dos alimentos que comem.',
  'A internet chegou ao Brasil no fim da década de oitenta, nas universidades.',
  'Um raio é cerca de cinco vezes mais quente do que a superfície do Sol.',
  'Os polvos têm três corações e sangue de cor azul.',
  'O Brasil abriga a maior biodiversidade de todo o planeta.',
  'Treinar um pouco todos os dias vale mais do que treinar muito uma vez por semana.',
  'Os golfinhos dormem com metade do cérebro de cada vez.',
  'O mel nunca estraga: já encontraram mel comestível em tumbas egípcias.'
];

const T = (id, modulo, titulo, novas, dica, meta) => ({ id, modulo, titulo, tipo: 'teclas', novas, dica, meta });
const R = (id, modulo, titulo, dica, meta) => ({ id, modulo, titulo, tipo: 'revisao', dica, meta });
const X = (id, modulo, titulo, dica, meta, exercicios, destaque = []) => ({ id, modulo, titulo, tipo: 'texto', dica, meta, exercicios, destaque });

export const LICOES = [
  { id: 'l00', modulo: 'm0', titulo: 'Postura e posição das mãos', tipo: 'teoria', meta: 0,
    dica: 'Coloque os dedos na fileira base e digite as teclas sem olhar para baixo. Sinta as saliências do F e do J!',
    exercicios: ['asdf jklç', 'asdf jklç fdsa çlkj', 'aa ss dd ff jj kk ll çç'] },

  T('l01', 'm1', 'F e J: as teclas-guia', 'fj', 'Passe os dedos nas teclas <b>F</b> e <b>J</b>: elas têm pequenas saliências. São a referência para achar a posição sem olhar. <b>Indicador esquerdo no F</b>, <b>indicador direito no J</b>. O polegar aperta o espaço.', 10),
  T('l02', 'm1', 'D e K', 'dk', 'Os <b>dedos médios</b> ficam ao lado dos indicadores: <b>médio esquerdo no D</b> e <b>médio direito no K</b>. Não tire os indicadores do F e do J.', 10),
  T('l03', 'm1', 'S e L', 'sl', 'Agora os <b>anelares</b>: o <b>esquerdo descansa no S</b> e o <b>direito no L</b>. Mantenha os dedos levemente curvados, como se segurasse uma bolinha.', 10),
  T('l04', 'm1', 'A e Ç', 'aç', 'Os <b>mínimos</b> completam a fileira base: <b>mínimo esquerdo no A</b> e <b>mínimo direito no Ç</b>. O Ç é uma tecla especial do teclado ABNT2!', 10),
  T('l05', 'm1', 'G e H', 'gh', 'Os indicadores se esticam para o centro: <b>indicador esquerdo vai ao G</b> e <b>indicador direito vai ao H</b>. Depois de apertar, eles voltam para F e J.', 10),
  R('l06', 'm1', 'Revisão: fileira base', 'Hora de juntar tudo! Palavras usando só a fileira base. Lembre: olhos na tela, dedos em casa.', 12),

  T('l07', 'm2', 'E e I', 'ei', 'Os dedos médios sobem um pouquinho na diagonal: <b>médio esquerdo no E</b> e <b>médio direito no I</b>. Depois, voltam para D e K.', 12),
  T('l08', 'm2', 'R e U', 'ru', 'Os indicadores sobem: <b>indicador esquerdo no R</b> e <b>indicador direito no U</b>. Os outros dedos continuam na fileira base.', 12),
  T('l09', 'm2', 'T e O', 'to', '<b>T</b>: o indicador esquerdo sobe e vai um pouco para a direita. <b>O</b>: o anelar direito sobe.', 12),
  T('l10', 'm2', 'Q e P', 'qp', 'Os mínimos sobem: <b>mínimo esquerdo no Q</b> e <b>mínimo direito no P</b>. São dedos mais fracos — vá com calma.', 12),
  T('l11', 'm2', 'W e Y', 'wy', '<b>W</b>: o anelar esquerdo sobe. <b>Y</b>: o indicador direito sobe e vai um pouco para a esquerda.', 12),
  R('l12', 'm2', 'Revisão: fileiras base e superior', 'Palavras com as duas fileiras. Volte sempre os dedos para a fileira base.', 14),

  T('l13', 'm3', 'V e M', 'vm', 'Os indicadores descem: <b>indicador esquerdo no V</b> e <b>indicador direito no M</b>.', 14),
  T('l14', 'm3', 'C e vírgula', 'c,', '<b>C</b>: o médio esquerdo desce. <b>Vírgula</b>: o médio direito desce. Depois da vírgula, sempre vem um espaço.', 14),
  T('l15', 'm3', 'N e ponto', 'n.', '<b>N</b>: o indicador direito desce e vai um pouco para a esquerda. <b>Ponto</b>: o anelar direito desce.', 14),
  T('l16', 'm3', 'B e X', 'bx', 'Atenção: o <b>B é do indicador ESQUERDO</b> (desce e vai para a direita). <b>X</b>: o anelar esquerdo desce.', 14),
  T('l17', 'm3', 'Z e ponto e vírgula', 'z;', '<b>Z</b>: o mínimo esquerdo desce. <b>;</b> (ponto e vírgula): o mínimo direito desce — no ABNT2 ele fica logo ao lado do ponto.', 14),
  R('l18', 'm3', 'Revisão: alfabeto completo', 'Você já conhece todas as letras! Agora é praticar palavras de verdade.', 16),

  X('l19', 'm4', 'Shift esquerdo', 'Para letras <b>maiúsculas da mão direita</b> (J, K, L, P, M...), segure o <b>Shift esquerdo com o mínimo esquerdo</b> e aperte a letra. Regra de ouro: o Shift é sempre da mão oposta à letra.', 14, [
    'Joana Lucas Paulo Igor Hugo Pedro Lia Nina',
    'Kelly Olga Mariana Yago Ulisses Moema',
    'Ivo mora em Manaus. Joana mora em Palmas.',
    'Pedro, Kelly e Hugo foram ao parque. Olga levou um livro.'
  ], ['ShiftLeft']),
  X('l20', 'm4', 'Shift direito', 'Para letras <b>maiúsculas da mão esquerda</b> (A, S, D, F, R, T...), segure o <b>Shift direito com o mínimo direito</b>.', 14, [
    'Ana Bruno Carla Daniel Eva Fernanda Gabriel Rafael',
    'Sara Tiago Vitor Wesley Rita Edu Bia Caio',
    'Recife, Salvador, Curitiba e Fortaleza ficam no Brasil.',
    'Ana e Bruno gostam de jogar bola com Tiago.'
  ], ['ShiftRight']),
  X('l21', 'm4', 'Interrogação, exclamação e dois-pontos', '<b>?</b> = Shift + tecla <b>/</b> (mínimo direito, ao lado do Shift direito). <b>!</b> = Shift + <b>1</b> (mínimo esquerdo). <b>:</b> = Shift + <b>;</b> (mínimo direito).', 14, [
    'Oi! Tudo bem? Sim! Vamos jogar?',
    'Lista de compras: arroz, leite, ovos e frutas.',
    'Quem ganhou o jogo? Foi o time azul! Placar: dois a um.'
  ], ['IntlRo', 'Digit1', 'Slash', 'ShiftLeft', 'ShiftRight']),

  X('l22', 'm5', 'Acento agudo: á é í ó ú', 'O acento <b>´</b> fica ao lado do P (mínimo direito). É uma tecla "morta": <b>aperte e solte o acento, depois aperte a vogal</b>. Para É maiúsculo: acento, depois Shift + E.', 12, [
    'á é í ó ú á é í ó ú',
    'já até café sofá baú saúde país',
    'O café é forte. A música é ótima. Até já!',
    'É fácil: aperte o acento e depois a vogal.'
  ], ['BracketLeft']),
  X('l23', 'm5', 'Til: ã õ', 'O <b>~</b> fica ao lado do Ç (mínimo direito). Aperte e solte o til, depois o A ou o O.', 12, [
    'ã õ ã õ mão pão não são',
    'irmã maçã limões botões corações',
    'A mãe e o irmão estão na estação de trem.'
  ], ['Quote']),
  X('l24', 'm5', 'Circunflexo: â ê ô', 'O <b>^</b> é Shift + tecla do til (mínimo direito). Segure o <b>Shift esquerdo</b>, aperte <b>~</b>, solte tudo e aperte a vogal.', 12, [
    'â ê ô â ê ô',
    'você três avô ônibus português',
    'Você vê o ônibus? Três estão no ponto.'
  ], ['Quote', 'ShiftLeft']),
  X('l25', 'm5', 'Crase e cedilha: à ç', 'A crase <b>`</b> é Shift + tecla do acento agudo. O <b>Ç</b> tem tecla própria ao lado do L.', 12, [
    'à às à às ça ço çu',
    'Vou à escola às sete horas.',
    'maçã coração açúcar criança açaí',
    'A criança comeu açaí à tarde.'
  ], ['BracketLeft', 'Semicolon']),

  X('l26', 'm6', 'Números 1 a 5', 'A mão esquerda cuida do 1 ao 5: <b>1</b> mínimo, <b>2</b> anelar, <b>3</b> médio, <b>4 e 5</b> indicador. Suba o dedo, aperte e volte para a fileira base.', 12, [
    '1 2 3 4 5 11 22 33 44 55',
    '12 23 34 45 51 135 241 352',
    'Comprei 3 lápis e 2 cadernos por 15 reais.'
  ], ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5']),
  X('l27', 'm6', 'Números 6 a 0', 'A mão direita cuida do 6 ao 0: <b>6 e 7</b> indicador, <b>8</b> médio, <b>9</b> anelar, <b>0</b> mínimo.', 12, [
    '6 7 8 9 0 66 77 88 99 00',
    '60 70 80 90 678 790 806',
    'O Brasil tem 26 estados e 1 Distrito Federal.',
    'Em 2026 a turma fez 90 lições de digitação.'
  ], ['Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0']),
  X('l28', 'm6', 'Símbolos', 'Os símbolos ficam no Shift dos números: <b>@</b> Shift+2, <b>#</b> Shift+3, <b>$</b> Shift+4, <b>%</b> Shift+5, <b>&</b> Shift+7, <b>*</b> Shift+8, <b>( )</b> Shift+9 e 0. O <b>-</b> e o <b>=</b> ficam depois do 0.', 12, [
    '@ # $ % & * ( ) - _ + =',
    'aluno@escola.com #digitar R$ 25,90',
    '(11) 98765-4321 e 50% de desconto!',
    '2 + 3 = 5 e 10 - 4 = 6. Tom & Jerry.'
  ], ['Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal']),

  X('l29', 'm7', 'Texto: o polvo', 'Textos completos! Mantenha o ritmo constante — é melhor digitar devagar e sem erros do que rápido e errando.', 20, [
    'O polvo tem três corações e sangue azul.',
    'Ele consegue mudar de cor em menos de um segundo para se esconder dos predadores.',
    'Cada um dos seus oito braços tem neurônios próprios e pode sentir o gosto das coisas.'
  ]),
  X('l30', 'm7', 'Texto: futebol', 'Dica: quando errar, não se apresse. Respire e continue no seu ritmo.', 22, [
    'O Brasil é o único país que participou de todas as Copas do Mundo.',
    'A seleção brasileira conquistou cinco títulos mundiais.',
    'O futebol chegou ao país no fim do século XIX e virou uma paixão nacional.'
  ]),
  X('l31', 'm7', 'Texto: videogames', 'Tente não olhar para o teclado nenhuma vez neste texto!', 24, [
    'O primeiro videogame doméstico, o Magnavox Odyssey, foi lançado em 1972.',
    'Hoje, os jogos eletrônicos movimentam mais dinheiro do que o cinema e a música juntos.',
    'Muitos jogadores profissionais digitam mais de 80 palavras por minuto.'
  ]),
  X('l32', 'm7', 'Texto: o espaço', 'Postura! Costas apoiadas, pés no chão e pulsos relaxados.', 25, [
    'Um dia em Vênus dura mais do que um ano em Vênus.',
    'O planeta gira tão devagar que, por lá, o Sol nasce no oeste.',
    'A luz do Sol leva cerca de oito minutos para chegar até a Terra.'
  ]),
  X('l33', 'm7', 'Texto: Santos Dumont', 'Atenção aos números e às maiúsculas!', 26, [
    'Alberto Santos Dumont, inventor brasileiro, voou com o 14-Bis em Paris, em 1906.',
    'Ele também ajudou a popularizar o relógio de pulso.',
    'Santos Dumont nasceu em Minas Gerais, no ano de 1873.'
  ]),
  X('l34', 'm7', 'Texto final: digitar é poder', 'Última lição! Mostre tudo o que você aprendeu.', 28, [
    'Digitar bem é uma habilidade para a vida toda.',
    'Quem domina o teclado escreve mais rápido, erra menos e economiza tempo nos estudos e no trabalho.',
    'Parabéns por chegar até aqui! Continue treinando nos jogos para ficar cada vez mais veloz.'
  ])
];

// ===================== Módulos avançados (lições 36 a 87) =====================
// Lições do tipo "palavras" sorteiam palavras da lista a cada tentativa.
const P = (id, modulo, titulo, dica, meta, palavras) => ({ id, modulo, titulo, tipo: 'palavras', dica, meta, palavras: palavras.trim().split(/\s*,\s*/) });

MODULOS.push(
  { id: 'm8', nome: 'Combinações difíceis', icone: '🧩', desc: 'NH, LH, CH, ÃO, QU, RR, SS e Ç: as combinações mais traiçoeiras do português.' },
  { id: 'm9', nome: 'Palavras temáticas', icone: '🗂️', desc: 'Vocabulário de esportes, animais, comidas, tecnologia e mais.' },
  { id: 'm10', nome: 'Frases do dia a dia', icone: '💬', desc: 'Ditados, mensagens, diálogos e pontuação completa.' },
  { id: 'm11', nome: 'Números no mundo real', icone: '🧮', desc: 'Datas, horários, preços, endereços, e-mails e contas.' },
  { id: 'm12', nome: 'Textos: ciência e natureza', icone: '🔬', desc: 'Corpo humano, planetas, dinossauros e outros mistérios.' },
  { id: 'm13', nome: 'Textos: Brasil e história', icone: '🇧🇷', desc: 'História do Brasil, Goiás, o Cerrado e a nossa cultura.' },
  { id: 'm14', nome: 'Textos: tecnologia e mundo', icone: '🌍', desc: 'Computadores, internet, Olimpíadas e o espaço.' },
  { id: 'm15', nome: 'Desafios finais', icone: '🏆', desc: 'Textos longos e metas altas. Só para quem é ninja de verdade!' }
);

LICOES.push(
  // ---------- m8: Combinações difíceis ----------
  P('l35', 'm8', 'NH, LH e CH', 'Essas duplas aparecem o tempo todo. Mantenha o ritmo: o H é do <b>indicador direito</b>, logo ao lado do J.', 24,
    'banho, sonho, ninho, manhã, linha, vinho, caminho, montanha, unha, galinha, filho, olho, trabalho, palha, folha, espelho, joelho, milho, chave, chuva, chocolate, bicho, cachorro, chinelo, mochila, choro, achar'),
  P('l36', 'm8', 'ÃO, ÕES e ÃES', 'O til fica ao lado do Ç (<b>mínimo direito</b>). Aperte o ~, solte e depois a vogal.', 22,
    'pão, mão, coração, avião, limão, feijão, irmão, estação, emoção, canção, botões, lições, canções, corações, aviões, limões, mães, pães, cães, alemães, capitães, não, são, então'),
  P('l37', 'm8', 'QU e GU', 'O Q é do <b>mínimo esquerdo</b> e quase sempre vem com U. Pratique a passagem rápida entre as duas mãos.', 24,
    'queijo, quente, quilo, aquilo, pequeno, esquina, quatro, qual, quando, quase, quarto, máquina, parque, guerra, guitarra, foguete, águia, sangue, guarda, água, língua, seguir, alguém, preguiça'),
  P('l38', 'm8', 'RR e SS', 'Letras dobradas pedem duas batidas rápidas com o mesmo dedo. Não segure a tecla: toque duas vezes.', 24,
    'carro, terra, ferro, barro, correr, garrafa, cachorro, carroça, serra, torre, burro, horrível, massa, pássaro, osso, missão, nosso, sossego, assunto, passeio, pêssego, assim, isso, professora'),
  P('l39', 'm8', 'Ç com acentos', 'Misture o Ç com as teclas de acento. Lembre: o acento vem antes da vogal.', 22,
    'açúcar, maçã, coração, praça, cabeça, laço, açaí, criança, começo, dança, força, preço, março, almoço, cansaço, espaço, endereço, exceção, atenção, decoração, poção, caçula'),
  P('l40', 'm8', 'Só a mão esquerda', 'Todas estas palavras usam só a <b>mão esquerda</b>. A mão direita descansa no J K L Ç e só o polegar direito pode ajudar no espaço.', 24,
    'casa, carta, cesta, festa, garrafa, vaca, cera, data, sete, verde, beber, terra, faca, trave, barata, estrada, escada, arte, desfazer, gaveta, defesa, fase, vestes, reza, zebra, sacada, tarefa'),
  P('l41', 'm8', 'Só a mão direita', 'Agora só a <b>mão direita</b>. A mão esquerda fica parada no A S D F.', 22,
    'olho, milho, molho, limo, joio, punho, olimpo, junho, julho, mínimo, hum, pilhou, polui, nulo, pulo, mimo, ninho, piolho, um, oi, ui'),
  P('l42', 'm8', 'Revisão das combinações', 'Tudo junto! Precisão primeiro: as combinações difíceis ficam fáceis com repetição.', 26,
    'trabalho, chocolate, coração, máquina, guitarra, pássaro, açúcar, garrafa, montanha, estação, foguete, cachorro, espaço, sossego, caminho, pequeno, preguiça, atenção, chuva, milho, canções, terra, água, criança'),

  // ---------- m9: Palavras temáticas ----------
  P('l43', 'm9', 'Esportes', 'Vocabulário do mundo esportivo. Atenção aos acentos de vôlei, judô e pódio!', 26,
    'futebol, vôlei, basquete, handebol, natação, atletismo, judô, skate, surfe, tênis, ciclismo, ginástica, xadrez, goleiro, atacante, zagueiro, árbitro, campeonato, medalha, pódio, torcida, estádio, treino, raquete, prancha'),
  P('l44', 'm9', 'Animais do Brasil', 'Muitos nomes de animais têm hífen (-). Ele fica depois do 0, com o <b>mínimo direito</b>.', 24,
    'onça-pintada, tamanduá, capivara, tucano, arara-azul, jacaré, boto-cor-de-rosa, mico-leão-dourado, lobo-guará, tatu-bola, preguiça, quati, sucuri, ema, seriema, anta, sagui, papagaio, sabiá, jabuti'),
  P('l45', 'm9', 'Comidas brasileiras', 'Pequi, pamonha, galinhada... deu fome? Digite com calma e capriche nos acentos.', 26,
    'arroz, feijão, pequi, pamonha, empadão, tapioca, açaí, brigadeiro, coxinha, pastel, farofa, mandioca, galinhada, pão de queijo, cuscuz, moqueca, churrasco, guaraná, acarajé, quindim, baião de dois, canjica'),
  P('l46', 'm9', 'Tecnologia', 'Palavras do mundo digital. Você vai usar muitas delas no dia a dia!', 26,
    'computador, teclado, mouse, monitor, internet, aplicativo, programa, arquivo, pasta, senha, navegador, servidor, robô, algoritmo, código, câmera, bateria, carregador, download, backup, tela, impressora, planilha, nuvem'),
  P('l47', 'm9', 'Profissões', 'Que profissão você quer ter? Quase todas vão exigir digitar bem!', 26,
    'professor, médica, engenheiro, enfermeira, advogado, programadora, motorista, cozinheiro, eletricista, jornalista, dentista, veterinária, bombeiro, arquiteta, agricultor, mecânico, cientista, piloto, designer, cabeleireira'),
  P('l48', 'm9', 'Natureza', 'Biomas, paisagens e fenômenos da natureza. Olhos na tela!', 26,
    'floresta, cachoeira, montanha, vulcão, oceano, deserto, savana, cerrado, pantanal, caatinga, rio, lago, nascente, árvore, semente, raiz, folhagem, orvalho, neblina, arco-íris, relâmpago, trovão, ventania'),
  P('l49', 'm9', 'Música e arte', 'Instrumentos, ritmos e artes. Tente manter um ritmo constante, como numa música.', 26,
    'violão, guitarra, bateria, sanfona, viola caipira, pandeiro, flauta, piano, melodia, ritmo, refrão, poesia, pintura, escultura, grafite, teatro, dança, cinema, fotografia, desenho, música, canção'),
  P('l50', 'm9', 'Na escola', 'Tudo o que existe na escola. Você digita isso todo dia na vida real!', 28,
    'caderno, lápis, borracha, apontador, mochila, estojo, régua, caneta, diretora, recreio, merenda, biblioteca, laboratório, quadra, prova, redação, matemática, geografia, história, ciências, português, inglês, educação física'),

  // ---------- m10: Frases do dia a dia ----------
  X('l51', 'm10', 'Ditados populares', 'Frases completas com vírgulas e pontos. Depois da vírgula e do ponto, sempre um espaço.', 26, [
    'Água mole em pedra dura, tanto bate até que fura.',
    'De grão em grão, a galinha enche o papo.',
    'Mais vale um pássaro na mão do que dois voando.',
    'Quem semeia vento colhe tempestade. A pressa é inimiga da perfeição.'
  ]),
  X('l52', 'm10', 'Frases motivacionais', 'Leia a frase inteira antes de começar. Isso ajuda a manter o ritmo.', 28, [
    'Errar faz parte de aprender. Cada erro mostra o que treinar.',
    'Você não precisa ser rápido para começar, mas precisa começar para ficar rápido.',
    'Disciplina é fazer o que precisa ser feito, mesmo quando ninguém está olhando.',
    'Pequenos avanços todos os dias viram grandes conquistas no fim do ano.'
  ]),
  X('l53', 'm10', 'Perguntas e exclamações', 'Interrogação: Shift + tecla / . Exclamação: Shift + 1. Use o Shift da mão oposta!', 26, [
    'Que horas são? Já é hora do intervalo!',
    'Você viu o jogo de ontem? Que golaço!',
    'Quantos minutos faltam? Só cinco, ainda bem!',
    'Posso ir ao banheiro, professor? Pode, mas volte logo!'
  ], ['IntlRo', 'Digit1', 'ShiftLeft', 'ShiftRight']),
  X('l54', 'm10', 'Diálogos com aspas', 'As aspas (") ficam no Shift da tecla ao lado do 1, com o <b>mínimo esquerdo</b>. Use o Shift direito.', 24, [
    'Ela perguntou: "Você trouxe o caderno?"',
    'Ele respondeu: "Trouxe, e também a calculadora."',
    'A professora avisou: "A prova será na sexta-feira."',
    'Todos disseram juntos: "Estamos prontos!"'
  ], ['Backquote', 'ShiftRight']),
  X('l55', 'm10', 'Mensagem para o grupo', 'Um recado de verdade, como no celular, mas digitado do jeito certo.', 28, [
    'Oi, pessoal! A reunião do grupo será amanhã, às 14h, na biblioteca.',
    'Não esqueçam de trazer o trabalho impresso e o pendrive com a apresentação.',
    'Cada um vai falar por dois minutos. Ensaiem antes, combinado?',
    'Qualquer dúvida, me chamem no grupo. Até amanhã!'
  ]),
  X('l56', 'm10', 'Pontuação completa', 'Vírgula, ponto e vírgula, dois-pontos e parênteses ( ). Os parênteses são Shift + 9 e Shift + 0.', 24, [
    'Comprei três coisas: lápis, borracha e régua; esqueci a cola (de novo).',
    'O Brasil tem cinco regiões: Norte, Nordeste, Centro-Oeste, Sudeste e Sul.',
    'Goiás fica no Centro-Oeste; sua capital é Goiânia (desde 1937).',
    'Atenção: leia o enunciado, faça um rascunho e só depois responda!'
  ]),

  // ---------- m11: Números no mundo real ----------
  X('l57', 'm11', 'Datas e horários', 'A barra (/) fica ao lado do Shift direito. Se o seu teclado não tiver essa tecla, use AltGr + Q.', 18, [
    'Hoje é 15/03/2026 e a aula começa às 7h30.',
    'O ano tem 365 dias, 52 semanas e 12 meses.',
    'Meu aniversário é em 28 de agosto; faltam 47 dias!',
    'O intervalo dura 20 minutos: das 9h40 às 10h00.'
  ], ['IntlRo', 'Digit1', 'Digit2', 'Digit3']),
  X('l58', 'm11', 'Dinheiro e preços', 'O cifrão ($) é Shift + 4. Nos preços, a vírgula separa os centavos.', 18, [
    'O lanche custa R$ 8,50 e o suco, R$ 4,75.',
    'Paguei com R$ 20,00 e recebi R$ 6,75 de troco.',
    'A camiseta de R$ 59,90 estava com 30% de desconto.',
    'Juntei R$ 150,00 em três meses: R$ 50,00 por mês.'
  ], ['Digit4', 'Digit5', 'Comma']),
  X('l59', 'm11', 'Endereços e telefones', 'Números longos: olhe o texto em blocos pequenos, de 3 ou 4 algarismos.', 18, [
    'Rua das Palmeiras, 123, Setor Central, Goiânia - GO.',
    'CEP 74000-000. Telefone da escola: (62) 3000-0000.',
    'Apartamento 402, bloco B, perto da praça.',
    'Celular: (62) 90000-0000. Ligue depois das 18h.'
  ], ['Digit9', 'Digit0', 'Minus']),
  X('l60', 'm11', 'E-mails e sites', 'A arroba (@) é Shift + 2 e o sublinhado (_) é Shift + hífen.', 18, [
    'Meu e-mail da escola é aluno.ninja@escola.edu.br.',
    'Acesse www.exemplo.com.br/digitacao para treinar mais.',
    'O arquivo se chama trabalho_final_v2.pdf.',
    'Envie para professor_digitacao@exemplo.com até sexta.'
  ], ['Digit2', 'Minus', 'Period']),
  X('l61', 'm11', 'Contas de matemática', 'Mais (+) é Shift + =. Asterisco (*) é Shift + 8 e serve como sinal de vezes no computador.', 18, [
    '2 + 2 = 4, 10 - 3 = 7 e 6 * 7 = 42.',
    'A metade de 50 é 25 e o dobro de 25 é 50.',
    '(3 + 5) * 2 = 16, mas 3 + 5 * 2 = 13.',
    '15% de 200 é 30, e 10% de 90 é 9.'
  ], ['Equal', 'Digit8', 'Minus']),
  X('l62', 'm11', 'Receita de bolo', 'Uma receita de verdade, com números, frações e medidas.', 20, [
    'Bolo de cenoura: 3 cenouras médias, 4 ovos e 1 xícara de óleo.',
    'Bata no liquidificador e junte 2 xícaras de açúcar e 2 e 1/2 xícaras de farinha.',
    'Acrescente 1 colher de sopa de fermento e misture devagar.',
    'Asse em forno a 180 graus por 40 minutos. Rende 12 pedaços!'
  ]),

  // ---------- m12: Textos de ciência e natureza ----------
  X('l63', 'm12', 'Texto: o corpo humano', 'Textos mais longos a partir daqui. Respire, relaxe os ombros e mantenha o ritmo.', 28, [
    'O corpo humano adulto tem 206 ossos. O menor deles, o estribo, fica dentro do ouvido e mede cerca de três milímetros.',
    'O coração bate mais de 100 mil vezes por dia, levando sangue para todas as partes do corpo.',
    'A pele é o maior órgão do corpo e se renova o tempo todo: as células velhas caem e dão lugar a novas.'
  ]),
  X('l64', 'm12', 'Texto: a água do planeta', 'Postura: costas apoiadas e pulsos retos. Seus braços agradecem!', 28, [
    'Cerca de 70% da superfície da Terra é coberta por água, mas só uma pequena parte é água doce.',
    'A maior parte da água doce do planeta está congelada nas geleiras e nas calotas polares.',
    'Economizar água é tarefa de todos: fechar a torneira ao escovar os dentes já faz diferença.'
  ]),
  X('l65', 'm12', 'Texto: fotossíntese', 'Palavras grandes? Divida em sílabas na cabeça: fo-tos-sín-te-se.', 28, [
    'As plantas produzem o próprio alimento por meio da fotossíntese.',
    'Elas usam a luz do Sol, a água e o gás carbônico do ar para fabricar açúcar e liberar oxigênio.',
    'Grande parte do oxigênio que respiramos vem das algas e de pequenos seres que vivem nos oceanos.'
  ]),
  X('l66', 'm12', 'Texto: o Sistema Solar', 'Nomes próprios começam com maiúscula: use o Shift da mão oposta.', 28, [
    'O Sistema Solar tem oito planetas: Mercúrio, Vênus, Terra, Marte, Júpiter, Saturno, Urano e Netuno.',
    'Júpiter é o maior de todos; caberiam mais de mil planetas Terra dentro dele.',
    'Marte é chamado de planeta vermelho por causa do óxido de ferro que cobre o seu solo.'
  ]),
  X('l67', 'm12', 'Texto: dinossauros', 'Números e texto juntos. Não olhe para o teclado nos números!', 28, [
    'Os dinossauros viveram na Terra por mais de 160 milhões de anos.',
    'Eles desapareceram há cerca de 66 milhões de anos, provavelmente após a queda de um enorme asteroide.',
    'As aves de hoje são descendentes dos dinossauros. No Rio Grande do Sul foram encontrados fósseis de alguns dos dinossauros mais antigos do mundo.'
  ]),
  X('l68', 'm12', 'Texto: animais incríveis', 'Hífens no meio das palavras: beija-flor, tartaruga-de-couro.', 28, [
    'O beija-flor consegue voar para trás e ficar parado no ar enquanto bebe o néctar das flores.',
    'O guepardo é o animal terrestre mais rápido e pode passar de 100 quilômetros por hora em corridas curtas.',
    'A tartaruga-de-couro, a maior tartaruga do mundo, consegue mergulhar a mais de mil metros de profundidade.'
  ]),

  // ---------- m13: Textos de Brasil e história ----------
  X('l69', 'm13', 'Texto: os primeiros brasileiros', 'Datas e números grandes: digite um bloco de cada vez.', 30, [
    'Em 22 de abril de 1500, a frota de Pedro Álvares Cabral chegou ao litoral da Bahia.',
    'Muito antes disso, milhões de indígenas já viviam no território que hoje é o Brasil.',
    'Até hoje, mais de 300 povos indígenas vivem no país e falam mais de 270 línguas diferentes.'
  ]),
  X('l70', 'm13', 'Texto: Independência e República', 'Atenção às datas com números e às maiúsculas.', 30, [
    'A Independência do Brasil foi proclamada em 7 de setembro de 1822, às margens do riacho Ipiranga, em São Paulo.',
    'Dom Pedro I tornou-se o primeiro imperador do país.',
    'Mais tarde, em 15 de novembro de 1889, foi proclamada a República.'
  ]),
  X('l71', 'm13', 'Texto: o fim da escravidão', 'Um tema importante da nossa história. Leia com atenção enquanto digita.', 30, [
    'A Lei Áurea, assinada em 13 de maio de 1888, aboliu a escravidão no Brasil.',
    'O Brasil foi o último país das Américas a acabar com a escravidão.',
    'Zumbi dos Palmares é lembrado como símbolo de resistência, e o dia 20 de novembro é o Dia da Consciência Negra.'
  ]),
  X('l72', 'm13', 'Texto: Brasília e Goiânia', 'Dois nomes famosos: Lúcio Costa e Oscar Niemeyer. Capriche nas maiúsculas!', 30, [
    'Brasília foi inaugurada em 21 de abril de 1960 e se tornou a capital do Brasil.',
    'O projeto da cidade foi feito pelo urbanista Lúcio Costa e pelo arquiteto Oscar Niemeyer.',
    'Goiânia, capital de Goiás, foi planejada na década de 1930 e é conhecida por suas praças e áreas verdes.'
  ]),
  X('l73', 'm13', 'Texto: o Cerrado', 'O bioma onde você vive! Mantenha os dedos na fileira base entre as palavras.', 30, [
    'O Cerrado é o segundo maior bioma do Brasil, atrás apenas da Amazônia.',
    'Ele é chamado de berço das águas, porque nele nascem rios de grandes bacias do país.',
    'O pequi, fruto típico do Cerrado, é muito usado na culinária goiana, como no arroz com pequi.'
  ]),
  X('l74', 'm13', 'Texto: festas e cultura', 'Muitos nomes com hífen e acento. Devagar e sempre!', 30, [
    'O samba nasceu no Brasil e é reconhecido como patrimônio cultural do país.',
    'Cada região tem suas festas: o frevo em Pernambuco, o boi-bumbá no Amazonas e as festas juninas em todo o país.',
    'Em Goiás, as Cavalhadas de Pirenópolis e a Festa do Divino atraem visitantes de todo o Brasil.'
  ]),

  // ---------- m14: Textos de tecnologia e mundo ----------
  X('l75', 'm14', 'Texto: os primeiros computadores', 'Meta mais alta agora. Velocidade com precisão!', 32, [
    'Os primeiros computadores ocupavam salas inteiras e pesavam várias toneladas.',
    'O ENIAC, apresentado em 1946, usava cerca de 18 mil válvulas e consumia muita energia.',
    'Hoje, um celular comum é milhões de vezes mais rápido do que aqueles primeiros computadores.'
  ]),
  X('l76', 'm14', 'Texto: segurança na internet', 'Dicas que valem para a vida toda. Digite e guarde na memória!', 32, [
    'Nunca compartilhe sua senha, nem com os amigos mais próximos.',
    'Desconfie de mensagens que prometem prêmios fáceis ou pedem para clicar em links estranhos.',
    'Antes de publicar algo, pense: eu diria isso pessoalmente? Na internet, o que é postado pode ficar para sempre.'
  ]),
  X('l77', 'm14', 'Texto: a história do teclado', 'Um texto sobre o próprio teclado que você está usando!', 32, [
    'O teclado QWERTY recebeu esse nome por causa das seis primeiras letras da fileira de cima.',
    'Ele foi criado no século XIX para as máquinas de escrever e continua sendo usado até hoje.',
    'O padrão ABNT2, usado no Brasil, tem a tecla Ç e teclas próprias para os acentos da língua portuguesa.'
  ]),
  X('l78', 'm14', 'Texto: inteligência artificial', 'Tema do momento. Atenção às palavras longas!', 32, [
    'A inteligência artificial é uma área da computação que cria programas capazes de aprender com dados.',
    'Ela está presente em tradutores, assistentes de voz e nas recomendações de vídeos e músicas.',
    'Usar bem essa tecnologia exige senso crítico: nem tudo o que a máquina responde está certo.'
  ]),
  X('l79', 'm14', 'Texto: as Olimpíadas', 'Datas, nomes de cidades e números. Mostre que você domina tudo!', 32, [
    'Os Jogos Olímpicos da era moderna começaram em Atenas, na Grécia, em 1896.',
    'O Rio de Janeiro sediou as Olimpíadas de 2016, as primeiras realizadas na América do Sul.',
    'Os cinco anéis olímpicos representam a união dos continentes por meio do esporte.'
  ]),
  X('l80', 'm14', 'Texto: um brasileiro no espaço', 'Último texto deste módulo. Ritmo constante até o fim!', 32, [
    'Marcos Pontes foi o primeiro astronauta brasileiro a ir ao espaço, em 2006.',
    'Ele ficou alguns dias na Estação Espacial Internacional, que dá uma volta completa na Terra a cada 90 minutos, aproximadamente.',
    'Por isso, os astronautas podem ver cerca de 16 nasceres do sol em um único dia.'
  ]),

  // ---------- m15: Desafios finais ----------
  X('l81', 'm15', 'Desafio: a língua portuguesa', 'Desafio longo! Cinco partes seguidas. Se cansar, relaxe as mãos entre uma parte e outra.', 34, [
    'A língua portuguesa é falada por mais de 250 milhões de pessoas em todo o mundo.',
    'Ela é a língua oficial de nove países, entre eles Brasil, Portugal, Angola e Moçambique.',
    'O português nasceu do latim, a língua falada pelos antigos romanos.',
    'Muitas palavras que usamos vieram de línguas indígenas, como abacaxi, pipoca, capivara e Goiás.',
    'Cada vez que você digita um texto, está usando uma língua com mais de 800 anos de história.'
  ]),
  X('l82', 'm15', 'Desafio: dicas para estudar', 'Cinco partes, meta alta. Mostre seu melhor!', 35, [
    'Estudar um pouco todos os dias funciona melhor do que estudar muito na véspera da prova.',
    'Tire o celular de perto: cada notificação rouba a sua atenção por vários minutos.',
    'Explique a matéria em voz alta, como se estivesse ensinando alguém. É assim que se aprende de verdade.',
    'Faça pausas curtas a cada 25 ou 30 minutos e beba água.',
    'Dormir bem também é estudar: é durante o sono que o cérebro organiza o que aprendeu.'
  ]),
  X('l83', 'm15', 'Desafio: o futebol feminino', 'Nomes, números e acentos. Desafio completo!', 36, [
    'Marta Vieira da Silva, nascida em Alagoas, foi eleita seis vezes a melhor jogadora do mundo.',
    'Ela também é a maior artilheira da história das Copas do Mundo, somando homens e mulheres.',
    'Formiga, outra lenda brasileira, disputou sete Copas do Mundo, um recorde.',
    'O futebol feminino chegou a ser proibido no Brasil por quase 40 anos, até 1979.',
    'Hoje, milhares de meninas jogam bola em escolas e clubes de todo o país.'
  ]),
  X('l84', 'm15', 'Desafio: a história da escrita', 'Uma longa viagem no tempo. Precisão de ninja!', 37, [
    'A escrita foi inventada há mais de cinco mil anos, na Mesopotâmia.',
    'Os primeiros textos eram marcas feitas em placas de argila molhada.',
    'Os egípcios criaram os hieróglifos, que misturavam desenhos e sons.',
    'Por volta de 1450, Gutenberg aperfeiçoou a prensa com tipos móveis, e os livros ficaram mais baratos.',
    'Hoje escrevemos com o teclado, e quem domina essa ferramenta ganha tempo para pensar no que realmente importa.'
  ]),
  X('l85', 'm15', 'Desafio: carta para o futuro', 'Quase lá! Digite como se fosse uma carta para você mesmo daqui a dez anos.', 38, [
    'Querido eu do futuro, hoje eu aprendi a digitar sem olhar para o teclado.',
    'No começo foi difícil: eu errava o Ç, esquecia os acentos e olhava para baixo o tempo todo.',
    'Mas treinei um pouco a cada aula, e cada estrela conquistada me deixou mais confiante.',
    'Espero que você continue curioso, estudando e aprendendo coisas novas.',
    'E nunca se esqueça: precisão primeiro, velocidade depois. Com carinho, eu do passado.'
  ]),
  X('l86', 'm15', 'Desafio final: grande mestre', 'A última lição do curso! Respire fundo, postura correta, olhos na tela. Você consegue!', 40, [
    'Parabéns por chegar até aqui! Você completou dezenas de lições, jogos e desafios.',
    'Agora seus dedos conhecem o caminho de cada tecla: da fileira base aos números, dos acentos aos símbolos.',
    'Essa habilidade vai acompanhar você na escola, no trabalho e em qualquer projeto que imaginar.',
    'Continue treinando nos jogos e no Desafio 60 segundos para ficar cada vez mais rápido.',
    'Daqui para frente, o teclado não é mais um obstáculo: é uma ferramenta para as suas ideias. Até a próxima, ninja!'
  ])
);

// Teclas conhecidas antes de cada lição de teclas/revisão.
{
  let acum = '';
  for (const l of LICOES) {
    l.conhecidas = acum;
    if (l.tipo === 'teclas') acum += l.novas;
    if (l.tipo === 'revisao') l.letras = acum;
  }
}

const ehLetra = c => /[a-zç]/.test(c);
const VOGAIS = 'aeiou';

function linha(gen, max = 46) {
  let s = '';
  for (let i = 0; i < 200; i++) {
    const g = gen(), t = s ? s + ' ' + g : g;
    if (t.length > max) { if (!s) s = t; break; }
    s = t;
  }
  return s;
}

function grupo(letras, n = 2 + Math.floor(Math.random() * 3)) {
  let g = '';
  for (let i = 0; i < n; i++) g += rnd(letras);
  return g;
}

function pseudo(letras) {
  const v = letras.filter(c => VOGAIS.includes(c)), cons = letras.filter(c => !VOGAIS.includes(c));
  if (!v.length || !cons.length) return grupo(letras);
  let s = '';
  const n = 1 + Math.floor(Math.random() * 2);
  for (let i = 0; i < n; i++) s += rnd(cons) + rnd(v);
  return s;
}

/** Palavras que podem ser digitadas só com as letras informadas. */
export function palavrasCom(letras) {
  const set = new Set(letras);
  return PALAVRAS.filter(w => [...w].every(c => set.has(c)));
}

/** Lista de palavras para jogos (sempre devolve algo jogável). */
export function palavrasPara(letras) {
  const p = palavrasCom([...letras]);
  if (p.length >= 12) return p;
  const ls = [...letras];
  return [...p, ...Array.from({ length: 30 }, () => pseudo(ls))];
}

function exTeclas(lic) {
  const novas = [...lic.novas];
  const nl = novas.filter(ehLetra), np = novas.filter(c => !ehLetra(c));
  const conhecidasL = [...lic.conhecidas].filter(ehLetra);
  const pontConhecida = [...lic.conhecidas].filter(c => !ehLetra(c));
  const todasL = [...new Set([...conhecidasL, ...nl])];
  const [a, b = a] = nl;
  const pont = [...np, ...pontConhecida];
  const pal = palavrasCom(todasL);
  const comNovas = pal.filter(w => nl.some(c => w.includes(c)));
  const fonte = comNovas.length >= 4 ? comNovas : pal.length >= 6 ? pal : null;
  const palavra = () => fonte ? rnd(fonte) : pseudo(todasL);
  return [
    linha(() => rnd([a + a + a, b + b + b, a + b, b + a, a + b + a, b + a + b, a + a + b + b])),
    linha(() => grupo(Math.random() < 0.5 ? nl : todasL) + (np.length && Math.random() < 0.35 ? rnd(np) : '')),
    linha(palavra),
    linha(() => palavra() + (pont.length && Math.random() < (np.length ? 0.4 : 0.15) ? rnd(pont) : ''), 52)
  ];
}

function exRevisao(lic) {
  const letras = [...new Set([...lic.letras])];
  const L = letras.filter(ehLetra), pont = letras.filter(c => !ehLetra(c));
  const pal = palavrasCom(L);
  const palavra = () => pal.length >= 6 ? rnd(pal) : pseudo(L);
  return Array.from({ length: 4 }, () => linha(() => palavra() + (pont.length && Math.random() < 0.15 ? rnd(pont) : ''), 56));
}

/** Gera os exercícios da lição (lições de teclas variam a cada tentativa). */
export function gerarExercicios(lic) {
  if (lic.exercicios) return lic.exercicios;
  if (lic.tipo === 'palavras') {
    // Percorre a lista embaralhada, sem repetir palavra até usar todas.
    let fila = [];
    const prox = () => { if (!fila.length) fila = embaralhar(lic.palavras); return fila.pop(); };
    return Array.from({ length: 4 }, () => linha(prox, 58));
  }
  return lic.tipo === 'revisao' ? exRevisao(lic) : exTeclas(lic);
}
