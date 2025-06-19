<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card"
	import { Textarea } from "$lib/components/ui/textarea"
	import { MessageSquare } from "@lucide/svelte"

	interface CustomWindow extends Window {
		clipboardData?: DataTransfer
	}

	let { content, onContentChange } = $props<{
		content: string
		onContentChange: (content: string) => void
	}>()

	const MAX_CONTENT_LENGTH = 2000

	function handleContentChange(value: string) {
		// Limit to 2000 characters
		if (value.length <= MAX_CONTENT_LENGTH) {
			onContentChange(value)
		}
	}

	let remainingChars = $derived(MAX_CONTENT_LENGTH - content.length)
	let isNearLimit = $derived(remainingChars <= 100)
</script>

<Card>
	<CardHeader>
		<CardTitle class="flex items-center gap-2">
			<MessageSquare class="h-5 w-5" />
			Question Content
		</CardTitle>
		<CardDescription>Write your question clearly and concisely. Students will see this text during the quiz.</CardDescription>
	</CardHeader>
	<CardContent class="space-y-2">
		<Textarea
			id="question-content"
			value={content}
			oninput={(e: Event) => handleContentChange((e.currentTarget as HTMLTextAreaElement).value)}
			onpaste={(e) => {
				const clipboardData = e.clipboardData || (window as CustomWindow).clipboardData
				if (clipboardData && clipboardData.files.length > 0) {
					e.preventDefault()
				} else {
					// Allow text paste and then update content
					setTimeout(() => handleContentChange((e.currentTarget as HTMLTextAreaElement).value), 0)
				}
			}}
			placeholder="Enter your question here..."
			class="min-h-32 resize-none"
			rows={4}
			maxlength={MAX_CONTENT_LENGTH}
		/>
		<div class="flex items-center justify-between text-sm">
			<div class="text-muted-foreground">
				Maximum {MAX_CONTENT_LENGTH} characters
			</div>
			<div class={isNearLimit ? "text-destructive" : "text-muted-foreground"}>
				{content.length}/{MAX_CONTENT_LENGTH}
			</div>
		</div>
	</CardContent>
</Card>
