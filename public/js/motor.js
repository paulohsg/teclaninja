// Motor de digitação: mostra o texto, confere cada tecla e mede PPM e precisão.
import { passos, shiftPara, dedoDe, DEDOS } from './teclado.js';
import { som, esc } from './ui.js';

const nomeDedo = d => `<span class="dot" data-dedo="${d}"></span><b>${DEDOS[d]?.nome || ''}</b>`;

export function textoDica(ch, ps, mortaOk) {
  if (!ps.length) return '';
  if (ps.length === 2) {
    const [a, b] = ps;
    if (!mortaOk) {
      const tecla = a.ch === '`' ? 'Shift + ´' : a.ch === '^' ? 'Shift + ~' : a.ch;
      return `Acento: pressione <kbd>${tecla}</kbd> com o ${nomeDedo(a.dedo)}, solte, e depois a letra <kbd>${b.ch.toUpperCase()}</kbd>`;
    }
    return `Agora a letra <kbd>${b.shift ? 'Shift + ' : ''}${b.ch.toUpperCase()}</kbd> com o ${nomeDedo(b.dedo)}`;
  }
  const p = ps[0];
  let s = `Tecla <kbd>${ch === ' ' ? 'Espaço' : esc(ch)}</kbd> → ${nomeDedo(p.dedo)}`;
  if (p.shift) {
    const sh = shiftPara(p.code);
    s += ` + <kbd>Shift ${sh === 'ShiftRight' ? 'direito' : 'esquerdo'}</kbd> com o ${nomeDedo(dedoDe(sh))}`;
  }
  return s;
}

export class Motor {
  constructor({ alvo, texto, teclado, maos, dica, onProgresso, onFim }) {
    Object.assign(this, { alvo, teclado, maos, dica, onProgresso, onFim });
    this.chars = [...texto.normalize('NFC')];
    this.pos = 0; this.acertos = 0; this.erros = 0; this.errosTecla = {};
    this.inicio = 0; this.fimT = 0; this.mortaOk = false; this.ativo = true;
    this.render();
    this._kd = e => this.tecla(e);
    window.addEventListener('keydown', this._kd);
    this.atualizar();
  }

  render() {
    let h = '', dentro = false;
    this.chars.forEach((c, i) => {
      if (c === ' ') {
        if (dentro) { h += '</span>'; dentro = false; }
        h += `<span class="c esp" data-i="${i}"> </span>`;
      } else {
        if (!dentro) { h += '<span class="pal">'; dentro = true; }
        h += `<span class="c" data-i="${i}">${esc(c)}</span>`;
      }
    });
    if (dentro) h += '</span>';
    this.alvo.innerHTML = h;
    this.alvo.scrollTop = 0;
    this.spans = [...this.alvo.querySelectorAll('.c')];
  }

  atualizar() {
    this.alvo.querySelector('.atual')?.classList.remove('atual');
    const sp = this.spans[this.pos];
    if (sp) {
      sp.classList.add('atual');
      const alvoTop = Math.max(0, sp.offsetTop - sp.offsetHeight * 1.2);
      if (Math.abs(this.alvo.scrollTop - alvoTop) > 4) this.alvo.scrollTo({ top: alvoTop, behavior: 'smooth' });
    }
    const ch = this.chars[this.pos];
    const ps = ch != null ? passos(ch) : [];
    const p = ps.length === 2 && this.mortaOk ? ps[1] : ps[0];
    this.teclado?.destacar(p);
    this.maos?.destacar(p ? [p.dedo, ...(p.shift ? [dedoDe(shiftPara(p.code))] : [])] : []);
    if (this.dica) this.dica.innerHTML = p ? textoDica(ch, ps, this.mortaOk) : '';
    this.onProgresso?.(this.stats());
  }

  tecla(e) {
    if (!this.ativo || e.ctrlKey || e.metaKey) return;
    if (e.altKey && !e.getModifierState?.('AltGraph')) return;
    const esperado = this.chars[this.pos];
    const ps = passos(esperado);
    if (e.key === 'Dead') {
      if (!this.inicio) this.inicio = performance.now();
      if (ps.length === 2 && !this.mortaOk && e.code === ps[0].code && e.shiftKey === !!ps[0].shift) {
        this.mortaOk = true; this.teclado?.flash(e.code, true); som.tecla(); this.atualizar();
      } else { this.mortaOk = false; this.errar(e.code, esperado); }
      return;
    }
    if (e.key.length !== 1) return;
    e.preventDefault();
    if (!this.inicio) this.inicio = performance.now();
    if (e.key === esperado) this.acertar(e.code);
    else { this.mortaOk = false; this.errar(e.code, esperado); }
  }

  acertar(code) {
    const sp = this.spans[this.pos];
    sp.classList.add('ok');
    this.acertos++; this.pos++; this.mortaOk = false;
    this.teclado?.flash(code, true); som.tecla();
    if (this.pos >= this.chars.length) return this.concluir();
    this.atualizar();
  }

  errar(code, esperado) {
    this.erros++;
    this.errosTecla[esperado] = (this.errosTecla[esperado] || 0) + 1;
    const sp = this.spans[this.pos];
    if (sp) { sp.classList.add('erro'); sp.classList.remove('tremer'); void sp.offsetWidth; sp.classList.add('tremer'); }
    this.teclado?.flash(code, false); som.erro();
    this.atualizar();
  }

  stats() {
    const fim = this.fimT || performance.now();
    const seg = this.inicio ? (fim - this.inicio) / 1000 : 0;
    const min = seg / 60, tot = this.acertos + this.erros;
    return {
      acertos: this.acertos, erros: this.erros, errosTecla: { ...this.errosTecla }, seg,
      ppm: min > 0.03 ? Math.round(this.acertos / 5 / min) : 0,
      precisao: tot ? Math.round(this.acertos * 1000 / tot) / 10 : 100,
      progresso: this.pos / this.chars.length
    };
  }

  concluir() {
    this.fimT = performance.now(); this.destruir();
    this.teclado?.destacar(null); this.maos?.destacar([]);
    this.onProgresso?.(this.stats());
    this.onFim?.(this.stats());
  }

  /** Interrompe (ex.: fim do tempo) e devolve as estatísticas. */
  parar(fimT) { if (!this.fimT) this.fimT = fimT || performance.now(); this.destruir(); return this.stats(); }

  destruir() { this.ativo = false; window.removeEventListener('keydown', this._kd); }
}
