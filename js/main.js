/**
 * THE SECRET FLOWER GARDEN - FULL-SCREEN GENERATIVE FLOWER ENGINE
 * Continuously grows, blooms, and regenerates glowing flowers across the entire screen.
 * Supports interactive touch/click to plant and bloom flowers on demand.
 */

document.addEventListener('DOMContentLoaded', () => {

  const canvas = document.getElementById('garden-canvas');
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Color palettes for flowers (feminine, glowing, romantic)
  const FLOWER_PALETTES = [
    {
      name: 'Rose Romance',
      base: '#ff3366',
      mid: '#ff758f',
      light: '#ffb3c6',
      tip: '#fff0f5',
      center: '#ffd166',
      halo: 'rgba(255, 77, 109, 0.35)'
    },
    {
      name: 'Blush Peony',
      base: '#d81b60',
      mid: '#f06292',
      light: '#ffccd5',
      tip: '#ffffff',
      center: '#ffb703',
      halo: 'rgba(240, 98, 146, 0.35)'
    },
    {
      name: 'Lavender Dream',
      base: '#7b2cbf',
      mid: '#c77dff',
      light: '#e0aaff',
      tip: '#fbf8ff',
      center: '#ffd166',
      halo: 'rgba(199, 125, 255, 0.3)'
    },
    {
      name: 'Peach Blossom',
      base: '#f72585',
      mid: '#ff85a1',
      light: '#fed0bb',
      tip: '#fff5eb',
      center: '#ffb703',
      halo: 'rgba(255, 133, 161, 0.35)'
    }
  ];

  const STEM_COLORS = ['#2d6a4f', '#40916c', '#52b788', '#74c69d'];

  // Global arrays
  let flowers = [];
  let driftingPetals = [];
  let fireflies = [];

  // ==========================================
  // FLOWER CLASS
  // ==========================================
  class Flower {
    constructor(targetX, targetY, isUserPlaced = false) {
      this.targetX = targetX;
      this.targetY = targetY;
      this.isUserPlaced = isUserPlaced;

      // Start stem from bottom of screen (or near bottom for high flowers)
      this.startX = targetX + (Math.random() - 0.5) * 80;
      this.startY = Math.min(height + 20, targetY + Math.random() * 250 + 150);

      // Bezier control points for natural curving stem
      const midY = (this.startY + targetY) / 2;
      const curveDir = (Math.random() - 0.5) * 70;
      this.cp1x = this.startX + curveDir;
      this.cp1y = this.startY - (this.startY - midY) * 0.5;
      this.cp2x = targetX - curveDir * 0.7;
      this.cp2y = midY;

      // Growth state
      this.stemProgress = 0; // 0 to 1
      this.stemSpeed = isUserPlaced ? 0.045 : 0.022; // Grows smoothly
      this.stemColor = STEM_COLORS[Math.floor(Math.random() * STEM_COLORS.length)];
      this.stemWidth = Math.random() * 1.5 + 2;

      // Leaves along the stem
      this.leaves = [
        { progress: 0.35, side: -1, size: Math.random() * 10 + 12, angle: -0.4 },
        { progress: 0.65, side: 1, size: Math.random() * 10 + 14, angle: 0.4 }
      ];

      // Blossom properties
      this.palette = FLOWER_PALETTES[Math.floor(Math.random() * FLOWER_PALETTES.length)];
      this.targetRadius = isUserPlaced ? Math.random() * 12 + 30 : Math.random() * 16 + 28;
      this.radius = 0;
      this.bloomProgress = 0; // 0 to 1
      this.bloomSpeed = isUserPlaced ? 0.035 : 0.02;
      this.petals = Math.floor(Math.random() * 4) + 6; // 6 to 9 petals per layer
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.003;
      this.swayAngle = Math.random() * Math.PI * 2;
      this.swaySpeed = Math.random() * 0.02 + 0.015;

      // Lifecycle
      this.age = 0;
      this.maxAge = isUserPlaced ? 700 : Math.random() * 350 + 400; // frames
      this.fading = false;
      this.opacity = 1;
    }

    update() {
      // Step 1: Grow stem
      if (this.stemProgress < 1) {
        this.stemProgress += this.stemSpeed;
        if (this.stemProgress >= 1) {
          this.stemProgress = 1;
        }
      } else {
        // Step 2: Bloom flower
        if (this.bloomProgress < 1) {
          this.bloomProgress += this.bloomSpeed;
          this.radius = this.targetRadius * Math.sin((this.bloomProgress * Math.PI) / 2);
          if (this.bloomProgress >= 1) {
            this.bloomProgress = 1;
            // Emit sparkle pollen burst when fully blooming
            for (let i = 0; i < 5; i++) {
              fireflies.push(new Firefly(this.targetX, this.targetY, this.palette.light));
            }
          }
        } else {
          // Mature state: gentle breathing & sway
          this.age++;
          this.rotation += this.rotSpeed;
          this.swayAngle += this.swaySpeed;

          // Occasionally shed a drifting petal into the breeze
          if (this.age % 140 === 0 && Math.random() > 0.4) {
            driftingPetals.push(new DriftingPetal(this.targetX, this.targetY, this.palette));
          }

          if (this.age > this.maxAge) {
            this.fading = true;
          }
        }
      }

      // Step 3: Fade out when finished lifecycle so new flowers regenerate
      if (this.fading) {
        this.opacity -= 0.012;
      }
    }

    draw(ctx) {
      if (this.opacity <= 0) return;

      ctx.save();
      ctx.globalAlpha = Math.max(0, this.opacity);

      // --- Draw Stem ---
      if (this.stemProgress > 0) {
        ctx.beginPath();
        ctx.strokeStyle = this.stemColor;
        ctx.lineWidth = this.stemWidth;
        ctx.lineCap = 'round';

        // Calculate current end of stem along Bezier
        const t = this.stemProgress;
        const currentEndX = Math.pow(1 - t, 3) * this.startX +
          3 * Math.pow(1 - t, 2) * t * this.cp1x +
          3 * (1 - t) * Math.pow(t, 2) * this.cp2x +
          Math.pow(t, 3) * this.targetX;
        const currentEndY = Math.pow(1 - t, 3) * this.startY +
          3 * Math.pow(1 - t, 2) * t * this.cp1y +
          3 * (1 - t) * Math.pow(t, 2) * this.cp2y +
          Math.pow(t, 3) * this.targetY;

        ctx.moveTo(this.startX, this.startY);
        ctx.quadraticCurveTo(this.cp1x, this.cp1y, currentEndX, currentEndY);
        ctx.stroke();

        // Draw leaves on stem
        this.leaves.forEach(leaf => {
          if (this.stemProgress >= leaf.progress) {
            const lt = leaf.progress;
            const lx = Math.pow(1 - lt, 3) * this.startX + 3 * Math.pow(1 - lt, 2) * lt * this.cp1x + 3 * (1 - lt) * Math.pow(lt, 2) * this.cp2x + Math.pow(lt, 3) * this.targetX;
            const ly = Math.pow(1 - lt, 3) * this.startY + 3 * Math.pow(1 - lt, 2) * lt * this.cp1y + 3 * (1 - lt) * Math.pow(lt, 2) * this.cp2y + Math.pow(lt, 3) * this.targetY;

            ctx.save();
            ctx.translate(lx, ly);
            ctx.rotate(leaf.side * leaf.angle);

            ctx.beginPath();
            ctx.fillStyle = this.stemColor;
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(leaf.side * leaf.size * 0.6, -leaf.size * 0.3, leaf.side * leaf.size, 0);
            ctx.quadraticCurveTo(leaf.side * leaf.size * 0.6, leaf.size * 0.3, 0, 0);
            ctx.fill();
            ctx.restore();
          }
        });
      }

      // --- Draw Blossom ---
      if (this.radius > 1) {
        // Subtle sway
        const swayOffset = Math.sin(this.swayAngle) * 3;
        const bloomX = this.targetX + swayOffset;
        const bloomY = this.targetY;

        // Radiant flower halo
        const haloGrad = ctx.createRadialGradient(bloomX, bloomY, 0, bloomX, bloomY, this.radius * 2.2);
        haloGrad.addColorStop(0, this.palette.halo);
        haloGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(bloomX, bloomY, this.radius * 2.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.translate(bloomX, bloomY);
        ctx.rotate(this.rotation);

        // Layer 1: Outer Petals
        this.drawPetalLayer(ctx, this.radius, this.petals, this.palette.base, this.palette.mid, this.palette.tip, 1);

        // Layer 2: Inner Petals (rotated offset for lush depth)
        ctx.rotate(Math.PI / this.petals);
        this.drawPetalLayer(ctx, this.radius * 0.72, this.petals, this.palette.mid, this.palette.light, this.palette.tip, 0.9);

        // Layer 3: Heart Center Core (Pistil / Stamen)
        ctx.beginPath();
        const centerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * 0.28);
        centerGrad.addColorStop(0, '#ffffff');
        centerGrad.addColorStop(0.5, this.palette.center);
        centerGrad.addColorStop(1, '#e85d04');
        ctx.fillStyle = centerGrad;
        ctx.arc(0, 0, this.radius * 0.28, 0, Math.PI * 2);
        ctx.fill();

        // Stamen golden dots
        const stamenCount = 8;
        ctx.fillStyle = '#fff9db';
        for (let i = 0; i < stamenCount; i++) {
          const sAngle = (i * Math.PI * 2) / stamenCount;
          const sx = Math.cos(sAngle) * (this.radius * 0.2);
          const sy = Math.sin(sAngle) * (this.radius * 0.2);
          ctx.beginPath();
          ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    }

    drawPetalLayer(ctx, r, count, colBase, colMid, colTip, alpha = 1) {
      for (let i = 0; i < count; i++) {
        ctx.save();
        const angle = (i * Math.PI * 2) / count;
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(0, 0);

        // Curving organic petal shape
        const w = r * 0.42;
        ctx.bezierCurveTo(-w, r * 0.35, -w * 0.9, r * 0.85, 0, r);
        ctx.bezierCurveTo(w * 0.9, r * 0.85, w, r * 0.35, 0, 0);

        const grad = ctx.createLinearGradient(0, 0, 0, r);
        grad.addColorStop(0, colBase);
        grad.addColorStop(0.5, colMid);
        grad.addColorStop(1, colTip);

        ctx.fillStyle = grad;
        ctx.globalAlpha = alpha;
        ctx.fill();

        // Petal contour line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.restore();
      }
    }
  }

  // ==========================================
  // DRIFTING PETALS (Breeze)
  // ==========================================
  class DriftingPetal {
    constructor(x, y, palette) {
      this.x = x || Math.random() * width;
      this.y = y || -10;
      this.size = Math.random() * 8 + 6;
      this.color = palette ? palette.mid : '#ff758f';
      this.speedY = Math.random() * 0.9 + 0.6;
      this.speedX = (Math.random() - 0.3) * 1.4;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.04;
      this.sway = Math.random() * Math.PI * 2;
      this.alpha = Math.random() * 0.4 + 0.6;
    }

    update() {
      this.sway += 0.03;
      this.x += this.speedX + Math.sin(this.sway) * 0.8;
      this.y += this.speedY;
      this.rotation += this.rotSpeed;
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;

      ctx.beginPath();
      ctx.ellipse(0, 0, this.size * 0.5, this.size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // ==========================================
  // FIREFLIES / SPARKLING POLLEN
  // ==========================================
  class Firefly {
    constructor(x, y, color) {
      this.x = x || Math.random() * width;
      this.y = y || Math.random() * height;
      this.size = Math.random() * 2.2 + 1;
      this.color = color || '#ffd166';
      this.speedX = (Math.random() - 0.5) * 0.8;
      this.speedY = (Math.random() - 0.5) * 0.8 - 0.2;
      this.alpha = Math.random() * 0.7 + 0.3;
      this.pulse = Math.random() * Math.PI * 2;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.pulse += 0.05;
      this.alpha = 0.4 + Math.sin(this.pulse) * 0.4;
    }

    draw(ctx) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.restore();
    }
  }

  // Pre-populate initial ambient fireflies & drifting petals
  for (let i = 0; i < 40; i++) {
    fireflies.push(new Firefly());
  }
  for (let i = 0; i < 18; i++) {
    driftingPetals.push(new DriftingPetal());
  }

  // ==========================================
  // SPAWN INITIAL FLOWERS
  // ==========================================
  function spawnFlower(x, y, isUser = false) {
    // Keep max flower count around 16 so canvas remains fluid
    if (flowers.length > 18) {
      flowers[0].fading = true; // Fade out the oldest flower
    }
    flowers.push(new Flower(x, y, isUser));
  }

  // Spawn an initial cluster of blooming flowers across screen
  function initGarden() {
    const flowerCount = Math.min(8, Math.floor(width / 110));
    for (let i = 0; i < flowerCount; i++) {
      const margin = 60;
      const x = margin + ((width - margin * 2) / (flowerCount + 1)) * (i + 1) + (Math.random() - 0.5) * 40;
      const y = height * (0.35 + Math.random() * 0.45);
      setTimeout(() => {
        spawnFlower(x, y, false);
      }, i * 400);
    }
  }
  initGarden();

  // Continuous ambient regeneration timer
  setInterval(() => {
    // If not too many active flowers, sprout a fresh one at a scenic location
    const activeFlowers = flowers.filter(f => !f.fading);
    if (activeFlowers.length < 14) {
      const x = Math.random() * (width - 120) + 60;
      const y = Math.random() * (height * 0.6) + height * 0.22;
      spawnFlower(x, y, false);
    }
  }, 2200);

  // ==========================================
  // INTERACTIVE TOUCH & CLICK SPROUTING
  // ==========================================
  let lastTouchTime = 0;
  function handlePlantEvent(x, y) {
    const now = Date.now();
    if (now - lastTouchTime < 120) return; // Smooth throttle
    lastTouchTime = now;

    // Fade hint on first interaction
    const hint = document.getElementById('garden-hint');
    if (hint) {
      hint.style.opacity = '0';
      setTimeout(() => hint.remove(), 600);
    }

    spawnFlower(x, y, true);

    // Burst 2-3 fireflies
    for (let i = 0; i < 3; i++) {
      fireflies.push(new Firefly(x, y, '#ffd166'));
    }
  }

  canvas.addEventListener('click', (e) => {
    handlePlantEvent(e.clientX, e.clientY);
  });

  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handlePlantEvent(touch.clientX, touch.clientY);
    }
  }, { passive: true });

  // ==========================================
  // MAIN ANIMATION LOOP
  // ==========================================
  function animate() {
    // Semi-clear for glowing light trails
    ctx.clearRect(0, 0, width, height);

    // Update & draw flowers
    for (let i = flowers.length - 1; i >= 0; i--) {
      const flower = flowers[i];
      flower.update();
      flower.draw(ctx);
      if (flower.opacity <= 0) {
        flowers.splice(i, 1);
      }
    }

    // Update & draw drifting petals
    for (let i = driftingPetals.length - 1; i >= 0; i--) {
      const petal = driftingPetals[i];
      petal.update();
      petal.draw(ctx);
      if (petal.y > height + 20 || petal.x < -20 || petal.x > width + 20) {
        driftingPetals.splice(i, 1);
      }
    }
    // Replenish ambient falling petals
    if (driftingPetals.length < 18) {
      driftingPetals.push(new DriftingPetal());
    }

    // Update & draw fireflies
    fireflies.forEach(firefly => {
      firefly.update();
      firefly.draw(ctx);
      if (firefly.y < -10) firefly.y = height + 10;
      if (firefly.y > height + 10) firefly.y = -10;
      if (firefly.x < -10) firefly.x = width + 10;
      if (firefly.x > width + 10) firefly.x = -10;
    });

    requestAnimationFrame(animate);
  }
  animate();

  // ==========================================
  // BIRTHDAY CARD MODAL INTERACTIONS
  // ==========================================
  const openBtn = document.getElementById('open-card-btn');
  const closeBtn = document.getElementById('close-card-btn');
  const modal = document.getElementById('card-modal');

  function openModal() {
    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeModal();
    }
  });

});
