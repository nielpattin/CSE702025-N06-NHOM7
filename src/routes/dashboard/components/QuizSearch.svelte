<script lang="ts">
	import { page } from "$app/state"
	import { goto } from "$app/navigation"
	import { Button } from "$lib/components/ui/button"
	import { Input } from "$lib/components/ui/input"
	import { Badge } from "$lib/components/ui/badge"
	import * as Pagination from "$lib/components/ui/pagination"
	import * as Select from "$lib/components/ui/select"
	import { Search, X, Filter, Star, Users, Calendar, BookOpen, ChevronUp, ChevronDown } from "@lucide/svelte"
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

	let searchInput = $state(search)
	let currentSortKey = $state(sortBy)
	let currentSortOrder = $state<"asc" | "desc">(sortOrder as "asc" | "desc")
	let currentDifficultyFilter = $state(difficultyFilter)
	let visibleQuizzes = $state<number[]>([])
	let isLoading = $state(true)
	let loadingStartTime = $state(Date.now())

	$effect(() => {
		searchInput = search
		currentSortKey = sortBy
		currentSortOrder = sortOrder as "asc" | "desc"
		currentDifficultyFilter = difficultyFilter
	})

	$effect(() => {
		if (quizzes.length > 0 && isLoading) {
			const elapsed = Date.now() - loadingStartTime
			const remainingTime = Math.max(0, 500 - elapsed)

			setTimeout(() => {
				isLoading = false
			}, remainingTime)
		}
	})

	$effect(() => {
		visibleQuizzes = []
		const itemCount = isLoading ? 6 : quizzes.length
		setTimeout(() => {
			Array.from({ length: itemCount }, (_, index) => {
				setTimeout(() => {
					visibleQuizzes = [...visibleQuizzes, index]
				}, index * 5)
			})
		}, 100)
	})

	const sortOptions = [
		{ key: "participants", label: "Participants", icon: Users },
		{ key: "rating", label: "Rating", icon: Star },
		{ key: "title", label: "Title", icon: BookOpen },
		{ key: "createdAt", label: "Date Created", icon: Calendar }
	]

	const difficultyOptions = [
		{ value: "", label: "All Difficulties" },
		{ value: "easy", label: "Beginner" },
		{ value: "medium", label: "Intermediate" },
		{ value: "hard", label: "Advanced" }
	]

	function handleSearchSubmit() {
		updateUrl({ search: searchInput, page: 1 })
	}

	function handleSearchClear() {
		searchInput = ""
		updateUrl({ search: "", page: 1 })
	}

	function handleSort(key: string) {
		console.log(`Sorting by ${key} in ${currentSortOrder} order`)

		if (currentSortKey === key) {
			currentSortOrder = currentSortOrder === "asc" ? "desc" : "asc"
		} else {
			currentSortKey = key
			currentSortOrder = "desc"
		}
		updateUrl({ sortBy: currentSortKey, sortOrder: currentSortOrder, page: 1 })
	}

	function handleDifficultyFilter(difficulty: string | undefined) {
		const newDifficulty = difficulty ?? ""
		currentDifficultyFilter = newDifficulty
		updateUrl({ difficulty: newDifficulty, page: 1 })
	}

	function updateUrl(params: Record<string, string | number> = {}) {
		const url = new URL(page.url)

		if ("search" in params) {
			if (params.search) {
				url.searchParams.set("search", String(params.search))
			} else {
				url.searchParams.delete("search")
			}
		}

		if ("page" in params) {
			const pageNum = Number(params.page)
			if (pageNum && pageNum > 1) {
				url.searchParams.set("page", String(pageNum))
			} else {
				url.searchParams.delete("page")
			}
		}

		if ("sortBy" in params) {
			url.searchParams.set("sortBy", String(params.sortBy))
		}

		if ("sortOrder" in params) {
			url.searchParams.set("sortOrder", String(params.sortOrder))
		}

		if ("difficulty" in params) {
			if (params.difficulty) {
				url.searchParams.set("difficulty", String(params.difficulty))
			} else {
				url.searchParams.delete("difficulty")
			}
		}

		isLoading = true
		loadingStartTime = Date.now()
		goto(url.toString(), { replaceState: false, noScroll: false, invalidateAll: true })
	}

	async function handlePageChange(newPage: number) {
		window.scrollTo({ top: 0, behavior: "smooth" })
		updateUrl({ page: newPage })
	}

	function getDifficultyLabel(value: string) {
		return difficultyOptions.find((opt) => opt.value === value)?.label || "All Difficulties"
	}
</script>

<div class="w-full">
	<div class="rounded-lg border border-gray-700 bg-gray-800/50 p-6 shadow-lg backdrop-blur">
		<div class="mb-6">
			<div class="relative flex items-center space-x-2">
				<div class="relative flex-1">
					<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
					<Input
						value={searchInput}
						oninput={(e) => (searchInput = e.currentTarget.value)}
						onkeydown={(e) => {
							if (e.key === "Enter") handleSearchSubmit()
							if (e.key === "Escape") handleSearchClear()
						}}
						placeholder="Search quizzes by title..."
						class="border-gray-600 bg-gray-700 pr-10 pl-10 text-white placeholder-gray-400"
					/>
					{#if searchInput}
						<Button variant="ghost" size="sm" onclick={handleSearchClear} class="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 p-0 text-gray-400 hover:bg-transparent hover:text-white">
							<X class="h-4 w-4" />
							<span class="sr-only">Clear search</span>
						</Button>
					{/if}
				</div>

				<Button onclick={handleSearchSubmit} variant="default" size="sm" disabled={isLoading}>
					<Search class="mr-2 h-4 w-4" />
					Search
				</Button>
			</div>

			{#if search}
				<div class="mt-3 flex items-center justify-between">
					<p class="text-sm text-gray-400">
						Showing results for: <span class="font-medium text-white">"{search}"</span>
					</p>
					<p class="text-sm text-gray-400">
						{pagination.totalQuizzes} quiz{pagination.totalQuizzes === 1 ? "" : "zes"} found
					</p>
				</div>
			{/if}
		</div>

		<div class="mb-6 flex flex-wrap items-center gap-3">
			<span class="text-sm font-medium text-gray-400">Filters:</span>

			<Select.Root type="single" value={currentDifficultyFilter} onValueChange={handleDifficultyFilter}>
				<Select.Trigger class="w-[180px] border-gray-600 bg-gray-700 text-white hover:bg-gray-600">
					<Filter class="mr-2 h-4 w-4" />
					{getDifficultyLabel(currentDifficultyFilter)}
				</Select.Trigger>
				<Select.Content class="border-gray-700 bg-gray-800">
					{#each difficultyOptions as option (option.value)}
						<Select.Item value={option.value} label={option.label} class="text-white hover:bg-gray-700 focus:bg-gray-700">
							{option.label}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>

			{#if currentDifficultyFilter || search}
				<div class="flex items-center gap-2">
					{#if currentDifficultyFilter}
						<Badge variant="secondary" class="bg-blue-600 text-white">
							{getDifficultyLabel(currentDifficultyFilter)}
							<button onclick={() => handleDifficultyFilter("")} class="ml-1 hover:text-gray-300">
								<X class="h-3 w-3" />
							</button>
						</Badge>
					{/if}
					{#if search}
						<Badge variant="secondary" class="bg-green-600 text-white">
							Search: "{search}"
							<button onclick={handleSearchClear} class="ml-1 hover:text-gray-300">
								<X class="h-3 w-3" />
							</button>
						</Badge>
					{/if}
				</div>
			{/if}

			<div class="ml-auto text-sm text-gray-400">
				{pagination.totalQuizzes} total quiz{pagination.totalQuizzes === 1 ? "" : "zes"}
			</div>
		</div>

		<div class="mb-6 flex items-center justify-between">
			<div class="flex items-center space-x-3">
				<span class="text-sm font-medium text-gray-400">Sort by:</span>
				{#each sortOptions as option (option.key)}
					<Button onclick={() => handleSort(option.key)} variant={currentSortKey === option.key ? "default" : "outline"} size="sm" class={currentSortKey === option.key ? "bg-blue-600 text-white hover:bg-blue-700" : "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"}>
						<option.icon class="mr-2 h-4 w-4" />
						{option.label}
						{#if currentSortKey === option.key}
							{#if currentSortOrder === "asc"}
								<ChevronUp class="ml-2 h-4 w-4" />
							{:else}
								<ChevronDown class="ml-2 h-4 w-4" />
							{/if}
						{/if}
					</Button>
				{/each}
			</div>
		</div>

		{#if isLoading}
			<div class="mb-6 grid gap-6 md:grid-cols-2">
				{#each Array(6) as _, index (index)}
					<QuizCardSkeleton />
				{/each}
			</div>
		{:else if quizzes.length > 0}
			<div class="mb-6 grid gap-6 md:grid-cols-2">
				{#each quizzes as quiz, index (quiz.id)}
					<div class="transform transition-all duration-500 ease-out {visibleQuizzes.includes(index) ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}" style="transition-delay: {index * 50}ms">
						<QuizCard {quiz} />
					</div>
				{/each}
			</div>

			{#if pagination.totalPages > 1}
				<div class="flex justify-center">
					<Pagination.Root count={pagination.totalQuizzes} perPage={pagination.perPage} page={pagination.currentPage} onPageChange={handlePageChange}>
						{#snippet children({ pages, currentPage: paginationCurrentPage })}
							<Pagination.Content>
								<Pagination.Item class="cursor-pointer">
									<Pagination.PrevButton />
								</Pagination.Item>
								{#each pages as page (page.key)}
									{#if page.type === "ellipsis"}
										<Pagination.Item>
											<Pagination.Ellipsis />
										</Pagination.Item>
									{:else}
										<Pagination.Item>
											<Pagination.Link class="cursor-pointer" {page} isActive={paginationCurrentPage === page.value}>
												{page.value}
											</Pagination.Link>
										</Pagination.Item>
									{/if}
								{/each}
								<Pagination.Item>
									<Pagination.NextButton class="cursor-pointer" />
								</Pagination.Item>
							</Pagination.Content>
						{/snippet}
					</Pagination.Root>
				</div>
			{/if}
		{:else}
			<div class="py-12 text-center">
				<div class="mx-auto flex h-24 w-24 items-center justify-center opacity-50">
					<BookOpen class="h-16 w-16 text-gray-400" />
				</div>
				<h3 class="mt-4 text-lg font-medium text-white">
					{#if search || currentDifficultyFilter}
						No quizzes found
					{:else}
						No quizzes available
					{/if}
				</h3>
				<p class="mt-2 text-gray-400">
					{#if search || currentDifficultyFilter}
						No quizzes match your search criteria. Try adjusting your filters.
					{:else}
						There are no published quizzes available at the moment.
					{/if}
				</p>
				{#if search || currentDifficultyFilter}
					<Button
						onclick={() => {
							searchInput = ""
							handleSearchClear()
							handleDifficultyFilter("")
						}}
						variant="default"
						class="mt-4"
					>
						<X class="mr-2 h-4 w-4" />
						Clear Filters
					</Button>
				{/if}
			</div>
		{/if}
	</div>
</div>
