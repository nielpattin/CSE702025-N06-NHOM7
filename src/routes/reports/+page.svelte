<script lang="ts">
	import Sidebar from "$lib/components/Sidebar.svelte"
	import AppHeader from "$lib/components/AppHeader.svelte"
	import * as Pagination from "$lib/components/ui/pagination"
	import { Button } from "$lib/components/ui/button"
	import { Search, X } from "@lucide/svelte"
	import { goto, invalidateAll } from "$app/navigation"
	import { page } from "$app/state"
	import type { PageData } from "./$types"

	let { data }: { data: PageData } = $props()

	const sessionReports = $derived(data.sessionReports)
	let searchInput = $state(data.search || "")

	let currentPage = $state(data.pagination.currentPage)

	$effect(() => {
		currentPage = data.pagination.currentPage
		searchInput = data.search || ""
		console.log("Component data updated. Current Page:", data.pagination.currentPage, "Total Reports:", data.pagination.totalReports, "Displayed Reports:", sessionReports.length)
	})

	function clearSearch() {
		searchInput = ""
		handleSearch()
	}

	async function handlePageChange(newPageNumber: number) {
		const newUrl = new URL(page.url)

		if (newPageNumber > 1) {
			newUrl.searchParams.set("page", newPageNumber.toString())
		} else {
			newUrl.searchParams.delete("page")
		}

		console.log("Navigating to URL:", newUrl.toString())
		await goto(newUrl.toString())
		await invalidateAll()
	}

	async function handleSearch() {
		const newUrl = new URL(page.url)

		if (searchInput.trim()) {
			newUrl.searchParams.set("search", searchInput.trim())
		} else {
			newUrl.searchParams.delete("search")
		}

		newUrl.searchParams.delete("page")

		await goto(newUrl.toString())
		await invalidateAll()
	}

	function getAccuracyColor(accuracy: number): string {
		if (accuracy >= 85) return "text-green-400"
		if (accuracy >= 75) return "text-yellow-400"
		return "text-red-400"
	}

	function formatDate(date: Date | string | null): string {
		if (!date) return "Unknown date"
		const dateObj = date instanceof Date ? date : new Date(date)
		return dateObj.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric"
		})
	}
</script>

<Sidebar />
<div class="ml-64 min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
	<AppHeader title="Reports" />

	<!-- Search Bar -->
	<div class="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
		<div class="relative flex items-center space-x-2">
			<div class="relative flex-1">
				<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
				<input
					type="text"
					bind:value={searchInput}
					onkeydown={(e) => {
						if (e.key === "Enter") handleSearch()
						if (e.key === "Escape") clearSearch()
					}}
					placeholder="Search quiz titles..."
					class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 pr-10 pl-10 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
				/>
				{#if searchInput}
					<Button variant="ghost" size="sm" onclick={clearSearch} class="text-muted-foreground hover:text-foreground absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 cursor-pointer p-0 hover:bg-transparent">
						<X class="h-4 w-4" />
						<span class="sr-only">Clear search</span>
					</Button>
				{/if}
			</div>

			<Button onclick={handleSearch} variant="default" size="sm" class="cursor-pointer">
				<Search class="mr-2 h-4 w-4" />
				Search
			</Button>
		</div>

		{#if data.search}
			<div class="mt-3 flex items-center justify-between">
				<p class="text-muted-foreground text-sm">
					Showing results for: <span class="text-foreground font-medium">"{data.search}"</span>
				</p>
			</div>
		{/if}
	</div>

	<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Reports Grid -->
		<div class="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
			{#each sessionReports as report (report.id)}
				<a href="/reports/{report.id}/players" class="block cursor-pointer rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg transition-transform hover:scale-105">
					<!-- Session Name -->
					<h3 class="mb-3 text-lg font-semibold text-white">{report.sessionName}</h3>

					<!-- Creation Date -->
					<div class="mb-4 flex items-center text-sm text-gray-400">
						<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
						Created: {formatDate(report.createdDate)}
					</div>

					<!-- Statistics -->
					<div class="flex items-center justify-between border-t border-gray-700 pt-4">
						<div class="text-sm text-gray-400">
							<span class="font-medium text-white">{report.participantCount}</span> participants
						</div>
						<div class="text-sm">
							<span class="text-gray-400">Avg. Accuracy: </span>
							<span class="font-bold {getAccuracyColor(report.accuracy)}">{report.accuracy}%</span>
						</div>
					</div>
				</a>
			{/each}
		</div>

		<!-- No Results Message -->
		{#if sessionReports.length === 0}
			<div class="py-12 text-center">
				<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
				<h3 class="mt-4 text-lg font-medium text-white">No reports found</h3>
				<p class="mt-2 text-sm text-gray-400">Try adjusting your search query to find the reports you're looking for.</p>
			</div>
		{/if}

		<!-- Pagination -->
		{#if data.pagination.totalReports > data.pagination.perPage}
			<div class="mt-8 flex justify-center">
				<Pagination.Root count={data.pagination.totalReports} perPage={data.pagination.perPage} page={currentPage} onPageChange={handlePageChange}>
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
	</main>
</div>
