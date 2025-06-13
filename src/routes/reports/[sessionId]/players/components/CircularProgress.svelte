<script lang="ts">
	let { percentage, size = 60, strokeWidth = 6, color } = $props()

	const radius = (size - strokeWidth) / 2
	const circumference = 2 * Math.PI * radius
	const strokeDasharray = circumference
	const strokeDashoffset = circumference - (percentage / 100) * circumference
</script>

<div class="relative">
	<svg class="-rotate-90 transform" width={size} height={size}>
		<circle cx={size / 2} cy={size / 2} r={radius} stroke="#374151" stroke-width={strokeWidth} fill="none" />
		<circle cx={size / 2} cy={size / 2} r={radius} stroke={color ?? "#e5e7eb"} stroke-width={strokeWidth} fill="none" stroke-dasharray={strokeDasharray} stroke-dashoffset={strokeDashoffset} stroke-linecap="round" class="transition-all duration-500 ease-in-out" />
	</svg>
	<div class="absolute inset-0 flex items-center justify-center">
		<span class="text-xs font-bold text-white">
			{percentage}%
		</span>
	</div>
</div>
