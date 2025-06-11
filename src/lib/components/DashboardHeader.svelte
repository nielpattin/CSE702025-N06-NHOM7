<script lang="ts">
	import { page } from "$app/state"
	import { signOut } from "@auth/sveltekit/client"
	import { goto } from "$app/navigation"
	import { onMount } from "svelte"

	// Props
	let { showJoinCode = true, title } = $props()

	let data = $derived(page.data)
	let session = $derived(data.session)
	let currentRoute = $derived(page.url.pathname)
	let isDashboardPage = $derived(currentRoute === "/dashboard")

	// State for burger menu
	let showBurgerMenu = $state(false)

	function toggleBurgerMenu() {
		showBurgerMenu = !showBurgerMenu
	}

	function closeBurgerMenu() {
		showBurgerMenu = false
	}

	function handleSignOut() {
		signOut({ callbackUrl: "/" })
		closeBurgerMenu()
	}

	function handleViewProfile() {
		// TODO: Navigate to profile page
		console.log("View Profile clicked")
		closeBurgerMenu()
	}

	function handleSettings() {
		// TODO: Navigate to settings page
		console.log("Settings clicked")
		closeBurgerMenu()
	}

	function goToDashboard() {
		goto("/dashboard")
	}

	// Close menu when clicking outside
	onMount(() => {
		function handleClickOutside(event: MouseEvent) {
			if (showBurgerMenu && !(event.target as Element)?.closest(".burger-menu-container")) {
				closeBurgerMenu()
			}
		}

		document.addEventListener("click", handleClickOutside)
		return () => {
			document.removeEventListener("click", handleClickOutside)
		}
	})
</script>

<!-- Header -->
<header class="border-b border-gray-700 bg-gray-900 shadow-lg">
	<nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<!-- Logo Section -->
			<div class="flex items-center space-x-3">
				<div class="flex h-8 w-8 items-center justify-center rounded-lg">
					<img src="/quiz-learn-logo.png" alt="Quiz Learn Logo" class="h-8 w-8 object-contain" />
				</div>
				<span class="text-xl font-semibold text-white">{title || "Quiz Learn Dashboard"}</span>
			</div>

			<!-- Right Side Actions -->
			<div class="flex items-center space-x-4">
				<!-- Dashboard Button -->
				{#if !isDashboardPage}
					<button onclick={goToDashboard} class="rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"> Dashboard </button>
				{/if}

				<!-- Enter Code to Join Section -->
				{#if showJoinCode}
					<div class="hidden items-center space-x-2 md:flex">
						<input type="text" placeholder="Enter quiz code..." class="w-32 rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none" />
						<button class="rounded-md bg-gradient-to-r from-green-600 to-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-all hover:from-green-700 hover:to-emerald-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"> Join </button>
					</div>
				{/if}

				<!-- User Info -->
				{#if session?.user && !isDashboardPage}
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

				<!-- Burger Menu -->
				<div class="burger-menu-container relative">
					<button onclick={toggleBurgerMenu} class="rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none" aria-label="Open user menu" aria-expanded={showBurgerMenu}>
						<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					</button>

					<!-- Dropdown Menu -->
					{#if showBurgerMenu}
						<div class="ring-opacity-5 absolute top-12 right-0 z-50 w-48 rounded-md border border-gray-600 bg-gray-800 py-1 shadow-lg ring-1 ring-black" role="menu" aria-orientation="vertical">
							<button onclick={handleViewProfile} class="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white" role="menuitem">
								<svg class="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
								</svg>
								View Profile
							</button>

							<button onclick={handleSettings} class="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white" role="menuitem">
								<svg class="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								</svg>
								Settings
							</button>

							<hr class="my-1 border-gray-600" />

							<button onclick={handleSignOut} class="flex w-full items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300" role="menuitem">
								<svg class="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
								</svg>
								Logout
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</nav>
</header>
