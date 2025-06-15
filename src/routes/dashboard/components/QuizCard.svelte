<script lang="ts">
	import { goto } from "$app/navigation"

	let { quiz } = $props()

	function getDifficultyColor(difficulty: string) {
		switch (difficulty.toLowerCase()) {
			case "beginner":
				return "text-green-400 bg-green-900/30"
			case "intermediate":
				return "text-yellow-400 bg-yellow-900/30"
			case "advanced":
				return "text-red-400 bg-red-900/30"
			default:
				return "text-gray-400 bg-gray-900/30"
		}
	}

	function handleQuizClick() {
		goto(`/quiz/${quiz.id}`)
	}

	function handleTakeQuiz(event: Event) {
		event.stopPropagation()
		goto(`/quiz/${quiz.id}`)
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault()
			handleQuizClick()
		}
	}
</script>

<div class="group cursor-pointer rounded-lg border border-gray-700 bg-gray-700/50 p-4 transition-all hover:border-blue-500 hover:bg-gray-700" onclick={handleQuizClick} onkeydown={handleKeydown} role="button" tabindex="0">
	<div class="mb-3 flex items-start justify-between">
		<div class="flex-1">
			<h3 class="font-semibold text-white group-hover:text-blue-300">
				{quiz.title}
			</h3>
			<p class="text-sm text-gray-400">by {quiz.author}</p>
		</div>
		<div class="flex items-center text-yellow-400">
			<svg class="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
				<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
			</svg>
			<span class="text-sm">{quiz.rating}</span>
		</div>
	</div>

	<div class="mb-3 flex flex-wrap gap-2">
		<span class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
			{quiz.difficulty}
		</span>
		<span class="inline-flex items-center rounded-full bg-gray-900/50 px-2.5 py-0.5 text-xs font-medium text-gray-300">
			⏱️ {quiz.duration}
		</span>
	</div>

	<div class="flex items-center justify-between">
		<span class="text-sm text-gray-400">
			{quiz.participants.toLocaleString()} participants
		</span>
		<button onclick={handleTakeQuiz} class="rounded-md bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 text-sm font-medium text-white transition-all hover:from-purple-700 hover:to-pink-700"> Take Quiz </button>
	</div>
</div>
