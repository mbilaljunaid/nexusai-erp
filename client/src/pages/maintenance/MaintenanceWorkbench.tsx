
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Calendar, Users, Activity } from "lucide-react";
import DispatchConsole from "@/components/maintenance/DispatchConsole";
import PlanningBoard from "@/components/maintenance/PlanningBoard";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

import CostAnalysisView from "@/components/maintenance/CostAnalysisView";

export default function MaintenanceWorkbench({ initialTab = "overview" }: { initialTab?: string }) {
    const [activeTab, setActiveTab] = useState(initialTab);

    // KPI Queries
    const { data: metrics } = useQuery({
        queryKey: ["/api/maintenance/metrics"],
        queryFn: async () => {
            // Mock metrics for now, replace with real API aggregation if available
            const res = await fetch("/api/maintenance/work-orders?limit=1000").then(r => r.json());
            const workOrders = res.data || [];
            const critical = workOrders.filter((w: any) => w.priority === "URGENT" && w.status !== "COMPLETED").length;
            const backlog = workOrders.filter((w: any) => w.status === "DRAFT" || w.status === "PENDING").length;
            return { critical, backlog, total: workOrders.length };
        }
    });

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-muted/10">
            <div className="border-b bg-background p-4 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Wrench className="h-6 w-6 text-primary" />
                        Maintenance Command Center
                    </h1>
                    <p className="text-muted-foreground">Monitor asset health, dispatch work, and schedule maintenance.</p>
                </div>
                <div className="flex gap-4">
                    {metrics && (
                        <>
                            <Badge variant="destructive" className="flex gap-1">
                                <Activity className="h-3 w-3" /> {metrics.critical} Critical
                            </Badge>
                            <Badge variant="outline" className="flex gap-1">
                                {metrics.backlog} Backlog
                            </Badge>
                        </>
                    )}
                </div>
            </div>

            <div className="flex-1 p-6 overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                    <TabsList className="w-fit mb-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="dispatch">Dispatch Console</TabsTrigger>
                        <TabsTrigger value="planning">Planning Board</TabsTrigger>
                        <TabsTrigger value="financials">Financials</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="flex-1 overflow-auto">
                        {/* Embed the logic from the old CMMSMaintenance page here basically */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab("dispatch")}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Work Execution</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{metrics?.backlog || 0}</div>
                                    <p className="text-xs text-muted-foreground">Unassigned Work Orders</p>
                                </CardContent>
                            </Card>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab("planning")}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Schedule Adherence</CardTitle>
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">87%</div>
                                    <p className="text-xs text-muted-foreground">+2.4% from last week</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Asset Availability</CardTitle>
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">94.2%</div>
                                    <p className="text-xs text-muted-foreground">Total Uptime (MTBF: 340h)</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Alerts / Quick Actions */}
                        <div className="mt-6 grid grid-cols-2 gap-6">
                            <Card>
                                <CardHeader><CardTitle>Systems Health</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">HVAC System A</span>
                                            <Badge className="bg-green-500">Healthy</Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Conveyor Belt 04</span>
                                            <Badge variant="destructive">Critical Alert</Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Hydraulic Press</span>
                                            <Badge className="bg-yellow-500">Warning</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                                <CardContent className="flex flex-col gap-2">
                                    <Button variant="outline" className="justify-start"><Wrench className="mr-2 h-4 w-4" /> Create Emergency WO</Button>
                                    <Button variant="outline" className="justify-start"><Calendar className="mr-2 h-4 w-4" /> Log Downtime Event</Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="dispatch" className="flex-1 mt-0 h-full overflow-hidden">
                        <DispatchConsole />
                    </TabsContent>

                    <TabsContent value="planning" className="flex-1 mt-0 h-full overflow-hidden">
                        <PlanningBoard />
                    </TabsContent>

                    <TabsContent value="financials" className="flex-1 mt-0 h-full overflow-hidden p-6">
                        <CostAnalysisView workOrderId="stub-1" />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
