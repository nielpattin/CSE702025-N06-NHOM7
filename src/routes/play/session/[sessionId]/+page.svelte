<script lang="ts">
	import type { PageData } from "./$types"
	import AppHeader from "$lib/components/AppHeader.svelte"
	import { PlaySessionDeletingAlert, PlaySessionHeader, PlayParticipantsList, PlaySessionJoinForm, PlaySessionInstructions, PlaySessionReattemptForm } from "./components"

	let { data }: { data: PageData } = $props()

	const { session: quizSession, participants, sessionDeleting } = data

	function hasUserJoined() {
		if (data.userSession?.user) {
			return participants.some((p) => p.userId === data.userSession?.user?.id)
		}
		return false
	}
</script>

<svelte:head>
	<title>Session Lobby - {quizSession.quiz.title}</title>
</svelte:head>

<AppHeader title="Session Lobby" />

<div class="container mx-auto max-w-4xl px-4 py-8">
	{#if sessionDeleting}
		<PlaySessionDeletingAlert session={quizSession} />
	{:else}
		<div class="space-y-8">
			<PlaySessionHeader session={quizSession} />

			{#if !hasUserJoined()}
				<PlaySessionJoinForm userSession={data.userSession} />
			{/if}

			<PlayParticipantsList {participants} />

			<PlaySessionInstructions hasUserJoined={hasUserJoined()} userSession={data.userSession} session={quizSession} />

			{#if hasUserJoined() && data.userSession?.user}
				<PlaySessionReattemptForm />
			{/if}
		</div>
	{/if}
</div>
