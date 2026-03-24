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
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6 py-8">
      <div className="w-full max-w-2xl overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${page * 100}%)` }}
        >
          {/* === PAGE 1: Welcome with Photo === */}
          <div className="w-full shrink-0 flex flex-col items-center space-y-8">
            {/* Hero image */}
            <div className="relative w-full max-w-md h-80 rounded-3xl overflow-hidden shadow-2xl">
              {/* Image with dark overlay for text contrast */}
              <img
                src="/landing-bg.jpg"
                alt="Lush carrot field at harvest"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* Title and tagline with warmth */}
            <div className="space-y-3">
              <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                baajit
              </h1>
              <p className="text-lg font-medium text-amber-900">your little life companion</p>
              <p className="text-sm text-amber-700 opacity-80">For ADHD brains that work a little differently</p>
            </div>

            {/* Warm introduction box with rabbit beside it */}
            <div className="flex items-start gap-6 max-w-2xl px-4">
              {/* Rabbit on the left */}
              <div className="shrink-0 pt-2">
                <RabbitMascot mood="waving" size="lg" showBubble={false} animated />
              </div>

              {/* Text box on the right */}
              <div className="space-y-4 p-8 rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200/50 shadow-lg flex-1">
                <p className="text-base leading-relaxed text-gray-800 font-medium">
                  Hey there! I'm your rabbit buddy. I'm here to help you manage your day without the overwhelm — because you deserve a tool that gets how your brain actually works.
                </p>
                <p className="text-sm leading-relaxed text-gray-700">
                  No rigid systems. No judgment. Just gentle nudges, a little cheering, and the space to do things your own way.
                </p>
                <p className="text-xs text-amber-800 italic font-semibold">
                  "One nibble at a time."
                </p>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="btn bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-3 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              How it works →
            </button>
          </div>

          {/* === PAGE 2: Feature Flowchart === */}
          <div className="w-full shrink-0 flex flex-col items-center space-y-8">
            <div className="space-y-2 pt-4">
              <h2 className="text-4xl font-black bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
                Your daily flow
              </h2>
              <p className="text-sm text-amber-700">A gentle path through your day</p>
            </div>

            {/* Garden trail flowchart with warmth */}
            <div className="relative w-full max-w-sm px-4">
              {/* Dotted trail line with warm color */}
              <svg
                className="absolute left-[40px] top-[40px] h-[calc(100%-80px)]"
                width="4"
                style={{ overflow: "visible" }}
              >
                <line
                  x1="2" y1="0" x2="2" y2="100%"
                  stroke="#d4a574"
                  strokeWidth="2.5"
                  strokeDasharray="8 4"
                  opacity="0.6"
                />
              </svg>

              {/* Steps */}
              <div className="relative space-y-5">
                {FLOW_STEPS.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.label}
                      className="flex items-center gap-4 relative"
                    >
                      {/* Circle icon with warm colors */}
                      <div
                        className="shrink-0 w-16 h-16 rounded-full flex items-center justify-center shadow-md relative z-10 font-bold text-white transition-transform hover:scale-110"
                        style={{
                          background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)`,
                          boxShadow: `0 4px 20px ${step.color}40`,
                        }}
                      >
                        <Icon size={28} weight="duotone" />
                      </div>

                      {/* Label with better contrast */}
                      <div className="text-left flex-1">
                        <p className="text-sm font-bold text-gray-800">{step.label}</p>
                        <p className="text-xs text-gray-600">{step.desc}</p>
                      </div>

                      {/* Step number */}
                      <span className="text-xs font-bold bg-amber-100 text-amber-800 shrink-0 w-7 h-7 flex items-center justify-center rounded-full">
                        {i + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-sm text-gray-700 italic max-w-sm leading-relaxed px-4">
              No strict order. Skip what you don't need. <strong>Baajit adapts to you</strong> — not the other way around.
            </p>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleBack}
                className="px-6 py-3 rounded-full font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleStart}
                className="btn bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Let's go! 🐰
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dot indicators with warmth */}
      <div className="flex gap-3 mt-12">
        {[0, 1].map((i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className="transition-all duration-300 rounded-full"
            style={{
              width: page === i ? 28 : 10,
              height: 10,
              backgroundColor: page === i ? "#d4a574" : "#d4a574",
              opacity: page === i ? 1 : 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );
}
