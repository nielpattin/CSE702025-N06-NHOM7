<script lang="ts">
	import { enhance, applyAction } from "$app/forms"
	import { invalidateAll } from "$app/navigation"
	import { onMount } from "svelte"
	import type { PageData } from "./$types"
	import DashboardHeader from "$lib/components/DashboardHeader.svelte"

	let { data }: { data: PageData } = $props()

	const { session: quizSession, participants } = data

	// Form state
	let participantName = $state("")
	let guestId = $state("")
	let isJoining = $state(false)
	let isReattempting = $state(false)

	// Generate and store guest ID on mount (only for non-authenticated users)
	onMount(() => {
		// Only generate guestId for users who are not logged in
		if (!data.userSession?.user) {
			const existingGuestId = localStorage.getItem("guestId")
			if (existingGuestId) {
				guestId = existingGuestId
			} else {
				const newGuestId = crypto.randomUUID()
				guestId = newGuestId
				localStorage.setItem("guestId", newGuestId)
			}
		}
	})

	// Check if current user has already joined
	function hasUserJoined() {
		if (data.userSession?.user) {
			// Check if authenticated user has joined
			return participants.some((p) => p.userId === data.userSession?.user?.id)
		}
		// For guests, we assume they haven't joined if they can see the form
		return false
	}

	// Format the participant display name
	function getParticipantName(participant: (typeof participants)[0]) {
		// Prioritize custom name from sessionParticipants, then user account name, then fallback
		if (participant.name) {
			return participant.name
		}
		if (participant.userId && participant.user?.name) {
			return participant.user.name
		}
		return "Anonymous"
	}

	// Get participant avatar
	function getParticipantAvatar(participant: (typeof participants)[0]) {
		return participant.user?.image || null
	}

	// Format join time
	function formatJoinTime(date: Date | null) {
		if (!date) return "Unknown"
		return new Date(date).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit"
		})
	}
</script>

<svelte:head>
	<title>Session Lobby - {quizSession.quiz.title}</title>
</svelte:head>

<DashboardHeader title="Session Lobby" />

<div class="min-h-screen bg-gray-800">
	<div class="container mx-auto px-4 py-8">
		<!-- Header -->
		<div class="mb-8 text-center">
			<h1 class="mb-2 text-4xl font-bold text-white">
				{quizSession.quiz.title}
			</h1>
			{#if quizSession.quiz.description}
				<p class="mb-4 text-lg text-gray-300">
					{quizSession.quiz.description}
				</p>
			{/if}
			<div class="inline-flex items-center gap-4 rounded-lg border border-gray-700 bg-gray-900/50 px-6 py-3 shadow-lg">
				<div class="text-sm text-gray-400">Session Code:</div>
				<div class="font-mono text-2xl font-bold text-blue-400">
					{quizSession.code}
				</div>
				<div class="text-sm text-gray-400">
					Status: <span class="inline-flex items-center rounded-full bg-green-900 px-2.5 py-0.5 text-xs font-medium text-green-200 capitalize">{quizSession.status}</span>
				</div>
			</div>
		</div>

		<!-- Participants Section -->
		<div class="mx-auto max-w-4xl">
			<div class="rounded-lg border border-gray-700 bg-gray-900/50 shadow-lg">
				<div class="border-b border-gray-700 px-6 py-4">
					<h2 class="text-xl font-semibold text-white">
						Participants ({participants.length})
					</h2>
				</div>

				<div class="p-6">
					{#if participants.length === 0}
						<div class="py-8 text-center">
							<div class="mb-2 text-gray-500">
								<svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z"></path>
								</svg>
							</div>
							<p class="text-lg text-gray-300">No participants yet</p>
							<p class="mt-1 text-sm text-gray-400">Share the session code for others to join</p>
						</div>
					{:else}
						<div class="grid gap-3">
							{#each participants as participant (participant.id)}
								<div class="flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-800/50 p-3 transition-colors hover:bg-gray-800/70">
									<div class="flex-shrink-0">
										{#if getParticipantAvatar(participant)}
											<img src={getParticipantAvatar(participant)} alt={getParticipantName(participant)} class="h-10 w-10 rounded-full" />
										{:else}
											<div class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600">
												<span class="text-sm font-medium text-white">
													{getParticipantName(participant).charAt(0).toUpperCase()}
												</span>
											</div>
										{/if}
									</div>
									<div class="flex-1">
										<div class="font-medium text-white">
											{getParticipantName(participant)}
										</div>
										<div class="text-sm text-gray-400">
											{participant.userId ? "Registered user" : "Guest"} • Joined at {formatJoinTime(participant.createdAt)}
										</div>
									</div>
									<div class="flex-shrink-0">
										<div class="h-3 w-3 rounded-full bg-green-400" title="Online"></div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Join Form (only show if user hasn't joined) -->
		{#if !hasUserJoined()}
			<div class="mx-auto mt-8 max-w-md">
				<div class="rounded-lg border border-gray-700 bg-gray-900/50 p-6 shadow-lg">
					<h3 class="mb-4 text-center text-xl font-semibold text-white">Join the Quiz</h3>
					<form
						method="POST"
						action="?/joinSession"
						use:enhance={() => {
							isJoining = true
							return async ({ result }) => {
								isJoining = false
								if (result.type === "success") {
									participantName = ""
									await invalidateAll()
								}
								await applyAction(result)
							}
						}}
					>
						<div class="mb-4">
							<label for="name" class="mb-2 block text-sm font-medium text-gray-300">
								{data.userSession?.user ? "Enter your display name (optional)" : "Enter your name"}
							</label>
							<input type="text" id="name" name="name" bind:value={participantName} required={!data.userSession?.user} placeholder={data.userSession?.user ? "Display name for this session" : "Your name"} disabled={isJoining} class="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50" />
						</div>
						{#if !data.userSession?.user}
							<!-- Only include guestId for non-authenticated users -->
							<input type="hidden" name="guestId" value={guestId} />
						{/if}
						<button type="submit" disabled={isJoining || (!data.userSession?.user && !participantName.trim())} class="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50">
							{#if isJoining}
								<div class="flex items-center justify-center gap-2">
									<svg class="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
									</svg>
									Joining...
								</div>
							{:else}
								Join Game
							{/if}
						</button>
					</form>
				</div>
			</div>
		{/if}

		<!-- Instructions -->
		<div class="mx-auto mt-8 max-w-2xl">
			<div class="rounded-lg border border-blue-700 bg-blue-900/20 p-6">
				<h3 class="mb-2 text-lg font-semibold text-blue-300">
					{hasUserJoined() ? "Waiting for Quiz to Start" : "How to Join"}
				</h3>
				{#if hasUserJoined()}
					<p class="mb-4 text-blue-200">The quiz host will start the session once all participants have joined.</p>
					<div class="text-sm text-blue-200">
						<p class="mb-1">• Make sure you have a stable internet connection</p>
						<p>• The quiz will begin automatically when the host starts it</p>
					</div>
				{:else}
					<p class="mb-4 text-blue-200">Join the quiz session to participate in the game.</p>
					<div class="text-sm text-blue-200">
						<p class="mb-1">• {data.userSession?.user ? 'Enter a display name (optional) and click "Join Game"' : 'Enter your name and click "Join Game"'}</p>
						<p class="mb-1">• Share the session code <strong class="font-mono text-blue-400">{quizSession.code}</strong> with others to join</p>
						<p>• Make sure you have a stable internet connection</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Reattempt Button (only show if user has joined) -->
		{#if hasUserJoined() && data.userSession?.user}
			<div class="mx-auto mt-8 max-w-md">
				<div class="rounded-lg border border-gray-700 bg-gray-900/50 p-6 shadow-lg">
					<h3 class="mb-4 text-center text-xl font-semibold text-white">Start New Attempt</h3>
					<p class="mb-4 text-center text-sm text-gray-400">Create a new attempt to retake this quiz</p>
					<form
						method="POST"
						action="?/reattempt"
						use:enhance={() => {
							isReattempting = true
							return async ({ result }) => {
								isReattempting = false
								await applyAction(result)
							}
						}}
					>
						<button type="submit" disabled={isReattempting} class="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50">
							{#if isReattempting}
								<div class="flex items-center justify-center gap-2">
									<svg class="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
									</svg>
									Starting...
								</div>
							{:else}
								🔄 Reattempt Quiz
							{/if}
						</button>
					</form>
				</div>
			</div>
		{/if}
	</div>
</div>
