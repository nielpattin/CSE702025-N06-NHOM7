/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
	"src/**/*.{js,ts,jsx,tsx,svelte}": ["prettier --write", "eslint"],
	"*.{json,md}": ["prettier --write"]
}
