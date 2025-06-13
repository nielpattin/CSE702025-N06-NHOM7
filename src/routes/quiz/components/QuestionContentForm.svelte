<script lang="ts">
	let { content, onContentChange } = $props<{
		content: string
		onContentChange: (content: string) => void
	}>()
</script>

<div>
	<label for="question-content" class="mb-3 block text-lg font-medium text-white">Question Content</label>
	<textarea id="question-content" value={content} oninput={(e) => onContentChange(e.currentTarget.value)} class="h-32 w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Enter your question here..."></textarea>
</div>
