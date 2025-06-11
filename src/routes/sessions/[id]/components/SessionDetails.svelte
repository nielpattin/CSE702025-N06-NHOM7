<script lang="ts">
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
</script>

<div class="mb-6 flex items-start justify-between">
	<div>
		<h2 class="mb-2 text-2xl font-semibold text-white">{session.quiz.title}</h2>
		{#if session.quiz.description}
			<p class="mb-4 text-gray-400">{session.quiz.description}</p>
		{/if}
		<div class="flex flex-wrap gap-4 text-sm text-gray-400">
			<div class="flex items-center gap-1">
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.74 5.74L10.5 17H8v-2.5L15.26 7.26A6 6 0 0117 7z" />
				</svg>
				Session Code: <span class="font-mono font-semibold text-white">{session.code}</span>
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
	</div>
	<div class="flex flex-col items-end gap-2">
		<span class="inline-flex items-center rounded-full bg-blue-900 px-3 py-1 text-xs font-medium text-blue-200">
			{session.quiz.status}
		</span>
		<span class="inline-flex items-center rounded-full bg-gray-700 px-3 py-1 text-xs font-medium text-gray-300">
			{session.quiz.visibility}
		</span>
	</div>
</div>
