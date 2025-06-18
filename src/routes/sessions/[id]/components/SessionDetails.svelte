<script lang="ts">
	import { Button } from "$lib/components/ui/button"
	import { Copy, Check } from "@lucide/svelte"

	type Session = {
		code: string
		status: string
		createdAt: Date | null
		quiz: {
			title: string | null
			description?: string | null
			status: string | null
			visibility: string | null
		}
	}

	let { session }: { session: Session } = $props()

	// State for copy feedback
	let copySuccess = $state(false)

	// Format date for display
	function formatDateForDisplay(date: Date): string {
		return new Date(date).toLocaleString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		})
	}

	// Copy shareable link to clipboard
	async function copyShareableLink() {
		const shareableLink = `${window.location.origin}/join?code=${session.code}`

		try {
			await navigator.clipboard.writeText(shareableLink)
			copySuccess = true
			setTimeout(() => {
				copySuccess = false
			}, 2000)
		} catch (err) {
			console.error("Failed to copy link:", err)
		}
	}

	const shareableLink = $derived(`${typeof window !== "undefined" ? window.location.origin : ""}/join?code=${session.code}`)
</script>

<div class="mb-6 flex items-start justify-between">
	<div>
		<h2 class="mb-2 text-2xl font-semibold text-white">{session.quiz.title}</h2>
		{#if session.quiz.description}
			<p class="mb-4 text-gray-400">{session.quiz.description}</p>
		{/if}
		<div class="flex flex-wrap gap-4 text-sm text-gray-400">
			<div class="flex items-center gap-2">
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.74 5.74L10.5 17H8v-2.5L15.26 7.26A6 6 0 0117 7z" />
				</svg>
				Session Code: <span class="font-mono font-semibold text-white">{session.code}</span>
				<Button size="sm" variant="outline" onclick={copyShareableLink} class="ml-2 h-6 px-2">
					{#if copySuccess}
						<Check class="mr-1 h-3 w-3" />
						Copied!
					{:else}
						<Copy class="mr-1 h-3 w-3" />
						Copy Link
					{/if}
				</Button>
			</div>
			<div class="flex items-center gap-1">
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				Status: <span class="font-medium capitalize {session.status === 'active' ? 'text-green-400' : 'text-red-400'}">{session.status}</span>
			</div>
			<div class="flex items-center gap-1">
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
				</svg>
				Created: {formatDateForDisplay(session.createdAt ?? new Date())}
			</div>
		</div>

		<!-- Shareable Link -->
		<div class="bg-muted mt-4 rounded-lg p-4">
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium text-gray-300">Share Link:</span>
			</div>
			<div class="mt-2 flex items-center gap-2">
				<span class="flex-1 font-mono text-sm break-all text-gray-400">{shareableLink}</span>
			</div>
		</div>
	</div>
	<div class="flex flex-col items-end gap-2">
		<span class="inline-flex items-center rounded-full bg-blue-900 px-3 py-1 text-xs font-medium text-blue-200">
			{session.quiz.status}
		</span>
		<span class="bg-muted inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-gray-300">
			{session.quiz.visibility}
		</span>
	</div>
</div>
