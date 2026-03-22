import { Outlet, createRootRoute, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { BottomNavigation } from "@/components/bottom-navigation";
import { RabbitAnimationStyles } from "@/components/rabbit-mascot";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const navigate = useNavigate();
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const isWelcomePage = currentPath === "/welcome";

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("nibble_welcomed");
    if (!hasSeenWelcome && currentPath !== "/welcome") {
      navigate({ to: "/welcome" });
    }
  }, [navigate, currentPath]);

  return (
    <>
      <RabbitAnimationStyles />
      <div className="min-h-dvh pt-12 bg-background pb-24">
        {!isWelcomePage && (
          <nav>
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link
                  to="/"
                  className="flex items-center gap-2 px-2 text-2xl font-black hover:opacity-80"
                >
                  nibble
                </Link>
              </div>
            </div>
          </nav>
        )}
        <main className="container mx-auto px-4 py-8">
          <Outlet />
        </main>
      </div>
      <BottomNavigation />
    </>
  );
}
