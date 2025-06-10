<script lang="ts">
	import { page } from "$app/state"

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
		{ name: "Report", href: "/report", icon: "📊" },
		{ name: "Profile", href: "/profile", icon: "👤" },
		{ name: "Settings", href: "/settings", icon: "⚙️" },
		{ name: "Admin Panel", href: "/admin", icon: "👑", adminOnly: true }
	]

	let filteredNavigation = $derived(navigationItems.filter((item) => !item.adminOnly || userRole === "Admin"))

	let currentPath = $derived(page.url.pathname)
</script>

{#if session?.user}
	<aside class="fixed top-0 left-0 z-40 flex h-screen w-64 flex-col border-r border-gray-700 bg-gray-900 shadow-lg">
		<!-- Sidebar Header -->
		<div class="flex h-16 items-center justify-center border-b border-gray-700 bg-gray-800">
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
				{/each}
			</div>
		</nav>

		<!-- User Info at Bottom -->
		<div class="mt-auto border-t border-gray-700 bg-gray-800 p-4">
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
					<p class="truncate text-xs text-gray-400">
						{session.user.email}
					</p>
				</div>
			</div>

			<!-- Role Badge -->
			<div class="mt-3 flex justify-center">
				<div
					class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium
					{userRole === 'Admin' ? 'bg-red-900 text-red-200' : 'bg-blue-900 text-blue-200'}"
				>
					<span class="mr-1">
						{userRole === "Admin" ? "👑" : "🎓"}
					</span>
					{userRole?.toUpperCase() || "USER"}
				</div>
			</div>
		</div>
	</aside>
{/if}
