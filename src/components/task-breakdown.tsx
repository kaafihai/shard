import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RabbitMascot } from "@/components/rabbit-mascot";
import { useCreateTask } from "@/hooks/use-tasks";
import { AddIcon, DeleteIcon } from "@/lib/icons";
import type { Task } from "@/lib/types";

interface TaskBreakdownProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COACH_MESSAGES = [
  { message: "What's the very first tiny thing you'd need to do?", mood: "encouraging" as const },
  { message: "Nice! What comes right after that?", mood: "happy" as const },
  { message: "You're on a roll! What's next?", mood: "celebrating" as const },
  { message: "Almost there! Any more steps?", mood: "happy" as const },
  { message: "That's a solid plan! Ready to save?", mood: "celebrating" as const },
];

export function TaskBreakdown({ task, open, onOpenChange }: TaskBreakdownProps) {
  const [steps, setSteps] = useState<string[]>([""]);
  const [currentInput, setCurrentInput] = useState("");
  const [saved, setSaved] = useState(false);
  const createTask = useCreateTask();

  const coachIndex = Math.min(steps.filter(s => s.trim()).length, COACH_MESSAGES.length - 1);
  const coach = COACH_MESSAGES[coachIndex];

  const handleAddStep = () => {
    if (currentInput.trim()) {
      setSteps([...steps.filter(s => s.trim()), currentInput.trim(), ""]);
      setCurrentInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddStep();
    }
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const validSteps = steps.filter(s => s.trim());
    if (validSteps.length === 0) return;

    for (let i = 0; i < validSteps.length; i++) {
      await createTask.mutateAsync({
        title: `${validSteps[i]}`,
        description: `Step ${i + 1} of: ${task.title}`,
        dueDate: task.dueDate,
        completedAt: null,
        archivedAt: null,
      });
    }

    setSaved(true);
    setTimeout(() => {
      onOpenChange(false);
      setSaved(false);
      setSteps([""]);
      setCurrentInput("");
    }, 1500);
  };

  const validSteps = steps.filter(s => s.trim());

  const handleClose = () => {
    onOpenChange(false);
    setSteps([""]);
    setCurrentInput("");
    setSaved(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Break It Down</DialogTitle>
          <DialogDescription className="line-clamp-1">
            {task.title}
          </DialogDescription>
        </DialogHeader>

        {saved ? (
          <div className="flex flex-col items-center py-6 gap-3">
            <RabbitMascot
              mood="celebrating"
              message={`Created ${validSteps.length} mini-tasks! You've got this!`}
              size="md"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Rabbit coach */}
            <RabbitMascot
              mood={coach.mood}
              message={coach.message}
              size="sm"
            />

            {/* Existing steps */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {steps.filter(s => s.trim()).map((step, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 rounded-xl bg-primary/5"
                >
                  <span className="text-xs font-bold text-primary/60 w-5 text-center">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-sm">{step}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    onClick={() => handleRemoveStep(index)}
                  >
                    <DeleteIcon className="size-3" />
                  </Button>
                </div>
              ))}
            </div>

            {/* New step input */}
            <div className="flex gap-2">
              <Input
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={validSteps.length === 0 ? "First tiny step..." : "Next step..."}
                autoFocus
              />
              <Button
                type="button"
                size="icon"
                onClick={handleAddStep}
                disabled={!currentInput.trim()}
              >
                <AddIcon className="size-4" />
              </Button>
            </div>

            <DialogFooter>
              <Button
                onClick={handleSave}
                disabled={validSteps.length === 0 || createTask.isPending}
                className="w-full"
              >
                {createTask.isPending
                  ? "Creating..."
                  : `Save ${validSteps.length} mini-task${validSteps.length !== 1 ? "s" : ""}`
                }
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
