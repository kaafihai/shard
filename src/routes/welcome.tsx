import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { RabbitMascot } from "@/components/rabbit-mascot";
import {
  SmileyIcon,
  BatteryChargingIcon,
  CheckCircleIcon,
  TimerIcon,
  BrainIcon,
  HouseIcon,
} from "@phosphor-icons/react";

export const Route = createFileRoute("/welcome")({
  component: WelcomePage,
});

const FLOW_STEPS = [
  { icon: SmileyIcon, label: "Log Mood", desc: "How are you feeling?", color: "#e8a07a" },
  { icon: BatteryChargingIcon, label: "Check Energy", desc: "What's your battery at?", color: "#8ab878" },
  { icon: CheckCircleIcon, label: "Nibble Tasks", desc: "Bite-sized, your pace", color: "#7aaccc" },
  { icon: TimerIcon, label: "Focus Timer", desc: "Pick a time, press go", color: "#c8a0d8" },
  { icon: BrainIcon, label: "Brain Dump", desc: "Empty your head safely", color: "#d8a8a0" },
  { icon: HouseIcon, label: "Dashboard", desc: "Your rabbit cheers you on", color: "#c8b888" },
];

function WelcomePage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const handleStart = useCallback(() => {
    localStorage.setItem("nibble_welcomed", "true");
    navigate({ to: "/" });
  }, [navigate]);

  const handleNext = useCallback(() => setPage(1), []);
  const handleBack = useCallback(() => setPage(0), []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
      {/* Page content with transition */}
      <div className="w-full max-w-sm overflow-hidden">
        <div
          className="flex transition-transform duration-400 ease-in-out"
          style={{ transform: `translateX(-${page * 100}%)` }}
        >
          {/* === PAGE 1: Welcome === */}
          <div className="w-full shrink-0 flex flex-col items-center space-y-5 px-1">
            <div className="relative w-80 h-64">
              <FieldScene />
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-28 h-28">
                <RabbitMascot mood="waving" size="lg" showBubble={false} animated />
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tight">nibble</h1>
              <p className="text-sm opacity-50 font-medium">your little life companion</p>
            </div>

            <div
              className="max-w-xs space-y-3 p-6 rounded-3xl"
              style={{ background: "var(--accent-warm-subtle)" }}
            >
              <p className="text-base leading-relaxed">
                Hey there! I'm your rabbit buddy, and I'm here to make
                the everyday stuff feel a little less overwhelming and
                a little more... fun.
              </p>
              <p className="text-sm leading-relaxed opacity-80">
                Track tasks, build tiny habits, and log how you're feeling.
                I'll cheer you on, remember your wins, and maybe even
                wear a silly hat while doing it.
              </p>
              <p className="text-xs opacity-60 italic">
                No pressure. No guilt. Just you and me, one nibble at a time.
              </p>
            </div>

            <button
              onClick={handleNext}
              className="btn bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold text-lg hover:opacity-90 transition-opacity shadow-md"
            >
              How it works
            </button>
          </div>

          {/* === PAGE 2: Feature Flowchart === */}
          <div className="w-full shrink-0 flex flex-col items-center space-y-5 px-1">
            <div className="space-y-1 pt-2">
              <h2 className="text-2xl font-bold">Your daily flow</h2>
              <p className="text-sm opacity-50">A gentle path through your day</p>
            </div>

            {/* Garden trail flowchart */}
            <div className="relative w-full max-w-xs">
              {/* Dotted trail line */}
              <svg
                className="absolute left-[28px] top-[28px] h-[calc(100%-56px)]"
                width="4"
                style={{ overflow: "visible" }}
              >
                <line
                  x1="2" y1="0" x2="2" y2="100%"
                  stroke="#c4b8a0"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  opacity="0.5"
                />
              </svg>

              {/* Steps */}
              <div className="relative space-y-4">
                {FLOW_STEPS.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.label}
                      className="flex items-center gap-4 relative"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      {/* Circle icon */}
                      <div
                        className="shrink-0 w-14 h-14 rounded-full flex items-center justify-center shadow-sm relative z-10"
                        style={{ backgroundColor: `${step.color}20`, border: `2px solid ${step.color}` }}
                      >
                        <Icon size={24} weight="duotone" style={{ color: step.color }} />
                      </div>

                      {/* Label */}
                      <div className="text-left flex-1">
                        <p className="text-sm font-semibold">{step.label}</p>
                        <p className="text-xs opacity-50">{step.desc}</p>
                      </div>

                      {/* Step number */}
                      <span className="text-xs font-bold opacity-20 shrink-0 pr-1">{i + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-xs opacity-40 italic max-w-[250px]">
              Skip any step, do them in any order. Nibble adapts to you, not the other way around.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className="px-6 py-3 rounded-full font-semibold bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleStart}
                className="btn bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold text-lg hover:opacity-90 transition-opacity shadow-md"
              >
                Let's go!
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex gap-2 mt-6">
        {[0, 1].map((i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className="transition-all duration-300 rounded-full"
            style={{
              width: page === i ? 24 : 8,
              height: 8,
              backgroundColor: page === i ? "var(--primary)" : "var(--primary)",
              opacity: page === i ? 1 : 0.25,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// --- Lush carrot field with overflowing basket SVG illustration ---

function FieldScene() {
  return (
    <svg viewBox="0 0 320 256" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8ddf0" />
          <stop offset="40%" stopColor="#e8d8c4" />
          <stop offset="70%" stopColor="#f2dcc0" />
          <stop offset="100%" stopColor="#e8d4b0" />
        </linearGradient>
        <radialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fff8e0" />
          <stop offset="40%" stopColor="#fce8b0" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#f5dca0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7db86a" />
          <stop offset="100%" stopColor="#5a9848" />
        </linearGradient>
        <linearGradient id="grassWarm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a8cc88" />
          <stop offset="100%" stopColor="#88b868" />
        </linearGradient>
        <linearGradient id="carrotBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f09050" />
          <stop offset="100%" stopColor="#d06828" />
        </linearGradient>
      </defs>

      {/* Sky with warm golden-hour tone */}
      <rect width="320" height="256" fill="url(#sky)" rx="16" />

      {/* Sun with layered glow */}
      <circle cx="268" cy="36" r="48" fill="url(#sunGlow)" />
      <circle cx="268" cy="36" r="20" fill="#f8e0a0" opacity="0.6" />
      <circle cx="268" cy="36" r="12" fill="#fff4d0" opacity="0.8" />
      {/* Sun rays */}
      <g opacity="0.15" stroke="#f0c860" strokeWidth="1">
        <line x1="268" y1="8" x2="268" y2="0" />
        <line x1="290" y1="18" x2="298" y2="12" />
        <line x1="296" y1="36" x2="305" y2="36" />
        <line x1="248" y1="16" x2="240" y2="10" />
        <line x1="288" y1="54" x2="296" y2="60" />
        <line x1="248" y1="56" x2="240" y2="62" />
      </g>

      {/* Clouds - softer, warmer */}
      <g opacity="0.45">
        <ellipse cx="52" cy="34" rx="30" ry="12" fill="white" />
        <ellipse cx="76" cy="30" rx="22" ry="10" fill="white" opacity="0.8" />
        <ellipse cx="38" cy="31" rx="16" ry="9" fill="white" opacity="0.7" />
      </g>
      <g opacity="0.35">
        <ellipse cx="175" cy="46" rx="24" ry="10" fill="white" />
        <ellipse cx="195" cy="43" rx="18" ry="8" fill="white" opacity="0.8" />
      </g>
      <g opacity="0.2">
        <ellipse cx="125" cy="22" rx="20" ry="8" fill="#fff8f0" />
      </g>

      {/* Distant rolling hills with depth */}
      <ellipse cx="70" cy="138" rx="130" ry="34" fill="#b8d0a8" opacity="0.45" />
      <ellipse cx="250" cy="142" rx="110" ry="30" fill="#b8d0a8" opacity="0.35" />
      <ellipse cx="160" cy="148" rx="80" ry="20" fill="#c4d8b0" opacity="0.3" />

      {/* Little wooden fence on distant hill */}
      <g opacity="0.3" stroke="#8a7050" strokeWidth="1.2">
        <line x1="20" y1="136" x2="20" y2="126" />
        <line x1="34" y1="134" x2="34" y2="124" />
        <line x1="48" y1="133" x2="48" y2="123" />
        <line x1="62" y1="133" x2="62" y2="123" />
        <line x1="20" y1="128" x2="62" y2="125" strokeWidth="0.8" />
        <line x1="20" y1="133" x2="62" y2="130" strokeWidth="0.8" />
      </g>

      {/* Distant tiny tree */}
      <g opacity="0.35">
        <rect x="295" y="120" width="2.5" height="12" fill="#7a6040" rx="1" />
        <ellipse cx="296" cy="118" rx="8" ry="10" fill="#6a9850" />
        <ellipse cx="293" cy="120" rx="5" ry="7" fill="#5a8840" />
      </g>

      {/* Main ground layers */}
      <ellipse cx="160" cy="215" rx="210" ry="75" fill="url(#grass)" />
      <ellipse cx="55" cy="222" rx="115" ry="52" fill="url(#grassWarm)" opacity="0.55" />
      <ellipse cx="275" cy="218" rx="105" ry="58" fill="url(#grassWarm)" opacity="0.45" />

      {/* Soil mounds for carrot rows - warmer, more visible */}
      <g opacity="0.35">
        <path d="M30 192 Q160 184 290 192" stroke="#8B6E4E" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M20 206 Q160 198 300 206" stroke="#8B6E4E" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M10 220 Q160 212 310 220" stroke="#8B6E4E" strokeWidth="8" fill="none" strokeLinecap="round" />
      </g>

      {/* === CARROT PLANTS ROW 1 (back, smaller, faded) === */}
      <g opacity="0.6">
        {[40, 70, 100, 130, 190, 220, 250, 280].map((x, i) => (
          <g key={`r1-${i}`} transform={`translate(${x}, ${176 + (i % 3) * 2})`}>
            <path d="M0 0 Q-3 -14 -1 -19" stroke="#4a8a38" strokeWidth="1.5" fill="none" />
            <path d="M0 0 Q1 -16 3 -21" stroke="#5a9a45" strokeWidth="1.5" fill="none" />
            <path d="M0 0 Q4 -11 6 -15" stroke="#3a7a28" strokeWidth="1.2" fill="none" />
            <path d="M0 2 L0 7" stroke="#e88040" strokeWidth="3" strokeLinecap="round" />
          </g>
        ))}
      </g>

      {/* === CARROT PLANTS ROW 2 (middle) === */}
      <g opacity="0.8">
        {[25, 55, 85, 115, 205, 235, 265, 295].map((x, i) => (
          <g key={`r2-${i}`} transform={`translate(${x}, ${190 + (i % 3)})`}>
            <path d="M0 0 Q-4 -18 -1 -25" stroke="#4a8a38" strokeWidth="2" fill="none" />
            <path d="M0 0 Q2 -20 4 -27" stroke="#5a9a45" strokeWidth="2" fill="none" />
            <path d="M0 0 Q5 -13 7 -19" stroke="#3a7a28" strokeWidth="1.5" fill="none" />
            <path d="M0 0 Q-5 -10 -7 -16" stroke="#5a9a45" strokeWidth="1.5" fill="none" />
            <path d="M0 2 L0 10" stroke="#e88040" strokeWidth="4" strokeLinecap="round" />
            <path d="M0 10 L0 12" stroke="#d07030" strokeWidth="3" strokeLinecap="round" />
          </g>
        ))}
      </g>

      {/* === CARROT PLANTS ROW 3 (front, largest, fullest) === */}
      <g>
        {[15, 48, 80, 112, 208, 240, 272, 304].map((x, i) => (
          <g key={`r3-${i}`} transform={`translate(${x}, ${206 + (i % 2) * 2})`}>
            {/* Leafy fronds - 5 per plant */}
            <path d="M0 0 Q-6 -22 -3 -32" stroke="#4a8a38" strokeWidth="2.5" fill="none" />
            <path d="M0 0 Q2 -26 5 -34" stroke="#5a9a45" strokeWidth="2.5" fill="none" />
            <path d="M0 0 Q6 -18 9 -26" stroke="#3a7a28" strokeWidth="2" fill="none" />
            <path d="M0 0 Q-7 -14 -9 -22" stroke="#5a9a45" strokeWidth="2" fill="none" />
            <path d="M0 0 Q-1 -28 1 -36" stroke="#4a8a38" strokeWidth="2" fill="none" />
            {/* Carrot body - tapered */}
            <path d="M0 2 L0 14" stroke="#f09050" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M0 12 L0 16" stroke="#d07030" strokeWidth="4" strokeLinecap="round" />
          </g>
        ))}
      </g>

      {/* Wildflower clusters */}
      {/* Cluster left */}
      <g transform="translate(10, 215)">
        <path d="M0 0 Q1 -8 2 0" stroke="#5a8a48" strokeWidth="0.8" fill="none" />
        <circle cx="1" cy="-9" r="2.5" fill="#e8a0b0" opacity="0.7" />
        <circle cx="1" cy="-9" r="1" fill="#f8d0a0" />
        <path d="M5 0 Q6 -6 7 0" stroke="#5a8a48" strokeWidth="0.8" fill="none" />
        <circle cx="6" cy="-7" r="2" fill="#c4b0d8" opacity="0.6" />
        <circle cx="6" cy="-7" r="0.8" fill="#f8d0a0" />
      </g>
      {/* Cluster right */}
      <g transform="translate(298, 217)">
        <path d="M0 0 Q1 -7 2 0" stroke="#5a8a48" strokeWidth="0.8" fill="none" />
        <circle cx="1" cy="-8" r="2.5" fill="#e8a0b0" opacity="0.6" />
        <circle cx="1" cy="-8" r="1" fill="#f5d0a0" />
        <path d="M-5 0 Q-4 -9 -3 0" stroke="#5a8a48" strokeWidth="0.8" fill="none" />
        <circle cx="-4" cy="-10" r="2" fill="#a8c8e8" opacity="0.6" />
        <circle cx="-4" cy="-10" r="0.8" fill="#f5d0a0" />
      </g>
      {/* Scattered individual flowers */}
      <circle cx="140" cy="218" r="2" fill="#e8a0b0" opacity="0.5" />
      <circle cx="140" cy="218" r="0.8" fill="#f5d0a0" />
      <circle cx="180" cy="222" r="1.8" fill="#c4b0d8" opacity="0.45" />
      <circle cx="180" cy="222" r="0.7" fill="#f5d0a0" />

      {/* Grass tufts - more of them */}
      <g opacity="0.45" stroke="#4a8a38" strokeWidth="1.2" fill="none">
        <path d="M8 212 Q10 200 12 212" />
        <path d="M11 212 Q14 197 17 212" />
        <path d="M303 214 Q305 202 307 214" />
        <path d="M306 214 Q309 199 312 214" />
        <path d="M132 222 Q134 213 136 222" />
        <path d="M183 220 Q185 211 187 220" />
        <path d="M95 216 Q97 208 99 216" />
        <path d="M210 224 Q212 216 214 224" />
      </g>

      {/* === OVERFLOWING BASKET OF CARROTS === */}
      <g transform="translate(197, 153)">
        {/* Basket shadow - softer */}
        <ellipse cx="35" cy="50" rx="40" ry="7" fill="#000" opacity="0.06" />

        {/* Basket body */}
        <path d="M2 18 Q4 48 15 48 L55 48 Q66 48 68 18Z" fill="#c4956a" stroke="#9a6840" strokeWidth="1.2" />
        {/* Basket highlight */}
        <path d="M8 22 Q35 20 62 22 Q60 36 55 46 L15 46 Q10 36 8 22Z" fill="#d4a878" opacity="0.3" />
        {/* Basket rim */}
        <ellipse cx="35" cy="18" rx="36" ry="9" fill="#d4a878" stroke="#9a6840" strokeWidth="1.2" />
        <ellipse cx="35" cy="18" rx="32" ry="6" fill="#c49868" />
        {/* Weave pattern - horizontal */}
        <path d="M10 26 Q35 31 60 26" stroke="#9a6840" strokeWidth="0.7" fill="none" opacity="0.35" />
        <path d="M8 32 Q35 37 62 32" stroke="#9a6840" strokeWidth="0.7" fill="none" opacity="0.35" />
        <path d="M10 38 Q35 43 60 38" stroke="#9a6840" strokeWidth="0.7" fill="none" opacity="0.35" />
        <path d="M12 44 Q35 47 58 44" stroke="#9a6840" strokeWidth="0.7" fill="none" opacity="0.3" />
        {/* Weave pattern - vertical */}
        <line x1="18" y1="18" x2="16" y2="46" stroke="#9a6840" strokeWidth="0.5" opacity="0.25" />
        <line x1="27" y1="18" x2="26" y2="47" stroke="#9a6840" strokeWidth="0.5" opacity="0.25" />
        <line x1="35" y1="18" x2="35" y2="48" stroke="#9a6840" strokeWidth="0.5" opacity="0.25" />
        <line x1="43" y1="18" x2="44" y2="47" stroke="#9a6840" strokeWidth="0.5" opacity="0.25" />
        <line x1="52" y1="18" x2="54" y2="46" stroke="#9a6840" strokeWidth="0.5" opacity="0.25" />
        {/* Handle - thicker, more woven look */}
        <path d="M14 18 Q35 -10 56 18" stroke="#9a6840" strokeWidth="3" fill="none" />
        <path d="M14 18 Q35 -8 56 18" stroke="#c4956a" strokeWidth="1.8" fill="none" />
        <path d="M15 18 Q35 -6 55 18" stroke="#d4a878" strokeWidth="0.8" fill="none" opacity="0.5" />

        {/* Carrots overflowing! */}
        {/* Carrot 1 - far left, leaning */}
        <g transform="rotate(-32 10 10)">
          <path d="M10 10 L6 -14" stroke="#f09050" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M6 -14 L5 -18" stroke="#d07030" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M2 -16 Q5 -28 8 -16" fill="#4a8a38" />
          <path d="M4 -16 Q7 -30 10 -16" fill="#5a9a45" />
          <path d="M6 -16 Q9 -26 12 -16" fill="#3a7a28" opacity="0.7" />
        </g>

        {/* Carrot 2 - left-center */}
        <g transform="rotate(-14 22 8)">
          <path d="M22 8 L20 -18" stroke="#f09050" strokeWidth="6" strokeLinecap="round" />
          <path d="M20 -18 L19 -22" stroke="#d07030" strokeWidth="5" strokeLinecap="round" />
          <path d="M14 -20 Q19 -34 24 -20" fill="#5a9a45" />
          <path d="M16 -20 Q21 -36 26 -20" fill="#4a8a38" />
          <path d="M18 -20 Q22 -32 26 -20" fill="#3a7a28" opacity="0.7" />
          <path d="M20 -20 Q24 -30 28 -20" fill="#5a9a45" opacity="0.6" />
        </g>

        {/* Carrot 3 - center (tallest, biggest greens) */}
        <g transform="rotate(2 35 6)">
          <path d="M35 6 L33 -22" stroke="#f09050" strokeWidth="6.5" strokeLinecap="round" />
          <path d="M33 -22 L32 -27" stroke="#d07030" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M26 -24 Q32 -42 38 -24" fill="#4a8a38" />
          <path d="M28 -24 Q34 -44 40 -24" fill="#5a9a45" />
          <path d="M30 -24 Q35 -40 40 -24" fill="#3a7a28" opacity="0.8" />
          <path d="M32 -24 Q37 -38 42 -24" fill="#5a9a45" opacity="0.7" />
          <path d="M34 -24 Q38 -36 42 -24" fill="#4a8a38" opacity="0.5" />
        </g>

        {/* Carrot 4 - right-center */}
        <g transform="rotate(16 48 8)">
          <path d="M48 8 L50 -16" stroke="#f09050" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M50 -16 L51 -20" stroke="#d07030" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M45 -18 Q49 -30 53 -18" fill="#5a9a45" />
          <path d="M47 -18 Q51 -32 55 -18" fill="#4a8a38" />
          <path d="M49 -18 Q52 -28 55 -18" fill="#3a7a28" opacity="0.7" />
        </g>

        {/* Carrot 5 - far right, leaning out */}
        <g transform="rotate(30 60 10)">
          <path d="M60 10 L63 -10" stroke="#f09050" strokeWidth="5" strokeLinecap="round" />
          <path d="M63 -10 L64 -14" stroke="#d07030" strokeWidth="4" strokeLinecap="round" />
          <path d="M59 -12 Q62 -24 65 -12" fill="#4a8a38" />
          <path d="M61 -12 Q64 -22 67 -12" fill="#5a9a45" />
        </g>

        {/* Carrot 6 - small one peeking between */}
        <g transform="rotate(-6 28 12)">
          <path d="M28 12 L27 1" stroke="#f09050" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M24 1 Q27 -8 30 1" fill="#5a9a45" />
          <path d="M26 1 Q28 -5 30 1" fill="#3a7a28" opacity="0.7" />
        </g>

        {/* Carrot 7 - small right */}
        <g transform="rotate(10 44 12)">
          <path d="M44 12 L45 2" stroke="#f09050" strokeWidth="3" strokeLinecap="round" />
          <path d="M42 2 Q44 -5 47 2" fill="#4a8a38" />
          <path d="M43 2 Q45 -3 47 2" fill="#5a9a45" opacity="0.8" />
        </g>
      </g>

      {/* Loose carrots on the ground */}
      <g transform="translate(175, 212) rotate(-45)">
        <path d="M0 0 L-2 -15" stroke="#f09050" strokeWidth="4" strokeLinecap="round" />
        <path d="M-2 -15 L-2 -18" stroke="#d07030" strokeWidth="3" strokeLinecap="round" />
        <path d="M-6 -16 Q-2 -24 2 -16" fill="#5a9a45" />
        <path d="M-4 -16 Q0 -22 4 -16" fill="#4a8a38" />
      </g>
      <g transform="translate(288, 214) rotate(30)">
        <path d="M0 0 L1 -13" stroke="#f09050" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M-3 -13 Q1 -20 5 -13" fill="#5a9a45" />
        <path d="M-1 -13 Q2 -18 5 -13" fill="#4a8a38" />
      </g>
      {/* Third loose carrot */}
      <g transform="translate(165, 220) rotate(-20)">
        <path d="M0 0 L-1 -10" stroke="#f09050" strokeWidth="3" strokeLinecap="round" />
        <path d="M-3 -10 Q-1 -16 2 -10" fill="#5a9a45" />
      </g>

      {/* Butterflies */}
      <g className="field-butterfly" transform="translate(48, 115)" opacity="0.55">
        <path d="M0 0 Q-6 -5 -4 -9 Q0 -6 0 0" fill="#d8a8d0" />
        <path d="M0 0 Q6 -5 4 -9 Q0 -6 0 0" fill="#c898c0" />
        <path d="M0 0 Q-4 -2 -3 -6 Q0 -4 0 0" fill="#e0b8d8" opacity="0.6" />
        <path d="M0 0 Q4 -2 3 -6 Q0 -4 0 0" fill="#d0a8c8" opacity="0.6" />
        <line x1="0" y1="0" x2="0" y2="3" stroke="#886088" strokeWidth="0.5" />
      </g>
      <g className="field-butterfly-2" transform="translate(275, 100)" opacity="0.4">
        <path d="M0 0 Q-4 -4 -3 -7 Q0 -4 0 0" fill="#a8c8e0" />
        <path d="M0 0 Q4 -4 3 -7 Q0 -4 0 0" fill="#90b8d0" />
        <line x1="0" y1="0" x2="0" y2="2.5" stroke="#607888" strokeWidth="0.4" />
      </g>

      {/* Animated firefly sparkles */}
      <circle className="field-firefly" cx="200" cy="145" r="1.5" fill="#f8e888" opacity="0.5" />
      <circle className="field-firefly-2" cx="130" cy="160" r="1.2" fill="#f8e888" opacity="0.4" />
      <circle className="field-firefly" cx="260" cy="155" r="1" fill="#f8e888" opacity="0.35" />
      <circle className="field-firefly-2" cx="90" cy="170" r="1.3" fill="#f8e888" opacity="0.3" />

      {/* Tiny sparkle stars near basket */}
      <g className="field-sparkle" opacity="0.4">
        <path d="M230 148 L231 145 L232 148 L235 149 L232 150 L231 153 L230 150 L227 149Z" fill="#f8e0a0" />
      </g>
      <g className="field-sparkle-2" opacity="0.3">
        <path d="M195 138 L196 136 L197 138 L199 139 L197 140 L196 142 L195 140 L193 139Z" fill="#f8e0a0" />
      </g>

      <style>{`
        .field-butterfly { animation: field-float 4s ease-in-out infinite; }
        .field-butterfly-2 { animation: field-float 5s ease-in-out 1s infinite; }
        .field-firefly { animation: field-glow 2.5s ease-in-out infinite; }
        .field-firefly-2 { animation: field-glow 3s ease-in-out 1.2s infinite; }
        .field-sparkle { animation: field-twinkle 2s ease-in-out infinite; }
        .field-sparkle-2 { animation: field-twinkle 2.5s ease-in-out 0.8s infinite; }
        @keyframes field-float {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(3px, -2px); }
          50% { transform: translate(0, -4px); }
          75% { transform: translate(-3px, -2px); }
        }
        @keyframes field-glow {
          0%, 100% { opacity: 0.2; r: 1; }
          50% { opacity: 0.7; r: 2; }
        }
        @keyframes field-twinkle {
          0%, 100% { opacity: 0.15; transform: scale(0.8); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
    </svg>
  );
}
