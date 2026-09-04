import type { CustomAgent } from "../data/agents";
import MascotAvatar from "./MascotAvatar";
import OrbAvatar from "./OrbAvatar";
import WaveformAvatar from "./WaveformAvatar";

export default function AgentAvatar({
  agent,
  size = 44,
  seedIndex = 0,
}: {
  agent: CustomAgent;
  size?: number;
  seedIndex?: number;
}) {
  if (agent.avatarWaveform) {
    return <WaveformAvatar presetId={agent.avatarWaveform} size={size} />;
  }
  if (agent.avatarPreset) {
    return <OrbAvatar presetId={agent.avatarPreset} size={size} />;
  }
  return <MascotAvatar slug={agent.slug} size={size} seedIndex={seedIndex} />;
}
