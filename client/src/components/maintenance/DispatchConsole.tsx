
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Users,
    Briefcase,
    ArrowRight,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Clock
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function DispatchConsole() {
    const queryClient = useQueryClient();
    const [selectedTech, setSelectedTech] = useState<string | null>(null);

    // 1. Fetch Techs (Mock for now, or use MaintenanceService if available)
    // Ideally, valid users with 'Technician' role.
    // 1. Fetch Techs
    const { data: technicians, isLoading: loadingTechs } = useQuery({
        queryKey: ["/api/maintenance/supervisors/technicians"],
        // Backend returns: [{ id, name, skill, status, activeJobs }]
    });

    // 2. Fetch Unassigned Work Orders
    const { data: unassignedWOs, isLoading: loadingWOs } = useQuery({
        queryKey: ["/api/maintenance/work-orders", "unassigned"],
        queryFn: () => fetch("/api/maintenance/work-orders?status=submitted&assignedToId=null").then(r => r.json())
    });


    // 3. Assign Mutation
    const assignMutation = useMutation({
        mutationFn: async ({ woId, techId }: { woId: string, techId: string }) => {
            await fetch(`/api/maintenance/work-orders/${woId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ assignedToId: techId, status: "IN_PROGRESS" }) // Auto-start?
            });
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/maintenance/work-orders"] });
            queryClient.invalidateQueries({ queryKey: ["/api/maintenance/supervisors/technicians"] }); // Refresh tech load
            setSelectedTech(null); // Reset selection
        }

    });

    const handleAssign = (woId: string) => {
        if (!selectedTech) return;
        assignMutation.mutate({ woId, techId: selectedTech });
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col gap-4 p-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Dispatch Console</h2>
                    <p className="text-muted-foreground">Triage incoming requests and assign technicians.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"><Calendar className="mr-2 h-4 w-4" /> Schedule View</Button>
                    <Button><Users className="mr-2 h-4 w-4" /> Manage Team</Button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 h-full">
                {/* LEFT: UNASSIGNED QUEUE */}
                <div className="col-span-8 flex flex-col gap-4">
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex justify-between">
                                <span>Incoming Queue</span>
                                <Badge variant="secondary">{unassignedWOs?.length || 0} Pending</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 overflow-hidden">
                            <ScrollArea className="h-full p-6 pt-0">
                                {loadingWOs ? <Skeleton className="h-20 w-full mb-2" /> :
                                    unassignedWOs?.length === 0 ? (
                                        <div className="h-40 flex items-center justify-center text-muted-foreground">
                                            <CheckCircle2 className="mr-2" /> All caught up! No pending orders.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {unassignedWOs?.map((wo: any) => (
                                                <Card key={wo.id} className="border-l-4 border-l-orange-500">
                                                    <CardContent className="p-4 flex justify-between items-start">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-semibold">{wo.workOrderNumber}</span>
                                                                <Badge variant={wo.priority === "URGENT" ? "destructive" : "outline"}>
                                                                    {wo.priority}
                                                                </Badge>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {new Date(wo.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm font-medium mb-1">{wo.description}</p>
                                                            <div className="text-xs text-muted-foreground flex gap-4">
                                                                <span className="flex items-center"><Briefcase className="w-3 h-3 mr-1" /> Asset: {wo.asset?.assetNumber || 'Unassigned'}</span>
                                                            </div>

                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <Select onValueChange={setSelectedTech} value={selectedTech || undefined}>
                                                                <SelectTrigger className="w-[180px]">
                                                                    <SelectValue placeholder="Select Technician" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {technicians?.map((t: any) => (
                                                                        <SelectItem key={t.id} value={t.id}>
                                                                            {t.name} ({t.activeJobs} jobs)
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <Button
                                                                size="sm"
                                                                disabled={!selectedTech || assignMutation.isPending}
                                                                onClick={() => handleAssign(wo.id)}
                                                            >
                                                                Assign <ArrowRight className="ml-2 h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT: TECHNICIAN STATUS */}
                <div className="col-span-4 flex flex-col gap-4">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Field Force Status</CardTitle>
                            <CardDescription>Real-time availability</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {loadingTechs ? <Skeleton className="h-12 w-full" /> : technicians?.map((tech: any) => (
                                    <div key={tech.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-2 w-2 rounded-full ${tech.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                            <div>
                                                <div className="font-medium text-sm">{tech.name}</div>
                                                <div className="text-xs text-muted-foreground">{tech.skill}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold">{tech.activeJobs}</div>
                                            <div className="text-[10px] uppercase text-muted-foreground">Active Jobs</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Separator className="my-6" />

                            <div className="rounded-lg bg-slate-50 p-4 border">
                                <h4 className="font-medium text-sm mb-2 flex items-center"><Clock className="w-4 h-4 mr-2" /> Shift Overview</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span>Total Pending</span>
                                        <span className="font-medium">{unassignedWOs?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Available Techs</span>
                                        <span className="font-medium">{technicians?.filter((t: any) => t.status === 'AVAILABLE').length}</span>
                                    </div>
                                    <div className="h-2 bg-slate-200 rounded-full w-full overflow-hidden mt-2">
                                        <div className="bg-blue-500 h-full w-[45%]"></div>
                                    </div>
                                    <div className="text-[10px] text-center text-muted-foreground mt-1">45% Shift Capacity Utilized</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
