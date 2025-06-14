<script lang="ts">
	import Sidebar from "$lib/components/Sidebar.svelte"
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

<Sidebar />

<div class="ml-64 min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
	<AppHeader title="Edit Profile" />
	<main class="mx-auto max-w-3xl px-6 py-12">
		<div class="rounded-2xl border border-gray-600 bg-gray-800 p-8 shadow-2xl">
			<div class="mb-8">
				<h1 class="mb-2 text-3xl font-bold text-white">Edit Profile</h1>
				<p class="text-gray-400">Update your profile information</p>
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
					<label for="name" class="mb-2 block text-sm font-medium text-gray-300"> Display Name </label>
					<input type="text" id="name" name="name" value={data.session.user?.name || ""} required disabled={isSubmitting} class="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50" placeholder="Enter your display name" />
				</div>

				<div class="flex items-center justify-between pt-6">
					<a href="/profile" class="rounded-lg border border-gray-600 px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:outline-none"> Cancel </a>
					<button type="submit" disabled={isSubmitting} class="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50">
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
