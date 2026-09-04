import type { PoweredBy } from "../data/agents";
import WebGLAvatar from "./WebGLAvatar";
import { COSMIC_CLOUD_FRAGMENT, HELIX_FRAGMENT, SINGULARITY_FRAGMENT } from "../webgl/shaders";

const SHADER_SOURCE = {
  "cosmic-cloud": COSMIC_CLOUD_FRAGMENT,
  helix: HELIX_FRAGMENT,
  singularity: SINGULARITY_FRAGMENT,
} as const;

export default function PoweredByBadge({
  poweredBy,
  size = 26,
  className = "",
}: {
  poweredBy: PoweredBy;
  size?: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        className="block shrink-0 overflow-hidden rounded-full bg-black ring-1 ring-black/10"
        style={{ width: size, height: size }}
      >
        {poweredBy.avatar.type === "video" ? (
          <video
            src={poweredBy.avatar.src}
            loop
            autoPlay
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            className="block h-full w-full object-cover"
          />
        ) : (
          <WebGLAvatar fragmentSource={SHADER_SOURCE[poweredBy.avatar.shader]} size={size} />
        )}
      </span>
      <span className="truncate text-[12px] text-muted-foreground">
        Powered by {poweredBy.expertName}
      </span>
    </div>
  );
}
