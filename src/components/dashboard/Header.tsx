export const Header = () => {
    return (
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/[0.05] pb-10 mb-4 gap-6">
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                        <span className="font-bold text-white tracking-tighter">CS</span>
                    </div>
                    <h1 className="text-2xl font-bold uppercase tracking-[0.4em] bg-gradient-to-r from-white via-white to-gray-600 bg-clip-text text-transparent">
                        CYBER_INTEL
                    </h1>
                </div>
                <div className="flex items-center gap-4 pl-1">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[9px] text-gray-500 font-mono tracking-[0.2em] uppercase">Node: 0x7FF1-A</span>
                    </div>
                    <div className="w-[1px] h-3 bg-white/10" />
                    <span className="text-[9px] text-gray-600 font-mono tracking-[0.2em] uppercase">Region: US_EAST_PROD</span>
                </div>
            </div>
            <div className="flex gap-10 items-center bg-white/[0.02] px-8 py-5 rounded-2xl border border-white/[0.05] backdrop-blur-md shadow-2xl">
                <div className="flex flex-col gap-1.5">
                    <span className="text-[8px] text-gray-600 font-bold uppercase tracking-[0.3em]">Sys_Protocol</span>
                    <span className="text-[11px] font-mono font-bold text-emerald-500 uppercase flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-emerald-500" /> Operational
                    </span>
                </div>
                <div className="w-[1px] h-10 bg-white/10" />
                <div className="flex flex-col gap-1.5">
                    <span className="text-[8px] text-gray-600 font-bold uppercase tracking-[0.3em]">Traffic_Freq</span>
                    <span className="text-[11px] font-mono font-bold text-indigo-400 uppercase">Extreme_Perf</span>
                </div>
            </div>
        </header>
    );
};
