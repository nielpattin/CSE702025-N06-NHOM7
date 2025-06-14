import { error, fail, redirect } from "@sveltejs/kit"
import { db } from "$lib/server/db"
import { quizSessions, sessionParticipants, gameAttempts } from "$lib/server/db/schema"
import { eq, and } from "drizzle-orm"
import type { PageServerLoad, Actions } from "./$types"

export const load: PageServerLoad = async ({ params, locals }) => {
	const sessionId = parseInt(params.sessionId)

	if (isNaN(sessionId)) {
		throw error(404, "Session not found")
	}

	const sessionData = await db.query.quizSessions.findFirst({
		where: eq(quizSessions.id, sessionId),
		with: {
			quiz: {
				columns: {
					id: true,
					title: true,
					description: true
				}
			},
			participants: {
				with: {
					user: {
						columns: {
							name: true,
							image: true
						}
					}
				},
				orderBy: sessionParticipants.createdAt
			}
		}
	})

	if (!sessionData) {
		throw error(404, "Session not found")
	}

	const session = {
		id: sessionData.id,
		code: sessionData.code,
		status: sessionData.status,
		expiresAt: sessionData.expiresAt,
		createdAt: sessionData.createdAt,
		hostId: sessionData.hostId,
		quiz: sessionData.quiz
	}

	const participants = sessionData.participants.map((p) => ({
		id: p.id,
		name: p.name,
		userId: p.userId,
		createdAt: p.createdAt,
		user: p.user
	}))

	return {
		session,
		participants,
		userSession: await locals.auth()
	}
}

export const actions: Actions = {
	joinSession: async ({ request, params, locals }) => {
		const sessionId = parseInt(params.sessionId)

		if (isNaN(sessionId)) {
			return fail(400, { error: "Invalid session ID" })
		}

		const formData = await request.formData()
		const name = formData.get("name")?.toString()
		const guestId = formData.get("guestId")?.toString()

		try {
			const sessionResult = await db.select({ id: quizSessions.id, status: quizSessions.status }).from(quizSessions).where(eq(quizSessions.id, sessionId)).limit(1)

			if (sessionResult.length === 0) {
				return fail(404, { error: "Session not found" })
			}

			const session = sessionResult[0]
			if (session.status !== "active") {
				return fail(400, { error: "Session is not active" })
			}

			const authSession = await locals.auth()
			let participantId: number

			if (authSession?.user) {
				const existingParticipant = await db
					.select({ id: sessionParticipants.id })
					.from(sessionParticipants)
					.where(and(eq(sessionParticipants.quizSessionId, sessionId), eq(sessionParticipants.userId, authSession.user.id)))
					.limit(1)

				if (existingParticipant.length > 0) {
					const existingAttempt = await db
						.select({ id: gameAttempts.id })
						.from(gameAttempts)
						.where(and(eq(gameAttempts.quizSessionId, sessionId), eq(gameAttempts.participantId, existingParticipant[0].id), eq(gameAttempts.status, "in_progress")))
						.limit(1)

					if (existingAttempt.length > 0) {
						throw redirect(302, `/play/session/${sessionId}/${existingAttempt[0].id}`)
					} else {
						const newAttempt = await db
							.insert(gameAttempts)
							.values({
								quizSessionId: sessionId,
								participantId: existingParticipant[0].id,
								attemptNumber: 1,
								status: "in_progress",
								startedAt: new Date()
							})
							.returning({ id: gameAttempts.id })

						throw redirect(302, `/play/session/${sessionId}/${newAttempt[0].id}`)
					}
				}

				let displayName: string | null = null
				if (name && name.trim() !== "") {
					const trimmedName = name.trim()
					if (trimmedName.length > 100) {
						return fail(400, { error: "Name must be 100 characters or less" })
					}
					displayName = trimmedName
				}

				const participant = await db
					.insert(sessionParticipants)
					.values({
						quizSessionId: sessionId,
						userId: authSession.user.id,
						name: displayName
					})
					.returning({ id: sessionParticipants.id })

				participantId = participant[0].id
			} else {
				if (!name || name.trim() === "") {
					return fail(400, { error: "Name is required for guest users" })
				}

				const trimmedName = name.trim()
				if (trimmedName.length > 100) {
					return fail(400, { error: "Name must be 100 characters or less" })
				}

				if (guestId) {
					const existingGuestParticipant = await db
						.select({ id: sessionParticipants.id })
						.from(sessionParticipants)
						.where(and(eq(sessionParticipants.quizSessionId, sessionId), eq(sessionParticipants.guestId, guestId)))
						.limit(1)

					if (existingGuestParticipant.length > 0) {
						const existingAttempt = await db
							.select({ id: gameAttempts.id })
							.from(gameAttempts)
							.where(and(eq(gameAttempts.quizSessionId, sessionId), eq(gameAttempts.participantId, existingGuestParticipant[0].id), eq(gameAttempts.status, "in_progress")))
							.limit(1)

						if (existingAttempt.length > 0) {
							throw redirect(302, `/play/session/${sessionId}/${existingAttempt[0].id}`)
						} else {
							const newAttempt = await db
								.insert(gameAttempts)
								.values({
									quizSessionId: sessionId,
									participantId: existingGuestParticipant[0].id,
									attemptNumber: 1,
									status: "in_progress",
									startedAt: new Date()
								})
								.returning({ id: gameAttempts.id })

							throw redirect(302, `/play/session/${sessionId}/${newAttempt[0].id}`)
						}
					}
				}

				const participant = await db
					.insert(sessionParticipants)
					.values({
						quizSessionId: sessionId,
						userId: null,
						guestId: guestId,
						name: trimmedName
					})
					.returning({ id: sessionParticipants.id })

				participantId = participant[0].id
			}

			const gameAttempt = await db
				.insert(gameAttempts)
				.values({
					quizSessionId: sessionId,
					participantId: participantId,
					attemptNumber: 1,
					status: "in_progress",
					startedAt: new Date()
				})
				.returning({ id: gameAttempts.id })

			throw redirect(302, `/play/session/${sessionId}/${gameAttempt[0].id}`)
		} catch (err) {
			if (err && typeof err === "object" && "status" in err && "location" in err) {
				throw err
			}
			console.error("Error joining session:", err)
			return fail(500, { error: "Failed to join session" })
		}
	},

	reattempt: async ({ params, locals }) => {
		const sessionId = parseInt(params.sessionId)

		if (isNaN(sessionId)) {
			return fail(400, { error: "Invalid session ID" })
		}

		try {
			const sessionResult = await db.select({ id: quizSessions.id, status: quizSessions.status }).from(quizSessions).where(eq(quizSessions.id, sessionId)).limit(1)

			if (sessionResult.length === 0) {
				return fail(404, { error: "Session not found" })
			}

			const session = sessionResult[0]
			if (session.status !== "active") {
				return fail(400, { error: "Session is not active" })
			}

			const authSession = await locals.auth()
			if (!authSession?.user) {
				return fail(401, { error: "Authentication required" })
			}

			const participantResult = await db
				.select({ id: sessionParticipants.id })
				.from(sessionParticipants)
				.where(and(eq(sessionParticipants.quizSessionId, sessionId), eq(sessionParticipants.userId, authSession.user.id)))
				.limit(1)

			if (participantResult.length === 0) {
				return fail(400, { error: "You must join the session first" })
			}

			const participantId = participantResult[0].id

			const lastAttemptResult = await db
				.select({ attemptNumber: gameAttempts.attemptNumber })
				.from(gameAttempts)
				.where(and(eq(gameAttempts.quizSessionId, sessionId), eq(gameAttempts.participantId, participantId)))
				.orderBy(gameAttempts.attemptNumber)

			const nextAttemptNumber = lastAttemptResult.length > 0 ? Math.max(...lastAttemptResult.map((a) => a.attemptNumber || 1)) + 1 : 1

			const newAttempt = await db
				.insert(gameAttempts)
				.values({
					quizSessionId: sessionId,
					participantId: participantId,
					attemptNumber: nextAttemptNumber,
					status: "in_progress",
					startedAt: new Date()
				})
				.returning({ id: gameAttempts.id })

			throw redirect(302, `/play/session/${sessionId}/${newAttempt[0].id}`)
		} catch (err) {
			if (err && typeof err === "object" && "status" in err && "location" in err) {
				throw err
			}
			console.error("Error creating reattempt:", err)
			return fail(500, { error: "Failed to create new attempt" })
		}
	}
}
