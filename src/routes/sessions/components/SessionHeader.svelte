<script lang="ts">
	import { Badge } from "$lib/components/ui/badge/index.js"

	interface SessionData {
		quiz: {
			title: string | null
			description?: string | null
		}
		code: string
		status: string
	}

	let { session }: { session: SessionData } = $props()
</script>

<div class="space-y-4 text-center">
	<div class="space-y-2">
		<h1 class="text-4xl font-bold tracking-tight">{session.quiz.title || "Untitled Quiz"}</h1>
		{#if session.quiz.description}
			<p class="text-muted-foreground text-xl">{session.quiz.description}</p>
		{/if}
	</div>

	<div class="bg-card text-card-foreground inline-block rounded-lg border shadow-sm">
		<div class="flex items-center gap-6 p-6">
			<div class="text-center">
				<p class="text-muted-foreground text-sm">Session Code</p>
				<p class="font-mono text-2xl font-bold">{session.code}</p>
			</div>
			<div class="bg-border h-12 w-px"></div>
			<div class="text-center">
				<p class="text-muted-foreground text-sm">Status</p>
				<Badge variant="secondary" class="capitalize">{session.status}</Badge>
			</div>
		</div>
	</div>
</div>
