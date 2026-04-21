/* ============ portfolio.js — formfluX home page ============ */

/* ---------- Nav scroll state ---------- */
const nav = document.querySelector('.nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });
}

/* ---------- Lazy-load the 3D vessel demo ----------
   Three.js is ~150KB gzipped. Only fetch + init when the demo section
   is about to enter the viewport, so initial page load stays lean.
------------------------------------------------------ */
(function loadVesselDemo() {
  const demo = document.getElementById('vessel-demo');
  if (!demo) return;

  let loaded = false;
  const load = async () => {
    if (loaded) return;
    loaded = true;
    try {
      const mod = await import('./vessel-three.js');
      if (mod && typeof mod.init === 'function') mod.init();
    } catch (err) {
      console.error('vessel-three.js failed to load', err);
      const ph = document.getElementById('vessel-placeholder');
      if (ph) ph.querySelector('span').textContent = '3D scene unavailable';
    }
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { load(); io.unobserve(demo); }
      });
    }, { rootMargin: '400px 0px' });
    io.observe(demo);
  } else {
    // Old browser — just load it
    load();
  }
})();

/* ---------- Reveal on scroll ---------- */
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.proj, .proc__list li, .cv-block, .featured__demo').forEach(el => {
    io.observe(el);
  });
}
