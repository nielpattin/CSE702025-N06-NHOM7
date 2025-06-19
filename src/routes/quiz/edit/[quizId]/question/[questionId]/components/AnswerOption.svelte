<script lang="ts">
	import { Button } from "$lib/components/ui/button"
	import { Card, CardContent } from "$lib/components/ui/card"
	import { Badge } from "$lib/components/ui/badge"
	import { Trash2, Check } from "@lucide/svelte"

	type QuestionOption = {
		id?: number
		content: string
		correct: boolean
	}

	// Extend Window interface to include clipboardData
	interface CustomWindow extends Window {
		clipboardData?: DataTransfer
	}

	let { option, index, canRemove, onContentChange, onCorrectChange, onRemove, cardClass, colorClass } = $props<{
		option: QuestionOption
		index: number
		canRemove: boolean
		onContentChange: (content: string) => void
		onCorrectChange: (correct: boolean) => void
		onRemove: () => void
		cardClass?: string
		colorClass: string
	}>()
</script>

<Card class="relative {cardClass ?? 'h-72'} {colorClass}">
	<!-- Top-left delete button -->
	<div class="absolute top-2 left-2 z-10">
		<Button type="button" variant="ghost" size="sm" onclick={onRemove} disabled={!canRemove} class="hover:text-destructive h-8 w-8 cursor-pointer p-0 text-white">
			<Trash2 class="h-4 w-4" />
		</Button>
	</div>
	<!-- Top-right check icon button with white border -->
	<div class="absolute top-2 right-2 z-10">
		<button
			type="button"
			onclick={() => onCorrectChange(!option.correct)}
			class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white transition-colors
				{option.correct ? 'bg-green-600 text-white dark:bg-green-400' : 'bg-muted-foreground/50 text-white'}
				active:scale-95"
			aria-label="Mark as correct"
		>
			<Check class="h-4 w-4" />
		</button>
	</div>
	<CardContent class="flex h-full flex-1 flex-col items-center justify-center p-4 pt-6">
		<div
			id="option-{index}"
			contenteditable="true"
			onblur={(e) => onContentChange((e.currentTarget as HTMLDivElement).innerText)}
			onpaste={(e) => {
				const clipboardData = e.clipboardData || (window as CustomWindow).clipboardData
				if (clipboardData && clipboardData.files.length > 0) {
					e.preventDefault()
				} else {
					// Allow text paste and then update content
					setTimeout(() => onContentChange((e.currentTarget as HTMLDivElement).innerText), 0)
				}
			}}
			class="scrollbar-custom flex max-h-full w-full resize-none items-center justify-center overflow-y-auto bg-transparent text-center text-base break-all whitespace-normal text-white placeholder-white focus:bg-black/20 focus:outline-none"
			data-placeholder="Type answer option here"
		>
			{option.content}
		</div>
	</CardContent>
</Card>

<style>
	[contenteditable][data-placeholder]:empty::before {
		content: attr(data-placeholder);
		color: #e5e7eb !important; /* A lighter gray, text-gray-200 equivalent */
		opacity: 1 !important;
	}

	[contenteditable] {
		height: 100%; /* Ensure it takes full height of its container */
		line-height: 1.5rem; /* Vertically align caret */
	}
</style>
