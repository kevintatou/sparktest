import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: [
        "lib/**/*.ts",
        "app/api/**/*.ts", // API routes only
        "hooks/**/*.ts",
        "components/**/*.ts",
        "components/**/*.tsx",
        "utils/**/*.ts",
        "contexts/**/*.tsx",
      ],
      exclude: [
        "node_modules/",
        ".next/",
        "coverage/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/types/**",
        "lib/types.ts", // Type definitions only
        "lib/config.ts", // Simple configuration
        "lib/constants/**", // Constants only
        "lib/storage/storage.ts", // Interface definition only
        "hooks/use-toast.ts", // External library code
        "components/ui/**", // UI library components (shadcn/ui, etc.)
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@/packages": path.resolve(__dirname, "../../packages"),
    },
  },
})
