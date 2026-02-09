import { useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useEden, edenClient } from "../../eden"
import { exportToCSV } from "../../utils/csv"

export const SecurityLogMonitor = () => {
    const eden = useEden()
    const queryClient = useQueryClient()
    const [filterSeverity, setFilterSeverity] = useState<string>('ALL')

    const { data: rawLogs, isLoading } = useQuery({
        ...eden.api.logs.history.get.queryOptions(),
        refetchInterval: 1000,
    })

    const logs = useMemo(() => {
        if (!rawLogs) return []
        if (filterSeverity === 'ALL') return rawLogs
        return rawLogs.filter((l: any) => l.severityLevel === filterSeverity)
    }, [rawLogs, filterSeverity])

    const generateMutation = useMutation({
        mutationFn: async (limit: number) => {
            return await edenClient.api.logs.generate.get({ query: { limit: String(limit) } })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: eden.api.logs.history.get.queryKey() })
        }
    })

    const getSeverityColor = (level: string) => {
        switch (level) {
            case 'CRITICAL': return 'border-l-2 border-red-600 bg-red-950/10';
            case 'WARNING': return 'border-l-2 border-amber-600 bg-amber-950/10';
            default: return 'border-l-2 border-transparent';
        }
    }

    const getSeverityBadge = (level: string) => {
        switch (level) {
            case 'CRITICAL': return 'bg-red-600 text-white';
            case 'WARNING': return 'bg-amber-600 text-black';
            default: return 'bg-gray-800 text-gray-400';
        }
    }

    return (
        <div className="box">
            <div className="p-4 border-b border-[#111] flex justify-between items-center bg-gradient-to-r from-black via-[#080808] to-black">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.3em]">Live_Feed</span>
                        <span className="text-xs font-bold text-white mt-1">SECURITY_EVENT_STREAM</span>
                    </div>
                    <select
                        className="bg-black border border-[#222] text-[10px] px-3 py-1.5 rounded-md text-gray-400 font-mono focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer hover:border-gray-700"
                        value={filterSeverity}
                        onChange={(e) => setFilterSeverity(e.target.value)}
                    >
                        <option value="ALL">ALL_SEVERITIES</option>
                        <option value="CRITICAL">CRITICAL_ONLY</option>
                        <option value="WARNING">WARNING_ONLY</option>
                        <option value="INFO">INFO_ONLY</option>
                    </select>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => rawLogs && exportToCSV(rawLogs)}
                        className="btn btn-secondary text-[10px]"
                    >
                        EXPORT_DATA
                    </button>
                    <button
                        onClick={() => generateMutation.mutate(5)}
                        disabled={generateMutation.isPending}
                        className="btn btn-primary text-[10px]"
                    >
                        {generateMutation.isPending ? 'PROCESSING...' : 'GENERATE_TRAFFIC'}
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto min-h-[500px]">
                <table className="w-full text-left">
                    <thead className="sticky top-0 z-10">
                        <tr>
                            <th className="w-24">TIMESTAMP</th>
                            <th className="w-32">EVENT_VECTOR</th>
                            <th className="w-20">METHOD</th>
                            <th>RESOURCE_PATH</th>
                            <th className="w-48">ORIGIN_GEO</th>
                            <th className="w-36">IP_ADDR</th>
                            <th className="text-right w-20">SCORE</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                        {logs?.map((log: any) => (
                            <tr key={log.id} className={`group hover:bg-white/[0.02] transition-colors ${getSeverityColor(log.severityLevel)}`}>
                                <td className="text-gray-500 font-mono text-[10px]">
                                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                                </td>
                                <td>
                                    <div className="flex flex-col">
                                        <span className={`px-2 py-0.5 rounded-[2px] text-[9px] font-bold w-fit mb-1 tracking-wider ${getSeverityBadge(log.severityLevel)}`}>
                                            {log.eventType}
                                        </span>
                                        <span className="text-[9px] text-gray-500 font-mono uppercase truncate max-w-[120px]" title={log.threatVector}>
                                            {log.threatVector || 'NONE'}
                                        </span>
                                    </div>
                                </td>
                                <td className="font-mono text-[10px] font-bold text-indigo-400">
                                    {log.method}
                                </td>
                                <td className="max-w-xs xl:max-w-md">
                                    <div className="font-mono text-[11px] text-gray-300 truncate opacity-80 group-hover:opacity-100 transition-opacity" title={log.path}>
                                        {log.path}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400 font-medium">{log.location?.split(',')[0]}</span>
                                        <span className="text-[10px] text-gray-600 uppercase tracking-tighter">{log.location?.split(',')[1]}</span>
                                    </div>
                                </td>
                                <td className="font-mono text-[11px] text-gray-400">
                                    {log.ipAddress}
                                </td>
                                <td className="text-right">
                                    <span className={`font-mono text-xs font-bold ${log.threatScore > 10 ? 'text-red-500' : 'text-gray-500'}`}>
                                        {log.threatScore?.toFixed(1) || '0.0'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {!logs?.length && !isLoading && (
                            <tr>
                                <td colSpan={7} className="py-32 text-center">
                                    <div className="flex flex-col items-center gap-4 opacity-50">
                                        <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
                                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.5em]">System_Clear: No_Events_Logged</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
