<script lang="ts">
	import { page } from "$app/state"
	import AppHeader from "$lib/components/AppHeader.svelte"
	import { TrendingQuizzes } from "./components"

	let data = $derived(page.data)
	let session = $derived(data.session)

	// State for search
	let searchQuery = $state("")

	function handleSearchQuiz() {
		if (searchQuery.trim()) {
			// TODO: Implement search logic
			console.log("Searching for:", searchQuery)
		}
	}
</script>

<svelte:head>
	<title>Dashboard - Quiz Learn</title>
	<meta name="description" content="Quiz Learn Dashboard - Manage your quizzes and learning progress" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
	<!-- Dashboard Header Component -->
	<AppHeader title="Dashboard" />

	<!-- Main Content -->
	<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Main Content Area -->
		<div>
			<!-- Welcome Section -->
			<div class="mb-8">
				<h1 class="mb-2 text-3xl font-bold text-white">
					Welcome back, {session?.user?.name || "User"}! 👋
				</h1>
				<p class="text-gray-400">Ready to create, learn, and explore quizzes today?</p>
			</div>

			<!-- Search Section -->
			<div class="mb-8">
				<div class="relative mx-auto w-full max-w-2xl">
					<input type="text" placeholder="Search quizzes..." bind:value={searchQuery} onkeydown={(e) => e.key === "Enter" && handleSearchQuiz()} class="w-full rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
					<button onclick={handleSearchQuiz} class="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-white" aria-label="Search quizzes">
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</button>
				</div>
			</div>

			<!-- Trending Quizzes Section -->
			<TrendingQuizzes />
		</div>
	</main>
</div>
