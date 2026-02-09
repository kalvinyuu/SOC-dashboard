import { db } from "../db";
import { securityLogs } from "../db/schema";
import { type InferInsertModel } from 'drizzle-orm';
import { StatsService } from "../stats";

const BATCH_SIZE = 1000;
const FLUSH_INTERVAL = 1000;

let logQueue: any[] = [];
let isProcessing = false;

const insertStmt = (db as any).session.client.prepare(`
    INSERT INTO security_logs (
        method, path, status_code, event_type, location, ip_address, 
        user_agent, shannon_entropy, request_size_bytes, correlation_id, 
        severity_level, threat_vector, threat_score, timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

async function processQueue() {
    if (logQueue.length === 0 || isProcessing) return;

    isProcessing = true;

    const sqlite = (db as any).session.client;

    try {
        // High-speed transaction
        sqlite.transaction(() => {
            while (logQueue.length > 0) {
                const batch = logQueue.splice(0, BATCH_SIZE);
                for (const log of batch) {
                    insertStmt.run(
                        log.method,
                        log.path,
                        log.statusCode,
                        log.eventType,
                        log.location,
                        log.ipAddress,
                        log.userAgent,
                        log.shannonEntropy,
                        log.requestSizeBytes,
                        log.correlationId,
                        log.severityLevel,
                        log.threatVector,
                        log.threatScore,
                        log.timestamp?.getTime() // SQLite stores dates as timestamps
                    );
                }
            }
        })();
    } catch (error) {
        console.error('Failed to write batch to database:', error);
    }

    isProcessing = false;
}

export const LoggerService = {
    async saveLog(logEntry: Record<string, any>) {
        // Zero-latency memory updates
        StatsService.incrementLogs();
        StatsService.incrementSeverity(logEntry.severityLevel as any);

        // Push directly to queue - generateLog now returns the correct DB shape
        logQueue.push(logEntry);

        // Trigger processing if queue gets large
        if (logQueue.length >= BATCH_SIZE && !isProcessing) {
            processQueue();
        }
    },

    flush: async () => {
        await processQueue();
        // Keep waiting if another process starts (unlikely in single thread but safer)
        while (isProcessing) {
            await new Promise(r => setTimeout(r, 10));
        }
    },

    getQueueLength: () => logQueue.length
};

// Periodic flush for safety
setInterval(processQueue, FLUSH_INTERVAL);
