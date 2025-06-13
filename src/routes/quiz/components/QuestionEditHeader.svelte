<script lang="ts">
	let { quizId, questionType, points, timeLimit, isSubmitting, onTypeChange, onPointsChange, onTimeLimitChange } = $props<{
		quizId: string | number
		questionType: "multiple_choice" | "true_false"
		points: number
		timeLimit: number
		isSubmitting: boolean
		onTypeChange: (type: "multiple_choice" | "true_false") => void
		onPointsChange: (points: number) => void
		onTimeLimitChange: (timeLimit: number) => void
	}>()
</script>

<header class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
	<div class="flex items-center gap-4">
		<a href="/quiz/edit/{quizId}" class="inline-flex items-center rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none">
			<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
			</svg>
			Back to Quiz Editor
		</a>
		<h1 class="text-2xl font-bold text-white">Edit Question</h1>
	</div>

	<div class="flex flex-wrap items-center gap-4">
		<div class="flex flex-col">
			<label for="question-type" class="mb-2 text-sm font-medium text-gray-300">Question Type</label>
			<select id="question-type" class="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none" value={questionType} onchange={(e) => onTypeChange(e.currentTarget.value as "multiple_choice" | "true_false")}>
				<option value="multiple_choice">Multiple Choice</option>
				<option value="true_false">True/False</option>
			</select>
		</div>
		<div class="flex flex-col">
			<label for="question-points" class="mb-2 text-sm font-medium text-gray-300">Points</label>
			<input id="question-points" type="number" value={points} oninput={(e) => onPointsChange(Number(e.currentTarget.value))} class="w-20 rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none" min="1" />
		</div>
		<div class="flex flex-col">
			<label for="time-limit" class="mb-2 text-sm font-medium text-gray-300">Time Limit (seconds)</label>
			<input id="time-limit" type="number" value={timeLimit} oninput={(e) => onTimeLimitChange(Number(e.currentTarget.value))} class="w-24 rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none" min="5" />
		</div>
		<div class="flex flex-col justify-end">
			<button type="submit" disabled={isSubmitting} class="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50">
				{isSubmitting ? "Saving..." : "Save Question"}
			</button>
		</div>
	</div>
</header>
