import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    QrCode,
    Package,
    Truck,
    RefreshCcw,
    CheckCircle2,
    AlertTriangle,
    ChevronRight,
    ChevronLeft,
    Search,
    Hash
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardPage } from "@/components/layout/StandardPage";


export default function MobileWarehouse() {
    const { toast } = useToast();
    const [view, setView] = useState<"menu" | "picking" | "receiving" | "counting">("menu");
    const [scanInput, setScanInput] = useState("");
    const [activeTask, setActiveTask] = useState<any>(null);

    const { data: tasksData = { data: [] } } = useQuery<any>({
        queryKey: ["/api/scm/wms/tasks", "WH-001"],
        queryFn: async () => {
            const res = await fetch("/api/scm/wms/tasks?warehouseId=WH-001&status=PENDING");
            return res.json();
        }
    });

    const confirmPickMutation = useMutation({
        mutationFn: async ({ taskId, qty }: { taskId: string, qty: number }) => {
            return await apiRequest("POST", `/ api / scm / wms / tasks / ${taskId}/complete`, {
                actualQuantity: qty,
                userId: "mobile_user_01"
            });
        },
        onSuccess: () => {
            toast({ title: "Task Completed" });
            setActiveTask(null);
            queryClient.invalidateQueries({ queryKey: ["/api/scm/wms/tasks"] });
        }
    });

    if (view === "menu") {
        return (
            <StandardPage title="{title}">
                <Header title="WMS Mobile" />

                <div className="grid grid-cols-1 gap-4">
                    <MenuButton
                        icon={Package}
                        label="Picking"
                        color="bg-blue-600"
                        onClick={() => setView("picking")}
                        count={tasksData.data.filter((t: any) => t.taskType === 'PICK').length}
                    />
                    <MenuButton
                        icon={Truck}
                        label="Receiving"
                        color="bg-green-600"
                        onClick={() => setView("receiving")}
                    />
                    <MenuButton
                        icon={Hash}
                        label="Counting"
                        color="bg-purple-600"
                        onClick={() => setView("counting")}
                    />
                </div>

                <div className="mt-8">
                    <Button variant="outline" className="w-full border-slate-800 text-slate-400 py-6">
                        <RefreshCcw className="w-4 h-4 mr-2" /> Daily Inventory Summary
                    </Button>
                </div>
            </StandardPage>
        );
    }

    if (view === "picking" && !activeTask) {
        const pickTasks = tasksData.data.filter((t: any) => t.taskType === 'PICK');

        return (
            <div className="min-h-screen bg-slate-950 p-4 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <Button variant="ghost" onClick={() => setView("menu")} className="text-white">
                        <ChevronLeft className="w-6 h-6 mr-1" /> Menu
                    </Button>
                    <StatusBadge status="info" label="Picking Queue" />
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                    {pickTasks.map((task: any) => (
                        <Card
                            key={task.id}
                            className="bg-slate-900 border-slate-800 active:scale-95 transition-transform"
                            onClick={() => setActiveTask(task)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                        >
                            <CardContent className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase">{task.taskNumber}</p>
                                    <h3 className="text-lg font-bold text-white mt-1">{task.itemId}</h3>
                                    <p className="text-sm text-blue-400 font-mono mt-1">Loc: A-04-12-01</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-white">{task.quantityPlanned}</p>
                                    <span className="text-xs text-slate-500">{task.uom}</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-700 ml-4" />
                            </CardContent>
                        </Card>
                    ))}
                    {pickTasks.length === 0 && (
                        <div className="text-center py-20 text-slate-500">
                            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No picking tasks available</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (activeTask) {
        return (
            <div className="min-h-screen bg-slate-950 p-4 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <Button variant="ghost" onClick={() => setActiveTask(null)} className="text-white">
                        <ChevronLeft className="w-6 h-6 mr-1" /> Back
                    </Button>
                    <StatusBadge status="warning" label={`Executing ${activeTask.taskType}`} />
                </div>

                <div className="space-y-6 flex-1">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Source Locator</p>
                                    <p className="text-3xl font-mono font-bold text-blue-400">A-04-12-01</p>
                                </div>
                                <div className="p-3 bg-blue-500/10 rounded-lg">
                                    <QrCode className="w-8 h-8 text-blue-400" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Item to Pick</p>
                                <h2 className="text-2xl font-bold text-white">{activeTask.itemId}</h2>
                                <p className="text-sm text-slate-400">Premium Industrial Component X-9</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-slate-900 border-slate-800">
                                <CardContent className="p-4 text-center">
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Planned</p>
                                    <p className="text-3xl font-bold text-white">{activeTask.quantityPlanned}</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-blue-600/10 border-blue-600/50">
                                <CardContent className="p-4 text-center">
                                    <p className="text-xs text-blue-400 uppercase font-bold mb-1">Actual</p>
                                    <Input
                                        type="number"
                                        aria-label="Actual quantity to pick"
                                        className="text-3xl font-bold text-white bg-transparent border-0 w-full text-center outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                        defaultValue={activeTask.quantityPlanned}
                                        id="qty-input"
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        <div className="relative">
                            <QrCode className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <Input
                                placeholder="Scan Barcode / Locator"
                                className="pl-12 py-8 bg-slate-900 border-slate-700 text-lg font-mono focus:border-blue-500"
                                value={scanInput}
                                onChange={(e) => setScanInput(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                    <Button variant="outline" className="border-slate-800 bg-slate-900 text-slate-400 h-16">
                        <AlertTriangle className="w-4 h-4 mr-2" /> Problem
                    </Button>
                    <Button
                        className="bg-green-600 hover:bg-green-500 text-white h-16 font-bold text-lg"
                        onClick={() => confirmPickMutation.mutate({ taskId: activeTask.id, qty: Number((document.getElementById('qty-input') as HTMLInputElement).value || 0) })}
                    >
                        Confirm Pick
                    </Button>
                </div>
            </div>
        );
    }

    return null;
}

function Header({ title }: { title: string }) {
    return (
        <div className="flex items-center justify-between py-2 mb-2">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                </div>

            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-slate-500 font-mono">LINK-UP 01</span>
            </div>
        </div>
    );
}

function MenuButton({ icon: Icon, label, color, onClick, count }: any) {
    return (
        <Button
            onClick={onClick}
            className={`flex items-center justify-start gap-4 h-24 w-full ${color} hover:opacity-90 transition-opacity p-6 rounded-xl border-none relative overflow-hidden group`}
        >
            <div className="p-3 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                <Icon className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
                <span className="text-xl font-bold text-white block leading-tight">{label}</span>
                <span className="text-xs text-white/70">WMS Execution v1.4</span>
            </div>
            {count !== undefined && (
                <div className="absolute top-4 right-4 bg-white text-blue-600 px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                    {count}
                </div>
            )}
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:scale-125 transition-transform">
                <Icon className="w-32 h-32 text-white" />
            </div>
        </Button>
    );
}
