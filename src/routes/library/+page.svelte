<script lang="ts">
	import { page } from "$app/state"
	import { goto, invalidateAll } from "$app/navigation"
	import AppHeader from "$lib/components/AppHeader.svelte"
	import { LibraryFilterPanel, LibraryContent } from "./components"
	import type { QuizStatus } from "$lib/server/db/schema"
	import * as Pagination from "$lib/components/ui/pagination"
	import { Skeleton } from "$lib/components/ui/skeleton"
	import { navigationStore } from "$lib/stores/navigation"
	import { onMount } from "svelte"

	let showBackToTop = $state(false)
	let isPageVisible = $state(false)
	let isLoading = $state(true)
	let isPaginationLoading = $state(false)

	let data = $derived(page.data)
	let session = $derived(data.session ?? null)
	let { quizzes, userQuizzesCount, pagination } = $derived(data)
	let currentPage = $derived(pagination.currentPage)

	let searchInput = $state("")

	$effect(() => {
		searchInput = data.search || ""
	})

	// Read filter query parameter from URL and set active filter
	let activeFilter = $derived<"createdByMe" | "likedByMe" | "sharedWithMe">(
		(() => {
			const filterParam = page.url.searchParams.get("filter")
			return filterParam === "createdByMe" || filterParam === "likedByMe" || filterParam === "sharedWithMe" ? filterParam : "createdByMe"
		})()
	)

	// Read tab query parameter from URL and reactively set activeTab (only for createdByMe filter)
	let activeTab = $derived<QuizStatus>(
		(() => {
			const tabParam = page.url.searchParams.get("tab")
			return tabParam === "published" || tabParam === "draft" || tabParam === "archived" ? tabParam : "published"
		})()
	)

	// Read sortOrder query parameter from URL and set current sort order
	let sortOrder = $derived<"asc" | "desc">(
		(() => {
			const sortParam = page.url.searchParams.get("sortOrder")
			return sortParam === "asc" || sortParam === "desc" ? sortParam : "desc"
		})()
	)

	// Read sortKey query parameter from URL and set current sort key
	let sortKey = $derived<"createdAt" | "title">(
		(() => {
			const sortParam = page.url.searchParams.get("sortBy")
			return sortParam === "createdAt" || sortParam === "title" ? sortParam : "createdAt"
		})()
	)

	// Navigate to default filter if none is set
	$effect(() => {
		if (!page.url.searchParams.get("filter")) {
			const url = new URL(page.url)
			url.searchParams.set("filter", "createdByMe")
			goto(url.toString(), { replaceState: true, noScroll: true })
		}
	})

	function setActiveFilter(filterId: "createdByMe" | "likedByMe" | "sharedWithMe") {
		// Update URL to reflect the active filter
		const url = new URL(page.url)
		url.searchParams.set("filter", filterId)
		// Remove tab parameter when switching filters (will default to published for createdByMe)
		if (filterId !== "createdByMe") {
			url.searchParams.delete("tab")
		}
		goto(url.toString(), { replaceState: true, noScroll: true })
	}

	async function setActiveTab(tabId: QuizStatus) {
		isPaginationLoading = true

		window.scrollTo({ top: 0, behavior: "smooth" })

		const url = new URL(page.url)
		url.searchParams.set("tab", tabId)
		url.searchParams.delete("page")
		await goto(url.toString(), {
			invalidateAll: true,
			noScroll: true
		})

		setTimeout(() => {
			isPaginationLoading = false
		}, 800)
	}

	function toggleSortOrder() {
		// Toggle between 'asc' and 'desc' while preserving all other URL parameters
		const url = new URL(page.url)
		const newSortOrder = sortOrder === "asc" ? "desc" : "asc"
		url.searchParams.set("sortOrder", newSortOrder)
		goto(url.toString(), { replaceState: true, noScroll: true })
	}

	function setSortKey(newSortKey: "createdAt" | "title") {
		const url = new URL(page.url)
		url.searchParams.set("sortBy", newSortKey)
		goto(url.toString(), { replaceState: true, noScroll: true })
	}

	async function handlePageChange(newPageNumber: number) {
		isPaginationLoading = true

		window.scrollTo({ top: 0, behavior: "smooth" })

		const newUrl = new URL(page.url)

		if (newPageNumber > 1) {
			newUrl.searchParams.set("page", newPageNumber.toString())
		} else {
			newUrl.searchParams.delete("page")
		}

		await goto(newUrl.toString(), {
			invalidateAll: true,
			noScroll: true
		})

		setTimeout(() => {
			isPaginationLoading = false
		}, 800)
	}

	function handleSearchChange(value: string) {
		searchInput = value
	}

	function clearSearch() {
		searchInput = ""
		handleSearch()
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

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: "smooth" })
	}

	function handleScroll() {
		showBackToTop = window.scrollY > 300
	}

	$effect(() => {
		if (typeof window !== "undefined") {
			window.addEventListener("scroll", handleScroll)
			return () => window.removeEventListener("scroll", handleScroll)
		}
	})

	onMount(() => {
		navigationStore.stopLoading()
		setTimeout(() => {
			isLoading = false
			setTimeout(() => {
				isPageVisible = true
			}, 100)
		}, 500)
	})
</script>

<svelte:head>
	<title>Quiz Library - Quiz Learn</title>
	<meta name="description" content="Browse and manage your quiz collection" />
</svelte:head>

<!-- Sidebar Component -->

<div class=" min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 select-none">
	<!-- Dashboard Header Component -->
	<AppHeader title="Quiz Library" />

	<!-- Main Content -->
	<main class="mx-auto max-w-full px-4 py-8 sm:px-6 lg:px-8">
		{#if isLoading || isPaginationLoading}
			<!-- Skeleton Loading State -->
			<div class="flex gap-8">
				<!-- Left Section: Filter Panel Skeleton -->
				<div class="w-1/4">
					<div class="rounded-lg bg-gray-800/50 p-6 shadow-lg backdrop-blur">
						<div class="mb-6">
							<Skeleton class="mb-3 h-8 w-32 rounded" />
							<Skeleton class="h-4 w-48 rounded" />
						</div>
						<div class="space-y-3">
							{#each Array(3) as _, i (i)}
								<div class="flex items-center justify-between rounded-lg border border-gray-600 bg-gray-700/50 p-4">
									<div class="flex items-center space-x-3">
										<Skeleton class="h-5 w-5 rounded" />
										<Skeleton class="h-5 w-24 rounded" />
									</div>
									<Skeleton class="h-6 w-8 rounded-full" />
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- Right Section: Content Skeleton -->
				<div class="w-full">
					<!-- Tab Navigation Skeleton -->
					<div class="mb-8">
						<div class="mb-4 flex h-auto w-fit space-x-2 rounded-lg bg-gray-800 p-2">
							{#each Array(3) as _, i (i)}
								<Skeleton class="h-10 w-48 rounded-md" />
							{/each}
						</div>

						<!-- Search Bar Skeleton -->
						<div class="mt-4 mb-4">
							<div class="relative flex items-center space-x-2">
								<div class="relative flex-1">
									<Skeleton class="h-10 w-full rounded-md" />
								</div>
								<Skeleton class="h-10 w-20 rounded-md" />
							</div>
						</div>

						<!-- Content Area Skeleton -->
						<div class="rounded-lg bg-gray-800/50 p-3 shadow-lg backdrop-blur">
							<!-- Sort Controls Skeleton -->
							<div class="mb-3 flex justify-end">
								<div class="flex items-center space-x-3">
									<Skeleton class="h-4 w-16 rounded" />
									<Skeleton class="h-9 w-24 rounded-lg" />
									<Skeleton class="h-9 w-16 rounded-lg" />
								</div>
							</div>

							<!-- Quiz Cards Skeleton -->
							<div class="space-y-4">
								{#each Array(4) as _, i (i)}
									<div class="rounded-lg border border-gray-700 bg-gray-700/50 p-3 px-4 shadow-sm">
										<div class="flex items-center space-x-4">
											<!-- Left Section: Cover Image Skeleton -->
											<div class="flex-shrink-0">
												<Skeleton class="h-16 w-16 rounded-lg" />
											</div>

											<!-- Right Section: Quiz Details Skeleton -->
											<div class="relative min-w-0 flex-1">
												<!-- Row 1: Quiz Title and Badge -->
												<div class="flex items-start justify-between">
													<div class="flex items-center space-x-2">
														<Skeleton class="h-6 w-48 rounded" />
														<Skeleton class="h-5 w-16 rounded-full" />
													</div>
												</div>

												<!-- Action Buttons Container - Positioned absolutely to center-right -->
												<div class="absolute top-1/2 right-0 flex flex-shrink-0 -translate-y-1/2 items-center space-x-2">
													<Skeleton class="h-9 w-20 rounded-md" />
													<Skeleton class="h-9 w-16 rounded-md" />
													<Skeleton class="h-9 w-9 rounded-md" />
												</div>

												<!-- Row 2: Creator and Time -->
												<div class="mt-1 flex items-center space-x-3">
													<Skeleton class="h-4 w-24 rounded" />
													<Skeleton class="h-4 w-1 rounded-full" />
													<Skeleton class="h-4 w-16 rounded" />
												</div>

												<!-- Row 3: Question Count and Description -->
												<div class="mt-2">
													<div class="flex items-center space-x-4">
														<Skeleton class="h-4 w-16 rounded" />
														<Skeleton class="h-4 w-1 rounded-full" />
														<Skeleton class="h-4 w-24 rounded" />
													</div>
												</div>
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Pagination Skeleton -->
			<div class="mt-8 flex justify-center">
				<div class="flex items-center space-x-2">
					<Skeleton class="h-10 w-10 rounded-md" />
					<Skeleton class="h-10 w-8 rounded-md" />
					<Skeleton class="h-10 w-8 rounded-md" />
					<Skeleton class="h-10 w-8 rounded-md" />
					<Skeleton class="h-10 w-10 rounded-md" />
				</div>
			</div>
		{:else}
			<!-- Two-Column Layout -->
			<div class="flex gap-8">
				<!-- Left Section: Filter Panel (40% width) -->
				<LibraryFilterPanel {activeFilter} {userQuizzesCount} onFilterChange={setActiveFilter} />

				<!-- Right Section: Content Area (60% width) -->
				<LibraryContent {activeFilter} {activeTab} {quizzes} {userQuizzesCount} {session} {sortKey} {sortOrder} {searchInput} search={data.search || ""} onTabChange={setActiveTab} onSortChange={setSortKey} onSortOrderChange={toggleSortOrder} onSearchChange={handleSearchChange} onSearchSubmit={handleSearch} onSearchClear={clearSearch} />
			</div>
			<!-- Pagination -->
			{#if pagination && pagination.totalQuizzes > pagination.perPage}
				<div class="mt-8 flex justify-center">
					<Pagination.Root count={pagination.totalQuizzes} perPage={pagination.perPage} page={currentPage} onPageChange={handlePageChange}>
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
		{/if}
	</main>
</div>

<!-- Back to Top Button -->
{#if showBackToTop}
	<button onclick={scrollToTop} class="fixed right-8 bottom-8 z-50 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none" aria-label="Back to top" title="Back to top">
		<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
		</svg>
	</button>
{/if}
