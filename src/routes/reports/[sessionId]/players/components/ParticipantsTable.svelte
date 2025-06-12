<script lang="ts">
	import CircularProgress from "./CircularProgress.svelte"
	import ParticipantModal from "./ParticipantModal.svelte"
	import { page } from "$app/state"

	let { participants, getAccuracyStrokeColor } = $props()

	let isModalOpen = $state(false)
	let selectedParticipantId = $state<number | null>(null)
	let dropdownOpen = $state<number | null>(null)

	function openParticipantModal(participantId: number) {
		selectedParticipantId = participantId
		isModalOpen = true
	}

	function closeModal() {
		isModalOpen = false
		selectedParticipantId = null
	}

	function toggleDropdown(participantId: number) {
		dropdownOpen = dropdownOpen === participantId ? null : participantId
	}

	function handleCardClick(participantId: number) {
		openParticipantModal(participantId)
	}

	function handlePrint(participantId: number) {
		console.log("Print participant:", participantId)
		dropdownOpen = null
	}

	function handleDelete(participantId: number) {
		console.log("Delete participant:", participantId)
		dropdownOpen = null
	}

	function handleExpand(participantId: number) {
		openParticipantModal(participantId)
		dropdownOpen = null
	}

	const sessionId = $derived(() => parseInt(page.params.sessionId))
</script>

<!-- Desktop Grid View -->
<div class="hidden lg:block">
	<div class="bg-gray-750 rounded-lg border border-gray-600">
		<!-- Header -->
		<div class="grid grid-cols-6 gap-4 border-b border-gray-600 bg-gray-700 px-6 py-4">
			<div class="flex items-center justify-center text-center text-sm font-medium tracking-wider text-gray-300 uppercase">Name</div>
			<div class="flex items-center justify-center text-center text-sm font-medium tracking-wider text-gray-300 uppercase">Accuracy</div>
			<div class="flex items-center justify-center text-center text-sm font-medium tracking-wider text-gray-300 uppercase">Attempt Times</div>
			<div class="flex items-center justify-center text-center text-sm font-medium tracking-wider text-gray-300 uppercase">Points</div>
			<div class="flex items-center justify-center text-center text-sm font-medium tracking-wider text-gray-300 uppercase">Scores</div>
			<div class="flex items-center justify-center text-center text-sm font-medium tracking-wider text-gray-300 uppercase"></div>
		</div>

		<!-- Participant Cards -->
		<div class="divide-y divide-gray-600 bg-gray-800">
			{#each participants as participant, index (participant.id)}
				<div
					class="relative grid cursor-pointer grid-cols-6 gap-4 px-6 py-4 transition-colors hover:bg-gray-700"
					onclick={() => handleCardClick(participant.id)}
					onkeydown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault()
							handleCardClick(participant.id)
						}
					}}
					role="button"
					tabindex="0"
					aria-label="View details for {participant.displayName}"
				>
					<!-- Name -->
					<div class="flex items-center justify-center space-x-4">
						<div class="flex-shrink-0">
							{#if participant.user?.image}
								<img class="h-10 w-10 rounded-full" src={participant.user.image} alt={participant.displayName} />
							{:else}
								<div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-600">
									<span class="text-sm font-medium text-white">
										{participant.displayName.charAt(0).toUpperCase()}
									</span>
								</div>
							{/if}
						</div>
						<div>
							<div class="text-sm font-medium text-white">{participant.displayName}</div>
							<div class="text-sm text-gray-400">
								Rank #{index + 1}
							</div>
						</div>
					</div>

					<!-- Accuracy -->
					<div class="flex items-center justify-center">
						<CircularProgress percentage={participant.accuracy} size={60} strokeWidth={6} {getAccuracyStrokeColor} />
					</div>
					<!-- Attempt Times (number of game attempts) -->
					<div class="flex items-center justify-center">
						<span class="text-lg font-bold text-white"> 1 </span>
					</div>
					<!-- Points -->
					<div class="flex items-center justify-center">
						<span class="text-lg font-bold text-white">
							{participant.points}
						</span>
					</div>

					<!-- Scores -->
					<div class="flex items-center justify-center">
						<span class="text-lg font-bold text-white">
							{participant.totalScore}
						</span>
					</div>

					<!-- Actions -->
					<div class="flex items-center justify-center">
						<div class="relative">
							<button
								onclick={(e) => {
									e.stopPropagation()
									toggleDropdown(participant.id)
								}}
								class="cursor-pointer p-2 text-gray-400 transition-colors hover:text-gray-300"
								aria-label="More options for {participant.displayName}"
							>
								<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
									<path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
								</svg>
							</button>

							<!-- Dropdown Menu -->
							{#if dropdownOpen === participant.id}
								<div class="absolute right-0 z-10 mt-2 w-48 rounded-md border border-gray-600 bg-gray-700 shadow-lg">
									<div class="py-1">
										<button
											onclick={(e) => {
												e.stopPropagation()
												handlePrint(participant.id)
											}}
											class="flex w-full cursor-pointer items-center px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-600 hover:text-white"
										>
											<svg class="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
											</svg>
											Print
										</button>
										<button
											onclick={(e) => {
												e.stopPropagation()
												handleDelete(participant.id)
											}}
											class="flex w-full cursor-pointer items-center px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-600 hover:text-white"
										>
											<svg class="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
											</svg>
											Delete
										</button>
										<button
											onclick={(e) => {
												e.stopPropagation()
												handleExpand(participant.id)
											}}
											class="flex w-full cursor-pointer items-center px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-600 hover:text-white"
										>
											<svg class="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4a1 1 0 011-1h4m0 0l-3 3m3-3v3m8-3h4a1 1 0 011 1v4m0 0l-3-3m3 3h-3m-3 8h3m3 0v4a1 1 0 01-1 1h-4m0 0l3-3m-3 3v-3M8 16H5a1 1 0 01-1-1v-4m0 0l3 3m-3-3h3" />
											</svg>
											Expand
										</button>
									</div>
								</div>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<!-- Click outside to close dropdown -->
{#if dropdownOpen !== null}
	<div
		class="fixed inset-0 z-0"
		onclick={() => (dropdownOpen = null)}
		onkeydown={(e) => {
			if (e.key === "Escape") {
				dropdownOpen = null
			}
		}}
		role="button"
		tabindex="-1"
		aria-label="Close dropdown"
	></div>
{/if}

<!-- Participant Modal -->
<ParticipantModal bind:isOpen={isModalOpen} sessionId={sessionId()} participantId={selectedParticipantId} onClose={closeModal} {getAccuracyStrokeColor} />
