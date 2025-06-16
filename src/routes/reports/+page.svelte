<script lang="ts">
	import type { PageData } from "./$types"
	import { ReportsContent } from "./components"
	import AppHeader from "$lib/components/AppHeader.svelte"
	import Sidebar from "$lib/components/Sidebar.svelte"
	import { Toaster } from "$lib/components/ui/sonner"

	let { data }: { data: PageData } = $props()
</script>

<svelte:head>
	<title>My Reports - Quiz Learn</title>
	<meta name="description" content="View and manage your quiz reports" />
</svelte:head>

<Sidebar />

<div class="ml-64 min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
	<AppHeader title="My Reports" showJoinCode={false} />

	<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<div class="mb-8">
			<h1 class="mb-2 text-4xl font-bold text-white">My Reports</h1>
			<p class="text-gray-400">View and analyze your quiz reports with search, sort, and pagination</p>
		</div>

		<ReportsContent reports={data.sessionReports} pagination={data.pagination} search={data.search} sortBy={data.sortBy} sortOrder={data.sortOrder} />
	</main>
</div>

<Toaster richColors />
