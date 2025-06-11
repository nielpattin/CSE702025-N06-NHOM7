<script lang="ts">
	interface Props {
		isOpen: boolean
		title: string
		message: string
		confirmText?: string
		cancelText?: string
		confirmVariant?: "danger" | "primary"
		onConfirm: () => void
		onCancel: () => void
	}

	let { isOpen = $bindable(), title, message, confirmText = "Confirm", cancelText = "Cancel", confirmVariant = "primary", onConfirm, onCancel }: Props = $props()

	// Handle ESC key press
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Escape" && isOpen) {
			onCancel()
		}
	}

	// Handle backdrop click
	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onCancel()
		}
	}

	// Get button styles based on variant
	const confirmButtonClass = $derived(confirmVariant === "danger" ? "bg-red-600 hover:bg-red-700 focus:ring-red-500" : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500")
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<!-- Modal backdrop -->
	<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4" onclick={handleBackdropClick} onkeydown={handleKeydown} role="button" aria-labelledby="modal-title" aria-describedby="modal-description" tabindex="0">
		<!-- Modal content -->
		<div class="w-full max-w-md transform rounded-lg bg-gray-800 p-6 shadow-xl transition-all" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
			<!-- Modal header -->
			<div class="mb-4">
				<h3 id="modal-title" class="text-lg font-semibold text-white">
					{title}
				</h3>
			</div>

			<!-- Modal body -->
			<div class="mb-6">
				<p id="modal-description" class="text-sm text-gray-300">
					{message}
				</p>
			</div>

			<!-- Modal footer -->
			<div class="flex justify-end space-x-3">
				<button type="button" class="rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-600 hover:text-white focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none" onclick={onCancel}>
					{cancelText}
				</button>
				<button type="button" class="rounded-md px-4 py-2 text-sm font-medium text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none {confirmButtonClass}" onclick={onConfirm}>
					{confirmText}
				</button>
			</div>
		</div>
	</div>
{/if}
