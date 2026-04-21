/* ============ portfolio.js — formfluX home page ============ */

/* ---------- Nav scroll state ---------- */
const nav = document.querySelector('.nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });
}

/* ---------- Differential-growth simulation ------------
   The actual algorithm used to generate the final Trace Terra vessels
   in Houdini. A closed chain of nodes where each node (a) repels
   non-chain neighbours within a radius (Pressure), (b) is sprung
   toward its chain neighbours at a target spacing (Tension), and
   (c) gets a small random perturbation each step (breaks symmetry
   so folds actually form). When an edge stretches past threshold, a
   new node is inserted — the curve grows and folds on itself.

   Rendered with a stacked-history trail: the last ~50 ring states
   are drawn underneath the live ring, fading out with age, echoing
   the loft-stack look of the real Trace Terra vessel geometry.
------------------------------------------------------- */
(function diffGrowthSim() {
  const svg = document.getElementById('vessel-svg');
  if (!svg) return;

  const opts = {
    spacing: 8,           // target distance between chain neighbours (Tension)
    repulsion: 22,        // radius at which non-chain nodes push apart (Pressure)
    speed: 2,             // simulation steps per render frame
    repulsionStrength: 0.55,
    springStiffness: 0.26,
    damping: 0.86,
    jitter: 0.12,         // per-step random impulse — breaks symmetry
    maxNodes: 520,
    growthMultiplier: 1.5,
    historyEvery: 3,      // steps between history snapshots
    historyMax: 48,       // number of previous rings to keep drawn
    boundary: { x0: 14, y0: 14, x1: 266, y1: 206, push: 0.06 },
  };

  let nodes = [];
  let history = [];       // array of paths (strings), newest last
  let historyCounter = 0;

  function seed() {
    nodes = [];
    const cx = 140, cy = 110, r = 22;
    const n = 32;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      // noisy seed so symmetry is broken from t=0
      const nr = r + (Math.random() - 0.5) * 1.6;
      nodes.push({
        x: cx + Math.cos(a) * nr + (Math.random() - 0.5) * 0.6,
        y: cy + Math.sin(a) * nr + (Math.random() - 0.5) * 0.6,
        vx: 0, vy: 0,
      });
    }
    history = [];
    historyCounter = 0;
  }

  function step() {
    const n = nodes.length;
    if (n < 3) return;

    const fx = new Float32Array(n);
    const fy = new Float32Array(n);
    const rsq = opts.repulsion * opts.repulsion;

    // Pairwise repulsion (O(n²) — fine up to ~520 nodes)
    for (let i = 0; i < n; i++) {
      const ax = nodes[i].x, ay = nodes[i].y;
      for (let j = i + 1; j < n; j++) {
        const dx = nodes[j].x - ax;
        const dy = nodes[j].y - ay;
        const d2 = dx * dx + dy * dy;
        if (d2 < rsq && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const strength = ((opts.repulsion - d) / opts.repulsion) * opts.repulsionStrength;
          const ux = dx / d, uy = dy / d;
          fx[i] -= ux * strength; fy[i] -= uy * strength;
          fx[j] += ux * strength; fy[j] += uy * strength;
        }
      }
    }

    // Spring toward chain neighbours
    for (let i = 0; i < n; i++) {
      const p = nodes[i];
      const prev = nodes[(i - 1 + n) % n];
      const next = nodes[(i + 1) % n];
      for (let k = 0; k < 2; k++) {
        const nb = k === 0 ? prev : next;
        const dx = nb.x - p.x, dy = nb.y - p.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 0.001;
        const f = (d - opts.spacing) * opts.springStiffness;
        fx[i] += (dx / d) * f;
        fy[i] += (dy / d) * f;
      }
    }

    // Soft boundary
    const b = opts.boundary;
    for (let i = 0; i < n; i++) {
      const p = nodes[i];
      if (p.x < b.x0) fx[i] += (b.x0 - p.x) * b.push;
      else if (p.x > b.x1) fx[i] -= (p.x - b.x1) * b.push;
      if (p.y < b.y0) fy[i] += (b.y0 - p.y) * b.push;
      else if (p.y > b.y1) fy[i] -= (p.y - b.y1) * b.push;
    }

    // Integrate + jitter
    const j = opts.jitter;
    for (let i = 0; i < n; i++) {
      nodes[i].vx = (nodes[i].vx + fx[i] + (Math.random() - 0.5) * j) * opts.damping;
      nodes[i].vy = (nodes[i].vy + fy[i] + (Math.random() - 0.5) * j) * opts.damping;
      nodes[i].x += nodes[i].vx;
      nodes[i].y += nodes[i].vy;
    }

    // Growth: insert midpoint where an edge is too long
    if (nodes.length < opts.maxNodes) {
      const threshold = opts.spacing * opts.growthMultiplier;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        const c = nodes[(i + 1) % nodes.length];
        const dx = c.x - a.x, dy = c.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > threshold) {
          nodes.splice(i + 1, 0, {
            x: (a.x + c.x) * 0.5,
            y: (a.y + c.y) * 0.5,
            vx: (a.vx + c.vx) * 0.5,
            vy: (a.vy + c.vy) * 0.5,
          });
          i++;
          if (nodes.length >= opts.maxNodes) break;
        }
      }
    }

    // History snapshot every N steps
    historyCounter++;
    if (historyCounter >= opts.historyEvery) {
      history.push(buildPath(nodes));
      if (history.length > opts.historyMax) history.shift();
      historyCounter = 0;
    }
  }

  /* Catmull-Rom (closed) smoothing — converts the polyline to a
     nicer curve, matching the soft organic read of the source. */
  function buildPath(pts) {
    const n = pts.length;
    if (n < 4) return '';
    let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n];
      const p1 = pts[i];
      const p2 = pts[(i + 1) % n];
      const p3 = pts[(i + 2) % n];
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return d + ' Z';
  }

  function render() {
    const live = buildPath(nodes);

    // history trails — oldest drawn first, faintest
    const max = history.length;
    let trails = '';
    for (let i = 0; i < max; i++) {
      const age = (max - i) / max;        // 1 = oldest, ~0 = newest
      const alpha = (0.05 + (1 - age) * 0.22).toFixed(3);
      trails += `<path d="${history[i]}" fill="none" stroke="var(--acc)" stroke-width="0.6" opacity="${alpha}"/>`;
    }

    svg.innerHTML =
      '<defs><filter id="g-glow" x="-10%" y="-10%" width="120%" height="120%">' +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="1.1"/></filter></defs>' +
      trails +
      `<path d="${live}" fill="color-mix(in srgb, var(--acc) 10%, transparent)" ` +
      `stroke="color-mix(in srgb, var(--acc) 55%, transparent)" stroke-width="2.6" ` +
      `filter="url(#g-glow)"/>` +
      `<path d="${live}" fill="none" stroke="var(--acc)" stroke-width="1.15"/>` +
      `<g font-family="JetBrains Mono, monospace" font-size="8" fill="var(--ink-3)" letter-spacing="0.04em">` +
        `<text x="14" y="214">nodes · ${nodes.length}</text>` +
        `<text x="264" y="214" text-anchor="end">iter · ${history.length * opts.historyEvery}</text>` +
      `</g>`;
  }

  let running = false;
  let resetAt = 0;
  function tick() {
    if (!running) return;
    const speed = Math.max(1, Math.round(opts.speed));
    for (let s = 0; s < speed; s++) step();
    render();
    if (nodes.length >= opts.maxNodes && !resetAt) {
      resetAt = performance.now() + 1500;
    }
    if (resetAt && performance.now() >= resetAt) {
      seed();
      resetAt = 0;
    }
    requestAnimationFrame(tick);
  }

  // Reduced-motion: static evolved form, no animation
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  seed();
  if (reducedMotion) {
    for (let i = 0; i < 400; i++) step();
    render();
    return;
  }
  render();

  // Pause when offscreen
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          if (!running) { running = true; tick(); }
        } else {
          running = false;
        }
      });
    }, { rootMargin: '120px 0px' });
    io.observe(svg);
  } else {
    running = true; tick();
  }

  // Wire sliders
  document.querySelectorAll('.demo__controls input[type="range"]').forEach(input => {
    const key = input.dataset.key;
    const out = document.querySelector(`output[data-out="${key}"]`);
    if (out) out.textContent = input.value;
    input.addEventListener('input', () => {
      opts[key] = +input.value;
      if (out) out.textContent = input.value;
    });
  });

  // Reset
  document.getElementById('demo-reset')?.addEventListener('click', () => {
    seed();
    resetAt = 0;
    render();
  });
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
