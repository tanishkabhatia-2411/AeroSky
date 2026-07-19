const root = document.getElementById('root');

if (root) {
  root.setAttribute('data-app-ready', 'true');
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  document.documentElement.classList.add('motion-enabled');
}

window.addEventListener('resize', () => {
  document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
});

document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
