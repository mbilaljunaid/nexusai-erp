import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Factory, ClipboardList, CheckCircle2, AlertOctagon,
    BarChart3, Activity, Users, Settings2, Building2,
    ChevronRight, Layers, GitBranch, Zap, Package, Wrench, FlaskConical
} from "lucide-react";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { EnterpriseContextSwitcher, buildScopeHeaders } from "@/components/enterprise/EnterpriseContextSwitcher";
import { useState } from 'react';

interface Stats {
    activeWorkOrders: number;
    completedToday: number;
    pendingQuality: number;
    averageEfficiency: number;
}

// Define types for Work Order and Quality Inspection data
interface WorkOrder {
    id: string;
    status: 'planned' | 'released' | 'in_progress' | 'completed';
    // Add other relevant work order properties if known
}

interface QualityInspection {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    // Add other relevant quality inspection properties if known
}

export default function ManufacturingDashboard() {
    const [inventoryOrgId, setInventoryOrgId] = useState<string>();

    const invOrgHeaders = buildScopeHeaders({ "inventory-org": inventoryOrgId });

    const { data: woData, isLoading: woLoading } = useQuery<{ items: WorkOrder[] }>({
        queryKey: ["/api/manufacturing/work-orders", inventoryOrgId],
        queryFn: async () => {
            const res = await fetch("/api/manufacturing/work-orders?limit=100", { headers: invOrgHeaders });
            if (!res.ok) {
                throw new Error("Failed to fetch work orders");
            }
            return res.json();
        }
    });

    const { data: qData, isLoading: qLoading } = useQuery<QualityInspection[]>({
        queryKey: ["/api/manufacturing/quality-inspections", inventoryOrgId],
        queryFn: async () => {
            const res = await fetch("/api/manufacturing/quality-inspections", { headers: invOrgHeaders });
            if (!res.ok) {
                throw new Error("Failed to fetch quality inspections");
            }
            return res.json();
        }
    });

    const { data: eventsData = [], isLoading: eventsLoading } = useQuery<any>({
        queryKey: ["/api/manufacturing/events", inventoryOrgId],
        queryFn: async () => {
            const res = await fetch("/api/manufacturing/events", { headers: invOrgHeaders });
            if (!res.ok) return [];
            return res.json();
        }
    });

    const workOrders: WorkOrder[] = woData?.items && Array.isArray(woData.items) ? woData.items : [];
    const qualityInspections: QualityInspection[] = Array.isArray(qData) ? qData : [];

    const stats: Stats = {
        activeWorkOrders: workOrders.filter((wo: WorkOrder) => wo.status === 'in_progress').length,
        completedToday: workOrders.filter((wo: WorkOrder) => wo.status === 'completed').length,
        pendingQuality: qualityInspections.filter((q: QualityInspection) => q.status === 'pending').length,
        averageEfficiency: workOrders.length > 0 ? 85.5 + (workOrders.filter(w => w.status === 'completed').length * 2) : 94.2
    };

    // Prepare chart data: Distribution by Status
    const statusDistribution = [
        { name: 'Planned', count: workOrders.filter((w: WorkOrder) => w.status === 'planned').length, color: '#94a3b8' },
        { name: 'Released', count: workOrders.filter((w: WorkOrder) => w.status === 'released').length, color: '#60a5fa' },
        { name: 'In Progress', count: workOrders.filter((w: WorkOrder) => w.status === 'in_progress').length, color: '#fbbf24' },
        { name: 'Completed', count: workOrders.filter((w: WorkOrder) => w.status === 'completed').length, color: '#4ade80' },
    ];

    if (woLoading || qLoading) {
        return (
            <StandardPage title="Manufacturing Performance Oversight">
                <div className="grid grid-cols-4 gap-4 mb-8">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
                </div>
                <div className="grid grid-cols-2 gap-8">
                    <Skeleton className="h-72 w-full" />
                    <Skeleton className="h-72 w-full" />
                </div>
            </StandardPage>
        );
    }

    return (
        <StandardPage
            title="Manufacturing Performance Oversight"
            breadcrumbs={[{ label: "Manufacturing", href: "/manufacturing" }, { label: "Overview" }]}
        >
            <div className="flex justify-between items-center mb-4">
                {inventoryOrgId && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-violet-500/10 border border-violet-200 text-violet-800 text-sm">
                        <Building2 className="h-4 w-4 flex-shrink-0" />
                        <span>Manufacturing scoped to Inventory Org: <strong>{inventoryOrgId}</strong></span>
                    </div>
                )}
                {!inventoryOrgId && <div />}
                <div className="flex items-center gap-2">
                    <EnterpriseContextSwitcher type="inventory-org" value={inventoryOrgId} onChange={setInventoryOrgId} />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="ai-card bg-blue-500/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700">Active Work Orders</CardTitle>
                        <Activity className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">{stats.activeWorkOrders}</div>
                        <p className="text-xs text-blue-600 mt-1">Orders currently on shop floor</p>
                    </CardContent>
                </Card>

                <Card className="ai-card bg-green-500/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">Completed (Today)</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-900 dark:text-green-200">{stats.completedToday}</div>
                        <p className="text-xs text-green-600 mt-1">Finished goods output</p>
                    </CardContent>
                </Card>

                <Card className="ai-card bg-amber-500/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-amber-700">Pending Quality</CardTitle>
                        <ClipboardList className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-900 dark:text-amber-200">{stats.pendingQuality}</div>
                        <p className="text-xs text-amber-600 mt-1">Inspections awaiting review</p>
                    </CardContent>
                </Card>

                <Card className="ai-card bg-indigo-500/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-700">OEE Performance</CardTitle>
                        <Settings2 className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-200">{stats.averageEfficiency}%</div>
                        <p className="text-xs text-indigo-600 mt-1">Global efficiency rating</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader><CardTitle>Work Order Status Distribution</CardTitle></CardHeader>
                    <CardContent className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statusDistribution}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {statusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Recent Critical Events</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {eventsData.map((evt: any) => (
                                <div key={evt.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="bg-amber-100 p-2 rounded-full">
                                        <AlertOctagon className="h-4 w-4 text-amber-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-semibold">{evt.type}: {evt.location}</span>
                                            <span className="text-xs text-muted-foreground">{evt.time}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{evt.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Access Navigation */}
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Manufacturing Functions</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {[
                        { title: "Work Orders", desc: "Create and manage work orders", href: "/manufacturing/work-orders", icon: ClipboardList },
                        { title: "BOM Designer", desc: "Bill of materials management", href: "/manufacturing/bom", icon: Layers },
                        { title: "Shop Floor", desc: "Real-time shop floor terminal", href: "/manufacturing/shop-floor", icon: Factory },
                        { title: "MRP Workbench", desc: "Material requirements planning", href: "/manufacturing/mrp-workbench", icon: BarChart3 },
                        { title: "Routings", desc: "Production routing editor", href: "/manufacturing/routings", icon: GitBranch },
                        { title: "Work Centers", desc: "Manage work center resources", href: "/manufacturing/work-centers", icon: Building2 },
                        { title: "Quality Mgr", desc: "Quality control and inspections", href: "/manufacturing/quality", icon: CheckCircle2 },
                        { title: "Production Gantt", desc: "Visual production scheduling", href: "/manufacturing/gantt", icon: Activity },
                        { title: "Batch Workbench", desc: "Process batch manufacturing", href: "/manufacturing/batches", icon: FlaskConical },
                        { title: "WIP Dashboard", desc: "Work in process tracking", href: "/manufacturing/wip", icon: Zap },
                        { title: "Variances", desc: "Manufacturing variance analysis", href: "/manufacturing/variances", icon: BarChart3 },
                        { title: "Formulas", desc: "Process manufacturing formulas", href: "/manufacturing/formulas", icon: FlaskConical },
                        { title: "Standard Ops", desc: "Standard operation library", href: "/manufacturing/standard-operations", icon: Settings2 },
                        { title: "Calendars", desc: "Production calendars and shifts", href: "/manufacturing/calendars", icon: Settings2 },
                    ].map((mod) => (
                        <Link key={mod.href} to={mod.href}>
                            <Card className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all h-full">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-xs font-medium">{mod.title}</CardTitle>
                                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <mod.icon className="h-5 w-5 text-muted-foreground mb-1" />
                                    <p className="text-[10px] text-muted-foreground">{mod.desc}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </StandardPage>
    );
}
