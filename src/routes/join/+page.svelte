<script lang="ts">
	import { page } from "$app/state"
	import { goto } from "$app/navigation"
	import DashboardHeader from "$lib/components/DashboardHeader.svelte"
	import RecentActivity from "$lib/components/RecentActivity.svelte"

	let data = $derived(page.data)
	let session = $derived(data.session)
</script>

<svelte:head>
	<title>Join Quiz</title>
	<meta name="description" content="Join a quiz session" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
	<DashboardHeader showJoinCode={false} />

	<!-- Main Content -->
	<main class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
		<div class="text-center">
			<h1 class="mb-8 text-4xl font-bold text-white">
				Join a <span class="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Quiz</span>
			</h1>

			<!-- Join Quiz Form -->
			<div class="mx-auto mb-12 max-w-md">
				<div class="rounded-lg border border-gray-700 bg-gray-800 p-8 shadow-xl">
					<div class="mb-6">
						<h2 class="mb-2 text-2xl font-bold text-white">Enter Quiz Code</h2>
						<p class="text-sm text-gray-400">Enter the code provided by your quiz host</p>
					</div>

					<div class="space-y-4">
						<input type="text" placeholder="Enter quiz code" class="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-center text-lg tracking-wider text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
						<button class="w-full rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 text-lg font-medium text-white transition-all hover:from-green-700 hover:to-emerald-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"> Join Quiz </button>
					</div>

					<div class="mt-6 border-t border-gray-700 pt-6">
						<p class="text-sm text-gray-400">
							Welcome back, {session?.user?.name || session?.user?.email}!
						</p>
					</div>
				</div>
			</div>
		</div>
		<RecentActivity />
	</main>
</div>
