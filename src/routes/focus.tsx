import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { RabbitMascot } from "@/components/rabbit-mascot";
import { useRabbitState } from "@/hooks/use-rabbit";
import { addRabbitXP } from "@/lib/db";
import { useQueryClient } from "@tanstack/react-query";
import type { RabbitLevel } from "@/lib/types";
import type { RabbitMood } from "@/components/rabbit-mascot";

export const Route = createFileRoute("/focus")({
  component: FocusPage,
});

type TimerPhase = "idle" | "focus" | "break" | "longBreak";

interface TimerPreset {
  label: string;
  focusMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLong: number;
}

const PRESETS: TimerPreset[] = [
  { label: "Classic", focusMinutes: 25, breakMinutes: 5, longBreakMinutes: 15, sessionsBeforeLong: 4 },
  { label: "Short Sprint", focusMinutes: 15, breakMinutes: 3, longBreakMinutes: 10, sessionsBeforeLong: 4 },
  { label: "Deep Focus", focusMinutes: 45, breakMinutes: 10, longBreakMinutes: 20, sessionsBeforeLong: 3 },
];

const FOCUS_MESSAGES: string[] = [
  "I'm right here with you. You've got this!",
  "One nibble at a time... you're doing great.",
  "Shh, we're in the zone together.",
  "You're focused and I'm so proud!",
  "Just you and me — let's crush this.",
  "Deep breaths. You're making progress.",
];

const BREAK_MESSAGES: string[] = [
  "Nice work! Stretch those legs!",
  "Brain recharge time! You earned it.",
  "Take a breather — you did amazing.",
  "Rest is part of the process!",
  "Wiggle break! Move around a bit.",
];

const COMPLETE_MESSAGES: string[] = [
  "You finished a whole session! Champion!",
  "Look at you being all productive!",
  "That was incredible! Another one?",
  "Your focus muscles are getting stronger!",
];

function getPhaseMessage(phase: TimerPhase, completedSessions: number): string {
  if (phase === "idle") {
    if (completedSessions > 0) {
      return COMPLETE_MESSAGES[Math.floor(Math.random() * COMPLETE_MESSAGES.length)];
    }
    return "Ready to focus? Pick a timer and let's go!";
  }
  if (phase === "focus") {
    return FOCUS_MESSAGES[Math.floor(Math.random() * FOCUS_MESSAGES.length)];
  }
  return BREAK_MESSAGES[Math.floor(Math.random() * BREAK_MESSAGES.length)];
}

function getRabbitMood(phase: TimerPhase, completedSessions: number): RabbitMood {
  if (phase === "idle") return completedSessions > 0 ? "celebrating" : "waving";
  if (phase === "focus") return "encouraging";
  return "happy";
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function FocusPage() {
  const [preset, setPreset] = useState<TimerPreset>(PRESETS[0]);
  const [phase, setPhase] = useState<TimerPhase>("idle");
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [message, setMessage] = useState("Ready to focus? Pick a timer and let's go!");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { data: rabbitState } = useRabbitState();
  const queryClient = useQueryClient();

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startPhase = useCallback((newPhase: TimerPhase) => {
    clearTimer();
    let duration = 0;
    if (newPhase === "focus") duration = preset.focusMinutes * 60;
    else if (newPhase === "break") duration = preset.breakMinutes * 60;
    else if (newPhase === "longBreak") duration = preset.longBreakMinutes * 60;

    setPhase(newPhase);
    setTimeLeft(duration);
    setTotalTime(duration);
    setIsPaused(false);
    setMessage(getPhaseMessage(newPhase, completedSessions));
  }, [preset, completedSessions, clearTimer]);

  const handleStart = () => startPhase("focus");

  const handlePause = () => setIsPaused((p) => !p);

  const handleStop = () => {
    clearTimer();
    setPhase("idle");
    setTimeLeft(0);
    setTotalTime(0);
    setIsPaused(false);
    setMessage(getPhaseMessage("idle", completedSessions));
  };

  // Timer tick
  useEffect(() => {
    if (phase === "idle" || isPaused) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          // Phase completed
          if (phase === "focus") {
            const newCount = completedSessions + 1;
            setCompletedSessions(newCount);
            // Award XP for completing a focus session
            addRabbitXP(8).then(() => {
              queryClient.invalidateQueries({ queryKey: ["rabbit", "state"] });
            });
            // Decide next break type
            if (newCount % preset.sessionsBeforeLong === 0) {
              startPhase("longBreak");
            } else {
              startPhase("break");
            }
          } else {
            // Break ended, back to idle
            setPhase("idle");
            setMessage(getPhaseMessage("idle", completedSessions + 1));
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [phase, isPaused, clearTimer, completedSessions, preset, startPhase, queryClient]);

  // Rotate rabbit message every 45 seconds during focus
  useEffect(() => {
    if (phase !== "focus" || isPaused) return;
    const msgInterval = setInterval(() => {
      setMessage(getPhaseMessage("focus", completedSessions));
    }, 45000);
    return () => clearInterval(msgInterval);
  }, [phase, isPaused, completedSessions]);

  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  const rabbitMood = getRabbitMood(phase, completedSessions);
  const level = (rabbitState?.level ?? 1) as RabbitLevel;
  const outfit = rabbitState?.currentOutfit ?? "none";

  const phaseLabel =
    phase === "focus" ? "Focus Time" :
    phase === "break" ? "Short Break" :
    phase === "longBreak" ? "Long Break" : "";

  const phaseColor =
    phase === "focus" ? "var(--accent-warm-strong)" :
    phase === "break" || phase === "longBreak" ? "hsl(var(--success))" : "hsl(var(--primary))";

  return (
    <div className="mx-auto space-y-6 max-w-sm">
      <h1 className="text-2xl font-bold">Focus Timer</h1>

      {/* Preset selector */}
      {phase === "idle" && (
        <div className="flex gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setPreset(p)}
              className={cn(
                "flex-1 py-2 px-3 rounded-2xl text-sm font-medium transition-colors",
                preset.label === p.label
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/10 hover:bg-primary/20"
              )}
            >
              {p.label}
              <span className="block text-xs opacity-70 mt-0.5">{p.focusMinutes}m</span>
            </button>
          ))}
        </div>
      )}

      {/* Timer display */}
      <div className="relative flex flex-col items-center gap-4 p-8 rounded-4xl"
        style={{ background: "var(--accent-warm-subtle)" }}>

        {/* Phase label */}
        {phase !== "idle" && (
          <span className="text-sm font-semibold uppercase tracking-wider opacity-70"
            style={{ color: phaseColor }}>
            {phaseLabel}
          </span>
        )}

        {/* Circular progress + time */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Background circle */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-10" />
            {phase !== "idle" && (
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke={phaseColor}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className="transition-all duration-1000"
              />
            )}
          </svg>
          <span className="text-5xl font-bold tabular-nums">
            {phase === "idle" ? formatTime(preset.focusMinutes * 60) : formatTime(timeLeft)}
          </span>
        </div>

        {/* Rabbit body double */}
        <div className="flex flex-col items-center gap-2">
          <RabbitMascot
            mood={rabbitMood}
            message={message}
            size="md"
            level={level}
            outfit={outfit}
            animated
          />
        </div>

        {/* Session counter */}
        {completedSessions > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="opacity-60">Sessions today:</span>
            <div className="flex gap-1">
              {Array.from({ length: completedSessions }).map((_, i) => (
                <div key={i} className="w-2.5 h-2.5 rounded-full bg-success" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-center">
        {phase === "idle" ? (
          <button
            onClick={handleStart}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            Start Focusing
          </button>
        ) : (
          <>
            <button
              onClick={handlePause}
              className={cn(
                "px-6 py-3 rounded-full font-semibold transition-opacity",
                isPaused
                  ? "bg-success text-white hover:opacity-90"
                  : "bg-primary/10 hover:bg-primary/20"
              )}
            >
              {isPaused ? "Resume" : "Pause"}
            </button>
            <button
              onClick={handleStop}
              className="px-6 py-3 rounded-full font-semibold bg-primary/10 hover:bg-primary/20 transition-opacity"
            >
              Stop
            </button>
          </>
        )}
      </div>

      {/* Preset info when idle */}
      {phase === "idle" && (
        <div className="text-center text-sm opacity-60 space-y-1">
          <p>{preset.focusMinutes}m focus / {preset.breakMinutes}m break / {preset.longBreakMinutes}m long break</p>
          <p>Long break after every {preset.sessionsBeforeLong} sessions</p>
        </div>
      )}
    </div>
  );
}
