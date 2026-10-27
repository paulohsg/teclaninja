// Conteúdo do curso: módulos, lições, palavras e frases.
import { rnd } from './ui.js';

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
  return lic.tipo === 'revisao' ? exRevisao(lic) : exTeclas(lic);
}
