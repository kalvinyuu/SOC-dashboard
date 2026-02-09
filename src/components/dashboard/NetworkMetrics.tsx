import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useEden, edenClient } from "../../eden"

const TotalLogCount = () => {
    const eden = useEden()
    const { data } = useQuery({
        ...eden.api.stats.get.queryOptions(),
        refetchInterval: 1000,
    })
    return <span>{data?.totalLogs.toLocaleString() ?? '0'}</span>
}

const ThroughputMetric = () => {
    const eden = useEden()
    const [lps, setLps] = useState(0)
    const [lastCount, setLastCount] = useState(0)
    const [lastUpdate, setLastUpdate] = useState(Date.now())

    const { data: statsData } = useQuery({
        ...eden.api.stats.get.queryOptions(),
        refetchInterval: 1000,
    })

    useMemo(() => {
        if (statsData) {
            const now = Date.now()
            const elapsed = (now - lastUpdate) / 1000
            if (elapsed >= 1) {
                const diff = statsData.totalLogs - lastCount
                setLps(Math.round(diff / elapsed))
                setLastCount(statsData.totalLogs)
                setLastUpdate(now)
            }
        }
    }, [statsData, lastCount, lastUpdate])

    return <span className="text-lg font-bold font-mono tracking-tighter text-indigo-400">{lps.toLocaleString()}<span className="text-xs ml-1 opacity-50 font-normal">LPS</span></span>
}

const StressTestButton = () => {
    const eden = useEden()
    const queryClient = useQueryClient()
    const [count, setCount] = useState(20000)
    const [mode, setMode] = useState<'single' | 'worker'>('worker')

    const stressMutation = useMutation({
        mutationFn: async ({ count, mode }: { count: number, mode: string }) => {
            return await edenClient.api.logs.stress.get({ query: { count: String(count), mode } })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: eden.api.logs.history.get.queryKey() })
            queryClient.invalidateQueries({ queryKey: eden.api.stats.get.queryKey() })
        }
    })

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                    <label className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Load_Volume</label>
                    <select
                        className="bg-black border border-white/5 text-[10px] p-1.5 rounded font-mono text-gray-400 focus:outline-none focus:border-indigo-500"
                        value={count}
                        onChange={(e) => setCount(Number(e.target.value))}
                    >
                        <option value={5000}>5K_REQS</option>
                        <option value={20000}>20K_REQS</option>
                        <option value={50000}>50K_REQS</option>
                        <option value={100000}>100K_REQS</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Exec_Mode</label>
                    <select
                        className="bg-black border border-white/5 text-[10px] p-1.5 rounded font-mono text-gray-400 focus:outline-none focus:border-indigo-500"
                        value={mode}
                        onChange={(e) => setMode(e.target.value as any)}
                    >
                        <option value="single">SINGLE_CORE</option>
                        <option value="worker">BUN_WORKER</option>
                    </select>
                </div>
            </div>
            <button
                onClick={() => stressMutation.mutate({ count, mode })}
                disabled={stressMutation.isPending}
                className="btn btn-danger w-full"
            >
                {stressMutation.isPending ? 'DEPLOYING_STRESS_LOAD...' : `TRIGGER_${count / 1000}K_LOG_FLOOD`}
            </button>

            <div className="text-[9px] text-gray-600 font-mono leading-tight px-1 italic">
                {mode === 'single'
                    ? "* Sequential execution. Best for predictable, small-scale event logging."
                    : "* Parallel worker pool. Maximizes throughput via non-blocking multi-threaded generation."}
            </div>
        </div>
    )
}

export const NetworkMetrics = () => {
    return (
        <div className="box p-6 bg-gradient-to-b from-[#080808] to-black">
            <div className="flex flex-col gap-1 mb-8">
                <span className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.4em]">Throughput_Metrics</span>
                <h3 className="text-xs font-bold text-white uppercase tracking-tight">TRAFFIC_FLOW_ANLYS</h3>
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-center group px-1">
                    <span className="text-[10px] text-gray-500 font-mono flex items-center gap-2 tracking-wider">
                        <span className="w-1.5 h-1.5 bg-gray-800 rounded-full group-hover:bg-gray-600 transition-colors" /> LOG_RECORDS
                    </span>
                    <span className="text-xl font-bold font-mono text-gray-200">
                        <TotalLogCount />
                    </span>
                </div>

                <div className="flex justify-between items-center group px-1">
                    <span className="text-[10px] text-gray-500 font-mono flex items-center gap-2 tracking-wider">
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse shadow-[0_0_5px_indigo]" /> THRUPUT_LPS
                    </span>
                    <ThroughputMetric />
                </div>

                <div className="pt-4 mt-2">
                    <StressTestButton />
                </div>
            </div>
        </div>
    )
}
