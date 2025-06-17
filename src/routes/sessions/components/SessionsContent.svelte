<script lang="ts">
	import { SessionCard } from "./index"
	import { goto } from "$app/navigation"
	import { page } from "$app/state"
	import { invalidateAll } from "$app/navigation"
	import { ChevronDoubleUpOutline, ChevronDoubleDownOutline } from "flowbite-svelte-icons"
	import { Button } from "$lib/components/ui/button"
	import { Input } from "$lib/components/ui/input"
	import * as Pagination from "$lib/components/ui/pagination"
	import { Search, X, Calendar, Users, Activity, BookOpen } from "@lucide/svelte"
	import { onMount } from "svelte"

	interface SessionData {
		id: number
		quizId: number
		hostId: string
		code: string
		status: string
		expiresAt: Date | null
		createdAt: Date | null
		updatedAt: Date | null
		quizName: string | null
		imageUrl: string | null
		participantCount: number
	}

	interface PaginationInfo {
		currentPage: number
		totalSessions: number
		totalPages: number
	}

	interface Props {
		sessions: SessionData[]
		pagination: PaginationInfo
		search: string
		sortBy: string
		sortOrder: string
		isPaginationLoading: boolean
		onPaginationLoadingChange: (loading: boolean) => void
	}

	let { sessions, pagination, search, sortBy, sortOrder, isPaginationLoading, onPaginationLoadingChange }: Props = $props()

	let searchInput = $state(search)
	let currentSortKey = $state<"createdAt" | "quizName" | "participantCount" | "status">((sortBy as "createdAt" | "quizName" | "participantCount" | "status") || "createdAt")
	let currentSortOrder = $state<"asc" | "desc">((sortOrder as "asc" | "desc") || "desc")
	let visibleSessions = $state<number[]>([])

	$effect(() => {
		searchInput = search
		currentSortKey = (sortBy as "createdAt" | "quizName" | "participantCount" | "status") || "createdAt"
		currentSortOrder = (sortOrder as "asc" | "desc") || "desc"
	})

	function handleSort(key: "createdAt" | "quizName" | "participantCount" | "status") {
		if (currentSortKey === key) {
			currentSortOrder = currentSortOrder === "asc" ? "desc" : "asc"
		} else {
			currentSortKey = key
			currentSortOrder = "desc"
		}
		updateUrl()
	}

	function handleSearchSubmit() {
		updateUrl({ search: searchInput, page: 1 })
	}

	function handleSearchClear() {
		searchInput = ""
		updateUrl({ search: "", page: 1 })
	}

	function handleSearchChange(value: string) {
		searchInput = value
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
		} else {
			url.searchParams.set("page", "1")
		}

		url.searchParams.set("sortBy", currentSortKey)
		url.searchParams.set("sortOrder", currentSortOrder)

		goto(url.toString(), { replaceState: false, noScroll: false, invalidateAll: true })
	}

	async function handlePageChange(newPage: number) {
		onPaginationLoadingChange(true)

		window.scrollTo({ top: 0, behavior: "smooth" })

		updateUrl({ page: newPage })

		setTimeout(() => {
			onPaginationLoadingChange(false)
		}, 800)
	}

	const sortOptions = [
		{ key: "createdAt" as const, label: "Date Created", icon: Calendar },
		{ key: "quizName" as const, label: "Quiz Name", icon: BookOpen },
		{ key: "participantCount" as const, label: "Participants", icon: Users },
		{ key: "status" as const, label: "Status", icon: Activity }
	]

	onMount(() => {
		setTimeout(() => {
			visibleSessions = sessions.map((_, index) => index)
		}, 100)
	})

	$effect(() => {
		visibleSessions = []
		setTimeout(() => {
			sessions.forEach((_, index) => {
				setTimeout(() => {
					visibleSessions = [...visibleSessions, index]
				}, index * 100)
			})
		}, 100)
	})
</script>

<div class="w-full">
	<div class="mb-8">
		<div class="rounded-lg bg-gray-800/50 p-6 shadow-lg backdrop-blur">
			<!-- Search Bar -->
			<div class="mb-6">
				<div class="relative flex items-center space-x-2">
					<div class="relative flex-1">
						<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
						<Input
							value={searchInput}
							oninput={(e) => handleSearchChange(e.currentTarget.value)}
							onkeydown={(e) => {
								if (e.key === "Enter") handleSearchSubmit()
								if (e.key === "Escape") handleSearchClear()
							}}
							placeholder="Search sessions by quiz name..."
							class="pr-10 pl-10"
						/>
						{#if searchInput}
							<Button variant="ghost" size="sm" onclick={handleSearchClear} class="text-muted-foreground hover:text-foreground absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 cursor-pointer p-0 hover:bg-transparent">
								<X class="h-4 w-4" />
								<span class="sr-only">Clear search</span>
							</Button>
						{/if}
					</div>

					<Button onclick={handleSearchSubmit} variant="default" size="sm" class="cursor-pointer">
						<Search class="mr-2 h-4 w-4" />
						Search
					</Button>
				</div>

				{#if search}
					<div class="mt-3 flex items-center justify-between">
						<p class="text-muted-foreground text-sm">
							Showing results for: <span class="text-foreground font-medium">"{search}"</span>
						</p>
						<p class="text-muted-foreground text-sm">
							{pagination.totalSessions} session{pagination.totalSessions === 1 ? "" : "s"} found
						</p>
					</div>
				{/if}
			</div>

			<!-- Sort Controls -->
			<div class="mb-6 flex items-center justify-between">
				<div class="flex items-center space-x-3">
					<span class="text-sm font-medium text-gray-400">Sort by:</span>
					{#each sortOptions as option (option.key)}
						<button
							onclick={() => handleSort(option.key)}
							class="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors
							{currentSortKey === option.key ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'}"
						>
							<option.icon class="h-4 w-4" />
							{option.label}
							{#if currentSortKey === option.key}
								{#if currentSortOrder === "asc"}
									<ChevronDoubleUpOutline class="h-4 w-4" />
								{:else}
									<ChevronDoubleDownOutline class="h-4 w-4" />
								{/if}
							{/if}
						</button>
					{/each}
				</div>

				<div class="text-sm text-gray-400">
					{pagination.totalSessions} total session{pagination.totalSessions === 1 ? "" : "s"}
				</div>
			</div>

			<!-- Sessions Grid -->
			{#if sessions.length > 0}
				<div class="mb-6 grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
					{#each sessions as session, index (session.id)}
						<div class="transform transition-all duration-500 ease-out {visibleSessions.includes(index) ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}" style="transition-delay: {index * 50}ms">
							<SessionCard {session} />
						</div>
					{/each}
				</div>

				<!-- Pagination -->
				{#if pagination.totalPages > 1}
					<div class="mt-6 flex justify-center">
						<div class="flex items-center space-x-2">
							<Button variant="outline" size="sm" onclick={() => handlePageChange(Math.max(1, pagination.currentPage - 1))} disabled={pagination.currentPage <= 1}>Previous</Button>

							{#each Array.from({ length: pagination.totalPages }, (_, i) => i + 1) as pageNum (pageNum)}
								{#if pageNum === 1 || pageNum === pagination.totalPages || (pageNum >= pagination.currentPage - 2 && pageNum <= pagination.currentPage + 2)}
									<Button variant={pageNum === pagination.currentPage ? "default" : "outline"} size="sm" onclick={() => handlePageChange(pageNum)}>
										{pageNum}
									</Button>
								{:else if pageNum === pagination.currentPage - 3 || pageNum === pagination.currentPage + 3}
									<span class="px-2 text-gray-400">...</span>
								{/if}
							{/each}

							<Button variant="outline" size="sm" onclick={() => handlePageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))} disabled={pagination.currentPage >= pagination.totalPages}>Next</Button>
						</div>
					</div>
				{/if}
			{:else}
				<div class="py-12 text-center">
					<div class="mx-auto flex h-24 w-24 items-center justify-center opacity-50">
						<Activity class="h-16 w-16 text-gray-400" />
					</div>
					<h3 class="mt-4 text-lg font-medium text-white">
						{#if search}
							No sessions found
						{:else}
							No sessions yet
						{/if}
					</h3>
					<p class="mt-2 text-gray-400">
						{#if search}
							No sessions match your search criteria. Try adjusting your search terms.
						{:else}
							You haven't created any quiz sessions yet. Start a quiz session from your library to see it here.
						{/if}
					</p>
					{#if !search}
						<Button onclick={() => goto("/library")} variant="default" class="mt-4">
							<BookOpen class="mr-2 h-4 w-4" />
							Browse Library
						</Button>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>
