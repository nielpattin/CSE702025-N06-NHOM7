<script lang="ts">
	import { page } from "$app/state"
	import AppHeader from "$lib/components/AppHeader.svelte"
	import { QuizDashboard } from "../../dashboard/components"
	import { ChevronRight, Home } from "@lucide/svelte"

	let data = $derived(page.data)
	let session = $derived(data.session)
</script>

<svelte:head>
	<title>Browse Quizzes - Quiz Learn</title>
	<meta name="description" content="Browse public quizzes created by the community" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
	<AppHeader title="Browse Quizzes" />

	<main class="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
		<!-- Breadcrumbs -->
		<nav class="mb-4" aria-label="Breadcrumb">
			<ol class="flex items-center space-x-2 text-sm text-gray-400">
				<li>
					<a href="/browse" class="flex items-center transition-colors hover:text-white">
						<Home class="mr-1 h-4 w-4" />
						Browse
					</a>
				</li>
				<li class="flex items-center">
					<ChevronRight class="mx-2 h-4 w-4" />
					<span class="font-medium text-white">Quizzes</span>
				</li>
			</ol>
		</nav>

		<QuizDashboard quizzes={data.quizzes || []} pagination={data.pagination || { currentPage: 1, perPage: 6, totalQuizzes: 0, totalPages: 0 }} search={data.search || ""} sortBy={data.sortBy || "participants"} sortOrder={data.sortOrder || "desc"} difficultyFilter={data.difficultyFilter || ""} />
	</main>
</div>
