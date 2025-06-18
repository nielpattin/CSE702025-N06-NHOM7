<script lang="ts">
	import { goto } from "$app/navigation"
	import { Card } from "$lib/components/ui/card"
	import { Badge } from "$lib/components/ui/badge"
	import { Star, Users, Clock } from "@lucide/svelte"

	let { quiz } = $props()

	function getDifficultyColor(difficulty: string) {
		switch (difficulty.toLowerCase()) {
			case "beginner":
				return "bg-green-600 text-white hover:bg-green-700"
			case "intermediate":
				return "bg-yellow-600 text-white hover:bg-yellow-700"
			case "advanced":
				return "bg-red-600 text-white hover:bg-red-700"
			default:
				return "bg-gray-600 text-white hover:bg-gray-700"
		}
	}

	function handleQuizClick() {
		goto(`/quiz/${quiz.id}`)
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault()
			handleQuizClick()
		}
	}
</script>

<Card class="group cursor-pointer border-gray-700 bg-gray-800/50 p-3 transition-all duration-200 hover:border-blue-500/50 hover:shadow-sm hover:shadow-blue-500/20" onclick={handleQuizClick} onkeydown={handleKeydown} role="button" tabindex={0}>
	<div class="flex items-center justify-between gap-2">
		<h3 class="flex-1 truncate text-sm font-medium text-white transition-colors duration-200 group-hover:text-blue-300">
			{quiz.title}
		</h3>
		<div class="flex flex-shrink-0 items-center gap-0.5 text-yellow-400">
			<Star class="h-2.5 w-2.5 fill-current" />
			<span class="text-xs">{quiz.rating.toFixed(1)}</span>
		</div>
	</div>

	<div class="flex items-center justify-between text-xs">
		<span class="truncate text-gray-400">by {quiz.author}</span>
		<div class="flex items-center gap-1">
			<Badge class="{getDifficultyColor(quiz.difficulty)} h-5 px-2 py-0.5 text-xs">
				{quiz.difficulty}
			</Badge>
			<span class="text-gray-400">{quiz.duration}</span>
			<span class="text-gray-400">{quiz.participants.toLocaleString()}</span>
		</div>
	</div>

	{#if quiz.createdAt}
		<div class="text-xs leading-none text-gray-500">
			{new Date(quiz.createdAt).toLocaleDateString()}
		</div>
	{/if}
</Card>
