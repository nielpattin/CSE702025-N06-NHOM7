<script lang="ts">
	import { page } from "$app/state"
	import type { Snippet } from "svelte"

	let { children } = $props()

	let data = $derived(page.data)
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
	<!-- Main Content -->
	<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		{@render children()}
	</main>
</div>
