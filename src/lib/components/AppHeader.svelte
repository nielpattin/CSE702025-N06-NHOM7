<script lang="ts">
	import { page } from "$app/state"
	import SunIcon from "@lucide/svelte/icons/sun"
	import MoonIcon from "@lucide/svelte/icons/moon"
	import { toggleMode } from "mode-watcher"
	import { Button } from "$lib/components/ui/button/index.js"
	import * as Sidebar from "$lib/components/ui/sidebar"

	// Props
	let { showJoinCode = true, title } = $props()

	let data = $derived(page.data)
	let session = $derived(data.session)
</script>

<!-- Header -->
<header class="sticky top-0 z-50 border-b border-gray-700 bg-gray-900 shadow-lg select-none">
	<nav class="mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<!-- Logo Section -->
			<div class="flex items-center space-x-3">
				<Sidebar.Trigger />
				<div class="flex h-8 w-8 items-center justify-center rounded-lg">
					<img src="/quiz-learn-logo.png" alt="Quiz Learn Logo" class="h-8 w-8 object-contain" />
				</div>
				<span class="text-xl font-semibold text-white">{title || "Quiz Learn Dashboard"}</span>
			</div>

			<!-- Right Side Actions -->
			<div class="flex items-center space-x-4">
				<!-- Enter Code to Join Section -->
				{#if showJoinCode}
					<div class="hidden items-center space-x-2 md:flex">
						<input type="text" placeholder="Enter quiz code..." class="w-32 rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none" />
						<button class="rounded-md bg-gradient-to-r from-green-600 to-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-all hover:from-green-700 hover:to-emerald-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"> Join </button>
					</div>
				{/if}

				<!-- Dashboard Button -->
				{#if session?.user}
					<a href="/dashboard" class="rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"> Dashboard </a>
				{/if}

				<!-- User Info -->
				{#if session?.user}
					<div class="hidden items-center space-x-3 md:flex">
						{#if session.user.image}
							<img src={session.user.image} alt={session.user.name || "User"} class="h-8 w-8 rounded-full" />
						{:else}
							<div class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 text-sm font-medium text-white">
								{(session.user.name || session.user.email || "U").charAt(0).toUpperCase()}
							</div>
						{/if}
						<span class="text-sm font-medium text-white">{session.user.name || session.user.email}</span>
					</div>
				{/if}

				<!-- Theme Toggle -->
				<Button onclick={toggleMode} variant="outline" size="icon">
					<SunIcon class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
					<MoonIcon class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
					<span class="sr-only">Toggle theme</span>
				</Button>
			</div>
		</div>
	</nav>
</header>
