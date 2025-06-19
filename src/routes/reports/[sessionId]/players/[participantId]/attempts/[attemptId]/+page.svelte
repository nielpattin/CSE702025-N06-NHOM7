<script lang="ts">
	import AppHeader from "$lib/components/AppHeader.svelte"
	import CircularProgress from "../../../components/CircularProgress.svelte"
	import { getAccuracyStrokeColor } from "$lib/report-utils"

	let { data } = $props()

	const { attemptDetails } = data
	const { attempt, participant, quiz, questions, summary } = attemptDetails

	const breadcrumbs = [{ label: "Reports", href: "/reports" }, { label: quiz.title, href: `/reports/${attempt.quizSessionId}/players` }, { label: participant.displayName, href: `/reports/${attempt.quizSessionId}/players/${participant.id}/attempts` }, { label: `Attempt ${attempt.attemptNumber}` }]

	function formatTime(ms: number): string {
		if (!ms) return "00s"
		const totalSeconds = Math.floor(ms / 1000)
		const hours = Math.floor(totalSeconds / 3600)
		const minutes = Math.floor((totalSeconds % 3600) / 60)
		const seconds = totalSeconds % 60

		if (hours > 0) {
			return `${hours}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`
		} else if (minutes > 0) {
			return `${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`
		} else {
			return `${seconds.toString().padStart(2, "0")}s`
		}
	}

	function formatDuration(): string {
		if (!attempt.startedAt || !attempt.completedAt) return "Unknown"
		const start = new Date(attempt.startedAt).getTime()
		const end = new Date(attempt.completedAt).getTime()
		return formatTime(end - start)
	}

	function formatDate(date: Date | null) {
		if (!date) return "N/A"
		return new Date(date).toLocaleString()
	}

	function formatQuestionType(type: string | null) {
		if (!type) return "Unknown"
		switch (type) {
			case "multiple_choice":
				return "Multiple Choice"
			case "true_false":
				return "True/False"
			default:
				return type
		}
	}
</script>

<svelte:head>
	<title>Attempt Details - {participant.displayName} - {quiz.title}</title>
</svelte:head>

<div class=" bg-background min-h-screen">
	<AppHeader title="Attempt Details" />

	<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Breadcrumbs -->
		<div class="mb-8">
			<nav class="mb-4 flex" aria-label="Breadcrumb">
				<ol class="flex items-center space-x-2">
					{#each breadcrumbs as breadcrumb, index (breadcrumb.label)}
						<li>
							{#if breadcrumb.href && index < breadcrumbs.length - 1}
								<a href={breadcrumb.href} class="text-muted-foreground hover:text-foreground transition-colors">
									{breadcrumb.label}
								</a>
							{:else}
								<span class="text-foreground font-medium">{breadcrumb.label}</span>
							{/if}
						</li>
						{#if index < breadcrumbs.length - 1}
							<li>
								<span class="text-muted-foreground">/</span>
							</li>
						{/if}
					{/each}
				</ol>
			</nav>
		</div>

		<!-- Performance metrics grid -->
		<div class="mb-8 grid gap-6 md:grid-cols-4">
			<!-- Accuracy -->
			<div class="border-border bg-card flex min-h-[180px] flex-col justify-between rounded-lg border p-6 text-center">
				<div class="flex h-32 items-center justify-center">
					<CircularProgress percentage={summary.accuracy} size={80} strokeWidth={8} color={getAccuracyStrokeColor(summary.accuracy)} />
				</div>
				<div class="mt-4">
					<div class="text-muted-foreground text-sm">Accuracy</div>
				</div>
			</div>

			<!-- Correct Answers -->
			<div class="border-border bg-card flex min-h-[180px] flex-col justify-between rounded-lg border p-6 text-center">
				<div class="flex h-32 items-center justify-center">
					<div class="text-foreground flex items-baseline space-x-1">
						<span class="text-5xl font-bold">{summary.correctAnswers}</span>
						<span class="text-2xl font-normal">/</span>
						<span class="text-2xl font-normal">{summary.totalQuestions}</span>
					</div>
				</div>
				<div class="mt-4">
					<div class="text-muted-foreground text-sm">Correct Answers</div>
				</div>
			</div>

			<!-- Completion Time -->
			<div class="border-border bg-card flex min-h-[180px] flex-col justify-between rounded-lg border p-6 text-center">
				<div class="flex h-32 items-center justify-center">
					<div class="text-foreground text-3xl font-bold">{formatDuration()}</div>
				</div>
				<div class="mt-4">
					<div class="text-muted-foreground text-sm">Total Time</div>
				</div>
			</div>

			<!-- Score -->
			<div class="border-border bg-card flex min-h-[180px] flex-col justify-between rounded-lg border p-6 text-center">
				<div class="flex h-32 items-center justify-center">
					<div class="text-foreground flex items-baseline space-x-1">
						<span class="text-5xl font-bold">{summary.score}</span>
						<span class="text-2xl font-normal">/</span>
						<span class="text-2xl font-normal">{summary.totalPossiblePoints}</span>
					</div>
				</div>
				<div class="mt-4">
					<div class="text-muted-foreground text-sm">Score</div>
				</div>
			</div>
		</div>

		<!-- Progress bar -->
		<div class="mb-8">
			<div class="border-border bg-card rounded-lg border p-6">
				<div class="mb-4 flex items-center justify-between">
					<h3 class="text-foreground text-lg font-semibold">Progress Overview</h3>
					<span class="text-muted-foreground text-sm">
						{summary.correctAnswers} of {summary.totalQuestions} correct
					</span>
				</div>
				<div class="bg-muted h-4 w-full rounded-full">
					<div class="h-4 rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500" style="width: {(summary.correctAnswers / summary.totalQuestions) * 100}%"></div>
				</div>
				<div class="text-muted-foreground mt-2 flex justify-between text-sm">
					<span>0</span>
					<span>{summary.totalQuestions}</span>
				</div>
			</div>
		</div>

		<!-- Detailed Questions -->
		<div class="border-border bg-card rounded-lg border shadow-lg">
			<div class="border-border border-b px-6 py-4">
				<h3 class="text-foreground text-xl font-semibold">Question Details</h3>
				<p class="text-muted-foreground text-sm">Review each question and the participant's responses</p>
			</div>

			<div class="divide-border divide-y">
				{#each questions as question, index (question.id)}
					<div class="p-6">
						<!-- Question Header -->
						<div class="mb-4 flex items-start justify-between">
							<div class="flex-1">
								<div class="mb-2 flex items-center space-x-2">
									<span class="inline-flex items-center rounded bg-blue-600 px-2 py-1 text-xs font-medium text-blue-100">
										Question {index + 1}
									</span>
									<span class="bg-muted text-muted-foreground inline-flex items-center rounded px-2 py-1 text-xs font-medium">
										{formatQuestionType(question.type)}
									</span>
									<span class="inline-flex items-center rounded bg-green-600 px-2 py-1 text-xs font-medium text-green-100">
										{question.points} pts
									</span>
									{#if question.timeLimit}
										<span class="inline-flex items-center rounded bg-yellow-600 px-2 py-1 text-xs font-medium text-yellow-100">
											{question.timeLimit}s limit
										</span>
									{/if}
									{#if question.timeTaken}
										<span class="inline-flex items-center rounded bg-orange-600 px-2 py-1 text-xs font-medium text-orange-100">
											{formatTime(question.timeTaken)} taken
										</span>
									{/if}
								</div>
								<h4 class="text-foreground mb-2 text-lg font-medium">{question.content}</h4>
							</div>
							<div class="ml-4 text-right">
								{#if question.isCorrect}
									<div class="text-foreground inline-flex items-center rounded-full bg-green-600 px-3 py-1 text-sm font-medium">
										<svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
										</svg>
										Correct
									</div>
								{:else if question.userAnswer !== null}
									<div class="text-foreground inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-sm font-medium">
										<svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
										</svg>
										Incorrect
									</div>
								{:else}
									<div class="bg-muted text-foreground inline-flex items-center rounded-full px-3 py-1 text-sm font-medium">Not Answered</div>
								{/if}
							</div>
						</div>

						<!-- Answer Options -->
						<div class="space-y-2">
							{#each question.options as option (option.id)}
								<div class="flex items-center gap-3 rounded-lg border p-3 {option.correct ? 'border-green-500 bg-green-900/20' : option.selected ? 'border-red-500 bg-red-900/20' : 'border-border bg-muted/30'}">
									<div class="flex-shrink-0">
										{#if option.correct}
											<svg class="text-foreground h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
											</svg>
										{:else if option.selected}
											<svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
											</svg>
										{:else}
											<div class="border-muted-foreground h-5 w-5 rounded-full border-2"></div>
										{/if}
									</div>

									<div class="flex-1">
										<span class="text-foreground">{option.content}</span>
										{#if option.correct}
											<span class="text-foreground ml-2 text-sm font-medium">(Correct Answer)</span>
										{:else if option.selected}
											<span class="ml-2 text-sm font-medium text-red-400">(Participant's Answer)</span>
										{/if}
									</div>
								</div>
							{/each}
						</div>

						<!-- Points Awarded -->
						<div class="text-muted-foreground mt-4 text-sm">
							Points awarded: <span class="text-foreground font-medium">{question.pointsAwarded}</span> / {question.points}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Summary Footer -->
		<div class="mt-8">
			<div class="border-border bg-card rounded-lg border p-4">
				<div class="text-muted-foreground flex items-center justify-between text-sm">
					<div>Attempt #{attempt.attemptNumber}</div>
					<div>Status: {attempt.status}</div>
					{#if attempt.completedAt}
						<div>Completed: {formatDate(attempt.completedAt)}</div>
					{:else if attempt.startedAt}
						<div>Started: {formatDate(attempt.startedAt)}</div>
					{/if}
				</div>
			</div>
		</div>
	</main>
</div>

<style>
	:global(::-webkit-scrollbar) {
		width: 8px;
	}

	:global(::-webkit-scrollbar-track) {
		background: #374151;
		border-radius: 4px;
	}

	:global(::-webkit-scrollbar-thumb) {
		background: #6b7280;
		border-radius: 4px;
	}

	:global(::-webkit-scrollbar-thumb:hover) {
		background: #9ca3af;
	}
</style>
