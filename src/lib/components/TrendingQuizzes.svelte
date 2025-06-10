<script lang="ts">
	import QuizCard from "./QuizCard.svelte"

	// Mock trending quizzes data
	let trendingQuizzes = $state([
		{
			id: 1,
			title: "JavaScript ES6 Features",
			author: "CodeMaster",
			participants: 1234,
			difficulty: "Intermediate",
			rating: 4.8,
			duration: "15 min"
		},
		{
			id: 2,
			title: "React Hooks Deep Dive",
			author: "ReactPro",
			participants: 892,
			difficulty: "Advanced",
			rating: 4.9,
			duration: "20 min"
		},
		{
			id: 3,
			title: "CSS Grid & Flexbox",
			author: "DesignGuru",
			participants: 756,
			difficulty: "Beginner",
			rating: 4.7,
			duration: "12 min"
		},
		{
			id: 4,
			title: "Node.js Performance",
			author: "BackendExpert",
			participants: 643,
			difficulty: "Advanced",
			rating: 4.6,
			duration: "25 min"
		},
		{
			id: 5,
			title: "TypeScript Fundamentals",
			author: "TypeMaster",
			participants: 1089,
			difficulty: "Intermediate",
			rating: 4.8,
			duration: "18 min"
		}
	])
</script>

<!-- Trending Quizzes Section -->
<div class="rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg">
	<div class="mb-6 flex items-center justify-between">
		<h2 class="text-xl font-semibold text-white">🔥 Trending Quizzes</h2>
		<button class="text-sm font-medium text-blue-400 hover:text-blue-300"> View all → </button>
	</div>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
		{#each trendingQuizzes as quiz (quiz.id)}
			<QuizCard {quiz} />
		{/each}
	</div>
</div>
