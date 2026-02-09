import { LoggerService } from './src/logger/service';
import { generateLog } from './src/faker';

async function runOptimizedSingleThreadLoadTest(durationMs: number = 5000) {
    console.log(`🚀 Starting ULTRA-OPTIMIZED single-threaded load test for ${durationMs}ms...`);
    console.log(`(Using Bun.js + SQLite WAL + Batching [Size: 1000])`);

    let logsGenerated = 0;
    const startTime = Date.now();
    const endTime = startTime + durationMs;

    let lastTime = Date.now();
    while (lastTime < endTime) {
        const log = generateLog();
        LoggerService.saveLog(log);

        logsGenerated++;

        // Only check time and backpressure every 1000 logs to keep the generator at full tilt
        if (logsGenerated % 1000 === 0) {
            lastTime = Date.now();
            if (LoggerService.getQueueLength() > 50000) {
                await new Promise(r => setTimeout(r, 20));
            }
        }

        if (logsGenerated % 10000 === 0) {
            const queueLen = LoggerService.getQueueLength();
            process.stdout.write(`\rGenerated: ${logsGenerated.toLocaleString()} (Queue: ${queueLen.toLocaleString()})...`);
        }
    }

    console.log(`\n\nFinalizing database flush...`);
    const flushStart = Date.now();
    await LoggerService.flush();

    const actualDuration = Date.now() - startTime;
    const flushDuration = Date.now() - flushStart;
    const logsPerSecond = (logsGenerated / (actualDuration / 1000)).toFixed(2);

    console.log('\n--- ⚡️ REAL INGESTION RESULTS ⚡️ ---');
    console.log(`Total Logs Ingested: ${logsGenerated.toLocaleString()}`);
    console.log(`Total Duration: ${actualDuration}ms (Final flush took ${flushDuration}ms)`);
    console.log(`True Ingestion Rate: ${Number(logsPerSecond).toLocaleString()} logs/second`);
    console.log('--------------------------------------');

    process.exit(0);
}

const duration = parseInt(process.argv[2] ?? '5000');
runOptimizedSingleThreadLoadTest(duration);
