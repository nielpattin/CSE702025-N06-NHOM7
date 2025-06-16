<script lang="ts">
	interface SessionData {
		code: string
	}

	interface UserSession {
		user?: {
			id: string
		}
	}

	let {
		hasUserJoined,
		userSession,
		session
	}: {
		hasUserJoined: boolean
		userSession: UserSession | null
		session: SessionData
	} = $props()
</script>

<div class="bg-card text-card-foreground rounded-lg border shadow-sm">
	<div class="p-6">
		<h3 class="mb-3 font-semibold">
			{hasUserJoined ? "Waiting for Quiz to Start" : "How to Join"}
		</h3>
		<div class="space-y-3 text-sm">
			{#if hasUserJoined}
				<p>The quiz host will start the session once all participants have joined.</p>
				<ul class="text-muted-foreground list-inside list-disc space-y-1">
					<li>Make sure you have a stable internet connection</li>
					<li>The quiz will begin automatically when the host starts it</li>
				</ul>
			{:else}
				<p>Join the quiz session to participate in the game.</p>
				<ul class="text-muted-foreground list-inside list-disc space-y-1">
					<li>{userSession?.user ? 'Enter a display name (optional) and click "Join Game"' : 'Enter your name and click "Join Game"'}</li>
					<li>Share the session code <code class="bg-muted rounded px-1 py-0.5 font-mono">{session.code}</code> with others to join</li>
					<li>Make sure you have a stable internet connection</li>
				</ul>
			{/if}
		</div>
	</div>
</div>
