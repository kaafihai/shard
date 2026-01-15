import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MoodTrackerForm } from "@/components/mood-tracker-form";

export const Route = createFileRoute("/mood/track")({
  component: MoodTrackerComponent,
});

function MoodTrackerComponent() {
  const navigate = useNavigate();
  const {history} = useRouter();
  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          if(history.canGoBack()) {
            history.back()
          } else {
            navigate({ to: "/" });
          }
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Daily Mood Check-in</DialogTitle>
          <DialogDescription>
            Take a moment to reflect on how you're feeling
          </DialogDescription>
        </DialogHeader>
        <MoodTrackerForm />
      </DialogContent>
    </Dialog>
  );
}
