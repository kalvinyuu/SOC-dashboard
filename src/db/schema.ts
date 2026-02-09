import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const securityLogs = sqliteTable('security_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  timestamp: integer('timestamp', { mode: 'timestamp' })
    .default(sql`(strftime('%s', 'now'))`)
    .notNull(),
  method: text('method').notNull(),
  path: text('path').notNull(),
  statusCode: integer('status_code'),
  eventType: text('event_type').notNull().default('HTTP'),
  location: text('location'),
  ipAddress: text('ip_address').notNull(),
  userAgent: text('user_agent'),
  shannonEntropy: real('shannon_entropy').notNull(),
  requestSizeBytes: integer('request_size_bytes').notNull(),
  correlationId: text('correlation_id').notNull(),
  severityLevel: text('severity_level').notNull(),
  threatVector: text('threat_vector').default('NONE'),
  threatScore: real('threat_score').default(0),
}, (table) => ({
  timestampIdx: index('idx_security_logs_timestamp').on(table.timestamp),
  entropyIdx: index('idx_security_logs_entropy').on(table.shannonEntropy),
  severityTimestampIdx: index('idx_security_logs_severity_timestamp').on(table.severityLevel, table.timestamp),
  correlationIdx: index('idx_security_logs_correlation').on(table.correlationId),
}));
