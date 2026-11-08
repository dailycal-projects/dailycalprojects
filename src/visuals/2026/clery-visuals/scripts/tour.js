// Adapted from ucpd_crime_log/src/scripts/tour.js.
import { createScope } from '../lifecycle';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const KEY = 'clery-tour-seen';

export const tourSeen = () => { try { return localStorage.getItem(KEY) === '1'; } catch { return false; } };
const markSeen = () => { try { localStorage.setItem(KEY, '1'); } catch {} };

// Steps: { target: () => Element | DOMRect, text, before?: () => Promise | void, pad?, hole?: false to skip the spotlight }
export function runTour(steps, { root, onEnd } = {}) {
  const scope = createScope();
  const { listen } = scope;
  let k = 0;
  let ended = false;
  const hole = Object.assign(document.createElement('div'), { className: 'tour-hole' });
  const card = Object.assign(document.createElement('div'), { className: 'tour-card' });
  root.append(hole, card);

  function place() {
    if (ended) return;
    const s = steps[k];
    const t = s.target();
    if (!t) return;
    const r = t instanceof Element ? t.getBoundingClientRect() : t;
    const pad = s.pad ?? 6, m = 12;
    hole.classList.toggle('off', s.hole === false);
    Object.assign(hole.style, { left: `${r.left - pad}px`, top: `${r.top - pad}px`, width: `${r.width + pad * 2}px`, height: `${r.height + pad * 2}px` });
    const cw = card.offsetWidth, ch = card.offsetHeight;
    let top = r.bottom + pad + m;
    if (top + ch > innerHeight - m) top = r.top - pad - m - ch;
    card.style.top = `${clamp(top, m, innerHeight - ch - m)}px`;
    card.style.left = `${clamp(r.left + r.width / 2 - cw / 2, m, innerWidth - cw - m)}px`;
  }

  async function show() {
    const s = steps[k];
    await s.before?.();
    if (ended) return;
    const last = k === steps.length - 1;
    card.innerHTML = `<p>${s.text}</p><div><span>${k + 1}/${steps.length}</span>`
      + `<button data-a="skip">Skip</button>${k ? '<button data-a="back">Back</button>' : ''}`
      + `<button data-a="next" class="primary">${last ? 'Done' : 'Next'}</button></div>`;
    place();
  }

  function end() {
    cleanup();
    hole.remove(); card.remove();
  }

  // Skipping shrinks the card into the Help button so people see where to find it again.
  function skip() {
    const help = root.querySelector('#help');
    if (ended) return;
    if (!card.animate || !help?.animate || !hole.animate) return end();
    if (!help || matchMedia('(prefers-reduced-motion: reduce)').matches) return end();
    cleanup();
    const c = card.getBoundingClientRect(), h = help.getBoundingClientRect();
    const dx = h.left + h.width / 2 - (c.left + c.width / 2), dy = h.top + h.height / 2 - (c.top + c.height / 2);
    card.style.pointerEvents = 'none';
    hole.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' });
    card.animate([
      { transform: 'none', opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.06)`, opacity: 0.3 },
    ], { duration: 520, easing: 'cubic-bezier(.55,0,.7,.2)', fill: 'forwards' }).finished.then(() => {
      hole.remove(); card.remove();
      if (!root.isConnected) return;
      help.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.18)' },
        { transform: 'scale(1)' },
      ], { duration: 320, easing: 'ease-out' });
    });
  }

  function cleanup() {
    if (ended) return;
    ended = true;
    scope.dispose();
    markSeen();
    onEnd?.();
  }

  const key = (e) => {
    if (e.key === 'Escape') skip();
    else if (e.key === 'ArrowRight' || e.key === 'Enter') go(1);
    else if (e.key === 'ArrowLeft' && k) go(-1);
  };
  const go = (d) => { if (k + d >= steps.length) return end(); k += d; show(); };

  listen(card, 'click', (e) => {
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (a === 'next') go(1);
    else if (a === 'back') go(-1);
    else if (a === 'skip') skip();
  });
  listen(window, 'resize', place);
  listen(window, 'keydown', key);
  show();
  return { place, end };
}
