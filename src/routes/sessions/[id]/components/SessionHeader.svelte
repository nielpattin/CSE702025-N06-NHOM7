<script lang="ts">
	let { title }: { title: string | null } = $props()
</script>

<svelte:head>
	<title>Manage Session - {title}</title>
</svelte:head>

<!-- Header -->
<header class="border-b border-gray-700 bg-gray-800/50 backdrop-blur">
	<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
		<div>
			<a href="/sessions" class="flex items-center gap-2 text-gray-400 transition-colors hover:text-gray-300">
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
				Back to Sessions
			</a>
		</div>

		<div class="mt-6">
			<h1 class="text-3xl font-bold text-white">Manage Quiz Session</h1>
			<p class="mt-2 text-gray-400">Configure your session settings before starting the quiz</p>
		</div>
	</div>
</header>
