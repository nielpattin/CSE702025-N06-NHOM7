<script lang="ts">
	import type { PageData } from "./$types"
	import { ReportsContent } from "./components"
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
	<title>My Reports - Quiz Learn</title>
	<meta name="description" content="View and manage your quiz reports" />
</svelte:head>

<div class="bg-background min-h-screen">
	<AppHeader title="My Reports" />

	<main class="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
		{#if isLoading}
			<!-- Full page skeleton during initial load -->
			<div class="w-full">
				<div class="mb-8">
					<div class="bg-card rounded-lg p-6 shadow-lg backdrop-blur">
						<div class="mb-6">
							<div class="relative flex items-center space-x-2">
								<div class="relative flex-1">
									<Skeleton class="h-10 w-full rounded-md" />
								</div>
								<Skeleton class="h-10 w-20 rounded-md" />
							</div>
						</div>

						<div class="mb-6 flex items-center justify-between">
							<div class="flex items-center space-x-3">
								<Skeleton class="h-4 w-16 rounded" />
								<Skeleton class="h-9 w-24 rounded-lg" />
								<Skeleton class="h-9 w-28 rounded-lg" />
								<Skeleton class="h-9 w-32 rounded-lg" />
								<Skeleton class="h-9 w-24 rounded-lg" />
								<Skeleton class="h-9 w-20 rounded-lg" />
							</div>
							<Skeleton class="h-4 w-24 rounded" />
						</div>

						<div class="mb-6 grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
							{#each Array(6) as _, i (i)}
								<div class="border-border bg-muted rounded-lg border p-6 shadow-lg backdrop-blur">
									<div class="mb-4 flex items-start justify-between">
										<div class="flex-1">
											<Skeleton class="mb-2 h-6 w-3/4 rounded" />
											<Skeleton class="h-4 w-1/2 rounded" />
										</div>
										<Skeleton class="h-6 w-16 rounded-full" />
									</div>

									<div class="mb-4 grid grid-cols-2 gap-4">
										<div>
											<Skeleton class="mb-1 h-4 w-16 rounded" />
											<Skeleton class="h-5 w-12 rounded" />
										</div>
										<div>
											<Skeleton class="mb-1 h-4 w-20 rounded" />
											<Skeleton class="h-5 w-10 rounded" />
										</div>
									</div>

									<div class="mb-4">
										<Skeleton class="mb-2 h-4 w-20 rounded" />
										<Skeleton class="h-2 w-full rounded-full" />
									</div>

									<div class="flex items-center justify-between">
										<Skeleton class="h-4 w-24 rounded" />
										<Skeleton class="h-8 w-20 rounded-md" />
									</div>
								</div>
							{/each}
						</div>

						<div class="mt-6 flex justify-center">
							<div class="flex items-center space-x-2">
								<Skeleton class="h-10 w-10 rounded-md" />
								<Skeleton class="h-10 w-8 rounded-md" />
								<Skeleton class="h-10 w-8 rounded-md" />
								<Skeleton class="h-10 w-8 rounded-md" />
								<Skeleton class="h-10 w-10 rounded-md" />
							</div>
						</div>
					</div>
				</div>
			</div>
		{:else}
			<!-- Reports Content with Search, Sort, and Pagination -->
			<ReportsContent reports={data.sessionReports} pagination={data.pagination} search={data.search} sortBy={data.sortBy} sortOrder={data.sortOrder} {isPaginationLoading} onPaginationLoadingChange={(loading) => (isPaginationLoading = loading)} />
		{/if}
	</main>
</div>

<Toaster richColors />
