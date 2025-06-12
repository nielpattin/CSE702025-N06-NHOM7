<script lang="ts">
	import type { PageData } from "./$types"
	import DashboardHeader from "$lib/components/DashboardHeader.svelte"

	let { data }: { data: PageData } = $props()

	const { attempt, session, participant, quiz, questions, summary } = data

	// Format time display
	function formatTime(ms: number): string {
		const seconds = Math.floor(ms / 1000)
		const minutes = Math.floor(seconds / 60)
		const remainingSeconds = seconds % 60
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
	}

	// Format duration
	function formatDuration(): string {
		if (!attempt.startedAt || !attempt.completedAt) return "Unknown"
		const start = new Date(attempt.startedAt).getTime()
		const end = new Date(attempt.completedAt).getTime()
		return formatTime(end - start)
	}

	// Get performance rating
	function getPerformanceRating(percentage: number): { text: string; color: string } {
		if (percentage >= 90) return { text: "Excellent", color: "text-green-400" }
		if (percentage >= 80) return { text: "Very Good", color: "text-blue-400" }
		if (percentage >= 70) return { text: "Good", color: "text-yellow-400" }
		if (percentage >= 60) return { text: "Fair", color: "text-orange-400" }
		return { text: "Needs Improvement", color: "text-red-400" }
	}

	const performance = getPerformanceRating(summary.percentage)
</script>

<svelte:head>
	<title>Quiz Results - {quiz.title}</title>
</svelte:head>

<DashboardHeader title="Quiz Complete" />

<div class="min-h-screen bg-gray-800">
	<div class="container mx-auto px-4 py-8">
		<!-- Results Header -->
		<div class="mx-auto mb-8 max-w-4xl text-center">
			<div class="mb-4">
				{#if summary.percentage >= 80}
					<svg class="mx-auto h-20 w-20 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				{:else if summary.percentage >= 60}
					<svg class="mx-auto h-20 w-20 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
					</svg>
				{:else}
					<svg class="mx-auto h-20 w-20 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				{/if}
			</div>
			<h1 class="mb-2 text-4xl font-bold text-white">Quiz Complete!</h1>
			<h2 class="mb-4 text-2xl font-semibold text-gray-300">{quiz.title}</h2>
			<p class="text-lg {performance.color}">{performance.text}</p>

			<!-- Action Buttons -->
			<div class="mt-6 flex flex-wrap justify-center gap-4">
				<!-- Back to Session Button -->
				<a href="/play/session/{session.id}" class="inline-flex items-center gap-2 rounded-lg border border-blue-500 bg-transparent px-6 py-3 font-semibold text-blue-400 transition-colors hover:bg-blue-500 hover:text-white">
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
					</svg>
					Back to Session
				</a>

				<!-- Reattempt Button -->
				<form method="POST" action="?/reattempt">
					<button type="submit" class="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700">
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
						Reattempt Quiz
					</button>
				</form>
			</div>
		</div>

		<!-- Score Summary -->
		<div class="mx-auto mb-8 max-w-4xl">
			<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				<!-- Final Score -->
				<div class="rounded-lg border border-gray-700 bg-gradient-to-br from-blue-900/50 to-blue-800/30 p-6 text-center">
					<div class="text-3xl font-bold text-blue-400">{summary.score}</div>
					<div class="text-sm text-gray-300">out of {summary.totalPossiblePoints}</div>
					<div class="mt-1 text-xs text-gray-400">Final Score</div>
				</div>

				<!-- Percentage -->
				<div class="rounded-lg border border-gray-700 bg-gradient-to-br from-green-900/50 to-green-800/30 p-6 text-center">
					<div class="text-3xl font-bold text-green-400">{summary.percentage}%</div>
					<div class="text-sm text-gray-300">accuracy</div>
					<div class="mt-1 text-xs text-gray-400">Percentage</div>
				</div>

				<!-- Correct Answers -->
				<div class="rounded-lg border border-gray-700 bg-gradient-to-br from-purple-900/50 to-purple-800/30 p-6 text-center">
					<div class="text-3xl font-bold text-purple-300">{summary.correctAnswers}</div>
					<div class="text-sm text-gray-200">out of {summary.totalQuestions}</div>
					<div class="mt-1 text-xs text-gray-300">Correct</div>
				</div>

				<!-- Time Taken -->
				<div class="rounded-lg border border-gray-700 bg-gradient-to-br from-orange-900/50 to-orange-800/30 p-6 text-center">
					<div class="text-3xl font-bold text-orange-300">{formatDuration()}</div>
					<div class="text-sm text-gray-200">total time</div>
					<div class="mt-1 text-xs text-gray-300">Duration</div>
				</div>
			</div>
		</div>

		<!-- Detailed Results -->
		<div class="mx-auto max-w-4xl">
			<div class="rounded-lg border border-gray-700 bg-gray-900/50 shadow-lg">
				<div class="border-b border-gray-700 px-6 py-4">
					<h3 class="text-xl font-semibold text-white">Question Review</h3>
					<p class="text-sm text-gray-400">Review your answers and see the correct responses</p>
				</div>

				<div class="p-6">
					<div class="space-y-6">
						{#each questions as question, index (question.id)}
							<div class="rounded-lg border border-gray-600 bg-gray-800/50 p-6">
								<!-- Question Header -->
								<div class="mb-4 flex items-start justify-between">
									<div class="flex-1">
										<h4 class="mb-2 text-lg font-medium text-white">
											Question {index + 1}: {question.content}
										</h4>
										<div class="flex items-center gap-4 text-sm text-gray-400">
											<span>Worth {question.points || 0} point{(question.points || 0) !== 1 ? "s" : ""}</span>
											{#if question.attempt}
												<span>Time: {formatTime(question.attempt.timeTakenMs || 0)}</span>
											{/if}
										</div>
									</div>
									<div class="ml-4 text-right">
										{#if question.attempt?.correct}
											<div class="inline-flex items-center rounded-full bg-green-600 px-3 py-1 text-sm font-medium text-white">
												<svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
												</svg>
												Correct
											</div>
										{:else if question.attempt}
											<div class="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-sm font-medium text-white">
												<svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
												</svg>
												Incorrect
											</div>
										{:else}
											<div class="inline-flex items-center rounded-full bg-gray-600 px-3 py-1 text-sm font-medium text-white">Not Answered</div>
										{/if}
									</div>
								</div>

								<!-- Answer Options -->
								<div class="space-y-2">
									{#each question.options as option (option.id)}
										<div class="flex items-center gap-3 rounded-lg border p-3 {option.correct ? 'border-green-500 bg-green-900/20' : question.selectedOption?.id === option.id ? 'border-red-500 bg-red-900/20' : 'border-gray-600 bg-gray-700/30'}">
											<div class="flex-shrink-0">
												{#if option.correct}
													<!-- Correct answer icon -->
													<svg class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
													</svg>
												{:else if question.selectedOption?.id === option.id}
													<!-- User's incorrect selection -->
													<svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
													</svg>
												{:else}
													<!-- Neutral option -->
													<div class="h-5 w-5 rounded-full border-2 border-gray-500"></div>
												{/if}
											</div>

											<div class="flex-1">
												<span class="text-white">{option.content}</span>
												{#if option.correct}
													<span class="ml-2 text-sm font-medium text-green-400">(Correct Answer)</span>
												{:else if question.selectedOption?.id === option.id}
													<span class="ml-2 text-sm font-medium text-red-400">(Your Answer)</span>
												{/if}
											</div>
										</div>
									{/each}
								</div>

								<!-- Points Awarded -->
								{#if question.attempt}
									<div class="mt-4 text-sm text-gray-400">
										Points awarded: <span class="font-medium text-white">{question.attempt.pointsAwarded || 0}</span>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<!-- Session Info -->
		<div class="mx-auto mt-8 max-w-4xl">
			<div class="rounded-lg border border-gray-700 bg-gray-900/30 p-4">
				<div class="flex items-center justify-between text-sm text-gray-400">
					<div>Session: {session.code}</div>
					<div>Participant: {participant.name || "Anonymous"}</div>
					<div>Attempt #{attempt.attemptNumber}</div>
					<div>Completed: {attempt.completedAt ? new Date(attempt.completedAt).toLocaleString() : "Unknown"}</div>
				</div>
			</div>
		</div>
	</div>
</div>
