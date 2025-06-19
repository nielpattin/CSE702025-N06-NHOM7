<script lang="ts">
	import { P } from "flowbite-svelte"
	import type { PageData } from "../$types"

	let { question, index } = $props<{ question: PageData["quiz"]["questions"][0]; index: number }>()
</script>

<div class="border-border bg-card hover:bg-secondary/70 rounded-lg border p-4 transition-colors">
	<div class="mb-3 flex items-start justify-between">
		<span class="bg-secondary text-muted-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
			Question {index + 1}
		</span>
		{#if question.points}
			<span class="bg-primary text-primary-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
				{question.points} pts
			</span>
		{/if}
	</div>
	<P class="text-foreground mb-2">{question.content}</P>
	{#if question.timeLimit}
		<div class="text-muted-foreground flex items-center text-xs">
			<svg class="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
				<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
			</svg>
			{question.timeLimit}s time limit
		</div>
	{/if}
</div>
