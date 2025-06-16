<script lang="ts">
	import { enhance, applyAction } from "$app/forms"
	import { Button } from "$lib/components/ui/button/index.js"
	import { Loader2, RotateCcw } from "@lucide/svelte"

	let isReattempting = $state(false)
</script>

<div class="bg-card text-card-foreground mx-auto max-w-md rounded-lg border shadow-sm">
	<div class="flex flex-col space-y-1.5 p-6 text-center">
		<h3 class="text-2xl leading-none font-semibold tracking-tight">Start New Attempt</h3>
		<p class="text-muted-foreground text-sm">Create a new attempt to retake this quiz</p>
	</div>
	<div class="p-6 pt-0">
		<form
			method="POST"
			action="?/reattempt"
			use:enhance={() => {
				isReattempting = true
				return async ({ result }) => {
					isReattempting = false
					await applyAction(result)
				}
			}}
		>
			<Button type="submit" disabled={isReattempting} variant="outline" class="w-full">
				{#if isReattempting}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					Starting...
				{:else}
					<RotateCcw class="mr-2 h-4 w-4" />
					Reattempt Quiz
				{/if}
			</Button>
		</form>
	</div>
</div>
