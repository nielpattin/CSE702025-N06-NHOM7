<script lang="ts">
	import Button from "../button/button.svelte"
	import { Check, Copy } from "@lucide/svelte"

	export let code: string
	export let inline: boolean = false
	let copied = false
	let timeout: ReturnType<typeof setTimeout> | undefined

	async function handleCopy() {
		await navigator.clipboard.writeText(code)
		copied = true
		clearTimeout(timeout)
		timeout = setTimeout(() => {
			copied = false
		}, 1500)
	}
</script>

{#if inline}
	<span class="inline-flex items-center gap-1">
		<span class="bg-muted rounded border px-2 py-0.5 font-mono text-sm text-cyan-600">{code}</span>
		<Button variant="ghost" size="icon" class="!p-1" aria-label={copied ? "Copied!" : "Copy code"} onclick={handleCopy}>
			{#if copied}
				<Check class="h-4 w-4 text-green-500" />
			{:else}
				<Copy class="h-4 w-4" />
			{/if}
		</Button>
	</span>
{:else}
	<div class="group relative">
		<pre class="bg-muted overflow-x-auto rounded p-4 font-mono text-sm"><code>{code}</code></pre>
		<Button variant="ghost" size="icon" class="absolute top-2 right-2 transition-opacity" aria-label={copied ? "Copied!" : "Copy code"} onclick={handleCopy}>
			{#if copied}
				<Check class="text-green-500" />
			{:else}
				<Copy />
			{/if}
		</Button>
	</div>
{/if}
