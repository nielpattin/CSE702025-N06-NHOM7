<script lang="ts">
	import { ReportCard } from "./index"
	import { goto } from "$app/navigation"
	import { page } from "$app/state"
	import { Button } from "$lib/components/ui/button"
	import { Input } from "$lib/components/ui/input"
	import * as Pagination from "$lib/components/ui/pagination"
	import { Skeleton } from "$lib/components/ui/skeleton"
	import { Search, X, Calendar, Users, Activity, BookOpen } from "@lucide/svelte"
	import SortButtons from "$lib/components/ui/sort-buttons.svelte"
	import type { PageData } from "../$types"
	import { onMount } from "svelte"

	interface Props {
		reports: PageData["sessionReports"]
		pagination: PageData["pagination"] & { perPage: number } // Add perPage to pagination
		search: string
		sortBy: string
		sortOrder: string
		isPaginationLoading: boolean
		onPaginationLoadingChange: (loading: boolean) => void
	}

	let { reports, pagination, search, sortBy, sortOrder, isPaginationLoading, onPaginationLoadingChange }: Props = $props()

	let searchInput = $state(search)
	let currentSortKey = $state<"createdDate" | "sessionName" | "participantCount" | "status">((sortBy as "createdDate" | "sessionName" | "participantCount" | "status") || "createdDate")
	let currentSortOrder = $state<"asc" | "desc">((sortOrder as "asc" | "desc") || "desc")
	let visibleReports = $state<number[]>([])
	let isSortLoading = $state(false)

	$effect(() => {
		searchInput = search
		currentSortKey = (sortBy as "createdDate" | "sessionName" | "participantCount" | "status") || "createdDate"
		currentSortOrder = (sortOrder as "asc" | "desc") || "desc"
	})

	function handleSort(key: string) {
		if (currentSortKey === key) {
			currentSortOrder = currentSortOrder === "asc" ? "desc" : "asc"
		} else {
			currentSortKey = key as "createdDate" | "sessionName" | "participantCount" | "status"
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
		{ key: "createdDate" as const, label: "Date Created", icon: Calendar },
		{ key: "sessionName" as const, label: "Quiz Name", icon: BookOpen },
		{ key: "participantCount" as const, label: "Participants", icon: Users },
		{ key: "status" as const, label: "Status", icon: Activity }
	]

	onMount(() => {
		setTimeout(() => {
			visibleReports = reports.map((_, index) => index)
		}, 100)
	})

	$effect(() => {
		visibleReports = []
		setTimeout(() => {
			reports.forEach((_, index) => {
				setTimeout(() => {
					visibleReports = [...visibleReports, index]
				}, index * 100)
			})
		}, 100)
	})
</script>

<div class="w-full">
	<div class="mt-4 mb-8">
		<!-- Search Bar and Sort Controls -->
		<div class="mb-6">
			<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div class="relative flex-1">
					<Search class="dark:text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-700" />
					<Input
						value={searchInput}
						oninput={(e) => handleSearchChange(e.currentTarget.value)}
						onkeydown={(e) => {
							if (e.key === "Enter") handleSearchSubmit()
							if (e.key === "Escape") handleSearchClear()
						}}
						placeholder="Search reports by quiz name..."
						class="pr-10 pl-10"
					/>
					{#if searchInput}
						<Button variant="ghost" size="sm" onclick={handleSearchClear} class="dark:text-muted-foreground dark:hover:text-foreground absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 cursor-pointer p-0 text-gray-700 hover:bg-transparent hover:text-gray-900">
							<X class="h-4 w-4" />
							<span class="sr-only">Clear search</span>
						</Button>
					{/if}
				</div>
				<SortButtons options={sortOptions} {currentSortKey} {currentSortOrder} onSort={handleSort} />
			</div>

			{#if search}
				<div class="mt-3 flex items-center justify-between">
					<p class="dark:text-muted-foreground text-sm text-gray-700">
						Showing results for: <span class="dark:text-foreground font-medium text-gray-900">"{search}"</span>
					</p>
					<p class="dark:text-muted-foreground text-sm text-gray-700">
						{pagination.totalReports} report{pagination.totalReports === 1 ? "" : "s"} found
					</p>
				</div>
			{/if}

			{#if !search}
				<div class="mt-3 flex justify-end">
					<div class="dark:text-muted-foreground text-sm text-gray-700">
						{pagination.totalReports} total report{pagination.totalReports === 1 ? "" : "s"}
					</div>
				</div>
			{/if}
		</div>

		<!-- Reports Grid -->
		{#if isPaginationLoading || isSortLoading}
			<!-- Reports Grid Skeleton during pagination or sort/search -->
			<div class="mb-6 grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
				{#each Array(6) as _, i (i)}
					<div class="border-border bg-muted rounded-lg border p-6 shadow-lg backdrop-blur">
						<div class="mb-4 flex items-start justify-between">
							<div class="flex-1">
								<Skeleton class="mb-2 h-6 w-3/4 rounded" />
								<Skeleton class="h-4 w-1/2 rounded" />
							</div>
							<Skeleton class="h-6 w-16 rounded-full" />
						</div>

						<div class="mb-4 grid grid-cols-2 gap-4">
							<div>
								<Skeleton class="mb-1 h-4 w-16 rounded" />
								<Skeleton class="h-5 w-12 rounded" />
							</div>
							<div>
								<Skeleton class="mb-1 h-4 w-20 rounded" />
								<Skeleton class="h-5 w-10 rounded" />
							</div>
						</div>

						<div class="mb-4">
							<Skeleton class="mb-2 h-4 w-20 rounded" />
							<Skeleton class="h-2 w-full rounded-full" />
						</div>

						<div class="flex items-center justify-between">
							<Skeleton class="h-4 w-24 rounded" />
							<Skeleton class="h-8 w-20 rounded-md" />
						</div>
					</div>
				{/each}
			</div>

			<!-- Pagination Skeleton -->
			{#if pagination.totalPages > 1}
				<div class="mt-6 flex justify-center">
					<div class="flex items-center space-x-2">
						<Skeleton class="h-10 w-10 rounded-md" />
						<Skeleton class="h-10 w-8 rounded-md" />
						<Skeleton class="h-10 w-8 rounded-md" />
						<Skeleton class="h-10 w-8 rounded-md" />
						<Skeleton class="h-10 w-10 rounded-md" />
					</div>
				</div>
			{/if}
		{:else if reports.length > 0}
			<div class="mb-6 grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
				{#each reports as report, index (report.id)}
					<div class="transform transition-all duration-500 ease-out {visibleReports.includes(index) ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}" style="transition-delay: {index * 50}ms">
						<ReportCard {report} />
					</div>
				{/each}
			</div>

			<!-- Pagination -->
			{#if pagination.totalPages > 1}
				<div class="mt-6 flex justify-center">
					<Pagination.Root count={pagination.totalReports} perPage={pagination.perPage} page={pagination.currentPage} onPageChange={handlePageChange}>
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
					<Activity class="dark:text-muted-foreground h-16 w-16 text-gray-700" />
				</div>
				<h3 class="dark:text-foreground mt-4 text-lg font-medium text-gray-900">
					{#if search}
						No reports found
					{:else}
						No reports yet
					{/if}
				</h3>
				<p class="dark:text-muted-foreground mt-2 text-sm text-gray-700">
					{#if search}
						No reports match your search criteria. Try adjusting your search terms.
					{:else}
						You haven't generated any quiz reports yet. Complete a quiz session to see reports here.
					{/if}
				</p>
			</div>
		{/if}
	</div>
</div>
