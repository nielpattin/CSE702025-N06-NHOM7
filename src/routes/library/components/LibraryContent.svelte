<script lang="ts">
	import LibraryQuizCard from "./LibraryQuizCard.svelte"
	import LibraryQuizCardSkeleton from "./LibraryQuizCardSkeleton.svelte"
	import type { QuizStatus, QuizVisibility } from "$lib/server/db/schema"
	import type { Session } from "@auth/sveltekit"
	import * as Tabs from "$lib/components/ui/tabs"
	import { Button } from "$lib/components/ui/button"
	import { Input } from "$lib/components/ui/input"
	import { Star, FileText, Archive, Search, X, Calendar, BookOpen } from "@lucide/svelte"
	import SortButtons from "$lib/components/ui/sort-buttons.svelte"
	import { onMount } from "svelte"

	interface Quiz {
		id: number
		title: string | null
		description: string | null
		creatorId: string | null
		status: QuizStatus | null
		visibility: QuizVisibility | null
		createdAt: Date | null
		updatedAt: Date | null
	}

	interface Props {
		activeFilter: string
		activeTab: QuizStatus
		quizzes: Quiz[]
		userQuizzesCount: {
			published: number
			draft: number
			archived: number
		}
		session: Session | null
		sortKey: "createdAt" | "title"
		sortOrder: "asc" | "desc"
		searchInput: string
		search: string
		isPaginationLoading: boolean
		onTabChange: (tabId: QuizStatus) => void
		onSortChange: (sortKey: "createdAt" | "title") => void
		onSortOrderChange: () => void
		onSearchChange: (value: string) => void
		onSearchSubmit: () => void
		onSearchClear: () => void
	}

	let { activeFilter, activeTab, quizzes, userQuizzesCount, session, sortKey, sortOrder, searchInput, search, isPaginationLoading, onTabChange, onSortChange, onSortOrderChange, onSearchChange, onSearchSubmit, onSearchClear }: Props = $props()

	const libraryTabs = [
		{ id: "createdByMe" as const, label: "Created by Me", icon: FileText, filter: "createdByMe" },
		{ id: "likedByMe" as const, label: "Liked by Me", icon: Star, filter: "likedByMe" },
		{ id: "sharedWithMe" as const, label: "Shared with Me", icon: Archive, filter: "sharedWithMe" }
	]

	const quizStatusTabs = [
		{ id: "published" as const, label: "Published", icon: Star, color: "text-yellow-400", activeColor: "text-yellow-300" },
		{ id: "draft" as const, label: "Drafts", icon: FileText, color: "text-blue-400", activeColor: "text-blue-300" },
		{ id: "archived" as const, label: "Archived", icon: Archive, color: "text-gray-400", activeColor: "text-gray-300" }
	]

	let visibleQuizzes = $state<number[]>([])
	let isLoadingQuizzes = $state(false)

	function handleTabChange(tabId: QuizStatus) {
		isLoadingQuizzes = true
		onTabChange(tabId)
		setTimeout(() => {
			isLoadingQuizzes = false
		}, 600)
	}

	let sortedQuizzes = $derived(quizzes)

	function handleSort(key: "createdAt" | "title") {
		if (sortKey === key) {
			onSortOrderChange()
		} else {
			onSortChange(key)
		}
	}

	onMount(() => {
		setTimeout(() => {
			visibleQuizzes = sortedQuizzes.map((_, index) => index)
		}, 100)
	})

	$effect(() => {
		visibleQuizzes = []
		setTimeout(() => {
			sortedQuizzes.forEach((_, index) => {
				setTimeout(() => {
					visibleQuizzes = [...visibleQuizzes, index]
				}, index * 100)
			})
		}, 100)
	})
</script>

<!-- Right Section: Tab Navigation and Quiz List (60% width) -->
<div class="w-full">
	<!-- Tab Navigation for Created by Me -->
	<div>
		<Tabs.Root value={activeTab} onValueChange={(value: string) => handleTabChange(value as QuizStatus)} class="flex w-full flex-col md:flex-row">
			<Tabs.List class="bg-secondary flex h-auto w-fit space-x-2 rounded-lg p-2 md:flex-col md:space-y-2 md:space-x-0">
				{#each quizStatusTabs as tab (tab.id)}
					<Tabs.Trigger
						value={tab.id}
						class="hover:bg-muted flex cursor-pointer items-center rounded-md border-transparent px-6 py-1 text-base font-medium transition-all duration-200
								data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white
								data-[state=active]:shadow-lg {activeTab === tab.id ? 'text-white' : tab.color}"
					>
						<tab.icon class="mr-2 h-4 w-4 {activeTab === tab.id ? tab.activeColor : tab.color}" />
						<span class={activeTab === tab.id ? "text-white" : tab.color}>{tab.label}</span>
						<span class="bg-muted ml-1 rounded-full px-3 py-1 text-xs text-gray-300">
							{userQuizzesCount[tab.id]}
						</span>
					</Tabs.Trigger>
				{/each}
			</Tabs.List>

			<!-- Content Area -->
			<div class="ml-0 flex-1 md:ml-4">
				<!-- Search Bar -->
				<div class="mt-2 flex items-center space-x-4">
					<div class="relative flex-1">
						<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
						<Input
							value={searchInput}
							oninput={(e) => onSearchChange(e.currentTarget.value)}
							onkeydown={(e) => {
								if (e.key === "Enter") onSearchSubmit()
								if (e.key === "Escape") onSearchClear()
							}}
							placeholder="Search your quizzes..."
							class="pr-10 pl-10"
						/>
						{#if searchInput}
							<Button variant="ghost" size="sm" onclick={onSearchClear} class="text-muted-foreground hover:text-foreground absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 cursor-pointer p-0 hover:bg-transparent">
								<X class="h-4 w-4" />
								<span class="sr-only">Clear search</span>
							</Button>
						{/if}
					</div>

					<Button onclick={onSearchSubmit} variant="default" size="sm" class="cursor-pointer">
						<Search class="mr-2 h-4 w-4" />
						Enter
					</Button>

					<SortButtons
						options={[
							{ key: "createdAt", label: "Date Created", icon: Calendar },
							{ key: "title", label: "Title", icon: BookOpen }
						]}
						currentSortKey={sortKey}
						currentSortOrder={sortOrder}
						onSort={(key) => handleSort(key as "createdAt" | "title")}
					/>
				</div>

				{#if search}
					<div class="mt-3 flex items-center justify-between">
						<p class="text-muted-foreground text-sm">
							Showing results for: <span class="text-foreground font-medium">"{search}"</span>
						</p>
					</div>
				{/if}

				{#each quizStatusTabs as tab (tab.id)}
					<Tabs.Content value={tab.id} class="">
						<div class="bg-card rounded-lg p-3 shadow-lg backdrop-blur">
							{#if isLoadingQuizzes || isPaginationLoading}
								<div class="space-y-4">
									{#each Array(4) as _, i (i)}
										<LibraryQuizCardSkeleton />
									{/each}
								</div>
							{:else if sortedQuizzes.length > 0}
								<div class="space-y-4">
									{#each sortedQuizzes as quiz, index (quiz.id)}
										<div class="transform transition-all duration-500 ease-out {visibleQuizzes.includes(index) ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}" style="transition-delay: {index * 50}ms">
											<LibraryQuizCard {quiz} />
										</div>
									{/each}
								</div>
							{:else}
								<div class="py-12 text-center">
									<div class="mx-auto flex h-24 w-24 items-center justify-center opacity-50">
										<tab.icon class="h-16 w-16 {tab.color}" />
									</div>
									<h3 class="mt-4 text-lg font-medium text-white">
										No {tab.label.toLowerCase()} quizzes
									</h3>
									<p class="mt-2 text-gray-400">
										{#if tab.id === "published"}
											You haven't published any quizzes yet. Create and publish your first quiz to see it here.
										{:else if tab.id === "draft"}
											No draft quizzes found. Start creating a new quiz to see drafts here.
										{:else}
											No archived quizzes found. Archive completed quizzes to organize your library.
										{/if}
									</p>
								</div>
							{/if}
						</div>
					</Tabs.Content>
				{/each}
			</div>
		</Tabs.Root>
	</div>
</div>
