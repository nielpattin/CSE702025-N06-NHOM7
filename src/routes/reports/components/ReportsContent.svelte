<script lang="ts">
	import { ReportCard } from "./index"
	import { goto } from "$app/navigation"
	import { page } from "$app/state"
	import { invalidateAll } from "$app/navigation"
	import { ChevronDoubleUpOutline, ChevronDoubleDownOutline } from "flowbite-svelte-icons"
	import { Button } from "$lib/components/ui/button"
	import { Input } from "$lib/components/ui/input"
	import * as Pagination from "$lib/components/ui/pagination"
	import { Search, X, Calendar, Users, Activity, BookOpen, Target } from "@lucide/svelte"
	import type { PageData } from "../$types"

	interface Props {
		reports: PageData["sessionReports"]
		pagination: PageData["pagination"]
		search: string
		sortBy: string
		sortOrder: string
	}

	let { reports, pagination, search, sortBy, sortOrder }: Props = $props()

	let searchInput = $state(search)
	let currentSortKey = $state<"createdDate" | "sessionName" | "participantCount" | "status" | "accuracy">((sortBy as "createdDate" | "sessionName" | "participantCount" | "status" | "accuracy") || "createdDate")
	let currentSortOrder = $state<"asc" | "desc">((sortOrder as "asc" | "desc") || "desc")

	$effect(() => {
		searchInput = search
		currentSortKey = (sortBy as "createdDate" | "sessionName" | "participantCount" | "status" | "accuracy") || "createdDate"
		currentSortOrder = (sortOrder as "asc" | "desc") || "desc"
	})

	function handleSort(key: "createdDate" | "sessionName" | "participantCount" | "status" | "accuracy") {
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

	function handlePageChange(newPage: number) {
		updateUrl({ page: newPage })
	}

	const sortOptions = [
		{ key: "createdDate" as const, label: "Date Created", icon: Calendar },
		{ key: "sessionName" as const, label: "Quiz Name", icon: BookOpen },
		{ key: "participantCount" as const, label: "Participants", icon: Users },
		{ key: "accuracy" as const, label: "Accuracy", icon: Target },
		{ key: "status" as const, label: "Status", icon: Activity }
	]
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
							placeholder="Search reports by quiz name..."
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
							{pagination.totalReports} report{pagination.totalReports === 1 ? "" : "s"} found
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
					{pagination.totalReports} total report{pagination.totalReports === 1 ? "" : "s"}
				</div>
			</div>

			<!-- Reports Grid -->
			{#if reports.length > 0}
				<div class="mb-6 grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
					{#each reports as report (report.id)}
						<ReportCard {report} />
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
						<Activity class="h-16 w-16 text-gray-400" />
					</div>
					<h3 class="mt-4 text-lg font-medium text-white">
						{#if search}
							No reports found
						{:else}
							No reports yet
						{/if}
					</h3>
					<p class="mt-2 text-gray-400">
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
</div>
