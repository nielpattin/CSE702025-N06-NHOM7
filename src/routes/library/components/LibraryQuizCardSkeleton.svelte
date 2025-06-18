<script lang="ts">
	import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte"
</script>

<div class="border-border bg-muted block rounded-lg border p-3 px-4 transition-all duration-200 select-none">
	<div class="flex items-center space-x-4">
		<!-- Left Section: Cover Image Skeleton -->
		<div class="flex-shrink-0">
			<Skeleton class="h-16 w-16 rounded-lg" />
		</div>

		<!-- Right Section: Quiz Details Skeleton -->
		<div class="relative min-w-0 flex-1">
			<!-- Row 1: Quiz Title and Badge -->
			<div class="flex items-start justify-between">
				<div class="flex items-center space-x-2">
					<Skeleton class="h-6 w-48 rounded" />
					<Skeleton class="h-5 w-16 rounded-full" />
				</div>
			</div>

			<!-- Action Buttons Container - Positioned absolutely to center-right -->
			<div class="absolute top-1/2 right-0 flex flex-shrink-0 -translate-y-1/2 items-center space-x-2">
				<Skeleton class="h-9 w-20 rounded-md" />
				<Skeleton class="h-9 w-16 rounded-md" />
				<Skeleton class="h-9 w-9 rounded-md" />
			</div>

			<!-- Row 2: Creator and Time -->
			<div class="mt-1 flex items-center space-x-3">
				<Skeleton class="h-4 w-24 rounded" />
				<Skeleton class="h-4 w-1 rounded-full" />
				<Skeleton class="h-4 w-16 rounded" />
			</div>

			<!-- Row 3: Question Count and Description -->
			<div class="mt-2">
				<div class="flex items-center space-x-4">
					<Skeleton class="h-4 w-16 rounded" />
					<Skeleton class="h-4 w-1 rounded-full" />
					<Skeleton class="h-4 w-24 rounded" />
				</div>
			</div>
		</div>
	</div>
</div>
