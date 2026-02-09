import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { EdenProvider, edenClient } from "./eden"

// Dashboard Components
import { Header } from "./components/dashboard/Header"
import { SecurityMetricChart } from "./components/dashboard/SecurityMetricChart"
import { SecurityLogMonitor } from "./components/dashboard/SecurityLogMonitor"
import { SystemHealthGauge } from "./components/dashboard/SystemHealthGauge"
import { ScraperWatchlist } from "./components/dashboard/ScraperWatchlist"
import { NetworkMetrics } from "./components/dashboard/NetworkMetrics"
import { CoreConnection } from "./components/dashboard/CoreConnection"

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
})

export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<EdenProvider client={edenClient} queryClient={queryClient}>
				<div className="min-h-screen bg-[#020202] text-white p-6 md:p-10 lg:p-16 relative overflow-hidden">
					{/* Background Decor */}
					<div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
						<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[150px] rounded-full" />
						<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/10 blur-[150px] rounded-full" />
						<div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
					</div>

					<div className="max-w-7xl mx-auto space-y-12 relative z-10">
						<Header />

						<div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
							<div className="lg:col-span-3 space-y-10">
								<SecurityMetricChart />
								<SecurityLogMonitor />
							</div>

							<div className="space-y-8">
								<SystemHealthGauge />
								<ScraperWatchlist />
								<NetworkMetrics />
								<CoreConnection />
							</div>
						</div>

						<footer className="text-[9px] text-gray-700 py-12 border-t border-white/5 text-center uppercase tracking-[0.5em] font-mono">
							Authorized_Access_Only // (c) 2026_CyberIntel_Group // Production_Node: {Math.random().toString(16).substring(2, 6).toUpperCase()}
						</footer>
					</div>
				</div>
			</EdenProvider>
		</QueryClientProvider>
	)
}
