<script lang="ts">
	import { enhance } from "$app/forms"

	let { quizTitle } = $props<{
		quizTitle: string
	}>()
</script>

<form method="POST" use:enhance class="mb-8" id="quiz-form">
	<div class="mb-4">
		<label for="quiz-title" class="mb-3 block text-lg font-medium text-white">Quiz Title</label>
		<input type="text" id="quiz-title" name="title" class="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none" value={quizTitle} placeholder="Enter quiz title..." required />
	</div>
</form>
