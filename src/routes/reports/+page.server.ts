import { db } from "$lib/server/db"
import { quizSessions } from "$lib/server/db/schema"
import { redirect } from "@sveltejs/kit"
import { eq } from "drizzle-orm"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth()

	if (!session?.user) {
		redirect(302, "/signin")
	}

	const sessionReports = await db.query.quizSessions.findMany({
		where: eq(quizSessions.hostId, session.user.id),
		with: {
			quiz: true,
			participants: {
				with: {
					gameAttempts: {
						with: {
							questionAttempts: true
						}
					}
				}
			}
		},
		orderBy: quizSessions.createdAt
	})

	const transformedReports = sessionReports.map((report) => {
		const participantAccuracies: number[] = []

		report.participants.forEach((participant) => {
			if (participant.gameAttempts.length === 0) {
				return
			}

			const latestAttempt = participant.gameAttempts.reduce((latest, current) => {
				const latestTime = latest.startedAt ? new Date(latest.startedAt).getTime() : 0
				const currentTime = current.startedAt ? new Date(current.startedAt).getTime() : 0
				return currentTime > latestTime ? current : latest
			})

			const totalQuestions = latestAttempt.questionAttempts.length
			if (totalQuestions > 0) {
				const correctQuestions = latestAttempt.questionAttempts.filter((qa) => qa.correct).length
				const participantAccuracy = (correctQuestions / totalQuestions) * 100
				participantAccuracies.push(participantAccuracy)
			}
		})

		const accuracy = participantAccuracies.length > 0 ? Math.round(participantAccuracies.reduce((sum, acc) => sum + acc, 0) / participantAccuracies.length) : 0

		return {
			id: report.id,
			sessionName: report.quiz?.title || "Untitled Session",
			createdDate: report.createdAt,
			participantCount: report.participants.length,
			accuracy
		}
	})

	return {
		sessionReports: transformedReports
	}
}
