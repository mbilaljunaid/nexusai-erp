import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Truck, Users, Box, Plus, Calendar, Settings2, Activity, Gauge, Fuel, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { StandardTable, Column } from "../tables/StandardTable";
import { ConstructionResource, ConstructionResourceAllocation } from "@shared/schema";

export default function ConstructionResourceWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [telemetryResource, setTelemetryResource] = useState<ConstructionResource | null>(null);
    const loadRef = useRef<HTMLDivElement>(null);
    const efficiencyRef = useRef<HTMLDivElement>(null);

    const { data: projects = [] } = useQuery<any[]>({
        queryKey: ["ppm-projects"],
        queryFn: async () => {
            const res = await fetch("/api/ppm/projects");
            return res.json();
        }
    });

    const { data: resources = [], isLoading: isLoadingResources } = useQuery<ConstructionResource[]>({
        queryKey: ["construction-resources"],
        queryFn: async () => {
            const res = await fetch("/api/construction/resources");
            return res.json();
        }
    });

    const { data: allocations = [], isLoading: isLoadingAllocations } = useQuery<ConstructionResourceAllocation[]>({
        queryKey: ["construction-resource-allocations", selectedProjectId],
        enabled: !!selectedProjectId,
        queryFn: async () => {
            const res = await fetch(`/api/construction/projects/${selectedProjectId}/resource-allocations`);
            return res.json();
        }
    });

    const { data: telemetry, isLoading: isLoadingTelemetry } = useQuery<any>({
        queryKey: ["construction-telemetry", telemetryResource?.id],
        enabled: !!telemetryResource && telemetryResource.type === "EQUIPMENT",
        queryFn: async () => {
            const res = await fetch(`/api/construction/resources/${telemetryResource?.id}/telemetry`);
            return res.json();
        },
        refetchInterval: 5000 // Polling for "real-time" feel
    });

    useEffect(() => {
        if (telemetry && loadRef.current) {
            loadRef.current.style.width = `${Math.round(telemetry.loadFactor * 100)}%`;
        }
        if (telemetry && efficiencyRef.current) {
            efficiencyRef.current.style.width = `${telemetry.efficiencyScore}%`;
        }
    }, [telemetry]);

    const createResourceMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/construction/resources", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["construction-resources"] });
            setIsAddOpen(false);
            toast({ title: "Resource Added", description: "New project resource has been registered." });
        }
    });

    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        createResourceMutation.mutate({
            name: formData.get("name"),
            type: formData.get("type"),
            category: formData.get("category"),
            hourlyRate: formData.get("hourlyRate"),
            status: "AVAILABLE"
        });
    };

    const columns: Column<ConstructionResource>[] = [
        {
            header: "Type",
            accessorKey: "type",
            cell: (item) => (
                <div className="flex items-center gap-2">
                    {item.type === "EQUIPMENT" ? <Truck className="h-4 w-4" /> :
                        item.type === "LABOR" ? <Users className="h-4 w-4" /> : <Box className="h-4 w-4" />}
                    <Badge variant="outline">{item.type}</Badge>
                </div>
            )
        },
        { header: "Name", accessorKey: "name", sortable: true },
        { header: "Category", accessorKey: "category" },
        {
            header: "Rate",
            accessorKey: "hourlyRate",
            cell: (item) => item.hourlyRate ? `$${Number(item.hourlyRate).toFixed(2)}/hr` : "-"
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (item) => (
                <Badge variant={item.status === "AVAILABLE" ? "default" : "secondary"}>
                    {item.status}
                </Badge>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Resource Workbench</h1>
                    <p className="text-muted-foreground">Manage Labor, Equipment, and Material allocations across projects.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Select value={selectedProjectId || ""} onValueChange={setSelectedProjectId}>
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Filter by Project" />
                        </SelectTrigger>
                        <SelectContent>
                            {projects.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.projectNumber}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Resource
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Register New Resource</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="type">Resource Type</Label>
                                    <Select name="type" required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="EQUIPMENT">Equipment / Machinery</SelectItem>
                                            <SelectItem value="LABOR">Labor / Workforce</SelectItem>
                                            <SelectItem value="MATERIAL">Bulk Material</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Resource Name</Label>
                                    <Input id="name" name="name" placeholder="e.g. Caterpillar 320 Excavator" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Category / Specialization</Label>
                                    <Input id="category" name="category" placeholder="e.g. Heavy Earthmoving" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="hourlyRate">Standard Hourly Rate ($)</Label>
                                    <Input id="hourlyRate" name="hourlyRate" type="number" step="0.01" />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={createResourceMutation.isPending}>Register</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                <Card className="col-span-8">
                    <CardHeader>
                        <CardTitle>Master Resource List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StandardTable
                            data={resources}
                            columns={columns}
                            isLoading={isLoadingResources}
                            actions={(item) => (
                                <div className="flex items-center gap-1">
                                    {item.type === "EQUIPMENT" && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => setTelemetryResource(item)}>
                                            <Activity className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Settings2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Allocation Overview</CardTitle>
                        <CardDescription>Currently assigned to selected project.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!selectedProjectId ? (
                            <div className="h-48 flex items-center justify-center text-muted-foreground italic text-sm">
                                Select a project to view allocations
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {allocations.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No active allocations.</p>
                                ) : (
                                    allocations.map(alloc => {
                                        const res = resources.find(r => r.id === alloc.resourceId);
                                        return (
                                            <div key={alloc.id} className="flex items-center justify-between p-3 border rounded-md">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium">{res?.name || "Unknown Resource"}</p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        {format(new Date(alloc.startDate), "MMM d")} - {format(new Date(alloc.endDate), "MMM d")}
                                                    </div>
                                                </div>
                                                <Badge variant="secondary">{alloc.allocationPercent}%</Badge>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={!!telemetryResource} onOpenChange={(open) => !open && setTelemetryResource(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-600 font-bold" />
                            Live Telemetry: {telemetryResource?.name}
                        </DialogTitle>
                        <CardDescription>Real-time sensor data from equipment IoT gateway.</CardDescription>
                    </DialogHeader>
                    {isLoadingTelemetry ? (
                        <div className="h-48 flex items-center justify-center">
                            <Activity className="h-8 w-8 text-muted-foreground animate-pulse" />
                        </div>
                    ) : telemetry ? (
                        <div className="space-y-6 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="p-4 flex flex-col items-center justify-center space-y-1">
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground uppercase font-bold">
                                        <Gauge className="h-3 w-3" /> Engine Hours
                                    </div>
                                    <div className="text-2xl font-mono">{telemetry.engineHours}h</div>
                                </Card>
                                <Card className="p-4 flex flex-col items-center justify-center space-y-1">
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground uppercase font-bold">
                                        <Fuel className="h-3 w-3" /> Fuel Level
                                    </div>
                                    <div className="text-2xl font-mono text-green-600">{telemetry.fuelLevel}%</div>
                                </Card>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Load Factor</span>
                                    <span className="font-medium">{Math.round(telemetry.loadFactor * 100)}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div ref={loadRef} className="h-full bg-blue-500 transition-all duration-500" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Overall Efficiency</span>
                                    <span className="font-medium text-green-600">{telemetry.efficiencyScore}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div ref={efficiencyRef} className="h-full bg-green-500 transition-all duration-500" />
                                </div>
                            </div>

                            {telemetry.alerts.length > 0 && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-md space-y-1">
                                    {telemetry.alerts.map((alert: string, i: number) => (
                                        <div key={i} className="flex items-center gap-2 text-xs text-red-700 font-medium">
                                            <AlertTriangle className="h-3 w-3" />
                                            {alert}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="text-[10px] text-center text-muted-foreground font-mono">
                                LAST SIGNAL: {format(new Date(telemetry.timestamp), "HH:mm:ss")}
                            </div>
                        </div>
                    ) : (
                        <div className="h-48 flex items-center justify-center text-muted-foreground italic">
                            No telemetry data available.
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
