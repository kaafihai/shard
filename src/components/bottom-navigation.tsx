import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarIcon,
  PlusIcon,
  CheckCircleIcon,
  ChartBarIcon,
  PersonIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItemLink,
} from "./ui/dropdown-menu";

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { to: "/", icon: CheckCircleIcon, },
  { to: "/calendar", icon: CalendarIcon, },
  { to: "/dashboard", icon: ChartBarIcon,},
  { to: "/profile", icon: PersonIcon,},
];

export function BottomNavigation() {

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background z-10 border-t border-border">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-around relative">
          {navItems.slice(0, 2).map((item) => (
            <NavLink
              key={item.to}
              item={item}
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
            </DropdownMenuContent>
          </DropdownMenu>

          {navItems.slice(2).map((item) => (
            <NavLink
              key={item.to}
              item={item}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

interface NavLinkProps {
  item: NavItem;
}

function NavLink({ item }: NavLinkProps) {
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      className={cn(
        "btn p-4",
      )}
      activeProps={
        {
          className: "text-primary"
        }
      }
      inactiveProps={
        {
          className: 'btn--ghost text-muted-foreground hover:text-foreground'
        }
      }
    >
      <Icon className="size-6" />
    </Link>
  );
}
