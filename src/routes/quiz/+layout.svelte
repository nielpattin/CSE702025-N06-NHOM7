<script lang="ts">
	import AppHeader from "$lib/components/AppHeader.svelte"
	import { page } from "$app/state"

	let { children } = $props()

	const title = $derived(page.url.pathname.includes("/edit/") ? "Edit Quiz" : "Quiz Dashboard")
</script>

<div class=" min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
	<AppHeader {title} />
	<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		{@render children()}
	</main>
</div>
