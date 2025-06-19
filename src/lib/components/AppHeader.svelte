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
<header class="dark:bg-background border-border sticky top-0 z-50 border-b shadow-lg select-none" style="background-color: var(--background) !important;">
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
				<Button href="/join" variant="outline">Join</Button>
				{#if session?.user}
					<Button href="/dashboard" variant="default">Dashboard</Button>
				{/if}

				<!-- User Info -->
				{#if session?.user}
					<div class="hidden items-center space-x-3 md:flex">
						{#if session.user.image}
							<img src={session.user.image} alt={session.user.name || "User"} class="h-8 w-8 rounded-full" />
						{:else}
							<div class="bg-muted text-muted-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
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
