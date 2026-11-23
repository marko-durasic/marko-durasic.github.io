/* Minimal progressive enhancement. All content remains visible without JS. */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const panel = document.querySelector('.studio-system');
  if (!panel || reduce || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const art = panel.querySelector('.studio-system__diagram');
  if (!art) return;
  panel.addEventListener('pointermove', (event) => {
    const bounds = panel.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    art.style.transform = 'translate(' + (x * 9).toFixed(2) + 'px, ' + (y * 9).toFixed(2) + 'px)';
  }, {passive:true});
  panel.addEventListener('pointerleave', () => {art.style.transform = '';});
})();
