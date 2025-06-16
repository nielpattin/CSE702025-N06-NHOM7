<script lang="ts">
	import { Users, Clock } from "@lucide/svelte"

	interface Participant {
		id: number
		name?: string | null
		userId?: string | null
		createdAt: Date | null
		user?: {
			name?: string | null
			image?: string | null
		} | null
	}

	let { participants }: { participants: Participant[] } = $props()

	function getParticipantName(participant: Participant) {
		if (participant.name) {
			return participant.name
		}
		if (participant.userId && participant.user?.name) {
			return participant.user.name
		}
		return "Anonymous"
	}

	function getParticipantAvatar(participant: Participant) {
		return participant.user?.image || null
	}

	function formatJoinTime(date: Date | null) {
		if (!date) return "Unknown"
		return new Date(date).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit"
		})
	}
</script>

<div class="bg-card text-card-foreground rounded-lg border shadow-sm">
	<div class="flex flex-col space-y-1.5 p-6">
		<h3 class="flex items-center gap-2 text-2xl leading-none font-semibold tracking-tight">
			<Users class="h-5 w-5" />
			Participants ({participants.length})
		</h3>
	</div>
	<div class="p-6 pt-0">
		{#if participants.length === 0}
			<div class="space-y-3 py-8 text-center">
				<Users class="text-muted-foreground mx-auto h-12 w-12" />
				<div class="space-y-1">
					<p class="text-lg font-medium">No participants yet</p>
					<p class="text-muted-foreground text-sm">Share the session code for others to join</p>
				</div>
			</div>
		{:else}
			<div class="space-y-3">
				{#each participants as participant (participant.id)}
					<div class="bg-card hover:bg-accent/50 flex items-center gap-3 rounded-lg border p-3 transition-colors">
						<div class="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
							{#if getParticipantAvatar(participant)}
								<img src={getParticipantAvatar(participant)} alt={getParticipantName(participant)} class="aspect-square h-full w-full" />
							{:else}
								<div class="bg-muted flex h-full w-full items-center justify-center rounded-full">
									<span class="text-sm font-medium">{getParticipantName(participant).charAt(0).toUpperCase()}</span>
								</div>
							{/if}
						</div>
						<div class="flex-1 space-y-1">
							<p class="font-medium">{getParticipantName(participant)}</p>
							<div class="text-muted-foreground flex items-center gap-2 text-sm">
								<span>{participant.userId ? "Registered user" : "Guest"}</span>
								<span>•</span>
								<Clock class="h-3 w-3" />
								<span>Joined at {formatJoinTime(participant.createdAt)}</span>
							</div>
						</div>
						<div class="h-3 w-3 rounded-full bg-green-500" title="Online"></div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
