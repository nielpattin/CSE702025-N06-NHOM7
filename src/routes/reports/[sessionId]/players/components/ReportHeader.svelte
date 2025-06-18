<script lang="ts">
	type Breadcrumb = {
		label: string
		href?: string
	}

	type QuizSession = {
		createdAt: Date | string | null
		status: "active" | "inactive" | "ended" | "expired" | "deleting"
		code: string
	}

	type Stats = {
		accuracy: number
		totalParticipants: number
		totalQuestions: number
	}

	let {
		quizSession,
		stats,
		formatDate,
		getAccuracyColor,
		title,
		breadcrumbs = []
	} = $props<{
		quizSession: QuizSession
		stats: Stats
		formatDate: (date: Date | string) => string
		getAccuracyColor: (accuracy: number) => string
		title: string
		breadcrumbs: Breadcrumb[]
	}>()

	const sessionAccuracyColor = $derived(getAccuracyColor(stats.accuracy))
</script>

<!-- Header Section -->
<div class="mb-8">
	<nav class="mb-4 flex" aria-label="Breadcrumb">
		<ol class="flex items-center space-x-2">
			{#each breadcrumbs as breadcrumb, index (breadcrumb.label)}
				<li>
					{#if breadcrumb.href && index < breadcrumbs.length - 1}
						<a href={breadcrumb.href} class="text-gray-400 transition-colors hover:text-white">
							{breadcrumb.label}
						</a>
					{:else}
						<span class="font-medium text-white">{breadcrumb.label}</span>
					{/if}
				</li>
				{#if index < breadcrumbs.length - 1}
					<li>
						<span class="text-gray-500">/</span>
					</li>
				{/if}
			{/each}
		</ol>
	</nav>
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-white">{title}</h1>
			<p class="mt-2 text-gray-300">Session created on {formatDate(quizSession.createdAt)}</p>
		</div>
		<div class="flex items-center space-x-2">
			<span class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium {quizSession.status === 'active' ? 'bg-green-100 text-green-800' : quizSession.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}">
				{quizSession.status}
			</span>
			<span class="text-gray-300">Code: {quizSession.code}</span>
		</div>
	</div>
</div>

<!-- Statistics Row -->
<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
	<div class="border-border bg-card rounded-lg border p-6 shadow-lg">
		<div class="flex items-center">
			<div class="flex-shrink-0">
				<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
					<svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
					</svg>
				</div>
			</div>
			<div class="ml-4">
				<p class="text-sm font-medium text-gray-400">Avg. Accuracy</p>
				<p class="text-2xl font-bold {sessionAccuracyColor}">{stats.accuracy}%</p>
			</div>
		</div>
	</div>

	<div class="border-border bg-card rounded-lg border p-6 shadow-lg">
		<div class="flex items-center">
			<div class="flex-shrink-0">
				<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500">
					<svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
					</svg>
				</div>
			</div>
			<div class="ml-4">
				<p class="text-sm font-medium text-gray-400">Participants</p>
				<p class="text-2xl font-bold text-white">{stats.totalParticipants}</p>
			</div>
		</div>
	</div>

	<div class="border-border bg-card rounded-lg border p-6 shadow-lg">
		<div class="flex items-center">
			<div class="flex-shrink-0">
				<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500">
					<svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
					</svg>
				</div>
			</div>
			<div class="ml-4">
				<p class="text-sm font-medium text-gray-400">Questions</p>
				<p class="text-2xl font-bold text-white">{stats.totalQuestions}</p>
			</div>
		</div>
	</div>
</div>
