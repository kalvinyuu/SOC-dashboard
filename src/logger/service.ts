import { db } from "../db";
import { securityLogs } from "../db/schema";
import { type InferInsertModel } from 'drizzle-orm';

export const LoggerService = {
    async saveLog(logEntry: Record<string, any>) {
        // Basic validation: ensure it has the shape of our security audit log (AuditLog)
        // This prevents standard pino request logs from being inserted as malformed audit logs
        if (!logEntry.eventType || !logEntry.ipAddress || !logEntry.method) {
            return;
        }

        try {
            // Map the log entry (which came from Pino JSON stream) back to our database schema
            // InferInsertModel ensures we provide all required fields correctly
            const logData: InferInsertModel<typeof securityLogs> = {
                method: logEntry.method,
                path: logEntry.path,
                statusCode: logEntry.statusCode,
                eventType: logEntry.eventType,
                location: logEntry.location,
                ipAddress: logEntry.ipAddress,
                userAgent: logEntry.userAgent,
                shannonEntropy: logEntry.shannonEntropy,
                requestSizeBytes: logEntry.requestSizeBytes,
                correlationId: logEntry.correlationId,
                severityLevel: logEntry.severityLevel,
                threatVector: logEntry.threatVector,
                threatScore: logEntry.threatScore,
                // Pino JSON serialization turns Dates into strings, so we re-instantiate it
                timestamp: logEntry.timestamp ? new Date(logEntry.timestamp) : undefined,
            };

            await db.insert(securityLogs).values(logData);
        } catch (error) {
            console.error('Failed to write log to database stream:', error);
        }
    }
};
