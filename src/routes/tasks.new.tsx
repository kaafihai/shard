import { createFileRoute, useRouter } from "@tanstack/react-router";
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
  const {history} = useRouter();

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          history.back()
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
