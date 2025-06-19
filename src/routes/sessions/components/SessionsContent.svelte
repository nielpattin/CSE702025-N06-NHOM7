<script lang="ts">
	import { SessionCard } from "./index"
	import { goto } from "$app/navigation"
	import { page } from "$app/state"
	import { Button } from "$lib/components/ui/button"
	import { Input } from "$lib/components/ui/input"
	import * as Pagination from "$lib/components/ui/pagination"
	import { Skeleton } from "$lib/components/ui/skeleton"
	import { Search, X, Calendar, Users, Activity, BookOpen } from "@lucide/svelte"
	import SortButtons from "$lib/components/ui/sort-buttons.svelte"
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
		perPage: number
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
	let isSortLoading = $state(false)

	$effect(() => {
		searchInput = search
		currentSortKey = (sortBy as "createdAt" | "quizName" | "participantCount" | "status") || "createdAt"
		currentSortOrder = (sortOrder as "asc" | "desc") || "desc"
	})

	function handleSort(key: string) {
		if (currentSortKey === key) {
			currentSortOrder = currentSortOrder === "asc" ? "desc" : "asc"
		} else {
			currentSortKey = key as "createdAt" | "quizName" | "participantCount" | "status"
			currentSortOrder = "desc"
		}

		// Show loading for sort operations
		isSortLoading = true
		setTimeout(() => {
			isSortLoading = false
		}, 500)

		updateUrl()
	}

	function handleSearchSubmit() {
		// Show loading for search operations
		isSortLoading = true
		setTimeout(() => {
			isSortLoading = false
		}, 500)

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
	<div class="mb-8 p-6">
		<!-- Search Bar -->
		<div class="mb-6">
			<div class="relative flex items-center space-x-4">
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

				<Button onclick={handleSearchSubmit} variant="default" size="sm" class="cursor-pointer" style="background-color: var(--primary) !important;">
					<Search class="mr-2 h-4 w-4" />
					Search
				</Button>
			</div>

			<!-- Sort Controls -->
			<div class="mt-4 flex items-center justify-between">
				<SortButtons options={sortOptions} {currentSortKey} {currentSortOrder} onSort={handleSort} />
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
			{:else}
				<div class="mt-3">
					<div class="text-sm text-gray-400">
						{pagination.totalSessions} total session{pagination.totalSessions === 1 ? "" : "s"}
					</div>
				</div>
			{/if}
		</div>

		<!-- Sessions Grid -->
		{#if isPaginationLoading || isSortLoading}
			<!-- Sessions Grid Skeleton during pagination -->
			<div class="mb-6 grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
				{#each Array(6) as _, i (i)}
					<div class="border-border bg-card rounded-lg border p-6">
						<div class="flex items-start space-x-4">
							<div class="flex-shrink-0">
								<Skeleton class="h-16 w-16 rounded-lg" />
							</div>

							<div class="min-w-0 flex-1">
								<div class="flex items-start justify-between">
									<div class="flex min-w-0 flex-1 items-start space-x-4">
										<Skeleton class="h-6 w-32 rounded" />
										<Skeleton class="h-5 w-16 rounded-full" />
									</div>
									<Skeleton class="h-8 w-8 rounded-md" />
								</div>

								<div class="mt-3 flex items-center justify-between">
									<Skeleton class="h-4 w-24 rounded" />
									<Skeleton class="h-4 w-20 rounded" />
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Pagination Skeleton -->
			{#if pagination.totalPages > 1}
				<div class="mt-6 flex justify-center">
					<div class="flex items-center space-x-2">
						<Skeleton class="h-10 w-16 rounded-md" />
						<Skeleton class="h-10 w-8 rounded-md" />
						<Skeleton class="h-10 w-8 rounded-md" />
						<Skeleton class="h-10 w-8 rounded-md" />
						<Skeleton class="h-10 w-12 rounded-md" />
					</div>
				</div>
			{/if}
		{:else if sessions.length > 0}
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
					<Pagination.Root count={pagination.totalSessions} perPage={pagination.perPage} page={pagination.currentPage} onPageChange={handlePageChange}>
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
