import { Sparkles, Search, Plus, CircleHelp, Gauge, Bell } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Copilot", href: null },
  { label: "Agents", href: "/agents", badge: "Beta" },
  { label: "Cockpit", href: null },
  { label: "AI Command Center", href: null },
];

export default function Header() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-1 border-b border-border bg-card px-4">
      <span className="text-[15px] font-semibold tracking-tight">Command Center</span>
      <span className="mx-3 h-5 w-px bg-border" />
      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href && location.pathname.startsWith(item.href);
          if (!item.href) {
            return (
              <button
                key={item.label}
                type="button"
                className="rounded-md px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </button>
            );
          }
          return (
            <Link
              key={item.label}
              to={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex items-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
              {item.badge && (
                <span className="rounded bg-danger-soft px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-danger">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <span className="absolute inset-x-2 -bottom-[9px] h-0.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          className="mr-1 flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-[13px] font-medium text-primary"
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI Copilot
        </button>
        <IconButton icon={<Search className="h-[18px] w-[18px]" />} />
        <IconButton icon={<Plus className="h-[18px] w-[18px]" />} />
        <IconButton icon={<CircleHelp className="h-[18px] w-[18px]" />} />
        <IconButton icon={<Gauge className="h-[18px] w-[18px]" />} />
        <button
          type="button"
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            3
          </span>
        </button>
      </div>
    </header>
  );
}

function IconButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button
      type="button"
      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {icon}
    </button>
  );
}
