<script lang="ts">
	import { Button } from "$lib/components/ui/button"
	import { ChevronUp, ChevronDown } from "@lucide/svelte"
	import type { Component } from "svelte"

	interface SortOption {
		key: string
		label: string
		icon: Component
	}

	interface Props {
		options: SortOption[]
		currentSortKey: string
		currentSortOrder: "asc" | "desc"
		onSort: (key: string) => void
	}

	let { options, currentSortKey, currentSortOrder, onSort }: Props = $props()
</script>

<div class="flex items-center space-x-3">
	<span class="text-sm font-medium text-gray-400">Sort by:</span>
	{#each options as option (option.key)}
		<Button onclick={() => onSort(option.key)} variant={currentSortKey === option.key ? "default" : "outline"} size="sm" class={currentSortKey === option.key ? "bg-primary text-primary-foreground hover:bg-primary-hover" : "border-border bg-secondary text-muted-foreground hover:bg-secondary-hover hover:text-foreground"} style={currentSortKey === option.key ? "background-color: var(--primary) !important;" : ""}>
			<option.icon class="mr-2 h-4 w-4" />
			{option.label}
			{#if currentSortKey === option.key}
				{#if currentSortOrder === "asc"}
					<ChevronUp class="ml-2 h-4 w-4" />
				{:else}
					<ChevronDown class="ml-2 h-4 w-4" />
				{/if}
			{/if}
		</Button>
	{/each}
</div>
