import { Link, useRouterState } from "@tanstack/react-router";
import { mobileNav } from "./nav-config";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      aria-label="Primary mobile navigation"
    >
      <ul className="grid grid-cols-5">
        {mobileNav.map((item) => {
          const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
          return (
            <li key={item.label}>
              <Link
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}