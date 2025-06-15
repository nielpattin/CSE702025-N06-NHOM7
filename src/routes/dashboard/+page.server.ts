import { db } from "$lib/server/db"

export async function load({ locals }) {
	const session = await locals.auth()

	if (!session?.user) {
		return {
			trendingQuizzes: []
		}
	}

	try {
		const trendingQuizzes = await db.query.quizzes.findMany({
			where: (quizzes, { eq, and }) => and(eq(quizzes.status, "published"), eq(quizzes.visibility, "public")),
			with: {
				creator: {
					columns: {
						id: true,
						name: true,
						image: true
					}
				}
			},
			orderBy: (quizzes, { desc }) => [desc(quizzes.participants), desc(quizzes.rating)],
			limit: 6
		})

		const formattedQuizzes = trendingQuizzes.map((quiz) => ({
			id: quiz.id,
			title: quiz.title || "Untitled Quiz",
			author: quiz.creator?.name || "Unknown Author",
			participants: quiz.participants || 0,
			difficulty: quiz.difficulty === "easy" ? "Beginner" : quiz.difficulty === "medium" ? "Intermediate" : "Advanced",
			rating: Number(quiz.rating?.toFixed(1)) || 0.0,
			duration: quiz.duration ? `${quiz.duration} min` : "N/A",
			imageUrl: quiz.imageUrl
		}))

		return {
			trendingQuizzes: formattedQuizzes
		}
	} catch (error) {
		console.error("Error fetching trending quizzes:", error)
		return {
			trendingQuizzes: []
		}
	}
}
