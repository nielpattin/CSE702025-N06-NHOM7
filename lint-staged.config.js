/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
	"*.{js,ts,jsx,tsx,json,css,md,svelte}": ["prettier --write", "pnpm lint", "pnpm check"]
}
