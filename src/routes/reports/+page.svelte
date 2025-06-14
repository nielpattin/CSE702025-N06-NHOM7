<script lang="ts">
	import Sidebar from "$lib/components/Sidebar.svelte"
	import AppHeader from "$lib/components/AppHeader.svelte"
	import type { PageData } from "./$types"

	let { data }: { data: PageData } = $props()

	// Search state
	let searchQuery = $state("")

	// Filter reports based on search query
	const filteredReports = $derived(data.sessionReports.filter((report) => report.sessionName.toLowerCase().includes(searchQuery.toLowerCase())))

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
		<div class="relative">
			<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
				<svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
			</div>
			<input type="text" bind:value={searchQuery} placeholder="Search for report" class="block w-full rounded-md border border-gray-600 bg-gray-700 py-3 pr-3 pl-10 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none sm:text-sm" />
		</div>
	</div>

	<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Reports Grid -->
		<div class="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
			{#each filteredReports as report (report.id)}
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
		{#if filteredReports.length === 0}
			<div class="py-12 text-center">
				<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
				<h3 class="mt-4 text-lg font-medium text-white">No reports found</h3>
				<p class="mt-2 text-sm text-gray-400">Try adjusting your search query to find the reports you're looking for.</p>
			</div>
		{/if}
	</main>
</div>
