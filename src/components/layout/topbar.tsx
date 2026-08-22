import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Flame, LogOut, Menu, Moon, PanelLeftClose, PanelLeftOpen, Sun, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";
import { initials } from "@/lib/utils";
import { GlobalSearch } from "./global-search";
import { NotificationsMenu } from "./notifications-menu";

export function Topbar({
  collapsed,
  onToggleCollapse,
  onOpenMobileNav,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobileNav: () => void;
}) {
  const { theme, toggleTheme, signOut, user } = useSession();
  const navigate = useNavigate();
  const { data: student } = useQuery({
    queryKey: ["student"],
    queryFn: api.getStudent,
    enabled: user?.role === "student",
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/85 px-3 backdrop-blur-md sm:px-5">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="hidden lg:inline-flex"
        onClick={onToggleCollapse}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
      </Button>

      <div className="flex-1">
        <GlobalSearch />
      </div>

      {student ? (
        <span className="hidden items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-3 py-1.5 text-xs font-semibold text-warning sm:inline-flex">
          <Flame className="size-3.5" />
          {student.streak} day streak
        </span>
      ) : null}

      <NotificationsMenu />

      <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="rounded-full outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
            aria-label="Account menu"
          >
            <Avatar className="size-9 border border-border">
              <AvatarFallback className="bg-primary-soft text-sm font-semibold text-primary">
                {user ? initials(user.fullName) : "?"}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <p className="text-sm font-semibold">{user?.fullName}</p>
            <p className="text-xs font-normal text-muted-foreground">{user?.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile">
              <User className="size-4" /> Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => {
              await signOut();
              navigate({ to: "/", replace: true });
            }}
          >
            <LogOut className="size-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
