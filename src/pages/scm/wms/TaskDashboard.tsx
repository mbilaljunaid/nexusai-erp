
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    ClipboardList,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    AlertCircle,
    Package,
    ArrowRight
} from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";

export default function TaskDashboard() {
    const { data: tasksData = { data: [] }, isLoading } = useQuery({
        queryKey: ["/api/scm/wms/tasks"],
        queryFn: async () => {
            const res = await fetch("/api/scm/wms/tasks?warehouseId=WH-001");
            return res.json();
        }
    });

    const tasks = tasksData.data;

    const stats = [
        { label: 'Pending', count: tasks.filter((t: any) => t.status === 'PENDING').length, color: 'text-blue-400', icon: Clock },
        { label: 'In Progress', count: tasks.filter((t: any) => t.status === 'IN_PROGRESS').length, color: 'text-orange-400', icon: Package },
        { label: 'Completed', count: tasks.filter((t: any) => t.status === 'COMPLETED').length, color: 'text-green-400', icon: CheckCircle2 },
        { label: 'Problem', count: 0, color: 'text-red-400', icon: AlertCircle },
    ];

    return (
        <StandardPage
            title="Task Console"
            description="Monitor and manage real-time warehouse execution tasks."
        >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => (
                    <Card key={stat.label} className="bg-slate-900/50 border-slate-800">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{stat.label}</p>
                                <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.count}</p>
                            </div>
                            <stat.icon className={`w-8 h-8 opacity-20 ${stat.color}`} />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Active Task Queue</CardTitle>
                        <CardDescription>Live views of picking, putaway, and counting tasks</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <Input placeholder="Search tasks..." className="pl-9 w-64 bg-slate-950 border-slate-800" />
                        </div>
                        <Button variant="outline" className="border-slate-800 bg-slate-950">
                            <Filter className="w-4 h-4 mr-2" /> Filter
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border border-slate-800 rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-950 text-slate-400 font-medium border-b border-slate-800">
                                <tr>
                                    <th className="p-4">Task #</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Priority</th>
                                    <th className="p-4">Assigned To</th>
                                    <th className="p-4">Location</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {tasks.map((task: any) => (
                                    <tr key={task.id} className="hover:bg-blue-500/5 transition-colors group">
                                        <td className="p-4 font-mono text-blue-400">{task.taskNumber}</td>
                                        <td className="p-4">
                                            <Badge variant="outline" className="text-[10px] uppercase">{task.taskType}</Badge>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${task.status === 'COMPLETED' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`} />
                                                <span className="text-white capitalize">{task.status.toLowerCase().replace('_', ' ')}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-slate-400">{task.priority}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-white">{task.assignedUserId || 'Unassigned'}</span>
                                        </td>
                                        <td className="p-4 text-slate-400 font-mono text-xs">A-04-12-01</td>
                                        <td className="p-4 text-right">
                                            <Button variant="ghost" size="sm" className="hover:bg-blue-500/20 text-blue-400">
                                                Details <ArrowRight className="w-3 h-3 ml-1" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {tasks.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="p-12 text-center text-slate-500 italic">No tasks in the active queue</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
