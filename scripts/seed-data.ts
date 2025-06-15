import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { eq } from "drizzle-orm"
import "dotenv/config"
import * as schema from "../src/lib/server/db/schema"

const { users, quizzes, questions, questionOptions, quizSessions, sessionParticipants, gameAttempts, sessionQuestions, sessionQuestionOptions, questionAttempts } = schema

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not set. Make sure you have a .env file with DATABASE_URL configured.")
}

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
})

const db = drizzle(pool, { schema })

const ADMIN_EMAIL = process.env.DEFAULT_EMAIL_SEED || "test@example.com"
const QUIZ_COUNT = 1000
const QUESTIONS_PER_QUIZ = 30
const SESSION_COUNT = 200
const PARTICIPANTS_PER_SESSION = 100
const ATTEMPTS_PER_PARTICIPANT = 3
const BATCH_SIZE = 1000

function generateRandomString(length: number): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	let result = ""
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length))
	}
	return result
}

function generateSessionCode(): string {
	return generateRandomString(6).toUpperCase()
}

function generateQuizTitle(): string {
	const topics = ["JavaScript", "TypeScript", "Python", "React", "Vue.js", "Angular", "Node.js", "PostgreSQL", "MongoDB", "Docker", "Kubernetes", "AWS", "Machine Learning", "Data Science", "Cybersecurity", "Web Development", "Mobile Development", "Game Development", "DevOps", "UI/UX Design"]
	const types = ["Fundamentals", "Advanced Concepts", "Best Practices", "Interview Questions", "Certification Prep", "Quick Assessment", "Deep Dive", "Beginner Guide", "Expert Level", "Practical Applications"]
	const topic = topics[Math.floor(Math.random() * topics.length)]
	const type = types[Math.floor(Math.random() * types.length)]
	return `${topic} ${type}`
}

function generateQuestionContent(): string {
	const questionStarters = ["What is the main purpose of", "Which of the following best describes", "How do you implement", "What happens when you execute", "Which method is used to", "What is the correct syntax for", "Which statement is true about", "What will be the output of", "How can you optimize", "What is the difference between"]
	const topics = ["event handling in JavaScript?", "async/await in TypeScript?", "state management in React?", "database indexing?", "CSS grid layouts?", "RESTful API design?", "memory management?", "error handling?", "performance optimization?", "security best practices?"]
	const starter = questionStarters[Math.floor(Math.random() * questionStarters.length)]
	const topic = topics[Math.floor(Math.random() * topics.length)]
	return `${starter} ${topic}`
}

function generateOptionContent(isCorrect: boolean): string {
	if (isCorrect) {
		const correctOptions = ["This is the correct implementation", "This approach follows best practices", "This method provides optimal performance", "This solution handles edge cases properly", "This is the standard recommended approach"]
		return correctOptions[Math.floor(Math.random() * correctOptions.length)]
	} else {
		const incorrectOptions = ["This approach has performance issues", "This method is deprecated", "This implementation is incomplete", "This solution lacks error handling", "This approach violates best practices", "This method has security vulnerabilities", "This implementation is inefficient", "This solution doesn't scale well"]
		return incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)]
	}
}

function generateGuestName(): string {
	const firstNames = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery", "Quinn", "Sage", "River", "Skylar", "Dakota", "Phoenix", "Rowan", "Blake", "Cameron", "Devon", "Emery", "Finley", "Harper"]
	const lastNames = ["Smith", "Johnson", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez"]
	const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
	const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
	return `${firstName} ${lastName}`
}

function generateRealisticTimestamps() {
	const startTime = Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
	const duration = Math.random() * 2 * 60 * 60 * 1000
	return {
		startedAt: new Date(startTime),
		completedAt: new Date(startTime + duration)
	}
}

async function createQuizzesInBatches(adminUserId: string) {
	console.log(`📝 Creating ${QUIZ_COUNT} quizzes in batches...`)

	for (let batchStart = 0; batchStart < QUIZ_COUNT; batchStart += BATCH_SIZE) {
		const batchEnd = Math.min(batchStart + BATCH_SIZE, QUIZ_COUNT)
		console.log(`Creating quiz batch ${Math.floor(batchStart / BATCH_SIZE) + 1}/${Math.ceil(QUIZ_COUNT / BATCH_SIZE)} (${batchStart + 1}-${batchEnd})...`)

		await db.transaction(async (tx) => {
			const quizInserts: (typeof quizzes.$inferInsert)[] = []
			for (let i = batchStart; i < batchEnd; i++) {
				quizInserts.push({
					title: generateQuizTitle(),
					description: `Comprehensive quiz covering important concepts and practical applications. Quiz #${i + 1}`,
					creatorId: adminUserId,
					status: "published" as const,
					visibility: Math.random() > 0.5 ? ("public" as const) : ("private" as const),
					difficulty: (["easy", "medium", "hard"] as const)[Math.floor(Math.random() * 3)],
					duration: Math.floor(Math.random() * 60) + 15,
					rating: Math.round((Math.random() * 4 + 1) * 10) / 10
				})
			}

			const insertedQuizzes = await tx.insert(quizzes).values(quizInserts).returning()

			for (const quiz of insertedQuizzes) {
				const questionsToInsert: (typeof questions.$inferInsert)[] = []
				for (let j = 0; j < QUESTIONS_PER_QUIZ; j++) {
					questionsToInsert.push({
						quizId: quiz.id,
						type: "multiple_choice" as const,
						content: generateQuestionContent(),
						timeLimit: Math.floor(Math.random() * 30) + 15,
						points: Math.floor(Math.random() * 5) + 1
					})
				}

				const insertedQuestions = await tx.insert(questions).values(questionsToInsert).returning()

				const optionsToInsert: (typeof questionOptions.$inferInsert)[] = []
				for (const question of insertedQuestions) {
					const correctOptionIndex = Math.floor(Math.random() * 4)
					for (let k = 0; k < 4; k++) {
						optionsToInsert.push({
							questionId: question.id,
							order: k + 1,
							content: generateOptionContent(k === correctOptionIndex),
							correct: k === correctOptionIndex
						})
					}
				}

				await tx.insert(questionOptions).values(optionsToInsert)
			}
		})
	}
}

async function createSessionsWithOptimizedQueries(adminUserId: string) {
	console.log(`🎮 Creating ${SESSION_COUNT} quiz sessions with optimized queries...`)

	const allQuizzes = await db.select({ id: quizzes.id }).from(quizzes)
	const allQuestions = await db
		.select({
			id: questions.id,
			quizId: questions.quizId,
			type: questions.type,
			content: questions.content,
			timeLimit: questions.timeLimit,
			points: questions.points
		})
		.from(questions)
	const allOptions = await db
		.select({
			id: questionOptions.id,
			questionId: questionOptions.questionId,
			order: questionOptions.order,
			content: questionOptions.content,
			correct: questionOptions.correct
		})
		.from(questionOptions)

	const questionsByQuiz = new Map()
	allQuestions.forEach((q) => {
		if (!questionsByQuiz.has(q.quizId)) {
			questionsByQuiz.set(q.quizId, [])
		}
		questionsByQuiz.get(q.quizId).push(q)
	})

	const optionsByQuestion = new Map()
	allOptions.forEach((o) => {
		if (!optionsByQuestion.has(o.questionId)) {
			optionsByQuestion.set(o.questionId, [])
		}
		optionsByQuestion.get(o.questionId).push(o)
	})

	const usedCodes = new Set()

	for (let i = 0; i < SESSION_COUNT; i++) {
		console.log(`Creating session ${i + 1}/${SESSION_COUNT}...`)

		await db.transaction(async (tx) => {
			let sessionCode
			do {
				sessionCode = generateSessionCode()
			} while (usedCodes.has(sessionCode))
			usedCodes.add(sessionCode)

			const randomQuiz = allQuizzes[Math.floor(Math.random() * allQuizzes.length)]
			const [session] = await tx
				.insert(quizSessions)
				.values({
					quizId: randomQuiz.id,
					hostId: adminUserId,
					code: sessionCode,
					status: "active",
					expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
				})
				.returning()

			const sessionQuizQuestions = questionsByQuiz.get(session.quizId) || []

			if (sessionQuizQuestions.length > 0) {
				const sessionQuestionsToInsert = sessionQuizQuestions.map((originalQuestion) => ({
					quizSessionId: session.id,
					originalQuestionId: originalQuestion.id,
					type: originalQuestion.type,
					content: originalQuestion.content,
					timeLimit: originalQuestion.timeLimit,
					points: originalQuestion.points
				}))

				const insertedSessionQuestions = await tx.insert(sessionQuestions).values(sessionQuestionsToInsert).returning()

				const sessionOptionsToInsert: (typeof sessionQuestionOptions.$inferInsert)[] = []
				for (const sessionQuestion of insertedSessionQuestions) {
					const originalOptions = optionsByQuestion.get(sessionQuestion.originalQuestionId) || []
					for (const originalOption of originalOptions) {
						sessionOptionsToInsert.push({
							sessionQuestionId: sessionQuestion.id,
							originalOptionId: originalOption.id,
							order: originalOption.order,
							content: originalOption.content,
							correct: originalOption.correct
						})
					}
				}

				const insertedSessionOptions = await tx.insert(sessionQuestionOptions).values(sessionOptionsToInsert).returning()

				const sessionOptionsByQuestion = new Map()
				insertedSessionOptions.forEach((so) => {
					if (!sessionOptionsByQuestion.has(so.sessionQuestionId)) {
						sessionOptionsByQuestion.set(so.sessionQuestionId, [])
					}
					sessionOptionsByQuestion.get(so.sessionQuestionId).push(so)
				})

				const participantsToInsert: (typeof sessionParticipants.$inferInsert)[] = []
				for (let p = 0; p < PARTICIPANTS_PER_SESSION; p++) {
					participantsToInsert.push({
						quizSessionId: session.id,
						guestId: `guest_${session.id}_${p}`,
						name: generateGuestName(),
						data: {
							correct: 0,
							incorrect: 0,
							attempts: 0,
							total_time_ms: 0,
							questions_per_sec: 0,
							best_score: 0
						}
					})
				}

				const insertedParticipants = await tx.insert(sessionParticipants).values(participantsToInsert).returning()

				const attemptsToInsert: (typeof gameAttempts.$inferInsert)[] = []
				const questionAttemptsToInsert: (typeof questionAttempts.$inferInsert)[] = []

				for (const participant of insertedParticipants) {
					for (let a = 0; a < ATTEMPTS_PER_PARTICIPANT; a++) {
						const { startedAt, completedAt } = generateRealisticTimestamps()
						const score = Math.floor(Math.random() * 100)

						attemptsToInsert.push({
							quizSessionId: session.id,
							participantId: participant.id,
							attemptNumber: a + 1,
							score: score,
							status: "completed" as const,
							startedAt,
							completedAt
						})
					}
				}

				const insertedAttempts = await tx.insert(gameAttempts).values(attemptsToInsert).returning()

				for (const attempt of insertedAttempts) {
					for (const sessionQuestion of insertedSessionQuestions) {
						const sessionOptions = sessionOptionsByQuestion.get(sessionQuestion.id) || []
						if (sessionOptions.length > 0) {
							const selectedOption = sessionOptions[Math.floor(Math.random() * sessionOptions.length)]
							const isCorrect = selectedOption.correct

							questionAttemptsToInsert.push({
								gameAttemptId: attempt.id,
								sessionQuestionId: sessionQuestion.id,
								selectedSessionOptionId: selectedOption.id,
								correct: isCorrect,
								timeTakenMs: Math.floor(Math.random() * 30000) + 5000,
								pointsAwarded: isCorrect ? sessionQuestion.points || 1 : 0
							})
						}
					}
				}

				if (questionAttemptsToInsert.length > 0) {
					for (let i = 0; i < questionAttemptsToInsert.length; i += BATCH_SIZE) {
						const batch = questionAttemptsToInsert.slice(i, i + BATCH_SIZE)
						await tx.insert(questionAttempts).values(batch)
					}
				}
			}
		})
	}
}

async function seedData() {
	console.log("🌱 Starting optimized data seeding...")

	try {
		console.log("📚 Checking for existing admin user...")
		let adminUser = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL)).limit(1)

		if (adminUser.length === 0) {
			console.log("📚 Creating new admin user...")
			const [newAdminUser] = await db
				.insert(users)
				.values({
					email: ADMIN_EMAIL,
					name: "Quiz Admin",
					role: "Admin"
				})
				.returning()
			adminUser = [newAdminUser]
		} else {
			console.log("📚 Using existing admin user:", adminUser[0].email)
		}

		const adminUserId = adminUser[0].id

		await createQuizzesInBatches(adminUserId)
		await createSessionsWithOptimizedQueries(adminUserId)

		console.log("✅ Optimized data seeding completed successfully!")
		console.log(`📊 Summary:`)
		console.log(`   • Quizzes: ${QUIZ_COUNT}`)
		console.log(`   • Questions: ${QUIZ_COUNT * QUESTIONS_PER_QUIZ}`)
		console.log(`   • Question Options: ${QUIZ_COUNT * QUESTIONS_PER_QUIZ * 4}`)
		console.log(`   • Sessions: ${SESSION_COUNT}`)
		console.log(`   • Participants: ${SESSION_COUNT * PARTICIPANTS_PER_SESSION}`)
		console.log(`   • Game Attempts: ${SESSION_COUNT * PARTICIPANTS_PER_SESSION * ATTEMPTS_PER_PARTICIPANT}`)
		console.log(`   • Performance optimizations applied: ✅`)
	} catch (error) {
		console.error("❌ Error during seeding:", error)
		throw error
	} finally {
		await pool.end()
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	seedData()
		.then(() => {
			console.log("🎉 Optimized seeding process completed!")
			process.exit(0)
		})
		.catch((error) => {
			console.error("💥 Seeding failed:", error)
			process.exit(1)
		})
}
