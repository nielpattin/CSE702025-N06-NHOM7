<script lang="ts">
	import { Badge } from "$lib/components/ui/badge"
	import { Button } from "$lib/components/ui/button"
	import * as Command from "$lib/components/ui/command"
	import * as Popover from "$lib/components/ui/popover"
	import { Checkbox } from "$lib/components/ui/checkbox"
	import { Check, ChevronsUpDown, X } from "@lucide/svelte"
	import type { Tag } from "$lib/types"
	import { cn } from "$lib/utils"
	import { tick } from "svelte"

	let {
		availableTags,
		selectedTagIds = [],
		onTagsChange,
		maxTags = 5,
		id,
		disabled = false // New prop for disabling
	} = $props<{
		availableTags: Tag[]
		selectedTagIds?: number[]
		onTagsChange: (tagIds: number[]) => void
		maxTags?: number
		id?: string
		disabled?: boolean // Make disabled optional
	}>()

	let open = $state(false)
	let triggerRef = $state<HTMLButtonElement>(null!)
	let searchTerm = $state("")

	// Derived state for currently selected tags
	let selectedTags = $derived(availableTags.filter((tag: Tag) => selectedTagIds.includes(tag.id)))

	// Filtered tags based on search term
	let filteredTags: Tag[] = $derived(searchTerm ? availableTags.filter((tag: Tag) => tag.name.toLowerCase().includes(searchTerm.toLowerCase())) : availableTags)

	// Close popover if disabled becomes true
	$effect(() => {
		if (disabled) {
			open = false
		}
	})

	function toggleTag(tagId: number) {
		if (disabled) return // Prevent changes if disabled
		if (selectedTagIds.includes(tagId)) {
			onTagsChange(selectedTagIds.filter((id: number) => id !== tagId))
		} else if (selectedTagIds.length < maxTags) {
			onTagsChange([...selectedTagIds, tagId])
		}
	}

	function removeTag(tagId: number) {
		if (disabled) return // Prevent changes if disabled
		onTagsChange(selectedTagIds.filter((id: number) => id !== tagId))
	}

	function closeAndFocusTrigger() {
		open = false
		tick().then(() => {
			triggerRef.focus()
		})
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		<Button bind:ref={triggerRef} variant="outline" role="combobox" aria-expanded={open} class="h-auto min-h-10 w-full justify-between px-3 py-2" {id} {disabled}>
			<div class="flex flex-wrap gap-1">
				{#each selectedTags as tag (tag.id)}
					<Badge style="background-color: {tag.color || '#6B7280'}" class="gap-1 text-white">
						{tag.name}
						<button onclick={() => removeTag(tag.id)} class="ml-1 hover:text-gray-200" {disabled}>
							<X class="h-3 w-3" />
						</button>
					</Badge>
				{/each}
				{#if selectedTags.length === 0}
					<span class="text-muted-foreground">Select categories...</span>
				{/if}
			</div>
			<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-[--radix-popover-trigger-width] p-0">
		<Command.Root>
			<Command.Input placeholder="Search categories..." bind:value={searchTerm} {disabled} />
			<Command.List>
				<Command.Empty>No categories found.</Command.Empty>
				<Command.Group>
					{#each filteredTags as tag: Tag (tag.id)}
						<Command.Item
							value={tag.name}
							onSelect={() => {
								if (disabled) return // Prevent selection if disabled
								toggleTag(tag.id)
								searchTerm = "" // Clear search term after selection
							}}
							{disabled}
						>
							<Checkbox checked={selectedTagIds.includes(tag.id)} onCheckedChange={() => toggleTag(tag.id)} class={cn("mr-2")} {disabled} />
							<div class="flex flex-1 items-center gap-2">
								<div class="h-3 w-3 rounded-full" style="background-color: {tag.color || '#6B7280'}"></div>
								<span>{tag.name}</span>
							</div>
							<Check class={cn("ml-auto h-4 w-4", selectedTagIds.includes(tag.id) ? "opacity-100" : "opacity-0")} />
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>

{#if selectedTagIds.length >= maxTags}
	<p class="text-muted-foreground mt-2 text-xs">Maximum {maxTags} categories allowed</p>
{/if}
