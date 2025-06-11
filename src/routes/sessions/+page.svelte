<script lang="ts">
	import type { PageData } from "./$types"
	import { SessionCard } from "./components"
	import DashboardHeader from "$lib/components/DashboardHeader.svelte"
	import Sidebar from "$lib/components/Sidebar.svelte"
	import { goto } from "$app/navigation"

	let { data }: { data: PageData } = $props()
</script>

<svelte:head>
	<title>My Sessions - Quiz Learn</title>
	<meta name="description" content="View and manage your quiz sessions" />
</svelte:head>

<!-- Sidebar Component -->
<Sidebar />

<div class="ml-64 min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
	<!-- Dashboard Header Component -->
	<DashboardHeader showJoinCode={false} />

	<!-- Main Content -->
	<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Page Header -->
		<div class="mb-8">
			<h1 class="mb-2 text-4xl font-bold text-white">My Sessions</h1>
			<p class="text-gray-400">View and manage your quiz sessions</p>
		</div>

		<!-- Sessions Content -->
		{#if data.sessions.length > 0}
			<div class="space-y-4">
				{#each data.sessions as session (session.id)}
					<SessionCard {session} />
				{/each}
			</div>
		{:else}
			<div class="rounded-lg border border-gray-700 bg-gray-800 py-16 text-center">
				<div class="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-700">
					<svg class="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
					</svg>
				</div>
				<h3 class="mb-2 text-xl font-semibold text-white">No Sessions Yet</h3>
				<p class="mb-4 text-lg text-gray-400">You haven't created any quiz sessions yet.</p>
				<p class="mb-6 text-gray-500">Start a quiz session from your library to see it here.</p>
				<button onclick={() => goto("/library")} class="inline-flex items-center rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none">
					<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
					</svg>
					Browse Library
				</button>
			</div>
		{/if}
	</main>
</div>
