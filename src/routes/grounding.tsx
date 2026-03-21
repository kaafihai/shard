import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { RabbitMascot } from "@/components/rabbit-mascot";
import { useRabbitState } from "@/hooks/use-rabbit";
import type { RabbitLevel } from "@/lib/types";

export const Route = createFileRoute("/grounding")({
  component: GroundingPage,
});

type Exercise = "breathing" | "54321" | "bodyscan";
type Phase = "idle" | "active" | "done";

const EXERCISES: Record<Exercise, { title: string; description: string; icon: string }> = {
  breathing: {
    title: "Box Breathing",
    description: "Breathe in a calming square pattern",
    icon: "~",
  },
  "54321": {
    title: "5-4-3-2-1 Grounding",
    description: "Reconnect with your senses",
    icon: "5",
  },
  bodyscan: {
    title: "Quick Body Scan",
    description: "Release tension, one area at a time",
    icon: "*",
  },
};

// Box Breathing Component
function BoxBreathing({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0); // 0=in, 1=hold, 2=out, 3=hold
  const [cycle, setCycle] = useState(0);
  const [seconds, setSeconds] = useState(4);
  const totalCycles = 4;
  const stepLabels = ["Breathe in...", "Hold...", "Breathe out...", "Hold..."];

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setStep((prev) => {
            const next = (prev + 1) % 4;
            if (next === 0) {
              setCycle((c) => {
                if (c + 1 >= totalCycles) {
                  clearInterval(timer);
                  setTimeout(onComplete, 500);
                  return c + 1;
                }
                return c + 1;
              });
            }
            return next;
          });
          return 4;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onComplete]);

  const progress = ((4 - seconds) / 4) * 100;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Breathing circle */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/10" />
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-primary transition-all duration-1000"
            strokeDasharray={`${2 * Math.PI * 44}`}
            strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-primary">{seconds}</span>
          <span className="text-sm text-primary/60">{stepLabels[step]}</span>
        </div>
      </div>

      <div className="flex gap-2">
        {Array.from({ length: totalCycles }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-3 h-3 rounded-full transition-colors",
              i < cycle ? "bg-green-400" : i === cycle ? "bg-primary" : "bg-primary/20"
            )}
          />
        ))}
      </div>
      <p className="text-sm opacity-60">Cycle {Math.min(cycle + 1, totalCycles)} of {totalCycles}</p>
    </div>
  );
}

// 5-4-3-2-1 Grounding Component
function FiveForThreeTwoOne({ onComplete }: { onComplete: () => void }) {
  const senses = [
    { count: 5, sense: "things you can SEE", emoji: "sight" },
    { count: 4, sense: "things you can TOUCH", emoji: "touch" },
    { count: 3, sense: "things you can HEAR", emoji: "sound" },
    { count: 2, sense: "things you can SMELL", emoji: "smell" },
    { count: 1, sense: "thing you can TASTE", emoji: "taste" },
  ];

  const [currentSense, setCurrentSense] = useState(0);
  const [tapped, setTapped] = useState(0);

  const sense = senses[currentSense];

  const handleTap = () => {
    const newTapped = tapped + 1;
    if (newTapped >= sense.count) {
      if (currentSense + 1 >= senses.length) {
        onComplete();
      } else {
        setCurrentSense(currentSense + 1);
        setTapped(0);
      }
    } else {
      setTapped(newTapped);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center space-y-2">
        <div className="text-6xl font-black text-primary">{sense.count}</div>
        <p className="text-lg font-medium">Notice {sense.sense}</p>
        <p className="text-sm opacity-60">Tap for each one you notice</p>
      </div>

      {/* Tap circles */}
      <div className="flex gap-3">
        {Array.from({ length: sense.count }).map((_, i) => (
          <button
            key={i}
            onClick={handleTap}
            disabled={i < tapped}
            className={cn(
              "w-10 h-10 rounded-full border-2 transition-all",
              i < tapped
                ? "bg-primary border-primary scale-90"
                : "border-primary/30 hover:border-primary hover:scale-105"
            )}
          />
        ))}
      </div>

      {/* Progress */}
      <div className="flex gap-1.5">
        {senses.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i < currentSense ? "w-8 bg-green-400" : i === currentSense ? "w-8 bg-primary" : "w-8 bg-primary/15"
            )}
          />
        ))}
      </div>
    </div>
  );
}

// Quick Body Scan Component
function BodyScan({ onComplete }: { onComplete: () => void }) {
  const areas = [
    { name: "Forehead & jaw", instruction: "Unclench. Let your face soften." },
    { name: "Shoulders", instruction: "Drop them down, away from your ears." },
    { name: "Hands", instruction: "Unball your fists. Let your fingers relax." },
    { name: "Stomach", instruction: "Take a deep breath and release." },
    { name: "Feet", instruction: "Press them flat. Feel the ground." },
  ];

  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          if (current + 1 >= areas.length) {
            clearInterval(timer);
            setTimeout(onComplete, 500);
            return 100;
          }
          setCurrent((c) => c + 1);
          return 0;
        }
        return p + 2; // ~5 seconds per area
      });
    }, 100);
    return () => clearInterval(timer);
  }, [current, onComplete]);

  const area = areas[current];

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center space-y-3">
        <p className="text-sm opacity-50 font-medium">Focus on your...</p>
        <div className="text-2xl font-bold text-primary">{area.name}</div>
        <p className="text-base">{area.instruction}</p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs h-2 bg-primary/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex gap-2">
        {areas.map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-3 h-3 rounded-full transition-colors",
              i < current ? "bg-green-400" : i === current ? "bg-primary" : "bg-primary/20"
            )}
          />
        ))}
      </div>
      <p className="text-sm opacity-60">{current + 1} of {areas.length}</p>
    </div>
  );
}

function GroundingPage() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const { data: rabbitState } = useRabbitState();
  const rabbitLevel = (rabbitState?.level ?? 1) as RabbitLevel;
  const rabbitOutfit = rabbitState?.currentOutfit ?? "none";

  const handleComplete = useCallback(() => {
    setPhase("done");
  }, []);

  const handleReset = () => {
    setSelectedExercise(null);
    setPhase("idle");
  };

  if (phase === "done") {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <div className="flex flex-col items-center py-8 gap-4">
          <RabbitMascot
            mood="celebrating"
            message="You did it. Take a moment to notice how you feel now."
            size="md"
            level={rabbitLevel}
            outfit={rabbitOutfit}
          />
          <p className="text-sm opacity-60 text-center max-w-xs">
            Remember, you can come back here anytime things feel like too much.
          </p>
          <button
            onClick={handleReset}
            className="btn bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  if (selectedExercise && phase === "active") {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-bold">{EXERCISES[selectedExercise].title}</h1>
        </div>

        <div className="flex justify-center">
          <RabbitMascot
            mood="encouraging"
            message="I'm right here with you. Just follow along."
            size="sm"
            level={rabbitLevel}
            outfit={rabbitOutfit}
          />
        </div>

        <div className="p-6 rounded-3xl bg-primary/5">
          {selectedExercise === "breathing" && <BoxBreathing onComplete={handleComplete} />}
          {selectedExercise === "54321" && <FiveForThreeTwoOne onComplete={handleComplete} />}
          {selectedExercise === "bodyscan" && <BodyScan onComplete={handleComplete} />}
        </div>

        <div className="text-center">
          <button
            onClick={handleReset}
            className="text-sm text-primary/60 hover:text-primary transition-colors"
          >
            Stop early
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">Grounding</h1>
        <p className="text-sm opacity-60">For when everything feels like too much</p>
      </div>

      <div className="flex justify-center">
        <RabbitMascot
          mood="encouraging"
          message="Hey, let's pause for a moment. Which one feels right?"
          size="sm"
          level={rabbitLevel}
          outfit={rabbitOutfit}
        />
      </div>

      <div className="space-y-3">
        {(Object.entries(EXERCISES) as [Exercise, typeof EXERCISES[Exercise]][]).map(([key, ex]) => (
          <button
            key={key}
            onClick={() => {
              setSelectedExercise(key);
              setPhase("active");
            }}
            className="w-full p-4 rounded-2xl bg-primary/5 hover:bg-primary/10 transition-colors text-left flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
              {ex.icon}
            </div>
            <div>
              <div className="font-semibold">{ex.title}</div>
              <div className="text-sm opacity-60">{ex.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
