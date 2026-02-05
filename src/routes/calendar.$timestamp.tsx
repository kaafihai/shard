import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMoodByDate } from "@/hooks/use-moods";
import { useTasksByCompletedAt, useTasksByDueDate } from "@/hooks/use-tasks";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import {
  MoodGoodIcon,
  MoodBadIcon,
  MoodOkayIcon,
  MoodTerribleIcon,
  MoodGreatIcon,
  CompletedIcon,
  DateIcon,
} from "@/lib/icons";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar/$timestamp")({
  component: CalendarDayComponent,
});

const moodIcons = {
  great: MoodGreatIcon,
  good: MoodGoodIcon,
  okay: MoodOkayIcon,
  bad: MoodBadIcon,
  terrible: MoodTerribleIcon,
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
  const { data: tasks = [], isLoading: isTasksLoading } =
    useTasksByCompletedAt(date);
  const { data: dueTasks = [], isLoading: isDueTasksLoading } =
    useTasksByDueDate(date);

  const completedTasks = tasks.filter((task: Task) => task.completedAt);
  const isLoading = isMoodLoading || isTasksLoading || isDueTasksLoading;

  // Helper to determine if a date is in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0);
  const isOverdue = selectedDate < today;

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
              <h3 className="text-sm font-medium">Mood</h3>
              {mood ? (
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-2xl">
                  {(() => {
                    const Icon = moodIcons[mood.mood];
                    return <Icon className="size-8" weight="fill" />;
                  })()}
                  <div className="flex-1">
                    <p className="font-medium">{moodLabels[mood.mood]}</p>
                    {mood.note && <p className="text-sm mt-1">{mood.note}</p>}
                  </div>
                </div>
              ) : (
                <p className="text-sm italic">No mood tracked for this day</p>
              )}
            </div>

            {/* Due on this day Section */}
            {dueTasks.filter((task: Task) => !task.completedAt && !task.archivedAt).length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">
                  Due on this day ({dueTasks.filter((task: Task) => !task.completedAt && !task.archivedAt).length})
                </h3>
                <div className="space-y-2">
                  {dueTasks
                    .filter((task: Task) => !task.completedAt && !task.archivedAt)
                    .map((task: Task) => (
                      <Link
                        key={task.id}
                        to="/tasks/$id/edit"
                        params={{ id: task.id }}
                        search={{ readonly: false }}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-2xl transition-colors",
                          isOverdue ? "bg-destructive/10 hover:bg-destructive/15" : "bg-amber-500/10 hover:bg-amber-500/15"
                        )}
                      >
                        <DateIcon
                          className={cn(
                            "size-5 mt-0.5",
                            isOverdue ? "text-destructive" : "text-amber-500"
                          )}
                          weight="fill"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{task.title}</p>
                          {task.description && (
                            <p className="text-sm mt-1">{task.description}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            )}

            {/* Completed Tasks Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">
                Completed Tasks ({completedTasks.length})
              </h3>
              {completedTasks.length > 0 ? (
                <div className="space-y-2">
                  {completedTasks.map((task: Task) => (
                    <Link
                      key={task.id}
                      to="/tasks/$id/edit"
                      params={{ id: task.id }}
                      search={{ readonly: true }}
                      className="flex items-start gap-3 p-3 bg-success/10 rounded-2xl hover:bg-success/15 transition-colors"
                    >
                      <CompletedIcon
                        className="size-5 mt-0.5 text-success"
                        weight="fill"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{task.title}</p>
                        {task.description && (
                          <p className="text-sm mt-1">{task.description}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm italic">No tasks completed on this day</p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
