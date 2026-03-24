import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { RabbitMascot } from "@/components/rabbit-mascot";
import { CarrotFieldBackground } from "@/components/garden-scene";
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
  { icon: CheckCircleIcon, label: "Baajit Tasks", desc: "Bite-sized, your pace", color: "#7aaccc" },
  { icon: TimerIcon, label: "Focus Timer", desc: "Pick a time, press go", color: "#c8a0d8" },
  { icon: BrainIcon, label: "Brain Dump", desc: "Empty your head safely", color: "#d8a8a0" },
  { icon: HouseIcon, label: "Dashboard", desc: "Your rabbit cheers you on", color: "#c8b888" },
];

function WelcomePage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const handleStart = useCallback(() => {
    localStorage.setItem("baajit_welcomed", "true");
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
            <div className="relative w-80 h-64 rounded-3xl overflow-hidden">
              <CarrotFieldBackground />
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-28 h-28">
                <RabbitMascot mood="waving" size="lg" showBubble={false} animated />
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tight">baajit</h1>
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
              Skip any step, do them in any order. Baajit adapts to you, not the other way around.
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
