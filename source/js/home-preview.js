'use strict';
const starCanvas = document.querySelector('[data-starfield]');
if (starCanvas) {
  const context = starCanvas.getContext('2d');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let stars = [];
  let frame = 0;
  let width = 0;
  let height = 0;
  let last = performance.now();
  let pointerX = 0;
  let pointerY = 0;
  const random = seed => {
    const value = Math.sin(seed * 126.9898) * 43758.5453;
    return value - Math.floor(value);
  };
  function resizeStars() {
    const box = starCanvas.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio || 1, 2);
    width = Math.max(1, box.width);
    height = Math.max(1, box.height);
    starCanvas.width = Math.round(width * ratio);
    starCanvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.min(75, Math.max(28, Math.round(width * height / 18000)));
    stars = Array.from({length: count}, (_, index) => ({
      x: random(index + 3) * width,
      y: random(index + 71) * height,
      radius: .35 + Math.pow(random(index + 131), 6) * 2.1,
      depth: .25 + random(index + 181) * .75,
      phase: random(index + 241) * Math.PI * 2,
      speed: .4 + random(index + 307) * 1.1,
      driftX: 1.2 + random(index + 367) * 2.8,
      driftY: 9 + random(index + 419) * 12
    }));
    drawStars(performance.now(), 0);
  }
  function drawStars(now, delta) {
    context.clearRect(0, 0, width, height);
    for (const star of stars) {
      if (!reduceMotion) {
        star.x += delta * .001 * star.driftX * star.depth;
        star.y += delta * .001 * star.driftY * star.depth;
        if (star.x > width + 4) star.x = -4;
        if (star.y > height + 4) star.y = -4;
      }
      const twinkle = .55 + Math.sin(now * .001 * star.speed + star.phase) * .3;
      const x = star.x + pointerX * star.depth * 5;
      const y = star.y + pointerY * star.depth * 3;
      context.beginPath();
      context.arc(x, y, star.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(222,236,237,${Math.max(.22, twinkle)})`;
      if (star.radius > 1.25) {
        context.shadowColor = 'rgba(205,235,229,.75)';
        context.shadowBlur = 8;
      }
      context.fill();
      context.shadowBlur = 0;
    }
  }
  function animate(now) {
    const delta = Math.min(40, now - last);
    last = now;
    drawStars(now, delta);
    frame = requestAnimationFrame(animate);
  }
  const shell = starCanvas.closest('.sky-shell');
  shell.addEventListener('pointermove', event => {
    const box = shell.getBoundingClientRect();
    pointerX = event.clientX / box.width - .5;
    pointerY = (event.clientY - box.top) / box.height - .5;
  });
  shell.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; });
  new ResizeObserver(resizeStars).observe(starCanvas);
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(frame);
    if (!document.hidden && !reduceMotion) {
      last = performance.now();
      frame = requestAnimationFrame(animate);
    }
  });
  if (!reduceMotion) frame = requestAnimationFrame(animate);
}

const input = document.getElementById('article-search');
const buttons = [...document.querySelectorAll('[data-filter]')];
const rows = [...document.querySelectorAll('.post-row')];
let selected = 'all';
function filter() {
  const query = input.value.trim().toLocaleLowerCase();
  let count = 0;
  rows.forEach(row => {
    const matches = (selected === 'all' || row.dataset.group === selected) && query.split(/\s+/).every(word => row.dataset.search.includes(word));
    row.hidden = !matches;
    if (matches) count++;
  });
  document.querySelector('.empty').hidden = count > 0;
  document.getElementById('filter-status').textContent = query || selected !== 'all' ? `找到 ${count} 篇记录` : `${count} 篇记录，每一篇都是一次探索。`;
}
buttons.forEach(button => button.addEventListener('click', () => {
  selected = button.dataset.filter;
  buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  filter();
}));
input.addEventListener('input', filter);
document.querySelector('.search-shortcut').addEventListener('click', () => input.focus());
document.addEventListener('keydown', event => {
  if (event.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(event.target.tagName) && !event.target.isContentEditable && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault();
    input.focus();
    input.scrollIntoView({block:'center'});
  }
});
