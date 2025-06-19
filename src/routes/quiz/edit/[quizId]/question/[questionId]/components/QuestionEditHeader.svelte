<script lang="ts">
	import { Button } from "$lib/components/ui/button"
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card"
	import { Input } from "$lib/components/ui/input"
	import * as Select from "$lib/components/ui/select"
	import { ArrowLeft, Save, Clock, Trophy } from "@lucide/svelte"

	let { quizId, questionType, points, timeLimit, isSubmitting, onTypeChange, onPointsChange, onTimeLimitChange } = $props<{
		quizId: string | number
		questionType: "multiple_choice" | "true_false"
		points: number
		timeLimit: number
		isSubmitting: boolean
		onTypeChange: (type: "multiple_choice" | "true_false") => void
		onPointsChange: (points: number) => void
		onTimeLimitChange: (timeLimit: number) => void
	}>()
</script>

<div class="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
	<div class="container mx-auto max-w-4xl p-4">
		<div class="flex items-center justify-between">
			<Button href="/quiz/edit/{quizId}" variant="ghost" size="sm" class="gap-2">
				<ArrowLeft class="h-4 w-4" />
				Back to Quiz Editor
			</Button>

			<div class="flex items-center gap-4">
				<div class="text-muted-foreground hidden items-center gap-4 text-sm sm:flex">
					<span class="flex items-center gap-1">
						<Trophy class="h-3 w-3" />
						{points} pts
					</span>
					<span class="flex items-center gap-1">
						<Clock class="h-3 w-3" />
						{timeLimit}s
					</span>
				</div>
			</div>
		</div>
	</div>
</div>

<Card class="border-border/50">
	<CardHeader>
		<CardTitle>Question Settings</CardTitle>
		<CardDescription>Configure the basic settings for your question</CardDescription>
	</CardHeader>
	<CardContent>
		<div class="grid gap-4 sm:grid-cols-3">
			<div class="space-y-2">
				<label for="question-type" class="text-muted-foreground text-sm font-medium">Question Type</label>
				<Select.Root type="single" value={questionType} onValueChange={(value: string | undefined) => value && onTypeChange(value as "multiple_choice" | "true_false")}>
					<Select.Trigger id="question-type">
						{questionType === "multiple_choice" ? "Multiple Choice" : "True/False"}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="multiple_choice">Multiple Choice</Select.Item>
						<Select.Item value="true_false">True/False</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<div class="space-y-2">
				<label for="question-points" class="text-muted-foreground flex items-center gap-1 text-sm font-medium">
					<Trophy class="h-3 w-3" />
					Points
				</label>
				<Input id="question-points" type="number" value={points} oninput={(e: Event) => onPointsChange(Number((e.currentTarget as HTMLInputElement).value))} min="1" class="w-full" />
			</div>
			<div class="space-y-2">
				<label for="time-limit" class="text-muted-foreground flex items-center gap-1 text-sm font-medium">
					<Clock class="h-3 w-3" />
					Time Limit (seconds)
				</label>
				<Input id="time-limit" type="number" value={timeLimit} oninput={(e: Event) => onTimeLimitChange(Number((e.currentTarget as HTMLInputElement).value))} min="5" class="w-full" />
			</div>
		</div>
	</CardContent>
</Card>
