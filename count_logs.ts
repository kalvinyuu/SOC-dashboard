import { db } from './src/db';
import { securityLogs } from './src/db/schema';
import { count } from 'drizzle-orm';

async function checkTotal() {
    const result = await db.select({ value: count() }).from(securityLogs);
    console.log('Total logs in DB:', result[0].value);
    process.exit(0);
}

checkTotal();
