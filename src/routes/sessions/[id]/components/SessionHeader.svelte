<script lang="ts">
	let { title }: { title: string | null } = $props()
</script>

<svelte:head>
	<title>Manage Session - {title}</title>
</svelte:head>

<!-- Header -->
<header class="border-border bg-card border-b backdrop-blur">
	<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
		<div>
			<a href="/sessions" class="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
				Back to Sessions
			</a>
		</div>

		<div class="mt-6">
			<h1 class="text-foreground text-3xl font-bold">Manage Quiz Session</h1>
			<p class="text-muted-foreground mt-2">Configure your session settings before starting the quiz</p>
		</div>
	</div>
</header>
