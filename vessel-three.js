/* ============ vessel-three.js ============
   3D differential-growth vessel generator.

   Generates a Trace-Terra-style vessel by running differential growth
   across N stacked layers. Each layer evolves from the previous one
   (more expansive, more folded), then is placed at increasing Y.
   Rendered as wireframe line loops in a Three.js scene with an orbit
   camera that auto-rotates gently and pauses when the user drags.

   Exposed: init() — call once the module loads.
============================================== */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ---------- Differential growth in 2D ---------- */

function seedCircle(n, r, jitter = 0.4) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push({
      x: Math.cos(a) * r + (Math.random() - 0.5) * jitter,
      y: Math.sin(a) * r + (Math.random() - 0.5) * jitter,
      vx: 0, vy: 0,
    });
  }
  return pts;
}

function clonePts(pts) {
  return pts.map(p => ({ x: p.x, y: p.y, vx: 0, vy: 0 }));
}

function growStep(pts, cfg) {
  const n = pts.length;
  if (n < 3) return;
  const fx = new Float32Array(n);
  const fy = new Float32Array(n);
  const rsq = cfg.repulsion * cfg.repulsion;

  // Pairwise repulsion
  for (let i = 0; i < n; i++) {
    const ax = pts[i].x, ay = pts[i].y;
    for (let j = i + 1; j < n; j++) {
      const dx = pts[j].x - ax;
      const dy = pts[j].y - ay;
      const d2 = dx * dx + dy * dy;
      if (d2 < rsq && d2 > 0.01) {
        const d = Math.sqrt(d2);
        const s = ((cfg.repulsion - d) / cfg.repulsion) * cfg.repulsionStrength;
        const ux = dx / d, uy = dy / d;
        fx[i] -= ux * s; fy[i] -= uy * s;
        fx[j] += ux * s; fy[j] += uy * s;
      }
    }
  }

  // Chain springs
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const prev = pts[(i - 1 + n) % n];
    const next = pts[(i + 1) % n];
    for (let k = 0; k < 2; k++) {
      const nb = k === 0 ? prev : next;
      const dx = nb.x - p.x, dy = nb.y - p.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 0.001;
      const f = (d - cfg.spacing) * cfg.springStiffness;
      fx[i] += (dx / d) * f;
      fy[i] += (dy / d) * f;
    }
  }

  // Light outward radial pressure — ensures each layer expands a touch
  // relative to the one before it (so the vessel opens upward)
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const r = Math.sqrt(p.x * p.x + p.y * p.y) || 0.001;
    const push = cfg.flare;
    fx[i] += (p.x / r) * push;
    fy[i] += (p.y / r) * push;
  }

  // Integrate + jitter
  for (let i = 0; i < n; i++) {
    pts[i].vx = (pts[i].vx + fx[i] + (Math.random() - 0.5) * cfg.jitter) * cfg.damping;
    pts[i].vy = (pts[i].vy + fy[i] + (Math.random() - 0.5) * cfg.jitter) * cfg.damping;
    pts[i].x += pts[i].vx;
    pts[i].y += pts[i].vy;
  }

  // Growth: insert midpoint where edges are too long
  if (pts.length < cfg.maxNodes) {
    const threshold = cfg.spacing * cfg.growthMultiplier;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const c = pts[(i + 1) % pts.length];
      const dx = c.x - a.x, dy = c.y - a.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > threshold) {
        pts.splice(i + 1, 0, {
          x: (a.x + c.x) * 0.5,
          y: (a.y + c.y) * 0.5,
          vx: (a.vx + c.vx) * 0.5,
          vy: (a.vy + c.vy) * 0.5,
        });
        i++;
        if (pts.length >= cfg.maxNodes) break;
      }
    }
  }
}

/* ---------- Generate the full vessel (array of ring layers) ---------- */

function generateVessel(userCfg) {
  // Translate user-friendly params into algorithm params
  const layers = Math.max(10, Math.round(userCfg.layers));           // 30..100
  const growth = userCfg.growth;                                     // 1..10 — steps per layer
  const detail = userCfg.detail;                                     // 2..10 — spacing inversely

  const cfg = {
    spacing: 3 + (10 - detail) * 0.4,      // higher detail = smaller spacing = more nodes
    repulsion: 8 + (10 - detail) * 0.5,
    repulsionStrength: 0.45,
    springStiffness: 0.28,
    damping: 0.84,
    jitter: 0.08,
    flare: 0.03 + growth * 0.015,          // stronger growth = wider flare per layer
    maxNodes: 220,
    growthMultiplier: 1.45,
  };

  const stepsPerLayer = Math.max(1, Math.round(growth));

  // Seed ring — small, noisy circle for a "base"
  let ring = seedCircle(32, 2.0 + Math.random() * 0.6, 0.25);
  // Burn-in: a few quick steps so the first layer already has a little character
  for (let s = 0; s < 3; s++) growStep(ring, cfg);

  const layerPts = [];   // array of { pts: [...], y }
  for (let i = 0; i < layers; i++) {
    for (let s = 0; s < stepsPerLayer; s++) growStep(ring, cfg);
    // Clone current ring as this layer's geometry
    layerPts.push({
      pts: ring.map(p => ({ x: p.x, y: p.y })),
      y: i * 0.35,   // vertical spacing between layers
    });
  }
  return layerPts;
}

/* ---------- Closed Catmull-Rom resample for smooth rings ---------- */

function smoothRing(pts, samples = 120) {
  const n = pts.length;
  if (n < 4) return pts.slice();
  const out = [];
  const segPerSpan = Math.max(1, Math.floor(samples / n));
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    for (let s = 0; s < segPerSpan; s++) {
      const t = s / segPerSpan;
      const t2 = t * t;
      const t3 = t2 * t;
      const x = 0.5 * (
        (2 * p1.x) +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
      );
      const y = 0.5 * (
        (2 * p1.y) +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
      );
      out.push({ x, y });
    }
  }
  return out;
}

/* ---------- Three.js scene setup ---------- */

export function init() {
  const mount = document.getElementById('vessel-canvas');
  const placeholder = document.getElementById('vessel-placeholder');
  if (!mount) return;

  const ACC = '#b0d8a4';

  // Scene / camera / renderer
  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
  camera.position.set(18, 18, 28);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  mount.appendChild(renderer.domElement);
  if (placeholder) placeholder.remove();

  // Soft neutral lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 0.4);
  key.position.set(10, 14, 8);
  scene.add(key);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.45;
  controls.minPolarAngle = Math.PI * 0.18;
  controls.maxPolarAngle = Math.PI * 0.55;

  // Pause auto-rotate while user interacts, resume after idle
  let interactionTimer = null;
  controls.addEventListener('start', () => {
    controls.autoRotate = false;
    if (interactionTimer) clearTimeout(interactionTimer);
  });
  controls.addEventListener('end', () => {
    if (interactionTimer) clearTimeout(interactionTimer);
    interactionTimer = setTimeout(() => { controls.autoRotate = true; }, 2200);
  });

  // Vessel group
  const vesselGroup = new THREE.Group();
  scene.add(vesselGroup);

  // Subtle base plate
  const baseGeom = new THREE.CircleGeometry(6, 64);
  const baseMat = new THREE.MeshBasicMaterial({
    color: 0x181820, transparent: true, opacity: 0.55, side: THREE.DoubleSide,
  });
  const basePlate = new THREE.Mesh(baseGeom, baseMat);
  basePlate.rotation.x = -Math.PI / 2;
  basePlate.position.y = -0.3;
  scene.add(basePlate);

  // Reference ring at the base
  const baseRingGeom = new THREE.RingGeometry(5.9, 6.0, 96);
  const baseRingMat = new THREE.MeshBasicMaterial({ color: 0x2c2c34 });
  const baseRing = new THREE.Mesh(baseRingGeom, baseRingMat);
  baseRing.rotation.x = -Math.PI / 2;
  baseRing.position.y = -0.29;
  scene.add(baseRing);

  /* Build vessel wireframe from generated layer points */
  function buildVessel(layerData) {
    // dispose previous
    while (vesselGroup.children.length) {
      const c = vesselGroup.children.pop();
      c.geometry?.dispose();
      if (Array.isArray(c.material)) c.material.forEach(m => m.dispose());
      else c.material?.dispose();
    }

    const total = layerData.length;
    // Find max radius to normalise camera fit
    let maxR = 0;
    for (const L of layerData) {
      for (const p of L.pts) {
        const r = Math.sqrt(p.x * p.x + p.y * p.y);
        if (r > maxR) maxR = r;
      }
    }
    const scale = maxR > 0 ? 5.5 / maxR : 1;
    const totalY = (total - 1) * 0.35;

    // Build each layer as a closed LineLoop
    for (let i = 0; i < total; i++) {
      const L = layerData[i];
      const smooth = smoothRing(L.pts, 140);
      const positions = new Float32Array(smooth.length * 3);
      for (let k = 0; k < smooth.length; k++) {
        positions[k * 3]     = smooth[k].x * scale;
        positions[k * 3 + 1] = L.y - totalY * 0.5;  // centre vertically on origin
        positions[k * 3 + 2] = smooth[k].y * scale;
      }
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      // Older layers dimmer, newer layers brighter
      const age = i / Math.max(1, total - 1);
      const op  = 0.28 + age * 0.55;
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(ACC),
        transparent: true,
        opacity: op,
      });
      const line = new THREE.LineLoop(geom, mat);
      vesselGroup.add(line);
    }

    // Re-centre controls target
    controls.target.set(0, 0, 0);
  }

  /* Resize handling */
  function resize() {
    const w = mount.clientWidth  || 400;
    const h = mount.clientHeight || 300;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(mount);

  /* Generate with current control values */
  function readControls() {
    const map = {};
    document.querySelectorAll('.demo__controls input[type="range"]').forEach(i => {
      map[i.dataset.key] = +i.value;
    });
    return map;
  }

  function regenerate() {
    const cfg = readControls();
    const layers = generateVessel(cfg);
    buildVessel(layers);
  }

  regenerate();

  /* Hook sliders, generate button, download button */
  document.querySelectorAll('.demo__controls input[type="range"]').forEach(input => {
    const out = document.querySelector(`output[data-out="${input.dataset.key}"]`);
    if (out) out.textContent = input.value;
    input.addEventListener('input', () => { if (out) out.textContent = input.value; });
    input.addEventListener('change', regenerate);
  });

  document.getElementById('vessel-generate')?.addEventListener('click', regenerate);

  document.getElementById('vessel-download')?.addEventListener('click', () => {
    renderer.render(scene, camera);
    const url = renderer.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `trace-terra-vessel-${Date.now()}.png`;
    document.body.appendChild(a); a.click(); a.remove();
  });

  /* Render loop — pause when offscreen */
  let running = true;
  function tick() {
    if (!running) return;
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          if (!running) { running = true; tick(); }
        } else {
          running = false;
        }
      });
    }, { rootMargin: '200px 0px' });
    io.observe(mount);
  }
}
