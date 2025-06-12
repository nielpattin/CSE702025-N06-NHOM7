<script lang="ts">
	import CircularProgress from "./CircularProgress.svelte"

	let { participants, getAccuracyStrokeColor } = $props()
</script>

<!-- Mobile Card View -->
<div class="space-y-4 lg:hidden">
	{#each participants as participant, index (participant.id)}
		<div class="rounded-lg border border-gray-600 bg-gray-700 p-6">
			<!-- Header with participant info -->
			<div class="mb-4 flex items-center justify-between">
				<div class="flex items-center space-x-3">
					<div class="flex-shrink-0">
						{#if participant.user?.image}
							<img class="h-12 w-12 rounded-full" src={participant.user.image} alt={participant.displayName} />
						{:else}
							<div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-600">
								<span class="text-base font-medium text-white">
									{participant.displayName.charAt(0).toUpperCase()}
								</span>
							</div>
						{/if}
					</div>
					<div>
						<h4 class="text-base font-medium text-white">{participant.displayName}</h4>
						<p class="text-sm text-gray-400">Rank #{index + 1}</p>
					</div>
				</div>
				<button class="text-gray-500 transition-colors hover:text-gray-300" aria-label="More options for {participant.displayName}">
					<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
						<path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
					</svg>
				</button>
			</div>

			<!-- Performance metrics -->
			<div class="grid grid-cols-3 gap-4">
				<!-- Accuracy with circular progress -->
				<div class="text-center">
					<div class="mb-2 flex justify-center">
						<CircularProgress percentage={participant.accuracy} size={80} strokeWidth={6} {getAccuracyStrokeColor} />
					</div>
					<p class="text-xs font-medium tracking-wider text-gray-400 uppercase">Accuracy</p>
				</div>

				<!-- Points -->
				<div class="text-center">
					<div class="mb-2">
						<span class="text-lg font-bold text-white">
							{participant.points}
						</span>
					</div>
					<p class="text-xs font-medium tracking-wider text-gray-400 uppercase">Points</p>
				</div>

				<!-- Score -->
				<div class="text-center">
					<div class="mb-2">
						<span class="text-lg font-bold text-white">
							{participant.totalScore}
						</span>
					</div>
					<p class="text-xs font-medium tracking-wider text-gray-400 uppercase">Score</p>
				</div>
			</div>
		</div>
	{/each}
</div>
