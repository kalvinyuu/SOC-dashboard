import { Elysia, t } from 'elysia';
import { staticPlugin } from '@elysiajs/static';
import { db } from './db';
import { securityLogs } from './db/schema';

const app = new Elysia()
  .use(staticPlugin())
  .get('/api/hello', () => ({
    message: 'Security Log Engine API is Active'
  }))
  .post('/api/logs', async ({ body, request }) => {
    const { method, path, ipAddress, userAgent, shannonEntropy, requestSizeBytes, correlationId, severityLevel } = body;
    
    try {
      const result = await db.insert(securityLogs).values({
        method,
        path,
        ipAddress,
        userAgent,
        shannonEntropy,
        requestSizeBytes,
        correlationId,
        severityLevel,
      }).returning();
      
      return { success: true, logId: result[0].id };
    } catch (error) {
      return { success: false, error: 'Failed to ingest log' };
    }
  }, {
    body: t.Object({
      method: t.String(),
      path: t.String(),
      ipAddress: t.String(),
      userAgent: t.Optional(t.String()),
      shannonEntropy: t.Number(),
      requestSizeBytes: t.Number(),
      correlationId: t.String(),
      severityLevel: t.String(),
    })
  })
  .listen(3000);

console.log(`🚀 Server is running at ${app.server?.hostname}:${app.server?.port}`);
