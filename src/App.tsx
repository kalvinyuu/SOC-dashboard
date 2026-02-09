import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { EdenProvider, edenClient, useEden } from "./eden"
import UplotReact from "uplot-react"
import type { AlignedData } from "uplot"
import { useMemo, useState } from "react"

const queryClient = new QueryClient()

const exportToCSV = (logs: any[]) => {
	const headers = ["Timestamp", "Method", "Path", "IP Address", "Location", "Severity", "Threat Vector", "Threat Score", "Entropy"];
	const rows = logs.map(log => [
		new Date(log.timestamp).toISOString(),
		log.method,
		log.path,
		log.ipAddress,
		log.location,
		log.severityLevel,
		log.threatVector || 'NONE',
		log.threatScore || 0,
		log.shannonEntropy
	]);

	const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
	const blob = new Blob([csvContent], { type: 'text/csv' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `security_logs_${new Date().getTime()}.csv`;
	a.click();
};

function UserList() {
	const eden = useEden()
	const { data, isLoading, error } = useQuery(eden.users.get.queryOptions())

	if (isLoading)
		return <div>Loading users...</div>
	if (error) {
		const message =
			typeof error.value === "object" &&
				error.value !== null &&
				"message" in error.value
				? String(error.value.message)
				: String(error.value)
		return (
			<div>
				Error ({error.status}): {message}
			</div>
		)
	}

	return (
		<ul>
			{data?.map((user) => (
				<li key={user.id}>{user.name}</li>
			))}
		</ul>
	)
}

function HelloMessage() {
	const eden = useEden()
	const { data, isLoading } = useQuery(eden.hello.get.queryOptions())

	if (isLoading) return <span>Loading...</span>
	return <span>{data?.message}</span>
}

function SecurityLogMonitor() {
	const eden = useEden()
	const queryClient = useQueryClient()
	const [filterSeverity, setFilterSeverity] = useState<string>('ALL')

	const { data: rawLogs, isLoading } = useQuery({
		...eden.api.logs.history.get.queryOptions(),
		refetchInterval: 5000,
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
			case 'CRITICAL': return 'border-l-4 border-red-600 bg-red-950/20';
			case 'WARNING': return 'border-l-4 border-yellow-600 bg-yellow-950/20';
			default: return 'border-l-4 border-transparent';
		}
	}

	const getSeverityBadge = (level: string) => {
		switch (level) {
			case 'CRITICAL': return 'bg-red-600 text-white';
			case 'WARNING': return 'bg-yellow-600 text-black';
			default: return 'bg-gray-800 text-gray-400';
		}
	}

	return (
		<div className="box">
			<div className="box-header flex justify-between items-center flex-wrap gap-4">
				<div className="flex items-center gap-4">
					<span className="font-bold tracking-widest text-xs">LIVE_FEED</span>
					<select
						className="bg-black border border-[#222] text-[10px] px-2 py-1 rounded"
						value={filterSeverity}
						onChange={(e) => setFilterSeverity(e.target.value)}
					>
						<option value="ALL">ALL SEVERITIES</option>
						<option value="CRITICAL">CRITICAL ONLY</option>
						<option value="WARNING">WARNING ONLY</option>
						<option value="INFO">INFO ONLY</option>
					</select>
				</div>
				<div className="flex gap-2">
					<button
						onClick={() => rawLogs && exportToCSV(rawLogs)}
						className="btn btn-secondary border border-[#333] hover:bg-[#111]"
					>
						EXPORT CSV
					</button>
					<button
						onClick={() => generateMutation.mutate(5)}
						disabled={generateMutation.isPending}
						className="btn btn-primary"
					>
						{generateMutation.isPending ? '...' : 'GENERATE 5'}
					</button>
				</div>
			</div>

			<div className="overflow-x-auto min-h-[400px] bg-black">
				<table className="w-full text-left text-[11px]">
					<thead className="bg-[#050505] border-b border-[#111]">
						<tr>
							<th className="p-3">Time</th>
							<th>Event / Threat Vector</th>
							<th>Origin / Path</th>
							<th>IP Address</th>
							<th className="text-right p-3">Score</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-[#111]">
						{logs?.map((log: any) => (
							<tr key={log.correlationId} className={`hover:bg-white/5 transition-colors ${getSeverityColor(log.severityLevel)}`}>
								<td className="p-3 text-gray-500 font-mono">
									{new Date(log.timestamp).toLocaleTimeString()}
								</td>
								<td>
									<div className="flex flex-col">
										<span className={`px-1.5 py-0.5 rounded-[2px] text-[9px] font-bold w-fit mb-1 ${getSeverityBadge(log.severityLevel)}`}>
											{log.eventType}
										</span>
										<span className="text-gray-400">{log.threatVector || 'NONE'}</span>
									</div>
								</td>
								<td>
									<div className="flex flex-col">
										<span className="text-white font-bold">{log.method} <span className="text-gray-500 font-normal">{log.path}</span></span>
										<span className="text-[10px] text-gray-600">{log.location}</span>
									</div>
								</td>
								<td>
									<span className="font-mono text-gray-400">{log.ipAddress}</span>
								</td>
								<td className="text-right p-3">
									<span className={`font-bold ${log.threatScore > 10 ? 'text-red-500' : 'text-gray-500'}`}>
										{log.threatScore?.toFixed(1) || '0.0'}
									</span>
								</td>
							</tr>
						))}
						{!logs?.length && !isLoading && (
							<tr>
								<td colSpan={5} className="py-24 text-center text-gray-600 font-bold uppercase tracking-[0.2em]">NO DATA FOUND</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}

function TotalLogCount() {
	const eden = useEden()
	const { data } = useQuery({
		...eden.api.stats.get.queryOptions(),
		refetchInterval: 1000,
	})
	return <span>{data?.totalLogs.toLocaleString() ?? '0'}</span>
}

function SystemHealthGauge() {
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
		if (h > 80) return 'text-green-500'
		if (h > 50) return 'text-yellow-500'
		return 'text-red-500'
	}

	return (
		<div className="box p-6 bg-[#050505]">
			<div className="text-xs font-bold text-gray-500 mb-6 uppercase tracking-wider">System Health</div>
			<div className="flex flex-col items-center">
				<div className={`text-4xl font-bold font-mono ${getColor(health)}`}>
					{Math.round(health)}%
				</div>
				<div className="w-full bg-gray-900 h-1 mt-4 rounded-full overflow-hidden">
					<div
						className={`h-full transition-all duration-1000 ${health > 80 ? 'bg-green-500' : health > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
						style={{ width: `${health}%` }}
					/>
				</div>
				<span className="text-[10px] text-gray-600 mt-2 uppercase">Integrity Index</span>
			</div>
		</div>
	)
}

function ScraperWatchlist() {
	const eden = useEden()
	const { data: scrapers, isLoading } = useQuery({
		...eden.api.logs.scrapers.get.queryOptions(),
		refetchInterval: 10000,
	})

	return (
		<div className="box p-6 bg-[#050505]">
			<div className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider flex justify-between">
				<span>Scraper Watchlist</span>
				{isLoading && <span className="animate-pulse">SCANNING...</span>}
			</div>
			<div className="space-y-3">
				{scrapers?.map((scraper: any) => (
					<div key={scraper.ipAddress} className="border-b border-[#111] pb-2 last:border-0">
						<div className="flex justify-between items-baseline">
							<span className="font-mono text-[10px] text-yellow-500">{scraper.ipAddress}</span>
							<span className="text-[9px] font-bold text-gray-400">{scraper.requestCount} REQS</span>
						</div>
						<div className="text-[9px] text-gray-600 truncate" title={scraper.userAgent}>
							{scraper.userAgent}
						</div>
					</div>
				))}
				{!scrapers?.length && !isLoading && (
					<div className="text-[10px] text-gray-700 py-4 text-center italic">CLEAR_ZONE</div>
				)}
			</div>
		</div>
	)
}

function SecurityMetricChart() {
	const eden = useEden()
	const { data: logs } = useQuery({
		...eden.api.logs.history.get.queryOptions(),
		refetchInterval: 5000,
	})

	const chartData = useMemo(() => {
		if (!logs || logs.length === 0) return [[], [], []] as AlignedData

		// Reverse logs to show chronological order
		const sortedLogs = [...logs].reverse()
		const timestamps = sortedLogs.map(l => new Date(l.timestamp).getTime() / 1000)
		const entropy = sortedLogs.map(l => l.shannonEntropy)
		const severity = sortedLogs.map(l => {
			switch (l.severityLevel) {
				case 'CRITICAL': return 3
				case 'WARNING': return 2
				default: return 1
			}
		})

		return [timestamps, entropy, severity] as AlignedData
	}, [logs])

	const options = {
		width: 800,
		height: 200,
		id: "metric-chart",
		class: "box",
		series: [
			{},
			{
				label: "Entropy",
				stroke: "#fff",
				width: 2,
				points: { show: false }
			},
			{
				label: "Severity",
				stroke: "#dc2626",
				width: 1,
				points: { show: true, size: 4 },
				paths: () => null, // Dots only for severity
			}
		],
		axes: [
			{
				show: false,
			},
			{
				grid: { show: true, stroke: "#111" },
				ticks: { show: false },
				stroke: "#444",
				font: "10px Inter",
			}
		],
		cursor: {
			show: true,
			points: { show: false }
		},
		legend: { show: false }
	}

	return (
		<div className="box bg-black p-4">
			<div className="text-[10px] font-bold text-gray-500 mb-4 uppercase tracking-widest flex justify-between items-center">
				<span>Real-time Security Metrics (Entropy vs Severity)</span>
				<div className="flex gap-4">
					<span className="flex items-center gap-1"><span className="w-2 h-2 bg-white" /> Entropy</span>
					<span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-600" /> Severity</span>
				</div>
			</div>
			<div className="w-full overflow-hidden flex justify-center">
				<UplotReact options={options} data={chartData} />
			</div>
		</div>
	)
}

function StressTestButton() {
	const eden = useEden()
	const queryClient = useQueryClient()
	const stressMutation = useMutation({
		mutationFn: async (count: number) => {
			return await edenClient.api.logs.stress.get({ query: { count: String(count) } })
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: eden.api.logs.history.get.queryKey() })
			queryClient.invalidateQueries({ queryKey: eden.api.stats.get.queryKey() })
		}
	})

	return (
		<button
			onClick={() => stressMutation.mutate(20000)}
			disabled={stressMutation.isPending}
			className="btn btn-danger w-full mt-2"
		>
			{stressMutation.isPending ? 'STRESS TEST RUNNING...' : 'TRIGGER 20K LOG STRESS TEST'}
		</button>
	)
}

export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<EdenProvider client={edenClient} queryClient={queryClient}>
				<div className="min-h-screen bg-black text-white p-6 md:p-12">
					<div className="max-w-7xl mx-auto space-y-8">
						<header className="flex justify-between items-baseline border-b border-[#222] pb-6">
							<h1 className="text-xl font-bold uppercase tracking-widest">Security Admin Dash</h1>
							<div className="text-xs text-gray-500">
								SYS_MODE: <span className="text-white">STABLE</span> |
								LOG_FREQ: <span className="text-white">HIGH</span>
							</div>
						</header>

						<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
							<div className="lg:col-span-3 space-y-8">
								<SecurityMetricChart />
								<SecurityLogMonitor />
							</div>

							<div className="space-y-6">
								<SystemHealthGauge />
								<ScraperWatchlist />

								<div className="box p-6 bg-[#050505]">
									<div className="text-xs font-bold text-gray-500 mb-6 uppercase tracking-wider">Network Metrics</div>

									<div className="space-y-4">
										<div className="flex justify-between border-b border-[#111] pb-2">
											<span className="text-xs text-gray-500">Total Logs</span>
											<span className="text-lg font-bold">
												<TotalLogCount />
											</span>
										</div>

										<div className="flex justify-between border-b border-[#111] pb-2">
											<span className="text-xs text-gray-500">Throughput</span>
											<span className="text-lg font-bold">40K LPS</span>
										</div>

										<div className="pt-2">
											<StressTestButton />
										</div>
									</div>
								</div>

								<div className="box p-6 opacity-30 hover:opacity-100 cursor-default transition-all">
									<div className="text-xs font-bold text-gray-500 mb-4 uppercase">Connected API</div>
									<div className="space-y-4 text-sm">
										<HelloMessage />
										<UserList />
									</div>
								</div>
							</div>
						</div>

						<footer className="text-[10px] text-gray-800 pt-8 border-t border-[#111] text-center uppercase tracking-widest">
							Authorization required for elevated operations.
						</footer>
					</div>
				</div>
			</EdenProvider>
		</QueryClientProvider>
	)
}
