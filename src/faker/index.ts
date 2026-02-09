import { faker } from '@faker-js/faker';
import type { AuditLog, LogSeverity, EventType } from './model';
import { calculateEntropy } from '../utils/entropy';

const ATTACK_PATHS = [
  '/admin/login', '/.env', '/etc/passwd', '/wp-admin/phpmyadmin',
  '/api/v1/debug', '/config/database.yaml', '/.git/config',
  '/api/v1/users/export?token=admin', '/sh?cmd=id'
];

const NORMAL_PATHS = [
  '/assets/index.js', '/assets/vendor.css', '/favicon.ico', '/logo.png',
  '/dashboard', '/settings', '/profile', '/messages/inbox',
  '/api/v1/health', '/api/v1/notifications/count'
];

const encoder = new TextEncoder();
const encodeList = (list: string[]) => list.map(s => encoder.encode(s));

const ATTACK_PATHS_BUF = encodeList(ATTACK_PATHS);
const NORMAL_PATHS_BUF = encodeList(NORMAL_PATHS);

// PRE-ENCODE random data with classic for-loops to avoid Array.from/map GC pressure
const PREBAKED_IPS: string[] = [];
for (let i = 0; i < 1000; i++) PREBAKED_IPS.push(faker.internet.ipv4());

const PREBAKED_LOCATIONS: string[] = [];
for (let i = 0; i < 100; i++) PREBAKED_LOCATIONS.push(`${faker.location.city()}, ${faker.location.countryCode()}`);

const PREBAKED_AGENTS: string[] = [];
const PREBAKED_AGENTS_BUF: Uint8Array[] = [];
for (let i = 0; i < 50; i++) {
  const agent = faker.internet.userAgent();
  PREBAKED_AGENTS.push(agent);
  PREBAKED_AGENTS_BUF.push(encoder.encode(agent));
}

const PREBAKED_UUIDS: string[] = [];
for (let i = 0; i < 1000; i++) PREBAKED_UUIDS.push(faker.string.uuid());

const SCRAPER_AGENT = 'Scrapy/2.5.0';
const SCRAPER_AGENT_BUF = encoder.encode(SCRAPER_AGENT);

// Pre-calculate entropy for common paths using for-loops
const PATH_ENTROPY = new Map<Uint8Array, number>();
const ALL_PATHS = [ATTACK_PATHS_BUF, NORMAL_PATHS_BUF];
for (let i = 0; i < ALL_PATHS.length; i++) {
  const list = ALL_PATHS[i]!;
  for (let j = 0; j < list.length; j++) {
    const p = list[j]!;
    PATH_ENTROPY.set(p, calculateEntropy(p));
  }
}

const SEC_ALERT_BUF = encoder.encode('SEC_ALERT');
const PAYLOAD_BUF = new Uint8Array(2048);
const decoder = new TextDecoder();

// Hot path generator
export const generateLog = (): AuditLog => {
  const isAttack = Math.random() > 0.85;
  const isScraper = !isAttack && Math.random() > 0.95;

  const paths = isAttack ? ATTACK_PATHS : NORMAL_PATHS;
  const pathBufs = isAttack ? ATTACK_PATHS_BUF : NORMAL_PATHS_BUF;
  const pathIdx = Math.floor(Math.random() * paths.length);

  const path = paths[pathIdx]!;
  const pathBuf = pathBufs[pathIdx]!;

  const agentIdx = Math.floor(Math.random() * PREBAKED_AGENTS.length);
  const agentStr = isScraper ? SCRAPER_AGENT : PREBAKED_AGENTS[agentIdx]!;

  // Use pre-calculated entropy - bitwise/math rounding is significantly faster than toFixed()
  const baseEntropy = PATH_ENTROPY.get(pathBuf) || 4.2;
  const rawEntropy = baseEntropy + (isAttack ? 2.5 : 0) + (Math.random() * 0.5);
  const entropy = Math.round(rawEntropy * 10000) / 10000;
  const statusCode = isAttack ? 403 : (Math.random() > 0.95 ? 500 : 200);

  return {
    timestamp: new Date(),
    method: isAttack ? 'POST' : 'GET',
    path,
    statusCode,
    eventType: isAttack ? 'WAF_BLOCK' : 'HTTP',
    location: PREBAKED_LOCATIONS[Math.floor(Math.random() * PREBAKED_LOCATIONS.length)]!,
    ipAddress: PREBAKED_IPS[Math.floor(Math.random() * PREBAKED_IPS.length)]!,
    userAgent: agentStr,
    shannonEntropy: entropy,
    requestSizeBytes: Math.floor(Math.random() * 5000) + 100,
    correlationId: PREBAKED_UUIDS[Math.floor(Math.random() * PREBAKED_UUIDS.length)]!,
    severityLevel: isAttack ? 'CRITICAL' : (statusCode >= 500 ? 'WARNING' : 'INFO'),
    threatVector: isAttack ? 'WAF_RULE_VIOLATION' : 'NONE',
    threatScore: (entropy * 1.5) + (isAttack ? 5 : 0)
  };
};
