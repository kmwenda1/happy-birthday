/**
 * THE AUTHENTIC FLOWER GARDEN - VIRAL TIKTOK BLOOM WALL
 * Recreates the viral flower heart tapestry with authentic botanical flower stickers.
 * Flowers bloom and pop rapidly to fill the screen in a dense floral bouquet.
 */

document.addEventListener('DOMContentLoaded', () => {

  const wall = document.getElementById('flower-wall');
  const rebloomBtn = document.getElementById('rebloom-btn');
  const tapPrompt = document.getElementById('tap-prompt');

  const FLOWER_IMAGES = [
    'images/flowers/rose_pink_1.png',
    'images/flowers/rose_pink_2.png',
    'images/flowers/rose_red_1.png',
    'images/flowers/rose_deep_1.png',
    'images/flowers/rose_coral_1.png',
    'images/flowers/daisy_1.png',
    'images/flowers/daisy_2.png',
    'images/flowers/daisy_3.png',
    'images/flowers/sunflower_1.png',
    'images/flowers/sunflower_2.png',
    'images/flowers/sunflower_3.png',
    'images/flowers/sunflower_hr.png',
    'images/flowers/peony_dusty_1.png',
    'images/flowers/hydrangea_blue_1.png',
    'images/flowers/hydrangea_blue_2.png',
    'images/flowers/blue_hr.png',
    'images/flowers/yellow_hr.png',
    'images/flowers/lily_white_1.png',
    'images/flowers/hibiscus_red_1.png',
    'images/flowers/carnation_peach_1.png',
    'images/flowers/cosmos_magenta_1.png'
  ];

  // Preload all flower images so popping is 100% instant
  FLOWER_IMAGES.forEach(src => {
    const img = new Image();
    img.src = src;
  });

  // Soft Web Audio Chime Sound for blooms
  let audioCtx = null;
  function playBloomChime() {
    try {
      if (!audioCtx) {
        const AudioClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioClass();
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
      const freq = notes[Math.floor(Math.random() * notes.length)];

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  let zIndexCounter = 10;
  let activeFlowerCount = 0;
  let autoBloomInterval = null;

  /**
   * Spawns an authentic flower at (x, y)
   */
  function createFlower(x, y, isUserTap = false) {
    if (!wall) return;

    const img = document.createElement('img');
    const randomSrc = FLOWER_IMAGES[Math.floor(Math.random() * FLOWER_IMAGES.length)];
    img.src = randomSrc;
    img.className = 'authentic-flower';

    // Random authentic sizing (100px to 190px on mobile, up to 230px on desktop)
    const isMobile = window.innerWidth < 600;
    const baseSize = isMobile ? (Math.random() * 70 + 95) : (Math.random() * 90 + 130);
    const size = isUserTap ? baseSize * 1.15 : baseSize;

    img.style.width = `${size}px`;
    img.style.height = `${size}px`;
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;
    img.style.zIndex = ++zIndexCounter;

    // Random slight rotation for organic bouquet feel
    const rotStart = (Math.random() - 0.5) * 60;
    const rotEnd = (Math.random() - 0.5) * 45;
    img.style.setProperty('--rot-start', `${rotStart}deg`);
    img.style.setProperty('--rot-end', `${rotEnd}deg`);

    wall.appendChild(img);
    activeFlowerCount++;

    if (isUserTap) {
      playBloomChime();
    }

    // Keep DOM clean by removing very old underneath flowers if count exceeds 140
    if (activeFlowerCount > 140 && wall.firstChild) {
      wall.removeChild(wall.firstChild);
      activeFlowerCount--;
    }
  }

  /**
   * Heart / Floral Tapestry cascade generation
   * Fills the screen in expanding heart rings like the reference picture!
   */
  function startBloomCascade() {
    if (autoBloomInterval) clearInterval(autoBloomInterval);
    wall.innerHTML = '';
    activeFlowerCount = 0;
    zIndexCounter = 10;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight * 0.46;
    const isMobile = window.innerWidth < 600;

    // Generate points along an expanding heart / oval bouquet
    const points = [];
    const scaleFactor = isMobile ? Math.min(window.innerWidth, window.innerHeight) * 0.024 : Math.min(window.innerWidth, window.innerHeight) * 0.028;

    // Center cluster
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 80;
      points.push({
        x: centerX + Math.cos(angle) * r,
        y: centerY + Math.sin(angle) * r
      });
    }

    // Concentric expanding heart layers
    const layerScales = [0.45, 0.75, 1.05, 1.35, 1.65, 1.95];
    layerScales.forEach(layerScale => {
      const stepCount = Math.floor(10 + layerScale * 8);
      for (let s = 0; s < stepCount; s++) {
        const t = (s / stepCount) * Math.PI * 2;
        // Heart curve formula
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

        const jitterX = (Math.random() - 0.5) * 45;
        const jitterY = (Math.random() - 0.5) * 45;

        points.push({
          x: centerX + hx * scaleFactor * layerScale + jitterX,
          y: centerY + hy * scaleFactor * layerScale + jitterY
        });
      }
    });

    // Outer filler blooms for edge-to-edge coverage
    for (let f = 0; f < 25; f++) {
      points.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight
      });
    }

    // Cascade bloom sequence: every 65ms, a flower pops into place!
    let idx = 0;
    const cascadeTimer = setInterval(() => {
      if (idx < points.length) {
        const p = points[idx];
        createFlower(p.x, p.y, false);
        idx++;
      } else {
        clearInterval(cascadeTimer);

        // Keep living garden regenerating: one flower every 1.4s
        autoBloomInterval = setInterval(() => {
          const rx = centerX + (Math.random() - 0.5) * (window.innerWidth * 0.85);
          const ry = centerY + (Math.random() - 0.5) * (window.innerHeight * 0.75);
          createFlower(rx, ry, false);
        }, 1400);
      }
    }, 65);
  }

  startBloomCascade();

  // ==========================================
  // INTERACTIVE TOUCH & CLICK TO BLOOM
  // ==========================================
  let lastTapTime = 0;
  function handleTap(e) {
    const now = Date.now();
    if (now - lastTapTime < 80) return; // Smooth throttle
    lastTapTime = now;

    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);
    if (!x || !y) return;

    if (tapPrompt) {
      tapPrompt.style.opacity = '0';
      setTimeout(() => tapPrompt.remove(), 600);
    }

    // Spawn flower right under finger/cursor
    createFlower(x, y, true);

    // Also spawn 1 mini satellite flower nearby for a lush blooming cluster effect
    setTimeout(() => {
      const offsetX = (Math.random() - 0.5) * 60;
      const offsetY = (Math.random() - 0.5) * 60;
      createFlower(x + offsetX, y + offsetY, false);
    }, 90);
  }

  wall.addEventListener('click', handleTap);
  wall.addEventListener('touchstart', handleTap, { passive: true });

  if (rebloomBtn) {
    rebloomBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      startBloomCascade();
    });
  }

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

  if (openBtn) openBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openModal();
  });
  if (closeBtn) closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeModal();
  });

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
