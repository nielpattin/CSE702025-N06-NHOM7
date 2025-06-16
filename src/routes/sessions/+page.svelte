<script lang="ts">
	import type { PageData } from "./$types"
	import { SessionsContent } from "./components"
	import AppHeader from "$lib/components/AppHeader.svelte"
	import Sidebar from "$lib/components/Sidebar.svelte"
	import { Toaster } from "$lib/components/ui/sonner"

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
	<AppHeader title="My Sessions" showJoinCode={false} />

	<!-- Main Content -->
	<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Page Header -->
		<div class="mb-8">
			<h1 class="mb-2 text-4xl font-bold text-white">My Sessions</h1>
			<p class="text-gray-400">View and manage your quiz sessions with search, sort, and pagination</p>
		</div>

		<!-- Sessions Content with Search, Sort, and Pagination -->
		<SessionsContent sessions={data.sessions} pagination={data.pagination} search={data.search} sortBy={data.sortBy} sortOrder={data.sortOrder} />
	</main>
</div>

<Toaster richColors />
