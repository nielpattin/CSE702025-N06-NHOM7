<script lang="ts">
	import LibraryQuizCard from "./LibraryQuizCard.svelte"
	import type { QuizStatus, QuizVisibility } from "$lib/server/db/schema"
	import type { Session } from "@auth/sveltekit"
	import { ChevronDoubleUpOutline, ChevronDoubleDownOutline } from "flowbite-svelte-icons"

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
		tabs: Array<{ id: QuizStatus; label: string; icon: string }>
		quizzes: Quiz[]
		filteredQuizzes: Quiz[]
		session: Session | null
		sortKey: "createdAt" | "title"
		sortOrder: "asc" | "desc"
		onTabChange: (tabId: QuizStatus) => void
		onSortChange: (sortKey: "createdAt" | "title") => void
		onSortOrderChange: () => void
	}

	let { activeFilter, activeTab, tabs, quizzes, filteredQuizzes, session, sortKey, sortOrder, onTabChange, onSortChange, onSortOrderChange }: Props = $props()

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
			<nav class="flex space-x-1 rounded-lg bg-gray-800 p-1">
				{#each tabs as tab (tab.id)}
					<button
						onclick={() => onTabChange(tab.id)}
						class="flex cursor-pointer items-center space-x-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200
							{activeTab === tab.id ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}"
					>
						<span>{tab.icon}</span>
						<span>{tab.label}</span>
						<span class="ml-1 rounded-full bg-gray-600 px-2 py-0.5 text-xs text-gray-300">
							{quizzes.filter((quiz) => quiz.creatorId === session?.user?.id && quiz.status === tab.id).length}
						</span>
					</button>
				{/each}
			</nav>
		</div>

		<!-- Content Area for Created by Me -->
		<div class="rounded-lg bg-gray-800/50 p-6 shadow-lg backdrop-blur">
			<!-- Sort Controls -->
			<div class="mb-6 flex justify-end">
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
			{#if filteredQuizzes.length > 0}
				<div class="space-y-4">
					{#each filteredQuizzes as quiz (quiz.id)}
						<LibraryQuizCard {quiz} />
					{/each}
				</div>
			{:else}
				<div class="py-12 text-center">
					<div class="mx-auto h-24 w-24 text-6xl opacity-50">
						{tabs.find((t) => t.id === activeTab)?.icon || "📚"}
					</div>
					<h3 class="mt-4 text-lg font-medium text-white">
						No {tabs.find((t) => t.id === activeTab)?.label.toLowerCase()} quizzes
					</h3>
					<p class="mt-2 text-gray-400">
						{#if activeTab === "published"}
							You haven't published any quizzes yet. Create and publish your first quiz to see it here.
						{:else if activeTab === "draft"}
							No draft quizzes found. Start creating a new quiz to see drafts here.
						{:else}
							No archived quizzes found. Archive completed quizzes to organize your library.
						{/if}
					</p>
				</div>
			{/if}
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
