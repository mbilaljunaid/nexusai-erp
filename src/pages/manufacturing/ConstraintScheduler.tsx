import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Play, Save, Link2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ConstraintRule {
    id?: number;
    name: string;
    constraintType: 'RESOURCE' | 'MATERIAL' | 'CAPACITY' | 'DEPENDENCY';
    resourceId?: number;
    maxCapacity?: number;
    bufferSize?: number;
    priority: number;
}

export default function ConstraintScheduler() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedPlant, setSelectedPlant] = useState("");
    const [schedulingMethod, setSchedulingMethod] = useState<'DBR' | 'CCR'>('DBR');
    const [drumResource, setDrumResource] = useState("");
    const [bufferTime, setBufferTime] = useState(24);

    const { data: plants } = useQuery({
        queryKey: ["/api/manufacturing/plants"],
        queryFn: () => apiRequest("/api/manufacturing/plants"),
    });

    const { data: resources } = useQuery({
        queryKey: ["/api/manufacturing/resources", selectedPlant],
        queryFn: () => apiRequest(`/api/manufacturing/resources?plantId=${selectedPlant}`),
        enabled: !!selectedPlant,
    });

    const { data: schedule } = useQuery({
        queryKey: ["/api/manufacturing/constraint-schedule", selectedPlant, drumResource],
        queryFn: () => apiRequest(`/api/manufacturing/constraint-schedule?plantId=${selectedPlant}&drumResourceId=${drumResource}`),
        enabled: !!selectedPlant && !!drumResource,
    });

    const runScheduleMutation = useMutation({
        mutationFn: (params: any) =>
            apiRequest("/api/manufacturing/run-constraint-schedule", {
                method: "POST",
                body: JSON.stringify(params),
            }),
        onSuccess: (data) => {
            toast({ title: "Success", description: `Scheduled ${data.ordersScheduled} orders` });
            queryClient.invalidateQueries({ queryKey: ["/api/manufacturing/constraint-schedule"] });
        },
    });

    const runSchedule = () => {
        runScheduleMutation.mutate({
            plantId: selectedPlant,
            method: schedulingMethod,
            drumResourceId: drumResource,
            bufferHours: bufferTime,
        });
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Constraint-Based Scheduler</h1>
                    <p className="text-muted-foreground">Theory of Constraints (TOC) scheduling with Drum-Buffer-Rope</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={runSchedule} disabled={runScheduleMutation.isPending || !drumResource}>
                        <Play className="h-4 w-4 mr-2" />
                        Run Schedule
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Scheduling Parameters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Plant</Label>
                            <Select value={selectedPlant} onValueChange={setSelectedPlant}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select plant" />
                                </SelectTrigger>
                                <SelectContent>
                                    {plants?.map((plant: any) => (
                                        <SelectItem key={plant.id} value={plant.id.toString()}>
                                            {plant.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Scheduling Method</Label>
                            <Select value={schedulingMethod} onValueChange={(v: any) => setSchedulingMethod(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DBR">Drum-Buffer-Rope</SelectItem>
                                    <SelectItem value="CCR">Capacity Constrained Resource</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Drum Resource (Constraint)</Label>
                            <Select value={drumResource} onValueChange={setDrumResource} disabled={!selectedPlant}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select constraint" />
                                </SelectTrigger>
                                <SelectContent>
                                    {resources?.map((resource: any) => (
                                        <SelectItem key={resource.id} value={resource.id.toString()}>
                                            <div className="flex items-center gap-2">
                                                {resource.name}
                                                {resource.isBottleneck && <Badge variant="destructive" className="text-xs">Bottleneck</Badge>}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Buffer Time (hours)</Label>
                            <Input
                                type="number"
                                value={bufferTime}
                                onChange={(e) => setBufferTime(parseInt(e.target.value))}
                                min="0"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-8">
                    <CardHeader>
                        <CardTitle>Schedule Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {schedule ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <Card>
                                        <CardContent className="pt-4">
                                            <div className="text-sm text-muted-foreground">Orders Scheduled</div>
                                            <div className="text-2xl font-bold mt-1">{schedule.totalOrders}</div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-4">
                                            <div className="text-sm text-muted-foreground">Avg Throughput Time</div>
                                            <div className="text-2xl font-bold mt-1">{schedule.avgThroughput} hrs</div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-4">
                                            <div className="text-sm text-muted-foreground">Constraint Utilization</div>
                                            <div className="text-2xl font-bold mt-1">{schedule.constraintUtil}%</div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="border rounded-lg">
                                    <table className="w-full">
                                        <thead className="bg-muted">
                                            <tr>
                                                <th className="text-left p-3">Work Order</th>
                                                <th className="text-left p-3">Product</th>
                                                <th className="text-right p-3">Quantity</th>
                                                <th className="text-left p-3">Start Date</th>
                                                <th className="text-left p-3">Due Date</th>
                                                <th className="text-left p-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {schedule.workOrders?.map((wo: any) => (
                                                <tr key={wo.id} className="border-t">
                                                    <td className="p-3 font-medium">{wo.orderNumber}</td>
                                                    <td className="p-3">{wo.productName}</td>
                                                    <td className="p-3 text-right">{wo.quantity}</td>
                                                    <td className="p-3">{new Date(wo.scheduledStart).toLocaleDateString()}</td>
                                                    <td className="p-3">{new Date(wo.dueDate).toLocaleDateString()}</td>
                                                    <td className="p-3">
                                                        <Badge variant={wo.isOnTime ? 'default' : 'destructive'}>
                                                            {wo.isOnTime ? 'On Time' : 'At Risk'}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                <AlertCircle className="h-12 w-12 mb-4" />
                                <p>Select plant and drum resource to generate schedule</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
