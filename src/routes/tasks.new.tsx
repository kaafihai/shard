import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskForm } from "@/components/task-form";

export const Route = createFileRoute("/tasks/new")({
  component: NewTaskComponent,
});

function NewTaskComponent() {
  const navigate = useNavigate();

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          navigate({ to: "/" });
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <TaskForm />
      </DialogContent>
    </Dialog>
  );
}
