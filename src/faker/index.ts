import { faker } from '@faker-js/faker';
import type { AuditLog, LogSeverity, EventType } from './model';
import { calculateEntropy } from '../utils/entropy';

const ATTACK_PATHS = [
  '/admin/login', '/.env', '/etc/passwd', '/wp-admin/phpmyadmin',
  '/api/v1/debug', '/config/database.yaml', '/.git/config',
  '/api/v1/users/export?token=admin', '/sh?cmd=id', '/cgi-bin/test-cgi'
];

const ATTACK_SIGNATURES = [
  "' OR '1'='1", "<script>alert(1)</script>", "../../etc/shadow",
  "();/usr/bin/id", "<?php system($_GET['cmd']); ?>", "admin'--"
];

const THREAT_VECTORS = [
  'SQL_INJECTION', 'XSS_ATTEMPT', 'PATH_TRAVERSAL',
  'REMOTE_CODE_EXECUTION', 'CREDENTIAL_STUFFING', 'OVERSCOPTED_API_ACCESS'
];

const SCRAPER_USER_AGENTS = [
  'Scrapy/2.5.0 (+https://scrapy.org)',
  'python-requests/2.26.0',
  'HeadlessChrome/91.0.4472.164',
  'AhrefsBot/7.0; +http://ahrefs.com/robot/',
  'Go-http-client/1.1'
];

const NORMAL_PATHS = [
  // Static Assets (Low interest for security)
  '/assets/index.js', '/assets/vendor.css', '/favicon.ico', '/logo.png',
  // Standard UI Routes
  '/dashboard', '/settings', '/profile', '/messages/inbox',
  // Healthy API Traffic
  '/api/v1/health', '/api/v1/notifications/count', '/api/v1/user/theme'
];

export const generateLog = (): AuditLog => {
  // Use Faker's built-in HTTP methods
  const statusCode = faker.internet.httpStatusCode({
    types: ['success', 'clientError', 'serverError']
  });

  // Logic to map severity based on the generated status code
  const getSeverity = (code: number): LogSeverity => {
    if (code >= 500) return 'CRITICAL';
    if (code >= 400) return 'WARNING';
    return 'INFO';
  };

  const isAttack = Math.random() > 0.85;
  const isScraper = !isAttack && Math.random() > 0.95;
  const eventTypes: EventType[] = ['HTTP', 'AUTH', 'WAF_BLOCK'];

  const agent = isScraper
    ? faker.helpers.arrayElement(SCRAPER_USER_AGENTS)
    : faker.internet.userAgent();
  let path = isAttack
    ? faker.helpers.arrayElement(ATTACK_PATHS)
    : faker.helpers.arrayElement(NORMAL_PATHS);

  let threatVector = 'NONE';
  if (isAttack) {
    const signature = faker.helpers.arrayElement(ATTACK_SIGNATURES);
    path = `${path}?q=${encodeURIComponent(signature)}`;
    threatVector = faker.helpers.arrayElement(THREAT_VECTORS);
  } else if (isScraper) {
    threatVector = 'WEB_SCRAPER';
  }

  const payload = `${path}${agent}${isAttack ? 'SEC_ALERT' : ''}`;
  const entropy = calculateEntropy(payload);

  return {
    timestamp: new Date(),
    method: isAttack ? 'POST' : faker.internet.httpMethod(),
    path,
    statusCode,
    eventType: isAttack ? 'WAF_BLOCK' : faker.helpers.arrayElement(eventTypes),
    location: `${faker.location.city()}, ${faker.location.countryCode()}`,
    ipAddress: faker.internet.ipv4(),
    userAgent: agent,
    shannonEntropy: entropy,
    requestSizeBytes: faker.number.int({ min: 128, max: 10000 }),
    correlationId: faker.string.uuid(),
    severityLevel: isAttack ? 'CRITICAL' : (isScraper ? 'WARNING' : getSeverity(statusCode)),
    threatVector,
    threatScore: (entropy * 1.5) + (isAttack ? 5 : 0) + (isScraper ? 3 : 0) + (statusCode >= 400 ? 2 : 0)
  };
};
