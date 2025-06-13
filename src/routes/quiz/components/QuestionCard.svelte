<script lang="ts">
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

	let { question, quizId, timeOptions, pointOptions, onTimeChange, onPointsChange } = $props<{
		question: Question
		quizId: number
		timeOptions: Array<{ value: number; label: string }>
		pointOptions: number[]
		onTimeChange: (questionId: number, timeValue: number) => void
		onPointsChange: (questionId: number, pointsValue: number) => void
	}>()

	let timeDropdownOpen = $state(false)
	let pointsDropdownOpen = $state(false)

	function toggleTimeDropdown() {
		timeDropdownOpen = !timeDropdownOpen
		pointsDropdownOpen = false
	}

	function togglePointsDropdown() {
		pointsDropdownOpen = !pointsDropdownOpen
		timeDropdownOpen = false
	}

	function selectTimeLimit(timeValue: number) {
		onTimeChange(question.id, timeValue)
		timeDropdownOpen = false
	}

	function selectPoints(pointsValue: number) {
		onPointsChange(question.id, pointsValue)
		pointsDropdownOpen = false
	}

	function getTimeLabel(seconds: number | null): string {
		if (!seconds) return "No limit"
		const option = timeOptions.find((opt: { value: number; label: string }) => opt.value === seconds)
		return option ? option.label : `${seconds}s`
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as Element
		if (!target.closest(".time-dropdown") && !target.closest(".points-dropdown")) {
			timeDropdownOpen = false
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

<div class="rounded-lg border border-gray-600 bg-gray-800 p-6 shadow-lg transition-all hover:border-gray-500">
	<!-- First Row: Question metadata -->
	<div class="mb-4 flex items-center justify-between">
		<div class="flex items-center gap-6">
			<div class="flex items-center gap-2">
				<span class="text-sm text-gray-400">Type:</span>
				<span class="rounded-full bg-purple-600 px-3 py-1 text-xs font-medium text-white">
					{question.type?.replace("_", " ").toUpperCase() || "N/A"}
				</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="text-sm text-gray-400">Time:</span>
				<div class="time-dropdown relative">
					<button type="button" onclick={toggleTimeDropdown} class="flex items-center gap-1 rounded-full bg-orange-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none">
						{getTimeLabel(question.timeLimit)}
						<svg class="h-3 w-3 transition-transform {timeDropdownOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
						</svg>
					</button>

					{#if timeDropdownOpen}
						<div class="absolute right-0 z-10 mt-2 w-40 rounded-lg border border-gray-600 bg-gray-700 shadow-lg">
							<div class="custom-scrollbar max-h-60 overflow-y-auto py-1">
								{#each timeOptions as option (option.value)}
									<button type="button" onclick={() => selectTimeLimit(option.value)} class="block w-full px-4 py-2 text-left text-sm text-white transition-colors hover:bg-gray-600 focus:bg-gray-600 focus:outline-none {question.timeLimit === option.value ? 'bg-orange-600' : ''}">
										{option.label}
									</button>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
			<div class="flex items-center gap-2">
				<span class="text-sm text-gray-400">Points:</span>
				<div class="points-dropdown relative">
					<button type="button" onclick={togglePointsDropdown} class="flex items-center gap-1 rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none">
						{question.points || 0}
						<svg class="h-3 w-3 transition-transform {pointsDropdownOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
						</svg>
					</button>

					{#if pointsDropdownOpen}
						<div class="absolute right-0 z-10 mt-2 w-32 rounded-lg border border-gray-600 bg-gray-700 shadow-lg">
							<div class="custom-scrollbar max-h-60 overflow-y-auto py-1">
								{#each pointOptions as pointValue (pointValue)}
									<button type="button" onclick={() => selectPoints(pointValue)} class="block w-full px-4 py-2 text-left text-sm text-white transition-colors hover:bg-gray-600 focus:bg-gray-600 focus:outline-none {question.points === pointValue ? 'bg-green-600' : ''}">
										{pointValue}
									</button>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
		<a href="/quiz/edit/{quizId}/question/{question.id}" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none"> Edit </a>
	</div>

	<!-- Second Row: Question content -->
	<div class="mb-4">
		<h3 class="text-lg font-semibold text-white">{question.content}</h3>
	</div>

	<!-- Options Grid -->
	{#if question.options && question.options.length > 0}
		<div class="grid grid-cols-2 gap-4">
			{#each question.options as option (option.id)}
				<div class="flex items-center gap-2 rounded-lg border border-gray-600 bg-gray-700 p-3">
					{#if option.correct}
						<svg class="h-5 w-5 flex-shrink-0 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
						</svg>
					{/if}
					<span class="text-sm text-gray-200">{option.content}</span>
				</div>
			{/each}
		</div>
	{:else}
		<div class="rounded-lg border border-gray-600 bg-gray-700 p-3 text-center">
			<span class="text-sm text-gray-400">No options configured</span>
		</div>
	{/if}
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 8px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: #2d3748;
		border-radius: 10px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background-color: #4a5568;
		border-radius: 10px;
		border: 2px solid #2d3748;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background-color: #718096;
	}
</style>
