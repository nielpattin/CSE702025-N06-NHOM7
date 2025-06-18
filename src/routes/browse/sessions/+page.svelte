<script lang="ts">
	import { page } from "$app/state"
	import { goto, invalidateAll } from "$app/navigation"
	import AppHeader from "$lib/components/AppHeader.svelte"
	import { ChevronRight, Home, Search, Users, Clock, Star, User, Play, Filter, X } from "@lucide/svelte"
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card"
	import { Button } from "$lib/components/ui/button"
	import { Input } from "$lib/components/ui/input"
	import { Badge } from "$lib/components/ui/badge"
	import * as Pagination from "$lib/components/ui/pagination"
	import * as Select from "$lib/components/ui/select"
	import { Skeleton } from "$lib/components/ui/skeleton"
	import SortButtons from "$lib/components/ui/sort-buttons.svelte"
	import { Calendar, BookOpen } from "@lucide/svelte"
	import { onMount } from "svelte"
	import { navigationStore } from "$lib/stores/navigation"

	let data = $derived(page.data)
	let { sessions, pagination, search, sortBy, sortOrder, difficultyFilter: initialDifficultyFilter } = $derived(data)
	let currentPage = $derived(pagination.currentPage)

	let searchInput = $state("")
	let isPageLoading = $state(true)
	let isPaginationLoading = $state(false)
	let difficultyFilter = $state("")
	let visibleSessions = $state<number[]>([])

	$effect(() => {
		searchInput = search || ""
		difficultyFilter = initialDifficultyFilter || ""
	})

	$effect(() => {
		visibleSessions = []
		const itemCount = isPageLoading || isPaginationLoading ? 6 : sessions.length
		setTimeout(() => {
			Array.from({ length: itemCount }, (_, index) => {
				setTimeout(() => {
					visibleSessions = [...visibleSessions, index]
				}, index * 50)
			})
		}, 100)
	})

	onMount(() => {
		navigationStore.stopLoading()
		setTimeout(() => {
			isPageLoading = false
		}, 500)
	})

	const difficultyOptions = [
		{ value: "", label: "All Difficulties" },
		{ value: "easy", label: "Beginner" },
		{ value: "medium", label: "Intermediate" },
		{ value: "hard", label: "Advanced" }
	]

	function getDifficultyLabel(value: string) {
		return difficultyOptions.find((opt) => opt.value === value)?.label || "All Difficulties"
	}

	function handleSearchChange(value: string) {
		searchInput = value
	}

	async function updateUrlParams(params: { [key: string]: string | number | undefined | null }) {
		isPaginationLoading = true
		const url = new URL(page.url)

		for (const key in params) {
			const value = params[key]
			if (value === undefined || value === null || value === "") {
				url.searchParams.delete(key)
			} else {
				url.searchParams.set(key, String(value))
			}
		}

		await goto(url.toString(), {
			invalidateAll: true,
			noScroll: true
		})

		setTimeout(() => {
			isPaginationLoading = false
		}, 800)
	}

	async function handleSearch() {
		await updateUrlParams({
			search: searchInput.trim(),
			difficulty: difficultyFilter,
			page: 1
		})
	}

	async function handleDifficultyFilter(difficulty: string | undefined) {
		await updateUrlParams({
			difficulty: difficulty,
			search: searchInput.trim(),
			page: 1
		})
	}

	async function handlePageChange(newPageNumber: number) {
		await updateUrlParams({
			page: newPageNumber > 1 ? newPageNumber : undefined,
			search: searchInput.trim(),
			difficulty: difficultyFilter
		})
	}

	async function handleSort(key: "createdAt" | "title" | "participants" | "rating") {
		const newSortOrder = sortBy === key ? (sortOrder === "asc" ? "desc" : "asc") : "desc"
		await updateUrlParams({
			sortBy: key,
			sortOrder: newSortOrder,
			search: searchInput.trim(),
			difficulty: difficultyFilter,
			page: 1
		})
	}

	function joinSession(sessionId: string) {
		goto(`/play/session/${sessionId}`)
	}

	function getDifficultyColor(difficulty: string) {
		switch (difficulty.toLowerCase()) {
			case "beginner":
				return "bg-green-500"
			case "intermediate":
				return "bg-yellow-500"
			case "advanced":
				return "bg-red-500"
			default:
				return "bg-gray-500"
		}
	}

	function formatTimeAgo(date: Date) {
		const now = new Date()
		const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)

		if (diffInSeconds < 60) return "Just now"
		if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
		if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
		return `${Math.floor(diffInSeconds / 86400)}d ago`
	}
</script>

<svelte:head>
	<title>Browse Sessions - Quiz Learn</title>
	<meta name="description" content="Join active quiz sessions happening right now" />
</svelte:head>

<div class="bg-background min-h-screen">
	<AppHeader title="Browse Sessions" />

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
					<span class="font-medium text-white">Sessions</span>
				</li>
			</ol>
		</nav>

		<!-- Search and Sort Controls -->
		<div class="bg-card mb-6 rounded-lg p-6 shadow-lg backdrop-blur">
			<div class="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
				<div class="relative flex-1">
					<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
					<Input
						value={searchInput}
						oninput={(e) => handleSearchChange(e.currentTarget.value)}
						onkeydown={(e) => {
							if (e.key === "Enter") handleSearch()
							if (e.key === "Escape") {
								searchInput = ""
								handleSearch()
							}
						}}
						placeholder="Search quiz sessions..."
						class="border-border bg-muted pr-10 pl-10 text-white placeholder-gray-400"
					/>
					{#if searchInput}
						<Button
							variant="ghost"
							size="sm"
							onclick={() => {
								searchInput = ""
								handleSearch()
							}}
							class="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 p-0 text-gray-400 hover:bg-transparent hover:text-white"
						>
							<X class="h-4 w-4" />
							<span class="sr-only">Clear search</span>
						</Button>
					{/if}
				</div>

				<Select.Root type="single" bind:value={difficultyFilter} onValueChange={handleDifficultyFilter}>
					<Select.Trigger class="border-border bg-muted hover:bg-muted w-[180px] text-white">
						<Filter class="mr-2 h-4 w-4" />
						{getDifficultyLabel(difficultyFilter)}
					</Select.Trigger>
					<Select.Content class="border-border bg-card">
						{#each difficultyOptions as option (option.value)}
							<Select.Item value={option.value} label={option.label} class="hover:bg-muted focus:bg-muted text-white">
								{option.label}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>

				<SortButtons
					options={[
						{ key: "participants", label: "Participants", icon: Users },
						{ key: "rating", label: "Rating", icon: Star },
						{ key: "title", label: "Quiz Name", icon: BookOpen },
						{ key: "createdAt", label: "Created", icon: Calendar }
					]}
					currentSortKey={sortBy}
					currentSortOrder={sortOrder}
					onSort={(key) => handleSort(key as "createdAt" | "title" | "participants" | "rating")}
				/>
			</div>

			{#if difficultyFilter || search}
				<div class="mt-4 flex flex-wrap items-center gap-3">
					<span class="text-sm font-medium text-gray-400">Active filters:</span>
					{#if difficultyFilter}
						<Badge variant="secondary" class="bg-blue-600 text-white">
							{getDifficultyLabel(difficultyFilter)}
							<button onclick={() => handleDifficultyFilter("")} class="ml-1 hover:text-gray-300">
								<X class="h-3 w-3" />
							</button>
						</Badge>
					{/if}
					{#if search}
						<Badge variant="secondary" class="bg-green-600 text-white">
							Search: "{search}"
							<button
								onclick={() => {
									searchInput = ""
									handleSearch()
								}}
								class="ml-1 hover:text-gray-300"
							>
								<X class="h-3 w-3" />
							</button>
						</Badge>
					{/if}
					<div class="ml-auto text-sm text-gray-400">
						{pagination.totalSessions} total session{pagination.totalSessions === 1 ? "" : "s"}
					</div>
				</div>
			{/if}
		</div>

		<!-- Sessions Grid -->
		{#if isPageLoading || isPaginationLoading}
			<div class="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
				{#each Array(6) as _, i (i)}
					<Card class="border-border bg-card">
						<CardHeader class="pb-3">
							<div class="flex items-start space-x-3">
								<Skeleton class="h-14 w-14 rounded-lg" />
								<div class="flex-1 space-y-2">
									<Skeleton class="h-4 w-3/4" />
									<Skeleton class="h-3 w-1/2" />
									<div class="flex gap-1.5">
										<Skeleton class="h-5 w-16" />
										<Skeleton class="h-5 w-12" />
										<Skeleton class="h-5 w-10" />
									</div>
								</div>
							</div>
						</CardHeader>
						<CardContent class="pt-0">
							<div class="space-y-3">
								<div class="flex items-center justify-between">
									<Skeleton class="h-4 w-20" />
									<Skeleton class="h-4 w-16" />
								</div>
								<div class="flex items-center justify-between">
									<Skeleton class="h-4 w-24" />
									<Skeleton class="h-5 w-12" />
								</div>
								<Skeleton class="h-8 w-full" />
							</div>
						</CardContent>
					</Card>
				{/each}
			</div>
		{:else if sessions.length > 0}
			<div class="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
				{#each sessions as session, index (session.id)}
					<div class="transform transition-all duration-500 ease-out {visibleSessions.includes(index) ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}" style="transition-delay: {index * 50}ms">
						<Card class="border-border bg-card hover:bg-secondary/70 transition-colors">
							<CardHeader class="pb-3">
								<div class="flex items-start space-x-3">
									<div class="flex-shrink-0">
										{#if session.quiz.imageUrl}
											<img src={session.quiz.imageUrl} alt={session.quiz.title} class="h-14 w-14 rounded-lg object-cover" />
										{:else}
											<div class="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
												<BookOpen class="h-7 w-7 text-white" />
											</div>
										{/if}
									</div>
									<div class="min-w-0 flex-1">
										<CardTitle class="line-clamp-2 text-sm leading-tight font-medium text-white" title={session.quiz.title}>
											{session.quiz.title}
										</CardTitle>
										<CardDescription class="mt-1 truncate text-xs text-gray-300" title={`by ${session.host.name}`}>
											by {session.host.name}
										</CardDescription>
										<div class="mt-2 flex flex-wrap items-center gap-1.5">
											<Badge class="{getDifficultyColor(session.quiz.difficulty)} text-xs">
												{session.quiz.difficulty}
											</Badge>
											<span class="flex items-center text-xs text-gray-400">
												<Clock class="mr-1 h-3 w-3" />
												{session.quiz.duration}
											</span>
											<span class="flex items-center text-xs text-gray-400">
												<Star class="mr-1 h-3 w-3 text-yellow-400" fill="currentColor" />
												{session.quiz.rating?.toFixed(1)}
											</span>
										</div>
									</div>
								</div>
							</CardHeader>
							<CardContent class="pt-0">
								<div class="space-y-3">
									<div class="flex items-center justify-between text-sm">
										<div class="flex items-center text-gray-300">
											<Users class="mr-1 h-4 w-4" />
											{session.participantCount} participant{session.participantCount !== 1 ? "s" : ""}
										</div>
										<div class="text-gray-400">
											{formatTimeAgo(session.createdAt)}
										</div>
									</div>

									<div class="flex items-center justify-between">
										<div class="min-w-0 flex-1 text-sm text-gray-300">
											Code: <span class="font-mono font-bold text-blue-400">{session.code}</span>
										</div>
										<Badge variant="secondary" class="ml-2 flex-shrink-0 border-green-600/50 bg-green-600/20 text-green-400">LIVE</Badge>
									</div>

									<Button onclick={() => joinSession(session.id)} class="w-full" size="sm">
										<Play class="mr-2 h-4 w-4" />
										Join Session
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				{/each}
			</div>
		{:else}
			<div class="py-12 text-center">
				<div class="mx-auto flex h-24 w-24 items-center justify-center opacity-50">
					<Users class="h-16 w-16 text-gray-400" />
				</div>
				<h3 class="mt-4 text-lg font-medium text-white">No active sessions found</h3>
				<p class="mt-2 text-gray-400">
					{#if search || difficultyFilter}
						Try adjusting your search terms or filters or check back later for new sessions.
					{:else}
						There are no active quiz sessions at the moment. Check back later!
					{/if}
				</p>
			</div>
		{/if}

		<!-- Pagination -->
		{#if pagination && pagination.totalSessions > pagination.perPage}
			<div class="mt-8 flex justify-center">
				<Pagination.Root count={pagination.totalSessions} perPage={pagination.perPage} page={currentPage} onPageChange={handlePageChange}>
					{#snippet children({ pages, currentPage: paginationCurrentPage })}
						<Pagination.Content>
							<Pagination.Item class="cursor-pointer">
								<Pagination.PrevButton />
							</Pagination.Item>
							{#each pages as page (page.key)}
								{#if page.type === "ellipsis"}
									<Pagination.Item>
										<Pagination.Ellipsis />
									</Pagination.Item>
								{:else}
									<Pagination.Item>
										<Pagination.Link class="cursor-pointer" {page} isActive={paginationCurrentPage === page.value}>
											{page.value}
										</Pagination.Link>
									</Pagination.Item>
								{/if}
							{/each}
							<Pagination.Item>
								<Pagination.NextButton class="cursor-pointer" />
							</Pagination.Item>
						</Pagination.Content>
					{/snippet}
				</Pagination.Root>
			</div>
		{/if}
	</main>
</div>
