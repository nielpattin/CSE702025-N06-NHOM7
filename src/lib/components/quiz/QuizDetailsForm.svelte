<script lang="ts">
	import { enhance } from "$app/forms"

	let { quizTitle } = $props<{
		quizTitle: string
	}>()
</script>

<form method="POST" use:enhance class="mb-8" id="quiz-form">
	<div class="mb-4">
		<label for="quiz-title" class="mb-3 block text-lg font-medium text-white">Quiz Title</label>
		<div class="flex items-end gap-3">
			<div class="flex-1">
				<input type="text" id="quiz-title" name="title" class="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none" value={quizTitle} placeholder="Enter quiz title..." required />
			</div>
			<button type="submit" class="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-medium whitespace-nowrap text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"> Save Changes </button>
		</div>
	</div>
</form>
