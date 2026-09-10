import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		environment: "node",
		include: ["src/**/*.{test,spec}.{ts,tsx}"],
		coverage: {
			provider: "v8",
			reporter: ["text", "lcov"],
			// Only pure logic is covered today. Widen as component tests land.
			include: ["src/lib/**/*.ts", "src/schemas/**/*.ts"],
		},
	},
});
