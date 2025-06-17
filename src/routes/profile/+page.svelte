<script lang="ts">
	import AppHeader from "$lib/components/AppHeader.svelte"

	let { data } = $props()
</script>

<svelte:head>
	<title>Profile - Quiz Learn</title>
	<meta name="description" content="Your Quiz Learn profile" />
</svelte:head>

<div class=" min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
	<AppHeader title="Profile" />
	<main class="mx-auto max-w-6xl px-6 py-12">
		<div class="rounded-2xl border border-gray-600 bg-gray-800 p-8 shadow-2xl">
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-6">
					<div class="h-28 w-28 flex-shrink-0">
						{#if data.session.user?.image}
							<img src={data.session.user.image} alt="Profile" class="h-28 w-28 rounded-full border-4 border-gray-600 object-cover shadow-lg" />
						{:else}
							<div class="flex h-28 w-28 items-center justify-center rounded-full border-4 border-gray-600 bg-gray-700 shadow-lg">
								<svg class="h-14 w-14 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
									<path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
								</svg>
							</div>
						{/if}
					</div>

					<div class="flex flex-col space-y-2">
						<div class="flex items-center space-x-3">
							<h2 class="text-3xl font-bold text-white">
								{data.session.user?.name || "User"}
							</h2>
						</div>
						<p class="text-sm text-gray-400">
							@{data.session.user?.email || "user@example.com"}
						</p>
					</div>
				</div>

				<div class="flex flex-col items-end space-y-4">
					<div class="flex space-x-3">
						<button class="rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:outline-none"> Share Profile </button>
						<a href="/profile/edit" class="rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:outline-none"> Edit Profile </a>
					</div>

					<div class="flex space-x-8 text-center">
						<div class="flex flex-col">
							<span class="text-2xl font-bold text-white">
								{data.quizCount[0]?.value || 0}
							</span>
							<span class="text-xs tracking-wide text-gray-400 uppercase"> Quizzes </span>
						</div>
						<div class="flex flex-col">
							<span class="text-2xl font-bold text-white">
								{data.collectionsCount}
							</span>
							<span class="text-xs tracking-wide text-gray-400 uppercase"> Collections </span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</main>
</div>
