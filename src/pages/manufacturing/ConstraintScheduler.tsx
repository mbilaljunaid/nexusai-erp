import { formatDate } from "@/lib/dateUtils";
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
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from "@/components/layout/StandardPage";


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

    const { data: plants } = useQuery<any>({
        queryKey: ["/api/manufacturing/plants"],
        queryFn: () => apiRequest("GET", "/api/manufacturing/plants").then(res => res.json()),
    });

    const { data: resources } = useQuery<any>({
        queryKey: ["/api/manufacturing/resources", selectedPlant],
        queryFn: () => apiRequest("GET", `/api/manufacturing/resources?plantId=${selectedPlant}`).then(res => res.json()),
        enabled: !!selectedPlant,
    });

    const { data: schedule } = useQuery<any>({
        queryKey: ["/api/manufacturing/constraint-schedule", selectedPlant, drumResource],
        queryFn: () => apiRequest("GET", `/api/manufacturing/constraint-schedule?plantId=${selectedPlant}&drumResourceId=${drumResource}`).then(res => res.json()),
        enabled: !!selectedPlant && !!drumResource,
    });

    const runScheduleMutation = useMutation({
        mutationFn: async (params: any) => {
            const res = await apiRequest("POST", "/api/manufacturing/run-constraint-schedule", params);
            return res.json();
        },
        onSuccess: (data: any) => {
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

    const scheduleColumns: SpreadsheetColumn<any>[] = [
        { id: "workOrder", header: "Work Order", width: "150px", cell: (wo) => <div className="font-medium">{wo.orderNumber}</div> },
        { id: "product", header: "Product", width: "200px", cell: (wo) => wo.productName },
        { id: "quantity", header: "Quantity", width: "100px", cell: (wo) => <div className="text-right">{wo.quantity}</div> },
        { id: "startDate", header: "Start Date", width: "150px", cell: (wo) => wo.scheduledStart ? formatDate(wo.scheduledStart) : '—' },
        { id: "dueDate", header: "Due Date", width: "150px", cell: (wo) => wo.dueDate ? formatDate(wo.dueDate) : '—' },
        {
            id: "status", header: "Status", width: "120px", cell: (wo) => (
                <Badge variant={wo.isOnTime ? 'default' : 'destructive'}>
                    {wo.isOnTime ? 'On Time' : 'At Risk'}
                </Badge>
            )
        }
    ];

    return (
        <StandardPage title="Constraint-Based Scheduler">
            <div className="flex justify-between items-center">
                <div>

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

                                <div className="h-[400px]">
                                    <InteractiveSpreadsheet
                                        columns={scheduleColumns}
                                        data={schedule.workOrders || []}
                                        onChange={() => { }}
                                        containerHeight="400px"
                                    />
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
        </StandardPage>
    );
}
