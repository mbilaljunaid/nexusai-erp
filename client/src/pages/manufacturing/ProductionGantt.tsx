import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Factory, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkOrder {
    id: string;
    orderNumber: string;
    productId: string;
    quantity: number;
    status: string;
    scheduledDate?: string;
    workCenterId?: string;
}

interface WorkCenter {
    id: string;
    name: string;
}

export default function ProductionGantt() {
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const endDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data: woData, isLoading: woLoading } = useQuery<{ items: WorkOrder[] }>({
        queryKey: ["/api/manufacturing/work-orders", startDate, endDate],
        queryFn: async () => {
            const res = await fetch(`/api/manufacturing/work-orders?startDate=${startDate}&endDate=${endDate}&limit=500`);
            return res.json();
        }
    });

    const { data: workCenters = [] } = useQuery<WorkCenter[]>({
        queryKey: ["/api/manufacturing/work-centers"],
    });

    const workOrders = woData?.items || [];
    const days = Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d;
    });

    // Optimization: Pre-group orders by WorkCenter and Date to avoid O(N^3) filtering in render loop
    const ordersMap = React.useMemo(() => {
        const map = new Map<string, WorkOrder[]>();
        workOrders.forEach(wo => {
            if (!wo.workCenterId || !wo.scheduledDate) return;
            const dateStr = new Date(wo.scheduledDate).toDateString();
            const key = `${wo.workCenterId}|${dateStr}`;
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(wo);
        });
        return map;
    }, [workOrders]);

    const getOrdersForWCOnDay = (wcId: string, date: Date) => {
        const key = `${wcId}|${date.toDateString()}`;
        return ordersMap.get(key) || [];
    };

    return (
        <StandardPage
            title="Production Schedule (Gantt)"
            breadcrumbs={[{ label: "Manufacturing", href: "/manufacturing" }, { label: "Planning" }, { label: "Schedule" }]}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm"><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm">Today</Button>
                    <Button variant="outline" size="sm"><ChevronRight className="h-4 w-4" /></Button>
                </div>
            }
        >
            <Card className="overflow-hidden border-2">
                <div className="overflow-x-auto">
                    <div className="min-w-[1200px]">
                        {/* Header Row: Dates */}
                        <div className="flex border-b bg-muted/30">
                            <div className="w-64 p-4 border-r font-bold flex items-center gap-2">
                                <Factory className="h-4 w-4 text-primary" /> Work Center
                            </div>
                            <div className="flex-1 flex">
                                {days.map((day, idx) => (
                                    <div key={idx} className="flex-1 p-2 border-r text-center text-xs">
                                        <div className="text-muted-foreground uppercase">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                        <div className="font-bold">{day.getDate()} {day.toLocaleDateString('en-US', { month: 'short' })}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Work Center Rows */}
                        <div className="divide-y">
                            {workCenters.map(wc => (
                                <div key={wc.id} className="flex min-h-[100px] hover:bg-muted/5 transition-colors">
                                    <div className="w-64 p-4 border-r flex flex-col justify-center">
                                        <div className="font-semibold text-gray-900">{wc.name}</div>
                                        <div className="text-xs text-muted-foreground">Capacity: 100%</div>
                                    </div>
                                    <div className="flex-1 flex">
                                        {days.map((day, idx) => {
                                            const dayOrders = getOrdersForWCOnDay(wc.id, day);
                                            return (
                                                <div key={idx} className="flex-1 border-r p-1 relative flex flex-col gap-1">
                                                    {dayOrders.map(wo => (
                                                        <div
                                                            key={wo.id}
                                                            className={`text-[10px] p-1.5 rounded-md shadow-sm border truncate cursor-pointer hover:scale-[1.02] transition-transform
                                                                ${wo.status === 'in_progress' ? 'bg-blue-100 border-blue-200 text-blue-800' : 'bg-green-100 border-green-200 text-green-800'}`}
                                                        >
                                                            <div className="font-bold">{wo.orderNumber}</div>
                                                            <div className="opacity-70">{wo.quantity} Units</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                            {workCenters.length === 0 && (
                                <div className="p-20 text-center text-muted-foreground bg-muted/10">
                                    No work centers defined. Create work centers to view schedule.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            <div className="mt-6 flex gap-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded" /> In Progress
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-3 h-3 bg-green-100 border border-green-200 rounded" /> Planned / Completed
                </div>
            </div>
        </StandardPage>
    );
}
