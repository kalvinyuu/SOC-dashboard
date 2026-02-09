// Pre-allocate a frequency table to reuse (per worker/thread)
const FREQ_TABLE = new Uint32Array(256);

/**
 * Computes the Shannon Entropy of a given buffer.
 * Optimized for Bun/V8 using TypedArrays and direct buffer access.
 */
export function calculateEntropy(data: Uint8Array | string): number {
    const buffer = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    const len = buffer.length;
    if (len === 0) return 0;

    // Reset frequency table
    FREQ_TABLE.fill(0);

    for (let i = 0; i < len; i++) {
        const byte = buffer[i];
        if (byte !== undefined) {
            const current = FREQ_TABLE[byte];
            if (current !== undefined) {
                FREQ_TABLE[byte] = current + 1;
            }
        }
    }

    let entropy = 0;
    for (let i = 0; i < 256; i++) {
        const f = FREQ_TABLE[i];
        if (f !== undefined && f > 0) {
            const p = f / len;
            entropy -= p * Math.log2(p);
        }
    }

    return Number(entropy.toFixed(4));
}
