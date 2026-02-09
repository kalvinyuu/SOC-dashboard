export type LogSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export type EventType = 'HTTP' | 'AUTH' | 'WAF_BLOCK';

export interface AuditLog {
    timestamp: Date;
    method: string;
    path: string;
    statusCode: number;
    eventType: EventType;
    location: string;
    ipAddress: string;
    userAgent: string;
    shannonEntropy: number;
    requestSizeBytes: number;
    correlationId: string;
    severityLevel: LogSeverity;
    threatVector?: string;
    threatScore?: number;
}
