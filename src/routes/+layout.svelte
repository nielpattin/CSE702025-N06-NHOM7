<script lang="ts">
	import "../app.css"
	import { page } from "$app/state"
	import { ModeWatcher } from "mode-watcher"
	let { children } = $props()
</script>

<ModeWatcher track={false} defaultMode="dark" />
{@render children()}

{#if page.url.pathname === "/"}
	<footer>
		<p>&copy; 2025 Quiz Learn</p>
	</footer>
{/if}

<style>
	footer {
		padding: 1rem;
		text-align: center;
		background-color: #1a202c; /* Gray-800 */
		color: #cbd5e0; /* Gray-300 */
		margin-top: auto;
	}
</style>
