// Teclado ABNT2: layout, mapa de dedos, desenho do teclado e das mãos.
import { esc } from './ui.js';

export const DEDOS = {
  L5: { nome: 'mínimo esquerdo' }, L4: { nome: 'anelar esquerdo' }, L3: { nome: 'médio esquerdo' }, L2: { nome: 'indicador esquerdo' },
  T: { nome: 'polegar' },
  R2: { nome: 'indicador direito' }, R3: { nome: 'médio direito' }, R4: { nome: 'anelar direito' }, R5: { nome: 'mínimo direito' }
};

const K = (code, n, s, d, w = 1, x = {}) => ({ code, n, s, d, w, ...x });
const letras = (str, dedos) => [...str].map((c, i) => K('Key' + c.toUpperCase(), c, c.toUpperCase(), dedos[i]));

// Cada linha soma 15 unidades de largura.
export const LINHAS = [
  [K('Backquote', "'", '"', 'L5'), K('Digit1', '1', '!', 'L5'), K('Digit2', '2', '@', 'L4'), K('Digit3', '3', '#', 'L3'),
   K('Digit4', '4', '$', 'L2'), K('Digit5', '5', '%', 'L2'), K('Digit6', '6', '¨', 'R2', 1, { mortaS: 1 }), K('Digit7', '7', '&', 'R2'),
   K('Digit8', '8', '*', 'R3'), K('Digit9', '9', '(', 'R4'), K('Digit0', '0', ')', 'R5'), K('Minus', '-', '_', 'R5'),
   K('Equal', '=', '+', 'R5'), K('Backspace', '⌫', '', 'R5', 2, { esp: 1 })],
  [K('Tab', 'Tab ↹', '', 'L5', 1.5, { esp: 1 }), ...letras('qwertyuiop', ['L5', 'L4', 'L3', 'L2', 'L2', 'R2', 'R2', 'R3', 'R4', 'R5']),
   K('BracketLeft', '´', '`', 'R5', 1, { morta: 1 }), K('BracketRight', '[', '{', 'R5'), K('Enter', 'Enter', '', 'R5', 1.5, { esp: 1 })],
  [K('CapsLock', 'Caps Lock', '', 'L5', 1.75, { esp: 1 }), ...letras('asdfghjkl', ['L5', 'L4', 'L3', 'L2', 'L2', 'R2', 'R2', 'R3', 'R4']),
   K('Semicolon', 'ç', 'Ç', 'R5'), K('Quote', '~', '^', 'R5', 1, { morta: 1 }), K('Backslash', ']', '}', 'R5'), K('Enter', '↵', '', 'R5', 1.25, { esp: 1 })],
  [K('ShiftLeft', 'Shift ⇧', '', 'L5', 1.25, { esp: 1 }), K('IntlBackslash', '\\', '|', 'L5'),
   ...letras('zxcvbnm', ['L5', 'L4', 'L3', 'L2', 'L2', 'R2', 'R2']),
   K('Comma', ',', '<', 'R3'), K('Period', '.', '>', 'R4'), K('Slash', ';', ':', 'R5'), K('IntlRo', '/', '?', 'R5'),
   K('ShiftRight', 'Shift ⇧', '', 'R5', 1.75, { esp: 1 })],
  [K('ControlLeft', 'Ctrl', '', 'L5', 1.25, { esp: 1 }), K('MetaLeft', '❖', '', 'L5', 1.25, { esp: 1 }), K('AltLeft', 'Alt', '', 'L5', 1.25, { esp: 1 }),
   K('Space', '', '', 'T', 6.25, { esp: 1 }), K('AltRight', 'Alt Gr', '', 'R5', 1.25, { esp: 1 }), K('MetaRight', '❖', '', 'R5', 1.25, { esp: 1 }),
   K('ContextMenu', '☰', '', 'R5', 1.25, { esp: 1 }), K('ControlRight', 'Ctrl', '', 'R5', 1.25, { esp: 1 })]
];

const MAPA = {}, DEDO_DE = {};
for (const linha of LINHAS) for (const k of linha) {
  DEDO_DE[k.code] = k.d;
  if (k.esp || k.morta) continue;
  if (k.n) MAPA[k.n] = { code: k.code, shift: false };
  if (k.s && !k.mortaS) MAPA[k.s] = { code: k.code, shift: true };
}
MAPA[' '] = { code: 'Space', shift: false };

// Teclas "mortas" do ABNT2 (acentos): pressiona o acento, solta, e depois a vogal.
const MORTAS = { '´': { code: 'BracketLeft', shift: false }, '`': { code: 'BracketLeft', shift: true }, '~': { code: 'Quote', shift: false }, '^': { code: 'Quote', shift: true } };
const COMB = { '´': '́', '`': '̀', '^': '̂', '~': '̃' };
const COMPOSTOS = {};
for (const [ac, vogais] of Object.entries({ '´': 'aeiouAEIOU', '`': 'aA', '^': 'aeoAEO', '~': 'aoAO' }))
  for (const v of vogais) COMPOSTOS[(v + COMB[ac]).normalize('NFC')] = [ac, v];

const passo = (ch, base, extra = {}) => ({ ...base, dedo: DEDO_DE[base.code], ch, ...extra });

/** Sequência de teclas físicas para digitar um caractere. */
export function passos(ch) {
  if (MAPA[ch]) return [passo(ch, MAPA[ch])];
  const c = COMPOSTOS[ch];
  if (c) return [passo(c[0], MORTAS[c[0]], { morta: true }), passo(c[1], MAPA[c[1]])];
  return [];
}
export const dedoDe = code => DEDO_DE[code];
/** Shift da mão oposta à tecla. */
export const shiftPara = code => (DEDO_DE[code] || '').startsWith('L') ? 'ShiftRight' : 'ShiftLeft';
export const codeDe = ch => passos(ch).at(-1)?.code;

function rotulo(k) {
  if (k.code === 'Space') return '';
  if (k.code.startsWith('Key') || k.code === 'Semicolon') return `<span class="ln">${esc(k.s)}</span>`;
  if (k.esp) return `<span class="lx">${esc(k.n)}</span>`;
  return `<span class="ls">${esc(k.s)}</span><span class="li">${esc(k.n)}</span>`;
}

/** Desenha o teclado ABNT2 colorido por dedo. */
export function criarTeclado(el, { cores = true } = {}) {
  el.classList.add('teclado');
  el.classList.toggle('sem-cores', !cores);
  el.innerHTML = LINHAS.map(l => `<div class="tl">${l.map(k =>
    `<div class="tc${k.esp ? ' esp' : ''}${k.code === 'KeyF' || k.code === 'KeyJ' ? ' marca' : ''}" data-code="${k.code}" data-dedo="${k.d}" style="flex:${k.w} 1 0">${rotulo(k)}</div>`
  ).join('')}</div>`).join('');
  const porCode = code => el.querySelectorAll(`[data-code="${code}"]`);
  return {
    el,
    destacar(p) {
      el.querySelectorAll('.alvo').forEach(e => e.classList.remove('alvo'));
      if (!p) return;
      porCode(p.code).forEach(e => e.classList.add('alvo'));
      if (p.shift) porCode(shiftPara(p.code)).forEach(e => e.classList.add('alvo'));
    },
    flash(code, ok) {
      porCode(code).forEach(e => { e.classList.remove('ok-f', 'erro-f'); void e.offsetWidth; e.classList.add(ok ? 'ok-f' : 'erro-f'); });
    },
    marcar(codes, cls = 'nova') { codes.forEach(c => porCode(c).forEach(e => e.classList.add(cls))); },
    calor(mapa) {
      const max = Math.max(1, ...Object.values(mapa));
      for (const [code, n] of Object.entries(mapa)) porCode(code).forEach(e => {
        e.style.setProperty('--calor', (0.15 + 0.85 * n / max).toFixed(2)); e.classList.add('quente'); e.title = `${n} erro(s)`;
      });
    }
  };
}

const MAO = (ids, espelho) => `<g${espelho ? ' transform="translate(430,0) scale(-1,1)"' : ''}>
  <rect class="palma" x="16" y="118" width="134" height="100" rx="46"/>
  <rect class="dedo" data-dedo="${ids[0]}" x="14" y="72" width="28" height="92" rx="14"/>
  <rect class="dedo" data-dedo="${ids[1]}" x="48" y="38" width="30" height="122" rx="15"/>
  <rect class="dedo" data-dedo="${ids[2]}" x="83" y="22" width="30" height="136" rx="15"/>
  <rect class="dedo" data-dedo="${ids[3]}" x="118" y="40" width="30" height="120" rx="15"/>
  <rect class="dedo" data-dedo="T" x="150" y="118" width="28" height="84" rx="14" transform="rotate(28 164 200)"/>
</g>`;

/** Desenha as duas mãos; destacar(['L2','T']) acende os dedos indicados. */
export function criarMaos(el) {
  el.classList.add('maos');
  el.innerHTML = `<svg viewBox="0 0 430 230" role="img" aria-label="Mãos: o dedo aceso é o que deve ser usado">${MAO(['L5', 'L4', 'L3', 'L2'])}${MAO(['R5', 'R4', 'R3', 'R2'], true)}</svg>`;
  return { destacar(dedos = []) { el.querySelectorAll('.dedo').forEach(d => d.classList.toggle('ativo', dedos.includes(d.dataset.dedo))); } };
}
