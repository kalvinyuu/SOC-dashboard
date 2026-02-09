import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useEden } from "../../eden"
import UplotReact from "uplot-react"
import type { AlignedData } from "uplot"

export const SecurityMetricChart = () => {
    const eden = useEden()
    const { data: rawLogs } = useQuery({
        ...eden.api.logs.history.get.queryOptions(),
        refetchInterval: 2000,
    })

    const chartData = useMemo(() => {
        if (!rawLogs || rawLogs.length === 0) return [
            [Date.now() / 1000],
            [0],
            [0],
            [0],
            [0]
        ] as AlignedData

        const sortedLogs = [...rawLogs].sort((a: any, b: any) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )

        const timestamps = sortedLogs.map(l => new Date(l.timestamp).getTime() / 1000)
        const entropy = sortedLogs.map(l => l.shannonEntropy)
        const threatScores = sortedLogs.map(l => l.threatScore || 0)
        const criticals = sortedLogs.map(l => l.severityLevel === 'CRITICAL' ? 10 : 0)
        const warnings = sortedLogs.map(l => l.severityLevel === 'WARNING' ? 5 : 0)

        return [timestamps, entropy, threatScores, criticals, warnings] as AlignedData
    }, [rawLogs])

    const options = {
        width: 800,
        height: 250,
        id: "metric-chart",
        class: "main-chart",
        series: [
            {},
            {
                label: "Entropy",
                stroke: "#6366f1",
                width: 2,
                fill: "rgba(99, 102, 241, 0.05)",
                points: { show: false }
            },
            {
                label: "Threat Score",
                stroke: "#f59e0b",
                width: 3,
                fill: "rgba(245, 158, 11, 0.1)",
                points: { show: false }
            },
            {
                label: "Critical Alerts",
                stroke: "#ef4444",
                width: 1,
                fill: "rgba(239, 68, 68, 0.3)",
                paths: (u: any, sidx: number, i0: number, i1: number) => {
                    const { ctx } = u;
                    const s = u.series[sidx];
                    const xdata = u.data[0];
                    const ydata = u.data[sidx];
                    ctx.fillStyle = s.fill;
                    for (let i = i0; i <= i1; i++) {
                        if (ydata[i] > 0) {
                            const x = u.valToPos(xdata[i], 'x', true);
                            const y = u.valToPos(ydata[i], 'y', true);
                            const zero = u.valToPos(0, 'y', true);
                            ctx.fillRect(x - 2, y, 4, zero - y);
                        }
                    }
                    return null;
                }
            },
            {
                label: "Warnings",
                stroke: "#eab308",
                width: 1,
                fill: "rgba(234, 179, 8, 0.2)",
                paths: (u: any, sidx: number, i0: number, i1: number) => {
                    const { ctx } = u;
                    const s = u.series[sidx];
                    const xdata = u.data[0];
                    const ydata = u.data[sidx];
                    ctx.fillStyle = s.fill;
                    for (let i = i0; i <= i1; i++) {
                        if (ydata[i] > 0) {
                            const x = u.valToPos(xdata[i], 'x', true);
                            const y = u.valToPos(ydata[i], 'y', true);
                            const zero = u.valToPos(0, 'y', true);
                            ctx.fillRect(x - 1, y, 2, zero - y);
                        }
                    }
                    return null;
                }
            }
        ],
        axes: [
            {
                show: true,
                stroke: "#333",
                grid: { show: true, stroke: "#111" },
                font: "9px JetBrains Mono, monospace",
                values: (u: any, vals: any[]) => vals.map(v => new Date(v * 1000).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })),
            },
            {
                stroke: "#333",
                grid: { show: true, stroke: "#111" },
                font: "9px JetBrains Mono, monospace",
                size: 40,
            }
        ],
        cursor: {
            show: true,
            points: { show: false },
            drag: { setScale: false }
        },
        legend: { show: false }
    }

    return (
        <div className="box overflow-hidden">
            <div className="p-4 border-b border-[#111] bg-gradient-to-r from-black via-[#080808] to-black">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.4em]">Integrated_Signal_Logic</span>
                        <h2 className="text-sm font-bold text-white mt-1 tracking-tight">THREAT_VECTOR_ANALYTICS</h2>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-1 bg-indigo-950/20 border border-indigo-900/30 rounded-md shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_indigo]" />
                        <span className="text-[9px] text-indigo-400 font-mono font-bold uppercase tracking-widest">Global_Sync: Passive</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-10 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3 group">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-[0.15em]">Entropy_Signal</span>
                    </div>
                    <div className="flex items-center gap-3 group">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-[0.15em]">Threat_Score</span>
                    </div>
                    <div className="flex items-center gap-3 group">
                        <span className="w-1.5 h-5 bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.4)] group-hover:scale-x-125 transition-transform" />
                        <span className="text-[10px] font-mono text-red-500 font-bold uppercase tracking-[0.15em]">Critical_Alrt</span>
                    </div>
                    <div className="flex items-center gap-3 group">
                        <span className="w-1.5 h-5 bg-amber-500 shadow-[0_0_8px_rgba(234,179,8,0.4)] group-hover:scale-x-125 transition-transform" />
                        <span className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-[0.15em]">Warn_Event</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row">
                <div className="p-6 flex-1 flex justify-center border-b xl:border-b-0 xl:border-r border-white/5 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.02)_0%,transparent_70%)]">
                    <UplotReact options={options} data={chartData} />
                </div>

                <div className="w-full xl:w-96 p-8 bg-[#040404] flex flex-col">
                    <div className="mb-8 pb-4 border-b border-white/5">
                        <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-[0.4em]">Metric_Guide</span>
                        <h4 className="text-xs font-bold text-white uppercase mt-1">TELEMETRY_INDEX</h4>
                    </div>

                    <div className="space-y-8 flex-1">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_indigo]" />
                                <h5 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Shannon Entropy</h5>
                            </div>
                            <p className="text-[11px] text-gray-500 leading-relaxed font-normal pl-4">
                                Payload complexity analysis (0-8 bits). Identifying anomalies:
                            </p>
                            <ul className="text-[10px] text-gray-400 leading-relaxed pl-8 space-y-2">
                                <li className="flex gap-2">
                                    <span className="text-indigo-600 opacity-50 font-bold">//</span>
                                    <span><strong className="text-gray-300">C2 Tun:</strong> Encrypted botnet traffic</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-indigo-600 opacity-50 font-bold">//</span>
                                    <span><strong className="text-gray-300">Exfil:</strong> High-randomness data leakage</span>
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_amber]" />
                                <h5 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Threat Score</h5>
                            </div>
                            <p className="text-[11px] text-gray-500 leading-relaxed pl-4">
                                Heuristic aggression index based on traversal patterns and origin reputation.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="w-1 h-4 bg-red-600 shadow-[0_0_8px_red]" />
                                <h5 className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Alert Logic</h5>
                            </div>
                            <p className="text-[11px] text-gray-500 leading-relaxed pl-4">
                                Temporal slices indicating firewall drops and signature-based blocking events.
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-white/5">
                        <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.02] border border-white/5 rounded-lg">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-flicker" />
                            <span className="text-[9px] text-gray-600 font-mono uppercase tracking-[0.2em]">Core_Analysis: Nom_Stable</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
