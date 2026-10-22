/**
 * THE SECRET FLOWER GARDEN - CINEMATIC MASSIVE REGENERATING FLOWERS
 * Inspired by high-end luxury commercials: giant, multi-layered roses & peonies
 * dynamically unfurling, blooming, and regenerating across the full viewport.
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

  // Luxury Fragrance Commercial Palettes (Deep Velvet, Glowing Rose, Peony, Peach Gold)
  const LUXURY_PALETTES = [
    {
      name: 'Royal Velvet Rose',
      deep: '#590d22',
      base: '#a4133c',
      mid: '#ff4d6d',
      highlight: '#ff8fa3',
      edge: '#ffe5ec',
      stamen: '#ffd166',
      halo: 'rgba(255, 77, 109, 0.45)'
    },
    {
      name: 'Grand Peony Blossom',
      deep: '#4a0e2e',
      base: '#9d0258',
      mid: '#f72585',
      highlight: '#ff75c3',
      edge: '#ffffff',
      stamen: '#ffbe0b',
      halo: 'rgba(247, 37, 133, 0.4)'
    },
    {
      name: 'Champagne & Rose Gold',
      deep: '#3d1624',
      base: '#c9184a',
      mid: '#ff758f',
      highlight: '#ffb3c6',
      edge: '#fff0f5',
      stamen: '#ffeaa7',
      halo: 'rgba(255, 179, 198, 0.45)'
    },
    {
      name: 'Sunset Magenta & Peach',
      deep: '#3c0919',
      base: '#e01e5a',
      mid: '#ff6584',
      highlight: '#fed0bb',
      edge: '#ffffff',
      stamen: '#ff9f1c',
      halo: 'rgba(255, 101, 132, 0.45)'
    }
  ];

  const STEM_GRADIENTS = [
    ['#1b4332', '#2d6a4f', '#52b788'],
    ['#081c15', '#1b4332', '#40916c']
  ];

  let flowers = [];
  let petalsInWind = [];
  let bokehOrbs = [];
  let pollenSparks = [];

  // ==========================================
  // CINEMATIC BOKEH ORBS (Camera Lens Flare)
  // ==========================================
  class BokehOrb {
    constructor() {
      this.reset();
      this.y = Math.random() * height;
    }
    reset() {
      this.x = Math.random() * width;
      this.y = height + 50;
      this.radius = Math.random() * 50 + 25; // Large dreamy orbs
      this.speedY = Math.random() * 0.35 + 0.15;
      this.speedX = (Math.random() - 0.5) * 0.25;
      this.alpha = Math.random() * 0.18 + 0.05;
      this.hue = Math.random() > 0.4 ? 340 : 42; // Rose pink or warm champagne
    }
    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      if (this.y < -80) this.reset();
    }
    draw(ctx) {
      ctx.save();
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
      grad.addColorStop(0, `hsla(${this.hue}, 90%, 75%, ${this.alpha})`);
      grad.addColorStop(0.7, `hsla(${this.hue}, 85%, 65%, ${this.alpha * 0.5})`);
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < 22; i++) {
    bokehOrbs.push(new BokehOrb());
  }

  // ==========================================
  // MASSIVE CINEMATIC FLOWER CLASS
  // ==========================================
  class MassiveFlower {
    constructor(targetX, targetY, isUser = false) {
      this.targetX = targetX;
      this.targetY = targetY;
      this.isUser = isUser;

      // MASSIVE sizing: between 22% and 38% of min screen dimension!
      const minDim = Math.min(width, height);
      if (minDim < 600) {
        // Mobile: 130px to 210px radius (260px - 420px diameter!)
        this.maxRadius = isUser ? Math.random() * 30 + 150 : Math.random() * 50 + 130;
      } else {
        // Desktop / Tablet: 180px to 320px radius (360px - 640px diameter!)
        this.maxRadius = isUser ? Math.random() * 50 + 240 : Math.random() * 80 + 200;
      }

      this.currentRadius = 0;

      // Stem origins from screen borders (bottom or bottom corners)
      this.startX = targetX + (Math.random() - 0.5) * (width * 0.3);
      this.startY = height + 40;

      // Organic curved stem Bezier
      const dx = targetX - this.startX;
      const dy = targetY - this.startY;
      const dist = Math.hypot(dx, dy);

      this.cp1x = this.startX + dx * 0.3 + (Math.random() - 0.5) * 120;
      this.cp1y = this.startY + dy * 0.4;
      this.cp2x = targetX - dx * 0.2 + (Math.random() - 0.5) * 80;
      this.cp2y = targetY - dy * 0.3;

      this.stemProgress = 0;
      this.stemSpeed = isUser ? 0.05 : 0.025; // smooth dramatic rise
      this.stemWidth = Math.max(5, this.maxRadius * 0.055);
      this.stemColors = STEM_GRADIENTS[Math.floor(Math.random() * STEM_GRADIENTS.length)];

      // Large lush monstera/rose leaves along stem
      this.leaves = [
        { t: 0.32, side: -1, size: this.maxRadius * 0.42, angle: -0.45 },
        { t: 0.62, side: 1, size: this.maxRadius * 0.48, angle: 0.45 },
        { t: 0.82, side: -1, size: this.maxRadius * 0.38, angle: -0.38 }
      ];

      // Palette & Unfurling properties
      this.palette = LUXURY_PALETTES[Math.floor(Math.random() * LUXURY_PALETTES.length)];
      this.bloomProgress = 0; // 0 to 1
      this.bloomSpeed = isUser ? 0.025 : 0.016; // Elegant slow-motion bloom

      // 4 Dense Concentric Layers of petals for commercial 3D depth
      this.layers = [
        { count: 12, radiusRatio: 1.0, widthRatio: 0.48, delay: 0.0, col1: this.palette.deep, col2: this.palette.base, col3: this.palette.mid },
        { count: 10, radiusRatio: 0.82, widthRatio: 0.52, delay: 0.18, col1: this.palette.base, col2: this.palette.mid, col3: this.palette.highlight },
        { count: 8, radiusRatio: 0.62, widthRatio: 0.55, delay: 0.36, col1: this.palette.mid, col2: this.palette.highlight, col3: this.palette.edge },
        { count: 6, radiusRatio: 0.42, widthRatio: 0.58, delay: 0.52, col1: this.palette.highlight, col2: this.palette.edge, col3: '#ffffff' }
      ];

      this.baseRotation = Math.random() * Math.PI * 2;
      this.breatheAngle = Math.random() * Math.PI * 2;
      this.breatheSpeed = Math.random() * 0.018 + 0.012;

      // Lifecycle
      this.age = 0;
      this.maxAge = isUser ? 900 : Math.random() * 400 + 650;
      this.fading = false;
      this.opacity = 1;
      this.shedTimer = 0;
    }

    update() {
      // 1. Stem rises
      if (this.stemProgress < 1) {
        this.stemProgress += this.stemSpeed;
        if (this.stemProgress >= 1) this.stemProgress = 1;
      } else {
        // 2. Cinematic Unfurling of massive petals
        if (this.bloomProgress < 1) {
          this.bloomProgress += this.bloomSpeed;
          // Smooth cubic ease-out
          const p = this.bloomProgress;
          this.currentRadius = this.maxRadius * Math.sin((p * Math.PI) / 2);

          if (this.bloomProgress >= 1) {
            this.bloomProgress = 1;
            // Burst of golden stamen pollen
            for (let i = 0; i < 8; i++) {
              pollenSparks.push(new PollenSpark(this.targetX, this.targetY, this.palette.stamen));
            }
          }
        } else {
          // 3. Fully blooming: Breathing in the wind
          this.age++;
          this.breatheAngle += this.breatheSpeed;

          // Occasionally shed giant floating petal
          this.shedTimer++;
          if (this.shedTimer > 160 && Math.random() > 0.4) {
            this.shedTimer = 0;
            petalsInWind.push(new GiantPetal(this.targetX, this.targetY, this.maxRadius * 0.45, this.palette));
          }

          if (this.age > this.maxAge) {
            this.fading = true;
          }
        }
      }

      if (this.fading) {
        this.opacity -= 0.009;
      }
    }

    draw(ctx) {
      if (this.opacity <= 0) return;

      ctx.save();
      ctx.globalAlpha = Math.max(0, this.opacity);

      // --- Draw Stem & Giant Leaves ---
      if (this.stemProgress > 0) {
        const t = this.stemProgress;
        const currentEndX = Math.pow(1 - t, 3) * this.startX +
          3 * Math.pow(1 - t, 2) * t * this.cp1x +
          3 * (1 - t) * Math.pow(t, 2) * this.cp2x +
          Math.pow(t, 3) * this.targetX;
        const currentEndY = Math.pow(1 - t, 3) * this.startY +
          3 * Math.pow(1 - t, 2) * t * this.cp1y +
          3 * (1 - t) * Math.pow(t, 2) * this.cp2y +
          Math.pow(t, 3) * this.targetY;

        ctx.beginPath();
        const stemGrad = ctx.createLinearGradient(this.startX, this.startY, this.targetX, this.targetY);
        stemGrad.addColorStop(0, this.stemColors[0]);
        stemGrad.addColorStop(0.6, this.stemColors[1]);
        stemGrad.addColorStop(1, this.stemColors[2]);

        ctx.strokeStyle = stemGrad;
        ctx.lineWidth = this.stemWidth;
        ctx.lineCap = 'round';
        ctx.moveTo(this.startX, this.startY);
        ctx.bezierCurveTo(this.cp1x, this.cp1y, this.cp2x, this.cp2y, currentEndX, currentEndY);
        ctx.stroke();

        // Draw giant curved leaves along stem
        this.leaves.forEach(leaf => {
          if (this.stemProgress >= leaf.t) {
            const lt = leaf.t;
            const lx = Math.pow(1 - lt, 3) * this.startX + 3 * Math.pow(1 - lt, 2) * lt * this.cp1x + 3 * (1 - lt) * Math.pow(lt, 2) * this.cp2x + Math.pow(lt, 3) * this.targetX;
            const ly = Math.pow(1 - lt, 3) * this.startY + 3 * Math.pow(1 - lt, 2) * lt * this.cp1y + 3 * (1 - lt) * Math.pow(lt, 2) * this.cp2y + Math.pow(lt, 3) * this.targetY;

            ctx.save();
            ctx.translate(lx, ly);
            ctx.rotate(leaf.side * leaf.angle);

            ctx.beginPath();
            const s = leaf.size;
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(leaf.side * s * 0.7, -s * 0.35, leaf.side * s * 1.1, -s * 0.1, leaf.side * s * 1.3, s * 0.2);
            ctx.bezierCurveTo(leaf.side * s * 0.9, s * 0.6, leaf.side * s * 0.4, s * 0.4, 0, 0);

            const leafGrad = ctx.createLinearGradient(0, 0, leaf.side * s, s * 0.2);
            leafGrad.addColorStop(0, this.stemColors[1]);
            leafGrad.addColorStop(1, this.stemColors[2]);
            ctx.fillStyle = leafGrad;
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.fill();

            // Leaf central vein
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(leaf.side * s * 0.6, 0, leaf.side * s * 1.25, s * 0.18);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.restore();
          }
        });
      }

      // --- Draw Massive Flower Blossom ---
      if (this.currentRadius > 4) {
        // Gentle breathing animation
        const breathe = Math.sin(this.breatheAngle) * (this.currentRadius * 0.025);
        const bloomRadius = this.currentRadius + breathe;
        const bx = this.targetX;
        const by = this.targetY;

        // Cinematic Radiant Lighting Halo
        const haloRadius = bloomRadius * 1.9;
        const haloGrad = ctx.createRadialGradient(bx, by, bloomRadius * 0.2, bx, by, haloRadius);
        haloGrad.addColorStop(0, this.palette.halo);
        haloGrad.addColorStop(0.5, this.palette.halo.replace('0.45', '0.18'));
        haloGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(bx, by, haloRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.translate(bx, by);
        ctx.rotate(this.baseRotation);

        // Render each concentric layer from outside to inside
        this.layers.forEach((layer, layerIdx) => {
          // Layer unfolding progression
          const layerBloomP = Math.max(0, Math.min(1, (this.bloomProgress - layer.delay) / (1 - layer.delay)));
          if (layerBloomP > 0) {
            const layerR = bloomRadius * layer.radiusRatio * Math.sin((layerBloomP * Math.PI) / 2);
            const petalWidth = layerR * layer.widthRatio;

            // Stagger layer rotation for full lush coverage
            ctx.save();
            ctx.rotate((layerIdx * Math.PI) / layer.count);

            for (let i = 0; i < layer.count; i++) {
              ctx.save();
              const angle = (i * Math.PI * 2) / layer.count;
              ctx.rotate(angle);

              // Petal shape (Cubic Bezier curve with organic scallop tip)
              ctx.beginPath();
              ctx.moveTo(0, 0);

              const w = petalWidth;
              const h = layerR;

              // Outer petal curve
              ctx.bezierCurveTo(-w * 0.75, h * 0.3, -w * 1.05, h * 0.72, 0, h);
              ctx.bezierCurveTo(w * 1.05, h * 0.72, w * 0.75, h * 0.3, 0, 0);

              // Layer radial gradient (Dark fold to luminous glowing edge)
              const petalGrad = ctx.createLinearGradient(0, 0, 0, h);
              petalGrad.addColorStop(0, layer.col1);
              petalGrad.addColorStop(0.45, layer.col2);
              petalGrad.addColorStop(0.85, layer.col3);
              petalGrad.addColorStop(1, this.palette.edge);

              ctx.fillStyle = petalGrad;
              ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
              ctx.shadowBlur = 8;
              ctx.fill();

              // Translucent shimmering rim highlight
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
              ctx.lineWidth = 1.2;
              ctx.stroke();

              ctx.restore();
            }
            ctx.restore();
          }
        });

        // Golden Stamen & Pistil Center
        if (this.bloomProgress > 0.4) {
          const centerScale = Math.sin((this.bloomProgress * Math.PI) / 2);
          const centerRadius = bloomRadius * 0.22 * centerScale;

          // Glowing golden center
          ctx.beginPath();
          const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, centerRadius);
          coreGrad.addColorStop(0, '#ffffff');
          coreGrad.addColorStop(0.35, this.palette.stamen);
          coreGrad.addColorStop(0.85, '#e85d04');
          coreGrad.addColorStop(1, '#6a040f');

          ctx.fillStyle = coreGrad;
          ctx.arc(0, 0, centerRadius, 0, Math.PI * 2);
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#ffd166';
          ctx.fill();

          // Filaments and golden pollen pearls
          const filamentCount = 14;
          ctx.fillStyle = '#fffdf0';
          for (let f = 0; f < filamentCount; f++) {
            const fAngle = (f * Math.PI * 2) / filamentCount;
            const fr = centerRadius * 0.85;
            const fx = Math.cos(fAngle) * fr;
            const fy = Math.sin(fAngle) * fr;

            ctx.beginPath();
            ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      ctx.restore();
    }
  }

  // ==========================================
  // GIANT FLOATING PETALS (In the breeze)
  // ==========================================
  class GiantPetal {
    constructor(x, y, size, palette) {
      this.x = x || Math.random() * width;
      this.y = y || -20;
      this.size = size || Math.random() * 25 + 20; // Big petals!
      this.palette = palette || LUXURY_PALETTES[0];
      this.speedY = Math.random() * 1.2 + 0.8;
      this.speedX = (Math.random() - 0.3) * 1.8;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.035;
      this.sway = Math.random() * Math.PI * 2;
      this.alpha = 0.85;
    }
    update() {
      this.sway += 0.025;
      this.x += this.speedX + Math.sin(this.sway) * 1.2;
      this.y += this.speedY;
      this.rotation += this.rotSpeed;
    }
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.alpha;

      ctx.beginPath();
      const s = this.size;
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-s * 0.6, s * 0.4, -s * 0.8, s * 0.85, 0, s * 1.2);
      ctx.bezierCurveTo(s * 0.8, s * 0.85, s * 0.6, s * 0.4, 0, 0);

      const grad = ctx.createLinearGradient(0, 0, 0, s * 1.2);
      grad.addColorStop(0, this.palette.base);
      grad.addColorStop(0.6, this.palette.mid);
      grad.addColorStop(1, this.palette.edge);
      ctx.fillStyle = grad;
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.fill();

      ctx.restore();
    }
  }

  // ==========================================
  // POLLEN / FAIRY SPARKS
  // ==========================================
  class PollenSpark {
    constructor(x, y, color) {
      this.x = x || Math.random() * width;
      this.y = y || Math.random() * height;
      this.size = Math.random() * 2.5 + 1.2;
      this.color = color || '#ffd166';
      this.speedX = (Math.random() - 0.5) * 1.2;
      this.speedY = (Math.random() - 0.5) * 1.2 - 0.4;
      this.alpha = Math.random() * 0.8 + 0.3;
      this.pulse = Math.random() * Math.PI * 2;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.pulse += 0.06;
      this.alpha = 0.4 + Math.sin(this.pulse) * 0.5;
    }
    draw(ctx) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < 35; i++) {
    pollenSparks.push(new PollenSpark());
  }

  // ==========================================
  // GARDEN SPAWN & REGENERATION CONTROLLER
  // ==========================================
  function spawnMassiveFlower(x, y, isUser = false) {
    // Keep max 9 active massive flowers so screen looks opulent and frame rate is 60fps
    if (flowers.length >= 9) {
      flowers[0].fading = true;
    }
    flowers.push(new MassiveFlower(x, y, isUser));
  }

  // Initial dramatic garden layout: 4 massive focal blooms
  function initMassiveGarden() {
    const isMobile = width < 600;
    const initialPositions = isMobile ? [
      { x: width * 0.35, y: height * 0.38, delay: 100 },
      { x: width * 0.72, y: height * 0.52, delay: 800 },
      { x: width * 0.28, y: height * 0.70, delay: 1600 }
    ] : [
      { x: width * 0.22, y: height * 0.42, delay: 100 },
      { x: width * 0.50, y: height * 0.35, delay: 700 },
      { x: width * 0.78, y: height * 0.48, delay: 1400 },
      { x: width * 0.35, y: height * 0.68, delay: 2100 }
    ];

    initialPositions.forEach(pos => {
      setTimeout(() => {
        spawnMassiveFlower(pos.x, pos.y, false);
      }, pos.delay);
    });
  }
  initMassiveGarden();

  // Continuous background regeneration: sprouts a new massive blossom every 3.2 seconds
  setInterval(() => {
    const activeFlowers = flowers.filter(f => !f.fading);
    if (activeFlowers.length < 8) {
      const margin = width * 0.12;
      const x = Math.random() * (width - margin * 2) + margin;
      const y = Math.random() * (height * 0.55) + height * 0.25;
      spawnMassiveFlower(x, y, false);
    }
  }, 3200);

  // ==========================================
  // INTERACTIVE TOUCH / CLICK - PLANT MASSIVE FLOWER
  // ==========================================
  let lastTouchTime = 0;
  function handleTouchPlant(x, y) {
    const now = Date.now();
    if (now - lastTouchTime < 250) return; // Responsive throttle
    lastTouchTime = now;

    const hint = document.getElementById('garden-hint');
    if (hint) {
      hint.style.opacity = '0';
      setTimeout(() => hint.remove(), 600);
    }

    // Plant a MASSIVE blooming flower right at the touch point!
    spawnMassiveFlower(x, y, true);

    // Burst of magical pollen sparks
    for (let i = 0; i < 6; i++) {
      pollenSparks.push(new PollenSpark(x, y, '#ffd166'));
    }
  }

  canvas.addEventListener('click', (e) => {
    handleTouchPlant(e.clientX, e.clientY);
  });

  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleTouchPlant(touch.clientX, touch.clientY);
    }
  }, { passive: true });

  // ==========================================
  // MAIN ANIMATION LOOP
  // ==========================================
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Camera Lens Bokeh Orbs in background
    bokehOrbs.forEach(orb => {
      orb.update();
      orb.draw(ctx);
    });

    // 2. Draw Massive Flowers
    for (let i = flowers.length - 1; i >= 0; i--) {
      const flower = flowers[i];
      flower.update();
      flower.draw(ctx);
      if (flower.opacity <= 0) {
        flowers.splice(i, 1);
      }
    }

    // 3. Draw Giant Petals drifting in breeze
    for (let i = petalsInWind.length - 1; i >= 0; i--) {
      const petal = petalsInWind[i];
      petal.update();
      petal.draw(ctx);
      if (petal.y > height + 40 || petal.x < -40 || petal.x > width + 40) {
        petalsInWind.splice(i, 1);
      }
    }
    if (petalsInWind.length < 12) {
      petalsInWind.push(new GiantPetal());
    }

    // 4. Draw Pollen Sparks
    pollenSparks.forEach(spark => {
      spark.update();
      spark.draw(ctx);
      if (spark.y < -10) spark.y = height + 10;
      if (spark.y > height + 10) spark.y = -10;
      if (spark.x < -10) spark.x = width + 10;
      if (spark.x > width + 10) spark.x = -10;
    });

    requestAnimationFrame(animate);
  }
  animate();

  // ==========================================
  // 20TH BIRTHDAY MESSAGE MODAL CONTROLS
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
