import {
  Sparkles,
  Compass,
  Flame,
  Leaf,
  Waves,
  ShieldCheck,
  Wand2,
  Target,
  type LucideIcon,
} from "lucide-react";

export interface OrbPreset {
  id: string;
  label: string;
  from: string;
  to: string;
  icon: LucideIcon;
}

export const ORB_PRESETS: OrbPreset[] = [
  { id: "sunrise", label: "Sunrise", from: "#FFD08A", to: "#FF6B6B", icon: Sparkles },
  { id: "meadow", label: "Meadow", from: "#9BE8A8", to: "#12A16B", icon: Leaf },
  { id: "lagoon", label: "Lagoon", from: "#7FE0EE", to: "#2A82D6", icon: Waves },
  { id: "violet", label: "Violet", from: "#C3ADFF", to: "#6C3FE0", icon: Wand2 },
  { id: "amber", label: "Amber", from: "#FFDE6B", to: "#F2760C", icon: Flame },
  { id: "slate", label: "Slate", from: "#B7C1CC", to: "#4C5B6B", icon: ShieldCheck },
  { id: "mint", label: "Mint", from: "#A6F3DD", to: "#0FA37E", icon: Compass },
  { id: "coral", label: "Coral", from: "#FFB3B3", to: "#E8497A", icon: Target },
];

export function getOrbPreset(id?: string): OrbPreset {
  return ORB_PRESETS.find((p) => p.id === id) ?? ORB_PRESETS[0];
}

export default function OrbAvatar({
  presetId,
  size = 56,
  iconRatio = 0.42,
}: {
  presetId?: string;
  size?: number;
  iconRatio?: number;
}) {
  const preset = getOrbPreset(presetId);
  const Icon = preset.icon;
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${preset.from}, ${preset.to})`,
        boxShadow: "inset 0 -3px 6px rgba(0,0,0,0.18), inset 0 2px 3px rgba(255,255,255,0.35)",
      }}
    >
      <Icon
        className="text-white drop-shadow-sm"
        style={{ width: size * iconRatio, height: size * iconRatio }}
        strokeWidth={2.25}
      />
    </div>
  );
}
