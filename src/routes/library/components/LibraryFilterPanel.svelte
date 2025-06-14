<script lang="ts">
	let { userQuizzesCount, activeFilter, onFilterChange } = $props<{
		userQuizzesCount: number
		activeFilter: "createdByMe" | "likedByMe" | "sharedWithMe"
		onFilterChange: (filterId: "createdByMe" | "likedByMe" | "sharedWithMe") => void
	}>()
</script>

<!-- Left Section: User Statistics (40% width) -->
<div class="min-w-1/4">
	<div class="rounded-lg bg-gray-800/50 p-6 shadow-lg backdrop-blur">
		<h2 class="mb-6 text-xl font-semibold text-white">My Quiz Statistics</h2>
		<div class="space-y-4">
			<button
				onclick={() => onFilterChange("createdByMe")}
				class="flex w-full cursor-pointer items-center justify-between rounded-lg p-4 transition-colors
					{activeFilter === 'createdByMe' ? 'border-2 border-blue-500 bg-blue-600/20' : 'bg-gray-700/50 hover:bg-gray-700/70'}"
			>
				<div class="flex items-center space-x-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/20">
						<span class="text-lg text-blue-400">📝</span>
					</div>
					<div>
						<p class="font-medium text-white">Created by me</p>
					</div>
				</div>
				<span class="text-2xl font-bold text-blue-400">{userQuizzesCount}</span>
			</button>

			<button
				onclick={() => onFilterChange("likedByMe")}
				class="flex w-full cursor-pointer items-center justify-between rounded-lg p-4 transition-colors
					{activeFilter === 'likedByMe' ? 'border-2 border-red-500 bg-red-600/20' : 'bg-gray-700/50 hover:bg-gray-700/70'}"
			>
				<div class="flex items-center space-x-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-600/20">
						<span class="text-lg text-red-400">❤️</span>
					</div>
					<div>
						<p class="font-medium text-white">Liked by me</p>
					</div>
				</div>
				<span class="text-2xl font-bold text-red-400">15</span>
			</button>

			<button
				onclick={() => onFilterChange("sharedWithMe")}
				class="flex w-full cursor-pointer items-center justify-between rounded-lg p-4 transition-colors
					{activeFilter === 'sharedWithMe' ? 'border-2 border-green-500 bg-green-600/20' : 'bg-gray-700/50 hover:bg-gray-700/70'}"
			>
				<div class="flex items-center space-x-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-600/20">
						<span class="text-lg text-green-400">📤</span>
					</div>
					<div>
						<p class="font-medium text-white">Shared with me</p>
					</div>
				</div>
				<span class="text-2xl font-bold text-green-400">5</span>
			</button>
		</div>
	</div>
</div>
