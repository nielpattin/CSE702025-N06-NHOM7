<script lang="ts">
	import { Button } from "$lib/components/ui/button"
	import { Input } from "$lib/components/ui/input"
	import { Search, X } from "@lucide/svelte"

	let {
		value = "",
		onSearch,
		onClear,
		currentSearch
	}: {
		value?: string
		onSearch: (searchTerm: string) => void
		onClear: () => void
		currentSearch?: string
	} = $props()

	let searchInput = $state(value)

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Enter") {
			onSearch(searchInput)
		}
		if (event.key === "Escape") {
			searchInput = ""
			onClear()
		}
	}

	function handleClear() {
		searchInput = ""
		onClear()
	}
</script>

<div class="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
	<div class="relative flex items-center space-x-2">
		<div class="relative flex-1">
			<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
			<Input type="text" bind:value={searchInput} onkeydown={handleKeydown} placeholder="Search quiz titles..." class="pr-10 pl-10" />
			{#if searchInput}
				<Button variant="ghost" size="sm" onclick={handleClear} class="text-muted-foreground hover:text-foreground absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 cursor-pointer p-0 hover:bg-transparent">
					<X class="h-4 w-4" />
					<span class="sr-only">Clear search</span>
				</Button>
			{/if}
		</div>

		<Button onclick={() => onSearch(searchInput)} variant="default" size="sm" class="cursor-pointer">
			<Search class="mr-2 h-4 w-4" />
			Search
		</Button>
	</div>
	{#if currentSearch}
		<div class="mt-3 flex items-center justify-between">
			<p class="text-muted-foreground text-sm">
				Showing results for: <span class="text-foreground font-medium">"{currentSearch}"</span>
			</p>
		</div>
	{/if}
</div>
