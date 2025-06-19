<script lang="ts">
	import { enhance } from "$app/forms"
	import { Button } from "$lib/components/ui/button"
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card"
	import { Plus, Loader2 } from "@lucide/svelte"

	let isCreating = $state(false)
</script>

<div class="flex min-h-[60vh] items-center justify-center">
	<Card class="w-full max-w-md">
		<CardHeader class="text-center">
			<div class="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
				<Plus class="text-primary h-6 w-6" />
			</div>
			<CardTitle>Create New Quiz</CardTitle>
			<CardDescription>Click the button below to create a new quiz. You'll be taken to the editor where you can add questions and customize your quiz.</CardDescription>
		</CardHeader>
		<CardContent>
			<form
				method="POST"
				use:enhance={() => {
					isCreating = true
					return async ({ update }) => {
						await update()
						isCreating = false
					}
				}}
			>
				<Button type="submit" class="w-full" disabled={isCreating}>
					{#if isCreating}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Creating Quiz...
					{:else}
						<Plus class="mr-2 h-4 w-4" />
						Create Quiz
					{/if}
				</Button>
			</form>
		</CardContent>
	</Card>
</div>
