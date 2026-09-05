import { Link } from "@tanstack/react-router";

/** Shared footer for standalone public pages (landing, contact) — not the authenticated app shell. */
export function SiteFooter() {
  return (
    <footer className="border-t border-border px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <span className="flex items-center gap-2">
          <img src="/logo-icon.png" alt="" className="size-6" />
          <span className="text-sm font-semibold text-foreground">Emtech Digital Academy</span>
        </span>
        <Link to="/contact" className="text-xs text-muted-foreground hover:text-foreground">
          Contact us
        </Link>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Emtech Digital Academy. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
