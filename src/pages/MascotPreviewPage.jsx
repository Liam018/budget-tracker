import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  ShieldCheck,
  Volume2,
  VolumeX,
  Film,
  Plus,
  RefreshCw,
  Trophy,
  AlertTriangle,
  Copy,
  Check,
  Download,
  X,
  LayoutGrid,
  ArrowLeft,
  Sliders,
  Maximize2,
  Minimize2,
} from "lucide-react"
import {
  FRAME_SIZE,
  FRAMES_PER_ANIMATION,
  ATLAS_WIDTH,
  ATLAS_HEIGHT,
  ANIM_CONFIGS,
  generateMasterSpritesheetAtlas,
  renderVaultyFrame,
  playTone,
} from "../components/mascot/vaultyEngine"
import { useVaultyIdleQuirks } from "../components/mascot/useVaultyIdleQuirks"
import { useVaultyIdleEnhancements } from "../components/mascot/useVaultyIdleEnhancements"
import { CIRCADIAN_SLOTS } from "../components/mascot/vaultyCircadian"
import "../components/mascot/vaulty.css"

export default function MascotPreviewPage() {
  const navigate = useNavigate()

  // Runtime animation state
  const [currentAnimKey, setCurrentAnimKey] = useState("idle")
  const [animationFps, setAnimationFps] = useState(4)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isStudioOpen, setIsStudioOpen] = useState(false)
  const [isFullViewOpen, setIsFullViewOpen] = useState(false)
  const [fullViewScale, setFullViewScale] = useState(2.5)
  const [copyStatus, setCopyStatus] = useState("Copy CSS & HTML")
  const [circadianSlotKey, setCircadianSlotKey] = useState("auto")

  const handleIdleMicroWave = (duration = 2400) => {
    // Safeguard: do not trigger idle wave if another animation is already playing
    if (currentAnimKey !== "idle") return

    playTone("coin", soundEnabled)
    changeAnimation("wave", {
      duration,
      speech: "Kamusta! Kuri is waving hello while keeping your funds secure!",
    })
  }

  // Natural Micro-Breakdowns & Circadian Enhancements (Items 2 & 3)
  const {
    circadianProfile,
    ambientStatus,
    triggerRadarPing,
    getRenderOptions,
  } = useVaultyIdleEnhancements({
    isIdle: currentAnimKey === "idle",
    soundEnabled,
    timeSlot: circadianSlotKey,
    onAmbientDialogue: (text) => {
      setSpeechText(text)
    },
    onWaveTrigger: handleIdleMicroWave,
  })

  const [speechText, setSpeechText] = useState(circadianProfile.greeting)

  const renderOptionsRef = useRef(getRenderOptions())
  useEffect(() => {
    renderOptionsRef.current = getRenderOptions()
  })

  const handleSelectCircadianSlot = (slot) => {
    setCircadianSlotKey(slot)
    const prof = CIRCADIAN_SLOTS[slot] || circadianProfile
    if (currentAnimKey === "idle") {
      setSpeechText(prof.greeting)
      setAnimationFps(prof.fps)
    }
  }

  // 22.7.1 Secondary Rare Idle Quirks: Automatically triggers Yawn or Dial Buffing after 25-40s of inactivity
  useVaultyIdleQuirks({
    enabled: true,
    currentMood: currentAnimKey,
    minSeconds: 25,
    maxSeconds: 40,
    onQuirkTrigger: (quirkType) => {
      // Safeguard: strictly verify mascot is currently in idle before launching quirk
      if (currentAnimKey !== "idle") return

      playTone(quirkType === "yawn" ? "yawn" : "buff", soundEnabled)
      changeAnimation(quirkType, { duration: 4200 })
    },
  })

  // Refs for Canvas Animation & Transition Token Safeguard
  const activeCanvasRef = useRef(null)
  const fullViewCanvasRef = useRef(null)
  const studioCanvasRef = useRef(null)
  const masterAtlasRef = useRef(null)
  const currentFrameIndexRef = useRef(0)
  const lastFrameTimeRef = useRef(0)
  const animKeyRef = useRef(currentAnimKey)
  const fpsRef = useRef(animationFps)
  const autoResetTimerRef = useRef(null)
  const activeTokenRef = useRef(0)

  // Full Screen Actions
  const enterFullScreen = () => {
    setIsFullViewOpen(true)
    playTone("coin", soundEnabled)
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    }
  }

  const exitFullScreen = () => {
    setIsFullViewOpen(false)
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {})
    }
  }

  // Escape key & fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullViewOpen) {
        setIsFullViewOpen(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        exitFullScreen()
        setIsStudioOpen(false)
      }
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isFullViewOpen])

  // Sync refs with state
  useEffect(() => {
    animKeyRef.current = currentAnimKey
  }, [currentAnimKey])

  useEffect(() => {
    fpsRef.current = animationFps
  }, [animationFps])

  // Initialize master atlas and start animation loop on mount
  useEffect(() => {
    const atlasCanvas = generateMasterSpritesheetAtlas()
    masterAtlasRef.current = atlasCanvas

    // Mirror to studio canvas if already rendered
    if (studioCanvasRef.current) {
      const sCtx = studioCanvasRef.current.getContext("2d")
      sCtx.clearRect(0, 0, ATLAS_WIDTH, ATLAS_HEIGHT)
      sCtx.drawImage(atlasCanvas, 0, 0)
    }

    // Animation loop for active mascot display
    let animationFrameId
    const loop = (timestamp) => {
      if (!lastFrameTimeRef.current) lastFrameTimeRef.current = timestamp
      const elapsed = timestamp - lastFrameTimeRef.current
      const frameInterval = 1000 / fpsRef.current

      if (elapsed > frameInterval) {
        lastFrameTimeRef.current = timestamp - (elapsed % frameInterval)
        currentFrameIndexRef.current = (currentFrameIndexRef.current + 1) % FRAMES_PER_ANIMATION

        const targets = [activeCanvasRef.current, fullViewCanvasRef.current].filter(Boolean)
        targets.forEach((canvas) => {
          const ctx = canvas.getContext("2d")
          ctx.clearRect(0, 0, FRAME_SIZE, FRAME_SIZE)

          if (animKeyRef.current === "idle") {
            // Dynamic idle rendering: if spontaneous micro-wave is active render Row 4 (WAVE), else Row 0 (IDLE)
            const rowToRender = renderOptionsRef.current?.isWaveActive ? 4 : 0
            renderVaultyFrame(
              ctx,
              currentFrameIndexRef.current,
              rowToRender,
              0,
              0,
              renderOptionsRef.current
            )
          } else if (masterAtlasRef.current) {
            const config = ANIM_CONFIGS[animKeyRef.current] || ANIM_CONFIGS.idle
            const srcX = currentFrameIndexRef.current * FRAME_SIZE
            const srcY = config.rowIndex * FRAME_SIZE

            ctx.drawImage(
              masterAtlasRef.current,
              srcX,
              srcY,
              FRAME_SIZE,
              FRAME_SIZE,
              0,
              0,
              FRAME_SIZE,
              FRAME_SIZE
            )
          }
        })
      }

      animationFrameId = requestAnimationFrame(loop)
    }

    animationFrameId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animationFrameId)
      if (autoResetTimerRef.current) clearTimeout(autoResetTimerRef.current)
    }
  }, [])

  // Draw on studio canvas when studio modal opens
  useEffect(() => {
    if (isStudioOpen && studioCanvasRef.current && masterAtlasRef.current) {
      const sCtx = studioCanvasRef.current.getContext("2d")
      sCtx.clearRect(0, 0, ATLAS_WIDTH, ATLAS_HEIGHT)
      sCtx.drawImage(masterAtlasRef.current, 0, 0)
    }
  }, [isStudioOpen])

  // Change state handler with Transition Token Safeguard
  const changeAnimation = (stateKey, options = {}) => {
    if (!ANIM_CONFIGS[stateKey]) return

    // Invalidate any previously scheduled reset timer
    const transitionToken = ++activeTokenRef.current

    if (autoResetTimerRef.current) {
      clearTimeout(autoResetTimerRef.current)
      autoResetTimerRef.current = null
    }

    setCurrentAnimKey(stateKey)
    currentFrameIndexRef.current = 0
    const config = ANIM_CONFIGS[stateKey]
    const targetFps = options.fps || (stateKey === "idle" ? circadianProfile.fps : config.speed)
    setAnimationFps(targetFps)

    if (options.speech) {
      setSpeechText(options.speech)
    } else if (stateKey === "idle") {
      setSpeechText(circadianProfile.greeting)
    } else {
      setSpeechText(config.dialogue)
    }

    if (stateKey !== "idle" && !options.persistent) {
      autoResetTimerRef.current = setTimeout(() => {
        // Token Safeguard: only transition back if no newer state has taken over
        if (activeTokenRef.current === transitionToken) {
          changeAnimation("idle")
        }
      }, options.duration || 4200)
    }
  }

  // Mascot Poke
  const handleMascotPoke = () => {
    playTone("coin", soundEnabled)
    changeAnimation("wave", {
      speech: "Bop! Hi Liam! My 4-frame servos are feeling extra bouncy today!",
    })
  }

  // Confetti helper
  const triggerConfetti = () => {
    const count = 50
    const container = document.createElement("div")
    container.style.position = "fixed"
    container.style.inset = "0"
    container.style.pointerEvents = "none"
    container.style.zIndex = "99999"
    document.body.appendChild(container)

    const colors = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#3b82f6", "#8b5cf6"]
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div")
      el.style.position = "absolute"
      el.style.width = `${Math.random() * 8 + 5}px`
      el.style.height = `${Math.random() * 8 + 5}px`
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
      el.style.left = `${Math.random() * 100}vw`
      el.style.top = "-10px"
      el.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px"
      el.style.transition = `transform ${Math.random() * 1.5 + 1.2}s cubic-bezier(0.25, 1, 0.5, 1), top ${Math.random() * 1.5 + 1.2}s cubic-bezier(0.25, 1, 0.5, 1), opacity 2s ease`
      container.appendChild(el)

      requestAnimationFrame(() => {
        el.style.top = `${Math.random() * 60 + 40}vh`
        el.style.transform = `translate(${Math.random() * 100 - 50}px, 0) rotate(${Math.random() * 720}deg)`
      })
    }

    setTimeout(() => {
      container.style.transition = "opacity 0.6s ease"
      container.style.opacity = "0"
      setTimeout(() => container.remove(), 700)
    }, 1800)
  }

  // Simulator actions
  const triggerSimulation = (type) => {
    if (type === "deposit") {
      playTone("coin", soundEnabled)
      changeAnimation("celebrate", {
        speech: "Deposit registered! Added ₱500.00 to your wallet balance.",
        duration: 3800,
      })
    } else if (type === "sync") {
      playTone("coin", soundEnabled)
      changeAnimation("thinking", {
        speech: "Syncing accounts across all financial ledgers. All up to date!",
        duration: 3500,
      })
    } else if (type === "goal") {
      playTone("fanfare", soundEnabled)
      triggerConfetti()
      changeAnimation("celebrate", {
        speech: "FANTASTIC! Savings target hit! You reached your emergency buffer goal!",
        duration: 5000,
      })
    } else if (type === "warning") {
      playTone("alert", soundEnabled)
      changeAnimation("alert", {
        speech: "Alert! Dining expenses over ₱1,000 threshold. Watch your budget limit!",
        duration: 4500,
      })
    }
  }

  // Download Spritesheet PNG
  const downloadMasterSpritesheet = () => {
    if (!masterAtlasRef.current) return
    const link = document.createElement("a")
    link.download = "kuri-animated-spritesheet-20frames.png"
    link.href = masterAtlasRef.current.toDataURL("image/png")
    link.click()
    playTone("fanfare", soundEnabled)
  }

  // Copy CSS snippet
  const copySpritesheetCode = () => {
    const codeSnippet = `/* 1. Multi-Frame CSS Spritesheet Class */
.kuri-character {
  width: 128px;
  height: 128px;
  background-image: url('kuri-animated-spritesheet-20frames.png');
  background-size: 512px 640px; /* 4 cols x 5 rows */
}

/* 2. Keyframes using steps(4) for fluid 4-frame animation */
@keyframes kuri-strip {
  from { background-position-x: 0px; }
  to   { background-position-x: -512px; }
}

.kuri-character.idle      { background-position-y: 0px;    animation: kuri-strip 1s steps(4) infinite; }
.kuri-character.celebrate { background-position-y: -128px; animation: kuri-strip 0.7s steps(4) infinite; }
.kuri-character.thinking  { background-position-y: -256px; animation: kuri-strip 0.9s steps(4) infinite; }
.kuri-character.alert     { background-position-y: -384px; animation: kuri-strip 0.5s steps(4) infinite; }
.kuri-character.wave      { background-position-y: -512px; animation: kuri-strip 0.8s steps(4) infinite; }`

    navigator.clipboard.writeText(codeSnippet).then(() => {
      setCopyStatus("Copied to Clipboard!")
      playTone("coin", soundEnabled)
      setTimeout(() => setCopyStatus("Copy CSS & HTML"), 2200)
    })
  }

  const currentConfig = ANIM_CONFIGS[currentAnimKey] || ANIM_CONFIGS.idle

  return (
    <div className="min-h-screen pb-16 antialiased selection:bg-indigo-100 selection:text-indigo-900 bg-[#eef2f7] text-slate-800 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* ── Top Navigation Bar ──────────────────────────────────── */}
        <header className="flex items-center justify-between py-3.5 px-4 sm:px-6 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <div className="h-5 w-px bg-slate-200"></div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                  Kuri the Ro-Vault Lab
                </span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                  Pocket Vault-Keeper
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Interactive Testing Sandbox • 20-Frame Procedural Animation • "Smart, not kuripot."
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* Sound FX Toggle */}
            <button
              type="button"
              onClick={() => {
                setSoundEnabled(!soundEnabled)
                playTone("coin", !soundEnabled)
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 size={16} className="text-indigo-600" />
              ) : (
                <VolumeX size={16} className="text-slate-400" />
              )}
              <span className="hidden sm:inline">{soundEnabled ? "Audio On" : "Muted"}</span>
            </button>

            {/* Full Screen Button on the right side of header */}
            <button
              type="button"
              onClick={enterFullScreen}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-xs transition hover:scale-102 active:scale-95 cursor-pointer"
            >
              <Maximize2 size={15} />
              <span>Full Screen</span>
            </button>

            {/* Spritesheet Studio Modal Open Button */}
            <button
              type="button"
              onClick={() => {
                setIsStudioOpen(true)
                playTone("coin", soundEnabled)
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-700 hover:bg-indigo-800 text-white shadow-md shadow-indigo-600/30 transition hover:scale-102 active:scale-95 cursor-pointer"
            >
              <Film size={16} />
              <span>Spritesheet Studio</span>
            </button>
          </div>
        </header>

        {/* ── Mascot Interactive Companion Testing Stage ───────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/85 p-6 sm:p-8 shadow-[8px_8px_22px_#d4dce8,-8px_8px_22px_#ffffff] transition-all">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Left: Interactive Mascot Canvas and Live Speech Bubble */}
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
              {/* Mascot Interactive Frame Display */}
              <div
                className="relative group cursor-pointer shrink-0"
                onClick={handleMascotPoke}
                title="Click Kuri the Ro-Vault to poke and interact!"
              >
                {/* Full Screen Button placed on the RIGHT side of the card */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    enterFullScreen()
                  }}
                  className="absolute -top-3 -right-3 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-slate-700 hover:text-indigo-600 border border-slate-200 shadow-md transition hover:scale-105 active:scale-95 cursor-pointer text-[11px] font-bold"
                  title="Open Full Screen View"
                >
                  <Maximize2 size={12} className="text-indigo-600" />
                  <span>Full Screen</span>
                </button>

                {/* Radial Aura Ambient Glow */}
                <div className={`mascot-ambient ${currentConfig.aura}`}></div>

                <div className="relative w-32 h-32 rounded-3xl bg-linear-to-b from-slate-50 to-slate-100 border border-slate-200 shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center overflow-hidden transition-all duration-300">
                  {/* Direct Canvas Multi-frame Animation Display with Hybrid 60 FPS Physics */}
                  <canvas
                    ref={activeCanvasRef}
                    width={FRAME_SIZE}
                    height={FRAME_SIZE}
                    className={`w-32 h-32 image-render-pixelated vaulty-physics-${currentAnimKey} transition-transform duration-300`}
                  />

                  {/* State Tag Badge */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-black/75 backdrop-blur-md rounded-full text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>{currentConfig.name}</span>
                  </div>
                </div>

                <span className="absolute -bottom-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md pointer-events-none group-hover:scale-105 transition">
                  Poke me!
                </span>
              </div>

              {/* Dialogue Speech Bubble & States */}
              <div className="flex-1 text-center sm:text-left space-y-3">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                    <span>Kuri the Ro-Vault • 4-Frame Micro-Animations</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Smart, not kuripot.
                  </span>
                </div>

                <div className="relative bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4 shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff]">
                  <p className="text-sm font-semibold text-slate-700 transition-opacity duration-200 leading-snug">
                    "{speechText}"
                  </p>
                </div>

                {/* Ambient Status Notification (if active) */}
                {ambientStatus && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 border border-sky-200 rounded-full text-xs font-semibold text-sky-800 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
                    <span>{ambientStatus}</span>
                  </div>
                )}

                {/* Mascot Action States Selector */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <span className="text-[11px] font-semibold text-slate-400 mr-1">States:</span>
                  <button
                    onClick={() => changeAnimation("idle")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition active:scale-95 cursor-pointer ${
                      currentAnimKey === "idle"
                        ? "bg-slate-200 border-slate-300 text-slate-900 shadow-inner font-bold"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                    }`}
                  >
                    Idle
                  </button>
                  <button
                    onClick={() => changeAnimation("celebrate")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition active:scale-95 cursor-pointer ${
                      currentAnimKey === "celebrate"
                        ? "bg-emerald-200 border-emerald-300 text-emerald-900 shadow-inner font-bold"
                        : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    Celebrate
                  </button>
                  <button
                    onClick={() => changeAnimation("thinking")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition active:scale-95 cursor-pointer ${
                      currentAnimKey === "thinking"
                        ? "bg-sky-200 border-sky-300 text-sky-900 shadow-inner font-bold"
                        : "bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200"
                    }`}
                  >
                    Thinking
                  </button>
                  <button
                    onClick={() => changeAnimation("alert")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition active:scale-95 cursor-pointer ${
                      currentAnimKey === "alert"
                        ? "bg-rose-200 border-rose-300 text-rose-900 shadow-inner font-bold"
                        : "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
                    }`}
                  >
                    Alert
                  </button>
                  <button
                    onClick={() => changeAnimation("wave")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition active:scale-95 cursor-pointer ${
                      currentAnimKey === "wave"
                        ? "bg-purple-200 border-purple-300 text-purple-900 shadow-inner font-bold"
                        : "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                    }`}
                  >
                    Wave
                  </button>
                  <button
                    onClick={() => {
                      playTone("yawn", soundEnabled)
                      changeAnimation("yawn")
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition active:scale-95 cursor-pointer ${
                      currentAnimKey === "yawn"
                        ? "bg-cyan-200 border-cyan-300 text-cyan-900 shadow-inner font-bold"
                        : "bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-200"
                    }`}
                  >
                    Yawn (Resting)
                  </button>
                  <button
                    onClick={() => {
                      playTone("buff", soundEnabled)
                      changeAnimation("dial_buff")
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition active:scale-95 cursor-pointer ${
                      currentAnimKey === "dial_buff"
                        ? "bg-amber-200 border-amber-300 text-amber-900 shadow-inner font-bold"
                        : "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200"
                    }`}
                  >
                    Dial Buffing
                  </button>
                </div>

                {/* 2 & 3: Circadian (Time-of-Day) and Natural Idle Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 mr-1">Time of Day:</span>
                    <button
                      onClick={() => handleSelectCircadianSlot("auto")}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition cursor-pointer ${
                        circadianSlotKey === "auto"
                          ? "bg-indigo-100 border-indigo-300 text-indigo-900 font-bold"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                      title="Automatically sync with Philippine local clock"
                    >
                      Auto ({circadianProfile.label})
                    </button>
                    {["morning", "afternoon", "evening", "night"].map((slot) => {
                      const prof = CIRCADIAN_SLOTS[slot]
                      const isActive = circadianSlotKey === slot
                      return (
                        <button
                          key={slot}
                          onClick={() => handleSelectCircadianSlot(slot)}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition cursor-pointer ${
                            isActive
                              ? "bg-indigo-600 border-indigo-700 text-white font-bold shadow-sm"
                              : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {prof.label}
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                    {/* Manual Idle Wave trigger */}
                    <button
                      onClick={() => handleIdleMicroWave(2400)}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-800 transition active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-sm"
                      title="Trigger an adorable friendly wave micro-gesture in idle"
                    >
                      <span>Micro-Wave</span>
                    </button>

                    {/* Manual Radar Ping Scan trigger */}
                    <button
                      onClick={triggerRadarPing}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-800 transition active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-sm"
                      title="Emit an antenna radar sonar ping to scan ledgers"
                    >
                      <ShieldCheck size={13} className="text-sky-600" />
                      <span>Radar Ping</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Real-time Dashboard Action Triggers */}
            <div className="flex flex-col gap-2.5 w-full lg:w-64 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200/80 pt-6 lg:pt-0 lg:pl-8">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center lg:text-left">
                Live Simulator Triggers
              </div>

              <button
                onClick={() => triggerSimulation("deposit")}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition shadow-sm active:scale-95 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Plus size={16} className="text-emerald-400" />
                  <span>Deposit to Wallet</span>
                </span>
                <span className="text-[10px] text-emerald-300 font-bold">+₱500</span>
              </button>

              <button
                onClick={() => triggerSimulation("sync")}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs transition shadow-sm active:scale-95 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <RefreshCw size={16} className="text-sky-200" />
                  <span>Sync All Accounts</span>
                </span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">6/6</span>
              </button>

              <button
                onClick={() => triggerSimulation("goal")}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-white font-medium text-xs transition shadow-sm active:scale-95 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Trophy size={16} className="text-amber-300" />
                  <span>Hit Target Savings!</span>
                </span>
                <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded font-bold">Goal</span>
              </button>

              <button
                onClick={() => triggerSimulation("warning")}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition shadow-sm active:scale-95 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-rose-200" />
                  <span>Dining Limit Breach</span>
                </span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">Over</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Reference Sheet & Specifications Card ──────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reference Design Image */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/85 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck size={16} className="text-indigo-600" />
                <span>Reference Character Sheet</span>
              </span>
              <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                Active Reference
              </span>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-900/5 p-2 shadow-inner">
              <img
                src="/vaulty-reference.png"
                alt="Kuri Reference Character Sheet"
                className="w-full h-auto rounded-xl object-contain max-h-45"
              />
            </div>
          </div>

          {/* Animation Specs Breakdown */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/85 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Sliders size={16} className="text-indigo-600" />
                <span>Hybrid 60 FPS + Rigid Mechanical Robot Physics</span>
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-slate-400 block text-[10px]">ROW 0 • IDLE</span>
                  <strong className="text-slate-800">Breathing + Eyelid Arc</strong>
                  <p className="text-[11px] text-slate-500 mt-0.5">Smooth float & multi-stage blink arc</p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <span className="text-emerald-500 block text-[10px]">ROW 1 • CELEBRATE</span>
                  <strong className="text-emerald-800">Piston Leap + 360° Dial Spin</strong>
                  <p className="text-[11px] text-emerald-600 mt-0.5">Rigid chassis, dial spin & antenna whip</p>
                </div>
                <div className="p-2.5 rounded-xl bg-sky-50/60 border border-sky-100">
                  <span className="text-sky-500 block text-[10px]">ROW 2 • THINKING</span>
                  <strong className="text-sky-800">Dial Spin + Sonar Waves</strong>
                  <p className="text-[11px] text-sky-600 mt-0.5">90° combination dial & radar ripple</p>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
                  <span className="text-rose-500 block text-[10px]">ROW 3 • ALERT</span>
                  <strong className="text-rose-800">Alarm Shudder & Visor</strong>
                  <p className="text-[11px] text-rose-600 mt-0.5">Defensive tremor & warning eyes</p>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Cell: 128×128px • 4 Columns × 5 Rows</span>
              <button
                onClick={() => setIsStudioOpen(true)}
                className="text-indigo-600 font-bold hover:underline cursor-pointer"
              >
                Inspect in Studio →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Spritesheet Studio Modal ─────────────────────────────── */}
      {isStudioOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 transition-opacity">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Studio Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-700 text-white flex items-center justify-center font-bold">
                  <Film size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Kuri the Ro-Vault • Spritesheet Studio
                  </h2>
                  <p className="text-xs text-slate-500">
                    20-frame 2D animation matrix (5 states × 4 micro-frames)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsStudioOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Studio Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
              {/* Live Matrix Display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <LayoutGrid size={16} className="text-indigo-600" />
                    <span>Generated 2D Spritesheet Matrix (512 × 896px • 4 Columns × 7 Rows)</span>
                  </label>
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    128×128 per frame cell
                  </span>
                </div>

                {/* Canvas Matrix Container */}
                <div className="overflow-x-auto bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center shadow-inner">
                  <canvas
                    ref={studioCanvasRef}
                    width={ATLAS_WIDTH}
                    height={ATLAS_HEIGHT}
                    className="inline-block rounded-xl shadow-lg border border-slate-800"
                  />

                  <div className="grid grid-cols-7 text-[9px] font-mono text-slate-400 pt-2 px-2 max-w-lg mx-auto text-left gap-1">
                    <span className="text-indigo-300 font-bold">R1: Idle</span>
                    <span className="text-emerald-300 font-bold">R2: Win</span>
                    <span className="text-sky-300 font-bold">R3: Think</span>
                    <span className="text-rose-300 font-bold">R4: Alert</span>
                    <span className="text-purple-300 font-bold">R5: Wave</span>
                    <span className="text-cyan-300 font-bold">R6: Yawn</span>
                    <span className="text-amber-300 font-bold">R7: Buff</span>
                  </div>
                </div>
              </div>

              {/* Studio Real-time Playback Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700">Animation Speed</label>
                    <span className="text-xs font-mono font-bold text-indigo-700">
                      {animationFps} FPS
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="16"
                    value={animationFps}
                    className="w-full accent-indigo-600 cursor-pointer"
                    onChange={(e) => setAnimationFps(parseInt(e.target.value, 10))}
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>2 FPS (Slow)</span>
                    <span>4-6 (Ideal)</span>
                    <span>16 FPS (Hyper)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Isolate Animation State
                  </label>
                  <select
                    value={currentAnimKey}
                    onChange={(e) => changeAnimation(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="idle">Row 0: Idle (Breathing & Blinking)</option>
                    <option value="celebrate">Row 1: Celebrate (Jumping & Stars)</option>
                    <option value="thinking">Row 2: Thinking (Dial Spinning & Radar)</option>
                    <option value="alert">Row 3: Alert (Shield Down & Warning)</option>
                    <option value="wave">Row 4: Wave (Enthusiastic Greeting)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Synthesizer FX Preview
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => playTone("coin", true)}
                      className="flex-1 py-1.5 px-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition cursor-pointer"
                    >
                      Coin
                    </button>
                    <button
                      onClick={() => playTone("fanfare", true)}
                      className="flex-1 py-1.5 px-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition cursor-pointer"
                    >
                      Win
                    </button>
                    <button
                      onClick={() => playTone("alert", true)}
                      className="flex-1 py-1.5 px-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition cursor-pointer"
                    >
                      Alert
                    </button>
                  </div>
                </div>
              </div>

              {/* Copy-Paste Ready Code Snippet */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Copy size={16} className="text-indigo-600" />
                    <span>Generated CSS steps() Spritesheet Implementation</span>
                  </label>
                  <button
                    onClick={copySpritesheetCode}
                    className="text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copyStatus.includes("Copied") ? (
                      <Check size={14} className="text-emerald-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                    <span>{copyStatus}</span>
                  </button>
                </div>

                <div className="relative bg-slate-900 text-slate-200 p-4 rounded-2xl text-xs font-mono overflow-x-auto border border-slate-800 max-h-48 leading-relaxed">
                  <pre>
                    <code>{`/* 1. Multi-Frame CSS Spritesheet Class */
.kuri-character {
  width: 128px;
  height: 128px;
  background-image: url('kuri-animated-spritesheet-20frames.png');
  background-size: 512px 640px; /* 4 cols x 5 rows */
}

/* 2. Keyframes using steps(4) for fluid 4-frame animation */
@keyframes kuri-strip {
  from { background-position-x: 0px; }
  to   { background-position-x: -512px; }
}

.kuri-character.idle      { background-position-y: 0px;    animation: kuri-strip 1s steps(4) infinite; }
.kuri-character.celebrate { background-position-y: -128px; animation: kuri-strip 0.7s steps(4) infinite; }
.kuri-character.thinking  { background-position-y: -256px; animation: kuri-strip 0.9s steps(4) infinite; }
.kuri-character.alert     { background-position-y: -384px; animation: kuri-strip 0.5s steps(4) infinite; }
.kuri-character.wave      { background-position-y: -512px; animation: kuri-strip 0.8s steps(4) infinite; }`}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Studio Footer with Download Button */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Ready for export: 512 × 640px PNG with alpha transparency.
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadMasterSpritesheet}
                  className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition hover:scale-102 cursor-pointer"
                >
                  <Download size={16} />
                  <span>Download Kuri Spritesheet PNG</span>
                </button>
                <button
                  onClick={() => setIsStudioOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition cursor-pointer"
                >
                  Close Studio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Kuri the Ro-Vault: Full Screen Stage (White Background & Neumorphic System) ──────────── */}
      {isFullViewOpen && (
        <div
          className="fixed inset-0 z-100 w-screen h-screen min-h-screen bg-white text-slate-800 flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-200"
        >
          {/* Top Bar with pure white background, soft shadow, controls on the right side */}
          <header className="w-full px-4 sm:px-8 py-3.5 flex items-center justify-between bg-white border-b border-slate-100 shadow-[0_4px_16px_rgba(209,217,230,0.35)] z-20 shrink-0">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                    Kuri the Ro-Vault
                  </span>
                  <span className="text-[10px] font-bold text-indigo-700 bg-white px-2.5 py-0.5 rounded-full shadow-[inset_1px_1px_3px_#e2e8f0,inset_-1px_-1px_3px_#ffffff] border border-indigo-50">
                    Smart, not kuripot
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Full Screen • 60 FPS Procedural Simulation
                </p>
              </div>
            </div>

            {/* Controls on the RIGHT side */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Scale Presets with Neumorphic White Styling */}
              <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-xl bg-white shadow-[inset_2px_2px_5px_#e2e8f0,inset_-2px_-2px_5px_#ffffff] border border-slate-100">
                {[
                  { label: "1.5x", val: 1.5 },
                  { label: "2x", val: 2 },
                  { label: "2.5x", val: 2.5 },
                  { label: "3x", val: 3 },
                ].map((s) => (
                  <button
                    key={s.val}
                    type="button"
                    onClick={() => setFullViewScale(s.val)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      fullViewScale === s.val
                        ? "bg-white text-indigo-600 font-bold shadow-[2px_2px_6px_#e2e8f0,-2px_-2px_6px_#ffffff] border border-indigo-100"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Sound Toggle */}
              <button
                type="button"
                onClick={() => {
                  setSoundEnabled(!soundEnabled)
                  playTone("coin", !soundEnabled)
                }}
                className="p-2 rounded-xl bg-white shadow-[3px_3px_8px_#e2e8f0,-3px_-3px_8px_#ffffff] border border-slate-100 active:shadow-[inset_2px_2px_4px_#e2e8f0,inset_-2px_-2px_4px_#ffffff] text-slate-600 hover:text-indigo-600 transition cursor-pointer"
                title={soundEnabled ? "Mute audio" : "Enable audio"}
              >
                {soundEnabled ? (
                  <Volume2 size={18} className="text-indigo-600" />
                ) : (
                  <VolumeX size={18} className="text-slate-400" />
                )}
              </button>

              {/* Exit Full Screen Button placed on the right */}
              <button
                type="button"
                onClick={exitFullScreen}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white shadow-[3px_3px_8px_#e2e8f0,-3px_-3px_8px_#ffffff] border border-slate-100 active:shadow-[inset_2px_2px_4px_#e2e8f0,inset_-2px_-2px_4px_#ffffff] text-slate-800 hover:text-indigo-600 font-bold text-xs transition active:scale-95 cursor-pointer"
                title="Exit Full Screen (Esc)"
              >
                <Minimize2 size={16} className="text-indigo-600" />
                <span>Exit Full Screen</span>
                <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">Esc</kbd>
              </button>
            </div>
          </header>

          {/* Main Stage Viewport Area (White Surface Neumorphic Canvas Well) */}
          <main
            className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden bg-white"
            onClick={handleMascotPoke}
          >
            {/* Floating Speech Bubble (Neumorphic White Card) */}
            <div className="max-w-md w-full mb-6 z-10 transition-all pointer-events-auto">
              <div className="relative bg-white shadow-[6px_6px_20px_#e2e8f0,-6px_-6px_20px_#ffffff] border border-slate-100 rounded-2xl p-4 text-center">
                <p className="text-sm sm:text-base font-semibold text-slate-800 leading-snug">
                  "{speechText}"
                </p>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-slate-200/80 rotate-45"></div>
              </div>
            </div>

            {/* Mascot Center Stage */}
            <div className="relative flex items-center justify-center my-auto cursor-pointer">
              {/* Glowing Ambient Aura */}
              <div
                className={`mascot-ambient ${currentConfig.aura}`}
                style={{
                  width: `${Math.round(128 * fullViewScale * 1.5)}px`,
                  height: `${Math.round(128 * fullViewScale * 1.5)}px`,
                }}
              ></div>

              {/* Scaled Crisp Canvas Card (Neumorphic Recessed Well on White) */}
              <div
                className="relative rounded-3xl bg-white shadow-[inset_6px_6px_16px_#e2e8f0,inset_-6px_-6px_16px_#ffffff] border border-slate-100 flex items-center justify-center overflow-hidden transition-all duration-300"
                style={{
                  width: `${Math.round(128 * fullViewScale + 48)}px`,
                  height: `${Math.round(128 * fullViewScale + 48)}px`,
                }}
              >
                <canvas
                  ref={fullViewCanvasRef}
                  width={FRAME_SIZE}
                  height={FRAME_SIZE}
                  style={{
                    width: `${Math.round(128 * fullViewScale)}px`,
                    height: `${Math.round(128 * fullViewScale)}px`,
                    imageRendering: "pixelated",
                  }}
                  className={`vaulty-physics-${currentAnimKey} transition-transform duration-300`}
                />

                {/* State Tag Badge */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-white shadow-[2px_2px_6px_#e2e8f0,-2px_-2px_6px_#ffffff] border border-slate-100 rounded-full text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>{currentConfig.name}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-4 pointer-events-none">
              Click Kuri anywhere to poke and interact
            </p>
          </main>

          {/* Bottom Floating Control Bar (Neumorphic White Dock) */}
          <footer className="w-full px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border-t border-slate-100 shadow-[0_-4px_16px_rgba(209,217,230,0.35)] z-20 shrink-0">
            {/* Mood States (Clean Text, No Emojis, Neumorphic Buttons) */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-semibold text-slate-400 mr-1">States:</span>
              {[
                { key: "idle", label: "Idle" },
                { key: "celebrate", label: "Celebrate" },
                { key: "thinking", label: "Thinking" },
                { key: "alert", label: "Alert" },
                { key: "wave", label: "Wave" },
              ].map((st) => (
                <button
                  key={st.key}
                  type="button"
                  onClick={() => changeAnimation(st.key)}
                  className={`px-3.5 py-1.5 text-xs rounded-xl transition cursor-pointer ${
                    currentAnimKey === st.key
                      ? "bg-white shadow-[inset_3px_3px_7px_#e2e8f0,inset_-3px_-3px_7px_#ffffff] text-indigo-600 font-bold border border-indigo-100"
                      : "bg-white shadow-[3px_3px_8px_#e2e8f0,-3px_-3px_8px_#ffffff] text-slate-700 hover:text-slate-900 font-medium active:scale-95 border border-slate-100"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Quick Simulations (Clean Text, No Emojis) */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-semibold text-slate-400 mr-1">Simulate:</span>
              <button
                type="button"
                onClick={() => triggerSimulation("deposit")}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white shadow-[3px_3px_8px_#e2e8f0,-3px_-3px_8px_#ffffff] active:shadow-[inset_2px_2px_5px_#e2e8f0,inset_-2px_-2px_5px_#ffffff] text-emerald-700 hover:text-emerald-800 border border-slate-100 transition active:scale-95 cursor-pointer"
              >
                + ₱500 Deposit
              </button>
              <button
                type="button"
                onClick={() => triggerSimulation("goal")}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white shadow-[3px_3px_8px_#e2e8f0,-3px_-3px_8px_#ffffff] active:shadow-[inset_2px_2px_5px_#e2e8f0,inset_-2px_-2px_5px_#ffffff] text-amber-700 hover:text-amber-800 border border-slate-100 transition active:scale-95 cursor-pointer"
              >
                Target Reached
              </button>
              <button
                type="button"
                onClick={() => triggerSimulation("warning")}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white shadow-[3px_3px_8px_#e2e8f0,-3px_-3px_8px_#ffffff] active:shadow-[inset_2px_2px_5px_#e2e8f0,inset_-2px_-2px_5px_#ffffff] text-rose-700 hover:text-rose-800 border border-slate-100 transition active:scale-95 cursor-pointer"
              >
                Budget Alert
              </button>
              <button
                type="button"
                onClick={() => triggerSimulation("sync")}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white shadow-[3px_3px_8px_#e2e8f0,-3px_-3px_8px_#ffffff] active:shadow-[inset_2px_2px_5px_#e2e8f0,inset_-2px_-2px_5px_#ffffff] text-sky-700 hover:text-sky-800 border border-slate-100 transition active:scale-95 cursor-pointer"
              >
                Account Sync
              </button>
            </div>
          </footer>
        </div>
      )}
    </div>
  )
}
