import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useEden } from "../../eden"

export const SystemHealthGauge = () => {
    const eden = useEden()
    const { data: logs } = useQuery({
        ...eden.api.logs.history.get.queryOptions(),
        refetchInterval: 5000,
    })

    const health = useMemo(() => {
        if (!logs || logs.length === 0) return 100
        const avgScore = logs.reduce((acc: number, l: any) => acc + (l.threatScore || 0), 0) / logs.length
        return Math.max(0, 100 - (avgScore * 5))
    }, [logs])

    const getColor = (h: number) => {
        if (h > 80) return 'text-emerald-500'
        if (h > 50) return 'text-amber-500'
        return 'text-red-500'
    }

    return (
        <div className="box p-5 bg-gradient-to-br from-black to-[#050505]">
            <div className="flex flex-col gap-1 mb-6">
                <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-[0.4em]">Integrity_Probe</span>
                <h3 className="text-xs font-bold text-white uppercase tracking-tight">SYSTEM_HEALTH_INDEX</h3>
            </div>
            <div className="flex flex-col items-center py-2 relative">
                {/* Glow effect */}
                <div className={`absolute inset-0 blur-[40px] opacity-10 rounded-full transition-colors duration-1000 ${health > 80 ? 'bg-emerald-500' : health > 50 ? 'bg-amber-500' : 'bg-red-500'}`} />

                <div className={`text-5xl font-bold font-mono tracking-tighter relative z-10 transition-colors duration-1000 ${getColor(health)}`}>
                    {Math.round(health)}<span className="text-lg opacity-40 ml-1">%</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 mt-8 rounded-full overflow-hidden border border-white/5 relative z-10 shadow-inner">
                    <div
                        className={`h-full transition-all duration-1000 ${health > 80 ? 'bg-emerald-500' : health > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${health}%` }}
                    />
                </div>
                <div className="w-full flex justify-between mt-3 px-1">
                    <span className="text-[8px] text-gray-600 font-mono uppercase tracking-widest">Nominal</span>
                    <span className="text-[8px] text-gray-600 font-mono uppercase tracking-widest">Critical</span>
                </div>
            </div>
        </div>
    )
}
