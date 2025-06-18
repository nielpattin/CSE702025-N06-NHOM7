<script lang="ts">
	import { Button } from "$lib/components/ui/button"
	import { BookOpen, X } from "@lucide/svelte"
	import QuizCard from "./QuizCard.svelte"
	import QuizCardSkeleton from "./QuizCardSkeleton.svelte"

	interface QuizData {
		id: number
		title: string
		author: string
		participants: number
		difficulty: string
		rating: number
		duration: string
		imageUrl: string | null
		createdAt: Date | null
	}

	interface Props {
		quizzes: QuizData[]
		isLoading: boolean
		search: string
		difficultyFilter: string
		onClearFilters: () => void
	}

	let { quizzes, isLoading, search, difficultyFilter, onClearFilters }: Props = $props()

	let visibleQuizzes = $state<number[]>([])

	$effect(() => {
		visibleQuizzes = []
		const itemCount = isLoading ? 9 : quizzes.length
		setTimeout(() => {
			Array.from({ length: itemCount }, (_, index) => {
				setTimeout(() => {
					visibleQuizzes = [...visibleQuizzes, index]
				}, index * 5)
			})
		}, 100)
	})
</script>

<div class="w-full">
	{#if isLoading}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each Array(9) as _, index (index)}
				<QuizCardSkeleton />
			{/each}
		</div>
	{:else if quizzes.length > 0}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each quizzes as quiz, index (quiz.id)}
				<div class="transform transition-all duration-500 ease-out {visibleQuizzes.includes(index) ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}" style="transition-delay: {index * 50}ms">
					<QuizCard {quiz} />
				</div>
			{/each}
		</div>
	{:else}
		<div class="py-12 text-center">
			<div class="mx-auto flex h-24 w-24 items-center justify-center opacity-50">
				<BookOpen class="h-16 w-16 text-gray-400" />
			</div>
			<h3 class="mt-4 text-lg font-medium text-white">
				{#if search || difficultyFilter}
					No quizzes found
				{:else}
					No quizzes available
				{/if}
			</h3>
			<p class="mt-2 text-gray-400">
				{#if search || difficultyFilter}
					No quizzes match your search criteria. Try adjusting your filters.
				{:else}
					There are no published quizzes available at the moment.
				{/if}
			</p>
			{#if search || difficultyFilter}
				<Button onclick={onClearFilters} variant="default" class="mt-4">
					<X class="mr-2 h-4 w-4" />
					Clear Filters
				</Button>
			{/if}
		</div>
	{/if}
</div>
