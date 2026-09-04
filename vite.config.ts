import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/velaris-agents-clone/",
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
});
