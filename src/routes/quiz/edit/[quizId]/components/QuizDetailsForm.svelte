<script lang="ts">
	import { enhance, applyAction } from "$app/forms"
	import { invalidateAll } from "$app/navigation"
	import { Toast, Spinner } from "flowbite-svelte"
	import { slide } from "svelte/transition"

	let { quizTitle } = $props<{
		quizTitle: string
	}>()

	let currentTitle = $state(quizTitle)
	let isEditing = $state(false)
	let isSubmitting = $state(false)
	let toastStatus = $state(false)
	let toastMessage = $state("")
	let submissionSuccessful = $state(false)
</script>

<form
	method="POST"
	use:enhance={() => {
		isSubmitting = true
		submissionSuccessful = false
		let submissionPromise: Promise<void>
		const minLoadingTime = new Promise<void>((resolve) => {
			setTimeout(resolve, 1000)
		})

		return async ({ result }) => {
			submissionPromise = new Promise<void>((resolve) => {
				resolve()
			})

			await Promise.all([submissionPromise, minLoadingTime])
			isSubmitting = false
			isEditing = false
			await applyAction(result)

			if (result.type === "success") {
				submissionSuccessful = true
				toastMessage = "Quiz title updated successfully."
				toastStatus = true
				setTimeout(() => {
					toastStatus = false
				}, 3000)
				await invalidateAll()
			}
		}
	}}
	class="mb-8"
	id="quiz-form"
>
	<div class="mb-4">
		<label for="quiz-title" class="mb-3 block text-lg font-medium text-white">Quiz Title</label>
		<div class="flex items-end gap-3">
			<div class="flex-1">
				<input type="text" id="quiz-title" name="title" class="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none" bind:value={currentTitle} placeholder="Enter quiz title..." required disabled={!isEditing || isSubmitting} />
			</div>
			{#if isEditing}
				<button type="submit" disabled={isSubmitting} class="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-medium whitespace-nowrap text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none">
					{#if isSubmitting}
						<Spinner class="mr-2" size="4" />
						Saving...
					{:else}
						Save Changes
					{/if}
				</button>
			{:else}
				<button type="button" onclick={() => (isEditing = true)} class="rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 px-4 py-3 text-sm font-medium whitespace-nowrap text-white shadow-md transition-all hover:from-gray-700 hover:to-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"> Edit </button>
			{/if}
		</div>
	</div>
	<Toast color="green" class="!border !border-emerald-500 !bg-emerald-600 !text-emerald-50 !shadow-lg !shadow-emerald-500/20" transition={slide} position="bottom-right" bind:toastStatus>
		{toastMessage}
	</Toast>
</form>
