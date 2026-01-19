import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    navigate({ to: "/" });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Mood Check-in</DialogTitle>
          <DialogDescription>
            Take a moment to reflect on how you're feeling
          </DialogDescription>
        </DialogHeader>
        <MoodTrackerForm onSuccess={handleClose} />
      </DialogContent>
    </Dialog>
  );
}
