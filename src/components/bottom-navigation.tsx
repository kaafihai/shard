import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarIcon,
  PlusIcon,
  GearSixIcon,
  GridFourIcon,
  CheckCircleIcon,
  NotePencilIcon,
  TagIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuItemLink,
} from "./ui/dropdown-menu";

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const navItems: NavItem[] = [
  { to: "/", icon: CheckCircleIcon, label: "Tasks" },
  { to: "/calendar", icon: CalendarIcon, label: "Calendar" },
  { to: "/categories", icon: GridFourIcon, label: "Categories" },
  { to: "/settings", icon: GearSixIcon, label: "Settings" },
];

export function BottomNavigation() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background z-10 border-t border-border">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-around relative">
          {navItems.slice(0, 2).map((item) => (
            <NavLink
              key={item.to}
              item={item}
              isActive={currentPath === item.to}
            />
          ))}

          {/* Add Button with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                slot="dropdown-menu-trigger"
                size={"icon"}
                variant={"default"}
                className="rounded-full"
              >
                <PlusIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="center" className="mb-2">
              <DropdownMenuItemLink to="/tasks/new">
                <CheckCircleIcon />
                <span>New Task</span>
              </DropdownMenuItemLink>
              <DropdownMenuItemLink to="/calendar">
                <CalendarIcon />
                <span>New Event</span>
              </DropdownMenuItemLink>
            </DropdownMenuContent>
          </DropdownMenu>

          {navItems.slice(2).map((item) => (
            <NavLink
              key={item.to}
              item={item}
              isActive={currentPath === item.to}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
}

function NavLink({ item, isActive }: NavLinkProps) {
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      className={cn(
        "btn btn--ghost",
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="size-6" />
    </Link>
  );
}
