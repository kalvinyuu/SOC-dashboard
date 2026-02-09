/**
 * StatsService: Uses SharedArrayBuffer and TypedArrays for zero-latency
 * global statistics across workers and the main thread.
 * This is "Job App Worthy" because it demonstrates thread-safe shared memory.
 */

// Format: [TotalLogs, TotalThreats, InfoCount, WarningCount, CriticalCount, ...24 Hourly Slots]
const STATS_SIZE = 5 + 24;
const sab = new SharedArrayBuffer(STATS_SIZE * 4);
const stats = new Uint32Array(sab);

export const StatsService = {
    getSharedBuffer: () => sab,

    incrementLogs: () => Atomics.add(stats, 0, 1),
    incrementThreats: () => Atomics.add(stats, 1, 1),

    incrementSeverity: (level: 'INFO' | 'WARNING' | 'CRITICAL') => {
        const idx = level === 'INFO' ? 2 : level === 'WARNING' ? 3 : 4;
        Atomics.add(stats, idx, 1);
    },

    updateHourlyCount: (hour: number) => {
        if (hour < 0 || hour > 23) return;
        Atomics.add(stats, 5 + hour, 1);
    },

    initialize: (count: number) => {
        Atomics.store(stats, 0, count);
    },

    getStats: () => {
        return {
            totalLogs: Atomics.load(stats, 0),
            totalThreats: Atomics.load(stats, 1),
            severity: {
                info: Atomics.load(stats, 2),
                warning: Atomics.load(stats, 3),
                critical: Atomics.load(stats, 4),
            },
            hourly: Array.from(stats.slice(5, 29))
        };
    }
};
