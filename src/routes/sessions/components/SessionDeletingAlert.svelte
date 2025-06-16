<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js"
	import { TriangleAlert, Home } from "@lucide/svelte"

	interface SessionData {
		quiz: {
			title: string | null
		}
		code: string
	}

	let { session }: { session: SessionData } = $props()
</script>

<div class="flex min-h-[60vh] flex-col items-center justify-center space-y-8">
	<div class="space-y-4 text-center">
		<div class="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-200 dark:bg-red-400/20">
			<TriangleAlert class="h-10 w-10 text-red-600 dark:text-red-400" />
		</div>
		<div class="space-y-2">
			<h1 class="text-4xl font-bold tracking-tight">Session No Longer Available</h1>
			<p class="text-muted-foreground text-xl">This quiz session is being removed</p>
		</div>
	</div>

	<div class="bg-card text-card-foreground w-full max-w-2xl rounded-lg border shadow-sm">
		<div class="flex items-center gap-4 p-6">
			<div class="space-y-2">
				<h3 class="font-semibold">What happened?</h3>
				<div class="text-muted-foreground space-y-2 text-sm">
					<p>
						The quiz session "<strong class="text-foreground">{session.quiz.title || "Untitled Quiz"}</strong>" (Code: <code class="bg-muted rounded px-1 py-0.5 font-mono">{session.code}</code>) has been marked for deletion by the host.
					</p>
				</div>
			</div>
		</div>
	</div>

	<Button href="/dashboard" class="gap-2">
		<Home class="h-4 w-4" />
		Go to Dashboard
	</Button>
</div>
