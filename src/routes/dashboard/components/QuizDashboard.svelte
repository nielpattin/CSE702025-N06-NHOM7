<script lang="ts">
	import { page } from "$app/state"
	import { goto } from "$app/navigation"
	import QuizFilters from "./QuizFilters.svelte"
	import QuizGrid from "./QuizGrid.svelte"
	import QuizPagination from "./QuizPagination.svelte"

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

	interface PaginationInfo {
		currentPage: number
		perPage: number
		totalQuizzes: number
		totalPages: number
	}

	interface Props {
		quizzes: QuizData[]
		pagination: PaginationInfo
		search: string
		sortBy: string
		sortOrder: string
		difficultyFilter: string
	}

	let { quizzes, pagination, search, sortBy, sortOrder, difficultyFilter }: Props = $props()

	let isLoading = $state(true)
	let loadingStartTime = $state(Date.now())

	$effect(() => {
		if (quizzes.length > 0 && isLoading) {
			const elapsed = Date.now() - loadingStartTime
			const remainingTime = Math.max(0, 500 - elapsed)

			setTimeout(() => {
				isLoading = false
			}, remainingTime)
		}
	})

	// Reset loading state when URL parameters change
	$effect(() => {
		// Watch for changes in the URL parameters that trigger new data loads
		void search
		void sortBy
		void sortOrder
		void difficultyFilter
		void pagination.currentPage
		isLoading = true
		loadingStartTime = Date.now()
	})

	function handleClearFilters() {
		const url = new URL(page.url)
		url.searchParams.delete("search")
		url.searchParams.delete("difficulty")
		url.searchParams.delete("page")
		goto(url.toString(), { replaceState: false, noScroll: false, invalidateAll: true })
	}
</script>

<div class="w-full space-y-6">
	<QuizFilters {search} {sortBy} {sortOrder} {difficultyFilter} totalQuizzes={pagination.totalQuizzes} {isLoading} />

	<QuizGrid {quizzes} {isLoading} {search} {difficultyFilter} onClearFilters={handleClearFilters} />

	<QuizPagination {pagination} />
</div>
