<script lang="ts">
	import { Button } from "$lib/components/ui/button"
	import { Card, CardContent } from "$lib/components/ui/card"
	import { Badge } from "$lib/components/ui/badge"
	import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "$lib/components/ui/alert-dialog"
	import { Edit, Clock, Award, Check, ChevronDown, Trash2 } from "@lucide/svelte"
	import { onMount } from "svelte"

	interface Question {
		id: number
		content: string
		type: string | null
		timeLimit: number | null
		points: number | null
		options: Array<{
			id: number
			content: string
			correct: boolean
		}> | null
	}

	let { question, quizId, timeOptions, pointOptions, onTimeChange, onPointsChange, onDeleteQuestion } = $props<{
		question: Question
		quizId: number
		timeOptions: Array<{ value: number; label: string }>
		pointOptions: number[]
		onTimeChange: (questionId: number, timeValue: number) => void
		onPointsChange: (questionId: number, pointsValue: number) => void
		onDeleteQuestion?: (questionId: number) => void
	}>()

	let timeDropdownOpen = $state(false)
	let pointsDropdownOpen = $state(false)

	function getTimeLabel(seconds: number | null): string {
		if (!seconds) return "No limit"
		const option = timeOptions.find((opt: { value: number; label: string }) => opt.value === seconds)
		return option ? option.label : `${seconds}s`
	}

	function getQuestionTypeLabel(type: string | null): string {
		if (!type) return "N/A"
		return type.replace("_", " ").toUpperCase()
	}

	function selectTimeLimit(timeValue: number) {
		onTimeChange(question.id, timeValue)
		timeDropdownOpen = false
	}

	function selectPoints(pointsValue: number) {
		onPointsChange(question.id, pointsValue)
		pointsDropdownOpen = false
	}

	function handleKeydown(event: KeyboardEvent, type: "time" | "points") {
		if (event.key === "Escape") {
			timeDropdownOpen = false
			pointsDropdownOpen = false
		} else if (event.key === "Enter" || event.key === " ") {
			event.preventDefault()
			if (type === "time") {
				timeDropdownOpen = !timeDropdownOpen
				pointsDropdownOpen = false
			} else {
				pointsDropdownOpen = !pointsDropdownOpen
				timeDropdownOpen = false
			}
		}
	}

	function handleDeleteQuestion() {
		if (onDeleteQuestion) {
			onDeleteQuestion(question.id)
		}
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as Element
		const timeDropdown = target.closest(".time-dropdown")
		const pointsDropdown = target.closest(".points-dropdown")

		// Close dropdowns if clicking outside of them
		if (!timeDropdown) {
			timeDropdownOpen = false
		}
		if (!pointsDropdown) {
			pointsDropdownOpen = false
		}
	}

	onMount(() => {
		document.addEventListener("click", handleClickOutside)
		return () => {
			document.removeEventListener("click", handleClickOutside)
		}
	})
</script>

<Card class="relative">
	<CardContent class="pt-6">
		<!-- Question metadata -->
		<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
			<div class="flex flex-wrap items-center gap-3">
				<Badge variant="secondary">
					{getQuestionTypeLabel(question.type)}
				</Badge>

				<div class="time-dropdown relative flex items-center gap-2">
					<Clock class="text-muted-foreground h-4 w-4" />
					<Button
						variant="outline"
						size="sm"
						onclick={() => {
							timeDropdownOpen = !timeDropdownOpen
							pointsDropdownOpen = false
						}}
						onkeydown={(e) => handleKeydown(e, "time")}
						class="gap-2"
						aria-expanded={timeDropdownOpen}
						aria-haspopup="menu"
					>
						{getTimeLabel(question.timeLimit)}
						<ChevronDown class="h-4 w-4" />
					</Button>

					{#if timeDropdownOpen}
						<div class="bg-popover border-border absolute top-full left-0 z-50 mt-1 w-40 rounded-md border p-1 shadow-lg" role="menu" aria-label="Time limit options">
							<div class="max-h-60 overflow-y-auto">
								{#each timeOptions as option (option.value)}
									<button type="button" onclick={() => selectTimeLimit(option.value)} class="hover:bg-accent hover:text-accent-foreground block w-full rounded-sm px-3 py-2 text-left text-sm transition-colors {question.timeLimit === option.value ? 'bg-accent font-medium' : ''}" role="menuitem" aria-selected={question.timeLimit === option.value}>
										{option.label}
									</button>
								{/each}
							</div>
						</div>
					{/if}
				</div>

				<div class="points-dropdown relative flex items-center gap-2">
					<Award class="text-muted-foreground h-4 w-4" />
					<Button
						variant="outline"
						size="sm"
						onclick={() => {
							pointsDropdownOpen = !pointsDropdownOpen
							timeDropdownOpen = false
						}}
						onkeydown={(e) => handleKeydown(e, "points")}
						class="gap-2"
						aria-expanded={pointsDropdownOpen}
						aria-haspopup="menu"
					>
						{question.points || 0} pts
						<ChevronDown class="h-4 w-4" />
					</Button>

					{#if pointsDropdownOpen}
						<div class="bg-popover border-border absolute top-full left-0 z-50 mt-1 w-24 rounded-md border p-1 shadow-lg" role="menu" aria-label="Points options">
							<div class="max-h-60 overflow-y-auto">
								{#each pointOptions as pointValue (pointValue)}
									<button type="button" onclick={() => selectPoints(pointValue)} class="hover:bg-accent hover:text-accent-foreground block w-full rounded-sm px-3 py-2 text-left text-sm transition-colors {question.points === pointValue ? 'bg-accent font-medium' : ''}" role="menuitem" aria-selected={question.points === pointValue}>
										{pointValue}
									</button>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>

			<div class="flex items-center gap-2">
				<Button href="/quiz/edit/{quizId}/question/{question.id}" size="sm" class="gap-2">
					<Edit class="h-4 w-4" />
					Edit
				</Button>
				<AlertDialog>
					<AlertDialogTrigger>
						<Button variant="destructive" size="sm" class="gap-2" disabled={!onDeleteQuestion}>
							<Trash2 class="h-4 w-4" />
							Delete
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you sure?</AlertDialogTitle>
							<AlertDialogDescription>This action cannot be undone. This will permanently delete the question and all its answer options.</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction onclick={handleDeleteQuestion}>Delete Question</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</div>

		<!-- Question content -->
		<div class="mb-4">
			<h3 class="text-lg font-semibold">{question.content}</h3>
		</div>

		<!-- Options -->
		{#if question.options && question.options.length > 0}
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
				{#each question.options as option (option.id)}
					<div class="flex items-center gap-2 rounded-lg border p-3 {option.correct ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-border bg-muted'}">
						{#if option.correct}
							<Check class="h-4 w-4 text-green-600" />
						{/if}
						<span class="text-sm {option.correct ? 'text-green-900 dark:text-green-100' : 'text-muted-foreground'}">{option.content}</span>
					</div>
				{/each}
			</div>
		{:else}
			<div class="rounded-lg border border-dashed p-6 text-center">
				<p class="text-muted-foreground text-sm">No options configured</p>
			</div>
		{/if}
	</CardContent>
</Card>
