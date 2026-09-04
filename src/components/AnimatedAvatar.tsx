import type { ExpertAgent } from "../data/experts";
import WebGLAvatar from "./WebGLAvatar";
import { COSMIC_CLOUD_FRAGMENT, HELIX_FRAGMENT, SINGULARITY_FRAGMENT } from "../webgl/shaders";
import { withBase } from "../lib/assetUrl";

const SHADER_SOURCE = {
  "cosmic-cloud": COSMIC_CLOUD_FRAGMENT,
  helix: HELIX_FRAGMENT,
  singularity: SINGULARITY_FRAGMENT,
} as const;

export default function AnimatedAvatar({ avatar }: { avatar: ExpertAgent["avatar"] }) {
  return (
    <span
      className="block shrink-0 overflow-hidden bg-black"
      style={{ width: 76, height: 76, borderRadius: 18 }}
    >
      {avatar.type === "video" ? (
        <video
          src={withBase(avatar.src)}
          loop
          autoPlay
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className="block h-full w-full object-cover"
        />
      ) : (
        <WebGLAvatar fragmentSource={SHADER_SOURCE[avatar.shader]} size={76} />
      )}
    </span>
  );
}
