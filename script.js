/**
 * AERO ULTRA — High Performance Scroll Storytelling & Interactive Web Audio Engine
 * 60FPS Lerp Scroll Sequence, Web Audio API Sound Synthesizer & Real-Time Spectrum Analyzer
 */

document.addEventListener('DOMContentLoaded', () => {
  // Configuration
  const TOTAL_FRAMES = 180;
  const FRAME_PREFIX = 'frames/frame_';
  const FRAME_EXT = '.png';
  const BG_COLOR = '#08080a';

  // State Management
  const frames = [];
  let loadedFrameCount = 0;
  let targetFrameIndex = 0;
  let currentFrameIndex = 0;
  let isCanvasReady = false;

  // DOM References
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const preloader = document.getElementById('preloader');
  const preloaderBar = document.getElementById('preloader-bar');
  const preloaderPercent = document.getElementById('preloader-percent');
  const preloaderText = document.getElementById('preloader-text');
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const scrollProgressBar = document.getElementById('scroll-progress-bar');
  const scrollSection = document.getElementById('scroll-sequence-section');
  const storySteps = document.querySelectorAll('.story-step');
  const hotspots = document.querySelectorAll('.canvas-hotspot');

  /* ==========================================================================
     1. High-DPI Canvas & Aspect Ratio Renderer
     ========================================================================== */
  function resizeCanvas() {
    if (!canvas) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const rect = canvas.parentElement.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    ctx.scale(dpr, dpr);
    renderCurrentFrame();
  }

  function drawAspectFitImage(img) {
    if (!img || !img.complete) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const containerW = canvas.width / dpr;
    const containerH = canvas.height / dpr;

    // Clear canvas background with exact matching color #08080a
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, containerW, containerH);

    // Calculate Aspect Fit
    const imgAspect = img.width / img.height;
    const containerAspect = containerW / containerH;

    let renderW, renderH;

    if (containerAspect > imgAspect) {
      renderH = containerH * 0.86;
      renderW = renderH * imgAspect;
    } else {
      renderW = containerW * 0.86;
      renderH = renderW / imgAspect;
    }

    const renderX = (containerW - renderW) / 2;
    const renderY = (containerH - renderH) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, renderX, renderY, renderW, renderH);
  }

  function renderCurrentFrame() {
    const frameToDraw = Math.min(
      TOTAL_FRAMES - 1,
      Math.max(0, Math.round(currentFrameIndex))
    );
    const img = frames[frameToDraw];
    if (img && img.complete) {
      drawAspectFitImage(img);
    }
  }

  /* ==========================================================================
     2. Preloader Engine (180 Image Frames)
     ========================================================================== */
  function preloadImageFrames() {
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(4, '0');
      img.src = `${FRAME_PREFIX}${frameNum}${FRAME_EXT}`;

      img.onload = () => {
        loadedFrameCount++;
        const percent = Math.floor((loadedFrameCount / TOTAL_FRAMES) * 100);
        
        preloaderBar.style.width = `${percent}%`;
        preloaderPercent.textContent = `${percent}%`;

        if (loadedFrameCount === 1) {
          renderCurrentFrame();
        }

        if (loadedFrameCount === TOTAL_FRAMES) {
          onAllFramesLoaded();
        }
      };

      img.onerror = () => {
        loadedFrameCount++;
        if (loadedFrameCount === TOTAL_FRAMES) {
          onAllFramesLoaded();
        }
      };

      frames.push(img);
    }
  }

  function onAllFramesLoaded() {
    isCanvasReady = true;
    preloaderText.textContent = 'Ready';
    setTimeout(() => {
      preloader.classList.add('loaded');
      document.body.style.overflow = 'auto';
      resizeCanvas();
    }, 300);
  }

  /* ==========================================================================
     3. 60FPS Lerp Scroll Engine & Hotspots
     ========================================================================== */
  function updateScrollProgress() {
    if (!scrollSection) return;

    const sectionRect = scrollSection.getBoundingClientRect();
    const sectionHeight = scrollSection.offsetHeight - window.innerHeight;

    if (sectionHeight <= 0) return;

    const currentScroll = -sectionRect.top;
    const progress = Math.min(1, Math.max(0, currentScroll / sectionHeight));

    // Update global scroll progress line
    scrollProgressBar.style.width = `${progress * 100}%`;

    // Map progress to target frame index (0 to 179)
    targetFrameIndex = progress * (TOTAL_FRAMES - 1);

    const progressPercent = progress * 100;
    updateStoryOverlays(progressPercent);
    updateHotspots(progressPercent);
    updateActiveNavLink();

    // Navbar glass state
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  function updateStoryOverlays(percent) {
    storySteps.forEach((step) => {
      const start = parseFloat(step.getAttribute('data-start'));
      const end = parseFloat(step.getAttribute('data-end'));

      if (percent >= start && percent <= end) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });
  }

  function updateHotspots(percent) {
    // Show 3D hotspots during exploded sequence (~35% to 65%)
    const show = percent >= 35 && percent <= 65;
    hotspots.forEach((hs) => {
      if (show) {
        hs.classList.add('active');
      } else {
        hs.classList.remove('active');
      }
    });
  }

  function updateActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = [
      document.getElementById('hero'),
      document.getElementById('features'),
      document.getElementById('studio'),
      document.getElementById('specs'),
      document.getElementById('gallery')
    ];

    const scrollPos = window.scrollY + 250;

    sections.forEach((sec, idx) => {
      if (!sec) return;
      const top = sec.offsetTop;
      const height = sec.offsetHeight;

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach((link) => link.classList.remove('active'));
        if (navLinks[idx]) {
          navLinks[idx].classList.add('active');
        }
      }
    });
  }

  // Buttery Smooth Lerp Loop
  function renderLoop() {
    if (isCanvasReady) {
      const diff = targetFrameIndex - currentFrameIndex;
      if (Math.abs(diff) > 0.001) {
        currentFrameIndex += diff * 0.14;
        renderCurrentFrame();
      }
    }

    requestAnimationFrame(renderLoop);
  }

  /* ==========================================================================
     4. Interactive Web Audio API Sound Studio Synthesizer (3 Unique Audio Modes)
     ========================================================================== */
  const eqCanvas = document.getElementById('eq-canvas');
  const toggleAudioBtn = document.getElementById('toggle-audio-btn');
  const modeButtons = document.querySelectorAll('.mode-btn');

  let audioCtx = null;
  let masterGain = null;
  let bassFilter = null;
  let trebleFilter = null;
  let pannerNode = null;
  let analyser = null;
  let synthTimer = null;
  let isAudioPlaying = false;
  let currentAudioMode = 'spatial';
  let pannerAngle = 0;

  function initWebAudio() {
    if (audioCtx) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.3;

    bassFilter = audioCtx.createBiquadFilter();
    bassFilter.type = 'lowshelf';
    bassFilter.frequency.value = 140;
    bassFilter.gain.value = 0;

    trebleFilter = audioCtx.createBiquadFilter();
    trebleFilter.type = 'highshelf';
    trebleFilter.frequency.value = 4000;
    trebleFilter.gain.value = 0;

    pannerNode = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;

    // Connect Audio Node pipeline
    masterGain.connect(bassFilter);
    bassFilter.connect(trebleFilter);
    let lastNode = trebleFilter;
    if (pannerNode) {
      lastNode.connect(pannerNode);
      lastNode = pannerNode;
    }
    lastNode.connect(analyser);
    analyser.connect(audioCtx.destination);
  }

  // Synthesize single note with custom waveform and envelope
  function playNote(freq, type = 'sine', duration = 1.0, gainVal = 0.2) {
    if (!audioCtx || !isAudioPlaying) return;

    const osc = audioCtx.createOscillator();
    const noteGain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    noteGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    noteGain.gain.exponentialRampToValueAtTime(gainVal, audioCtx.currentTime + 0.08);
    noteGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(noteGain);
    noteGain.connect(masterGain);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }

  // 1. Spatial 3D Audio Loop: Shimmering 3D chimes with active stereo panning
  function playSpatialAudioPattern() {
    const spatialFreqs = [329.63, 440, 554.37, 659.25, 880, 1108.73]; // High spatial chimes
    spatialFreqs.forEach((freq, idx) => {
      setTimeout(() => {
        if (isAudioPlaying && currentAudioMode === 'spatial') {
          playNote(freq, 'sine', 1.6, 0.18);
        }
      }, idx * 160);
    });

    if (pannerNode && currentAudioMode === 'spatial') {
      pannerAngle += 0.8;
      pannerNode.pan.setValueAtTime(Math.sin(pannerAngle), audioCtx.currentTime);
    }
  }

  // 2. Studio Reference Loop: Flat, balanced warm acoustic piano tones
  function playStudioReferencePattern() {
    const refFreqs = [220, 277.18, 329.63, 440]; // A major fundamental chord
    refFreqs.forEach((freq, idx) => {
      setTimeout(() => {
        if (isAudioPlaying && currentAudioMode === 'reference') {
          playNote(freq, 'triangle', 1.2, 0.22);
        }
      }, idx * 240);
    });
  }

  // 3. Acoustic Bass Boost Loop: Deep sub-bass 808 pulse & sub rumble
  function playBassBoostPattern() {
    const bassFreqs = [45, 55, 65, 80, 110]; // Low sub-bass frequencies
    bassFreqs.forEach((freq, idx) => {
      setTimeout(() => {
        if (isAudioPlaying && currentAudioMode === 'bass') {
          playNote(freq, 'sawtooth', 1.4, 0.35);
          playNote(freq / 2, 'sine', 1.6, 0.4); // Deep sub-oscillator
        }
      }, idx * 220);
    });
  }

  function audioSynthTick() {
    if (!isAudioPlaying) return;

    if (currentAudioMode === 'spatial') {
      playSpatialAudioPattern();
      synthTimer = setTimeout(audioSynthTick, 1200);
    } else if (currentAudioMode === 'reference') {
      playStudioReferencePattern();
      synthTimer = setTimeout(audioSynthTick, 1400);
    } else if (currentAudioMode === 'bass') {
      playBassBoostPattern();
      synthTimer = setTimeout(audioSynthTick, 1100);
    }
  }

  function applyAudioMode(mode) {
    currentAudioMode = mode;
    if (!audioCtx) return;

    // Reset filters
    bassFilter.gain.cancelScheduledValues(audioCtx.currentTime);
    trebleFilter.gain.cancelScheduledValues(audioCtx.currentTime);

    if (mode === 'spatial') {
      bassFilter.gain.setValueAtTime(3, audioCtx.currentTime);
      trebleFilter.gain.setValueAtTime(8, audioCtx.currentTime); // Crisp highs for 3D spatial atmosphere
    } else if (mode === 'reference') {
      bassFilter.gain.setValueAtTime(0, audioCtx.currentTime);  // Completely flat studio curve
      trebleFilter.gain.setValueAtTime(0, audioCtx.currentTime);
      if (pannerNode) pannerNode.pan.setValueAtTime(0, audioCtx.currentTime);
    } else if (mode === 'bass') {
      bassFilter.gain.setValueAtTime(16, audioCtx.currentTime); // Deep +16dB sub-bass boost
      trebleFilter.gain.setValueAtTime(-6, audioCtx.currentTime);
      if (pannerNode) pannerNode.pan.setValueAtTime(0, audioCtx.currentTime);
    }

    // Restart synth pattern immediately for the new sound mode
    if (isAudioPlaying) {
      if (synthTimer) clearTimeout(synthTimer);
      audioSynthTick();
    }
  }

  // Real-Time Audio Spectrum Canvas Visualizer
  if (eqCanvas) {
    const eqCtx = eqCanvas.getContext('2d');

    function resizeEqCanvas() {
      const rect = eqCanvas.parentElement.getBoundingClientRect();
      eqCanvas.width = rect.width;
      eqCanvas.height = rect.height;
    }

    resizeEqCanvas();
    window.addEventListener('resize', resizeEqCanvas);

    function renderEqSpectrum() {
      const w = eqCanvas.width;
      const h = eqCanvas.height;
      eqCtx.clearRect(0, 0, w, h);

      const barCount = 32;
      const barWidth = (w / barCount) - 4;
      const dataArray = new Uint8Array(analyser ? analyser.frequencyBinCount : barCount);

      if (analyser && isAudioPlaying) {
        analyser.getByteFrequencyData(dataArray);
      }

      for (let i = 0; i < barCount; i++) {
        let val;
        if (isAudioPlaying && dataArray.length > 0) {
          val = dataArray[i % dataArray.length] / 255;
        } else {
          val = 0.05 + Math.sin(i * 0.3) * 0.03; // Resting subtle animation
        }

        const barHeight = Math.max(4, val * (h - 20));
        const x = i * (barWidth + 4) + 2;
        const y = h - barHeight;

        // Gradient for spectrum bars
        const grad = eqCtx.createLinearGradient(0, h, 0, 0);
        grad.addColorStop(0, '#38bdf8');
        grad.addColorStop(0.6, '#818cf8');
        grad.addColorStop(1, '#c084fc');

        eqCtx.fillStyle = grad;
        eqCtx.fillRect(x, y, barWidth, barHeight);
      }

      requestAnimationFrame(renderEqSpectrum);
    }

    renderEqSpectrum();

    if (toggleAudioBtn) {
      toggleAudioBtn.addEventListener('click', () => {
        initWebAudio();

        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }

        isAudioPlaying = !isAudioPlaying;
        const span = toggleAudioBtn.querySelector('span');

        if (isAudioPlaying) {
          toggleAudioBtn.classList.remove('btn-primary');
          toggleAudioBtn.classList.add('btn-secondary');
          span.textContent = 'Pause Audio Demo';
          audioSynthTick();
        } else {
          toggleAudioBtn.classList.remove('btn-secondary');
          toggleAudioBtn.classList.add('btn-primary');
          span.textContent = 'Play Acoustic Demo';
          if (synthTimer) clearTimeout(synthTimer);
        }
      });
    }

    modeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        modeButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.getAttribute('data-mode');

        initWebAudio();
        if (audioCtx && audioCtx.state === 'suspended') {
          audioCtx.resume();
        }

        if (!isAudioPlaying) {
          isAudioPlaying = true;
          if (toggleAudioBtn) {
            toggleAudioBtn.classList.remove('btn-primary');
            toggleAudioBtn.classList.add('btn-secondary');
            const span = toggleAudioBtn.querySelector('span');
            if (span) span.textContent = 'Pause Audio Demo';
          }
        }

        applyAudioMode(mode);
      });
    });
  }

  /* ==========================================================================
     5. Technical Specifications Filter Tabs
     ========================================================================== */
  const specTabs = document.querySelectorAll('.spec-tab');
  const specBoxes = document.querySelectorAll('.spec-box');

  specTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      specTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const cat = tab.getAttribute('data-cat');

      specBoxes.forEach((box) => {
        if (cat === 'all' || box.getAttribute('data-cat') === cat) {
          box.style.display = 'flex';
        } else {
          box.style.display = 'none';
        }
      });
    });
  });

  /* ==========================================================================
     6. Color Customizer & Magnetic Buttons
     ========================================================================== */
  const finishButtons = document.querySelectorAll('.finish-btn');
  const ambientGlow = document.querySelector('.canvas-ambient-glow');

  finishButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      finishButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const hex = btn.getAttribute('data-hex');
      if (ambientGlow) {
        ambientGlow.style.background = `radial-gradient(circle, ${hex}44 0%, ${hex}10 40%, rgba(8, 8, 10, 0) 70%)`;
      }
    });
  });

  // Magnetic Buttons
  document.querySelectorAll('.btn-magnetic').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = `translate(0px, 0px)`;
    });
  });

  // Mobile Drawer Toggle
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
    });

    document.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
      });
    });
  }

  // Smooth Anchor Navigation
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      e.preventDefault();
      if (targetId === '#engineering') {
        const seqHeight = scrollSection.offsetHeight - window.innerHeight;
        const targetY = scrollSection.offsetTop + seqHeight * 0.28;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      } else {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Reveal-on-Scroll Observer
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = entry.target.getAttribute('data-delay') || 0;
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
    revealObserver.observe(el);
  });

  /* ==========================================================================
     7. Initialization & Event Listeners
     ========================================================================== */
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('scroll', updateScrollProgress, { passive: true });

  document.body.style.overflow = 'hidden';

  preloadImageFrames();
  resizeCanvas();
  requestAnimationFrame(renderLoop);
});
