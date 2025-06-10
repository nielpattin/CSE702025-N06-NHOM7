<script lang="ts">
	let { quizId } = $props<{
		quizId: number
	}>()
</script>

<header class="mb-8 flex items-center justify-between">
	<div class="flex items-center gap-4">
		<a href="/dashboard" class="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"> Return to Dashboard </a>
		<h1 class="text-3xl font-bold text-white">Edit Quiz</h1>
	</div>
	<button type="submit" form="quiz-form" class="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"> Save Changes </button>
</header>
