/**
 * vaultyEngine.js — Procedural 2D Multi-Frame Spritesheet & Audio Engine for Vaulty
 * 
 * Generates 20 micro-frames (5 states × 4 columns) on a 512×640 canvas:
 * - Row 0: Idle (bobbing, breathing, eye blink)
 * - Row 1: Celebrate (jumping bounce, squash & stretch, tossing gold ₱ coin)
 * - Row 2: Thinking (rotating dial, radar sweep, chin scratch)
 * - Row 3: Alert (alarm shudder, slanted warning red eyes, shield drop)
 * - Row 4: Wave (enthusiastic arm wave, playful wink)
 * 
 * Also includes built-in Web Audio API tone synthesis (zero audio asset dependencies).
 */

export const FRAME_SIZE = 128;
export const FRAMES_PER_ANIMATION = 4;
export const ANIMATION_ROWS = 7;
export const ATLAS_WIDTH = FRAME_SIZE * FRAMES_PER_ANIMATION; // 512px
export const ATLAS_HEIGHT = FRAME_SIZE * ANIMATION_ROWS;      // 896px

export const ANIM_CONFIGS = {
  idle: {
    rowIndex: 0,
    name: 'IDLE',
    aura: 'idle',
    speed: 4, // FPS
    dialogue: "Guarding your funds peacefully! All accounts are secure and balances are intact."
  },
  celebrate: {
    rowIndex: 1,
    name: 'CELEBRATING',
    aura: 'celebrate',
    speed: 6,
    dialogue: "Hooray! Balance increased! You're making awesome financial progress, Liam!"
  },
  thinking: {
    rowIndex: 2,
    name: 'CALCULATING',
    aura: 'thinking',
    speed: 5,
    dialogue: "Scanning Philippine e-wallets and checking exchange rates across Maya and GCash..."
  },
  alert: {
    rowIndex: 3,
    name: 'SECURITY ALERT',
    aura: 'alert',
    speed: 8,
    dialogue: "Hold on Liam! Dining budget threshold exceeded. Safe lock engaged to prevent overspending!"
  },
  wave: {
    rowIndex: 4,
    name: 'GREETING',
    aura: 'wave',
    speed: 5,
    dialogue: "Hey Liam! Hope you have a productive day managing your e-wallets!"
  },
  yawn: {
    rowIndex: 5,
    name: 'ROBOTIC YAWN',
    aura: 'thinking',
    speed: 3,
    dialogue: "Yaaaawn... All balances are intact and accounts secure. Taking a quick 4-frame micro-nap!"
  },
  dial_buff: {
    rowIndex: 6,
    name: 'DIAL BUFFING',
    aura: 'celebrate',
    speed: 6,
    dialogue: "Buffing my gold combination dial to a mirror shine! Disciplined habits keep funds safe!"
  }
};

/**
 * Draws a single frame (colIdx, rowIdx) of Vaulty onto target 2D context
 */
export function renderVaultyFrame(ctx, colIdx, rowIdx, targetX, targetY, options = {}) {
  const cx = targetX + FRAME_SIZE / 2;
  const cy = targetY + FRAME_SIZE / 2;

  ctx.save();

  // Strict cell clipping: isolates each 128x128 frame cell to prevent spritesheet bleed across rows
  ctx.beginPath();
  ctx.rect(targetX, targetY, FRAME_SIZE, FRAME_SIZE);
  ctx.clip();

  // Palette Tokens (from reference and basis)
  const primaryIndigo = '#2e329d';
  const darkIndigo = '#1d1f70';
  const innerSafeBg = '#242784';
  const softLilac = '#bfdbfe';
  const eyeCyan = '#00f0ff';
  const goldAccent = '#fbbf24';
  const alertRed = '#f43f5e';
  const emeraldGreen = '#10b981';

  let bobX = 0;
  let bobY = 0;
  let bodyScaleX = 1;
  let bodyScaleY = 1;
  let bodyTilt = 0;
  let dialAngle = 0;
  let eyeType = 'normal'; // 'normal', 'halflid', 'blink', 'glimmer', 'happy', 'radar', 'stern', 'wink'
  let antennaColor = goldAccent;
  let antennaDipY = 0;
  let antennaSway = 0;
  let leftHandX = -38; // Default resting left hand position (bX - 4)
  let leftHandY = 0;
  let rightHandY = 0;
  let rightHandAngle = 0;
  let shieldDropY = 0;
  let coinY = 0;
  let coinSparkle = false;
  let radarAngle = 0;
  let sonarRipple = false;
  let zzzLevel = 0;
  let dialBuffSparkle = false;

  // ── Mechanical Robot Animation State Calculations ─────────────────
  if (rowIdx === 0) {
    // ROW 0: IDLE — Solid chassis float & multi-stage eyelid blinking arc
    bobY = [0, -2, -3.5, -1.5][colIdx];
    bodyScaleY = 1.0;
    bodyScaleX = 1.0; // Solid metal chassis stays 100% rigid (no rubber deformation)
    dialAngle = [0, 0.05, 0.08, 0.04][colIdx];
    // Blinking Arc: Open -> Half-lid droop -> Closed smile -> Reopen with glimmer
    eyeType = ['normal', 'halflid', 'blink', 'glimmer'][colIdx];
    antennaColor = (colIdx % 2 === 0) ? goldAccent : '#fde68a';
    antennaDipY = [0, -0.6, -1.2, -0.6][colIdx];
  }
  else if (rowIdx === 1) {
    // ROW 1: CELEBRATE — Solid hydraulic piston leap, 360° victory dial spin & antenna whip
    bodyScaleY = 1.0; // 100% rigid solid metal safe
    bodyScaleX = 1.0;

    if (colIdx === 0) {
      // Frame 0: Pneumatic piston crouch (solid block dips down)
      bobY = 4;
      dialAngle = 0;
      eyeType = 'happy';
      antennaColor = emeraldGreen;
      antennaDipY = 2.5; // Wire antenna dips with inertia
      leftHandY = 4;
      rightHandY = 4;
      coinY = 14; // Coin tucked in slot
    } else if (colIdx === 1) {
      // Frame 1: Hydraulic piston launch (solid chassis leaps up)
      bobY = -12;
      dialAngle = Math.PI * 0.7; // Rapid victory dial spin begins (~126°)
      eyeType = 'happy';
      antennaColor = '#34d399';
      antennaDipY = 4.0; // Wire antenna lags behind launch
      leftHandY = -18;
      rightHandY = -18; // Arms pump high into the air
      coinY = -8; // Gold coin shoots out of slot
    } else if (colIdx === 2) {
      // Frame 2: Apex hang time & victory peak
      bobY = -15;
      dialAngle = Math.PI * 1.5; // Dial continues fast spin (270°)
      eyeType = 'happy';
      antennaColor = emeraldGreen;
      antennaDipY = -2.0; // Antenna whips forward at apex
      leftHandY = -20;
      rightHandY = -20;
      coinY = -18; // Peak coin altitude
      coinSparkle = true;
    } else {
      // Frame 3: Piston landing shock absorption
      bobY = 2;
      dialAngle = Math.PI * 2.0; // Dial completes full 360° victory spin!
      eyeType = 'happy';
      antennaColor = emeraldGreen;
      antennaDipY = 2.2; // Antenna whips forward on impact recoil
      leftHandY = -8;
      rightHandY = -8;
      coinY = -4; // Coin returns towards slot
    }
  }
  else if (rowIdx === 2) {
    // ROW 2: THINKING — Dial rotation & curious radar sonar waves
    bobY = [0, -1.5, 0, 1][colIdx];
    dialAngle = colIdx * (Math.PI / 2);
    radarAngle = colIdx * (Math.PI / 2);
    eyeType = 'radar';
    antennaColor = '#38bdf8';
    sonarRipple = true;
    leftHandY = [0, -2, -3, -1][colIdx];
    rightHandY = -12; // Chin scratch pose
  }
  else if (rowIdx === 3) {
    // ROW 3: ALERT — High frequency shudder & defensive shield
    bobX = [-2.5, 2.5, -2, 2][colIdx];
    bobY = (colIdx % 2 === 0) ? -1 : 1;
    eyeType = 'stern';
    antennaColor = (colIdx % 2 === 0) ? alertRed : '#fecdd3';
    shieldDropY = [0, 2, 4, 2][colIdx];
    dialAngle = (colIdx % 2 === 0) ? -0.12 : 0.12;
  }
  else if (rowIdx === 4) {
    // ROW 4: WAVE — Playful arm wave with natural torso counter-tilt
    bobY = [0, -2, -1, -2][colIdx];
    bodyTilt = [-0.04, 0.035, -0.04, 0.035][colIdx]; // Organic body counter-sway
    antennaSway = [0.06, -0.05, 0.06, -0.05][colIdx];
    rightHandAngle = [-0.45, 0.35, -0.45, 0.35][colIdx];
    rightHandY = -15;
    eyeType = (colIdx === 1 || colIdx === 2) ? 'wink' : 'normal';
    antennaColor = '#c084fc';
  }
  else if (rowIdx === 5) {
    // ROW 5: YAWN (22.7.1) — Sleepy eyelid droop, drowsy head tilt, tiny yawning mouth & floating Zzz
    bobY = [0, 1.5, 3, 1.2][colIdx];
    bodyTilt = [0, 0.03, 0.05, 0.02][colIdx];
    eyeType = 'sleepy';
    antennaColor = '#67e8f9';
    antennaDipY = [0, 1, 2, 0.6][colIdx];
    zzzLevel = colIdx + 1;
  }
  else if (rowIdx === 6) {
    // ROW 6: DIAL BUFFING (22.7.1) — Left arm scrubs over gold combination dial + sparkle glint
    bobY = [0, -1, 0, -1][colIdx];
    bodyTilt = [-0.02, 0.02, -0.02, 0.02][colIdx];
    eyeType = (colIdx === 1 || colIdx === 2) ? 'wink' : 'happy';
    dialAngle = [0, 0.5, 1.0, 1.5][colIdx];
    // Articulate left hand across chassis to scrub gold dial at (dialX=0, dialY=10)
    leftHandX = [-6, 6, 8, -2][colIdx];
    leftHandY = [8, 12, 10, 13][colIdx];
    if (colIdx >= 2) {
      dialBuffSparkle = true;
    }
  }

  // Dynamic Idle Enhancements (Item 2 & 3: Organic Blinking, Head Tilt, Radar Ping & Circadian Lighting)
  if (options) {
    if (options.coverEyes) {
      // In cover eyes (peek-a-boo) mode:
      if (options.peek) {
        eyeType = 'wink'; // right eye peeking through with bright spark, left eye closed!
        antennaColor = '#38bdf8'; // curious sky blue
        bodyTilt += 0.05; // curious tilt forward
      } else {
        eyeType = 'blink'; // gentle closed smile curve eyes behind hands
        antennaColor = '#f472b6'; // shy pink
        bodyTilt += 0.02; // shy gentle tilt
      }
    } else {
      if (options.eyeOverride && rowIdx !== 4) {
        eyeType = options.eyeOverride;
      }
      if (typeof options.bodyTiltOffset === "number" && rowIdx !== 4) {
        bodyTilt += options.bodyTiltOffset;
      }
      if (options.sonarRipple) {
        sonarRipple = true;
      }
      if (options.antennaColor) {
        antennaColor = options.antennaColor;
      }
      if (options.sleepyEyelids && eyeType === "normal" && rowIdx !== 4) {
        eyeType = "halflid";
      }
    }
  }

  // 1. Dynamic Drop Shadow (Unrotated, reacts to height & squash)
  ctx.beginPath();
  const shadowRadius = (32 - Math.abs(bobY) * 0.9) * bodyScaleX;
  ctx.ellipse(cx, cy + 46, Math.max(18, shadowRadius), 7 * bodyScaleX, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(30, 41, 59, 0.14)';
  ctx.fill();

  // 2. Character Transform Hierarchy (Center translation, tilt & squash/stretch)
  ctx.save();
  ctx.translate(cx + bobX, cy + bobY);
  ctx.rotate(bodyTilt);
  ctx.scale(bodyScaleX, bodyScaleY);

  // Vault Robot Main Body (Relative to 0,0)
  const bW = 68;
  const bH = 64;
  const bX = -bW / 2;
  const bY = -bH / 2;
  const radius = 18;

  ctx.beginPath();
  ctx.roundRect(bX, bY, bW, bH, radius);
  ctx.fillStyle = primaryIndigo;
  ctx.fill();
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = darkIndigo;
  ctx.stroke();

  // Inner safe door panel
  ctx.beginPath();
  ctx.roundRect(bX + 5, bY + 5, bW - 10, bH - 10, 12);
  ctx.fillStyle = innerSafeBg;
  ctx.fill();

  // 3. Vault Door Bolts / Rivets (4 corners)
  const rivetCoords = [
    [bX + 9, bY + 9],
    [bX + bW - 9, bY + 9],
    [bX + 9, bY + bH - 9],
    [bX + bW - 9, bY + bH - 9]
  ];
  rivetCoords.forEach(([rx, ry]) => {
    ctx.beginPath();
    ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = softLilac;
    ctx.fill();
  });

  // 4. Safe Center Dial / Combination Lock
  const dialX = 0;
  const dialY = 10;

  ctx.save();
  ctx.translate(dialX, dialY);
  ctx.rotate(dialAngle);

  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.fillStyle = '#17184a';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#f59e0b';
  ctx.stroke();

  // Gold dial handle
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fillStyle = (rowIdx === 3) ? alertRed : goldAccent;
  ctx.fill();

  // Spokes on dial
  ctx.strokeStyle = (rowIdx === 3) ? alertRed : '#ffffff';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, -11); ctx.lineTo(0, -7);
  ctx.moveTo(0, 7); ctx.lineTo(0, 11);
  ctx.moveTo(-11, 0); ctx.lineTo(-7, 0);
  ctx.moveTo(7, 0); ctx.lineTo(11, 0);
  ctx.stroke();

  ctx.restore();

  // 22.7.1 Sparkle star glint on dial during Dial Buffing
  if (dialBuffSparkle) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    const sx = dialX + 11;
    const sy = dialY - 8;
    ctx.beginPath();
    ctx.moveTo(sx, sy - 5);
    ctx.quadraticCurveTo(sx, sy, sx + 5, sy);
    ctx.quadraticCurveTo(sx, sy, sx, sy + 5);
    ctx.quadraticCurveTo(sx, sy, sx - 5, sy);
    ctx.quadraticCurveTo(sx, sy, sx, sy - 5);
    ctx.fill();
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 5. LED Screen Visor for Eyes
  const visorW = 46;
  const visorH = 18;
  const visorX = -visorW / 2;
  const visorY = bY + 9 + shieldDropY;

  ctx.beginPath();
  ctx.roundRect(visorX, visorY, visorW, visorH, 7);
  ctx.fillStyle = '#0f172a';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#334155';
  ctx.stroke();

  // 6. Antenna on Vaulty (with inertia lag follow-through)
  const antennaBaseX = 0;
  const antennaBaseY = bY;
  const antennaTipX = antennaBaseX + Math.sin(antennaSway) * 12;
  const antennaTipY = antennaBaseY - 13 + antennaDipY;

  ctx.beginPath();
  ctx.moveTo(antennaBaseX, antennaBaseY);
  ctx.lineTo(antennaTipX, antennaTipY);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = darkIndigo;
  ctx.stroke();

  // Sonar radar ripple rings for Thinking state
  if (sonarRipple) {
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(antennaTipX, antennaTipY, 9, -Math.PI * 0.8, -Math.PI * 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(antennaTipX, antennaTipY, 14, -Math.PI * 0.8, -Math.PI * 0.2);
    ctx.stroke();
    ctx.restore();
  }

  // Glowing Antenna Tip Orb
  ctx.beginPath();
  ctx.arc(antennaTipX, antennaTipY, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = antennaColor;
  ctx.fill();

  // 22.7.1 Floating "Zzz" particles rising from antenna orb during Robotic Yawn (kept safely within frame boundaries)
  if (zzzLevel > 0) {
    ctx.save();
    ctx.fillStyle = '#67e8f9';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (zzzLevel >= 1) {
      ctx.globalAlpha = 0.85;
      ctx.font = 'bold 6.5px system-ui, sans-serif';
      ctx.fillText('z', antennaTipX + 7, antennaTipY - 5);
    }
    if (zzzLevel >= 2) {
      ctx.globalAlpha = 0.9;
      ctx.font = 'bold 8px system-ui, sans-serif';
      ctx.fillText('Z', antennaTipX + 13, antennaTipY - 9);
    }
    if (zzzLevel >= 3) {
      ctx.globalAlpha = 0.95;
      ctx.font = 'bold 9.5px system-ui, sans-serif';
      ctx.fillText('Z', antennaTipX + 18, antennaTipY - 13);
    }
    ctx.restore();
  }

  // 7. Render Eyes based on micro-state (with multi-stage eyelid arc)
  if (eyeType === 'normal') {
    // Normal cyan pill eyes
    ctx.fillStyle = eyeCyan;
    ctx.beginPath();
    ctx.ellipse(-10, visorY + visorH / 2, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(10, visorY + visorH / 2, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  else if (eyeType === 'halflid') {
    // Anticipation half-lid eyelid droop
    ctx.fillStyle = eyeCyan;
    ctx.beginPath();
    ctx.ellipse(-10, visorY + visorH / 2 + 1, 4.2, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(10, visorY + visorH / 2 + 1, 4.2, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  else if (eyeType === 'blink') {
    // Closed happy curve blink
    ctx.strokeStyle = eyeCyan;
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(-10, visorY + visorH / 2 + 1, 4.2, 0.1 * Math.PI, 0.9 * Math.PI, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(10, visorY + visorH / 2 + 1, 4.2, 0.1 * Math.PI, 0.9 * Math.PI, false);
    ctx.stroke();
  }
  else if (eyeType === 'glimmer') {
    // Wide open with bright specular glint
    ctx.fillStyle = eyeCyan;
    ctx.beginPath();
    ctx.ellipse(-10, visorY + visorH / 2, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(10, visorY + visorH / 2, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Specular glint
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-11.5, visorY + visorH / 2 - 1.8, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(8.5, visorY + visorH / 2 - 1.8, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  else if (eyeType === 'happy') {
    // Arched joyous carets (^ ^)
    ctx.strokeStyle = emeraldGreen;
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-14, visorY + 12);
    ctx.lineTo(-10, visorY + 6);
    ctx.lineTo(-6, visorY + 12);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(6, visorY + 12);
    ctx.lineTo(10, visorY + 6);
    ctx.lineTo(14, visorY + 12);
    ctx.stroke();
  }
  else if (eyeType === 'radar') {
    // Rotating radar scanner
    ctx.save();
    ctx.translate(0, visorY + visorH / 2);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(radarAngle) * 6, Math.sin(radarAngle) * 6);
    ctx.stroke();
    ctx.restore();
  }
  else if (eyeType === 'stern') {
    // Warning slanted alarm brows
    ctx.fillStyle = alertRed;
    ctx.beginPath();
    ctx.moveTo(-14, visorY + 6);
    ctx.lineTo(-6, visorY + 11);
    ctx.lineTo(-7, visorY + 14);
    ctx.lineTo(-15, visorY + 10);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(14, visorY + 6);
    ctx.lineTo(6, visorY + 11);
    ctx.lineTo(7, visorY + 14);
    ctx.lineTo(15, visorY + 10);
    ctx.fill();
  }
  else if (eyeType === 'wink') {
    // Wink (^ •)
    ctx.strokeStyle = eyeCyan;
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-14, visorY + 12);
    ctx.lineTo(-10, visorY + 7);
    ctx.lineTo(-6, visorY + 12);
    ctx.stroke();

    ctx.fillStyle = eyeCyan;
    ctx.beginPath();
    ctx.ellipse(10, visorY + visorH / 2, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(8.8, visorY + visorH / 2 - 1.5, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  else if (eyeType === 'sleepy') {
    // 22.7.1 Sleepy drooped cyan eye curves with gentle blink
    ctx.strokeStyle = eyeCyan;
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(-10, visorY + visorH / 2 + 1, 4.2, 0.15 * Math.PI, 0.85 * Math.PI, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(10, visorY + visorH / 2 + 1, 4.2, 0.15 * Math.PI, 0.85 * Math.PI, false);
    ctx.stroke();

    // Cute tiny open yawn mouth
    ctx.fillStyle = eyeCyan;
    ctx.beginPath();
    ctx.ellipse(0, visorY + visorH / 2 + 2, 2.2, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 8. Hands & Gestures
  ctx.fillStyle = softLilac;

  if (options && options.coverEyes) {
    // ── PEEK-A-BOO / COVER EYES MODE ─────────────────────────
    // Soft rosy cheek blush
    ctx.save();
    ctx.fillStyle = 'rgba(251, 113, 133, 0.45)';
    ctx.beginPath();
    ctx.ellipse(-18, visorY + visorH + 2, 4.5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(18, visorY + visorH + 2, 4.5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const shoulderLeftX = bX + 5;   // ~-29
    const shoulderLeftY = 4;
    const shoulderRightX = bX + bW - 5; // ~29
    const shoulderRightY = 4;

    // Left Arm & Mitten — firmly covering the left eye at (-10, visorY + visorH / 2)
    const leftTargetX = -10;
    const leftTargetY = visorY + visorH / 2;

    ctx.save();
    ctx.strokeStyle = softLilac;
    ctx.lineWidth = 6.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(shoulderLeftX, shoulderLeftY);
    ctx.lineTo(leftTargetX - 2, leftTargetY + 4);
    ctx.stroke();

    // Left mitten hand covering left visor eye
    ctx.translate(leftTargetX, leftTargetY);
    ctx.rotate(0.25);
    ctx.fillStyle = softLilac;
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Cute mitten thumb tucked slightly inwards
    ctx.beginPath();
    ctx.arc(3.5, -2, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Right Arm & Mitten
    if (options.peek) {
      // PEEK MODE: Right hand pulls down and tilts away so right eye is revealed
      const peekHandX = 22;
      const peekHandY = visorY + visorH + 4; // clearly below the eye so right eye is exposed
      ctx.save();
      ctx.strokeStyle = softLilac;
      ctx.lineWidth = 6.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(shoulderRightX, shoulderRightY);
      ctx.lineTo(peekHandX, peekHandY);
      ctx.stroke();

      ctx.translate(peekHandX, peekHandY);
      ctx.rotate(0.4);
      ctx.fillStyle = softLilac;
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 6.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Little peek thumb pointing up
      ctx.beginPath();
      ctx.arc(-3.5, -2, 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      // FULL COVER MODE: Right hand firmly covers right eye at (10, visorY + visorH / 2)
      const rightTargetX = 10;
      const rightTargetY = visorY + visorH / 2;
      ctx.save();
      ctx.strokeStyle = softLilac;
      ctx.lineWidth = 6.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(shoulderRightX, shoulderRightY);
      ctx.lineTo(rightTargetX + 2, rightTargetY + 4);
      ctx.stroke();

      // Right mitten hand covering right visor eye
      ctx.translate(rightTargetX, rightTargetY);
      ctx.rotate(-0.25);
      ctx.fillStyle = softLilac;
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 6.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Cute mitten thumb
      ctx.beginPath();
      ctx.arc(-3.5, -2, 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else {
    // Left Hand (supports articulating over safe dial during Dial Buffing)
    ctx.beginPath();
    ctx.arc(leftHandX, 6 + leftHandY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Right Hand & Arm (supports dynamic waving gesture in Row 4)
    if (rowIdx === 4) {
      // Distinct waving arm with articulated connecting limb and oscillating mitten
      const waveHandX = [35, 45, 34, 46][colIdx];
      const waveHandY = [-14, -20, -15, -22][colIdx];
      const waveAngle = [-0.55, 0.45, -0.5, 0.5][colIdx];
      const shoulderX = bX + bW - 4;
      const shoulderY = 4;

      ctx.save();
      // Arm limb connecting shoulder to hand
      ctx.strokeStyle = softLilac;
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(shoulderX, shoulderY);
      ctx.lineTo(waveHandX, waveHandY);
      ctx.stroke();

      // Waving mitten hand
      ctx.translate(waveHandX, waveHandY);
      ctx.rotate(waveAngle);
      ctx.fillStyle = softLilac;
      ctx.beginPath();
      ctx.ellipse(0, 0, 7, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Cute thumb
      ctx.beginPath();
      ctx.arc(-3.5, 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.save();
      ctx.translate(bX + bW + 4, 6 + rightHandY);
      ctx.rotate(rightHandAngle);
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Extra FX: Floating gold coin for Celebrate state
  if (rowIdx === 1 && coinY !== 0) {
    ctx.save();
    ctx.fillStyle = goldAccent;
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(22, coinY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('₱', 22, coinY);

    if (coinSparkle) {
      // Little gold sparkle star
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(26, coinY - 5, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.restore(); // Character Transform Hierarchy
  ctx.restore(); // Root Target Context
}

/**
 * Creates and returns the full 512×640 master spritesheet canvas
 */
export function generateMasterSpritesheetAtlas() {
  const canvas = document.createElement('canvas');
  canvas.width = ATLAS_WIDTH;
  canvas.height = ATLAS_HEIGHT;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, ATLAS_WIDTH, ATLAS_HEIGHT);

  for (let r = 0; r < ANIMATION_ROWS; r++) {
    for (let c = 0; c < FRAMES_PER_ANIMATION; c++) {
      renderVaultyFrame(ctx, c, r, c * FRAME_SIZE, r * FRAME_SIZE);
    }
  }

  return canvas;
}

// Global audio context singleton
let globalAudioCtx = null;

/**
 * Plays procedural 8-bit / synth audio chime (Zero audio asset files needed!)
 */
export function playTone(type, enabled = true) {
  if (!enabled || typeof window === 'undefined') return;

  try {
    if (!globalAudioCtx) {
      globalAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume();
    }

    const now = globalAudioCtx.currentTime;

    if (type === 'coin') {
      const osc = globalAudioCtx.createOscillator();
      const gain = globalAudioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(globalAudioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    }
    else if (type === 'fanfare') {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = globalAudioCtx.createOscillator();
        const gain = globalAudioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const t = now + i * 0.08;
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
        osc.connect(gain);
        gain.connect(globalAudioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.28);
      });
    }
    else if (type === 'alert') {
      [0, 0.12].forEach((offset) => {
        const osc = globalAudioCtx.createOscillator();
        const gain = globalAudioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(340, now + offset);
        osc.frequency.setValueAtTime(260, now + offset + 0.06);
        gain.gain.setValueAtTime(0.09, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);
        osc.connect(gain);
        gain.connect(globalAudioCtx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.1);
      });
    }
    else if (type === 'yawn') {
      const osc = globalAudioCtx.createOscillator();
      const gain = globalAudioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.5);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc.connect(gain);
      gain.connect(globalAudioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.55);
    }
    else if (type === 'buff') {
      [0, 0.08, 0.16].forEach((offset, idx) => {
        const osc = globalAudioCtx.createOscillator();
        const gain = globalAudioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200 + idx * 300, now + offset);
        gain.gain.setValueAtTime(0.06, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.07);
        osc.connect(gain);
        gain.connect(globalAudioCtx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.07);
      });
    }
    else if (type === 'ping') {
      const osc = globalAudioCtx.createOscillator();
      const gain = globalAudioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.16);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(globalAudioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    }
    else if (type === 'cover') {
      const osc = globalAudioCtx.createOscillator();
      const gain = globalAudioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(370, now + 0.16);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(globalAudioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    }
    else if (type === 'peek') {
      [0, 0.07].forEach((offset, idx) => {
        const osc = globalAudioCtx.createOscillator();
        const gain = globalAudioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(idx === 0 ? 880 : 1320, now + offset);
        gain.gain.setValueAtTime(0.06, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);
        osc.connect(gain);
        gain.connect(globalAudioCtx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.12);
      });
    }
  } catch (err) {
    console.warn('Audio synthesis not supported or blocked:', err);
  }
}
