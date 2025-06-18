<script lang="ts">
	import { page } from "$app/state"
	import { signOut } from "@auth/sveltekit/client"
	import { goto } from "$app/navigation"
	import { enhance } from "$app/forms"
	import * as Sidebar from "$lib/components/ui/sidebar"
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu"
	import { Home, Plus, BookOpen, Target, BarChart3, Crown, User, Settings, LogOut, ChevronUp, Search } from "@lucide/svelte"

	let data = $derived(page.data)
	let session = $derived(data.session)
	let { userRole } = $derived(data)

	interface NavigationItem {
		name: string
		href: string
		icon: typeof Home
		adminOnly?: boolean
	}

	const navigationItems: NavigationItem[] = [
		{ name: "Dashboard", href: "/dashboard", icon: Home },
		{ name: "Browse", href: "/browse", icon: Search },
		{ name: "Create Quiz", href: "/quiz/create", icon: Plus },
		{ name: "Library", href: "/library", icon: BookOpen },
		{ name: "My Sessions", href: "/sessions", icon: Target },
		{ name: "Reports", href: "/reports", icon: BarChart3 },
		{ name: "Admin Panel", href: "/admin", icon: Crown, adminOnly: true }
	]

	let filteredNavigation = $derived(navigationItems.filter((item) => !item.adminOnly || userRole === "Admin"))
	let currentPath = $derived(page.url.pathname)

	// Helper function to check if a navigation item should be active
	function isItemActive(itemHref: string): boolean {
		if (itemHref === "/browse") {
			return currentPath === "/browse" || currentPath.startsWith("/browse/")
		}
		return currentPath === itemHref
	}

	function handleProfile() {
		goto("/profile")
	}

	function handleSettings() {}

	function handleSignOut() {
		signOut({ callbackUrl: "/" })
	}
</script>

{#if session?.user}
	<Sidebar.Root>
		<Sidebar.Header>
			<div class="flex items-center space-x-3 px-2 py-2">
				<div class="flex h-8 w-8 items-center justify-center rounded-lg">
					<img src="/quiz-learn-logo.png" alt="Quiz Learn Logo" class="h-8 w-8 object-contain" />
				</div>
				<span class="text-lg font-semibold">Quiz Learn</span>
			</div>
		</Sidebar.Header>

		<Sidebar.Content>
			<Sidebar.Group>
				<Sidebar.GroupLabel>Navigation</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each filteredNavigation as item (item.href)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton isActive={isItemActive(item.href)}>
									{#snippet child({ props })}
										<a href={item.href} {...props} class="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center rounded-md border border-gray-200 px-2 py-2 text-base dark:border-gray-700 {isItemActive(item.href) ? 'bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-accent' : ''}">
											<item.icon class="mr-2 h-4 w-4" />
											<span>{item.name}</span>
											{#if item.adminOnly}
												<span class="ml-auto text-base text-red-400">ADMIN</span>
											{/if}
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		</Sidebar.Content>

		<Sidebar.Footer>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<Sidebar.MenuButton {...props} size="lg" class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer">
									<div class="flex items-center space-x-3">
										{#if session.user.image}
											<img src={session.user.image} alt="Profile" class="h-8 w-8 rounded-full" />
										{:else}
											<div class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600">
												<span class="text-sm font-bold text-white">
													{session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
												</span>
											</div>
										{/if}
										<span class="truncate text-base font-medium">
											{session.user.name || "User"}
										</span>
									</div>
									<ChevronUp class="ml-auto h-5 w-5" />
								</Sidebar.MenuButton>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content side="top" align="end" class="w-[--bits-dropdown-menu-anchor-width]">
							<DropdownMenu.Item onclick={handleProfile} class="cursor-pointer">
								<User class="mr-2 h-4 w-4" />
								<span>Profile</span>
							</DropdownMenu.Item>
							<DropdownMenu.Item onclick={handleSettings} class="cursor-pointer">
								<Settings class="mr-2 h-4 w-4" />
								<span>Settings</span>
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item onclick={handleSignOut} class="cursor-pointer text-red-400">
								<LogOut class="mr-2 h-4 w-4 text-red-400" />
								<span>Sign out</span>
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Footer>
	</Sidebar.Root>
{/if}
