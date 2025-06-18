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

	let isInitialLoading = $state(true)
	let isFilterLoading = $state(false)
	let initialLoadingStartTime = $state(Date.now())
	let hasInitiallyLoaded = $state(false)

	$effect(() => {
		if (quizzes.length > 0 && isInitialLoading && !hasInitiallyLoaded) {
			const elapsed = Date.now() - initialLoadingStartTime
			const remainingTime = Math.max(0, 500 - elapsed)

			setTimeout(() => {
				isInitialLoading = false
				hasInitiallyLoaded = true
			}, remainingTime)
		}
	})

	// Handle filter/sort/pagination changes after initial load
	let previousSearch = $state(search)
	let previousSortBy = $state(sortBy)
	let previousSortOrder = $state(sortOrder)
	let previousDifficultyFilter = $state(difficultyFilter)
	let previousCurrentPage = $state(pagination.currentPage)

	$effect(() => {
		if (hasInitiallyLoaded) {
			// Check if any of the parameters have actually changed
			const hasChanged = search !== previousSearch || sortBy !== previousSortBy || sortOrder !== previousSortOrder || difficultyFilter !== previousDifficultyFilter || pagination.currentPage !== previousCurrentPage

			if (hasChanged) {
				isFilterLoading = true
				setTimeout(() => {
					isFilterLoading = false
				}, 500)

				// Update previous values
				previousSearch = search
				previousSortBy = sortBy
				previousSortOrder = sortOrder
				previousDifficultyFilter = difficultyFilter
				previousCurrentPage = pagination.currentPage
			}
		}
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
	<QuizFilters {search} {sortBy} {sortOrder} {difficultyFilter} totalQuizzes={pagination.totalQuizzes} isLoading={isInitialLoading} />

	<QuizGrid {quizzes} isLoading={isInitialLoading || isFilterLoading} {search} {difficultyFilter} onClearFilters={handleClearFilters} />

	<QuizPagination {pagination} />
</div>
