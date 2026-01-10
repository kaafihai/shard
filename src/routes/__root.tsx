import { Outlet, createRootRoute, Link } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { BottomNavigation } from "@/components/bottom-navigation";
export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <div className="min-h-screen bg-background pb-24">
        <nav>
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="text-2xl font-black hover:text-primary/80"
              >
                shard
              </Link>
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">
          <Outlet />
        </main>
      </div>
      <BottomNavigation />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
