<script lang="ts">
	import { enhance } from "$app/forms"
	import { invalidateAll } from "$app/navigation"
	import { onMount, tick } from "svelte"
	import { Datepicker, Label, Timepicker } from "flowbite-svelte"
	import type { ActionData } from "../$types"

	type Session = {
		expiresAt: Date | null
	}

	let { session, actionData }: { session: Session; actionData?: ActionData } = $props()

	function formatTimeForInput(date: Date): string {
		const d = new Date(date)
		const hours = d.getHours().toString().padStart(2, "0")
		const minutes = d.getMinutes().toString().padStart(2, "0")
		return `${hours}:${minutes}`
	}

	function formatDateForDisplay(date: Date): string {
		return new Date(date).toLocaleString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		})
	}

	// Set default due date to 7 days from now
	const defaultDueDate = new Date()
	defaultDueDate.setDate(defaultDueDate.getDate() + 7)

	let selectedDate = $state(new Date(session.expiresAt ?? defaultDueDate))
	let selectedTime = $state(formatTimeForInput(new Date(session.expiresAt ?? defaultDueDate)))
	let dueDateISOString = $state("")

	let isSubmitting = $state(false)
	let form: HTMLFormElement

	async function handleSubmit() {
		const [hours, minutes] = selectedTime.split(":").map(Number)
		const combined = new Date(selectedDate)
		combined.setHours(hours)
		combined.setMinutes(minutes)
		combined.setSeconds(0)
		combined.setMilliseconds(0)

		dueDateISOString = combined.toISOString()

		// Wait for the reactive binding to update
		await tick()

		if (form) {
			form.requestSubmit()
		}
	}

	async function handleDateChange() {
		await tick()
		handleSubmit()
	}

	// Computed value that combines selectedDate and selectedTime
	let currentDateTime = $derived(() => {
		const [hours, minutes] = selectedTime.split(":").map(Number)
		const combined = new Date(selectedDate)
		combined.setHours(hours)
		combined.setMinutes(minutes)
		combined.setSeconds(0)
		combined.setMilliseconds(0)
		return combined
	})

	let mounted = false
	onMount(() => {
		mounted = true
	})

	// Watch for changes to selectedDate and selectedTime and trigger submission
	$effect(() => {
		// Only trigger on actual user changes, not initial setup
		if (mounted && selectedDate && selectedTime) {
			handleDateChange()
		}
	})
</script>

<!-- Session Expiration with Calendar Icon -->
<div class="rounded-lg bg-gray-700 p-4">
	<h3 class="mb-2 text-sm font-medium text-gray-300">Session Expiration</h3>
	<p class="text-lg font-semibold text-white">{formatDateForDisplay(currentDateTime())}</p>

	<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
		<div>
			<Label for="date-picker" class="mb-2 block text-sm font-medium text-gray-300">Due Date</Label>
			<Datepicker id="date-picker" bind:value={selectedDate} />
		</div>
		<div>
			<Label for="time-picker" class="mb-2 block text-sm font-medium text-gray-300">Due Time</Label>
			<Timepicker id="time-picker" bind:value={selectedTime} />
		</div>
	</div>
</div>

<!-- Hidden form for submission -->
<form
	id="dueDateForm"
	method="POST"
	action="?/updateDueDate"
	class="hidden"
	bind:this={form}
	use:enhance={() => {
		isSubmitting = true
		return async ({ result }) => {
			isSubmitting = false
			if (result.type === "success") {
				await invalidateAll()
			}
		}
	}}
>
	<input type="hidden" name="dueDate" bind:value={dueDateISOString} />
</form>
