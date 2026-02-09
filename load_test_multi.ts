import { cpus } from "node:os";
import { LoggerService } from "./src/logger/service";
import { PREBAKED, LOG_ENTRY_SIZE_WORDS, RING_BUFFER_SIZE } from "./src/faker/binary_model";

async function runHighPerformanceLoadTest(durationMs: number = 5000) {
    const numWorkers = Math.max(1, cpus().length - 1);
    console.log(`💎 Starting PLATINUM tier load test: ${numWorkers} binary generators + SharedArrayBuffer Ring Buffer`);

    const sab = new SharedArrayBuffer(RING_BUFFER_SIZE * LOG_ENTRY_SIZE_WORDS * 4);
    const writeOffsetBuf = new SharedArrayBuffer(4);
    const readOffsetBuf = new SharedArrayBuffer(4);

    const writeOffset = new Uint32Array(writeOffsetBuf);
    const readOffset = new Uint32Array(readOffsetBuf);
    const view = new Uint32Array(sab);
    const f32View = new Float32Array(sab);

    let totalProcessed = 0;
    const startTime = Date.now();
    const endTime = startTime + durationMs;

    const workers: Worker[] = [];
    for (let i = 0; i < numWorkers; i++) {
        const worker = new Worker(new URL("./src/workers/load_worker.ts", import.meta.url).href);
        worker.postMessage({ durationMs, sab, writeOffsetBuf, readOffsetBuf });
        workers.push(worker);
    }

    // Main Writer Loop - use monotonic pointers for robust comparison
    while (Date.now() < endTime + 2000 || totalProcessed < 1) {
        const head = Atomics.load(writeOffset, 0); // Monotonic head from workers

        if (totalProcessed === head) {
            if (Date.now() > endTime + 1000) break; // All workers done and buffer drained
            await new Promise(r => setTimeout(r, 10));
            continue;
        }

        // Process a batch from the ring buffer
        while (totalProcessed < head) {
            const entryIdx = (totalProcessed % RING_BUFFER_SIZE) * LOG_ENTRY_SIZE_WORDS;

            // Reconstruct log object from binary
            // 0-1: Timestamp
            const ts = view[entryIdx + 0]! + (view[entryIdx + 1]! * 4294967296);

            // 2: Packed Method, Path, Status
            const p2 = view[entryIdx + 2]!;
            const method = PREBAKED.methods[p2 >> 24]!;
            const path = PREBAKED.paths[(p2 >> 8) & 0xFFFF]!;
            const status = p2 & 0xFF;

            // 3: Packed EventType, Location, Severity
            const p3 = view[entryIdx + 3]!;
            const etype = PREBAKED.eventTypes[p3 >> 24]!;
            const loc = PREBAKED.locations[(p3 >> 8) & 0xFFFF]!;
            const sev = PREBAKED.severities[p3 & 0xFF]!;

            // 4: Packed IP, Agent, Vector
            const p4 = view[entryIdx + 4]!;
            const ip = PREBAKED.ips[p4 >> 16]!;
            const agent = PREBAKED.agents[(p4 >> 8) & 0xFF]!;
            const vec = PREBAKED.vectors[p4 & 0xFF]!;

            // 5: UUID
            const uuid = PREBAKED.uuids[view[entryIdx + 5]!]!;

            const log = {
                timestamp: new Date(ts),
                method,
                path,
                statusCode: status,
                eventType: etype,
                location: loc,
                ipAddress: ip,
                userAgent: agent,
                shannonEntropy: f32View[entryIdx + 6],
                threatScore: f32View[entryIdx + 7],
                requestSizeBytes: view[entryIdx + 8],
                correlationId: uuid,
                severityLevel: sev,
                threatVector: vec
            };

            await LoggerService.saveLog(log);
            totalProcessed++;

            // Periodically update the shared tail so workers can reuse slots
            if (totalProcessed % 100 === 0) {
                Atomics.store(readOffset, 0, totalProcessed % RING_BUFFER_SIZE);
            }

            if (totalProcessed % 5000 === 0) {
                process.stdout.write(`\rProcessed: ${totalProcessed.toLocaleString()} logs...`);
            }
        }
    }

    const actualDuration = Date.now() - startTime;
    const logsPerSecond = (totalProcessed / (actualDuration / 1000)).toFixed(2);

    console.log('\n\n--- SharedArrayBuffer Results ---');
    console.log(`Total Logs Ingested: ${totalProcessed.toLocaleString()}`);
    console.log(`Throughput: ${Number(logsPerSecond).toLocaleString()} logs/second`);
    console.log('---------------------------------');

    workers.forEach(w => w.terminate());
    process.exit(0);
}

const duration = parseInt(process.argv[2] ?? '5000');
runHighPerformanceLoadTest(duration);
