<script lang="ts">
	import "../app.css"
	import { page } from "$app/stores"

	let { children } = $props()
</script>

<div class="app">
	<main class="content">
		{@render children()}
	</main>

	{#if $page.url.pathname === "/"}
		<footer>
			<p>&copy; 2025 Quiz Learn</p>
		</footer>
	{/if}
</div>

<style>
	:global(html, body) {
		height: 100%;
		margin: 0;
		padding: 0;
		background-color: #1a202c; /* Gray-800 - same as footer */
	}

	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: #1a202c; /* Gray-800 */
	}

	.content {
		flex: 1;
	}

	footer {
		padding: 1rem;
		text-align: center;
		background-color: #1a202c; /* Gray-800 */
		color: #cbd5e0; /* Gray-300 */
		margin-top: auto;
	}
</style>
