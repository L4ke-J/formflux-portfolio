/* ============ portfolio.js — formfluX home page ============ */

/* ---------- Nav scroll state ---------- */
const nav = document.querySelector('.nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });
}

/* ---------- Vessel SVG generator (parametric Trace Terra illustration) ---------- */
const vessel = document.getElementById('vessel-svg');
const vesselState = { layers: 22, amp: 6, taper: -8 };

function renderVessel() {
  if (!vessel) return;
  const { layers, amp, taper } = vesselState;
  const cx = 140, baseY = 200, topY = 24;
  const baseR = 70, topR = baseR + taper;
  const span = baseY - topY;

  const points = 64;
  const ringPoints = (yPct, r) => {
    const out = [];
    for (let i = 0; i <= points; i++) {
      const t = i / points;
      const ang = t * Math.PI * 2;
      const wave = Math.sin(ang * 6 + yPct * Math.PI * 4) * (amp * (0.4 + yPct * 0.6));
      const rr = r + wave;
      const x = cx + Math.cos(ang) * rr;
      const y = topY + (1 - yPct) * span + Math.sin(ang) * rr * 0.18;
      out.push([x, y]);
    }
    return out;
  };

  let svgInner = '';
  for (let l = 0; l <= layers; l++) {
    const t = l / layers;
    const r = topR + (baseR - topR) * t;
    const pts = ringPoints(1 - t, r);
    const path = pts.map(([x, y], i) => (i === 0 ? `M${x.toFixed(1)},${y.toFixed(1)}` : `L${x.toFixed(1)},${y.toFixed(1)}`)).join(' ');
    const opacity = 0.25 + t * 0.55;
    svgInner += `<path d="${path}" fill="none" stroke="var(--acc)" stroke-width="${(0.6 + t * 0.4).toFixed(2)}" opacity="${opacity.toFixed(2)}"/>`;
  }

  const baseW = baseR + amp * 0.6;
  svgInner += `<ellipse cx="${cx}" cy="${baseY}" rx="${baseW}" ry="${baseW * 0.18}" fill="var(--bg-3)" stroke="var(--acc)" stroke-width="0.8" opacity="0.9"/>`;

  const tWidth = topR + amp * 0.6;
  svgInner += `<ellipse cx="${cx}" cy="${topY}" rx="${tWidth}" ry="${tWidth * 0.22}" fill="none" stroke="var(--acc)" stroke-width="1.1"/>`;
  svgInner += `<line x1="20" y1="208" x2="260" y2="208" stroke="var(--rule-2)" stroke-width="0.5" stroke-dasharray="2,3"/>`;
  svgInner += `<g font-family="JetBrains Mono, monospace" font-size="7" fill="var(--ink-3)">
    <text x="14" y="216">0</text>
    <text x="244" y="216">280mm</text>
    <text x="${cx + tWidth + 4}" y="${topY + 3}">⌀ ${(tWidth * 2).toFixed(0)}</text>
    <text x="${cx + baseW + 4}" y="${baseY + 3}">⌀ ${(baseW * 2).toFixed(0)}</text>
  </g>`;

  vessel.innerHTML = svgInner;
}

document.querySelectorAll('.demo__controls input[type="range"]').forEach(input => {
  const key = input.dataset.key;
  const out = document.querySelector(`output[data-out="${key}"]`);
  input.addEventListener('input', () => {
    vesselState[key] = +input.value;
    if (out) out.textContent = input.value;
    renderVessel();
  });
});
renderVessel();

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
