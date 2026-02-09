import { PREBAKED, LOG_ENTRY_SIZE_WORDS, RING_BUFFER_SIZE } from "../faker/binary_model";

const worker = self as unknown as Worker;

worker.onmessage = (event) => {
    const { durationMs, sab, writeOffsetBuf, readOffsetBuf } = event.data;
    const view = new Uint32Array(sab);
    const f32View = new Float32Array(sab);

    const writeOffset = new Uint32Array(writeOffsetBuf);
    const readOffset = new Uint32Array(readOffsetBuf);

    const endTime = Date.now() + durationMs;

    // Generator local counter
    let localCount = 0;

    while (Date.now() < endTime) {
        // Reserve a slot atomically
        const head = Atomics.add(writeOffset, 0, 1) % RING_BUFFER_SIZE;
        const tail = Atomics.load(readOffset, 0);

        // Simple buffer full check (could still race slightly but safe enough for load test)
        if ((head + 1) % RING_BUFFER_SIZE === tail) {
            continue;
        }

        const entryIdx = head * LOG_ENTRY_SIZE_WORDS;
        const now = Date.now();

        // 0-1: Timestamp
        view[entryIdx + 0] = now >>> 0;
        view[entryIdx + 1] = (now / 4294967296) >>> 0;

        // ... (data packing same as before)
        view[entryIdx + 2] = (1 << 24) | (2 << 8) | 200;
        view[entryIdx + 3] = (0 << 24) | (5 << 8) | 0;
        view[entryIdx + 4] = (10 << 16) | (3 << 8) | 0;
        view[entryIdx + 5] = 1;
        f32View[entryIdx + 6] = 4.5;
        f32View[entryIdx + 7] = 1.2;
        view[entryIdx + 8] = 1024;

        localCount++;
    }

    worker.postMessage({ type: "done", count: localCount });
};
