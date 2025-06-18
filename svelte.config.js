import adapter from "@sveltejs/adapter-node"
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte"

const config = {
	preprocess: vitePreprocess(),
	kit: { adapter: adapter() }
	// onwarn: (warning, handler) => {
	// 	if (warning.code.includes("a11y")) return
	// 	handler(warning)
	// }
}

export default config
