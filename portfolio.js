/* ============ portfolio.js — formfluX home page ============ */

/* ---------- Nav scroll state ---------- */
const nav = document.querySelector('.nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });
}

/* ---------- Differential-growth simulation (isometric loft) ----------
   The actual algorithm used to generate the final Trace Terra vessels
   in Houdini: a closed chain of nodes where each node (a) repels
   non-chain neighbours within a radius (Pressure), (b) is sprung
   toward its chain neighbours at a target spacing (Tension), and
   (c) receives a small jitter impulse each step (breaks symmetry
   so folds actually form). When an edge stretches past threshold,
   a new node is inserted — the curve grows and folds.

   Every few steps the ring is snapshotted into a history buffer,
   and every frame those snapshots are drawn as STACKED LAYERS in an
   isometric view — each layer lifted vertically above the last and
   foreshortened in Y, so the history stack reads as a 3D lofted
   vessel growing upward, exactly like the real project.

   Mouse Y over the widget tilts the view between near-top-down and
   near-side-on. No auto-rotation — user drives the 3D feel.
-------------------------------------------------------------------- */
(function diffGrowthSim() {
  const svg = document.getElementById('vessel-svg');
  if (!svg) return;

  const opts = {
    spacing: 8,
    repulsion: 22,
    speed: 2,
    repulsionStrength: 0.55,
    springStiffness: 0.26,
    damping: 0.86,
    jitter: 0.12,
    maxNodes: 520,
    growthMultiplier: 1.5,
    historyEvery: 3,
    historyMax: 54,
    boundary: { x0: 14, y0: 14, x1: 266, y1: 206, push: 0.06 },
  };

  // Isometric stack geometry
  const STACK = {
    cx: 140,              // horizontal centre of stack
    baseY: 222,           // y of the oldest layer
    layerH: 1.25,         // vertical distance between stacked layers
    yComp: 0.32,          // ring vertical compression (tilt / perspective)
    xSkew: 0.18,          // horizontal lean as layers stack (adds depth)
  };

  let nodes = [];
  let history = [];       // array of {pts: [{x,y}...], c: {x,y}} — centroid cached
  let historyCounter = 0;
  let tilt = STACK.yComp; // current tilt, lerped toward target by pointer
  let targetTilt = STACK.yComp;

  function seed() {
    nodes = [];
    const cx = 140, cy = 110, r = 22;
    const n = 32;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
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

  function centroid(pts) {
    let x = 0, y = 0;
    for (const p of pts) { x += p.x; y += p.y; }
    return { x: x / pts.length, y: y / pts.length };
  }

  function step() {
    const n = nodes.length;
    if (n < 3) return;

    const fx = new Float32Array(n);
    const fy = new Float32Array(n);
    const rsq = opts.repulsion * opts.repulsion;

    // Pairwise repulsion
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

    // Spring to chain neighbours
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

    // Growth
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

    // History snapshot
    historyCounter++;
    if (historyCounter >= opts.historyEvery) {
      const snap = nodes.map(p => ({ x: p.x, y: p.y }));
      history.push({ pts: snap, c: centroid(snap) });
      if (history.length > opts.historyMax) history.shift();
      historyCounter = 0;
    }
  }

  // Closed Catmull-Rom → cubic Béziers for smooth organic curves
  function buildCatmullClosed(pts) {
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

  // Project a ring onto the isometric stage at a given vertical offset (layer index)
  function projectLayer(pts, c, layerIdx) {
    const tOff = -(layerIdx * STACK.layerH);
    const xSkewOffset = layerIdx * STACK.xSkew; // layers lean slightly as they stack
    return pts.map(p => ({
      x: STACK.cx + (p.x - c.x) + xSkewOffset,
      y: STACK.baseY + tOff + (p.y - c.y) * tilt,
    }));
  }

  function render() {
    // lerp tilt toward target (smooth mouse response)
    tilt += (targetTilt - tilt) * 0.08;

    const total = history.length;
    let out =
      '<defs>' +
      '<filter id="g-glow" x="-10%" y="-10%" width="120%" height="120%">' +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="1.1"/></filter>' +
      '<linearGradient id="layer-grad" x1="0" y1="1" x2="0" y2="0">' +
      '<stop offset="0" stop-color="var(--acc)" stop-opacity="0.08"/>' +
      '<stop offset="1" stop-color="var(--acc)" stop-opacity="0.55"/>' +
      '</linearGradient>' +
      '</defs>';

    // Faint ground ruling — gives the stack a place to sit
    out += `<line x1="16" y1="${(STACK.baseY + 8).toFixed(0)}" x2="264" y2="${(STACK.baseY + 8).toFixed(0)}" stroke="var(--rule-2)" stroke-width="0.4" stroke-dasharray="2,3" opacity="0.5"/>`;

    // History layers — oldest first, newer paint on top
    for (let i = 0; i < total; i++) {
      const entry = history[i];
      const tr = projectLayer(entry.pts, entry.c, i);
      const path = buildCatmullClosed(tr);
      // age: 1 = oldest (bottom), 0 = newest (top)
      const age = (total - i) / total;
      const stroke = 0.09 + (1 - age) * 0.45;
      const width = 0.45 + (1 - age) * 0.4;
      out += `<path d="${path}" fill="none" stroke="var(--acc)" stroke-width="${width.toFixed(2)}" opacity="${stroke.toFixed(3)}"/>`;
    }

    // Live ring — the growing layer, drawn on top of the stack
    if (nodes.length > 3) {
      const liveC = centroid(nodes);
      const liveTr = projectLayer(nodes, liveC, total);
      const livePath = buildCatmullClosed(liveTr);
      out +=
        `<path d="${livePath}" fill="color-mix(in srgb, var(--acc) 12%, transparent)" ` +
        `stroke="color-mix(in srgb, var(--acc) 55%, transparent)" stroke-width="2.4" filter="url(#g-glow)"/>` +
        `<path d="${livePath}" fill="none" stroke="var(--acc)" stroke-width="1.15"/>`;
    }

    // Chrome readouts
    out +=
      `<g font-family="JetBrains Mono, monospace" font-size="8" fill="var(--ink-3)" letter-spacing="0.04em">` +
        `<text x="14" y="252">nodes · ${nodes.length}</text>` +
        `<text x="140" y="252" text-anchor="middle">layers · ${total}</text>` +
        `<text x="264" y="252" text-anchor="end">tilt · ${(tilt * 100 | 0)}%</text>` +
      `</g>`;

    svg.innerHTML = out;
  }

  let running = false;
  let resetAt = 0;
  function tick() {
    if (!running) return;
    const speed = Math.max(1, Math.round(opts.speed));
    for (let s = 0; s < speed; s++) step();
    render();
    if (nodes.length >= opts.maxNodes && !resetAt) {
      resetAt = performance.now() + 1600;
    }
    if (resetAt && performance.now() >= resetAt) {
      seed();
      resetAt = 0;
    }
    requestAnimationFrame(tick);
  }

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

  // Mouse-driven tilt — cursor Y within the widget shifts the view
  // between near-top-down (0.18) and near-side (0.56)
  const stage = svg.closest('.demo__stage');
  if (stage) {
    stage.addEventListener('pointermove', (e) => {
      const rect = stage.getBoundingClientRect();
      const py = (e.clientY - rect.top) / rect.height;          // 0..1
      targetTilt = 0.18 + Math.max(0, Math.min(1, py)) * 0.38;  // 0.18..0.56
    });
    stage.addEventListener('pointerleave', () => {
      targetTilt = STACK.yComp;
    });
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
