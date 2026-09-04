import {
  LayoutGrid,
  MessageSquare,
  Network,
  Layers,
  Users,
  CircleDot,
  ChevronDown,
  DollarSign,
  Share2,
  Boxes,
  Bug,
  PanelsTopLeft,
  SlidersHorizontal,
  Rows3,
  Minus,
  Gauge,
  PenLine,
} from "lucide-react";
import { Link } from "react-router-dom";

function RailButton({ icon, small }: { icon: React.ReactNode; small?: boolean }) {
  return (
    <button
      type="button"
      className={
        small
          ? "flex h-7 w-9 items-center justify-center rounded-lg text-muted-foreground/60 hover:bg-muted"
          : "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
      }
    >
      {icon}
    </button>
  );
}

function Divider() {
  return <div className="my-2 h-px w-7 bg-border" />;
}

export default function Sidebar() {
  const iconClass = "h-[18px] w-[18px]";

  return (
    <aside className="sticky top-0 hidden h-screen w-14 shrink-0 flex-col items-center border-r border-border bg-rail py-3 lg:flex">
      <Link
        to="/agents"
        className="mb-3 flex h-8 w-8 items-center justify-center"
        aria-current="page"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7" aria-label="Velaris">
          <path d="M3 4h18L12 21 3 4z" fill="oklch(0.52 0.19 275)" />
          <path d="M12 21 21 4h-6l-3 17z" fill="oklch(0.62 0.2 15)" />
        </svg>
      </Link>

      <div className="flex flex-col items-center gap-1">
        <RailButton icon={<LayoutGrid className={iconClass} />} />
        <RailButton icon={<MessageSquare className={iconClass} />} />
      </div>

      <Divider />

      <div className="flex flex-col items-center gap-1">
        <RailButton icon={<Network className={iconClass} />} />
        <RailButton icon={<Layers className={iconClass} />} />
        <RailButton icon={<Users className={iconClass} />} />
        <RailButton icon={<CircleDot className={iconClass} />} />
        <RailButton small icon={<ChevronDown className="h-4 w-4" />} />
      </div>

      <Divider />

      <div className="flex flex-col items-center gap-1">
        <RailButton icon={<DollarSign className={iconClass} />} />
        <RailButton icon={<Share2 className={iconClass} />} />
        <RailButton icon={<Boxes className={iconClass} />} />
        <RailButton icon={<Bug className={iconClass} />} />
        <RailButton icon={<PanelsTopLeft className={iconClass} />} />
        <RailButton icon={<SlidersHorizontal className={iconClass} />} />
        <RailButton icon={<Rows3 className={iconClass} />} />
        <RailButton icon={<Minus className={iconClass} />} />
        <RailButton icon={<Gauge className={iconClass} />} />
        <RailButton icon={<PenLine className={iconClass} />} />
      </div>

      <div className="mt-auto pt-3">
        <span className="block h-8 w-8 rounded-full bg-gradient-to-br from-muted to-border" />
      </div>
    </aside>
  );
}
