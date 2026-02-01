import { Link } from "@tanstack/react-router";
import {
  CalendarIcon,
  CheckCircleIcon,
  ChartBarIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { to: "/", icon: CheckCircleIcon },
  { to: "/calendar", icon: CalendarIcon },
  { to: "/dashboard", icon: ChartBarIcon },
];

export function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background z-10 border-t border-border">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-around relative">
          {navItems.map((item) => (
            <NavLink key={item.to} item={item} />
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
      className={cn("btn p-4")}
      activeProps={{
        className: "text-primary",
      }}
      inactiveProps={{
        className: "btn--ghost",
      }}
    >
      <Icon className="size-6" />
    </Link>
  );
}
