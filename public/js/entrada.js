// Captura do que o aluno digita.
//
// Por que um campo invisível? Em vários sistemas (Chromebook principalmente) as letras
// acentuadas do ABNT2 não chegam como uma tecla: o sistema "compõe" o caractere
// (´ + a = á) e só entrega o resultado dentro de um campo de texto. Por isso todo o
// texto passa por um <textarea> invisível que fica sempre com o foco; o evento de
// tecla é usado só para saber qual tecla física foi apertada (para acender o teclado).

const ACENTOS = new Set(['´', '`', '~', '^', '¨']);
let campo = null, ouvinte = null, ultimo = { code: '', shift: false };

function criarCampo() {
  if (campo) return campo;
  campo = document.createElement('textarea');
  campo.className = 'captura';
  campo.setAttribute('aria-label', 'Área de digitação');
  for (const [k, v] of Object.entries({ autocomplete: 'off', autocorrect: 'off', autocapitalize: 'off', spellcheck: 'false', tabindex: '-1' })) campo.setAttribute(k, v);
  document.body.append(campo);

  campo.addEventListener('keydown', e => {
    ultimo = { code: e.code, shift: e.shiftKey };
    if (e.key === 'Tab') e.preventDefault();
    if (e.key === 'Dead') ouvinte?.onDead?.(e.code, e.shiftKey);
  });
  // Alguns sistemas avisam o acento pendente pela composição (em vez de "Dead").
  campo.addEventListener('compositionupdate', e => {
    if (e.data && [...e.data].length === 1 && ACENTOS.has(e.data)) ouvinte?.onDead?.(ultimo.code, ultimo.shift);
  });
  campo.addEventListener('compositionend', entregar);
  campo.addEventListener('input', e => {
    if (e.isComposing) return;
    // Colar ou arrastar texto não vale.
    if (e.inputType === 'insertFromPaste' || e.inputType === 'insertFromDrop') { campo.value = ''; return; }
    entregar();
  });
  campo.addEventListener('blur', () => setTimeout(focar, 0));
  addEventListener('pointerup', () => focar());
  addEventListener('focus', () => focar());
  return campo;
}

function entregar() {
  const texto = campo.value.normalize('NFC').replace(/[\r\n\t]/g, '');
  campo.value = '';
  if (texto && ouvinte) ouvinte.onTexto(texto, ultimo.code);
}

/** Mantém o foco no campo invisível enquanto alguém estiver ouvindo (sem rolar a página). */
function focar() {
  if (!ouvinte || !campo) return;
  const a = document.activeElement;
  if (a && a !== campo && a !== document.body && a.matches('input, select, textarea, [contenteditable]')) return;
  if (a !== campo) campo.focus({ preventScroll: true });
}

/**
 * Começa a ouvir a digitação. Só o último ouvinte recebe o texto.
 * onTexto(texto, code): o texto que entrou (normalmente 1 caractere) e o código da tecla física.
 * onDead(code, shift): o aluno apertou uma tecla de acento e o sistema aguarda a vogal.
 * Devolve uma função que para de ouvir.
 */
export function ouvirDigitacao({ onTexto, onDead }) {
  criarCampo();
  const eu = { onTexto, onDead };
  ouvinte = eu;
  campo.value = '';
  focar();
  return () => { if (ouvinte === eu) { ouvinte = null; campo.blur(); } };
}
