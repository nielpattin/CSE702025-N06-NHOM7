<script lang="ts">
	import "../app.css"
	import { page } from "$app/state"
	import { ModeWatcher } from "mode-watcher"
	import * as Sidebar from "$lib/components/ui/sidebar"
	import AppSidebar from "$lib/components/AppSidebar.svelte"

	let { children } = $props()
	let data = $derived(page.data)
	let session = $derived(data.session)

	let shouldShowSidebar = $derived(session?.user && page.url.pathname !== "/" && page.url.pathname !== "/signin" && !page.url.pathname.startsWith("/join") && !page.url.pathname.startsWith("/play"))
</script>

<ModeWatcher track={false} defaultMode="dark" />

{#if shouldShowSidebar}
	<Sidebar.Provider>
		<AppSidebar />
		<Sidebar.Inset>
			{@render children()}
		</Sidebar.Inset>
	</Sidebar.Provider>
{:else}
	{@render children()}
	{#if page.url.pathname === "/"}
		<footer>
			<p>&copy; 2025 Quiz Learn</p>
		</footer>
	{/if}
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
