import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { RabbitMascot } from "@/components/rabbit-mascot";
import { useRabbitState } from "@/hooks/use-rabbit";
import { useCreateTask } from "@/hooks/use-tasks";
import { addRabbitXP } from "@/lib/db";
import { useQueryClient } from "@tanstack/react-query";
import type { RabbitLevel } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export const Route = createFileRoute("/braindump")({
  component: BrainDumpPage,
});

type DumpCategory = "task" | "note" | "later" | null;

interface DumpItem {
  id: string;
  text: string;
  category: DumpCategory;
}

const DUMP_PROMPTS = [
  "Just let it all out. No rules, no structure.",
  "What's swirling around in your head right now?",
  "Type anything — we'll sort it later!",
  "Brain too full? Let's empty it together.",
  "No judgment here. Dump away!",
];

const SORT_MESSAGES = [
  "Nice dump! Now let's figure out what's what.",
  "Okay, let's tidy these up together!",
  "Time to sort! Tap each one to categorize it.",
  "Let's turn that brain chaos into a plan.",
];

const DONE_MESSAGES = [
  "All sorted! Your brain feels lighter already, right?",
  "Look at that — chaos to clarity! You're amazing.",
  "Tasks saved! Your future self will thank you.",
];

function BrainDumpPage() {
  const [mode, setMode] = useState<"dump" | "sort" | "done">("dump");
  const [items, setItems] = useState<DumpItem[]>([]);
  const [currentText, setCurrentText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { data: rabbitState } = useRabbitState();
  const createTask = useCreateTask();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [prompt] = useState(() => DUMP_PROMPTS[Math.floor(Math.random() * DUMP_PROMPTS.length)]);
  const [sortMessage] = useState(() => SORT_MESSAGES[Math.floor(Math.random() * SORT_MESSAGES.length)]);
  const [doneMessage] = useState(() => DONE_MESSAGES[Math.floor(Math.random() * DONE_MESSAGES.length)]);

  const level = (rabbitState?.level ?? 1) as RabbitLevel;
  const outfit = rabbitState?.currentOutfit ?? "none";

  // Auto-focus textarea
  useEffect(() => {
    if (mode === "dump" && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [mode]);

  const handleAddItem = () => {
    const trimmed = currentText.trim();
    if (!trimmed) return;

    // Split by newlines to capture multiple thoughts
    const lines = trimmed.split("\n").filter((l) => l.trim().length > 0);
    const newItems = lines.map((line) => ({
      id: uuidv4(),
      text: line.trim(),
      category: null as DumpCategory,
    }));

    setItems((prev) => [...prev, ...newItems]);
    setCurrentText("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey) {
      e.preventDefault();
      handleAddItem();
    }
  };

  const handleStartSorting = () => {
    if (items.length === 0) return;
    setMode("sort");
  };

  const handleCategorize = (id: string, category: DumpCategory) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, category: item.category === category ? null : category } : item
      )
    );
  };

  const handleSaveTasks = async () => {
    const taskItems = items.filter((i) => i.category === "task");

    for (const item of taskItems) {
      createTask.mutate({
        title: item.text,
        description: "",
        dueDate: null,
        completedAt: null,
        archivedAt: null,
      });
    }

    // Award XP for brain dumping
    if (items.length > 0) {
      await addRabbitXP(4);
      queryClient.invalidateQueries({ queryKey: ["rabbit", "state"] });
    }

    setMode("done");
  };

  const handleReset = () => {
    setItems([]);
    setCurrentText("");
    setMode("dump");
  };

  const categorizedCount = items.filter((i) => i.category !== null).length;
  const taskCount = items.filter((i) => i.category === "task").length;
  const noteCount = items.filter((i) => i.category === "note").length;
  const laterCount = items.filter((i) => i.category === "later").length;

  return (
    <div className="mx-auto space-y-6 max-w-sm">
      <h1 className="text-2xl font-bold">Brain Dump</h1>

      {/* === DUMP MODE === */}
      {mode === "dump" && (
        <>
          <div className="p-4 rounded-3xl" style={{ background: "var(--accent-warm-subtle)" }}>
            <RabbitMascot
              mood="encouraging"
              message={prompt}
              size="sm"
              level={level}
              outfit={outfit}
              animated
            />
          </div>

          {/* Dumped items so far */}
          {items.length > 0 && (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-3 bg-primary/8 rounded-2xl"
                >
                  <span className="text-sm flex-1">{item.text}</span>
                  <button
                    onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                    className="text-xs opacity-40 hover:opacity-70 shrink-0"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input area */}
          <div className="space-y-3">
            <textarea
              ref={textareaRef}
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your thoughts... one per line, or all at once"
              className="w-full min-h-[120px] p-4 rounded-2xl bg-primary/5 border-none resize-none text-sm placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddItem}
                disabled={!currentText.trim()}
                className={cn(
                  "flex-1 py-3 rounded-full font-semibold transition-opacity",
                  currentText.trim()
                    ? "bg-primary/10 hover:bg-primary/20"
                    : "bg-primary/5 opacity-40"
                )}
              >
                Add {currentText.includes("\n") ? "Thoughts" : "Thought"}
              </button>
              {items.length > 0 && (
                <button
                  onClick={handleStartSorting}
                  className="flex-1 py-3 rounded-full font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Sort ({items.length})
                </button>
              )}
            </div>
            <p className="text-xs opacity-40 text-center">⌘ + Enter to add quickly</p>
          </div>

          {/* Explainer */}
          <div className="p-4 rounded-2xl bg-primary/5 space-y-2">
            <p className="text-xs font-semibold opacity-50">How Brain Dump works</p>
            <p className="text-xs leading-relaxed opacity-40">
              Type whatever is on your mind — one thought per line, or all at once.
              When you're done dumping, tap Sort to categorize each thought as a Task,
              a Dump, or something for Later. Tasks get added to your task list automatically.
              Dumps and Later items are just for clearing your head — they won't be saved anywhere,
              and that's the point.
            </p>
          </div>
        </>
      )}

      {/* === SORT MODE === */}
      {mode === "sort" && (
        <>
          <div className="p-4 rounded-3xl" style={{ background: "var(--accent-warm-subtle)" }}>
            <RabbitMascot
              mood="happy"
              message={sortMessage}
              size="sm"
              level={level}
              outfit={outfit}
              animated
            />
          </div>

          <p className="text-sm opacity-60 text-center">
            Tap a category for each thought. Tasks get added to your task list!
          </p>

          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="p-4 bg-primary/5 rounded-3xl space-y-3">
                <p className="text-sm font-medium">{item.text}</p>
                <div className="flex gap-2">
                  <CategoryButton
                    label="Task"
                    emoji="✓"
                    active={item.category === "task"}
                    color="bg-success/20 text-success"
                    onClick={() => handleCategorize(item.id, "task")}
                  />
                  <CategoryButton
                    label="Dump"
                    emoji="🗑️"
                    active={item.category === "note"}
                    color="bg-primary/20 text-primary"
                    onClick={() => handleCategorize(item.id, "note")}
                  />
                  <CategoryButton
                    label="Later"
                    emoji="💤"
                    active={item.category === "later"}
                    color="bg-primary/10 opacity-60"
                    onClick={() => handleCategorize(item.id, "later")}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Summary + save */}
          <div className="space-y-3">
            {categorizedCount > 0 && (
              <div className="flex justify-center gap-4 text-sm">
                {taskCount > 0 && <span className="text-success font-medium">{taskCount} task{taskCount !== 1 ? "s" : ""}</span>}
                {noteCount > 0 && <span className="text-primary font-medium">{noteCount} dump{noteCount !== 1 ? "s" : ""}</span>}
                {laterCount > 0 && <span className="opacity-60">{laterCount} for later</span>}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setMode("dump")}
                className="flex-1 py-3 rounded-full font-semibold bg-primary/10 hover:bg-primary/20"
              >
                Back
              </button>
              <button
                onClick={handleSaveTasks}
                className="flex-1 py-3 rounded-full font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Save {taskCount > 0 ? `${taskCount} Task${taskCount !== 1 ? "s" : ""}` : "& Done"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* === DONE MODE === */}
      {mode === "done" && (
        <div className="flex flex-col items-center gap-6 py-8">
          <RabbitMascot
            mood="celebrating"
            message={doneMessage}
            size="lg"
            level={level}
            outfit={outfit}
            animated
          />
          <div className="text-center space-y-1">
            {taskCount > 0 && (
              <p className="text-sm text-success font-medium">
                {taskCount} task{taskCount !== 1 ? "s" : ""} added to your list!
              </p>
            )}
            <p className="text-xs opacity-60">
              {items.length} thought{items.length !== 1 ? "s" : ""} processed
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-full font-semibold bg-primary/10 hover:bg-primary/20"
            >
              Dump Again
            </button>
            <button
              onClick={() => navigate({ to: "/" })}
              className="px-6 py-3 rounded-full font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              View Tasks
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryButton({
  label,
  emoji,
  active,
  color,
  onClick,
}: {
  label: string;
  emoji: string;
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 py-2 rounded-xl text-xs font-medium transition-all",
        active ? `${color} ring-2 ring-current` : "bg-primary/5 hover:bg-primary/10"
      )}
    >
      {emoji} {label}
    </button>
  );
}
