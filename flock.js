(function () {
  const CONFIG = {
    boidCount: 500,
    baseSpeed: 0.54,
    minSpeed: 0.36,
    maxSpeed: 0.84,
    topologicalNeighbors: 18,
    neighborRadius: 145,
    cellSize: 145,
    separationRadius: 21,
    settleDamping: 0.996,
    driftStrength: 0.0014,
    boundaryPull: 0.00018,
    flockMidY: 0.28,
    flockWaveAmp: 46,
    flockTopSoft: -0.03,
    flockTopHard: -0.06,
    flockBottomSoft: 0.71,
    flockBottomHard: 0.76,
    perceptionRearWeight: 0.22,
    perceptionSideBoost: 1.05,
    perceptionBaseWeight: 0.42,
    startleTurnBoost: 0.21,
    startleNoise: 0.16,
    startleDecay: 0.965,
    startlePeak: 0.42,
    maxTurnBase: 0.06,
    depthMin: 0.12,
    depthMax: 1.0,
    depthInfluencePx: 125,
    depthDrift: 0.00045,
    depthAlignWeight: 1.05,
    depthCohesionWeight: 0.08,
    depthSeparationWeight: 0.16,
    depthEase: 0.2,
    depthSoftMin: 0.1,
    depthSoftMax: 0.96,
    depthHardMin: 0.04,
    depthHardMax: 1.02,
    minDrawSize: 0.4,
    maxDrawSize: 3.8,
    perspectiveMin: 0.9,
    perspectiveMax: 1.18,
    avoidCenterStrength: 0.085,
    avoidCenterRadiusX: 0.34,
    avoidCenterRadiusY: 0.25,
    rightAffinityStrength: 0.11,
    rightAffinityX: 0.82,
    circleAlpha: 0.55,
    lineAlpha: 0.02,
    maxLinksPerFrame: 120,
    depthSortInterval: 3,
    flatDotThreshold: 2.2,
    waveSpeed: 13,
    waveWidth: 95,
    waveStrength: 1.15,
    waveLifetime: 145,
    waveTurnStrength: 0.075,
    waveDepthStrength: 0.0026,
    maxWaves: 3
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createCanvas() {
    const canvas = document.createElement("canvas");
    canvas.className = "dawn-flock-canvas";
    const root = document.querySelector(".reveal") || document.body;
    root.appendChild(canvas);
    return canvas;
  }

  function createBoid(width, height) {
    const z = rand(CONFIG.depthMin, CONFIG.depthMax);
    return {
      x: rand(width * 0.12, width),
      y: rand(height * 0.05, height * 0.58),
      vx: rand(-0.55, 0.55),
      vy: rand(-0.25, 0.25),
      vz: rand(-0.004, 0.004),
      z,
      hueShift: rand(-10, 10)
    };
  }

  function add(a, b) {
    a.x += b.x;
    a.y += b.y;
    return a;
  }

  function subtract(a, b) {
    return { x: a.x - b.x, y: a.y - b.y };
  }

  function scale(v, factor) {
    return { x: v.x * factor, y: v.y * factor };
  }

  function magnitude(v) {
    return Math.hypot(v.x, v.y);
  }

  function normalize(v) {
    const m = magnitude(v) || 1;
    return { x: v.x / m, y: v.y / m };
  }

  function limit(v, max) {
    const m = magnitude(v);
    return m > max ? scale(normalize(v), max) : v;
  }

  function rotateVector(v, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return { x: v.x * c - v.y * s, y: v.x * s + v.y * c };
  }

  function normalize3(v) {
    const m = Math.hypot(v.x, v.y, v.z) || 1;
    return { x: v.x / m, y: v.y / m, z: v.z / m };
  }

  function dot3(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  function steerWithTurnLimit(currentVel, desiredVel, maxTurn, blend) {
    const currentDir = normalize(currentVel);
    const desiredDir = normalize(desiredVel);
    const cross = currentDir.x * desiredDir.y - currentDir.y * desiredDir.x;
    const dot = clamp(currentDir.x * desiredDir.x + currentDir.y * desiredDir.y, -1, 1);
    const angle = Math.acos(dot);
    const turn = Math.sign(cross) * Math.min(angle, maxTurn);
    const turned = rotateVector(currentDir, turn);
    const target = scale(turned, magnitude(desiredVel));
    return {
      x: currentVel.x + (target.x - currentVel.x) * blend,
      y: currentVel.y + (target.y - currentVel.y) * blend
    };
  }

  function drawPolygonBands(ctx, width, height) {
    const horizon = height * 0.66;
    const bands = [
      {
        fill: "rgba(143, 161, 191, 0.13)",
        points: [
          [0, horizon + 50],
          [width * 0.13, horizon + 8],
          [width * 0.28, horizon + 52],
          [width * 0.42, horizon - 6],
          [width * 0.56, horizon + 48],
          [width * 0.75, horizon + 14],
          [width, horizon + 70],
          [width, height],
          [0, height]
        ]
      },
      {
        fill: "rgba(201, 164, 145, 0.10)",
        points: [
          [0, horizon + 100],
          [width * 0.1, horizon + 54],
          [width * 0.22, horizon + 118],
          [width * 0.38, horizon + 42],
          [width * 0.5, horizon + 96],
          [width * 0.65, horizon + 58],
          [width * 0.8, horizon + 126],
          [width, horizon + 76],
          [width, height],
          [0, height]
        ]
      },
      {
        fill: "rgba(91, 110, 140, 0.12)",
        points: [
          [0, height],
          [0, horizon + 155],
          [width * 0.15, horizon + 124],
          [width * 0.32, horizon + 165],
          [width * 0.48, horizon + 116],
          [width * 0.7, horizon + 172],
          [width * 0.86, horizon + 136],
          [width, horizon + 180],
          [width, height]
        ]
      }
    ];

    bands.forEach((band) => {
      ctx.beginPath();
      band.points.forEach(([x, y], index) => {
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = band.fill;
      ctx.fill();
    });
  }

  function cellKey(cx, cy) {
    return `${cx},${cy}`;
  }

  function projectBoid(boid, width, height) {
    const centerX = width * 0.5;
    const centerY = height * 0.43;
    const perspective =
      CONFIG.perspectiveMin + boid.z * (CONFIG.perspectiveMax - CONFIG.perspectiveMin);
    return {
      x: centerX + (boid.x - centerX) * perspective,
      y: centerY + (boid.y - centerY) * perspective
    };
  }

  function insertionSortByZ(items) {
    for (let i = 1; i < items.length; i += 1) {
      const value = items[i];
      let j = i - 1;
      while (j >= 0 && items[j].z > value.z) {
        items[j + 1] = items[j];
        j -= 1;
      }
      items[j + 1] = value;
    }
  }

  function getBirdSprite(radius, pixelRatio, spriteCache) {
    const quantizedRadius = Math.round(radius * 4) / 4;
    const flat = quantizedRadius <= CONFIG.flatDotThreshold;
    const key = `${pixelRatio}:${flat ? "flat" : "soft"}:${quantizedRadius.toFixed(2)}`;
    const cached = spriteCache.get(key);
    if (cached) return cached;

    const cssSize = Math.ceil(quantizedRadius * 2 + 4);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.ceil(cssSize * pixelRatio));
    canvas.height = Math.max(1, Math.ceil(cssSize * pixelRatio));
    const sctx = canvas.getContext("2d");
    sctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const center = cssSize / 2;
    sctx.beginPath();
    sctx.arc(center, center, quantizedRadius, 0, Math.PI * 2);
    if (flat) {
      sctx.fillStyle = "rgba(8, 10, 14, 0.85)";
      sctx.fill();
    } else {
      const fill = sctx.createRadialGradient(
        center,
        center,
        0,
        center,
        center,
        quantizedRadius
      );
      fill.addColorStop(0, "rgba(8, 10, 14, 1)");
      fill.addColorStop(0.55, "rgba(8, 10, 14, 0.42)");
      fill.addColorStop(1, "rgba(8, 10, 14, 0)");
      sctx.fillStyle = fill;
      sctx.fill();
    }

    const sprite = { canvas, cssSize };
    spriteCache.set(key, sprite);
    return sprite;
  }

  function init() {
    if (!document.body) {
      window.addEventListener("DOMContentLoaded", init, { once: true });
      return;
    }

    const canvas = createCanvas();
    const ctx = canvas.getContext("2d");
    const spriteCache = new Map();
    const state = {
      width: 0,
      height: 0,
      pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      boids: [],
      startle: 0,
      waves: [],
      drawBoids: [],
      frameCount: 0
    };

    function resize() {
      state.width = window.innerWidth;
      state.height = window.innerHeight;
      canvas.width = Math.round(state.width * state.pixelRatio);
      canvas.height = Math.round(state.height * state.pixelRatio);
      canvas.style.width = `${state.width}px`;
      canvas.style.height = `${state.height}px`;
      ctx.setTransform(state.pixelRatio, 0, 0, state.pixelRatio, 0, 0);

      if (!state.boids.length) {
        state.boids = Array.from({ length: CONFIG.boidCount }, () =>
          createBoid(state.width, state.height)
        );
        state.drawBoids = [...state.boids];
      }
    }

    function disturb() {
      state.startle = CONFIG.startlePeak;
      if (!state.boids.length) return;

      let cx = 0;
      let cy = 0;
      let cz = 0;
      state.boids.forEach((boid) => {
        cx += boid.x;
        cy += boid.y;
        cz += boid.z;
      });
      cx /= state.boids.length;
      cy /= state.boids.length;
      cz /= state.boids.length;

      state.waves.push({
        x: clamp(cx + rand(-state.width * 0.28, state.width * 0.06), 0, state.width),
        y: clamp(cy + rand(-state.height * 0.12, state.height * 0.1), 0, state.height),
        z: clamp(cz + rand(-0.18, 0.18), CONFIG.depthMin, CONFIG.depthMax),
        age: 0,
        speed: CONFIG.waveSpeed * rand(0.9, 1.08),
        width: CONFIG.waveWidth * rand(0.9, 1.15),
        strength: CONFIG.waveStrength * rand(0.92, 1.08)
      });

      if (state.waves.length > CONFIG.maxWaves) {
        state.waves = state.waves.slice(-CONFIG.maxWaves);
      }
    }

    function bindDisturbance() {
      const slidesRoot = document.querySelector(".reveal .slides");
      if (slidesRoot) {
        let rafToken = null;
        const observer = new MutationObserver((mutations) => {
          const changed = mutations.some(
            (mutation) =>
              mutation.type === "attributes" &&
              mutation.attributeName === "class" &&
              mutation.target instanceof HTMLElement &&
              mutation.target.classList.contains("present")
          );

          if (changed) {
            cancelAnimationFrame(rafToken);
            rafToken = requestAnimationFrame(disturb);
          }
        });

        observer.observe(slidesRoot, {
          subtree: true,
          attributes: true,
          attributeFilter: ["class"]
        });
      }

      window.addEventListener("hashchange", () => {
        disturb();
      });
      window.addEventListener("keydown", (event) => {
        if (
          ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "PageUp", "PageDown", " "].includes(
            event.key
          )
        ) {
          disturb();
        }
      });
    }

    function buildSpatialGrid(boids) {
      const grid = new Map();
      boids.forEach((boid) => {
        const cx = Math.floor(boid.x / CONFIG.cellSize);
        const cy = Math.floor(boid.y / CONFIG.cellSize);
        const key = cellKey(cx, cy);
        const bucket = grid.get(key);
        if (bucket) bucket.push(boid);
        else grid.set(key, [boid]);
      });
      return grid;
    }

    function stepBoid(boid, grid) {
      const cx = Math.floor(boid.x / CONFIG.cellSize);
      const cy = Math.floor(boid.y / CONFIG.cellSize);
      const local = [];
      let farthestIndex = -1;
      let farthestDistance = -Infinity;

      for (let dx = -1; dx <= 1; dx += 1) {
        for (let dy = -1; dy <= 1; dy += 1) {
          const bucket = grid.get(cellKey(cx + dx, cy + dy));
          if (!bucket) continue;
          for (let i = 0; i < bucket.length; i += 1) {
            const other = bucket[i];
            if (other === boid) continue;
            const delta = subtract(other, boid);
            const dz = (other.z - boid.z) * CONFIG.depthInfluencePx;
            const distance = Math.hypot(delta.x, delta.y, dz);
            if (distance > CONFIG.neighborRadius) continue;
            const neighbor = { other, distance, delta };

            if (local.length < CONFIG.topologicalNeighbors) {
              local.push(neighbor);
              if (distance > farthestDistance) {
                farthestDistance = distance;
                farthestIndex = local.length - 1;
              }
              continue;
            }

            if (distance >= farthestDistance) continue;

            local[farthestIndex] = neighbor;
            farthestDistance = local[0].distance;
            farthestIndex = 0;
            for (let j = 1; j < local.length; j += 1) {
              if (local[j].distance > farthestDistance) {
                farthestDistance = local[j].distance;
                farthestIndex = j;
              }
            }
          }
        }
      }

      let alignment = { x: 0, y: 0 };
      let cohesion = { x: 0, y: 0 };
      let separation = { x: 0, y: 0 };
      let alignmentZ = 0;
      let cohesionZ = 0;
      let separationZ = 0;
      const heading3 = normalize3({
        x: boid.vx,
        y: boid.vy,
        z: boid.vz * CONFIG.depthInfluencePx * 0.04
      });
      let weightSum = 0;
      let seen = 0;

      local.forEach(({ other, distance, delta }) => {
        const rel3 = normalize3({
          x: delta.x,
          y: delta.y,
          z: (other.z - boid.z) * CONFIG.depthInfluencePx
        });
        const forward = dot3(heading3, rel3);
        const lateral = 1 - Math.abs(forward);
        const perception =
          (CONFIG.perceptionBaseWeight + lateral * CONFIG.perceptionSideBoost) *
          (forward < -0.18 ? CONFIG.perceptionRearWeight : 1);

        alignment = add(alignment, { x: other.vx * perception, y: other.vy * perception });
        cohesion = add(cohesion, { x: other.x * perception, y: other.y * perception });
        alignmentZ += other.vz * perception;
        cohesionZ += other.z * perception;
        weightSum += perception;
        seen += 1;

        if (distance < CONFIG.separationRadius) {
          const away = scale(normalize(scale(delta, -1)), 1 / Math.max(distance, 1));
          separation = add(separation, scale(away, 0.55 + perception * 0.45));
          separationZ +=
            ((boid.z - other.z) / Math.max(distance, 1)) * (0.55 + perception * 0.45);
        }
      });

      let desired = { x: boid.vx, y: boid.vy };
      let desiredVz = boid.vz;
      let localStartle = state.startle;
      const waveBias = { x: 0, y: 0 };
      let waveVzBias = 0;

      for (let i = 0; i < state.waves.length; i += 1) {
        const wave = state.waves[i];
        const dx = boid.x - wave.x;
        const dy = boid.y - wave.y;
        const dz = (boid.z - wave.z) * CONFIG.depthInfluencePx;
        const distance = Math.hypot(dx, dy, dz);
        const radius = wave.age * wave.speed;
        const band = Math.exp(-0.5 * Math.pow((distance - radius) / wave.width, 2));
        if (band < 0.02) continue;

        const away = normalize({ x: dx || 1e-6, y: dy || 1e-6 });
        localStartle += band * wave.strength;
        waveBias.x += away.x * band * CONFIG.waveTurnStrength;
        waveBias.y += away.y * band * CONFIG.waveTurnStrength;
        waveVzBias +=
          ((boid.z - wave.z) / Math.max(distance, 1)) * band * CONFIG.waveDepthStrength;
      }

      if (seen > 0) {
        const norm = weightSum > 0 ? weightSum : seen;
        alignment = scale(alignment, 1 / norm);
        cohesion = scale(cohesion, 1 / norm);
        const towardCenter = normalize(subtract(cohesion, boid));
        const alignDir = normalize(alignment);
        const sepDir = normalize(separation);
        const panic = localStartle;
        const sepWeight = 0.95 + panic * 1.1;
        const cohWeight = 0.98 - panic * 0.2;
        const alignWeight = 1.2;
        desired = {
          x: alignDir.x * alignWeight + towardCenter.x * cohWeight + sepDir.x * sepWeight,
          y: alignDir.y * alignWeight + towardCenter.y * cohWeight + sepDir.y * sepWeight
        };

        alignmentZ /= norm;
        cohesionZ /= norm;
        desiredVz =
          alignmentZ * CONFIG.depthAlignWeight +
          (cohesionZ - boid.z) * CONFIG.depthCohesionWeight +
          separationZ * CONFIG.depthSeparationWeight;
      }

      desired.x += waveBias.x;
      desired.y += waveBias.y;
      desiredVz += waveVzBias;

      const targetY = state.height * CONFIG.flockMidY + Math.sin(boid.x * 0.004) * CONFIG.flockWaveAmp;
      const drift = {
        x: Math.sin(boid.y * 0.002 + boid.hueShift) * CONFIG.driftStrength,
        y: (targetY - boid.y) * CONFIG.boundaryPull
      };
      const panicNoise = localStartle * CONFIG.startleNoise;
      desired.x += drift.x + rand(-panicNoise, panicNoise);
      desired.y += drift.y + rand(-panicNoise, panicNoise);

      const centerX = state.width * 0.5;
      const centerY = state.height * 0.47;
      const rx = state.width * CONFIG.avoidCenterRadiusX;
      const ry = state.height * CONFIG.avoidCenterRadiusY;
      const nx = (boid.x - centerX) / rx;
      const ny = (boid.y - centerY) / ry;
      const radial = nx * nx + ny * ny;
      if (radial < 1.55) {
        const away = normalize({ x: nx, y: ny });
        const pressure = (1.55 - radial) / 1.55;
        desired.x += away.x * CONFIG.avoidCenterStrength * pressure;
        desired.y += away.y * CONFIG.avoidCenterStrength * pressure;
      }

      const rightTargetX = state.width * CONFIG.rightAffinityX;
      const rightPull = (rightTargetX - boid.x) / state.width;
      desired.x += clamp(rightPull, -0.12, 0.45) * CONFIG.rightAffinityStrength;

      const desiredDir = normalize(desired);
      const speedTarget =
        CONFIG.baseSpeed +
        localStartle * 0.48 +
        Math.sin((boid.x + boid.y) * 0.004 + boid.hueShift) * 0.08;
      const nextDesired = scale(desiredDir, clamp(speedTarget, CONFIG.minSpeed, CONFIG.maxSpeed));
      const maxTurn = CONFIG.maxTurnBase + localStartle * CONFIG.startleTurnBoost;
      const steered = steerWithTurnLimit({ x: boid.vx, y: boid.vy }, nextDesired, maxTurn, 0.34);
      boid.vx = steered.x * CONFIG.settleDamping;
      boid.vy = steered.y * CONFIG.settleDamping;

      const speed = clamp(
        magnitude({ x: boid.vx, y: boid.vy }),
        CONFIG.minSpeed * 0.95,
        CONFIG.maxSpeed + localStartle * 0.55
      );
      const dir = normalize({ x: boid.vx, y: boid.vy });
      boid.vx = dir.x * speed;
      boid.vy = dir.y * speed;

      boid.x += boid.vx;
      boid.y += boid.vy;
      desiredVz += (0.52 - boid.z) * CONFIG.depthDrift + rand(-0.001, 0.001) * localStartle;
      boid.vz += (desiredVz - boid.vz) * CONFIG.depthEase;
      boid.vz *= 0.985;
      boid.z += boid.vz;
      if (boid.z < CONFIG.depthSoftMin) boid.vz += 0.0026;
      if (boid.z > CONFIG.depthSoftMax) boid.vz -= 0.0026;
      boid.z = clamp(boid.z, CONFIG.depthHardMin, CONFIG.depthHardMax);
      if (boid.z <= CONFIG.depthHardMin + 0.001 || boid.z >= CONFIG.depthHardMax - 0.001) {
        boid.vz *= -0.55;
      }

      const margin = 40;
      if (boid.x < -margin) boid.x = state.width + margin;
      if (boid.x > state.width + margin) boid.x = -margin;
      if (boid.y < CONFIG.flockTopSoft * state.height) boid.vy += 0.055;
      if (boid.y > CONFIG.flockBottomSoft * state.height) boid.vy -= 0.05;

      boid.y = clamp(
        boid.y,
        CONFIG.flockTopHard * state.height,
        CONFIG.flockBottomHard * state.height
      );
    }

    function render() {
      ctx.clearRect(0, 0, state.width, state.height);
      drawPolygonBands(ctx, state.width, state.height);

      const gradient = ctx.createLinearGradient(0, 0, 0, state.height);
      gradient.addColorStop(0, "rgba(255, 246, 236, 0.15)");
      gradient.addColorStop(1, "rgba(204, 214, 229, 0.08)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, state.width, state.height);

      let liveWaveCount = 0;
      for (let i = 0; i < state.waves.length; i += 1) {
        const wave = state.waves[i];
        wave.age += 1;
        if (wave.age <= CONFIG.waveLifetime) {
          state.waves[liveWaveCount] = wave;
          liveWaveCount += 1;
        }
      }
      state.waves.length = liveWaveCount;

      const grid = buildSpatialGrid(state.boids);
      state.boids.forEach((boid) => {
        stepBoid(boid, grid);
      });

      state.boids.forEach((boid) => {
        const projected = projectBoid(boid, state.width, state.height);
        boid.projectedX = projected.x;
        boid.projectedY = projected.y;
        boid.drawSize = clamp(
          CONFIG.minDrawSize + boid.z * (CONFIG.maxDrawSize - CONFIG.minDrawSize),
          CONFIG.minDrawSize,
          CONFIG.maxDrawSize
        );
        boid.drawAlpha = CONFIG.circleAlpha * (0.58 + boid.z * 0.52);
        boid.sprite = getBirdSprite(boid.drawSize, state.pixelRatio, spriteCache);
      });

      let linksDrawn = 0;
      const stride = Math.max(1, Math.floor(state.boids.length / CONFIG.maxLinksPerFrame));
      for (let i = 0; i < state.boids.length && linksDrawn < CONFIG.maxLinksPerFrame; i += stride) {
        const a = state.boids[i];
        const b = state.boids[(i + 1) % state.boids.length];
        if (a === b) continue;
        const depthGap = Math.abs(a.z - b.z);
        const distance = Math.hypot(
          a.projectedX - b.projectedX,
          a.projectedY - b.projectedY,
          (a.z - b.z) * CONFIG.depthInfluencePx
        );
        if (distance > CONFIG.neighborRadius * 0.36) continue;
        const alpha =
          ((CONFIG.neighborRadius * 0.36 - distance) / (CONFIG.neighborRadius * 0.36)) *
          CONFIG.lineAlpha *
          (1 - depthGap);
        if (alpha <= 0.002) continue;
        ctx.beginPath();
        ctx.moveTo(a.projectedX, a.projectedY);
        ctx.lineTo(b.projectedX, b.projectedY);
        ctx.strokeStyle = `rgba(203, 214, 230, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        linksDrawn += 1;
      }

      state.frameCount += 1;
      if (
        state.drawBoids.length !== state.boids.length ||
        state.frameCount % CONFIG.depthSortInterval === 0
      ) {
        if (state.drawBoids.length !== state.boids.length) {
          state.drawBoids = [...state.boids];
        }
        insertionSortByZ(state.drawBoids);
      }

      ctx.globalAlpha = 1;
      state.drawBoids.forEach((boid) => {
        const sprite = boid.sprite;
        ctx.globalAlpha = boid.drawAlpha;
        ctx.drawImage(
          sprite.canvas,
          boid.projectedX - sprite.cssSize / 2,
          boid.projectedY - sprite.cssSize / 2,
          sprite.cssSize,
          sprite.cssSize
        );
      });
      ctx.globalAlpha = 1;

      state.startle *= CONFIG.startleDecay;
      requestAnimationFrame(render);
    }

    resize();
    bindDisturbance();
    disturb();
    window.addEventListener("resize", resize);
    requestAnimationFrame(render);
  }

  init();
})();
