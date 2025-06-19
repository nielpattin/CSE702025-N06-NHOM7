<script lang="ts">
	import CircularProgress from "./CircularProgress.svelte"
	import { page } from "$app/state"

	let { participants, getAccuracyStrokeColor, visibleParticipants = [] } = $props()

	let dropdownOpen = $state<number | null>(null)

	function toggleDropdown(participantId: number) {
		dropdownOpen = dropdownOpen === participantId ? null : participantId
	}

	function handlePrint(participantId: number) {
		console.log("Print participant:", participantId)
		dropdownOpen = null
	}

	function handleDelete(participantId: number) {
		console.log("Delete participant:", participantId)
		dropdownOpen = null
	}

	const sessionId = $derived(() => parseInt(page.params.sessionId))
</script>

<!-- Desktop Grid View -->
<div class="hidden lg:block">
	<div class="bg-card border-border rounded-lg border">
		<!-- Header -->
		<div class="border-border bg-muted grid grid-cols-6 gap-4 border-b px-6 py-4">
			<div class="text-foreground flex items-center justify-center text-center text-sm font-medium tracking-wider uppercase">Name</div>
			<div class="text-foreground flex items-center justify-center text-center text-sm font-medium tracking-wider uppercase">Accuracy</div>
			<div class="text-foreground flex items-center justify-center text-center text-sm font-medium tracking-wider uppercase">Attempt Times</div>
			<div class="text-foreground flex items-center justify-center text-center text-sm font-medium tracking-wider uppercase">Correct Answers</div>
			<div class="text-foreground flex items-center justify-center text-center text-sm font-medium tracking-wider uppercase">Scores</div>
			<div class="text-foreground flex items-center justify-center text-center text-sm font-medium tracking-wider uppercase"></div>
		</div>

		<!-- Participant Cards -->
		<div class="divide-border bg-card divide-y">
			{#each participants as participant, index (participant.id)}
				<div class="transform transition-all duration-500 ease-out {visibleParticipants.includes(index) ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}" style="transition-delay: {index * 50}ms">
					<a href="/reports/{sessionId()}/players/{participant.id}/attempts" class="hover:bg-muted relative grid grid-cols-6 gap-4 px-6 py-4 transition-colors" aria-label="View details for {participant.displayName}">
						<!-- Name -->
						<div class="flex items-center justify-center space-x-4">
							<div class="flex-shrink-0">
								{#if participant.user?.image}
									<img class="h-10 w-10 rounded-full" src={participant.user.image} alt={participant.displayName} />
								{:else}
									<div class="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
										<span class="text-foreground text-sm font-medium">
											{participant.displayName.charAt(0).toUpperCase()}
										</span>
									</div>
								{/if}
							</div>
							<div>
								<div class="text-foreground text-sm font-medium">{participant.displayName}</div>
								<div class="text-muted-foreground text-sm">
									Rank #{index + 1}
								</div>
							</div>
						</div>

						<!-- Correct Answers -->
						<div class="flex flex-col items-center justify-center">
							<CircularProgress percentage={participant.accuracy} size={60} strokeWidth={6} color={getAccuracyStrokeColor(participant.accuracy)} />
						</div>
						<!-- Attempt Times (number of game attempts) -->
						<div class="flex items-center justify-center">
							<span class="text-foreground text-lg font-bold"> {participant.attemptTimes} </span>
						</div>
						<!-- Points -->
						<div class="flex items-center justify-center">
							<span class="text-foreground text-lg font-bold">
								{participant.points}
							</span>
						</div>

						<!-- Scores -->
						<div class="flex items-center justify-center">
							<span class="text-foreground text-lg font-bold">
								{participant.totalScore}
							</span>
						</div>

						<!-- Actions -->
						<div class="flex items-center justify-center">
							<div class="relative">
								<button
									onclick={(e) => {
										e.preventDefault()
										e.stopPropagation()
										toggleDropdown(participant.id)
									}}
									class="hover:text-foreground text-muted-foreground cursor-pointer p-2 transition-colors"
									aria-label="More options for {participant.displayName}"
								>
									<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
										<path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
									</svg>
								</button>

								<!-- Dropdown Menu -->
								{#if dropdownOpen === participant.id}
									<div class="border-border bg-muted absolute right-0 z-10 mt-2 w-48 rounded-md border shadow-lg">
										<div class="py-1">
											<button
												onclick={(e) => {
													e.stopPropagation()
													handlePrint(participant.id)
												}}
												class="hover:bg-muted text-foreground hover:text-foreground flex w-full cursor-pointer items-center px-4 py-2 text-sm transition-colors"
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
												class="hover:bg-muted text-foreground hover:text-foreground flex w-full cursor-pointer items-center px-4 py-2 text-sm transition-colors"
											>
												<svg class="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
												</svg>
												Delete
											</button>
										</div>
									</div>
								{/if}
							</div>
						</div>
					</a>
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
