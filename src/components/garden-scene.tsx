// =============================================================================
// Garden Scene — Animated butterflies, daisies, and carrot field background
// Shared across welcome page and dashboard
// =============================================================================

import { cn } from "@/lib/utils";

// --- Animated Butterfly ---
function Butterfly({
  x,
  y,
  size = 1,
  color = "#e8a07a",
  delay = 0,
}: {
  x: number;
  y: number;
  size?: number;
  color?: string;
  delay?: number;
}) {
  return (
    <g
      transform={`translate(${x},${y}) scale(${size})`}
      className="butterfly-flutter"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Left wing */}
      <ellipse cx="-5" cy="-2" rx="5" ry="7" fill={color} opacity="0.7">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 0 0; -30 0 0; 0 0 0"
          dur="0.6s"
          repeatCount="indefinite"
          begin={`${delay}s`}
        />
      </ellipse>
      {/* Right wing */}
      <ellipse cx="5" cy="-2" rx="5" ry="7" fill={color} opacity="0.7">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 0 0; 30 0 0; 0 0 0"
          dur="0.6s"
          repeatCount="indefinite"
          begin={`${delay}s`}
        />
      </ellipse>
      {/* Body */}
      <ellipse cx="0" cy="0" rx="1" ry="4" fill="#5a4a5a" />
      {/* Antennae */}
      <line x1="-1" y1="-4" x2="-3" y2="-8" stroke="#5a4a5a" strokeWidth="0.5" />
      <line x1="1" y1="-4" x2="3" y2="-8" stroke="#5a4a5a" strokeWidth="0.5" />
      <circle cx="-3" cy="-8" r="0.8" fill="#5a4a5a" />
      <circle cx="3" cy="-8" r="0.8" fill="#5a4a5a" />
    </g>
  );
}

// --- Daisy Flower ---
function Daisy({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
  const petals = 6;
  return (
    <g transform={`translate(${x},${y}) scale(${size})`}>
      {/* Stem */}
      <line x1="0" y1="0" x2="0" y2="12" stroke="#7aaa5a" strokeWidth="1.5" />
      {/* Leaf */}
      <ellipse cx="4" cy="8" rx="3" ry="1.5" fill="#8aba6a" transform="rotate(-20 4 8)" />
      {/* Petals */}
      {Array.from({ length: petals }).map((_, i) => {
        const angle = (360 / petals) * i;
        return (
          <ellipse
            key={i}
            cx="0"
            cy="-5"
            rx="2.5"
            ry="5"
            fill="white"
            stroke="#f0e8d0"
            strokeWidth="0.3"
            transform={`rotate(${angle} 0 0)`}
          />
        );
      })}
      {/* Center */}
      <circle cx="0" cy="0" r="3" fill="#f0d06a" />
      <circle cx="-0.5" cy="-0.5" r="1.5" fill="#e8c44a" opacity="0.5" />
    </g>
  );
}

// --- Carrot Plant ---
function CarrotPlant({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${size})`}>
      {/* Carrot top visible above soil */}
      <circle cx="0" cy="0" r="2.5" fill="#e87a3a" />
      {/* Leaves */}
      <path d="M-1 -2 Q-4 -14 -2 -16" stroke="#5a9a3a" strokeWidth="1.5" fill="none" />
      <path d="M0 -2 Q1 -16 3 -18" stroke="#5a9a3a" strokeWidth="1.5" fill="none" />
      <path d="M1 -2 Q5 -12 7 -14" stroke="#5a9a3a" strokeWidth="1.5" fill="none" />
      {/* Leaf fronds */}
      <ellipse cx="-3" cy="-15" rx="2" ry="1" fill="#6aaa4a" transform="rotate(-30 -3 -15)" />
      <ellipse cx="2.5" cy="-17" rx="2" ry="1" fill="#6aaa4a" transform="rotate(10 2.5 -17)" />
      <ellipse cx="6.5" cy="-13" rx="2" ry="1" fill="#6aaa4a" transform="rotate(25 6.5 -13)" />
    </g>
  );
}

// --- Full Carrot Field Background ---
export function CarrotFieldBackground({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      <svg
        viewBox="0 0 400 200"
        className="w-full h-full"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Sky gradient */}
        <defs>
          <linearGradient id="sky-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fdf4e8" />
            <stop offset="60%" stopColor="#f8ead0" />
            <stop offset="100%" stopColor="#e8dcc0" />
          </linearGradient>
          <linearGradient id="soil" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8a7050" />
            <stop offset="100%" stopColor="#6a5538" />
          </linearGradient>
        </defs>

        <rect width="400" height="200" fill="url(#sky-bg)" />

        {/* Distant hills */}
        <ellipse cx="100" cy="130" rx="120" ry="30" fill="#c8d8a8" opacity="0.4" />
        <ellipse cx="300" cy="135" rx="140" ry="25" fill="#c0d0a0" opacity="0.35" />

        {/* Soil / ground */}
        <rect x="0" y="145" width="400" height="55" fill="url(#soil)" opacity="0.3" />

        {/* Carrot rows */}
        {[155, 165, 175].map((rowY, rowIdx) =>
          Array.from({ length: 10 }).map((_, i) => (
            <CarrotPlant
              key={`${rowIdx}-${i}`}
              x={25 + i * 38 + (rowIdx % 2 === 0 ? 0 : 19)}
              y={rowY}
              size={0.7 + rowIdx * 0.05}
            />
          ))
        )}

        {/* Daisies scattered */}
        <Daisy x={30} y={140} size={0.8} />
        <Daisy x={95} y={138} size={0.6} />
        <Daisy x={180} y={142} size={0.7} />
        <Daisy x={260} y={136} size={0.9} />
        <Daisy x={340} y={140} size={0.65} />
        <Daisy x={370} y={135} size={0.75} />

        {/* Butterflies */}
        <Butterfly x={70} y={80} color="#e8a07a" delay={0} size={0.8} />
        <Butterfly x={200} y={60} color="#c4a0d8" delay={0.3} size={0.6} />
        <Butterfly x={320} y={90} color="#a0c8d8" delay={0.7} size={0.7} />

        {/* Fireflies / sparkles */}
        <circle cx="50" cy="100" r="1.5" fill="#f0d06a" opacity="0.6">
          <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="150" cy="70" r="1" fill="#f0d06a" opacity="0.5">
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
        </circle>
        <circle cx="280" cy="85" r="1.2" fill="#f0d06a" opacity="0.4">
          <animate attributeName="opacity" values="0.2;0.9;0.2" dur="3s" repeatCount="indefinite" begin="1s" />
        </circle>
        <circle cx="350" cy="65" r="0.8" fill="#f0d06a" opacity="0.5">
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="1.8s" repeatCount="indefinite" begin="0.3s" />
        </circle>
      </svg>

      {/* CSS for butterfly flight path */}
      <style>{`
        .butterfly-flutter {
          animation: butterfly-drift 8s ease-in-out infinite alternate;
        }
        @keyframes butterfly-drift {
          0% { transform: translate(0, 0); }
          25% { transform: translate(8px, -5px); }
          50% { transform: translate(-5px, -8px); }
          75% { transform: translate(10px, 3px); }
          100% { transform: translate(-3px, -6px); }
        }
      `}</style>
    </div>
  );
}

// --- Floating Daisies & Butterflies overlay (for dashboard) ---
export function GardenOverlay({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      <svg
        viewBox="0 0 400 100"
        className="w-full h-24 absolute bottom-0"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft grass line */}
        <path d="M0 80 Q50 70 100 78 Q150 85 200 76 Q250 82 300 75 Q350 80 400 77 L400 100 L0 100Z" fill="#c8d8a8" opacity="0.2" />

        {/* Small daisies along the bottom */}
        <Daisy x={40} y={85} size={0.5} />
        <Daisy x={120} y={82} size={0.4} />
        <Daisy x={220} y={86} size={0.45} />
        <Daisy x={310} y={83} size={0.5} />
        <Daisy x={380} y={85} size={0.35} />

        {/* One small butterfly */}
        <Butterfly x={180} y={50} color="#e8a07a" delay={0.5} size={0.5} />
      </svg>
    </div>
  );
}
