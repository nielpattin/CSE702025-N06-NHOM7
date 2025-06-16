<script lang="ts">
	import { goto, invalidateAll } from "$app/navigation"
	import { enhance, applyAction } from "$app/forms"
	import { MoreVertical, Edit, Trash2 } from "@lucide/svelte"
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js"
	import { Button } from "$lib/components/ui/button"
	import { toast } from "svelte-sonner"

	interface SessionData {
		id: number
		status: string
		expiresAt: Date | null
		quizName: string | null
		imageUrl: string | null
		participantCount: number
	}

	let { session }: { session: SessionData } = $props()
	let dropdownOpen = $state(false)

	const randomImageId = Math.floor(Math.random() * 1000)
	const imageToDisplay = $derived(session.imageUrl ?? `https://picsum.photos/id/${randomImageId}/200/200`)

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

	// Navigate to session play page
	function navigateToSession() {
		goto(`/play/session/${session.id}`)
	}

	// Handle status toggle
	async function handleStatusToggle(pressed: boolean) {
		dropdownOpen = false
		const formData = new FormData()
		formData.append("id", session.id.toString())
		formData.append("currentStatus", session.status)

		try {
			const response = await fetch("?/toggleStatus", {
				method: "POST",
				body: formData
			})

			const result = await response.json()

			if (result.type === "success" && result.data?.success) {
				toast.success(`Session status updated to ${result.data.newStatus}.`)
			} else if (result.type === "failure") {
				toast.error(String(result.data?.error || "Failed to toggle session status."))
			} else if (result.type === "error") {
				toast.error("A server error occurred while toggling status.")
			}

			await invalidateAll()
		} catch (error) {
			toast.error("Failed to update session status")
			console.error("Status toggle error:", error)
		}
	}

	const statusInfo = $derived(getStatusInfo(session.status, session.expiresAt))
</script>

<div
	class="block cursor-pointer rounded-lg border border-gray-700 bg-gray-900/50 p-6 transition-all duration-200 hover:border-gray-600 hover:bg-gray-900/70 hover:shadow-lg"
	onclick={(e) => {
		// Navigate to session if not clicking on form or dropdown elements
		if (!(e.target as HTMLElement).closest("form") && !(e.target as HTMLElement).closest("[data-dropdown-menu-content]") && !(e.target as HTMLElement).closest('button[aria-haspopup="menu"]')) {
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
	}}
>
	<div class="flex items-start space-x-4">
		<!-- Left Section: Session Image -->
		<div class="flex-shrink-0">
			<img src={imageToDisplay} alt={session.quizName || "Quiz Image"} class="h-16 w-16 rounded-lg object-cover" />
		</div>

		<!-- Right Section: Session Details -->
		<div class="min-w-0 flex-1">
			<!-- Row 1: Quiz Name, Status, and Action Buttons -->
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
					<!-- 3 dot dropdown-menu -->
					<DropdownMenu.Root bind:open={dropdownOpen}>
						<DropdownMenu.Trigger>
							{#snippet child({ props }: { props: Record<string, unknown> })}
								<Button
									{...props}
									size="sm"
									variant="outline"
									class="cursor-pointer"
									aria-label="More options"
									onclick={(e: MouseEvent) => {
										e.preventDefault()
										e.stopPropagation()
									}}
								>
									<MoreVertical class="h-4 w-4" />
								</Button>
							{/snippet}
						</DropdownMenu.Trigger>

						<DropdownMenu.Content class="" align="end">
							<!-- Status Toggle -->
							<DropdownMenu.Item class="cursor-pointer" onclick={() => handleStatusToggle(session.status !== "active")}>
								<span class="mr-2 flex h-4 w-4 items-center justify-center {session.status === 'active' ? 'text-green-400' : 'text-red-400'}">●</span>
								{session.status === "active" ? "Inactive" : "Active"}
							</DropdownMenu.Item>

							<!-- Edit Session -->
							<DropdownMenu.Item class="cursor-pointer" onclick={() => goto(`/sessions/${session.id}`)}>
								<Edit class="mr-2 h-4 w-4" />
								Edit
							</DropdownMenu.Item>

							<DropdownMenu.Separator />

							<!-- Delete Button -->
							<DropdownMenu.Item
								variant="destructive"
								class="cursor-pointer"
								onclick={() => {
									const form = document.getElementById(`delete-form-${session.id}`) as HTMLFormElement
									if (form) {
										form.requestSubmit()
									}
								}}
							>
								<Trash2 class="mr-2 h-4 w-4" />
								Delete
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			</div>
			<form
				method="POST"
				action="?/deleteSession"
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === "success") {
							toast.success("Session deleted successfully")
						} else if (result.type === "error") {
							toast.error(result.error.message)
						}
						await invalidateAll()
					}
				}}
				id="delete-form-{session.id}"
				class="hidden"
			>
				<input type="hidden" name="id" value={session.id} />
			</form>
			<!-- Row 2: Participant Count and Expiry Time -->
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
