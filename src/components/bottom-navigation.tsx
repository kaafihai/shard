import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarIcon,
  CompletedIcon,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { User } from "@phosphor-icons/react";

export function BottomNavigation() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const isCalendarActive = currentPath.startsWith("/calendar");
  const isTasksActive = currentPath === "/" || currentPath === "/archive";
  const isProfileActive = currentPath.startsWith("/dashboard");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-border">
      <div className="absolute inset-0 bg-white -z-10"></div>
      <div className="absolute inset-0 bg-primary/10 -z-10"></div>
      <div className="max-w-4xl mx-auto px-4 py-1 relative">
        <div className="grid grid-cols-3 items-center relative">
          {/* Calendar */}
          <div className="flex items-center justify-center">
            <Link
              to="/calendar"
              className={cn("btn p-2 flex flex-col items-center gap-1", isCalendarActive ? "text-primary" : "btn--ghost")}
            >
              <CalendarIcon className="size-6" />
              {isCalendarActive && <span className="text-xs">Calendar</span>}
            </Link>
          </div>

          {/* Tasks */}
          <div className="flex items-center justify-center">
            <Link
              to="/"
              className={cn("btn p-2 flex flex-col items-center gap-1", isTasksActive ? "text-primary" : "btn--ghost")}
            >
              <CompletedIcon className="size-6" />
              {isTasksActive && <span className="text-xs">My Tasks</span>}
            </Link>
          </div>

          {/* User / Dashboard */}
          <div className="flex items-center justify-center">
            <Link
              to="/dashboard"
              className={cn("btn p-2 flex flex-col items-center gap-1", isProfileActive ? "text-primary" : "btn--ghost")}
            >
              <User className="size-6" />
              {isProfileActive && <span className="text-xs">Profile</span>}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
