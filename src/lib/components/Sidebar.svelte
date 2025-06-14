<script lang="ts">
	import { page } from "$app/state"
	import { signOut } from "@auth/sveltekit/client"
	import { goto } from "$app/navigation"
	import { enhance } from "$app/forms"

	let data = $derived(page.data)
	let session = $derived(data.session)
	let { userRole } = $derived(data)

	interface NavigationItem {
		name: string
		href: string
		icon: string
		adminOnly?: boolean
	}

	const navigationItems: NavigationItem[] = [
		{ name: "Dashboard", href: "/dashboard", icon: "🏠" },
		{ name: "Create Quiz", href: "/quiz/create", icon: "➕" },
		{ name: "Library", href: "/library", icon: "📚" },
		{ name: "Active Sessions", href: "/sessions", icon: "🎯" },
		{ name: "Reports", href: "/reports", icon: "📊" },
		{ name: "Admin Panel", href: "/admin", icon: "👑", adminOnly: true }
	]

	let filteredNavigation = $derived(navigationItems.filter((item) => !item.adminOnly || userRole === "Admin"))

	let currentPath = $derived(page.url.pathname)
	let showUserMenu = $state(false)
	let userMenuRef = $state<HTMLDivElement | undefined>(undefined)

	function toggleUserMenu() {
		showUserMenu = !showUserMenu
	}

	function closeUserMenu() {
		showUserMenu = false
	}

	function handleProfile() {
		goto("/profile")
		closeUserMenu()
	}

	function handleSettings() {}

	function handleSignOut() {
		signOut({ callbackUrl: "/" })
		closeUserMenu()
	}

	function handleClickOutside(event: MouseEvent) {
		if (userMenuRef && !userMenuRef.contains(event.target as Node)) {
			closeUserMenu()
		}
	}

	$effect(() => {
		if (showUserMenu) {
			document.addEventListener("click", handleClickOutside)
			return () => {
				document.removeEventListener("click", handleClickOutside)
			}
		}
	})
</script>

{#if session?.user}
	<aside class="fixed top-0 left-0 z-40 flex h-screen w-64 flex-col border-r border-gray-700 bg-gray-900 shadow-lg">
		<!-- Sidebar Header -->
		<div class="flex h-16 items-center border-b border-gray-700 bg-gray-800 px-4">
			<div class="flex items-center space-x-3">
				<div class="flex h-8 w-8 items-center justify-center rounded-lg">
					<img src="/quiz-learn-logo.png" alt="Quiz Learn Logo" class="h-8 w-8 object-contain" />
				</div>
				<span class="text-lg font-semibold text-white">Quiz Learn</span>
			</div>
		</div>

		<!-- Navigation Menu -->
		<nav class="flex-1 px-4 py-6">
			<div class="space-y-2">
				{#each filteredNavigation as item (item.href)}
					{#if item.name === "Create Quiz"}
						<form method="POST" action={item.href} use:enhance>
							<button
								type="submit"
								class="group flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200
									{currentPath === item.href ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}"
							>
								<span class="mr-3 text-lg">{item.icon}</span>
								{item.name}
							</button>
						</form>
					{:else}
						<a
							href={item.href}
							class="group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200
								{currentPath === item.href ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
								{item.adminOnly ? 'ring-1 ring-red-500/20' : ''}"
						>
							<span class="mr-3 text-lg">{item.icon}</span>
							{item.name}
							{#if item.adminOnly}
								<span class="ml-auto text-xs text-red-400">ADMIN</span>
							{/if}
						</a>
					{/if}
				{/each}
			</div>
		</nav>

		<!-- User Info at Bottom -->
		<div class="relative mt-auto border-t border-gray-700 bg-gray-800 p-4">
			<div class="flex items-center space-x-3">
				{#if session.user.image}
					<img src={session.user.image} alt="Profile" class="h-10 w-10 rounded-full ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-800" />
				{:else}
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-800">
						<span class="text-sm font-bold text-white">
							{session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
						</span>
					</div>
				{/if}
				<div class="min-w-0 flex-1">
					<p class="truncate text-sm font-medium text-white">
						{session.user.name || "User"}
					</p>
				</div>

				<!-- Burger Menu Button -->
				<div class="relative" bind:this={userMenuRef}>
					<button onclick={toggleUserMenu} class="flex cursor-pointer items-center justify-center rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white focus:outline-none" aria-label="User menu">
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z" />
						</svg>
					</button>

					<!-- Popup Menu -->
					{#if showUserMenu}
						<div class="ring-opacity-5 absolute right-0 bottom-full mb-2 w-48 rounded-md border border-gray-600 bg-gray-800 py-1 shadow-lg ring-1 ring-black">
							<button onclick={handleProfile} class="flex w-full cursor-pointer items-center px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-gray-700 hover:text-white">
								<svg class="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
								</svg>
								Profile
							</button>
							<button onclick={handleSettings} class="flex w-full cursor-pointer items-center px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-gray-700 hover:text-white">
								<svg class="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								</svg>
								Settings
							</button>
							<hr class="my-1 border-gray-600" />
							<button onclick={handleSignOut} class="flex w-full cursor-pointer items-center px-4 py-2 text-left text-sm text-red-400 transition-colors hover:bg-gray-700 hover:text-red-300">
								<svg class="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
								</svg>
								Sign out
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</aside>
{/if}
