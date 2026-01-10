import { createFileRoute } from '@tanstack/react-router';
import { Grid3x3 } from 'lucide-react';

export const Route = createFileRoute('/categories')({
  component: CategoriesComponent,
});

function CategoriesComponent() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Grid3x3 className="h-8 w-8 text-primary" />
        <h2 className="text-3xl font-bold">Categories</h2>
      </div>
      <div className="text-center text-muted-foreground py-12">
        <p>Categories view coming soon...</p>
      </div>
    </div>
  );
}
