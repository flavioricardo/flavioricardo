// SPIKE v2 — gestos no palco → passos. decide() é pura (testada em input.test.mjs); bindInput() liga ao DOM.
export const WHEEL_PX = 40, SWIPE_PX = 40, SWIPE_MS = 400, TAP_MS = 300, TAP_PX = 10, GAP_MS = 120;

const hasStep = (state, dir) => (dir > 0 ? state.step < (state.last ?? 6) : state.step > 1);
const NONE = { action: null, capture: false, acc: 0 };

/** deltaY em pixels, qualquer deltaMode (Firefox com roda física manda linhas). */
export function wheelDelta(e, pageHeight = 800) {
  return e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? pageHeight : 1);
}

/** evt: {type:'wheel',dy,gap?} | {type:'swipe',dy,dt} | {type:'dbltap'} | {type:'key',key} | {type:'dot',n}
 *  state: {step, visible, busy, acc, origin}
 *  → {action:'next'|'prev'|'go'|null, n?, capture, acc, origin}
 *  origin diz o que o gesto de roda em curso está fazendo: 'stage' (já deu um passo; a inércia do trackpad é segurada),
 *  'page' (começou rolando a página; continua passando) ou null (assentado: gap ≥ GAP_MS desde o evento anterior). */
export function decide(evt, state) {
  const keep = state.origin ?? null;
  const held = { action: null, capture: true, acc: 0, origin: 'stage' };  // captura, mas não age (trava ou gesto fraco)
  switch (evt.type) {
    case 'wheel': {
      const origin = (evt.gap ?? Infinity) >= GAP_MS ? null : keep;
      if (origin === 'page') return { ...NONE, origin: 'page' };
      if (origin === 'stage') return held;
      const dir = Math.sign(evt.dy);
      if (!dir) return { ...NONE, acc: state.acc, origin: null };
      if (!state.visible || !hasStep(state, dir)) return { ...NONE, origin: 'page' };
      if (state.busy) return held;
      const acc = Math.sign(state.acc) === dir ? state.acc + evt.dy : evt.dy;
      if (Math.abs(acc) >= WHEEL_PX) return { action: dir > 0 ? 'next' : 'prev', capture: true, acc: 0, origin: 'stage' };
      return { action: null, capture: true, acc, origin: null };
    }
    case 'swipe': {
      const dir = -Math.sign(evt.dy);  // dedo pra cima = avançar
      if (!dir || !state.visible || !hasStep(state, dir)) return { ...NONE, origin: keep };
      if (state.busy) return { ...held, origin: keep };
      const ok = Math.abs(evt.dy) >= SWIPE_PX && evt.dt <= SWIPE_MS;
      return { action: ok ? (dir > 0 ? 'next' : 'prev') : null, capture: true, acc: 0, origin: keep };
    }
    case 'dbltap':
      return hasStep(state, 1) && !state.busy ? { action: 'next', capture: true, acc: 0, origin: keep } : { ...held, origin: keep };
    case 'key': {
      const dir = { ArrowDown: 1, ArrowRight: 1, ' ': 1, ArrowUp: -1, ArrowLeft: -1 }[evt.key];
      if (!dir || !hasStep(state, dir)) return { ...NONE, origin: keep };  // sem passo pra ir, a tecla fica com a página
      if (state.busy) return { ...held, origin: keep };
      return { action: dir > 0 ? 'next' : 'prev', capture: true, acc: 0, origin: keep };
    }
    case 'dot':
      return { action: 'go', n: evt.n, capture: true, acc: 0, origin: keep };
  }
  return { ...NONE, origin: keep };
}

/** Palco inteiro na tela (≥ 95 %), descontando o header fixo. */
export function watchVisible(stageEl, headerPx = 0) {
  const ref = { current: false };
  new IntersectionObserver(([en]) => { ref.current = en.intersectionRatio >= 0.95; },
    { threshold: [0, 0.95, 1], rootMargin: `-${headerPx}px 0px 0px 0px` }).observe(stageEl);
  return ref;
}

export function bindInput(stageEl, dotsEl, stage, visibleRef) {
  let acc = 0, origin = null, lastWheel = -Infinity, t0 = null, lastTap = 0, touchDbl = 0;
  const state = () => ({ step: stage.step, last: stage.last, visible: visibleRef.current, busy: stage.busy, acc, origin });
  const apply = r => {
    acc = r.acc; origin = r.origin;
    if (r.action === 'next') stage.next();
    else if (r.action === 'prev') stage.prev();
    else if (r.action === 'go') stage.go(r.n);
    return r.capture;
  };
  stageEl.addEventListener('wheel', e => {
    const now = performance.now();
    const r = decide({ type: 'wheel', dy: wheelDelta(e, innerHeight), gap: now - lastWheel }, state());
    lastWheel = now;
    if (apply(r)) e.preventDefault();
  }, { passive: false });
  stageEl.addEventListener('touchstart', e => { const t = e.touches[0]; t0 = { x: t.clientX, y: t.clientY, t: performance.now() }; }, { passive: true });
  stageEl.addEventListener('touchmove', e => {
    if (!t0) return;
    if (decide({ type: 'swipe', dy: e.touches[0].clientY - t0.y, dt: 0 }, state()).capture) e.preventDefault();
  }, { passive: false });
  stageEl.addEventListener('touchend', e => {
    if (!t0) return;
    const t = e.changedTouches[0], dy = t.clientY - t0.y, dx = t.clientX - t0.x, dt = performance.now() - t0.t;
    t0 = null;
    if (Math.abs(dy) >= SWIPE_PX) { apply(decide({ type: 'swipe', dy, dt }, state())); return; }
    if (Math.hypot(dx, dy) < TAP_PX) {
      const now = performance.now();
      if (now - lastTap <= TAP_MS) { lastTap = 0; touchDbl = now; apply(decide({ type: 'dbltap' }, state())); }
      else lastTap = now;
    }
  });
  stageEl.addEventListener('dblclick', () => { if (performance.now() - touchDbl > 500) apply(decide({ type: 'dbltap' }, state())); });
  stageEl.addEventListener('keydown', e => { if (apply(decide({ type: 'key', key: e.key }, state()))) e.preventDefault(); });
  dotsEl.addEventListener('click', e => { const b = e.target.closest('button[data-n]'); if (b) apply(decide({ type: 'dot', n: +b.dataset.n }, state())); });
}
