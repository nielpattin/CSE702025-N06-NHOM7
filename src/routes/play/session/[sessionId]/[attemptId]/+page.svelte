<script lang="ts">
	import { enhance, applyAction } from "$app/forms"
	import { goto } from "$app/navigation"
	import { onMount, onDestroy } from "svelte"
	import type { PageData } from "./$types"
	import AppHeader from "$lib/components/AppHeader.svelte"

	let { data }: { data: PageData } = $props()

	const { attempt, session, participant } = data

	// State management for questions and current position
	let questions = $state(data.questions)
	let currentQuestionIndex = $state(data.currentQuestionIndex)
	let totalQuestions = $state(data.totalQuestions)

	// State management
	let selectedOptionId = $state<number | null>(null)
	let selectedOptionIds = $state<Set<number>>(new Set())
	let isSubmitting = $state(false)
	let questionStartTime = $state(Date.now())
	let timeElapsed = $state(0)
	let showResult = $state(false)
	let lastResult = $state<{ correct: boolean; pointsAwarded: number } | null>(null)
	let resultCountdown = $state(0)
	let resultTimer: number | null = null
	let totalWaitTime = $state(0)

	// Timer for tracking time spent on current question
	let timer: number | null = null

	// Current question
	const currentQuestion = $derived(questions[currentQuestionIndex])
	const isLastQuestion = $derived(currentQuestionIndex === totalQuestions - 1)
	const progress = $derived(((currentQuestionIndex + 1) / totalQuestions) * 100)

	// Check if current question is already answered
	const isAnswered = $derived(currentQuestion?.attempt !== null)
	const canProceed = $derived((currentQuestion?.type === "multiple_choice" ? selectedOptionIds.size > 0 : selectedOptionId !== null) || isAnswered)

	onMount(() => {
		// Start timer
		questionStartTime = Date.now()
		timer = setInterval(() => {
			timeElapsed = Date.now() - questionStartTime
		}, 100) as unknown as number

		// If question is already answered, show the previous selection
		if (currentQuestion?.attempt) {
			if (currentQuestion.type === "multiple_choice") {
				// For multiple choice, we'll need to fetch the selected options from the server
				// For now, fallback to single selection for backward compatibility
				selectedOptionId = currentQuestion.attempt.selectedSessionOptionId
				if (selectedOptionId) {
					selectedOptionIds = new Set([selectedOptionId])
				}
			} else {
				selectedOptionId = currentQuestion.attempt.selectedSessionOptionId
			}
		}
	})

	onDestroy(() => {
		if (timer) {
			clearInterval(timer)
		}
		if (resultTimer) {
			clearInterval(resultTimer)
		}
	})

	// Format time display
	function formatTime(ms: number): string {
		const seconds = Math.floor(ms / 1000)
		const minutes = Math.floor(seconds / 60)
		const remainingSeconds = seconds % 60
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
	}

	// Handle option selection
	function selectOption(optionId: number) {
		if (!isAnswered) {
			if (currentQuestion?.type === "multiple_choice") {
				// For multiple choice, toggle selection (checkbox behavior)
				if (selectedOptionIds.has(optionId)) {
					selectedOptionIds.delete(optionId)
				} else {
					selectedOptionIds.add(optionId)
				}
				selectedOptionIds = new Set(selectedOptionIds) // Trigger reactivity
			} else {
				// For true/false, single selection (radio behavior)
				selectedOptionId = optionId
			}
		}
	}

	// Calculate reading time based on content length
	function calculateReadingTime(): number {
		const questionLength = currentQuestion?.content?.length || 0
		const optionsLength = currentQuestion?.options?.reduce((total, option) => total + (option?.content?.length || 0), 0) || 0
		const totalContent = questionLength + optionsLength

		// Base time: 2 seconds, plus 30ms per character (average reading speed)
		// Minimum 2 seconds, maximum 8 seconds
		const readingTime = Math.max(2000, Math.min(8000, 2000 + totalContent * 30))
		return readingTime
	}

	// Handle form submission for answers
	function handleSubmitAnswer() {
		return async ({ result }: { result: import("@sveltejs/kit").ActionResult }) => {
			isSubmitting = false

			if (result.type === "success" && result.data) {
				lastResult = {
					correct: result.data.correct,
					pointsAwarded: result.data.pointsAwarded
				}
				showResult = true

				// Check if quiz is completed
				if (result.data?.completed && result.data?.redirectTo) {
					// Show result briefly then navigate to results
					setTimeout(() => {
						goto(result.data!.redirectTo)
					}, 2000)
					return
				}

				// Fixed wait time of 2 seconds
				const waitTime = 2000
				totalWaitTime = 2
				resultCountdown = totalWaitTime

				// Start countdown timer
				resultTimer = setInterval(() => {
					resultCountdown--
					if (resultCountdown <= 0) {
						if (resultTimer) {
							clearInterval(resultTimer)
							resultTimer = null
						}
						showResult = false
						// Move to next question based on server response
						if (result.data?.nextQuestionIndex !== undefined) {
							currentQuestionIndex = result.data.nextQuestionIndex
							// Reset state for new question
							selectedOptionId = null
							questionStartTime = Date.now()
							timeElapsed = 0
						}
					}
				}, 1000) as unknown as number
			}
		}
	}

	// Move to next question
	function moveToNextQuestion() {
		if (currentQuestionIndex < totalQuestions - 1) {
			// Move to next question directly by updating state
			currentQuestionIndex = currentQuestionIndex + 1
			// Reset state for new question
			selectedOptionId = null
			questionStartTime = Date.now()
			timeElapsed = 0

			// If the new question is already answered, show the previous selection
			if (currentQuestion?.attempt) {
				selectedOptionId = currentQuestion.attempt.selectedSessionOptionId
			}
		}
	}

	// Handle complete attempt form submission
	function handleCompleteAttempt() {
		return async ({ result }: { result: import("@sveltejs/kit").ActionResult }) => {
			if (result.type === "success" && result.data) {
				if (result.data?.completed && result.data?.redirectTo) {
					goto(result.data.redirectTo)
				}
			}
		}
	}
</script>

<svelte:head>
	<title>Quiz - Question {currentQuestionIndex + 1} of {totalQuestions}</title>
</svelte:head>

<AppHeader title="Quiz in Progress" />

<div class="bg-secondary min-h-screen">
	<div class="container mx-auto px-4 py-8">
		<!-- Progress Header -->
		<div class="mx-auto mb-8 max-w-4xl">
			<div class="mb-4 flex items-center justify-between text-white">
				<div class="text-sm text-gray-300">
					Question {currentQuestionIndex + 1} of {totalQuestions}
				</div>
				<div class="text-sm text-gray-300">
					Time: {formatTime(timeElapsed)}
				</div>
			</div>

			<!-- Progress Bar -->
			<div class="bg-muted h-3 w-full rounded-full">
				<div class="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300" style="width: {progress}%"></div>
			</div>
		</div>

		<!-- Question Content -->
		<div class="mx-auto max-w-4xl">
			<div class="border-border bg-card rounded-lg border shadow-lg">
				<div class="border-border border-b px-6 py-4">
					<h1 class="text-2xl font-semibold text-white">
						{currentQuestion.content}
					</h1>
					{#if currentQuestion.points}
						<p class="mt-2 text-sm text-gray-400">
							Worth {currentQuestion.points} point{currentQuestion.points !== 1 ? "s" : ""}
						</p>
					{/if}
				</div>

				<div class="p-6">
					{#if !isAnswered}
						<!-- Answer Selection Form -->
						<form
							method="POST"
							action="?/submitAnswer"
							use:enhance={() => {
								isSubmitting = true
								return handleSubmitAnswer()
							}}
						>
							<input type="hidden" name="questionId" value={currentQuestion.id} />
							{#if currentQuestion.type === "multiple_choice"}
								{#each Array.from(selectedOptionIds) as optionId (optionId)}
									<input type="hidden" name="selectedOptionIds[]" value={optionId} />
								{/each}
							{:else}
								<input type="hidden" name="selectedOptionId" value={selectedOptionId} />
							{/if}
							<input type="hidden" name="timeTaken" value={timeElapsed} />

							<div class="space-y-3">
								{#each currentQuestion.options as option (option.id)}
									<label class="block cursor-pointer">
										<div class="border-border hover:bg-card flex items-center gap-4 rounded-lg border p-4 transition-all hover:border-blue-500 {selectedOptionIds.has(option.id) ? 'border-blue-500 bg-blue-900/20' : ''}">
											{#if currentQuestion.type === "multiple_choice"}
												<input type="checkbox" name="option" value={option.id} checked={selectedOptionIds.has(option.id)} onchange={() => selectOption(option.id)} class="h-4 w-4 text-blue-600" />
											{:else}
												<input type="radio" name="option" value={option.id} checked={selectedOptionId === option.id} onchange={() => selectOption(option.id)} class="h-4 w-4 text-blue-600" />
											{/if}
											<span class="text-white">{option.content}</span>
										</div>
									</label>
								{/each}
							</div>

							<div class="mt-6 flex justify-between">
								<div class="text-sm text-gray-400">Select an answer to continue</div>
								<button type="submit" disabled={!canProceed || isSubmitting} class="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
									{#if isSubmitting}
										<div class="flex items-center gap-2">
											<svg class="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
											</svg>
											Submitting...
										</div>
									{:else}
										Submit Answer
									{/if}
								</button>
							</div>
						</form>
					{:else}
						<!-- Already Answered - Show Selection -->
						<div class="space-y-3">
							{#each currentQuestion.options as option (option.id)}
								<div class="flex items-center gap-4 rounded-lg border p-4 {currentQuestion.attempt?.selectedOptionIds?.includes(option.id) ? 'border-blue-500 bg-blue-900/20' : 'border-border bg-secondary/20'}">
									{#if currentQuestion.type === "multiple_choice"}
										<div class="flex h-4 w-4 items-center justify-center rounded-sm border-2 {currentQuestion.attempt?.selectedOptionIds?.includes(option.id) ? 'border-blue-500 bg-blue-500' : 'border-gray-500'}">
											{#if currentQuestion.attempt?.selectedOptionIds?.includes(option.id)}
												<svg class="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
												</svg>
											{/if}
										</div>
									{:else}
										<div class="h-4 w-4 rounded-full border-2 {currentQuestion.attempt?.selectedSessionOptionId === option.id ? 'border-blue-500 bg-blue-500' : 'border-gray-500'}">
											{#if currentQuestion.attempt?.selectedSessionOptionId === option.id}
												<div class="h-full w-full scale-50 rounded-full bg-white"></div>
											{/if}
										</div>
									{/if}
									<span class="text-white">{option.content}</span>
									{#if currentQuestion.attempt?.selectedOptionIds?.includes(option.id) || currentQuestion.attempt?.selectedSessionOptionId === option.id}
										<span class="ml-auto text-sm text-blue-400">Your answer</span>
									{/if}
								</div>
							{/each}
						</div>

						<div class="mt-6 flex justify-between">
							<div class="text-sm text-gray-400">Question already answered</div>
							{#if isLastQuestion}
								<form method="POST" action="?/completeAttempt" use:enhance={handleCompleteAttempt}>
									<button type="submit" class="rounded-lg bg-green-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-green-700"> Complete Quiz </button>
								</form>
							{:else}
								<button onclick={moveToNextQuestion} class="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700"> Next Question </button>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Session Info -->
		<div class="mx-auto mt-8 max-w-4xl">
			<div class="border-border bg-muted rounded-lg border p-4">
				<div class="flex items-center justify-between text-sm text-gray-400">
					<div>Session: {session.code}</div>
					<div>Participant: {participant.name || "Anonymous"}</div>
					<div>Attempt #{attempt.attemptNumber}</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Result Popup -->
{#if showResult && lastResult}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="border-border bg-secondary rounded-lg border p-6 shadow-xl">
			<div class="text-center">
				{#if lastResult.correct}
					<div class="mb-4">
						<svg class="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<h3 class="mb-2 text-xl font-semibold text-green-400">Correct!</h3>
					<p class="text-gray-300">You earned {lastResult.pointsAwarded} point{lastResult.pointsAwarded !== 1 ? "s" : ""}</p>
				{:else}
					<div class="mb-4">
						<svg class="mx-auto h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<h3 class="mb-2 text-xl font-semibold text-red-400">Incorrect</h3>
					<p class="text-gray-300">No points awarded</p>
				{/if}

				<!-- Countdown Timer -->
				<div class="mt-6">
					<div class="mb-2 flex items-center justify-center gap-2 text-sm text-gray-400">
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span>Next question in {resultCountdown}s</span>
					</div>

					<!-- Progress Bar -->
					<div class="bg-muted mx-auto h-2 w-32 rounded-full">
						<div class="h-2 rounded-full bg-blue-500 transition-all duration-1000 ease-linear" style="width: {((totalWaitTime - resultCountdown) / totalWaitTime) * 100}%"></div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
