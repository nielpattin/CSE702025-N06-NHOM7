<script lang="ts">
	import { enhance } from "$app/forms"
	import { invalidateAll } from "$app/navigation"
	import { Button } from "$lib/components/ui/button"
	import { Input } from "$lib/components/ui/input"
	import { Textarea } from "$lib/components/ui/textarea"
	import { TagSelector } from "$lib/components/ui/tag-selector"
	import { Edit, Save, Loader2 } from "@lucide/svelte"
	import { toast } from "svelte-sonner"
	import type { Tag } from "$lib/types"

	interface ActionData {
		error?: string
		success?: boolean
	}

	let {
		quizTitle,
		quizDescription = "",
		availableTags = [],
		selectedTagIds = []
	} = $props<{
		quizTitle: string
		quizDescription?: string
		availableTags: Tag[]
		selectedTagIds?: number[]
	}>()

	let currentTitle = $state(quizTitle)
	let currentDescription = $state(quizDescription)
	let currentTagIds = $state([...selectedTagIds])
	let isEditing = $state(false)
	let isSubmitting = $state(false)

	function handleTagsChange(tagIds: number[]) {
		currentTagIds = tagIds
	}
</script>

<form
	method="POST"
	action="?/updateQuizDetails"
	use:enhance={() => {
		isSubmitting = true
		return async ({ result }) => {
			isSubmitting = false
			isEditing = false

			if (result.type === "success") {
				toast.success("Quiz details updated successfully!")
				await invalidateAll()
			} else if (result.type === "failure" && result.data) {
				const data = result.data as ActionData
				toast.error(data.error || "Failed to update quiz details")
			}
		}
	}}
	class="space-y-6"
>
	<!-- Title Field -->
	<div class="space-y-2">
		<label for="quiz-title" class="text-sm font-medium">Quiz Title</label>
		<Input id="quiz-title" name="title" bind:value={currentTitle} placeholder="Enter quiz title..." required disabled={!isEditing || isSubmitting} />
	</div>

	<!-- Description Field -->
	<div class="space-y-2">
		<label for="quiz-description" class="text-sm font-medium">Description (Optional)</label>
		<Textarea id="quiz-description" name="description" bind:value={currentDescription} placeholder="Enter quiz description..." disabled={!isEditing || isSubmitting} rows={3} />
	</div>

	<!-- Tags Selection -->
	<div class="space-y-2">
		<label for="quiz-categories" class="text-sm font-medium">Categories</label>
		<TagSelector id="quiz-categories" {availableTags} selectedTagIds={currentTagIds} onTagsChange={handleTagsChange} disabled={!isEditing || isSubmitting} />
		<!-- Hidden input to send tag IDs -->
		{#each currentTagIds as tagId (tagId)}
			<input type="hidden" name="tagIds" value={tagId} />
		{/each}
	</div>

	<!-- Action Buttons -->
	<div class="flex gap-3">
		{#if isEditing}
			<Button type="submit" disabled={isSubmitting} class="gap-2">
				{#if isSubmitting}
					<Loader2 class="h-4 w-4 animate-spin" />
					Saving...
				{:else}
					<Save class="h-4 w-4" />
					Save Changes
				{/if}
			</Button>
			<Button
				type="button"
				variant="outline"
				onclick={() => {
					isEditing = false
					currentTitle = quizTitle
					currentDescription = quizDescription
					currentTagIds = [...selectedTagIds]
				}}
				disabled={isSubmitting}
			>
				Cancel
			</Button>
		{:else}
			<Button type="button" variant="outline" onclick={() => (isEditing = true)} class="gap-2">
				<Edit class="h-4 w-4" />
				Edit Details
			</Button>
		{/if}
	</div>
</form>
