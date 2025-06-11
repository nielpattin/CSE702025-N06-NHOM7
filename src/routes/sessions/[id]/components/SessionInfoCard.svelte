<script lang="ts">
	import type { ActionData } from "../$types"
	import SessionDetails from "./SessionDetails.svelte"
	import SessionExpiration from "./SessionExpiration.svelte"
	import type { SessionStatus, QuizStatus, QuizVisibility } from "$lib/server/db/schema"

	type SessionWithQuiz = {
		id: number
		quizId: number
		hostId: string
		code: string
		status: SessionStatus
		expiresAt: Date
		createdAt: Date | null
		updatedAt: Date | null
		quiz: {
			id: number
			title: string | null
			description: string | null
			status: QuizStatus | null
			visibility: QuizVisibility
		}
	}

	let {
		session,
		actionData
	}: {
		session: SessionWithQuiz
		actionData: ActionData | undefined
	} = $props()
</script>

<!-- Session Info Card -->
<div class="rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-sm">
	<SessionDetails {session} />
	<SessionExpiration {session} {actionData} />

	{#if actionData?.error}
		<div class="mt-4 rounded-lg border border-red-600 bg-red-900/50 p-4">
			<p class="text-sm text-red-200">{actionData.error}</p>
		</div>
	{/if}

	{#if actionData?.success}
		<div class="mt-4 rounded-lg border border-green-600 bg-green-900/50 p-4">
			<p class="text-sm text-green-200">{actionData.message}</p>
		</div>
	{/if}
</div>
