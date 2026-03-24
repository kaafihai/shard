import { cn } from "@/lib/utils";
import type { RabbitLevel, RabbitMemory } from "@/lib/types";
import { RABBIT_LEVEL_NAMES, RABBIT_XP_THRESHOLDS } from "@/lib/types";

export type RabbitMood =
  | "happy"
  | "encouraging"
  | "nudging"
  | "celebrating"
  | "sleeping"
  | "waving";

interface RabbitMascotProps {
  mood?: RabbitMood;
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showBubble?: boolean;
  level?: RabbitLevel;
  outfit?: string;
  animated?: boolean;
}

export function RabbitMascot({
  mood = "happy",
  message,
  size = "md",
  className,
  showBubble = true,
  level = 1,
  outfit = "none",
  animated = true,
}: RabbitMascotProps) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  // Level affects the rabbit's visual scale slightly (grows with level)
  const levelScale = 0.9 + level * 0.025; // 0.925 → 1.025

  return (
    <div className={cn("flex items-end gap-3", className)}>
      <div
        className={cn("shrink-0", sizeClasses[size])}
        style={{ transform: `scale(${levelScale})` }}
      >
        <div className={animated ? `rabbit-idle rabbit-mood-${mood}` : ""}>
          <RabbitSVG mood={mood} level={level} outfit={outfit} />
        </div>
      </div>
      {message && showBubble && (
        <div className="relative bg-primary/10 rounded-2xl rounded-bl-sm px-3 py-2 text-sm max-w-[240px]">
          {message}
        </div>
      )}
    </div>
  );
}

// --- XP Progress Bar ---
interface RabbitXPBarProps {
  level: RabbitLevel;
  xp: number;
  className?: string;
}

export function RabbitXPBar({ level, xp, className }: RabbitXPBarProps) {
  const currentThreshold = RABBIT_XP_THRESHOLDS[level];
  const nextLevel = (level < 5 ? level + 1 : 5) as RabbitLevel;
  const nextThreshold = RABBIT_XP_THRESHOLDS[nextLevel];

  const xpInLevel = xp - currentThreshold;
  const xpNeeded = nextThreshold - currentThreshold;
  const progress = level >= 5 ? 100 : Math.min(100, (xpInLevel / xpNeeded) * 100);

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between text-xs">
        <span className="font-medium">{RABBIT_LEVEL_NAMES[level]}</span>
        <span className="opacity-60">
          {level >= 5 ? "Max Level!" : `${xpInLevel}/${xpNeeded} XP`}
        </span>
      </div>
      <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-success rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// --- Rabbit SVG with outfits and level-based details ---

function RabbitSVG({
  mood,
  level,
  outfit,
}: {
  mood: RabbitMood;
  level: RabbitLevel;
  outfit: string;
}) {
  const getEyes = () => {
    switch (mood) {
      case "celebrating":
        return (
          <>
            {/* Happy squint eyes */}
            <path d="M33 50 Q37 45 41 50" stroke="#5a4a5a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M55 50 Q59 45 63 50" stroke="#5a4a5a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Tiny sparkles near eyes */}
            <circle cx="44" cy="44" r="1" fill="#f0d06a" opacity="0.8" />
            <circle cx="52" cy="43" r="0.8" fill="#f0d06a" opacity="0.6" />
          </>
        );
      case "sleeping":
        return (
          <>
            <path d="M34 50 Q38 52 42 50" stroke="#5a4a5a" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M54 50 Q58 52 62 50" stroke="#5a4a5a" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        );
      case "nudging":
        return (
          <>
            {/* One big eye, one winking */}
            <circle cx="37" cy="49" r="4.5" fill="#5a4a5a" />
            <circle cx="39" cy="47" r="1.8" fill="white" />
            <circle cx="37.5" cy="47.5" r="0.6" fill="white" opacity="0.5" />
            <path d="M55 49 Q59 45 63 49" stroke="#5a4a5a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        );
      default:
        return (
          <>
            {/* Big round sparkly eyes */}
            <circle cx="37" cy="49" r="4.5" fill="#5a4a5a" />
            <circle cx="59" cy="49" r="4.5" fill="#5a4a5a" />
            {/* Main highlight */}
            <circle cx="39" cy="47" r="1.8" fill="white" />
            <circle cx="61" cy="47" r="1.8" fill="white" />
            {/* Secondary highlight */}
            <circle cx="35.5" cy="50.5" r="0.8" fill="white" opacity="0.5" />
            <circle cx="57.5" cy="50.5" r="0.8" fill="white" opacity="0.5" />
          </>
        );
    }
  };

  const getMouth = () => {
    switch (mood) {
      case "celebrating":
        return (
          <>
            <path d="M42 59 Q48 67 54 59" stroke="#5a4a5a" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Tiny bunny tooth */}
            <rect x="46.5" y="59" width="3" height="3" rx="0.8" fill="white" stroke="#e8d4c0" strokeWidth="0.5" />
          </>
        );
      case "encouraging":
        return (
          <>
            <path d="M43 59 Q48 64 53 59" stroke="#5a4a5a" strokeWidth="2" fill="none" strokeLinecap="round" />
            <rect x="46.5" y="59" width="3" height="2.5" rx="0.8" fill="white" stroke="#e8d4c0" strokeWidth="0.5" />
          </>
        );
      case "nudging":
        return <path d="M44 59 Q48 62 52 59" stroke="#5a4a5a" strokeWidth="1.8" fill="none" strokeLinecap="round" />;
      case "sleeping":
        return <path d="M44 60 Q48 62 52 60" stroke="#5a4a5a" strokeWidth="1.5" fill="none" strokeLinecap="round" />;
      default:
        return (
          <>
            <path d="M43 59 Q48 65 53 59" stroke="#5a4a5a" strokeWidth="2" fill="none" strokeLinecap="round" />
            <rect x="46.5" y="59" width="3" height="2.5" rx="0.8" fill="white" stroke="#e8d4c0" strokeWidth="0.5" />
          </>
        );
    }
  };

  const getExtras = () => {
    if (mood === "celebrating") {
      return (
        <>
          <circle cx="20" cy="20" r="2.5" fill="#e8a87c" opacity="0.8" />
          <circle cx="75" cy="15" r="2" fill="#b8d4c8" opacity="0.8" />
          <circle cx="80" cy="30" r="3" fill="#d4b8d8" opacity="0.7" />
          <circle cx="15" cy="35" r="2" fill="#e8a87c" opacity="0.6" />
          <text x="10" y="25" fontSize="8" opacity="0.7">✦</text>
          <text x="82" y="22" fontSize="6" opacity="0.6">✦</text>
        </>
      );
    }
    if (mood === "sleeping") {
      return (
        <>
          <text x="65" y="30" fontSize="10" fill="#5a4a5a" opacity="0.4">z</text>
          <text x="72" y="22" fontSize="8" fill="#5a4a5a" opacity="0.3">z</text>
          <text x="78" y="16" fontSize="6" fill="#5a4a5a" opacity="0.2">z</text>
        </>
      );
    }
    return null;
  };

  // Level-based fur gradient — slightly warmer/richer at higher levels
  const furColors: Record<RabbitLevel, { main: string; stroke: string; inner: string }> = {
    1: { main: "#f5e6d3", stroke: "#e8d4c0", inner: "#f0c4c4" },
    2: { main: "#f3e2cf", stroke: "#e5d0bb", inner: "#edbfbf" },
    3: { main: "#f0ddc8", stroke: "#e0c9b2", inner: "#e8b5b5" },
    4: { main: "#edceb5", stroke: "#d8bca5", inner: "#e0a8a8" },
    5: { main: "#eac5a8", stroke: "#d0af95", inner: "#d89e9e" },
  };

  const fur = furColors[level];
  const earRotation = mood === "celebrating" ? -5 : mood === "sleeping" ? 10 : 0;

  return (
    <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      {getExtras()}

      {/* Left ear — floppy */}
      <g transform={`rotate(${earRotation - 12}, 36, 30)`}>
        <ellipse cx="34" cy="16" rx="11" ry="22" fill={fur.main} stroke={fur.stroke} strokeWidth="1.5" />
        <ellipse cx="34" cy="16" rx="6" ry="15" fill={fur.inner} opacity="0.5" />
        {/* Ear tip highlight */}
        <ellipse cx="34" cy="2" rx="4" ry="3" fill="white" opacity="0.15" />
      </g>

      {/* Right ear — slightly perked */}
      <g transform={`rotate(${-earRotation + 6}, 62, 30)`}>
        <ellipse cx="62" cy="16" rx="11" ry="22" fill={fur.main} stroke={fur.stroke} strokeWidth="1.5" />
        <ellipse cx="62" cy="16" rx="6" ry="15" fill={fur.inner} opacity="0.5" />
        <ellipse cx="62" cy="2" rx="4" ry="3" fill="white" opacity="0.15" />
      </g>

      {/* Fluffy tail */}
      <circle cx="68" cy="82" r="6" fill={fur.main} stroke={fur.stroke} strokeWidth="1" />
      <circle cx="70" cy="80" r="2" fill="white" opacity="0.25" />

      {/* Body — rounder, chubbier */}
      <ellipse cx="48" cy="78" rx="20" ry="15" fill={fur.main} stroke={fur.stroke} strokeWidth="1.5" />
      {/* Tummy highlight */}
      <ellipse cx="48" cy="78" rx="12" ry="9" fill="white" opacity="0.12" />

      {/* Head — rounder */}
      <ellipse cx="48" cy="51" rx="23" ry="21" fill={fur.main} stroke={fur.stroke} strokeWidth="1.5" />
      {/* Forehead highlight */}
      <ellipse cx="48" cy="42" rx="10" ry="6" fill="white" opacity="0.1" />

      {/* Cheek blush — bigger, rosier */}
      <ellipse cx="29" cy="55" rx="6" ry="4" fill={fur.inner} opacity="0.55" />
      <ellipse cx="67" cy="55" rx="6" ry="4" fill={fur.inner} opacity="0.55" />

      {/* Eyes */}
      {getEyes()}

      {/* Nose — cute triangle */}
      <path d="M46 55 Q48 58 50 55 Q48 53 46 55Z" fill="#e0a0a0" />
      <ellipse cx="48" cy="55.5" rx="2.5" ry="1.8" fill="#d4a0a0" />

      {/* Mouth */}
      {getMouth()}

      {/* Whiskers */}
      <line x1="20" y1="54" x2="32" y2="56" stroke="#d4c0b0" strokeWidth="1" opacity="0.5" strokeLinecap="round" />
      <line x1="20" y1="58" x2="32" y2="58" stroke="#d4c0b0" strokeWidth="1" opacity="0.5" strokeLinecap="round" />
      <line x1="64" y1="56" x2="76" y2="54" stroke="#d4c0b0" strokeWidth="1" opacity="0.5" strokeLinecap="round" />
      <line x1="64" y1="58" x2="76" y2="58" stroke="#d4c0b0" strokeWidth="1" opacity="0.5" strokeLinecap="round" />

      {/* Arms */}
      {mood === "waving" || mood === "celebrating" ? (
        <>
          <ellipse cx="32" cy="80" rx="5" ry="4" fill={fur.main} stroke={fur.stroke} strokeWidth="1" />
          <ellipse cx="68" cy="68" rx="5" ry="4" fill={fur.main} stroke={fur.stroke} strokeWidth="1" transform="rotate(-30 68 68)" />
        </>
      ) : (
        <>
          <ellipse cx="32" cy="80" rx="5" ry="4" fill={fur.main} stroke={fur.stroke} strokeWidth="1" />
          <ellipse cx="64" cy="80" rx="5" ry="4" fill={fur.main} stroke={fur.stroke} strokeWidth="1" />
        </>
      )}

      {/* Feet */}
      <ellipse cx="40" cy="90" rx="7" ry="4" fill={fur.main} stroke={fur.stroke} strokeWidth="1" />
      <ellipse cx="56" cy="90" rx="7" ry="4" fill={fur.main} stroke={fur.stroke} strokeWidth="1" />

      {/* Level badge (levels 3+) */}
      {level >= 3 && (
        <g>
          <circle cx="74" cy="74" r="8" fill="#fff" stroke={fur.stroke} strokeWidth="1.5" />
          <text x="74" y="78" textAnchor="middle" fontSize="10" fill="#5a4a5a" fontWeight="bold">
            {level}
          </text>
        </g>
      )}

      {/* Outfit rendering */}
      <OutfitOverlay outfit={outfit} fur={fur} />
    </svg>
  );
}

// --- Outfit SVG overlays ---

function OutfitOverlay({
  outfit,
}: {
  outfit: string;
  fur: { main: string; stroke: string; inner: string };
}) {
  switch (outfit) {
    case "scarf_cozy":
      return (
        <g>
          <path d="M30 66 Q48 72 66 66 Q66 70 48 74 Q30 70 30 66Z" fill="#c4b5d8" stroke="#a898c0" strokeWidth="1" />
          <path d="M58 68 L62 82 L56 82 L54 70Z" fill="#c4b5d8" stroke="#a898c0" strokeWidth="0.8" />
        </g>
      );
    case "hat_party":
      return (
        <g>
          <polygon points="48,8 38,34 58,34" fill="#e8a87c" stroke="#d4956a" strokeWidth="1" />
          <ellipse cx="48" cy="34" rx="12" ry="3" fill="#e8a87c" stroke="#d4956a" strokeWidth="1" />
          <circle cx="48" cy="8" r="3" fill="#f0d06a" />
        </g>
      );
    case "glasses_smart":
      return (
        <g>
          <circle cx="38" cy="50" r="7" fill="none" stroke="#8b7355" strokeWidth="1.8" />
          <circle cx="58" cy="50" r="7" fill="none" stroke="#8b7355" strokeWidth="1.8" />
          <line x1="45" y1="50" x2="51" y2="50" stroke="#8b7355" strokeWidth="1.5" />
          <line x1="31" y1="49" x2="26" y2="47" stroke="#8b7355" strokeWidth="1.5" />
          <line x1="65" y1="49" x2="70" y2="47" stroke="#8b7355" strokeWidth="1.5" />
        </g>
      );
    case "bow_peach":
      return (
        <g>
          <ellipse cx="63" cy="14" rx="7" ry="5" fill="#f0b89a" stroke="#e0a080" strokeWidth="0.8" transform="rotate(-15 63 14)" />
          <ellipse cx="71" cy="10" rx="7" ry="5" fill="#f0b89a" stroke="#e0a080" strokeWidth="0.8" transform="rotate(15 71 10)" />
          <circle cx="67" cy="12" r="2.5" fill="#e89878" />
        </g>
      );
    case "cape_hero":
      return (
        <g>
          <path d="M30 66 Q28 85 22 94 L48 88 L74 94 Q68 85 66 66Z" fill="#d85050" stroke="#c04040" strokeWidth="1" opacity="0.85" />
        </g>
      );
    case "hat_crown":
      return (
        <g>
          <path d="M34 36 L36 24 L40 32 L44 20 L48 32 L52 20 L56 32 L60 24 L62 36Z" fill="#f0d06a" stroke="#d4b44e" strokeWidth="1" />
          <rect x="34" y="34" width="28" height="4" rx="1" fill="#f0d06a" stroke="#d4b44e" strokeWidth="1" />
          <circle cx="48" cy="36" r="2" fill="#e85050" />
        </g>
      );
    case "badge_star":
      return (
        <g>
          <polygon points="20,74 22,70 24,74 28,74 25,77 26,81 22,78 18,81 19,77 16,74" fill="#f0d06a" stroke="#d4b44e" strokeWidth="0.8" />
        </g>
      );
    case "cape_magic":
      return (
        <g>
          <path d="M30 66 Q28 85 22 94 L48 88 L74 94 Q68 85 66 66Z" fill="#7050b0" stroke="#604098" strokeWidth="1" opacity="0.85" />
          <text x="38" y="82" fontSize="5" fill="#f0d06a" opacity="0.7">✦</text>
          <text x="52" y="78" fontSize="4" fill="#f0d06a" opacity="0.6">✦</text>
          <text x="45" y="86" fontSize="3" fill="#f0d06a" opacity="0.5">✦</text>
        </g>
      );
    case "glasses_heart":
      return (
        <g>
          <path d="M31 50 Q31 44 38 44 Q45 44 45 50 Q45 56 38 58 Q31 56 31 50Z" fill="none" stroke="#e05080" strokeWidth="1.8" />
          <path d="M51 50 Q51 44 58 44 Q65 44 65 50 Q65 56 58 58 Q51 56 51 50Z" fill="none" stroke="#e05080" strokeWidth="1.8" />
          <line x1="45" y1="50" x2="51" y2="50" stroke="#e05080" strokeWidth="1.5" />
          <line x1="31" y1="49" x2="26" y2="47" stroke="#e05080" strokeWidth="1.5" />
          <line x1="65" y1="49" x2="70" y2="47" stroke="#e05080" strokeWidth="1.5" />
        </g>
      );
    case "hat_wizard":
      return (
        <g>
          <polygon points="48,2 34,36 62,36" fill="#5040a0" stroke="#403090" strokeWidth="1" />
          <ellipse cx="48" cy="36" rx="16" ry="4" fill="#5040a0" stroke="#403090" strokeWidth="1" />
          <text x="46" y="24" fontSize="8" fill="#f0d06a" opacity="0.8">✦</text>
          <circle cx="42" cy="30" r="1.5" fill="#f0d06a" opacity="0.5" />
          <circle cx="54" cy="18" r="1" fill="#f0d06a" opacity="0.4" />
        </g>
      );
    default:
      return null;
  }
}

// --- CSS Animation Styles (inject into app root) ---

export function RabbitAnimationStyles() {
  return (
    <style>{`
      @keyframes rabbit-breathe {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-1.5px); }
      }
      @keyframes rabbit-bounce {
        0%, 100% { transform: translateY(0); }
        30% { transform: translateY(-4px); }
        50% { transform: translateY(-2px); }
        70% { transform: translateY(-5px); }
      }
      @keyframes rabbit-wave {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-8deg); }
        75% { transform: rotate(8deg); }
      }
      @keyframes rabbit-sleep {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(1px) rotate(2deg); }
      }
      @keyframes rabbit-nod {
        0%, 100% { transform: rotate(0deg); }
        30% { transform: rotate(5deg); }
        60% { transform: rotate(-3deg); }
      }
      .rabbit-idle {
        animation: rabbit-breathe 3s ease-in-out infinite;
      }
      .rabbit-mood-celebrating {
        animation: rabbit-bounce 0.8s ease-in-out infinite !important;
      }
      .rabbit-mood-waving {
        animation: rabbit-wave 1.2s ease-in-out infinite !important;
      }
      .rabbit-mood-sleeping {
        animation: rabbit-sleep 4s ease-in-out infinite !important;
      }
      .rabbit-mood-nudging {
        animation: rabbit-nod 1.5s ease-in-out infinite !important;
      }
    `}</style>
  );
}

// --- Playful Coach Messages ---

const GREETING_MESSAGES = {
  morning: [
    "Rise and shine! Ready to crush today?",
    "Good morning! Let's make today count!",
    "Morning, superstar! What's the plan?",
  ],
  afternoon: [
    "Afternoon check-in! How's it going?",
    "Keep that momentum rolling!",
    "You've got this — the day's not over yet!",
  ],
  evening: [
    "Wrapping up? Let's see what you nailed today!",
    "Evening wind-down time. Nice work today!",
    "Almost bedtime — you did great today!",
  ],
};

export function getGreetingMessage(): { message: string; mood: RabbitMood } {
  const hour = new Date().getHours();
  let messages: string[];
  if (hour < 12) messages = GREETING_MESSAGES.morning;
  else if (hour < 17) messages = GREETING_MESSAGES.afternoon;
  else messages = GREETING_MESSAGES.evening;

  const message = messages[Math.floor(Math.random() * messages.length)];
  return { message, mood: "waving" };
}

const AGING_MESSAGES: Record<string, string[]> = {
  mild: [
    "This one's been chillin' for a bit — want to tackle it?",
    "Hey, remember this one? It's still hanging around!",
    "A little nudge — this task is waiting for you!",
  ],
  moderate: [
    "This task is getting lonely... it's been a few days!",
    "Psst! This one's been here a while. Give it some love?",
    "Time flies! This task has been patient — maybe today?",
  ],
  urgent: [
    "Okay, real talk — this one's been here a while. You got this!",
    "This task has been waiting patiently. Let's do this!",
    "It's been over a week! Just a little push and it's done!",
  ],
};

export function getAgingMessage(daysSinceCreated: number): { message: string; mood: RabbitMood } | null {
  if (daysSinceCreated < 1) return null;

  let category: string;
  let mood: RabbitMood;

  if (daysSinceCreated <= 5) {
    category = "mild";
    mood = "encouraging";
  } else if (daysSinceCreated <= 8) {
    category = "moderate";
    mood = "nudging";
  } else {
    category = "urgent";
    mood = "nudging";
  }

  const messages = AGING_MESSAGES[category];
  const message = messages[Math.floor(Math.random() * messages.length)];
  return { message, mood };
}

const STREAK_CELEBRATIONS: Record<number, { message: string; mood: RabbitMood }> = {
  3: { message: "3 days! *happy ear wiggle* You're sprouting roots!", mood: "encouraging" },
  5: { message: "5 in a row! The carrots are growing and so are you!", mood: "celebrating" },
  7: { message: "A FULL WEEK! *bounces* I knew you had it in you!", mood: "celebrating" },
  10: { message: "Double digits! The garden is blooming!", mood: "celebrating" },
  14: { message: "Two weeks strong! *does a little spin* Unstoppable!", mood: "celebrating" },
  21: { message: "Three weeks! This isn't luck — this is YOU!", mood: "celebrating" },
  30: { message: "ONE MONTH! *tears up* I'm so proud of you!", mood: "celebrating" },
  45: { message: "45 days! Even the butterflies are impressed!", mood: "celebrating" },
  60: { message: "60 days?! *jaw drops* You're a force of nature!", mood: "celebrating" },
  90: { message: "90 DAYS! That's legendary. You inspire me!", mood: "celebrating" },
  120: { message: "120 days! The whole carrot field is cheering!", mood: "celebrating" },
  180: { message: "Half a year! *wipes happy tears* You're writing history!", mood: "celebrating" },
  365: { message: "A WHOLE YEAR! *throws confetti* You absolute champion!", mood: "celebrating" },
};

export function getStreakCelebration(streak: number): { message: string; mood: RabbitMood; milestone: number } | null {
  const milestones = Object.keys(STREAK_CELEBRATIONS)
    .map(Number)
    .sort((a, b) => b - a);

  for (const milestone of milestones) {
    if (streak >= milestone) {
      const celebration = STREAK_CELEBRATIONS[milestone];
      return { ...celebration, milestone };
    }
  }
  return null;
}

export function getEmptyStateMessage(): { message: string; mood: RabbitMood } {
  const messages = [
    "All clear! Time to add something new?",
    "A blank slate — the possibilities are endless!",
    "Nothing here yet! Let's add your first task!",
  ];
  const message = messages[Math.floor(Math.random() * messages.length)];
  return { message, mood: "happy" };
}

export function getDashboardEmptyMessage(): { message: string; mood: RabbitMood } {
  const messages = [
    "Let's get started! Add a task or log a mood!",
    "Your journey starts with a single step. Ready?",
    "I'm here to help! What would you like to track?",
  ];
  const message = messages[Math.floor(Math.random() * messages.length)];
  return { message, mood: "waving" };
}

// --- Level-up messages ---

export function getLevelUpMessage(newLevel: RabbitLevel): { message: string; mood: RabbitMood } {
  const messages: Record<RabbitLevel, string> = {
    1: "Welcome to the world, little one!",
    2: "I'm growing up! Thanks for taking care of me!",
    3: "Look at me — a real teen rabbit now! So cool!",
    4: "Fully grown! We've come so far together!",
    5: "I've reached max wisdom. Thank you for this journey!",
  };
  return { message: messages[newLevel], mood: "celebrating" };
}

// --- Personality memory messages ---

export function getPersonalityMessage(memories: RabbitMemory[]): { message: string; mood: RabbitMood } | null {
  if (!memories || memories.length === 0) return null;

  const dayPatterns = memories.filter((m) => m.memoryType === "day_pattern");
  const streakRecords = memories.filter((m) => m.memoryType === "streak_record");
  const milestones = memories.filter((m) => m.memoryType === "milestone");
  const funFacts = memories.filter((m) => m.memoryType === "fun_fact");

  // Prioritize fun messages
  if (funFacts.length > 0) {
    const fact = funFacts[Math.floor(Math.random() * funFacts.length)];
    return { message: fact.memoryValue, mood: "happy" };
  }

  if (dayPatterns.length > 0) {
    const pattern = dayPatterns[0];
    const dayMatch = pattern.memoryKey.match(/best_day=(\w+)/);
    if (dayMatch) {
      return {
        message: `I noticed you're most productive on ${dayMatch[1]}s! Let's keep that streak going!`,
        mood: "encouraging",
      };
    }
  }

  if (streakRecords.length > 0) {
    const record = streakRecords[0];
    return {
      message: `Your best streak was ${record.memoryValue} days — can we beat it?`,
      mood: "encouraging",
    };
  }

  if (milestones.length > 0) {
    const milestone = milestones[milestones.length - 1];
    return {
      message: `Remember when you hit ${milestone.memoryKey}? So proud!`,
      mood: "happy",
    };
  }

  return null;
}
