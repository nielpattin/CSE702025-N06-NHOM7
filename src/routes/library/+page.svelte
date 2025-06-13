<script lang="ts">
	import { page } from "$app/state"
	import { goto } from "$app/navigation"
	import Sidebar from "$lib/components/Sidebar.svelte"
	import DashboardHeader from "$lib/components/DashboardHeader.svelte"
	import { LibraryFilterPanel, LibraryContent } from "./components"
	import type { QuizStatus, QuizVisibility } from "$lib/server/db/schema"

	// Type for quiz data returned from the server
	type QuizWithDetails = {
		id: number
		title: string | null
		description: string | null
		creatorId: string | null
		status: QuizStatus | null
		visibility: QuizVisibility | null
		createdAt: Date | null
		updatedAt: Date | null
		creatorName: string | null
		questionCount: number
	}

	let data = $derived(page.data)
	let session = $derived(data.session ?? null)
	let { quizzes, userQuizzesCount } = $derived(data)

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

	// Filter quizzes based on active filter and tab
	let filteredQuizzes = $derived(
		(() => {
			if (activeFilter === "createdByMe") {
				return quizzes.filter((quiz: QuizWithDetails) => quiz.creatorId === session?.user?.id && quiz.status === activeTab)
			} else if (activeFilter === "likedByMe") {
				// For now, return empty array as this functionality isn't implemented yet
				return []
			} else if (activeFilter === "sharedWithMe") {
				// For now, return empty array as this functionality isn't implemented yet
				return []
			}
			return []
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

	// Tab configuration
	const tabs = [
		{ id: "published" as const, label: "Published", icon: "🌟" },
		{ id: "draft" as const, label: "Drafts", icon: "📝" },
		{ id: "archived" as const, label: "Archived", icon: "📦" }
	]

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

	function setActiveTab(tabId: QuizStatus) {
		// Update URL to reflect the active tab - activeTab will update automatically via $derived
		const url = new URL(page.url)
		url.searchParams.set("tab", tabId)
		goto(url.toString(), { replaceState: true, noScroll: true })
	}
</script>

<svelte:head>
	<title>Quiz Library - Quiz Learn</title>
	<meta name="description" content="Browse and manage your quiz collection" />
</svelte:head>

<!-- Sidebar Component -->
<Sidebar />

<div class="ml-64 min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
	<!-- Dashboard Header Component -->
	<DashboardHeader title="Quiz Library" />

	<!-- Main Content -->
	<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Search Bar -->
		<div class="mb-8">
			<div class="relative">
				<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
					<svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
					</svg>
				</div>
				<input type="text" placeholder="Search your quizzes..." class="block w-full rounded-lg border border-gray-600 bg-gray-800/50 py-3 pr-3 pl-10 text-white placeholder-gray-400 backdrop-blur focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none" />
			</div>
		</div>

		<!-- Two-Column Layout -->
		<div class="flex gap-8">
			<!-- Left Section: Filter Panel (40% width) -->
			<LibraryFilterPanel {activeFilter} {userQuizzesCount} onFilterChange={setActiveFilter} />

			<!-- Right Section: Content Area (60% width) -->
			<LibraryContent {activeFilter} {activeTab} {tabs} {quizzes} {filteredQuizzes} {session} onTabChange={setActiveTab} />
		</div>
	</main>
</div>
