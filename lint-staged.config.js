/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
	"src/**/*.{js,ts,jsx,tsx,css,svelte}": ["prettier --write", "eslint --fix"],
	"*.{js,ts,jsx,tsx,css,svelte}": ["prettier --write", "eslint --fix"],
	"*.{json,md}": ["prettier --write"]
}
