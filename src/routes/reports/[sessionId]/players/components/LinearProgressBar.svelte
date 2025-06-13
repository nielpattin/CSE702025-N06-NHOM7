<script>
	let { correct, incorrect } = $props()

	const total = $derived(correct + incorrect)
	const correctPercentage = $derived(total > 0 ? (correct / total) * 100 : 0)
</script>

<div class="w-full">
	<div class="flex h-3 w-full overflow-hidden">
		{#if correctPercentage > 0}
			<div class="bg-green-400 transition-all duration-300" style="width: {correctPercentage}%"></div>
		{/if}
		{#if incorrect > 0}
			<div class="flex-1 bg-red-400 transition-all duration-300"></div>
		{/if}
	</div>

	<div class="mt-1 flex justify-center gap-6 text-sm text-gray-200">
		<div class="flex items-center gap-1">
			<div class="h-3 w-3 rounded-sm bg-green-400"></div>
			<span>{correct}</span>
		</div>
		<div class="flex items-center gap-1">
			<div class="h-3 w-3 rounded-sm bg-red-400"></div>
			<span>{incorrect}</span>
		</div>
	</div>
</div>
