import { useState, useEffect } from "react";
import { RabbitMascot } from "@/components/rabbit-mascot";
import type { RabbitMood } from "@/components/rabbit-mascot";

const TRANSITION_MESSAGES: Array<{ message: string; mood: RabbitMood }> = [
  { message: "Nice work on that! Take a breath before the next one.", mood: "celebrating" },
  { message: "Done! Want to stretch for a sec before moving on?", mood: "happy" },
  { message: "Another one down! You're building momentum.", mood: "celebrating" },
  { message: "Great job! Ready to shift gears?", mood: "happy" },
  { message: "That's done! Take a sip of water before the next one.", mood: "encouraging" },
  { message: "Look at you go! What's next on the list?", mood: "celebrating" },
  { message: "One more thing checked off. Nice and steady.", mood: "happy" },
  { message: "You finished that! Wiggle your fingers, then let's go.", mood: "happy" },
];

interface TransitionPromptProps {
  show: boolean;
  onDismiss: () => void;
}

export function TransitionPrompt({ show, onDismiss }: TransitionPromptProps) {
  const [message, setMessage] = useState(TRANSITION_MESSAGES[0]);

  useEffect(() => {
    if (show) {
      const randomIndex = Math.floor(Math.random() * TRANSITION_MESSAGES.length);
      setMessage(TRANSITION_MESSAGES[randomIndex]);

      // Auto-dismiss after 4 seconds
      const timer = setTimeout(onDismiss, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  if (!show) return null;

  return (
    <div
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300"
      onClick={onDismiss}
    >
      <div className="bg-white rounded-2xl shadow-lg border border-primary/10 p-3 max-w-xs cursor-pointer">
        <RabbitMascot
          mood={message.mood}
          message={message.message}
          size="sm"
        />
      </div>
    </div>
  );
}
