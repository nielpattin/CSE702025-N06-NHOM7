<script lang="ts">
	import ParticipantsTable from "./ParticipantsTable.svelte"
	import ParticipantsCards from "./ParticipantsCards.svelte"

	let { participants, getAccuracyStrokeColor } = $props()
</script>

<!-- Participants Tab Content -->
<div class="space-y-6">
	{#if participants.length === 0}
		<div class="py-12 text-center">
			<svg class="mx-auto h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 715 0z"></path>
			</svg>
			<h3 class="mt-2 text-sm font-medium text-white">No participants</h3>
			<p class="mt-1 text-sm text-gray-400">No one has joined this session yet.</p>
		</div>
	{:else}
		<ParticipantsTable {participants} {getAccuracyStrokeColor} />
		<ParticipantsCards {participants} {getAccuracyStrokeColor} />
	{/if}
</div>
