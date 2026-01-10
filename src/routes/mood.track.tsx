import { createFileRoute, useNavigate } from "@tanstack/react-router";
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

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          navigate({ to: "/" });
        }
      }}
    >
      <DialogContent className="!top-auto !bottom-0 !left-0 !right-0 !translate-x-0 !translate-y-0 !max-w-none w-full rounded-t-4xl rounded-b-none data-open:slide-in-from-bottom data-closed:slide-out-to-bottom pb-safe">
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
