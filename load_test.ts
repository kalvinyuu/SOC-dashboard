import { logger } from './src/logger';
import { generateLog } from './src/faker';

async function runLoadTest(durationMs: number = 5000) {
    console.log(`Starting load test for ${durationMs}ms...`);

    let logsGenerated = 0;
    const startTime = Date.now();
    const endTime = startTime + durationMs;

    while (Date.now() < endTime) {
        // Generate and log immediately
        const log = generateLog();
        logger.info(log, 'Load test log');
        logsGenerated++;

        // Yield occasionally to prevent event loop starvation if needed, 
        // but for max throughput we want to spam as fast as possible.
        /*
        if (logsGenerated % 1000 === 0) {
            await new Promise(r => setTimeout(r, 0));
        }
        */
    }

    const actualDuration = Date.now() - startTime;
    const logsPerSecond = (logsGenerated / (actualDuration / 1000)).toFixed(2);

    console.log('--- Results ---');
    console.log(`Total Logs Processed: ${logsGenerated}`);
    console.log(`Actual Duration: ${actualDuration}ms`);
    console.log(`Throughput: ${logsPerSecond} logs/second`);
    console.log('---------------');

    // Give some time for pino stream to flush to the DB transport
    console.log('Waiting for logs to flush to DB...');
    await new Promise(r => setTimeout(r, 2000));
    process.exit(0);
}

const duration = parseInt(process.argv[2]) || 5000;
runLoadTest(duration);
