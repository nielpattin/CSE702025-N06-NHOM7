<script lang="ts">
	import AppHeader from "$lib/components/AppHeader.svelte"
	import { enhance, applyAction } from "$app/forms"
	import { invalidateAll } from "$app/navigation"
	import { Toast, Spinner } from "flowbite-svelte"
	import { slide } from "svelte/transition"

	let { data, form } = $props()
	let isSubmitting = $state(false)
	let toastStatus = $state(false)
	let toastMessage = $state("")
</script>

<svelte:head>
	<title>Edit Profile - Quiz Learn</title>
	<meta name="description" content="Edit your Quiz Learn profile" />
</svelte:head>

<div class="bg-background min-h-screen">
	<AppHeader title="Edit Profile" />
	<main class="mx-auto max-w-3xl px-6 py-12">
		<div class="border-border bg-card rounded-2xl border p-8 shadow-2xl">
			<div class="mb-8">
				<h1 class="text-card-foreground mb-2 text-3xl font-bold">Edit Profile</h1>
				<p class="text-muted-foreground">Update your profile information</p>
			</div>

			{#if form?.error}
				<div class="mb-6 rounded-lg border border-red-500 bg-red-500/10 p-4">
					<p class="text-sm text-red-400">{form.error}</p>
				</div>
			{/if}

			<Toast color="green" class="!border !border-emerald-500 !bg-emerald-600 !text-emerald-50 !shadow-lg !shadow-emerald-500/20" transition={slide} position="bottom-right" bind:toastStatus>
				{toastMessage}
			</Toast>

			<form
				method="POST"
				use:enhance={() => {
					isSubmitting = true
					let submissionPromise: Promise<void>
					const minLoadingTime = new Promise<void>((resolve) => {
						setTimeout(resolve, 1000)
					})

					return async ({ result }) => {
						submissionPromise = new Promise<void>((resolve) => {
							const handleResult = async () => {
								if (result.type === "success" && result.data?.success) {
									toastMessage = result.data.message as string
									toastStatus = true
									setTimeout(() => {
										toastStatus = false
									}, 3000)
									await invalidateAll()
								}
								await applyAction(result)
								resolve()
							}
							handleResult()
						})

						await Promise.all([submissionPromise, minLoadingTime])
						isSubmitting = false
					}
				}}
				class="space-y-6"
			>
				<div>
					<label for="name" class="text-card-foreground mb-2 block text-sm font-medium"> Display Name </label>
					<input type="text" id="name" name="name" value={data.session.user?.name || ""} required disabled={isSubmitting} class="border-input bg-background text-foreground placeholder-muted-foreground focus:border-ring focus:ring-ring/20 w-full rounded-lg border px-4 py-3 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50" placeholder="Enter your display name" />
				</div>

				<div class="flex items-center justify-between pt-6">
					<a href="/profile" class="border-border text-card-foreground hover:bg-muted focus:ring-ring rounded-lg border px-6 py-3 text-sm font-medium transition-colors duration-200 focus:ring-2 focus:outline-none"> Cancel </a>
					<button type="submit" disabled={isSubmitting} class="bg-primary text-primary-foreground hover:bg-primary-hover focus:ring-ring rounded-lg px-6 py-3 text-sm font-medium transition-colors duration-200 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50">
						{#if isSubmitting}
							<Spinner class="mr-2" size="4" />
							Saving...
						{:else}
							Save
						{/if}
					</button>
				</div>
			</form>
		</div>
	</main>
</div>
