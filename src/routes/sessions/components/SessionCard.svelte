<script lang="ts">
	import { goto } from "$app/navigation"

	interface SessionData {
		id: number
		code: string
		status: string
		expiresAt: Date | null
		quizName: string | null
		participantCount: number
	}

	let { session }: { session: SessionData } = $props()

	// State for copy feedback
	let copySuccess = $state(false)

	// State for dropdown menu visibility
	let isDropdownOpen = $state(false)

	// Format date to human-readable format
	function formatDate(date: Date | null): string {
		if (!date) return "Unknown"

		const now = new Date()
		const sessionDate = new Date(date)
		const diffMs = sessionDate.getTime() - now.getTime()
		const diffMinutes = Math.floor(diffMs / (1000 * 60))
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

		// If the date is in the past
		if (diffMs < 0) {
			const pastDiffMs = Math.abs(diffMs)
			const pastDiffMinutes = Math.floor(pastDiffMs / (1000 * 60))
			const pastDiffHours = Math.floor(pastDiffMs / (1000 * 60 * 60))
			const pastDiffDays = Math.floor(pastDiffMs / (1000 * 60 * 60 * 24))

			if (pastDiffDays > 0) {
				return `Expired ${pastDiffDays} day${pastDiffDays === 1 ? "" : "s"} ago`
			} else if (pastDiffHours > 0) {
				return `Expired ${pastDiffHours} hour${pastDiffHours === 1 ? "" : "s"} ago`
			} else if (pastDiffMinutes > 0) {
				return `Expired ${pastDiffMinutes} minute${pastDiffMinutes === 1 ? "" : "s"} ago`
			} else {
				return "Just expired"
			}
		}

		// If the date is in the future
		if (diffDays > 0) {
			return `Expires in ${diffDays} day${diffDays === 1 ? "" : "s"}`
		} else if (diffHours > 0) {
			return `Expires in ${diffHours} hour${diffHours === 1 ? "" : "s"}`
		} else if (diffMinutes > 0) {
			return `Expires in ${diffMinutes} minute${diffMinutes === 1 ? "" : "s"}`
		} else {
			return "Expires soon"
		}
	}

	// Get status display text and styling
	function getStatusInfo(status: string, expiresAt: Date | null) {
		const now = new Date()
		const isExpired = expiresAt && new Date(expiresAt).getTime() < now.getTime()

		if (isExpired || status === "expired") {
			return {
				text: "Expired",
				class: "bg-red-900 text-red-200"
			}
		} else if (status === "active") {
			return {
				text: "Active",
				class: "bg-green-900 text-green-200"
			}
		} else {
			return {
				text: status,
				class: "bg-gray-900 text-gray-200"
			}
		}
	}

	// Copy shareable link to clipboard
	async function copyShareableLink() {
		const shareableLink = `${window.location.origin}/join?code=${session.code}`

		try {
			await navigator.clipboard.writeText(shareableLink)
			copySuccess = true
			setTimeout(() => {
				copySuccess = false
			}, 2000)
		} catch (err) {
			console.error("Failed to copy link:", err)
		}
	}

	// Navigate to session play page
	function navigateToSession() {
		goto(`/play/session/${session.id}`)
	}

	// Toggle dropdown menu
	function toggleDropdown(e: Event) {
		e.preventDefault()
		e.stopPropagation()
		isDropdownOpen = !isDropdownOpen
	}

	// Close dropdown when clicking outside
	function closeDropdown() {
		isDropdownOpen = false
	}

	// Svelte action for handling click outside
	function clickOutside(node: HTMLElement, callback: () => void) {
		const handleClick = (event: MouseEvent) => {
			if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
				callback()
			}
		}

		document.addEventListener("click", handleClick, true)

		return {
			destroy() {
				document.removeEventListener("click", handleClick, true)
			}
		}
	}

	const statusInfo = $derived(getStatusInfo(session.status, session.expiresAt))
	const shareableLink = $derived(`${typeof window !== "undefined" ? window.location.origin : ""}/join?code=${session.code}`)
</script>

<div
	class="block cursor-pointer rounded-lg border border-gray-700 bg-gray-900/50 p-6 transition-all duration-200 hover:border-gray-600 hover:bg-gray-900/70 hover:shadow-lg"
	onclick={(e) => {
		// Navigate to session if not clicking on copy button, status toggle button, or dropdown elements
		if (!(e.target as HTMLElement).closest('button[aria-label="Copy link"]') && !(e.target as HTMLElement).closest('button[aria-label="Toggle session status"]') && !(e.target as HTMLElement).closest('[role="menu"]') && !(e.target as HTMLElement).closest('button[aria-label="More options"]')) {
			navigateToSession()
		}
	}}
	role="button"
	tabindex="0"
	onkeydown={(e) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault()
			navigateToSession()
		}
		if (e.key === "Escape" && isDropdownOpen) {
			closeDropdown()
		}
	}}
>
	<div class="flex items-start space-x-4">
		<!-- Left Section: Session Icon -->
		<div class="flex-shrink-0">
			<div class="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600">
				<span class="text-2xl text-white">🎯</span>
			</div>
		</div>

		<!-- Right Section: Session Details -->
		<div class="min-w-0 flex-1">
			<!-- Row 1: Quiz Name, Status, and Delete Button -->
			<div class="flex items-start justify-between">
				<div class="flex min-w-0 flex-1 items-start space-x-4">
					<h3 class="truncate text-lg font-semibold text-white">
						{session.quizName || "Untitled Quiz"}
					</h3>
					<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusInfo.class}">
						{statusInfo.text}
					</span>
				</div>

				<!-- Action Buttons -->
				<div class="ml-4 flex items-center space-x-2">
					<!-- Status Toggle Button -->
					<form action="?/toggleStatus" method="POST">
						<input type="hidden" name="id" value={session.id} />
						<input type="hidden" name="currentStatus" value={session.status} />
						<button
							type="submit"
							class="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"
							onclick={(e) => {
								e.stopPropagation()
							}}
							aria-label="Toggle session status"
						>
							{session.status === "active" ? "Inactive" : "Active"}
						</button>
					</form>

					<!-- Three-dots Options Button and Dropdown Container -->
					<div class="relative">
						<button class="cursor-pointer rounded-md bg-gray-700 p-2 text-gray-300 transition-colors hover:bg-gray-600 hover:text-white focus:outline-none" onclick={toggleDropdown} aria-label="More options">
							<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
								<circle cx="8" cy="3" r="1.5"></circle>
								<circle cx="8" cy="8" r="1.5"></circle>
								<circle cx="8" cy="13" r="1.5"></circle>
							</svg>
						</button>

						<!-- Dropdown Menu -->
						{#if isDropdownOpen}
							<div class="ring-opacity-5 absolute top-full right-0 z-10 mt-2 w-40 rounded-md bg-gray-800 shadow-lg ring-1 ring-black" role="menu" use:clickOutside={closeDropdown}>
								<div class="py-1">
									<!-- Edit Option -->
									<a href="/sessions/{session.id}" class="block w-full cursor-pointer px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white" role="menuitem" onclick={() => closeDropdown()}> ✏️ Edit </a>

									<!-- Delete Form -->
									<form action="?/deleteSession" method="POST">
										<input type="hidden" name="id" value={session.id} />
										<button type="submit" class="block w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700" role="menuitem"> 🗑️ Delete </button>
									</form>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Row 2: Session Code and Copy Button -->
			<div class="mt-2 flex items-center space-x-3">
				<span class="text-sm text-gray-400">Session Code:</span>
				<span class="font-mono text-sm font-medium text-white">{session.code}</span>
				<button
					type="button"
					class="inline-flex items-center rounded-md bg-gray-700 px-2 py-1 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-600 hover:text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"
					onclick={(e) => {
						e.stopPropagation()
						copyShareableLink()
					}}
					aria-label="Copy link"
				>
					{#if copySuccess}
						<svg class="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
						</svg>
						Copied!
					{:else}
						<svg class="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
							<path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
							<path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
						</svg>
						Copy
					{/if}
				</button>
			</div>

			<!-- Row 3: Shareable Link -->
			<div class="mt-2">
				<span class="text-xs text-gray-500">Share: </span>
				<span class="font-mono text-xs break-all text-gray-400">{shareableLink}</span>
			</div>

			<!-- Row 4: Participant Count and Expiry Time -->
			<div class="mt-3 flex items-center justify-between">
				<div class="flex items-center space-x-4 text-sm text-gray-400">
					<span class="flex items-center">
						<svg class="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
							<path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
						</svg>
						{session.participantCount} participant{session.participantCount === 1 ? "" : "s"}
					</span>
				</div>
				<span class="text-sm text-gray-500">
					{formatDate(session.expiresAt)}
				</span>
			</div>
		</div>
	</div>
</div>
