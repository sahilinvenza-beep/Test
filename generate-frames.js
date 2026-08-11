const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const framesDir = path.join(__dirname, 'frames');
if (!fs.existsSync(framesDir)) {
  fs.mkdirSync(framesDir, { recursive: true });
}

const WIDTH = 1200;
const HEIGHT = 1200;
const TOTAL_FRAMES = 90;
const BG_COLOR = '#08080a';

console.log(`Generating ${TOTAL_FRAMES} high-resolution frames (${WIDTH}x${HEIGHT})...`);

const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext('2d');

function renderFrame(frameIndex) {
  const progress = frameIndex / (TOTAL_FRAMES - 1); // 0.0 to 1.0

  // Clear background
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const cx = WIDTH / 2;
  const cy = HEIGHT / 2;

  // Global rotation and scale derived from scroll progress
  const rotationY = Math.sin(progress * Math.PI * 1.5) * 0.45;
  const globalScale = 1.0 + Math.sin(progress * Math.PI) * 0.08;

  // Exploded distance curve (peaks around frame 30-65)
  let explodeFactor = 0;
  if (progress > 0.2 && progress < 0.75) {
    explodeFactor = Math.sin(((progress - 0.2) / 0.55) * Math.PI);
  }

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(globalScale, globalScale);

  // Subtle ambient glow behind product
  const ambientGlow = ctx.createRadialGradient(0, 0, 50, 0, 0, 450);
  ambientGlow.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
  ambientGlow.addColorStop(0.5, 'rgba(139, 92, 246, 0.05)');
  ambientGlow.addColorStop(1, 'rgba(8, 8, 10, 0)');
  ctx.fillStyle = ambientGlow;
  ctx.beginPath();
  ctx.arc(0, 0, 450, 0, Math.PI * 2);
  ctx.fill();

  // Draw Headband (Arc)
  const headbandExplodeY = -explodeFactor * 40;
  ctx.save();
  ctx.translate(0, headbandExplodeY);
  ctx.beginPath();
  ctx.arc(0, -20, 240, Math.PI * 1.15, Math.PI * 1.85);
  ctx.lineWidth = 32;
  ctx.strokeStyle = '#1e1e24';
  ctx.stroke();

  // Headband outer metallic rim
  ctx.beginPath();
  ctx.arc(0, -20, 255, Math.PI * 1.14, Math.PI * 1.86);
  ctx.lineWidth = 4;
  const headbandGrad = ctx.createLinearGradient(-200, -200, 200, -200);
  headbandGrad.addColorStop(0, '#334155');
  headbandGrad.addColorStop(0.5, '#f8fafc');
  headbandGrad.addColorStop(1, '#334155');
  ctx.strokeStyle = headbandGrad;
  ctx.stroke();

  // Headband comfort cushion
  ctx.beginPath();
  ctx.arc(0, -18, 226, Math.PI * 1.2, Math.PI * 1.8);
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#121216';
  ctx.stroke();
  ctx.restore();

  // Left & Right Ear Cup Assembly
  const explodeOffset = explodeFactor * 130;

  // Render left cup and right cup with perspective skew
  drawEarCup(ctx, -190 - explodeOffset, 60, -1, progress, explodeFactor, rotationY);
  drawEarCup(ctx, 190 + explodeOffset, 60, 1, progress, explodeFactor, rotationY);

  // Floating acoustic driver & internal magnets if exploded
  if (explodeFactor > 0.05) {
    drawExplodedComponents(ctx, explodeFactor, progress);
  }

  // Floating particle field for futuristic depth
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2 + progress * Math.PI * 2;
    const r = 320 + Math.sin(i * 3 + progress * 5) * 50;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    const pSize = 1.5 + Math.sin(i + progress * 10) * 1.2;
    ctx.beginPath();
    ctx.arc(px, py, Math.max(0.5, pSize), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // Save to file
  const frameNumber = String(frameIndex + 1).padStart(4, '0');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(framesDir, `frame_${frameNumber}.png`), buffer);
}

function drawEarCup(ctx, x, y, side, progress, explodeFactor, rotationY) {
  ctx.save();
  ctx.translate(x, y);

  // Perspective rotation stretch
  const skewX = Math.sin(rotationY) * 0.15 * side;
  ctx.transform(1, 0, skewX, 1, 0, 0);

  // Outer Aluminum Housing
  const grad = ctx.createLinearGradient(-100 * side, -140, 100 * side, 140);
  grad.addColorStop(0, '#27272a');
  grad.addColorStop(0.3, '#52525b');
  grad.addColorStop(0.5, '#f4f4f5');
  grad.addColorStop(0.8, '#27272a');
  grad.addColorStop(1, '#09090b');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, 110, 145, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glass Bezel Rim
  ctx.lineWidth = 6;
  const glassGrad = ctx.createLinearGradient(-80, -100, 80, 100);
  glassGrad.addColorStop(0, '#38bdf8');
  glassGrad.addColorStop(0.5, '#818cf8');
  glassGrad.addColorStop(1, '#c084fc');
  ctx.strokeStyle = glassGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, 102, 137, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Inner Acoustic Chamber / Mesh
  ctx.fillStyle = '#0d0d11';
  ctx.beginPath();
  ctx.ellipse(0, 0, 88, 120, 0, 0, Math.PI * 2);
  ctx.fill();

  // Metallic Driver Ring
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#3f3f46';
  ctx.beginPath();
  ctx.ellipse(0, 0, 70, 95, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Core Beryllium Speaker Center
  const coreGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 50);
  coreGrad.addColorStop(0, '#38bdf8');
  coreGrad.addColorStop(0.4, '#1e1b4b');
  coreGrad.addColorStop(1, '#09090b');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, 45, 60, 0, 0, Math.PI * 2);
  ctx.fill();

  // Memory Foam Cushion Outer Layer (detaches when exploded)
  const cushionOffset = explodeFactor * 45 * side;
  ctx.save();
  ctx.translate(cushionOffset, 0);

  ctx.fillStyle = 'rgba(24, 24, 27, 0.92)';
  ctx.lineWidth = 18;
  ctx.strokeStyle = '#18181b';
  ctx.beginPath();
  ctx.ellipse(0, 0, 115, 150, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Soft Cushion Inner Highlight
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 122, 157, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();

  // Active status ring indicator
  ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 + Math.sin(progress * 10) * 0.4})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 105, 140, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawExplodedComponents(ctx, explodeFactor, progress) {
  const compDist = explodeFactor * 80;

  // Floating Beryllium Acoustic Driver (Left & Right)
  [-1, 1].forEach((side) => {
    ctx.save();
    ctx.translate(side * (190 + compDist * 0.7), 60);

    // Driver Plate
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Voice Coil Copper Ring
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.stroke();

    // Soundwaves emitted from driver during exploded phase
    const pulse = (progress * 15) % 1;
    ctx.strokeStyle = `rgba(56, 189, 248, ${0.8 - pulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 40 + pulse * 35, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  });
}

for (let i = 0; i < TOTAL_FRAMES; i++) {
  renderFrame(i);
}

console.log('All 90 frames successfully generated in /frames/ directory!');
