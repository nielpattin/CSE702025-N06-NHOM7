<script lang="ts">
	import CircularProgress from "./CircularProgress.svelte"

	let { participants, getAccuracyStrokeColor } = $props()
</script>

<!-- Desktop Table View -->
<div class="hidden lg:block">
	<div class="bg-gray-750 overflow-hidden rounded-lg border border-gray-600">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="border-b border-gray-600 bg-gray-700">
					<tr>
						<th class="px-6 py-4 text-left text-sm font-medium tracking-wider text-gray-300 uppercase"> Participant </th>
						<th class="px-6 py-4 text-center text-sm font-medium tracking-wider text-gray-300 uppercase"> Accuracy </th>
						<th class="px-6 py-4 text-center text-sm font-medium tracking-wider text-gray-300 uppercase"> Points </th>
						<th class="px-6 py-4 text-center text-sm font-medium tracking-wider text-gray-300 uppercase"> Score </th>
						<th class="px-6 py-4 text-center text-sm font-medium tracking-wider text-gray-300 uppercase"> Actions </th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-600 bg-gray-800">
					{#each participants as participant, index (participant.id)}
						<tr class="transition-colors hover:bg-gray-700">
							<!-- Participant Info -->
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="flex items-center space-x-4">
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
							</td>

							<!-- Accuracy with Circular Progress -->
							<td class="px-6 py-4 text-center whitespace-nowrap">
								<div class="flex items-center justify-center">
									<CircularProgress percentage={participant.accuracy} size={60} strokeWidth={6} {getAccuracyStrokeColor} />
								</div>
							</td>

							<!-- Points -->
							<td class="px-6 py-4 text-center whitespace-nowrap">
								<span class="text-lg font-bold text-white">
									{participant.points}
								</span>
							</td>

							<!-- Score -->
							<td class="px-6 py-4 text-center whitespace-nowrap">
								<span class="text-lg font-bold text-white">
									{participant.totalScore}
								</span>
							</td>

							<!-- Actions -->
							<td class="px-6 py-4 text-center whitespace-nowrap">
								<button class="text-gray-500 transition-colors hover:text-gray-300" aria-label="More options for {participant.displayName}">
									<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
										<path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
									</svg>
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
