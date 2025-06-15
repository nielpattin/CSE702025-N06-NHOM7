<script lang="ts">
	import LibraryQuizCard from "./LibraryQuizCard.svelte"
	import type { QuizStatus, QuizVisibility } from "$lib/server/db/schema"
	import type { Session } from "@auth/sveltekit"
	import { ChevronDoubleUpOutline, ChevronDoubleDownOutline } from "flowbite-svelte-icons"
	import * as Tabs from "$lib/components/ui/tabs"
	import { Button } from "$lib/components/ui/button"
	import { Input } from "$lib/components/ui/input"
	import { Star, FileText, Archive, Search, X } from "@lucide/svelte"

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
		onTabChange: (tabId: QuizStatus) => void
		onSortChange: (sortKey: "createdAt" | "title") => void
		onSortOrderChange: () => void
		onSearchChange: (value: string) => void
		onSearchSubmit: () => void
		onSearchClear: () => void
	}

	let { activeFilter, activeTab, quizzes, userQuizzesCount, session, sortKey, sortOrder, searchInput, search, onTabChange, onSortChange, onSortOrderChange, onSearchChange, onSearchSubmit, onSearchClear }: Props = $props()

	const tabs = [
		{ id: "published" as const, label: "Published", icon: Star, color: "text-yellow-400", activeColor: "text-yellow-300" },
		{ id: "draft" as const, label: "Drafts", icon: FileText, color: "text-blue-400", activeColor: "text-blue-300" },
		{ id: "archived" as const, label: "Archived", icon: Archive, color: "text-gray-400", activeColor: "text-gray-300" }
	]

	function handleSort(key: "createdAt" | "title") {
		if (sortKey === key) {
			onSortOrderChange()
		} else {
			onSortChange(key)
		}
	}
</script>

<!-- Right Section: Tab Navigation and Quiz List (60% width) -->
<div class="w-full">
	{#if activeFilter === "createdByMe"}
		<!-- Tab Navigation for Created by Me -->
		<div class="mb-8">
			<Tabs.Root value={activeTab} onValueChange={(value: string) => onTabChange(value as QuizStatus)} class="w-full">
				<Tabs.List class="flex h-auto w-fit space-x-2 rounded-lg bg-gray-800 p-2">
					{#each tabs as tab (tab.id)}
						<Tabs.Trigger
							value={tab.id}
							class="flex cursor-pointer items-center rounded-md border-transparent px-6 py-1 text-base font-medium transition-all duration-200 hover:bg-gray-700
								data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white
								data-[state=active]:shadow-lg {activeTab === tab.id ? 'text-white' : tab.color}"
						>
							<tab.icon class="mr-2 h-4 w-4 {activeTab === tab.id ? tab.activeColor : tab.color}" />
							<span class={activeTab === tab.id ? "text-white" : tab.color}>{tab.label}</span>
							<span class="ml-1 rounded-full bg-gray-600 px-3 py-1 text-xs text-gray-300">
								{userQuizzesCount[tab.id]}
							</span>
						</Tabs.Trigger>
					{/each}
				</Tabs.List>

				<!-- Search Bar -->
				<div class="mt-4 mb-4">
					<div class="relative flex items-center space-x-2">
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
					</div>

					{#if search}
						<div class="mt-3 flex items-center justify-between">
							<p class="text-muted-foreground text-sm">
								Showing results for: <span class="text-foreground font-medium">"{search}"</span>
							</p>
						</div>
					{/if}
				</div>

				{#each tabs as tab (tab.id)}
					<Tabs.Content value={tab.id} class="">
						<!-- Content Area for Created by Me -->
						<div class="rounded-lg bg-gray-800/50 p-3 shadow-lg backdrop-blur">
							<!-- Sort Controls -->
							<div class="mb-3 flex justify-end">
								<div class="flex items-center space-x-3">
									<span class="text-sm font-medium text-gray-400">Sort by:</span>
									<button
										onclick={() => handleSort("createdAt")}
										class="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors
										{sortKey === 'createdAt' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'}"
									>
										Date Created
										{#if sortKey === "createdAt"}
											{#if sortOrder === "asc"}
												<ChevronDoubleUpOutline class="h-4 w-4" />
											{:else}
												<ChevronDoubleDownOutline class="h-4 w-4" />
											{/if}
										{/if}
									</button>
									<button
										onclick={() => handleSort("title")}
										class="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors
										{sortKey === 'title' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'}"
									>
										Title
										{#if sortKey === "title"}
											{#if sortOrder === "asc"}
												<ChevronDoubleUpOutline class="h-4 w-4" />
											{:else}
												<ChevronDoubleDownOutline class="h-4 w-4" />
											{/if}
										{/if}
									</button>
								</div>
							</div>
							<!-- Quiz List -->
							{#if quizzes.length > 0}
								<div class="space-y-4">
									{#each quizzes as quiz (quiz.id)}
										<LibraryQuizCard {quiz} />
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
			</Tabs.Root>
		</div>
	{:else}
		<!-- Empty state for Liked by Me and Shared with Me -->
		<div class="rounded-lg bg-gray-800/50 p-6 shadow-lg backdrop-blur">
			<div class="py-12 text-center">
				<div class="mx-auto h-24 w-24 text-6xl opacity-50">
					{#if activeFilter === "likedByMe"}
						❤️
					{:else if activeFilter === "sharedWithMe"}
						📤
					{/if}
				</div>
				<h3 class="mt-4 text-lg font-medium text-white">
					{#if activeFilter === "likedByMe"}
						Liked Quizzes
					{:else if activeFilter === "sharedWithMe"}
						Shared Quizzes
					{/if}
				</h3>
				<p class="mt-2 text-gray-400">
					{#if activeFilter === "likedByMe"}
						This feature is coming soon. You'll be able to see all the quizzes you've liked here.
					{:else if activeFilter === "sharedWithMe"}
						This feature is coming soon. You'll be able to see all the quizzes shared with you here.
					{/if}
				</p>
			</div>
		</div>
	{/if}
</div>
