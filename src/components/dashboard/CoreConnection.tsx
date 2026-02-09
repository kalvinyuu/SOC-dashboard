import { useQuery } from "@tanstack/react-query"
import { useEden } from "../../eden"

const UserList = () => {
    const eden = useEden()
    const { data, isLoading, error } = useQuery(eden.users.get.queryOptions())

    if (isLoading)
        return <div className="text-[10px] text-gray-500 font-mono animate-pulse">Synchronizing_Users...</div>
    if (error) {
        const message =
            typeof error.value === "object" &&
                error.value !== null &&
                "message" in error.value
                ? String(error.value.message)
                : String(error.value)
        return (
            <div className="text-[10px] text-red-500 font-mono">
                Error_Link_Failed: {message}
            </div>
        )
    }

    return (
        <ul className="space-y-1">
            {data?.map((user) => (
                <li key={user.id} className="text-xs text-gray-400 flex items-center gap-2 group cursor-default">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                    {user.name}
                </li>
            ))}
        </ul>
    )
}

const HelloMessage = () => {
    const eden = useEden()
    const { data, isLoading } = useQuery(eden.hello.get.queryOptions())

    if (isLoading) return <span className="text-[10px] text-gray-500 animate-pulse font-mono flex items-center gap-2"><span className="w-1.5 h-1.5 bg-indigo-500/50 rounded-full" /> Pinging_Core...</span>
    return <span className="text-[10px] text-indigo-400 font-mono flex items-center gap-2"><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" /> {data?.message}</span>
}

export const CoreConnection = () => {
    return (
        <div className="box p-6 min-h-[140px] flex flex-col justify-between group hover:border-indigo-500/30 transition-all">
            <div>
                <div className="text-[9px] font-bold text-gray-600 mb-4 uppercase tracking-[0.4em]">Core_Connection</div>
                <div className="space-y-4">
                    <HelloMessage />
                    <UserList />
                </div>
            </div>
            <div className="pt-4 text-[8px] text-gray-700 font-mono uppercase tracking-[0.1em] text-center opacity-0 group-hover:opacity-50 transition-opacity">
                Secured_by_Elysia_v1.4
            </div>
        </div>
    )
}
