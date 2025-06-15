import { db } from "$lib/server/db"

export async function load({ locals }) {
	const session = await locals.auth()

	if (!session?.user) {
		return {
			trendingQuizzes: []
		}
	}

	try {
		const quizzesWithSessions = await db.query.quizzes.findMany({
			where: (quizzes, { eq, and }) => and(eq(quizzes.status, "published"), eq(quizzes.visibility, "public")),
			with: {
				creator: {
					columns: {
						id: true,
						name: true,
						image: true
					}
				},
				quizSessions: {
					with: {
						participants: true
					}
				}
			}
		})

		const quizzesWithParticipantCounts = quizzesWithSessions.map((quiz) => {
			const allParticipants = new Set()
			quiz.quizSessions.forEach((session) => {
				session.participants.forEach((participant) => {
					allParticipants.add(participant.id)
				})
			})

			return {
				...quiz,
				participantCount: allParticipants.size
			}
		})

		const sortedQuizzes = quizzesWithParticipantCounts
			.sort((a, b) => {
				if (b.participantCount !== a.participantCount) {
					return b.participantCount - a.participantCount
				}
				return (b.rating || 0) - (a.rating || 0)
			})
			.slice(0, 6)

		const formattedQuizzes = sortedQuizzes.map((quiz) => ({
			id: quiz.id,
			title: quiz.title || "Untitled Quiz",
			author: quiz.creator?.name || "Unknown Author",
			participants: quiz.participantCount,
			difficulty: quiz.difficulty === "easy" ? "Beginner" : quiz.difficulty === "medium" ? "Intermediate" : "Advanced",
			rating: Number(quiz.rating?.toFixed(1)) || 0.0,
			duration: quiz.duration === 0 ? "Unlimited" : quiz.duration ? `${quiz.duration} min` : "N/A",
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
