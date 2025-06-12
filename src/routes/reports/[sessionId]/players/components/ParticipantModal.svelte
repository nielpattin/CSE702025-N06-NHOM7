<script lang="ts">
	import CircularProgress from "./CircularProgress.svelte"

	interface ParticipantData {
		id: number
		displayName: string
		completionTime: string | null
		accuracy: number
		points: number
		totalScore: number
		correctAnswers: number
		totalQuestions: number
		user?: {
			image?: string
		}
		questions: Array<{
			id: number
			question: string
			userAnswer: string
			correctAnswer: string
			isCorrect: boolean
			points: number
			pointsAwarded: number
			options: Array<{
				id: number
				content: string
				correct: boolean
				selected: boolean
			}>
		}>
	}

	interface Props {
		isOpen: boolean
		sessionId: number
		participantId: number | null
		onClose: () => void
		onPrint?: () => void
		onDelete?: () => void
		getAccuracyStrokeColor?: (accuracy: number) => string
	}

	let { isOpen = $bindable(), sessionId, participantId, onClose, onPrint, onDelete, getAccuracyStrokeColor = (accuracy: number) => (accuracy >= 80 ? "#10b981" : accuracy >= 60 ? "#f59e0b" : "#ef4444") }: Props = $props()

	let participant: ParticipantData | null = $state(null)
	let loading = $state(false)
	let error = $state<string | null>(null)

	// Store scroll position when modal opens
	let savedScrollPosition = $state<{ x: number; y: number } | null>(null)

	// Prevent scrolling of content behind modal and preserve scroll position
	$effect(() => {
		if (isOpen) {
			// Store current scroll position
			const scrollY = window.scrollY || window.pageYOffset
			const scrollX = window.scrollX || window.pageXOffset
			savedScrollPosition = { x: scrollX, y: scrollY }

			// Store original styles
			const originalBodyOverflow = document.body.style.overflow
			const originalHtmlOverflow = document.documentElement.style.overflow
			const originalBodyPosition = document.body.style.position
			const originalBodyTop = document.body.style.top
			const originalBodyLeft = document.body.style.left
			const originalBodyWidth = document.body.style.width

			// Prevent scrolling using position fixed to maintain scroll position
			document.body.style.position = "fixed"
			document.body.style.top = `-${scrollY}px`
			document.body.style.left = `-${scrollX}px`
			document.body.style.width = "100%"
			document.body.style.overflow = "hidden"
			document.documentElement.style.overflow = "hidden"

			// Also add Tailwind class as backup
			document.body.classList.add("overflow-hidden")

			// Cleanup function
			return () => {
				// Restore original styles first
				document.body.style.position = originalBodyPosition
				document.body.style.top = originalBodyTop
				document.body.style.left = originalBodyLeft
				document.body.style.width = originalBodyWidth
				document.body.style.overflow = originalBodyOverflow
				document.documentElement.style.overflow = originalHtmlOverflow
				document.body.classList.remove("overflow-hidden")

				// Use requestAnimationFrame to ensure DOM updates are complete before restoring scroll
				requestAnimationFrame(() => {
					if (savedScrollPosition) {
						window.scrollTo(savedScrollPosition.x, savedScrollPosition.y)
					}
				})
			}
		}
	})

	// Additional cleanup effect when modal closes
	$effect(() => {
		if (!isOpen && savedScrollPosition) {
			// Double-check that scroll position is restored
			requestAnimationFrame(() => {
				if (savedScrollPosition) {
					window.scrollTo(savedScrollPosition.x, savedScrollPosition.y)
					savedScrollPosition = null
				}
			})
		}
	})

	// Fetch participant data when modal opens and participantId changes
	$effect(() => {
		if (isOpen && participantId) {
			fetchParticipantData()
		} else {
			participant = null
			error = null
		}
	})

	async function fetchParticipantData() {
		if (!participantId) return

		loading = true
		error = null

		try {
			const response = await fetch(`/api/participants/${participantId}?sessionId=${sessionId}`)

			if (!response.ok) {
				throw new Error(`Failed to fetch participant data: ${response.statusText}`)
			}

			const data = await response.json()
			participant = data
		} catch (err) {
			console.error("Error fetching participant data:", err)
			error = err instanceof Error ? err.message : "An unknown error occurred"
			participant = null
		} finally {
			loading = false
		}
	}

	// Handle ESC key press
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Escape" && isOpen) {
			onClose()
		}
	}

	// Handle backdrop click
	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onClose()
		}
	}

	// Calculate progress bar percentages for correct and incorrect answers
	const correctAnswerPercentage = $derived(() => {
		if (!participant || participant.totalQuestions === 0) return 0
		return (participant.correctAnswers / participant.totalQuestions) * 100
	})

	const incorrectAnswerPercentage = $derived(() => {
		if (!participant || participant.totalQuestions === 0) return 0
		return ((participant.totalQuestions - participant.correctAnswers) / participant.totalQuestions) * 100
	})
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<!-- Modal backdrop -->
	<div class="bg-opacity-50 fixed top-0 left-0 z-50 flex h-full w-full items-center justify-center bg-black/60" onclick={handleBackdropClick} onkeydown={handleKeydown} role="button" aria-labelledby="participant-modal-title" tabindex="0">
		<!-- Modal content - 80% width -->
		<div class="flex h-full w-[60%] transform flex-col overflow-hidden bg-gray-800 shadow-xl transition-all" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
			{#if loading}
				<!-- Loading state -->
				<div class="flex items-center justify-center p-8">
					<div class="text-center">
						<div class="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
						<p class="mt-2 text-gray-400">Loading participant data...</p>
					</div>
				</div>
			{:else if error}
				<!-- Error state -->
				<div class="flex items-center justify-between border-b border-gray-700 p-6">
					<div>
						<h2 class="text-xl font-semibold text-red-400">Errorr</h2>
						<p class="text-gray-400">Failed to load participant data</p>
					</div>
					<button type="button" class="rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-600" onclick={onClose}> Close </button>
				</div>
				<div class="p-6">
					<p class="text-red-400">{error}</p>
					<button onclick={() => fetchParticipantData()} class="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"> Retry </button>
				</div>
			{:else if participant}
				<!-- Modal header -->
				<div class="flex items-center justify-between border-b border-gray-700 p-2">
					<div class="flex items-center space-x-4">
						<!-- Participant avatar -->
						<div class="flex-shrink-0">
							{#if participant.user?.image}
								<img class="h-8 w-8 rounded-full" src={participant.user.image} alt={participant.displayName} />
							{:else}
								<div class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600">
									<span class="text-sm font-medium text-white">
										{participant.displayName.charAt(0).toUpperCase()}
									</span>
								</div>
							{/if}
						</div>
						<div>
							<h2 id="participant-modal-title" class="text-lg font-semibold text-white">
								{participant.displayName}
							</h2>
						</div>
					</div>

					<!-- Header buttons -->
					<div class="flex items-center space-x-3">
						{#if onPrint}
							<button type="button" class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none" onclick={onPrint}> Print </button>
						{/if}

						{#if onDelete}
							<button type="button" class="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none" onclick={onDelete}> Delete </button>
						{/if}

						<button type="button" class="rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none" onclick={onClose}> Close </button>
					</div>
				</div>

				<!-- Modal body - scrollable -->
				<div class="custom-scrollbar flex-1 overflow-y-auto p-6">
					<!-- Participant details -->
					<div class="mb-8">
						<!-- Progress bar for correct/incorrect answers -->
						<div class="mt-6">
							<div class="flex h-4 w-full overflow-hidden bg-gray-700">
								<div class="h-full bg-green-500 transition-all duration-300" style="width: {correctAnswerPercentage()}%"></div>
								<div class="h-full bg-red-500 transition-all duration-300" style="width: {incorrectAnswerPercentage()}%"></div>
							</div>
							<div class="mt-2 flex items-center justify-center space-x-4 text-xs">
								<div class="flex items-center space-x-1">
									<div class="h-2 w-2 rounded-full bg-green-500"></div>
									<span class="text-gray-400">Correct ({participant.correctAnswers})</span>
								</div>
								<div class="flex items-center space-x-1">
									<div class="h-2 w-2 rounded-full bg-red-500"></div>
									<span class="text-gray-400">Incorrect ({participant.totalQuestions - participant.correctAnswers})</span>
								</div>
							</div>
						</div>
					</div>
					<!-- Performance metrics -->
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
						<!-- Accuracy with circular progress -->
						<div class="rounded-lg border border-gray-500 p-4 text-center">
							<div class="mb-3 flex h-16 items-center justify-center">
								<CircularProgress percentage={participant.accuracy} size={50} strokeWidth={8} {getAccuracyStrokeColor} />
							</div>
							<p class="text-sm font-medium tracking-wider text-gray-400 uppercase">Accuracy</p>
						</div>

						<!-- Completion Time -->
						<div class="rounded-lg border border-gray-500 p-4 text-center">
							<div class="mb-3 flex h-16 items-center justify-center">
								<span class="text-2xl font-bold text-white">
									{participant.completionTime || "N/A"}
								</span>
							</div>
							<p class="text-sm font-medium tracking-wider text-gray-400 uppercase">Completion Time</p>
						</div>

						<!-- Points -->
						<div class="rounded-lg border border-gray-500 p-4 text-center">
							<div class="mb-3 flex h-16 items-center justify-center">
								<span class="text-2xl font-bold text-white">
									{participant.points}
								</span>
							</div>
							<p class="text-sm font-medium tracking-wider text-gray-400 uppercase">Points</p>
						</div>

						<!-- Score -->
						<div class="rounded-lg border border-gray-500 p-4 text-center">
							<div class="mb-3 flex h-16 items-center justify-center">
								<span class="text-2xl font-bold text-white">
									{participant.totalScore}
								</span>
							</div>
							<p class="text-sm font-medium tracking-wider text-gray-400 uppercase">Score</p>
						</div>
					</div>

					<!-- Questions list -->
					{#if participant.questions && participant.questions.length > 0}
						<div>
							<h3 class="mb-4 text-lg font-semibold text-white">Question Responses</h3>

							<div class="grid grid-cols-1 gap-4">
								{#each participant.questions as question, index (question.id)}
									<div class="rounded-lg border border-gray-600 bg-gray-700 p-4">
										<div class="mb-3 flex items-start justify-between">
											<div class="flex-1">
												<h4 class="mb-2 text-sm font-medium text-white">
													Question {index + 1}
												</h4>
												<p class="mb-3 text-gray-300">
													{question.question}
												</p>
											</div>
											<div class="ml-4 flex-shrink-0">
												{#if question.isCorrect}
													<div class="flex h-8 w-8 items-center justify-center rounded-full bg-green-600">
														<svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
															<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
														</svg>
													</div>
												{:else}
													<div class="flex h-8 w-8 items-center justify-center rounded-full bg-red-600">
														<svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
															<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
														</svg>
													</div>
												{/if}
											</div>
										</div>

										<!-- Response label -->
										<div class="mb-2">
											<span class="text-sm font-medium {question.isCorrect ? 'text-green-400' : 'text-red-400'}">Response</span>
										</div>

										<!-- Answer Options -->
										<div class="mt-2 space-y-2">
											{#each question.options as option (option.id)}
												<div class="flex items-center justify-between rounded-md border p-3 {option.selected ? (question.isCorrect ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10') : option.correct ? 'border-green-500 bg-green-500/10' : 'border-gray-600 bg-gray-700/50'}">
													<div class="flex items-center space-x-3">
														<div class="flex h-6 w-6 items-center justify-center rounded-full border-2 {option.selected ? (question.isCorrect ? 'border-green-500 bg-green-500' : 'border-red-500 bg-red-500') : option.correct ? 'border-green-500 bg-green-500' : 'border-gray-500'}">
															{#if option.selected || option.correct}
																<svg class="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
																	<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
																</svg>
															{/if}
														</div>
														<span class="text-sm font-medium text-white">{option.content}</span>
													</div>
													<div class="flex items-center space-x-2">
														{#if option.correct}
															<span class="rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">Correct</span>
														{/if}
													</div>
												</div>
											{/each}
										</div>

										<div class="mt-3 text-right">
											<span class="text-sm text-gray-400">Points: </span>
											<span class="text-sm font-medium text-white">
												{question.pointsAwarded}
											</span>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{:else}
						<div class="py-8 text-center">
							<p class="text-gray-400">No question responses available</p>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	/* Custom scrollbar styling */
	.custom-scrollbar::-webkit-scrollbar {
		width: 20px;
	}

	.custom-scrollbar::-webkit-scrollbar-track {
		background: rgb(142, 161, 192); /* gray-700 - matches modal background */
		border-radius: 4px;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgb(75, 85, 99); /* gray-600 - slightly lighter than track */
		border-radius: 4px;
		border: 1px solid rgb(55, 65, 81); /* subtle border */
		transition: background-color 0.2s ease;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: rgb(107, 114, 128); /* gray-500 - lighter on hover */
	}

	.custom-scrollbar::-webkit-scrollbar-thumb:active {
		background: rgb(156, 163, 175); /* gray-400 - even lighter when active */
	}

	/* Corner styling */
	.custom-scrollbar::-webkit-scrollbar-corner {
		background: rgb(55, 65, 81);
	}

	/* Firefox scrollbar styling */
	.custom-scrollbar {
		scrollbar-width: thin;
		scrollbar-color: rgb(75, 85, 99) rgb(55, 65, 81);
	}
</style>
