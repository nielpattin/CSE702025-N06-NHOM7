<script lang="ts">
	import type { PageData } from "./$types"
	import { SessionsContent } from "./components"
	import AppHeader from "$lib/components/AppHeader.svelte"

	import { Toaster } from "$lib/components/ui/sonner"
	import { Skeleton } from "$lib/components/ui/skeleton"
	import { navigationStore } from "$lib/stores/navigation"
	import { onMount } from "svelte"

	let { data }: { data: PageData } = $props()
	let isPageVisible = $state(false)
	let isLoading = $state(true)
	let isPaginationLoading = $state(false)

	onMount(() => {
		navigationStore.stopLoading()
		setTimeout(() => {
			isLoading = false
			setTimeout(() => {
				isPageVisible = true
			}, 100)
		}, 500)
	})
</script>

<svelte:head>
	<title>My Sessions - Quiz Learn</title>
	<meta name="description" content="View and manage your quiz sessions" />
</svelte:head>

<!-- Sidebar Component -->

<div class=" min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
	<!-- Dashboard Header Component -->
	<AppHeader title="My Sessions" />

	<!-- Main Content -->
	<main class="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
		{#if isLoading || isPaginationLoading}
			<div class="w-full">
				<div class="mb-8">
					<div class="rounded-lg bg-gray-800/50 p-6 shadow-lg backdrop-blur">
						<div class="mb-6">
							<div class="relative flex items-center space-x-4">
								<div class="relative flex-1">
									<Skeleton class="h-10 w-full rounded-md" />
								</div>
								<Skeleton class="h-10 w-20 rounded-md" />
							</div>

							<!-- Sort Controls skeleton -->
							<div class="mt-4 flex items-center justify-between">
								<Skeleton class="h-10 w-32 rounded-md" />
							</div>

							<!-- Total sessions skeleton -->
							<div class="mt-3">
								<Skeleton class="h-4 w-32 rounded" />
							</div>
						</div>

						<div class="mb-6 flex items-center justify-between">
							<div class="flex items-center space-x-3">
								<Skeleton class="h-4 w-16 rounded" />
								<Skeleton class="h-9 w-24 rounded-lg" />
								<Skeleton class="h-9 w-28 rounded-lg" />
								<Skeleton class="h-9 w-32 rounded-lg" />
								<Skeleton class="h-9 w-24 rounded-lg" />
							</div>
							<Skeleton class="h-4 w-24 rounded" />
						</div>

						<div class="mb-6 grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
							{#each Array(6) as _, i (i)}
								<div class="rounded-lg border border-gray-700 bg-gray-900/50 p-6">
									<div class="flex items-start space-x-4">
										<div class="flex-shrink-0">
											<Skeleton class="h-16 w-16 rounded-lg" />
										</div>

										<div class="min-w-0 flex-1">
											<div class="flex items-start justify-between">
												<div class="flex min-w-0 flex-1 items-start space-x-4">
													<Skeleton class="h-6 w-32 rounded" />
													<Skeleton class="h-5 w-16 rounded-full" />
												</div>
												<Skeleton class="h-8 w-8 rounded-md" />
											</div>

											<div class="mt-3 flex items-center justify-between">
												<Skeleton class="h-4 w-24 rounded" />
												<Skeleton class="h-4 w-20 rounded" />
											</div>
										</div>
									</div>
								</div>
							{/each}
						</div>

						<div class="mt-6 flex justify-center">
							<div class="flex items-center space-x-2">
								<Skeleton class="h-10 w-16 rounded-md" />
								<Skeleton class="h-10 w-8 rounded-md" />
								<Skeleton class="h-10 w-8 rounded-md" />
								<Skeleton class="h-10 w-8 rounded-md" />
								<Skeleton class="h-10 w-12 rounded-md" />
							</div>
						</div>
					</div>
				</div>
			</div>
		{:else}
			<!-- Sessions Content with Search, Sort, and Pagination -->
			<SessionsContent sessions={data.sessions} pagination={data.pagination} search={data.search} sortBy={data.sortBy} sortOrder={data.sortOrder} {isPaginationLoading} onPaginationLoadingChange={(loading) => (isPaginationLoading = loading)} />
		{/if}
	</main>
</div>

<Toaster richColors />
