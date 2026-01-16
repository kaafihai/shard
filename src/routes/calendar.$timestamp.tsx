import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMoodByDate } from "@/hooks/use-moods";
import { useTasksByCompletedAt } from "@/hooks/use-tasks";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import {
  SmileyIcon,
  SmileySadIcon,
  SmileyMehIcon,
  SmileyXEyesIcon,
  SmileyWinkIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";
import type { Task } from "@/lib/types";

export const Route = createFileRoute("/calendar/$timestamp")({
  component: CalendarDayComponent,
});

const moodIcons = {
  great: SmileyWinkIcon,
  good: SmileyIcon,
  okay: SmileyMehIcon,
  bad: SmileySadIcon,
  terrible: SmileyXEyesIcon,
};

const moodLabels = {
  great: "Great",
  good: "Good",
  okay: "Okay",
  bad: "Bad",
  terrible: "Terrible",
};

function CalendarDayComponent() {
  const navigate = useNavigate();
  const { timestamp } = Route.useParams();
  const date = new Date(parseInt(timestamp));

  const { data: mood, isLoading: isMoodLoading } = useMoodByDate(date);
  const { data: tasks = [], isLoading: isTasksLoading } = useTasksByCompletedAt(date);

  const completedTasks = tasks.filter((task: Task) => task.completedAt);
  const isLoading = isMoodLoading || isTasksLoading;

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          navigate({ to: "/calendar" });
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{format(date, "MMMM d, yyyy")}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Mood Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Mood
              </h3>
              {mood ? (
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-2xl">
                  {(() => {
                    const Icon = moodIcons[mood.mood];
                    return <Icon className="size-8" weight="fill" />;
                  })()}
                  <div className="flex-1">
                    <p className="font-medium">{moodLabels[mood.mood]}</p>
                    {mood.note && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {mood.note}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No mood tracked for this day
                </p>
              )}
            </div>

            {/* Completed Tasks Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Completed Tasks ({completedTasks.length})
              </h3>
              {completedTasks.length > 0 ? (
                <div className="space-y-2">
                  {completedTasks.map((task: Task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 bg-muted/50 rounded-2xl"
                    >
                      <CheckCircleIcon
                        className="size-5 mt-0.5"
                        weight="fill"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{task.title}</p>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No tasks completed on this day
                </p>
              )}
            </div>

            {/* All Tasks Section */}
            {tasks.length > completedTasks.length && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Other Tasks ({tasks.length - completedTasks.length})
                </h3>
                <div className="space-y-2">
                  {tasks
                    .filter((task: Task) => !task.completedAt)
                    .map((task: Task) => (
                      <div
                        key={task.id}
                        className="flex items-start gap-3 p-3 bg-muted/50 rounded-2xl"
                      >
                        <div className="size-5 border-2 border-muted-foreground rounded-full mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{task.title}</p>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
