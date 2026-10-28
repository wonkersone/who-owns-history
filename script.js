const slides = [...document.querySelectorAll('.slide')];
const prev = document.querySelector('#previous');
const next = document.querySelector('#next');
const dialog = document.querySelector('#sources-dialog');
const fullscreen = document.querySelector('#fullscreen');
let current = 0;
const index = document.querySelector('.slide-index');
const steps = slides.map((slide, i) => {
  const button = document.createElement('button');
  button.setAttribute('aria-label', `Slide ${i + 1}: ${slide.dataset.name}`);
  button.addEventListener('click', () => show(i));
  index.append(button);
  return button;
});
function fromHash() {
  const match = location.hash.match(/^#slide-(\d+)$/);
  return match ? Number(match[1]) - 1 : 0;
}
function show(value, updateHash = true) {
  current = Math.max(0, Math.min(Number.isFinite(value) ? value : 0, slides.length - 1));
  slides.forEach((slide, i) => {
    const active = i === current;
    slide.classList.toggle('is-active', active);
    slide.setAttribute('aria-hidden', String(!active));
    slide.inert = !active;
    steps[i].setAttribute('aria-current', active ? 'step' : 'false');
    if (active) slide.scrollTop = 0;
  });
  document.body.dataset.theme = slides[current].classList.contains('paper') ? 'paper' : 'blue';
  document.querySelector('#counter').textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  document.querySelector('#chapter').textContent = slides[current].dataset.name;
  prev.disabled = current === 0;
  next.querySelector('.next-label').textContent = current === slides.length - 1 ? 'Restart' : 'Next';
  next.setAttribute('aria-label', current === slides.length - 1 ? 'Restart presentation' : 'Next slide');
  if (updateHash) history.replaceState(null, '', `#slide-${current + 1}`);
}
function advance() { show(current === slides.length - 1 ? 0 : current + 1); }
async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
  } catch { fullscreen.title = 'Use your browser full screen shortcut instead'; }
}
prev.addEventListener('click', () => show(current - 1));
next.addEventListener('click', advance);
fullscreen.addEventListener('click', toggleFullscreen);
if (!document.fullscreenEnabled) fullscreen.hidden = true;
document.addEventListener('fullscreenchange', () => {
  fullscreen.setAttribute('aria-label', document.fullscreenElement ? 'Exit full screen' : 'Enter full screen');
  fullscreen.innerHTML = document.fullscreenElement ? 'Exit full screen <span aria-hidden="true">⤢</span>' : 'Full screen <span aria-hidden="true">⤢</span>';
});
document.querySelector('#sources-open').addEventListener('click', () => dialog.showModal());
document.querySelector('#sources-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const box = dialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
});
document.addEventListener('keydown', event => {
  if (dialog.open || event.ctrlKey || event.altKey || event.metaKey || event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
  const isButton = event.target.closest('button,a');
  if (['ArrowRight', 'PageDown'].includes(event.key) || (event.key === ' ' && !isButton)) { event.preventDefault(); advance(); }
  if (['ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); show(current - 1); }
  if (event.key === 'Home') { event.preventDefault(); show(0); }
  if (event.key === 'End') { event.preventDefault(); show(slides.length - 1); }
  if (/^[1-8]$/.test(event.key)) show(Number(event.key) - 1);
  if (event.key.toLowerCase() === 'f') toggleFullscreen();
});
let pointerStart = null;
document.querySelector('.deck').addEventListener('pointerdown', event => {
  if (event.pointerType === 'mouse' || dialog.open) return;
  pointerStart = {x:event.clientX, y:event.clientY};
});
document.querySelector('.deck').addEventListener('pointerup', event => {
  if (!pointerStart) return;
  const dx = event.clientX - pointerStart.x;
  const dy = event.clientY - pointerStart.y;
  pointerStart = null;
  if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5) dx < 0 ? advance() : show(current - 1);
});
document.querySelector('.deck').addEventListener('pointercancel', () => { pointerStart = null; });
window.addEventListener('hashchange', () => show(fromHash(), false));
show(fromHash(), false);
