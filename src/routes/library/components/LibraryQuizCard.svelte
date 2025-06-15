<script lang="ts">
	import { goto, invalidateAll } from "$app/navigation"
	import { enhance, applyAction } from "$app/forms"
	import { page } from "$app/state"
	import { GlobeOutline, LockSolid, PenOutline } from "flowbite-svelte-icons"
	import type { QuizStatus, QuizVisibility } from "$lib/server/db/schema"

	interface Quiz {
		id: number
		title: string | null
		description: string | null
		status: QuizStatus | null
		visibility: QuizVisibility | null
		createdAt: Date | null
		questionCount?: number
		creatorName?: string
	}

	let { quiz }: { quiz: Quiz } = $props()

	// State for dropdown menu visibility
	let isDropdownOpen = $state(false)
	let loading = $state(false)

	// Toggle dropdown menu
	function toggleDropdown(e: Event) {
		e.preventDefault()
		e.stopPropagation()
		isDropdownOpen = !isDropdownOpen
	}

	// Close dropdown when clicking outside
	function closeDropdown() {
		isDropdownOpen = false
	}

	// Svelte action for handling click outside
	function clickOutside(node: HTMLElement, callback: () => void) {
		const handleClick = (event: MouseEvent) => {
			if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
				callback()
			}
		}

		document.addEventListener("click", handleClick, true)

		return {
			destroy() {
				document.removeEventListener("click", handleClick, true)
			}
		}
	}

	// Calculate time elapsed since creation
	function getTimeElapsed(date: Date | null): string {
		if (!date) return "Unknown"

		const now = new Date()
		const diffMs = now.getTime() - date.getTime()
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
		const diffMinutes = Math.floor(diffMs / (1000 * 60))

		if (diffDays > 0) {
			return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`
		} else if (diffHours > 0) {
			return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`
		} else if (diffMinutes > 0) {
			return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`
		} else {
			return "Just now"
		}
	}
</script>

<div
	class="block cursor-pointer rounded-lg border border-gray-700 bg-gray-700/50 p-3 px-4 transition-all duration-200 select-none hover:border-gray-600 hover:bg-gray-900/50 hover:shadow-lg"
	onclick={(e) => {
		// Navigate to quiz if not clicking on form or dropdown elements
		if (!(e.target as HTMLElement).closest("form") && !(e.target as HTMLElement).closest('[role="menu"]') && !(e.target as HTMLElement).closest('button[aria-label="More options"]')) {
			goto(`/quiz/${quiz.id}`)
		}
	}}
	role="button"
	tabindex="0"
	onkeydown={(e) => {
		if (e.key === "Enter" || e.key === " ") {
			goto(`/quiz/${quiz.id}`)
		}
		if (e.key === "Escape" && isDropdownOpen) {
			closeDropdown()
		}
	}}
>
	<div class="flex items-center space-x-4">
		<!-- Left Section: Cover Image Placeholder -->
		<div class="flex-shrink-0">
			<div class="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
				<span class="text-2xl text-white">📝</span>
			</div>
		</div>

		<!-- Right Section: Quiz Details -->
		<div class="relative min-w-0 flex-1">
			<!-- Row 1: Quiz Title -->
			<div class="flex items-start justify-between">
				<h3 class="truncate pr-24 text-lg font-semibold text-white">
					{quiz.title || "Untitled Quiz"}
				</h3>
			</div>

			<!-- Action Buttons Container - Positioned absolutely to center-right -->
			<div class="absolute top-1/2 right-0 flex flex-shrink-0 -translate-y-1/2 items-center space-x-2">
				<!-- Conditional Action Button -->
				{#if quiz.status === "draft"}
					<form
						method="POST"
						action="?/publishQuiz"
						use:enhance={() => {
							return async ({ result }) => {
								await applyAction(result)
							}
						}}
					>
						<input type="hidden" name="quizId" value={quiz.id} />
						<button type="submit" class="cursor-pointer rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"> 📤 Publish </button>
					</form>
				{/if}

				{#if page.form?.error}
					<p class="mt-2 text-sm text-red-500">{page.form.error}</p>
				{/if}

				<!-- Edit Button -->
				<button
					class="flex h-8 cursor-pointer items-center justify-center rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none"
					onclick={(e) => {
						e.preventDefault()
						e.stopPropagation()
						goto(`/quiz/edit/${quiz.id}`)
					}}
					aria-label="Edit quiz"
				>
					<PenOutline class="me-2 h-4 w-4" />
					Edit
				</button>

				<!-- Three-dots Options Button and Dropdown Container -->
				<div class="relative">
					<button class="flex h-8 cursor-pointer items-center justify-center rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-white transition-colors hover:bg-gray-800 focus:outline-none" onclick={toggleDropdown} aria-label="More options">
						<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
							<circle cx="8" cy="3" r="1.5"></circle>
							<circle cx="8" cy="8" r="1.5"></circle>
							<circle cx="8" cy="13" r="1.5"></circle>
						</svg>
					</button>

					<!-- Dropdown Menu -->
					{#if isDropdownOpen}
						<div class="ring-opacity-5 absolute top-full right-0 z-10 mt-2 w-48 rounded-md bg-gray-800 shadow-lg ring-1 ring-black" role="menu" use:clickOutside={closeDropdown}>
							<div class="py-1">
								<!-- Visibility Toggle Form -->
								<form
									method="POST"
									action="?/toggleVisibility"
									use:enhance={() => {
										closeDropdown()
										return async ({ result }) => {
											await applyAction(result)
											await invalidateAll()
										}
									}}
								>
									<input type="hidden" name="quizId" value={quiz.id} />
									<input type="hidden" name="visibility" value={quiz.visibility === "public" ? "private" : "public"} />
									<button type="submit" class="flex w-full cursor-pointer items-center px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white" role="menuitem">
										{#if quiz.visibility === "private"}
											<GlobeOutline class="mr-2 h-4 w-4" />
											Make Public
										{:else}
											<LockSolid class="mr-2 h-4 w-4" />
											Make Private
										{/if}
									</button>
								</form>

								{#if quiz.status === "published"}
									<!-- Archive Form - Only for published quizzes -->
									<form
										method="POST"
										action="?/archiveQuiz"
										use:enhance={() => {
											closeDropdown()
											return async ({ result }) => {
												await applyAction(result)
												await invalidateAll()
											}
										}}
									>
										<input type="hidden" name="quizId" value={quiz.id} />
										<button type="submit" class="block w-full cursor-pointer px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white" role="menuitem"> 📦 Archive </button>
									</form>
								{:else if quiz.status === "draft" || quiz.status === "archived"}
									<!-- Delete Form - For draft and archived quizzes -->
									<form
										method="POST"
										action="?/deleteQuiz"
										use:enhance={() => {
											closeDropdown()
											return async ({ result }) => {
												await applyAction(result)
												await invalidateAll()
											}
										}}
									>
										<input type="hidden" name="quizId" value={quiz.id} />
										<button type="submit" class="block w-full cursor-pointer px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 hover:text-red-300" role="menuitem"> 🗑️ Delete </button>
									</form>
								{/if}
							</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- Row 2: Creator and Time -->
			<div class="mt-1 flex items-center space-x-3 text-sm text-gray-400">
				<span>
					{quiz.creatorName || "Unknown Creator"}
				</span>
				<span>•</span>
				<span>
					{getTimeElapsed(quiz.createdAt)}
				</span>
			</div>

			<!-- Row 3: Question Count -->
			<div class="mt-2">
				<div class="flex items-center space-x-4 text-sm text-gray-300">
					<span>
						{quiz.questionCount || 0} question{(quiz.questionCount || 0) === 1 ? "" : "s"}
					</span>
					{#if quiz.description}
						<span>•</span>
						<span class="max-w-xs truncate" title={quiz.description}>
							{quiz.description}
						</span>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
