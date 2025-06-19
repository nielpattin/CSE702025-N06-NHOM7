<script lang="ts">
	import AppHeader from "$lib/components/AppHeader.svelte"
	import { page } from "$app/state"

	let { children } = $props()

	const title = $derived(page.url.pathname.includes("/edit/") ? "Edit Quiz" : "Quiz Dashboard")
</script>

<div class=" bg-background min-h-screen">
	<AppHeader {title} />
	<main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		{@render children()}
	</main>
</div>
