<script lang="ts">
	import { enhance, applyAction } from "$app/forms"
	import { invalidateAll } from "$app/navigation"
	import { onMount } from "svelte"
	import { Button } from "$lib/components/ui/button/index.js"
	import { Input } from "$lib/components/ui/input/index.js"
	import { Loader2 } from "@lucide/svelte"

	interface UserSession {
		user?: {
			id: string
		}
	}

	let { userSession }: { userSession: UserSession | null } = $props()

	let participantName = $state("")
	let isJoining = $state(false)
</script>

<div class="bg-card text-card-foreground mx-auto max-w-md rounded-lg border shadow-sm">
	<div class="flex flex-col space-y-1.5 p-6 text-center">
		<h3 class="text-2xl leading-none font-semibold tracking-tight">Join the Quiz</h3>
		<p class="text-muted-foreground text-sm">Enter your details to participate in this quiz session</p>
	</div>
	<div class="p-6 pt-0">
		<form
			method="POST"
			action="?/joinSession"
			use:enhance={() => {
				isJoining = true
				return async ({ result }) => {
					isJoining = false
					if (result.type === "success") {
						participantName = ""
						await invalidateAll()
					}
					await applyAction(result)
				}
			}}
			class="space-y-4"
		>
			<div class="space-y-2">
				<label for="name" class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
					{userSession?.user ? "Display name (optional)" : "Your name"}
				</label>
				<Input id="name" name="name" bind:value={participantName} placeholder={userSession?.user ? "Display name for this session" : "Your name"} disabled={isJoining} required={!userSession?.user} />
			</div>
			<Button type="submit" disabled={isJoining || (!userSession?.user && !participantName.trim())} class="w-full">
				{#if isJoining}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					Joining...
				{:else}
					Join Game
				{/if}
			</Button>
		</form>
	</div>
</div>
