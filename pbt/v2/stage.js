// SPIKE v2 — uma timeline GSAP pausada com um rótulo por passo; go(n) faz tweenTo até o rótulo.
import { S4 } from './render.js';

export const LAST = 7;
const LOCK_MS = 700;
const TITLES = ['Location is the differentiator.', 'Delaware and Midland.', 'The Central Basin Platform.',
  'One contiguous position.', 'Surface above, minerals below.', 'Four secure lines of revenue.', 'Four lines of revenue: choose one.'];

export function createStage(root, L, { reduce = false } = {}) {
  const dots = [...root.querySelectorAll('.dots button')];
  const live = root.querySelector('#live');
  const [fx, fy] = L.focal;
  const Z = L.craneZoom;
  gsap.set([L.map, L.illo, L.crane], { svgOrigin: `${fx} ${fy}` });

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
  const P = L.pieces;
  tl.addLabel('s1', 0)
    .to(L.veilMap, { autoAlpha: 1, duration: 0.6 }, 0)
    .to([L.holes.delaware, L.holes.midland], { opacity: 1, duration: 0.6 }, 0.2)
    .addLabel('s2', 1.0)
    .to([L.holes.delaware, L.holes.midland], { opacity: 0, duration: 0.4 }, 1.0)
    .to(L.holes.cbp, { opacity: 1, duration: 0.5 }, 1.3)
    .addLabel('s3', 1.8)
    .to(L.map, { scale: S4, duration: 1.4 }, 1.8)
    .to(L.mapImg, { opacity: 0, duration: 0.42, ease: 'none' }, 1.8 + 0.56)      // 40%–70% do zoom: PNG sai, vetor fica
    .to(L.vec, { opacity: 1, duration: 0.42, ease: 'none' }, 1.8 + 0.56)
    .to(L.labels, { attr: { 'font-size': 26 / S4 }, duration: 1.4 }, 1.8)         // rótulos mantêm tamanho de tela
    .to(L.holes.cbp, { opacity: 0, duration: 0.4 }, 1.8)
    .to(L.holes.surface, { opacity: 1, duration: 0.5 }, 2.4)
    .to(L.veilMap, { attr: { 'fill-opacity': 0.45 }, duration: 0.6 }, 1.8)
    .addLabel('s4', 3.2)
    // 4 → 5: vetor e mapa Ward/Crane (alinhados pela acreage) aproximam juntos enquanto um vira o outro
    .to(L.map, { scale: S4 * Z, duration: 1.2 }, 3.2)
    .fromTo(L.crane, { scale: 1 }, { scale: Z, duration: 1.2 }, 3.2)
    .to(L.crane, { autoAlpha: 1, duration: 0.6, ease: 'none' }, 3.4)
    .to(L.map, { autoAlpha: 0, duration: 0.5, ease: 'none' }, 3.7)
    .addLabel('s5', 4.6)
    // 5 → 6: mapa detalhado cede à ilustração, que se monta em duas camadas
    .to(L.crane, { scale: Z * 1.6, duration: 0.8, ease: 'power2.in' }, 4.6)
    .to(L.crane, { autoAlpha: 0, duration: 0.8, ease: 'none' }, 4.6)
    .fromTo(L.illo, { scale: 0.35 }, { scale: 1, duration: 0.9, ease: 'power2.out' }, 4.7)
    .to(L.illo, { autoAlpha: 1, duration: 0.5, ease: 'none' }, 4.7)
    .fromTo(P.slab, { y: 40 }, { y: 0, opacity: 1, duration: 0.5 }, 5.4)
    .to(P.surface, { opacity: 1, duration: 0.6 }, 5.8)
    .addLabel('s6', 6.5)
    .to({}, { duration: 0.3 })
    .addLabel('s7', 6.8);

  let step = 1, busy = false;
  function go(n) {
    n = Math.max(1, Math.min(LAST, n | 0));
    if (busy || n === step) return;
    step = n;
    root.dataset.step = n;
    dots.forEach(b => +b.dataset.n === n ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current'));
    live.textContent = TITLES[n - 1];
    if (reduce) { tl.seek('s' + n); return; }
    busy = true;
    const t0 = performance.now();
    tl.tweenTo('s' + n, { onComplete() { setTimeout(() => { busy = false; }, Math.max(0, LOCK_MS - (performance.now() - t0))); } });
  }
  return { get step() { return step; }, get busy() { return busy; }, last: LAST, go, next: () => go(step + 1), prev: () => go(step - 1), tl, S4, Z };
}
