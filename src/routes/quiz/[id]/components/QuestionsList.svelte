<script lang="ts">
	import { Heading, P } from "flowbite-svelte"
	import QuestionCard from "./QuestionCard.svelte"
	import type { PageData } from "../$types"

	let { quiz, isOwner } = $props<{ quiz: PageData["quiz"]; isOwner: PageData["isOwner"] }>()
</script>

<div class="border-border bg-card rounded-lg border p-6 backdrop-blur" style="background-color: var(--card) !important;">
	<Heading tag="h2" class="text-foreground mb-6 text-xl font-semibold">
		Questions ({quiz.questions?.length || 0})
	</Heading>

	{#if quiz.questions && quiz.questions.length > 0}
		<div class="space-y-4">
			{#each quiz.questions as question, index (question.id)}
				<QuestionCard {question} {index} />
			{/each}
		</div>
	{:else}
		<div class="py-12 text-center">
			<div class="bg-card mx-auto mb-4 h-16 w-16 rounded-full p-4" style="background-color: var(--card) !important;">
				<svg class="text-muted-foreground h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
			</div>
			<Heading tag="h3" class="text-foreground mb-2 text-lg font-medium">No questions yet</Heading>
			<P class="text-muted-foreground">
				This quiz doesn't have any questions yet.
				{#if isOwner}
					<a href="/quiz/edit/{quiz.id}" class="text-primary hover:text-primary/80 underline"> Add some questions </a>
					to get started.
				{/if}
			</P>
		</div>
	{/if}
</div>
