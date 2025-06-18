<script lang="ts">
	import { page } from "$app/state"
	import SunIcon from "@lucide/svelte/icons/sun"
	import MoonIcon from "@lucide/svelte/icons/moon"
	import { toggleMode } from "mode-watcher"
	import { Button } from "$lib/components/ui/button/index.js"
	import * as Sidebar from "$lib/components/ui/sidebar"

	// Props
	let { title } = $props()

	let data = $derived(page.data)
	let session = $derived(data.userSession ?? data.session)
	let pathname = $derived(page.url.pathname)
</script>

<!-- Header -->
<header class="bg-background dark:bg-background sticky top-0 z-50 border-b border-gray-700 shadow-lg select-none">
	<nav class="mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<!-- Logo Section -->
			<div class="flex items-center space-x-3">
				{#if pathname !== "/join" && !pathname.startsWith("/play/session/")}
					<Sidebar.Trigger />
				{/if}
				<div class="flex h-8 w-8 items-center justify-center rounded-lg">
					<img src="/quiz-learn-logo.png" alt="Quiz Learn Logo" class="h-8 w-8 object-contain" />
				</div>
				<span class="text-card-foreground text-xl font-semibold transition-colors">{title || "Join Quiz"}</span>
			</div>

			<!-- Right Side Actions -->
			<div class="flex items-center space-x-4">
				<Button href="/join">Join</Button>
				{#if session?.user}
					<Button href="/dashboard" class="bg-gradient-to-r from-blue-600 to-cyan-500 text-white transition-colors hover:from-blue-700 hover:to-cyan-600">Dashboard</Button>
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
						<span class="text-card-foreground text-sm font-medium transition-colors">{session.user.name || session.user.email}</span>
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
