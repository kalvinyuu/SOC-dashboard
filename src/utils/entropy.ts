/**
 * Computes the Shannon Entropy of a given buffer.
 * Entropy is a measure of the unpredictability of data.
 * Values typically range from 0 (completely predictable) to 8 (random).
 */
export function calculateEntropy(data: Uint8Array | string): number {
    const buffer = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    if (buffer.length === 0) return 0;

    const freq = new Uint32Array(256);
    for (let i = 0; i < buffer.length; i++) {
        const byte = buffer[i];
        if (byte !== undefined) {
            freq[byte]++;
        }
    }

    let entropy = 0;
    for (let i = 0; i < 256; i++) {
        const f = freq[i]!;
        if (f > 0) {
            const p = f / buffer.length;
            entropy -= p * Math.log2(p);
        }
    }

    return Number(entropy.toFixed(4));
}
