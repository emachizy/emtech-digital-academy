import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

/** Shared header for standalone public pages (landing, contact) — not the authenticated app shell. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo-icon.png" alt="Emtech Digital Academy" className="size-8" />
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Emtech Digital Academy
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground sm:flex">
          <Link to="/" hash="tracks" className="hover:text-foreground">
            Tracks
          </Link>
          <Link to="/" hash="why-us" className="hover:text-foreground">
            Why us
          </Link>
          <Link to="/contact" className="hover:text-foreground">
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/dashboard">Enter the platform</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
