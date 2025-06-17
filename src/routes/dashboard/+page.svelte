<script lang="ts">
	import { page } from "$app/state"
	import AppHeader from "$lib/components/AppHeader.svelte"
	import { QuizSearch } from "./components"

	let data = $derived(page.data)
	let session = $derived(data.session)
</script>

<svelte:head>
	<title>Dashboard - Quiz Learn</title>
	<meta name="description" content="Quiz Learn Dashboard - Manage your quizzes and learning progress" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
	<AppHeader title="Dashboard" />

	<main class="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
		<div class="mb-2">
			<h1 class="mb-2 text-3xl font-bold text-white">
				Welcome back, {session?.user?.name || "User"}! 👋
			</h1>
			<p class="text-gray-400">Ready to create, learn, and explore quizzes today?</p>
		</div>

		<QuizSearch quizzes={data.quizzes || []} pagination={data.pagination || { currentPage: 1, perPage: 6, totalQuizzes: 0, totalPages: 0 }} search={data.search || ""} sortBy={data.sortBy || "participants"} sortOrder={data.sortOrder || "desc"} difficultyFilter={data.difficultyFilter || ""} />
	</main>
</div>
