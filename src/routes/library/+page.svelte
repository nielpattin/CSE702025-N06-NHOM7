<script lang="ts">
	import { page } from "$app/state"
	import { goto, invalidateAll } from "$app/navigation"
	import AppHeader from "$lib/components/AppHeader.svelte"
	import { LibraryQuizCard, LibraryQuizCardSkeleton } from "./components"
	import type { QuizStatus } from "$lib/server/db/schema"
	import * as Pagination from "$lib/components/ui/pagination"
	import { Skeleton } from "$lib/components/ui/skeleton"
	import { navigationStore } from "$lib/stores/navigation"
	import { onMount } from "svelte"
	import { Star, FileText, Archive, Search, X, Calendar, BookOpen } from "@lucide/svelte"
	import * as Tabs from "$lib/components/ui/tabs"
	import { Button } from "$lib/components/ui/button"
	import { Input } from "$lib/components/ui/input"
	import SortButtons from "$lib/components/ui/sort-buttons.svelte"

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

	// Read tab query parameter from URL and reactively set activeTab
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

	async function setActiveTab(tabId: QuizStatus) {
		window.scrollTo({ top: 0, behavior: "smooth" })

		const url = new URL(page.url)
		url.searchParams.set("tab", tabId)
		url.searchParams.delete("page")
		await goto(url.toString(), {
			invalidateAll: true,
			noScroll: true
		})
	}

	async function toggleSortOrder() {
		// Toggle between 'asc' and 'desc' while preserving all other URL parameters
		const url = new URL(page.url)
		const newSortOrder = sortOrder === "asc" ? "desc" : "asc"
		url.searchParams.set("sortOrder", newSortOrder)
		await goto(url.toString(), { replaceState: true, noScroll: true })
		await invalidateAll()
	}

	async function setSortKey(newSortKey: "createdAt" | "title") {
		const url = new URL(page.url)
		url.searchParams.set("sortBy", newSortKey)
		await goto(url.toString(), { replaceState: true, noScroll: true })
		await invalidateAll()
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

	const quizStatusTabs = [
		{ id: "published" as const, label: "Published", icon: Star, color: "text-yellow-400", activeColor: "text-yellow-300" },
		{ id: "draft" as const, label: "Drafts", icon: FileText, color: "text-blue-400", activeColor: "text-blue-300" },
		{ id: "archived" as const, label: "Archived", icon: Archive, color: "text-gray-400", activeColor: "text-gray-300" }
	]

	let visibleQuizzes = $state<number[]>([])
	let isLoadingQuizzes = $state(false)

	function handleTabChange(tabId: QuizStatus) {
		isLoadingQuizzes = true
		setActiveTab(tabId)
		setTimeout(() => {
			isLoadingQuizzes = false
		}, 600)
	}

	let sortedQuizzes = $derived(quizzes)

	function handleSort(key: "createdAt" | "title") {
		if (sortKey === key) {
			toggleSortOrder()
		} else {
			setSortKey(key)
		}
	}

	onMount(() => {
		setTimeout(() => {
			visibleQuizzes = sortedQuizzes.map((_: unknown, index: number) => index)
		}, 100)
	})

	$effect(() => {
		visibleQuizzes = []
		setTimeout(() => {
			sortedQuizzes.forEach((_: unknown, index: number) => {
				setTimeout(() => {
					visibleQuizzes = [...visibleQuizzes, index]
				}, index * 100)
			})
		}, 100)
	})
</script>

<svelte:head>
	<title>Quiz Library - Quiz Learn</title>
	<meta name="description" content="Browse and manage your quiz collection" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 select-none">
	<AppHeader title="Quiz Library" />

	<main class="mx-auto max-w-full px-4 pt-4 sm:px-6 lg:px-8">
		{#if isLoading}
			<div class="w-full">
				<div class="flex w-full flex-col md:flex-row md:items-start">
					<!-- Skeleton for vertical tabs -->
					<div class="flex h-auto w-fit shrink-0 space-x-2 rounded-lg bg-gray-800 p-2 md:w-48 md:flex-col md:space-y-2 md:space-x-0">
						{#each Array(3) as _, i (i)}
							<Skeleton class="h-12 w-full rounded-md" />
						{/each}
					</div>

					<!-- Skeleton for content area -->
					<div class="ml-0 flex-1 md:ml-4">
						<!-- Search bar skeleton -->
						<div class="mt-2 mb-4 flex items-center space-x-4">
							<div class="relative flex-1">
								<Skeleton class="h-10 w-full rounded-md" />
							</div>
							<Skeleton class="h-10 w-20 rounded-md" />
							<Skeleton class="h-10 w-24 rounded-md" />
						</div>

						<!-- Content skeleton -->
						<div class="rounded-lg bg-gray-800/50 p-3 shadow-lg backdrop-blur">
							<div class="space-y-4">
								{#each Array(4) as _, i (i)}
									<div class="rounded-lg border border-gray-700 bg-gray-700/50 p-3 px-4 shadow-sm">
										<div class="flex items-center space-x-4">
											<div class="flex-shrink-0">
												<Skeleton class="h-16 w-16 rounded-lg" />
											</div>

											<div class="relative min-w-0 flex-1">
												<div class="flex items-start justify-between">
													<div class="flex items-center space-x-2">
														<Skeleton class="h-6 w-48 rounded" />
														<Skeleton class="h-5 w-16 rounded-full" />
													</div>
												</div>

												<div class="absolute top-1/2 right-0 flex flex-shrink-0 -translate-y-1/2 items-center space-x-2">
													<Skeleton class="h-9 w-20 rounded-md" />
													<Skeleton class="h-9 w-16 rounded-md" />
													<Skeleton class="h-9 w-9 rounded-md" />
												</div>

												<div class="mt-1 flex items-center space-x-3">
													<Skeleton class="h-4 w-24 rounded" />
													<Skeleton class="h-4 w-1 rounded-full" />
													<Skeleton class="h-4 w-16 rounded" />
												</div>

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

				<!-- Pagination skeleton -->
				<div class="mt-8 flex justify-center">
					<div class="flex items-center space-x-2">
						<Skeleton class="h-10 w-10 rounded-md" />
						<Skeleton class="h-10 w-8 rounded-md" />
						<Skeleton class="h-10 w-8 rounded-md" />
						<Skeleton class="h-10 w-8 rounded-md" />
						<Skeleton class="h-10 w-10 rounded-md" />
					</div>
				</div>
			</div>
		{:else}
			<div class="w-full">
				<Tabs.Root value={activeTab} onValueChange={(value: string) => handleTabChange(value as QuizStatus)} class="flex w-full flex-col md:flex-row md:items-start">
					<Tabs.List class="flex h-auto w-fit shrink-0 space-x-2 rounded-lg bg-gray-800 p-2 md:w-48 md:flex-col md:space-y-2 md:space-x-0">
						{#each quizStatusTabs as tab (tab.id)}
							<Tabs.Trigger
								value={tab.id}
								class="flex h-12 w-full cursor-pointer items-center justify-between rounded-md border-transparent px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-gray-700
										data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white
										data-[state=active]:shadow-lg {activeTab === tab.id ? 'text-white' : tab.color}"
							>
								<div class="flex items-center">
									<tab.icon class="mr-2 h-4 w-4 shrink-0 {activeTab === tab.id ? tab.activeColor : tab.color}" />
									<span class={activeTab === tab.id ? "text-white" : tab.color}>{tab.label}</span>
								</div>
								<span class="ml-2 min-w-[28px] shrink-0 rounded-full bg-gray-600 px-2 py-1 text-center text-xs text-gray-300">
									{userQuizzesCount[tab.id]}
								</span>
							</Tabs.Trigger>
						{/each}
					</Tabs.List>

					<div class="ml-0 flex-1 md:ml-4">
						<div class="mt-2 flex items-center space-x-4">
							<div class="relative flex-1">
								<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
								<Input
									value={searchInput}
									oninput={(e) => handleSearchChange(e.currentTarget.value)}
									onkeydown={(e) => {
										if (e.key === "Enter") handleSearch()
										if (e.key === "Escape") clearSearch()
									}}
									placeholder="Search your quizzes..."
									class="pr-10 pl-10"
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
								Enter
							</Button>

							<SortButtons
								options={[
									{ key: "createdAt", label: "Date Created", icon: Calendar },
									{ key: "title", label: "Title", icon: BookOpen }
								]}
								currentSortKey={sortKey}
								currentSortOrder={sortOrder}
								onSort={(key) => handleSort(key as "createdAt" | "title")}
							/>
						</div>

						{#if data.search}
							<div class="mt-3 flex items-center justify-between">
								<p class="text-muted-foreground text-sm">
									Showing results for: <span class="text-foreground font-medium">"{data.search}"</span>
								</p>
							</div>
						{/if}

						{#each quizStatusTabs as tab (tab.id)}
							<Tabs.Content value={tab.id} class="">
								<div class="rounded-lg bg-gray-800/50 p-3 shadow-lg backdrop-blur">
									{#if isLoadingQuizzes || isPaginationLoading}
										<div class="space-y-4">
											{#each Array(4) as _, i (i)}
												<LibraryQuizCardSkeleton />
											{/each}
										</div>
									{:else if sortedQuizzes.length > 0}
										<div class="space-y-4">
											{#each sortedQuizzes as quiz, index (quiz.id)}
												<div class="transform transition-all duration-500 ease-out {visibleQuizzes.includes(index) ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}" style="transition-delay: {index * 50}ms">
													<LibraryQuizCard {quiz} />
												</div>
											{/each}
										</div>
									{:else}
										<div class="py-12 text-center">
											<div class="mx-auto flex h-24 w-24 items-center justify-center opacity-50">
												<tab.icon class="h-16 w-16 {tab.color}" />
											</div>
											<h3 class="mt-4 text-lg font-medium text-white">
												No {tab.label.toLowerCase()} quizzes
											</h3>
											<p class="mt-2 text-gray-400">
												{#if tab.id === "published"}
													You haven't published any quizzes yet. Create and publish your first quiz to see it here.
												{:else if tab.id === "draft"}
													No draft quizzes found. Start creating a new quiz to see drafts here.
												{:else}
													No archived quizzes found. Archive completed quizzes to organize your library.
												{/if}
											</p>
										</div>
									{/if}
								</div>
							</Tabs.Content>
						{/each}
					</div>
				</Tabs.Root>
			</div>

			{#if pagination && pagination.totalQuizzes > pagination.perPage}
				<div class="flex justify-center">
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

{#if showBackToTop}
	<button onclick={scrollToTop} class="fixed right-8 bottom-8 z-50 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none" aria-label="Back to top" title="Back to top">
		<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
		</svg>
	</button>
{/if}
