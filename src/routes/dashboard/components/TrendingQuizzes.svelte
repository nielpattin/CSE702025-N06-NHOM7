<script lang="ts">
	import { page } from "$app/state"
	import { goto } from "$app/navigation"
	import QuizCard from "./QuizCard.svelte"

	let data = $derived(page.data)
	let trendingQuizzes = $derived(data.trendingQuizzes || [])

	function handleViewAll() {
		goto("/library")
	}
</script>

<!-- Trending Quizzes Section -->
<div class="rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg">
	<div class="mb-6 flex items-center justify-between">
		<h2 class="text-xl font-semibold text-white">🔥 Trending Quizzes</h2>
		<button onclick={handleViewAll} class="text-sm font-medium text-blue-400 hover:text-blue-300"> View all → </button>
	</div>

	{#if trendingQuizzes.length > 0}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
			{#each trendingQuizzes as quiz (quiz.id)}
				<QuizCard {quiz} />
			{/each}
		</div>
	{:else}
		<div class="flex flex-col items-center justify-center py-12 text-center">
			<div class="mb-4 text-6xl">📚</div>
			<h3 class="mb-2 text-lg font-medium text-white">No trending quizzes yet</h3>
			<p class="mb-4 text-gray-400">Check back later or explore our quiz library</p>
			<button onclick={handleViewAll} class="rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-purple-700"> Browse All Quizzes </button>
		</div>
	{/if}
</div>
