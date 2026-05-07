/* ============ portfolio.js — formfluX home page ============ */

/* ---------- Nav scroll state ---------- */
const nav = document.querySelector('.nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });
}

/* ---------- Mobile menu toggle ----------
   Hamburger button toggles `body.menu-open`, which the CSS uses to
   show a full-screen overlay containing the nav links and the
   language toggle. Closes automatically when a nav link is tapped
   (so on-page anchors still scroll to the right place). */
(function mobileMenu() {
  const btn = document.querySelector('.nav__menu-toggle');
  if (!btn) return;
  const close = () => {
    document.body.classList.remove('menu-open');
    btn.setAttribute('aria-expanded', 'false');
  };
  btn.addEventListener('click', () => {
    const isOpen = document.body.classList.toggle('menu-open');
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    btn.setAttribute('aria-label', isOpen
      ? (document.documentElement.lang === 'zh-CN' ? '关闭菜单' : 'Close menu')
      : (document.documentElement.lang === 'zh-CN' ? '打开菜单' : 'Open menu'));
  });
  document.querySelectorAll('.nav__links a').forEach(a => {
    a.addEventListener('click', close);
  });
  // ESC closes the menu
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) close();
  });
})();

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
