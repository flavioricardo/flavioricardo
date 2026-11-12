// SPIKE v2 — menu do último passo: hover/foco acende a luz do grupo (root.dataset.g), clique fixa, clique de novo solta.
import { LAST } from './stage.js';

export function bindMenu(menuEl, root) {
  let pinned = null;
  const active = () => root.dataset.step === String(LAST);
  const set = g => { if (g) root.dataset.g = g; else delete root.dataset.g; };
  const release = () => { pinned?.classList.remove('on'); pinned = null; };
  const over = e => { const it = e.target.closest('.item'); if (it && active() && !pinned) set(it.dataset.g); };
  menuEl.addEventListener('mouseover', over);
  menuEl.addEventListener('focusin', over);
  menuEl.addEventListener('mouseleave', () => { if (!pinned) set(null); });
  menuEl.addEventListener('focusout', e => { if (!pinned && !menuEl.contains(e.relatedTarget)) set(null); });
  menuEl.addEventListener('click', e => {
    const it = e.target.closest('.item');
    if (!it || !active()) return;
    if (pinned === it) { release(); set(it.dataset.g); return; }  // solta; segue aceso enquanto o ponteiro estiver em cima
    release();
    pinned = it;
    it.classList.add('on');
    set(it.dataset.g);
  });
  new MutationObserver(() => { if (!active()) { release(); set(null); } })
    .observe(root, { attributes: true, attributeFilter: ['data-step'] });
}
