import { faker } from '@faker-js/faker';

// Binary Log Format (Fixed Size: 12 words / 48 bytes)
// 0: Timestamp (low 32)
// 1: Timestamp (high 32)
// 2: Method (idx), Path (idx), StatusCode (uint16) -> Packed
// 3: EventType (idx), Location (idx), Severity (idx) -> Packed
// 4: IP (idx), Agent (idx), Vector (idx) -> Packed
// 5: UUID (idx)
// 6: Entropy (float32)
// 7: ThreatScore (float32)
// 8: RequestSize (uint32)
// 9-11: Reserved

export const PREBAKED = {
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    eventTypes: ['HTTP', 'AUTH', 'WAF_BLOCK'],
    severities: ['INFO', 'WARNING', 'CRITICAL'] as const,
    vectors: ['NONE', 'SQL_INJECTION', 'XSS_ATTEMPT', 'PATH_TRAVERSAL', 'REMOTE_CODE_EXECUTION', 'WEB_SCRAPER', 'WAF_RULE_VIOLATION'],
    paths: Array.from({ length: 50 }, () => faker.system.directoryPath()),
    ips: Array.from({ length: 1000 }, () => faker.internet.ipv4()),
    locations: Array.from({ length: 100 }, () => `${faker.location.city()}, ${faker.location.countryCode()}`),
    agents: Array.from({ length: 50 }, () => faker.internet.userAgent()),
    uuids: Array.from({ length: 1000 }, () => faker.string.uuid()),
};

export const LOG_ENTRY_SIZE_WORDS = 10;
export const RING_BUFFER_SIZE = 10000; // Entries
