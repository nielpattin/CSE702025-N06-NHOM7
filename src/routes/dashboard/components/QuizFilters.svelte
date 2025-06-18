<script lang="ts">
	import { page } from "$app/state"
	import { goto } from "$app/navigation"
	import { Button } from "$lib/components/ui/button"
	import { Input } from "$lib/components/ui/input"
	import { Badge } from "$lib/components/ui/badge"
	import * as Select from "$lib/components/ui/select"
	import { Search, X, Filter, Star, Users, Calendar, BookOpen } from "@lucide/svelte"
	import SortButtons from "$lib/components/ui/sort-buttons.svelte"

	interface Props {
		search: string
		sortBy: string
		sortOrder: string
		difficultyFilter: string
		totalQuizzes: number
		isLoading?: boolean
	}

	let { search, sortBy, sortOrder, difficultyFilter, totalQuizzes, isLoading = false }: Props = $props()

	let searchInput = $state(search)
	let currentSortKey = $state(sortBy)
	let currentSortOrder = $state<"asc" | "desc">(sortOrder as "asc" | "desc")
	let currentDifficultyFilter = $state(difficultyFilter)

	$effect(() => {
		searchInput = search
		currentSortKey = sortBy
		currentSortOrder = sortOrder as "asc" | "desc"
		currentDifficultyFilter = difficultyFilter
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

		goto(url.toString(), { replaceState: false, noScroll: false, invalidateAll: true })
	}

	function getDifficultyLabel(value: string) {
		return difficultyOptions.find((opt) => opt.value === value)?.label || "All Difficulties"
	}

	function clearAllFilters() {
		searchInput = ""
		handleSearchClear()
		handleDifficultyFilter("")
	}
</script>

<div class="border-border bg-card rounded-lg border px-6 pt-6 shadow-lg backdrop-blur">
	<div class="mb-4">
		<div class="relative flex items-center gap-3">
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
					class="border-border bg-muted pr-10 pl-10 text-white placeholder-gray-400"
				/>
				{#if searchInput}
					<Button variant="ghost" size="sm" onclick={handleSearchClear} class="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 p-0 text-gray-400 hover:bg-transparent hover:text-white">
						<X class="h-4 w-4" />
						<span class="sr-only">Clear search</span>
					</Button>
				{/if}
			</div>

			<Select.Root type="single" value={currentDifficultyFilter} onValueChange={handleDifficultyFilter}>
				<Select.Trigger class="border-border bg-muted hover:bg-muted w-[180px] text-white">
					<Filter class="mr-2 h-4 w-4" />
					{getDifficultyLabel(currentDifficultyFilter)}
				</Select.Trigger>
				<Select.Content class="border-border bg-card">
					{#each difficultyOptions as option (option.value)}
						<Select.Item value={option.value} label={option.label} class="hover:bg-muted focus:bg-muted text-white">
							{option.label}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>

			<SortButtons options={sortOptions} {currentSortKey} {currentSortOrder} onSort={handleSort} />
		</div>
	</div>

	{#if currentDifficultyFilter || search}
		<div class="mb-6 flex flex-wrap items-center gap-3">
			<span class="text-sm font-medium text-gray-400">Active filters:</span>
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
			<div class="ml-auto text-sm text-gray-400">
				{totalQuizzes} total quiz{totalQuizzes === 1 ? "" : "zes"}
			</div>
		</div>
	{/if}
</div>
