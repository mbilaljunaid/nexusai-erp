
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Calendar, Users, Activity, Building2 } from "lucide-react";
import DispatchConsole from "@/components/maintenance/DispatchConsole";
import PlanningBoard from "@/components/maintenance/PlanningBoard";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import CostAnalysisView from "@/components/maintenance/CostAnalysisView";
import { StandardPage } from "@/components/layout/StandardPage";

import {
    EnterpriseContextSwitcher,
    buildScopeHeaders
} from "@/components/enterprise/EnterpriseContextSwitcher";

export default function MaintenanceWorkbench({ initialTab = "overview" }: { initialTab?: string }) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [activeInvOrgId, setActiveInvOrgId] = useState<string | undefined>(undefined);

    const scopeHeaders = buildScopeHeaders({ "inventory-org": activeInvOrgId });

    // KPI Queries
    const { data: metrics } = useQuery<any>({
        queryKey: ["/api/maintenance/metrics", activeInvOrgId],
        queryFn: async () => {
            const res = await fetch(
                "/api/maintenance/work-orders?limit=1000",
                { headers: { "Content-Type": "application/json", ...scopeHeaders } }
            ).then(r => r.json());
            const workOrders = res.data || [];
            const critical = workOrders.filter((w: any) => w.priority === "URGENT" && w.status !== "COMPLETED").length;
            const backlog = workOrders.filter((w: any) => w.status === "DRAFT" || w.status === "PENDING").length;
            return { critical, backlog, total: workOrders.length };
        }
    });

    return (
        <StandardPage title="Maintenance Command Center">
            <div className="border-b bg-background p-4 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div>

                        <p className="text-muted-foreground">Monitor asset health, dispatch work, and schedule maintenance.</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <EnterpriseContextSwitcher
                            type="inventory-org"
                            value={activeInvOrgId}
                            onChange={setActiveInvOrgId}
                        />
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
                {activeInvOrgId && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-violet-500/10 border border-violet-200 text-violet-800 text-sm w-fit">
                        <Building2 className="h-4 w-4 flex-shrink-0" />
                        <span>Maintenance Execution scoped to Inventory Org: <strong>{activeInvOrgId}</strong></span>
                    </div>
                )}
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={() => setActiveTab("dispatch")}>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                                <CardTitle className="text-sm font-medium">Work Execution</CardTitle>
                                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                            </CardHeader>
                                                            <CardContent>
                                                                <div className="text-2xl font-bold">{metrics?.backlog || 0}</div>
                                                                <p className="text-xs text-muted-foreground">Unassigned Work Orders</p>
                                                            </CardContent>
                                                        </Card>
                            </Button>
                            <Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={() => setActiveTab("planning")}>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                                <CardTitle className="text-sm font-medium">Schedule Adherence</CardTitle>
                                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                            </CardHeader>
                                                            <CardContent>
                                                                <div className="text-2xl font-bold">87%</div>
                                                                <p className="text-xs text-muted-foreground">+2.4% from last week</p>
                                                            </CardContent>
                                                        </Card>
                            </Button>
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

                        {/* Systems Health / Quick Actions */}
                        <div className="mt-6 grid grid-cols-2 gap-6">
                            <Card>
                                <CardHeader><CardTitle>Systems Health</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">HVAC System A</span>
                                            <StatusBadge status="active" label="Healthy" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Conveyor Belt 04</span>
                                            <Badge variant="destructive">Critical Alert</Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Hydraulic Press</span>
                                            <StatusBadge status="warning" label="Warning" />
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
        </StandardPage>
    );
}
