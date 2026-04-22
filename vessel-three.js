/* ============ vessel-three.js ============
   3D differential-growth vessel generator.

   Generates a Trace-Terra-style vessel by running differential growth
   across N stacked layers. Each layer evolves from the previous one,
   accumulating folds and flare, then is placed at increasing Y.

   Two render modes:
     - "wire"  — sage-green line loops, shows the algorithm's bones
     - "print" — warm clay tube geometry, shows what it looks like
                 coming off a clay 3D printer, filament by filament

   Camera orbits with gentle auto-rotate, pauses on user drag, resumes
   after idle. Near-full vertical rotation. Vessel auto-scales so any
   layer count fits the viewport.

   Exposed: init()
============================================== */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ---------- 2D differential growth ---------- */

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

/* Differential-growth step. Forces: inter-node repulsion, chain springs,
   jitter. Then integrate, add/remove nodes. Finally, if targetR is
   provided, project the ring's MEAN radius back to targetR — this is a
   uniform scale so folds (relative deformation) survive, but runaway
   outward drift is prevented across many iterations. */
function growStep(pts, cfg, targetR) {
  const n = pts.length;
  if (n < 3) return;
  const fx = new Float32Array(n);
  const fy = new Float32Array(n);
  const rsq = cfg.repulsion * cfg.repulsion;

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

  for (let i = 0; i < n; i++) {
    pts[i].vx = (pts[i].vx + fx[i] + (Math.random() - 0.5) * cfg.jitter) * cfg.damping;
    pts[i].vy = (pts[i].vy + fy[i] + (Math.random() - 0.5) * cfg.jitter) * cfg.damping;
    pts[i].x += pts[i].vx;
    pts[i].y += pts[i].vy;
  }

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

  // Node removal: if a node's chain neighbours are already close enough
  // (their direct distance < cfg.spacing * shrinkThreshold), the node is
  // redundant. Prevents pile-ups at small radii where the seed had more
  // nodes than the circumference can comfortably hold.
  if (pts.length > cfg.minNodes) {
    const rmThresh = cfg.spacing * cfg.shrinkThreshold;
    const rmThresh2 = rmThresh * rmThresh;
    for (let i = pts.length - 1; i >= 0; i--) {
      if (pts.length <= cfg.minNodes) break;
      const prev = pts[(i - 1 + pts.length) % pts.length];
      const next = pts[(i + 1) % pts.length];
      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      if (dx * dx + dy * dy < rmThresh2) {
        pts.splice(i, 1);
      }
    }
  }

  // Mean-radius normalization. Uniform scale, so folds (relative radius
  // variation around the mean) are preserved — only the ring's overall
  // size is pulled back to the target. Prevents runaway outward drift.
  if (targetR != null && pts.length > 2) {
    let meanR = 0;
    for (let i = 0; i < pts.length; i++) {
      meanR += Math.sqrt(pts[i].x * pts[i].x + pts[i].y * pts[i].y);
    }
    meanR /= pts.length;
    if (meanR > 0.001) {
      const s = targetR / meanR;
      for (let i = 0; i < pts.length; i++) {
        pts[i].x *= s;
        pts[i].y *= s;
      }
    }
  }
}

/* ---------- Vessel generation ---------- */

function generateVessel(userCfg) {
  const layers = Math.max(10, Math.round(userCfg.layers));
  const growth = userCfg.growth;
  const detail = userCfg.detail;
  const base = userCfg.base;

  // --- Parameter coupling for stability ---
  // spacing drops with detail, but floor keeps it > 1.0 so small base
  // circumferences can still host seed nodes without over-density.
  const spacing = Math.max(1.1, 0.9 + (10 - detail) * 0.2);   // 1.1 – 2.9
  // repulsion tied to spacing (always 2× target distance). If repulsion
  // is much larger than spacing the ring oscillates unstably; locking
  // the ratio is what prevents "chaos at high detail".
  const repulsion = spacing * 2.0;

  const cfg = {
    spacing,
    repulsion,
    repulsionStrength: 0.42,
    springStiffness: 0.28,
    damping: 0.84,
    jitter: 0.05,   // fixed, low — high detail shouldn't mean "noisy"
    maxNodes: 260,
    minNodes: 6,
    shrinkThreshold: 0.7,
    growthMultiplier: 1.5,
  };

  // Fewer steps when layer count is high, so folds don't over-develop
  // across 80+ sequential iterations. Total "sim work" stays roughly
  // constant (layers * steps ≈ 100–160) across the slider range.
  const stepsPerLayer = layers >= 80 ? 1 : layers >= 50 ? 2 : 3;

  // --- Printability gate (adaptive budget) ---
  // FDM clay extrusion holds ~35° local overhang from vertical before
  // the wet filament sags. We allocate this budget in two parts:
  //   1. Mean-radius flare: capped at MEAN_MAX° (the vessel's overall
  //      silhouette slope).
  //   2. Fold deviation evolution per layer: whatever budget is LEFT
  //      after the mean slope is accounted for. So when the cone flares
  //      at 25°, folds get a tight ~22° budget. When the wall is
  //      straight, folds get the full ~35°. Total local overhang stays
  //      bounded at TOTAL_MAX° regardless.
  const LAYER_H_REF = 0.11;            // must match buildWire/buildPrint LAYER_H
  // Total-overhang target: we aim to stay under 40° actual observed in
  // the measurement pass. In practice the sparse vertex-level clamp
  // leaves ~5° of slack (adjacent rings have different node counts,
  // interpolation between prev nodes misses local peaks), so we target
  // 33° in the clamp to land near 38° observed.
  const TOTAL_MAX_RAD = 33 * Math.PI / 180;
  const MEAN_MAX_RAD  = 22 * Math.PI / 180;
  const maxPrintableExtraR = Math.tan(MEAN_MAX_RAD) * LAYER_H_REF * (layers - 1);

  // Stability cap (unchanged): small-base + high-growth can't explode
  // the cone angle at the algorithm level.
  const stableExtraR = Math.min(growth * 0.8, Math.max(2, base * 3.5));

  // Take the tighter of the two limits.
  const finalExtraR = Math.min(stableExtraR, maxPrintableExtraR);
  const printLimited = stableExtraR > maxPrintableExtraR + 0.01;
  const actualOverhangDeg =
    Math.atan(finalExtraR / ((layers - 1) * LAYER_H_REF)) * 180 / Math.PI;

  // Adaptive fold-deviation budget: total tan() minus mean-slope tan().
  // Floor at a small value (≈ 6° equivalent) so folds never fully
  // freeze, even at maximum flare.
  const deltaMean = finalExtraR / Math.max(1, layers - 1);
  const maxPerLayerDevDelta = Math.max(
    0.012,    // ≈ tan(6°) × 0.11 — minimum fold drift, keeps character alive
    Math.tan(TOTAL_MAX_RAD) * LAYER_H_REF - deltaMean,
  );

  // Per-vertex fold-deviation clamp. For each node in the new ring, we
  // compare its DEVIATION from the new ring's mean radius against the
  // previous ring's deviation at the same angle. The delta is capped
  // at `maxDevDelta`, so folds can evolve smoothly between layers but
  // individual lobes can't gain/lose more than the clay-supportable
  // budget per layer. Decoupled from mean-slope flare, which has its
  // own global budget — this is what lets the demo generate real fold
  // character instead of safe-mode cones.
  //
  // Also returns the MAX observed absolute overhang across all vertex
  // pairs (in radians) so the UI can report the real printability,
  // not just the mean.
  function clampDeviationOverhang(currentPts, prevPts, maxDevDelta) {
    // Ring means
    let meanCurr = 0, meanPrev = 0;
    for (let k = 0; k < currentPts.length; k++) {
      meanCurr += Math.sqrt(currentPts[k].x * currentPts[k].x + currentPts[k].y * currentPts[k].y);
    }
    meanCurr /= currentPts.length;
    for (let k = 0; k < prevPts.length; k++) {
      meanPrev += Math.sqrt(prevPts[k].x * prevPts[k].x + prevPts[k].y * prevPts[k].y);
    }
    meanPrev /= prevPts.length;

    // Prev ring sorted by angle, storing DEVIATION from meanPrev.
    const prev = prevPts.map(p => {
      const r = Math.sqrt(p.x * p.x + p.y * p.y);
      return { a: Math.atan2(p.y, p.x), r, dev: r - meanPrev };
    }).sort((u, v) => u.a - v.a);
    const N = prev.length;
    if (N < 3) return 0;

    let maxAbsRadialDelta = 0;
    for (let k = 0; k < currentPts.length; k++) {
      const p = currentPts[k];
      const theta = Math.atan2(p.y, p.x);
      const r_curr = Math.sqrt(p.x * p.x + p.y * p.y);
      if (r_curr < 0.001) continue;
      const dev_curr = r_curr - meanCurr;

      // bracket theta
      let j = 0;
      while (j < N && prev[j].a < theta) j++;
      const lo = prev[(j - 1 + N) % N];
      const hi = prev[j % N];
      let da = hi.a - lo.a; if (da <= 0) da += 2 * Math.PI;
      let dt = theta - lo.a; if (dt < 0) dt += 2 * Math.PI;
      const t = da > 0 ? dt / da : 0;
      const dev_prev = lo.dev + (hi.dev - lo.dev) * t;
      const r_prev = lo.r + (hi.r - lo.r) * t;

      const ddev = dev_curr - dev_prev;
      if (Math.abs(ddev) > maxDevDelta) {
        const dev_new = dev_prev + Math.sign(ddev) * maxDevDelta;
        const r_new = meanCurr + dev_new;
        if (r_new > 0.01 && r_curr > 0.01) {
          const s = r_new / r_curr;
          p.x *= s; p.y *= s;
        }
      }

      // Track worst-case actual absolute overhang AFTER clamping
      const r_final = Math.sqrt(p.x * p.x + p.y * p.y);
      const absDR = Math.abs(r_final - r_prev);
      if (absDR > maxAbsRadialDelta) maxAbsRadialDelta = absDR;
    }
    return maxAbsRadialDelta;
  }

  // --- Layer 0: explicit mathematical circle at `base` radius ---
  // No simulation, no jitter. Guarantees a perfectly clean circular
  // bottom regardless of parameter combination. Node count matched to
  // circumference/spacing so the ring is stable as it grows.
  const seedN = Math.max(6, Math.min(36, Math.round((2 * Math.PI * base) / cfg.spacing)));
  const ring = [];
  for (let i = 0; i < seedN; i++) {
    const a = (i / seedN) * Math.PI * 2;
    ring.push({ x: Math.cos(a) * base, y: Math.sin(a) * base, vx: 0, vy: 0 });
  }

  const layerPts = [];
  layerPts.push({
    pts: ring.map(p => ({ x: p.x, y: p.y })),
    y: 0,
  });

  // Snapshot of the ring we just committed — used by the per-vertex
  // overhang clamp when generating the next ring.
  let prevSnapshot = ring.map(p => ({ x: p.x, y: p.y }));
  let maxLocalRadialDelta = 0;    // worst observed across all layers

  // --- Subsequent layers: uniform scale to new target radius, then
  // run growStep for fold development. Scaling handles the vase
  // profile; growStep only develops folds. They never fight. ---
  for (let i = 1; i < layers; i++) {
    const t = i / (layers - 1);
    const targetR = base + t * finalExtraR;

    let meanR = 0;
    for (let k = 0; k < ring.length; k++) {
      meanR += Math.sqrt(ring[k].x * ring[k].x + ring[k].y * ring[k].y);
    }
    meanR /= ring.length;
    const scale = meanR > 0.001 ? (targetR / meanR) : 1;
    for (let k = 0; k < ring.length; k++) {
      ring[k].x *= scale;
      ring[k].y *= scale;
      ring[k].vx = 0;   // reset velocities so scaling doesn't launch nodes
      ring[k].vy = 0;
    }

    for (let s = 0; s < stepsPerLayer; s++) growStep(ring, cfg, targetR);

    // Enforce per-vertex printability vs the previous committed ring,
    // on deviations-from-mean so folds get their own budget.
    const dR = clampDeviationOverhang(ring, prevSnapshot, maxPerLayerDevDelta);
    if (dR > maxLocalRadialDelta) maxLocalRadialDelta = dR;

    layerPts.push({
      pts: ring.map(p => ({ x: p.x, y: p.y })),
      y: i * LAYER_H_REF,
    });

    // Snapshot for the next iteration's clamp.
    prevSnapshot = ring.map(p => ({ x: p.x, y: p.y }));
  }

  // Actual worst-case overhang angle measured across the mesh after
  // the deviation clamp ran. This is the truth, not the mean-based
  // approximation — use it for the UI readout.
  const actualMaxOverhangDeg =
    Math.atan(maxLocalRadialDelta / LAYER_H_REF) * 180 / Math.PI;

  // Attach printability meta so the UI can surface it.
  layerPts.meta = {
    meanOverhangDeg: actualOverhangDeg,
    maxOverhangDeg: actualMaxOverhangDeg,
    printLimited,
    baseRadius: base,
    topRadius: base + finalExtraR,
  };
  return layerPts;
}

/* ---------- Catmull-Rom resample ---------- */

function smoothRing(pts, samples = 140) {
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
      const t2 = t * t, t3 = t2 * t;
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

/* ---------- Scene setup ---------- */

export function init() {
  const mount = document.getElementById('vessel-canvas');
  const placeholder = document.getElementById('vessel-placeholder');
  if (!mount) return;

  const SAGE  = '#b0d8a4';
  const CLAY  = '#c8c3b3';   // cool stone-neutral porcelain
  // World-unit height between stacked layers. Matches the filament
  // geometry below (2·TUBE_R·SQUASH_Y ≈ 0.102) so adjacent rings touch
  // in print mode, FDM-style. Wire mode inherits the same spacing so
  // switching modes doesn't change the vessel's proportions.
  const LAYER_H = 0.11;

  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
  camera.position.set(18, 12, 26);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  mount.appendChild(renderer.domElement);
  if (placeholder) placeholder.remove();

  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  const key = new THREE.DirectionalLight(0xffffff, 0.55);
  key.position.set(10, 18, 8);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 0.22);
  rim.position.set(-8, 6, -10);
  scene.add(rim);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.45;
  // Near-full vertical rotation — tiny buffer from exact poles only
  controls.minPolarAngle = 0.08;
  controls.maxPolarAngle = Math.PI - 0.08;

  let idleTimer = null;
  controls.addEventListener('start', () => {
    controls.autoRotate = false;
    if (idleTimer) clearTimeout(idleTimer);
  });
  controls.addEventListener('end', () => {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { controls.autoRotate = true; }, 2200);
  });

  const vesselGroup = new THREE.Group();
  scene.add(vesselGroup);

  /* ---------- Mode state ---------- */
  let mode = 'wire';          // 'wire' | 'print'
  let currentLayers = null;   // cached so mode-switch doesn't re-roll the dice

  function disposeVessel() {
    while (vesselGroup.children.length) {
      const c = vesselGroup.children.pop();
      c.geometry?.dispose();
      if (Array.isArray(c.material)) c.material.forEach(m => m.dispose());
      else c.material?.dispose();
    }
  }

  /* Build each layer at its natural world-scale position — no uniform
     scaling. The camera fits the resulting bounding box instead, so
     taller vessels actually look taller on screen. */
  function buildWire(layerData) {
    disposeVessel();
    const totalY = (layerData.length - 1) * LAYER_H;
    const yShift = -totalY * 0.5;

    for (let i = 0; i < layerData.length; i++) {
      const L = layerData[i];
      const smooth = smoothRing(L.pts, 180);
      const positions = new Float32Array(smooth.length * 3);
      for (let k = 0; k < smooth.length; k++) {
        positions[k * 3]     = smooth[k].x;
        positions[k * 3 + 1] = L.y + yShift;
        positions[k * 3 + 2] = smooth[k].y;
      }
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const age = i / Math.max(1, layerData.length - 1);
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(SAGE),
        transparent: true,
        opacity: 0.3 + age * 0.55,
      });
      vesselGroup.add(new THREE.LineLoop(geom, mat));
    }
  }

  function buildPrint(layerData) {
    disposeVessel();

    // FDM clay extrusion: layers sit directly on the one below and
    // squash ovally under their own weight. Filament dimensions tuned
    // so consecutive layers OVERLAP slightly (filament height > layer
    // height), which is what eliminates the thin dark gaps between
    // rings without making the whole vessel look smooth-skinned.
    //   filament vertical full = 2 * TUBE_R * SQUASH_Y = 0.1134
    //   LAYER_H                = 0.11
    //   overlap                = 0.0034 — just enough to close seams
    const LAYER_H_PRINT = LAYER_H;
    const TUBE_R = 0.09;
    const SQUASH_Y = 0.63;   // 1 = circular, <1 = squashed oval

    const totalY = (layerData.length - 1) * LAYER_H_PRINT;
    const yShift = -totalY * 0.5;

    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(CLAY),
      roughness: 0.42,      // soft satin — contemporary ceramic
      metalness: 0.02,
      flatShading: false,
    });

    // Closed base: a printed disc sitting just inside the first ring
    // so the bottom of the vessel reads as solid, not open. Its
    // thickness matches the squashed filament so it looks like FDM
    // infill laid down before the walls start.
    const L0 = layerData[0];
    let meanR0 = 0;
    for (let k = 0; k < L0.pts.length; k++) {
      meanR0 += Math.sqrt(L0.pts[k].x * L0.pts[k].x + L0.pts[k].y * L0.pts[k].y);
    }
    meanR0 /= L0.pts.length;
    const discR = Math.max(0.08, meanR0 - TUBE_R * 0.3);
    const discH = TUBE_R * SQUASH_Y * 2.0;
    const discGeom = new THREE.CylinderGeometry(discR, discR, discH, 96);
    const disc = new THREE.Mesh(discGeom, mat);
    disc.position.y = yShift;
    vesselGroup.add(disc);

    for (let i = 0; i < layerData.length; i++) {
      const L = layerData[i];
      // Pre-smooth the ring with the Catmull-Rom resampler. Raw ring
      // nodes (~10–30 of them) would give a slightly angular tube
      // path; upsampling to 240 gives a silky filament even when
      // zoomed in close.
      const smooth = smoothRing(L.pts, 240);
      const ringPts = smooth.map(p => new THREE.Vector3(p.x, 0, p.y));
      // Build the ring at LOCAL y = 0 inside the mesh, then translate
      // via mesh.position.y. mesh.scale.y only squashes the tube's
      // cross-section — the layer's position is unaffected.
      const curve = new THREE.CatmullRomCurve3(ringPts, true, 'catmullrom', 0.5);
      // Axial resolution ≥ ring resolution · radial 16 for a round
      // cross-section with no visible facets at close range.
      const tube = new THREE.TubeGeometry(curve, smooth.length, TUBE_R, 16, true);
      const mesh = new THREE.Mesh(tube, mat);
      mesh.position.y = i * LAYER_H_PRINT + yShift;
      mesh.scale.set(1, SQUASH_Y, 1);
      vesselGroup.add(mesh);
    }
  }

  /* Fit camera to the vessel's bounding box, preserving current orbit
     direction. Called after every build so the camera steps back as
     the vessel grows taller. */
  const _boxSize = new THREE.Vector3();
  const _boxCenter = new THREE.Vector3();
  const _dir = new THREE.Vector3();
  function fitCamera() {
    const box = new THREE.Box3().setFromObject(vesselGroup);
    if (box.isEmpty()) return;
    box.getSize(_boxSize);
    box.getCenter(_boxCenter);

    const halfFovY = (camera.fov * Math.PI / 180) / 2;
    const halfFovX = Math.atan(Math.tan(halfFovY) * camera.aspect);
    const distY  = (_boxSize.y / 2) / Math.tan(halfFovY);
    const distXZ = (Math.max(_boxSize.x, _boxSize.z) / 2) / Math.tan(halfFovX);
    const fitDist = Math.max(distY, distXZ) * 1.18; // tight padding

    controls.target.copy(_boxCenter);
    _dir.subVectors(camera.position, _boxCenter);
    if (_dir.lengthSq() < 0.001) _dir.set(0.7, 0.35, 1.0);
    _dir.normalize();
    camera.position.copy(_boxCenter).add(_dir.multiplyScalar(fitDist));
    controls.update();
  }

  function build() {
    if (!currentLayers) return;
    if (mode === 'wire') buildWire(currentLayers);
    else buildPrint(currentLayers);
    fitCamera();
  }

  /* ---------- Resize ---------- */
  function resize() {
    const w = mount.clientWidth  || 400;
    const h = mount.clientHeight || 300;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(mount);

  /* ---------- Controls ---------- */
  function readControls() {
    const map = {};
    document.querySelectorAll('.demo__controls input[type="range"]').forEach(i => {
      map[i.dataset.key] = +i.value;
    });
    return map;
  }

  function updatePrintInfo() {
    const el = document.getElementById('vessel-printinfo');
    if (!el || !currentLayers?.meta) return;
    const { maxOverhangDeg } = currentLayers.meta;
    const deg = Math.round(maxOverhangDeg);
    // Below 40° = comfortably within clay-print tolerance (green).
    // 40–45° = borderline, needs care when printing (amber).
    const marginal = deg >= 40;
    el.textContent = marginal
      ? `Printable with care · ${deg}° max overhang`
      : `Printable · ${deg}° max overhang`;
    el.classList.toggle('is-limited', marginal);
  }

  function regenerate() {
    const cfg = readControls();
    currentLayers = generateVessel(cfg);
    build();
    updatePrintInfo();
  }

  regenerate();

  document.querySelectorAll('.demo__controls input[type="range"]').forEach(input => {
    const out = document.querySelector(`output[data-out="${input.dataset.key}"]`);
    if (out) out.textContent = input.value;
    input.addEventListener('input', () => { if (out) out.textContent = input.value; });
    input.addEventListener('change', regenerate);
  });

  document.getElementById('vessel-generate')?.addEventListener('click', regenerate);

  const modeBtn = document.getElementById('vessel-mode');
  modeBtn?.addEventListener('click', () => {
    mode = (mode === 'wire') ? 'print' : 'wire';
    modeBtn.textContent = (mode === 'wire') ? 'Show as print' : 'Show as wire';
    build();
  });

  document.getElementById('vessel-download')?.addEventListener('click', () => {
    // Temporarily bump pixel ratio for a crisp export
    const prevPR = renderer.getPixelRatio();
    const size = new THREE.Vector2();
    renderer.getSize(size);
    renderer.setPixelRatio(Math.min(3, window.devicePixelRatio * 2));
    renderer.setSize(size.x, size.y, false);
    renderer.render(scene, camera);
    const url = renderer.domElement.toDataURL('image/png');
    renderer.setPixelRatio(prevPR);
    renderer.setSize(size.x, size.y, false);

    const a = document.createElement('a');
    a.href = url;
    a.download = `trace-terra-vessel-${mode}-${Date.now()}.png`;
    document.body.appendChild(a); a.click(); a.remove();
  });

  /* ---------- Render loop ---------- */
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
