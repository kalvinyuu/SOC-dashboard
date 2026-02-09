import { cors } from "@elysiajs/cors"
import { Elysia, t } from "elysia"
import { generateLog } from "../src/faker";
import { logger, loadTestLogger } from "../src/logger";
import { LogController } from "../src/logs";
import { swagger } from '@elysiajs/swagger';
const app = new Elysia()
	.use(cors())
	.use(swagger())
	.use(LogController)
	.get("/hello", () => ({ message: "Hello from Elysia!" }))
	.get("/users", () => [
		{ id: "1", name: "Alice" },
		{ id: "2", name: "Bob" },
	])
	.group('/api', (app) => app
		.get('/logs/history', async () => {
			const { securityLogs } = await import("../src/db/schema");
			const { db } = await import("../src/db");
			const { desc } = await import("drizzle-orm");

			return await db.select()
				.from(securityLogs)
				.orderBy(desc(securityLogs.timestamp), desc(securityLogs.id))
				.limit(50);
		})
		.get('/logs/generate', ({ query }) => {
			const limit = Number(query.limit) || 10;
			const logs = Array.from({ length: limit }, generateLog);
			logs.forEach(log => logger.info(log, 'Bulk security log generated'));
			return { status: 'success', count: logs.length };
		}, {
			query: t.Object({
				limit: t.Optional(t.String())
			})
		})
		.get('/logs/stress', ({ query }) => {
			const count = Number(query.count) || 1000;
			const mode = query.mode || 'single';

			if (mode === 'worker') {
				const numWorkers = require('os').cpus().length;
				const perWorker = Math.floor(count / numWorkers);

				for (let w = 0; w < numWorkers; w++) {
					for (let i = 0; i < perWorker; i++) {
						loadTestLogger.info(generateLog());
					}
				}
			} else {
				for (let i = 0; i < count; i++) {
					loadTestLogger.info(generateLog());
				}
			}

			return { status: 'success', count, mode };
		}, {
			query: t.Object({
				count: t.Optional(t.String()),
				mode: t.Optional(t.String())
			})
		})
		.get('/stats', async () => {
			const { StatsService } = await import("../src/stats");
			return StatsService.getStats();
		})
		.get('/logs/anomalies', async () => {
			const { securityLogs } = await import("../src/db/schema");
			const { db } = await import("../src/db");
			const { desc, gt, sql } = await import("drizzle-orm");

			const topSuspiciousIPs = await db.select({
				ipAddress: securityLogs.ipAddress,
				count: sql<number>`count(*)`.as('count'),
				avgScore: sql<number>`avg(${securityLogs.threatScore})`.as('avgScore')
			})
				.from(securityLogs)
				.groupBy(securityLogs.ipAddress)
				.orderBy(desc(sql`count(*)`))
				.limit(5);

			const recentAnomalies = await db.select()
				.from(securityLogs)
				.where(gt(securityLogs.threatScore, 10))
				.orderBy(desc(securityLogs.timestamp))
				.limit(10);

			return { topSuspiciousIPs, recentAnomalies };
		})
		.get('/logs/scrapers', async () => {
			const { securityLogs } = await import("../src/db/schema");
			const { db } = await import("../src/db");
			const { desc, sql, or, like } = await import("drizzle-orm");

			// Identify scrapers by request count or specific User-Agent signatures
			const suspectedScrapers = await db.select({
				ipAddress: securityLogs.ipAddress,
				requestCount: sql<number>`count(*)`.as('request_count'),
				userAgent: securityLogs.userAgent,
				avgEntropy: sql<number>`avg(${securityLogs.shannonEntropy})`.as('avg_entropy'),
				lastSeen: sql<string>`max(${securityLogs.timestamp})`.as('last_seen')
			})
				.from(securityLogs)
				.where(or(
					like(securityLogs.userAgent, '%Scrapy%'),
					like(securityLogs.userAgent, '%python-requests%'),
					like(securityLogs.userAgent, '%HeadlessChrome%'),
					like(securityLogs.userAgent, '%Bot%')
				))
				.groupBy(securityLogs.ipAddress, securityLogs.userAgent)
				.orderBy(desc(sql`count(*)`))
				.limit(10);

			return suspectedScrapers;
		})
	)

	.get("/users/:id", ({ params }) => ({
		id: params.id,
		name: `User ${params.id}`,
	}))
	.post(
		"/users",
		({ body }) => ({
			id: String(Date.now()),
			...body,
		}),
		{
			body: t.Object({
				name: t.String(),
			}),
		}
	)
	.listen(3001)

logger.info(`Server running at http://localhost:3001`)

// Automated Background Log Generation
// Simulates 2-10 security events every 5 seconds
setInterval(() => {
	const count = Math.floor(Math.random() * 9) + 2; // [2, 10]
	for (let i = 0; i < count; i++) {
		logger.info(generateLog(), 'Automated security event');
	}
}, 5000);

// Initialize StatsService with current DB count
import("../src/db/schema").then(async ({ securityLogs }) => {
	const { db } = await import("../src/db");
	const { count } = await import("drizzle-orm");
	const { StatsService } = await import("../src/stats");

	const result = await db.select({ value: count() }).from(securityLogs);
	const initialCount = result[0]?.value ?? 0;
	StatsService.initialize(initialCount);
	logger.info(`StatsService initialized with ${initialCount} logs`);
});

export type App = typeof app
