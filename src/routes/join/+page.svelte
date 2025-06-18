<script lang="ts">
	import AppHeader from "$lib/components/AppHeader.svelte"
	import { RecentActivity } from "./components"
	import { enhance } from "$app/forms"
	import Input from "$lib/components/ui/input/input.svelte"
	import Button from "$lib/components/ui/button/button.svelte"
	import * as Card from "$lib/components/ui/card"

	export let data: {
		recentSessions: Array<{
			id: number
			code: string
			status: string
			createdAt: Date
			quizTitle: string | null
			participantCount: number
		}>
	}
	export let form: { error?: string } | undefined
</script>

<AppHeader title="Join Quiz" />
<main class="container mx-auto px-4 pt-4">
	<div class="flex min-h-[60vh] flex-col items-center justify-center">
		<Card.Root class="w-full max-w-md p-4 shadow-xl backdrop-blur-sm transition-colors">
			<Card.Header class="text-center">
				<Card.Title class="text-3xl font-bold">Join Quiz</Card.Title>
				<Card.Description class="text-muted-foreground">Enter the quiz code to join a session</Card.Description>
			</Card.Header>

			<Card.Content>
				<form method="POST" use:enhance class="space-y-6">
					<div class="space-y-2">
						<label for="code" class="text-card-foreground block text-sm font-medium">Quiz Code</label>
						<Input id="code" name="code" type="text" placeholder="ABC123" required maxlength={6} autocomplete="off" class="border-border bg-secondary/60 w-full py-4 text-center text-xl tracking-widest text-white uppercase placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20" />
					</div>

					{#if form?.error}
						<div class="rounded-lg border border-red-500/50 bg-red-900/30 p-3 text-center">
							<p class="text-sm text-red-400">{form.error}</p>
						</div>
					{/if}

					<Button type="submit" class="w-full cursor-pointer bg-gradient-to-r from-purple-700 to-pink-700 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:from-purple-800 hover:to-pink-800 hover:shadow-xl focus:ring-purple-500/20 dark:bg-gradient-to-r dark:from-purple-500 dark:to-pink-500 dark:text-white" style="background: linear-gradient(to right, #6d28d9, #db2777); color: #fff;">Join Quiz Now</Button>
				</form>
			</Card.Content>

			<Card.Footer class="mt-6 text-center">
				<p class="text-xs text-gray-500">Don't have a code? Check out the recent sessions below</p>
			</Card.Footer>
		</Card.Root>

		<div class="mt-4 w-full max-w-6xl px-4">
			<RecentActivity sessions={data.recentSessions} />
		</div>
	</div>
</main>
