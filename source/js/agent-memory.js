// Progressive enhancement for this article; no changes to other posts.
(() => {
  function init() {
    const intro = document.getElementById('agent-memory-guide');
    const toc = document.querySelector('#card-toc .toc-content');
    if (!intro || !toc || document.querySelector('.memory-mobile-toc')) return;
    const details = document.createElement('details');
    details.className = 'memory-mobile-toc';
    const summary = document.createElement('summary');
    summary.textContent = '文章目录 · 点击展开';
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', '文章目录');
    toc.querySelectorAll('a.toc-link').forEach(link => {
      const copy = document.createElement('a');
      copy.href = link.getAttribute('href');
      copy.textContent = link.textContent;
      copy.className = link.closest('.toc-child') ? 'memory-subheading' : '';
      nav.append(copy);
    });
    details.append(summary, nav);
    intro.after(details);
  }
  document.addEventListener('click', event => {
    if (!document.getElementById('agent-memory-guide')) return;
    const link = event.target.closest('#card-toc .toc-link, .memory-mobile-toc a');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const hash = link.getAttribute('href');
    const heading = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!heading) return;
    event.preventDefault();
    event.stopPropagation();
    document.querySelector('.memory-mobile-toc')?.removeAttribute('open');
    document.getElementById('card-toc')?.classList.remove('open');
    history.pushState(null, '', hash);
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  }, true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  document.addEventListener('pjax:complete', init);
})();
