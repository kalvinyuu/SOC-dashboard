import { cpus } from "node:os";
import { RING_BUFFER_SIZE, LOG_ENTRY_SIZE_WORDS } from "./src/faker/binary_model";

async function runPeakThroughputTest(durationMs: number = 5000) {
    const numWorkers = cpus().length;
    console.log(`🚀 PEAK ENGINE TEST: Benchmarking raw Worker generation + SharedArrayBuffer IPC`);
    console.log(`Using ${numWorkers} parallel workers (Skipping DB IO for max throughput simulation)`);

    const sab = new SharedArrayBuffer(RING_BUFFER_SIZE * LOG_ENTRY_SIZE_WORDS * 4);
    const writeOffsetBuf = new SharedArrayBuffer(4);
    const readOffsetBuf = new SharedArrayBuffer(4);

    const startTime = Date.now();
    const workers: Worker[] = [];

    // We use a promise for each worker to resolve when it's done
    const workerPromises = Array.from({ length: numWorkers }).map((_, i) => {
        return new Promise<{ id: number, count: number }>(resolve => {
            const worker = new Worker(new URL("./src/workers/load_worker.ts", import.meta.url).href);
            worker.onmessage = (e) => {
                if (e.data.type === "done") {
                    resolve({ id: i, count: e.data.count });
                }
            };
            worker.postMessage({ durationMs, sab, writeOffsetBuf, readOffsetBuf });
            workers.push(worker);
        });
    });

    const results = await Promise.all(workerPromises);
    const actualDuration = Date.now() - startTime;
    const totalLogs = results.reduce((sum, r) => sum + r.count, 0);
    const logsPerSecond = (totalLogs / (actualDuration / 1000)).toFixed(2);

    console.log('\n--- ⚡️ PEAK ENGINE RESULTS ⚡️ ---');
    console.log(`Total Logs Generated: ${totalLogs.toLocaleString()}`);
    console.log(`Actual Duration: ${actualDuration}ms`);
    console.log(`RAW ENGINE SPEED: ${Number(logsPerSecond).toLocaleString()} logs/second`);
    console.log('----------------------------------');
    console.log('Note: This test isolates the Bun Worker + SAB architecture from DB latency.');

    workers.forEach(w => w.terminate());
    process.exit(0);
}

const duration = parseInt(process.argv[2] ?? '5000');
runPeakThroughputTest(duration);
