import { useQuery } from "@tanstack/react-query"
import { useEden } from "../../eden"

export const ScraperWatchlist = () => {
    const eden = useEden()
    const { data: scrapers, isLoading } = useQuery({
        ...eden.api.logs.scrapers.get.queryOptions(),
        refetchInterval: 10000,
    })

    return (
        <div className="box p-5">
            <div className="flex flex-col gap-1 mb-6">
                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-[0.4em]">Signal_Alerts</span>
                <div className="flex justify-between items-baseline">
                    <h3 className="text-xs font-bold text-white uppercase tracking-tight">SCRAPER_NODES</h3>
                    {isLoading && <span className="text-[8px] animate-pulse text-gray-600 font-mono">SCAN_ACTIVE</span>}
                </div>
            </div>
            <div className="space-y-4">
                {scrapers?.map((scraper: any) => (
                    <div key={scraper.ipAddress} className="group border-b border-white/[0.03] pb-3 last:border-0 hover:bg-white/[0.01] transition-colors rounded-sm px-1">
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="font-mono text-[10px] font-bold text-amber-500/90 select-all">{scraper.ipAddress}</span>
                            <span className="text-[9px] font-bold bg-amber-950/20 text-amber-600 px-2 py-0.5 rounded-full border border-amber-900/30">
                                {scraper.requestCount} REQS
                            </span>
                        </div>
                        <div className="text-[9px] text-gray-500 font-mono truncate pl-2 border-l border-amber-900/40 opacity-70 group-hover:opacity-100 transition-opacity" title={scraper.userAgent}>
                            {scraper.userAgent}
                        </div>
                    </div>
                ))}
                {!scrapers?.length && !isLoading && (
                    <div className="flex flex-col items-center py-6 border border-dashed border-white/5 rounded-lg">
                        <span className="text-[9px] text-gray-700 font-mono uppercase tracking-[0.3em] italic">No_Signals_Found</span>
                    </div>
                )}
            </div>
        </div>
    )
}
