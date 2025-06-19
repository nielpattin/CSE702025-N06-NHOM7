<script lang="ts">
	import { Checkbox as CheckboxPrimitive, type CheckboxRootProps } from "bits-ui"
	import { cn } from "$lib/utils"

	type $$Props = CheckboxRootProps

	let { class: className = "", ...rest }: $$Props = $props()
</script>

<CheckboxPrimitive.Root class={cn("peer border-primary ring-offset-background focus-visible:ring-ring data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground h-4 w-4 shrink-0 rounded-sm border focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50", className)} {...rest}>
	{#snippet children({ checked, indeterminate })}
		{#if indeterminate}
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
				<path d="M5 12h14" />
			</svg>
		{:else if checked}
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
				<path d="M18 6L7 17l-5-5" />
			</svg>
		{/if}
	{/snippet}
</CheckboxPrimitive.Root>
