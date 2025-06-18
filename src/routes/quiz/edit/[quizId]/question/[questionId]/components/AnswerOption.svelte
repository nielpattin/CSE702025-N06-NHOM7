<script lang="ts">
	type QuestionOption = {
		id?: number
		content: string
		correct: boolean
	}

	let { option, index, canRemove, onContentChange, onCorrectChange, onRemove } = $props<{
		option: QuestionOption
		index: number
		canRemove: boolean
		onContentChange: (content: string) => void
		onCorrectChange: (correct: boolean) => void
		onRemove: () => void
	}>()
</script>

<div class="border-border bg-muted rounded-lg border p-4 shadow-md">
	<div class="flex items-center gap-4">
		<div class="flex-1">
			<label for="option-{index}" class="mb-2 block text-sm font-medium text-gray-300">
				Option {index + 1}
			</label>
			<input id="option-{index}" type="text" value={option.content} oninput={(e) => onContentChange(e.currentTarget.value)} class="border-border bg-secondary w-full rounded-lg border px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Enter answer content..." />
		</div>
		<div class="flex flex-col items-center gap-2">
			<span class="text-sm font-medium text-gray-300">Correct</span>
			<input type="checkbox" checked={option.correct} onchange={(e) => onCorrectChange(e.currentTarget.checked)} class="border-border bg-muted h-5 w-5 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800" />
		</div>
		<button type="button" class="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50" onclick={onRemove} disabled={!canRemove}> Remove </button>
	</div>
</div>
