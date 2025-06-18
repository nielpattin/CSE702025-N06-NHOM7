<script lang="ts">
	let { quizId } = $props<{
		quizId: number
	}>()
</script>

<div class="border-border bg-secondary rounded-lg border-2 border-dashed p-8 text-center">
	<svg class="mx-auto h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
	</svg>
	<h3 class="mt-4 text-xl font-medium text-gray-300">No questions yet</h3>
	<p class="mt-2 text-gray-400">Get started by adding your first question to this quiz.</p>
	<div class="mt-6">
		<a href="/quiz/edit/{quizId}/question/new" class="inline-flex items-center rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:from-green-700 hover:to-emerald-700">
			<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
			</svg>
			Add Your First Question
		</a>
	</div>
</div>
