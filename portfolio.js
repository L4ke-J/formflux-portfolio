/* ============ portfolio.js — formfluX home page ============ */

/* ---------- Nav scroll state ---------- */
const nav = document.querySelector('.nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });
}

/* ---------- Differential-growth simulation -----------
   The actual algorithm used to generate the final Trace Terra vessels:
   a closed chain of nodes where each node (a) repels neighbours within
   a radius (Pressure) and (b) is sprung toward its chain neighbours at
   a target spacing (Tension). When an edge stretches past threshold,
   a new node is inserted — the curve grows and folds on itself.
   Bounded by a soft wall so it stays in frame; auto-reseeds when it
   fills. Pauses when scrolled offscreen.
-------------------------------------------------------- */
(function diffGrowthSim() {
  const svg = document.getElementById('vessel-svg');
  if (!svg) return;

  const opts = {
    spacing: 9,           // target distance between chain neighbours (Tension)
    repulsion: 24,        // radius at which non-chain nodes push apart (Pressure)
    speed: 2,             // simulation steps per render frame
    repulsionStrength: 0.42,
    springStiffness: 0.22,
    damping: 0.88,
    maxNodes: 460,
    growthMultiplier: 1.55,  // edge-length / spacing threshold for inserting a new node
    boundary: { x0: 10, y0: 12, x1: 270, y1: 208, push: 0.05 },
  };

  let nodes = [];

  function seed() {
    nodes = [];
    const cx = 140, cy = 110, r = 28;
    const n = 36;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      nodes.push({
        x: cx + Math.cos(a) * r,
        y: cy + Math.sin(a) * r,
        vx: 0, vy: 0,
      });
    }
  }

  function step() {
    const n = nodes.length;
    if (n < 3) return;

    const fx = new Float32Array(n);
    const fy = new Float32Array(n);
    const rsq = opts.repulsion * opts.repulsion;

    // Pairwise repulsion (O(n²) naive — fine up to ~500 nodes)
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
      const nbs = [nodes[(i - 1 + n) % n], nodes[(i + 1) % n]];
      for (let k = 0; k < 2; k++) {
        const nb = nbs[k];
        const dx = nb.x - p.x, dy = nb.y - p.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 0.001;
        const f = (d - opts.spacing) * opts.springStiffness;
        fx[i] += (dx / d) * f;
        fy[i] += (dy / d) * f;
      }
    }

    // Soft boundary (keeps the form in frame)
    const b = opts.boundary;
    for (let i = 0; i < n; i++) {
      const p = nodes[i];
      if (p.x < b.x0) fx[i] += (b.x0 - p.x) * b.push;
      else if (p.x > b.x1) fx[i] -= (p.x - b.x1) * b.push;
      if (p.y < b.y0) fy[i] += (b.y0 - p.y) * b.push;
      else if (p.y > b.y1) fy[i] -= (p.y - b.y1) * b.push;
    }

    // Integrate
    for (let i = 0; i < n; i++) {
      nodes[i].vx = (nodes[i].vx + fx[i]) * opts.damping;
      nodes[i].vy = (nodes[i].vy + fy[i]) * opts.damping;
      nodes[i].x += nodes[i].vx;
      nodes[i].y += nodes[i].vy;
    }

    // Growth: insert midpoint where edge exceeds threshold
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
          i++; // skip newly inserted
          if (nodes.length >= opts.maxNodes) break;
        }
      }
    }
  }

  function render() {
    const d = nodes.map((p, i) =>
      (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1)
    ).join(' ') + ' Z';
    svg.innerHTML =
      '<defs><filter id="g-glow" x="-20%" y="-20%" width="140%" height="140%">' +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="1.4"/></filter></defs>' +
      `<path d="${d}" fill="color-mix(in srgb, var(--acc) 12%, transparent)" ` +
      `stroke="color-mix(in srgb, var(--acc) 55%, transparent)" stroke-width="2.6" ` +
      `stroke-linejoin="round" filter="url(#g-glow)"/>` +
      `<path d="${d}" fill="none" stroke="var(--acc)" stroke-width="1.05" stroke-linejoin="round"/>` +
      `<g font-family="JetBrains Mono, monospace" font-size="8" fill="var(--ink-3)" letter-spacing="0.04em">` +
        `<text x="14" y="214">nodes · ${nodes.length}</text>` +
        `<text x="264" y="214" text-anchor="end">growing</text>` +
      `</g>`;
  }

  let running = false;
  let resettingAt = 0;
  function tick() {
    if (!running) return;
    const speed = Math.max(1, Math.round(opts.speed));
    for (let s = 0; s < speed; s++) step();
    render();
    // When it fills, let it settle a beat then reseed so the loop keeps breathing
    if (nodes.length >= opts.maxNodes && !resettingAt) {
      resettingAt = performance.now() + 1400;
    }
    if (resettingAt && performance.now() >= resettingAt) {
      seed();
      resettingAt = 0;
    }
    requestAnimationFrame(tick);
  }

  // Reduced-motion: render a static, evolved state and stop
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  seed();
  if (reducedMotion) {
    // run ~300 steps without rendering, then render once
    for (let i = 0; i < 300; i++) step();
    render();
    return;
  }
  render();

  // Pause when the widget is offscreen
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
    resettingAt = 0;
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
