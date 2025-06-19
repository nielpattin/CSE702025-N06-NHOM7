<script lang="ts">
	let { questions, formatQuestionType, visibleQuestions = [] } = $props()
</script>

<!-- Questions Tab Content -->
<div class="space-y-4">
	{#if questions.length === 0}
		<div class="py-12 text-center">
			<svg class="text-muted-foreground mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
			</svg>
			<h3 class="text-foreground mt-2 text-sm font-medium">No questions</h3>
			<p class="text-muted-foreground mt-1 text-sm">This session has no questions.</p>
		</div>
	{:else}
		{#each questions as question, index (question.id)}
			<div class="transform transition-all duration-500 ease-out {visibleQuestions.includes(index) ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}" style="transition-delay: {index * 50}ms">
				<div class="border-border bg-muted rounded-lg border p-4">
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<div class="mb-2 flex items-center space-x-2">
								<span class="inline-flex items-center rounded bg-blue-600 px-2 py-1 text-xs font-medium text-blue-100">
									Question {index + 1}
								</span>
								<span class="bg-muted text-muted-foreground inline-flex items-center rounded px-2 py-1 text-xs font-medium">
									{formatQuestionType(question.type)}
								</span>
								<span class="inline-flex items-center rounded bg-green-600 px-2 py-1 text-xs font-medium text-green-100">
									{question.points} pts
								</span>
								{#if question.timeLimit}
									<span class="inline-flex items-center rounded bg-yellow-600 px-2 py-1 text-xs font-medium text-yellow-100">
										{question.timeLimit}s
									</span>
								{/if}
							</div>
							<p class="text-foreground text-sm">{question.content}</p>
						</div>
					</div>
				</div>
			</div>
		{/each}
	{/if}
</div>
