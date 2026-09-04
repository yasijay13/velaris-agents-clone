/**
 * Resolves a root-relative asset path (e.g. "/assets/foo.mp4") against Vite's
 * configured `base`, so files under `public/` still resolve once the app is
 * deployed under a sub-path (e.g. GitHub Pages' `/velaris-agents-clone/`).
 */
export function withBase(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}
