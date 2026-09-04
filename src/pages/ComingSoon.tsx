import { Link } from "react-router-dom";

export default function ComingSoon() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 px-8 py-16 text-center">
      <p className="text-[14px] text-muted-foreground">This detail view isn't part of the cloned page yet.</p>
      <Link to="/agents" className="text-[13px] font-medium text-primary hover:underline">
        Back to Agents
      </Link>
    </main>
  );
}
