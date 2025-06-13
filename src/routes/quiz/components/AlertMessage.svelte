<script lang="ts">
	let { type, message } = $props<{
		type: "success" | "error"
		message: string
	}>()

	const styles = {
		success: {
			container: "border-green-700 bg-green-900/50",
			icon: "text-green-400",
			text: "text-green-200"
		},
		error: {
			container: "border-red-700 bg-red-900/50",
			icon: "text-red-400",
			text: "text-red-200"
		}
	} as const

	const currentStyle = $derived(styles[type as keyof typeof styles])
</script>

<div class="mb-6 rounded-lg border {currentStyle.container} p-4">
	<div class="flex">
		<div class="flex-shrink-0">
			{#if type === "success"}
				<svg class="h-5 w-5 {currentStyle.icon}" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
				</svg>
			{:else}
				<svg class="h-5 w-5 {currentStyle.icon}" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
				</svg>
			{/if}
		</div>
		<div class="ml-3">
			<p class="text-sm font-medium {currentStyle.text}">
				{message}
			</p>
		</div>
	</div>
</div>
