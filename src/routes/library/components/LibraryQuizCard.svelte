<script lang="ts">
	import { goto, invalidateAll } from "$app/navigation"
	import { enhance, applyAction } from "$app/forms"
	import { page } from "$app/state"
	import { Globe, Lock, Edit, MoreVertical, Archive, Trash2, Send } from "@lucide/svelte"
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu"
	import { Button } from "$lib/components/ui/button"
	import { Badge } from "$lib/components/ui/badge"
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
	class="border-border bg-card hover:border-border hover:bg-card-hover block cursor-pointer rounded-lg border p-3 px-4 transition-all duration-200 select-none hover:shadow-lg"
	onclick={(e) => {
		// Navigate to quiz if not clicking on form or dropdown elements
		if (!(e.target as HTMLElement).closest("form") && !(e.target as HTMLElement).closest("[data-dropdown-menu-content]") && !(e.target as HTMLElement).closest('button[aria-haspopup="menu"]')) {
			goto(`/quiz/${quiz.id}`)
		}
	}}
	role="button"
	tabindex="0"
	onkeydown={(e) => {
		if (e.key === "Enter" || e.key === " ") {
			goto(`/quiz/${quiz.id}`)
		}
	}}
>
	<div class="flex items-center space-x-4">
		<!-- Left Section: Cover Image Placeholder -->
		<div class="flex-shrink-0">
			<div class="from-primary to-accent flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br">
				<span class="text-primary-foreground text-2xl">📝</span>
			</div>
		</div>

		<!-- Right Section: Quiz Details -->
		<div class="relative min-w-0 flex-1">
			<!-- Row 1: Quiz Title -->
			<div class="flex items-start justify-between">
				<div class="flex items-center space-x-2">
					<h3 class="text-foreground truncate pr-2 text-lg font-semibold">
						{quiz.title || "Untitled Quiz"}
					</h3>
					<div class="flex-shrink-0">
						{#if quiz.visibility === "public"}
							<Badge variant="default" class="text-foreground bg-green-500/20">
								<Globe class="mr-1 h-3 w-3" />
								Public
							</Badge>
						{:else if quiz.visibility === "private"}
							<Badge variant="secondary">
								<Lock class="mr-1 h-3 w-3" />
								Private
							</Badge>
						{/if}
					</div>
				</div>
			</div>

			<!-- Action Buttons Container - Positioned absolutely to center-right -->
			<div class="absolute top-1/2 right-0 flex flex-shrink-0 -translate-y-1/2 items-center space-x-2">
				<!-- Conditional Action Button -->
				{#if quiz.status === "draft" || quiz.status === "archived"}
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
						<Button type="submit" class="bg-primary text-primary-foreground hover:bg-primary-hover cursor-pointer">
							<Send class="me-2 h-4 w-4 " />
							Publish
						</Button>
					</form>
				{/if}

				{#if page.form?.error}
					<p class="mt-2 text-sm text-red-500">{page.form.error}</p>
				{/if}

				<!-- Edit Button -->
				<Button
					class="hover:bg-primary-hover cursor-pointer"
					onclick={(e) => {
						e.preventDefault()
						e.stopPropagation()
						goto(`/quiz/edit/${quiz.id}`)
					}}
					aria-label="Edit quiz"
				>
					<Edit class="me-2 h-4 w-4" />
					Edit
				</Button>

				<!-- 3 dot dropdown-menu -->
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props }: { props: Record<string, unknown> })}
							<Button
								{...props}
								class="hover:bg-primary-hover cursor-pointer"
								aria-label="More options"
								onclick={(e: MouseEvent) => {
									e.preventDefault()
									e.stopPropagation()
								}}
							>
								<MoreVertical class="h-4 w-4" />
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>

					<DropdownMenu.Content class="w-48" align="end">
						<!-- Visibility Toggle Form -->
						<form
							method="POST"
							action="?/toggleVisibility"
							use:enhance={() => {
								return async ({ result }) => {
									await applyAction(result)
									await invalidateAll()
								}
							}}
						>
							<input type="hidden" name="quizId" value={quiz.id} />
							<input type="hidden" name="visibility" value={quiz.visibility === "public" ? "private" : "public"} />
							<DropdownMenu.Item
								class="cursor-pointer"
								onclick={(e: MouseEvent) => {
									;(e.currentTarget as HTMLElement).closest("form")?.requestSubmit()
								}}
							>
								{#if quiz.visibility === "private"}
									<Globe class="text-foreground mr-2 h-4 w-4" />
									Make Public
								{:else}
									<Lock class="text-foreground mr-2 h-4 w-4" />
									Make Private
								{/if}
							</DropdownMenu.Item>
						</form>

						{#if quiz.status === "published"}
							<!-- Archive Form - Only for published quizzes -->
							<form
								method="POST"
								action="?/archiveQuiz"
								use:enhance={() => {
									return async ({ result }) => {
										await applyAction(result)
										await invalidateAll()
									}
								}}
							>
								<input type="hidden" name="quizId" value={quiz.id} />
								<DropdownMenu.Item
									class="cursor-pointer"
									onclick={(e: MouseEvent) => {
										;(e.currentTarget as HTMLElement).closest("form")?.requestSubmit()
									}}
								>
									<Archive class="text-foreground mr-2 h-4 w-4" />
									Archive
								</DropdownMenu.Item>
							</form>
						{:else if quiz.status === "draft" || quiz.status === "archived"}
							<!-- Delete Form - For draft and archived quizzes -->
							<form
								method="POST"
								action="?/deleteQuiz"
								use:enhance={() => {
									return async ({ result }) => {
										await applyAction(result)
										await invalidateAll()
									}
								}}
							>
								<input type="hidden" name="quizId" value={quiz.id} />
								<DropdownMenu.Item
									class="cursor-pointer"
									onclick={(e: MouseEvent) => {
										;(e.currentTarget as HTMLElement).closest("form")?.requestSubmit()
									}}
								>
									<Trash2 class="text-destructive mr-2 h-4 w-4" />
									Delete
								</DropdownMenu.Item>
							</form>
						{/if}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>

			<!-- Row 2: Creator and Time -->
			<div class="mt-1 flex items-center space-x-3 text-sm text-gray-400">
				<span class="text-muted-foreground">
					{quiz.creatorName || "Unknown Creator"}
				</span>
				<span>•</span>
				<span>
					{getTimeElapsed(quiz.createdAt)}
				</span>
			</div>

			<!-- Row 3: Question Count -->
			<div class="mt-2">
				<div class="text-muted-foreground flex items-center space-x-4 text-sm">
					<span class="text-muted-foreground">
						{quiz.questionCount || 0} question{(quiz.questionCount || 0) === 1 ? "" : "s"}
					</span>
					{#if quiz.description}
						<span>•</span>
						<span class="text-muted-foreground max-w-md truncate" title={quiz.description}>
							{quiz.description}
						</span>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
