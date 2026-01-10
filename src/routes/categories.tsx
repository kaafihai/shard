import { GridFourIcon } from "@phosphor-icons/react/dist/ssr";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/categories")({
  component: CategoriesComponent,
});

function CategoriesComponent() {
  return (
    <div className="mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <GridFourIcon className="size-8" />
        <h2 className="text-3xl font-bold">Categories</h2>
      </div>
      <div className="text-center text-muted-foreground py-12">
        <p>Categories view coming soon</p>
      </div>
    </div>
  );
}
