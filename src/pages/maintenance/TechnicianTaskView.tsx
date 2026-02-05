
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Clock, MapPin, Package, Timer, Camera } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import PartRequirementList from "@/components/maintenance/PartRequirementList";
import InspectionFormRunner from "@/components/maintenance/InspectionFormRunner";
// Badge import removed (duplicate)
import { Wifi, WifiOff } from "lucide-react";

export default function TechnicianTaskView() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // Monitor Online Status
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    // Sync Offline Data
    const syncOfflineData = async () => {
        const queue = JSON.parse(localStorage.getItem("offline_inspection_queue") || "[]");
        if (queue.length === 0) return;

        try {
            for (const item of queue) {
                await fetch(`/api/maintenance/quality/inspections/${item.inspectionId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ results: item.data, status: 'COMPLETED' })
                });
            }
            localStorage.removeItem("offline_inspection_queue");
            toast({ title: "Sync Complete", description: "Offline inspections uploaded." });
        } catch (e) {
            toast({ title: "Sync Failed", variant: "destructive" });
        }
    };

    // Mock User ID (Technician) - In real app, get from context
    const currentUserId = "tech-1";

    const { data: myTasks, isLoading } = useQuery({
        queryKey: ["/api/maintenance/my-tasks", currentUserId],
        queryFn: async () => {
            // Fetch WOs assigned to me
            const res = await fetch(`/api/maintenance/work-orders?assignedToId=${currentUserId}&status=IN_PROGRESS,RELEASED`).then(r => r.json());
            return res.data || [];
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            await fetch(`/api/maintenance/work-orders/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/maintenance/my-tasks"] });
            toast({ title: "Task Updated" });
            setSelectedTask(null);
        }
    });

    if (selectedTask) {
        return (
            <div className="h-full flex flex-col bg-background">
                {/* Mobile Header */}
                <div className="p-4 border-b flex items-center justify-between bg-muted/20">
                    <Button variant="ghost" onClick={() => setSelectedTask(null)}>← Back</Button>
                    <span className="font-semibold">{selectedTask.workOrderNumber}</span>
                </div>

                <div className="flex-1 overflow-auto p-4 space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold">{selectedTask.description}</h2>
                        <div className="flex gap-2">
                            <Badge variant={selectedTask.priority === 'URGENT' ? "destructive" : "secondary"}>
                                {selectedTask.priority}
                            </Badge>
                            <Badge variant="outline">{selectedTask.status}</Badge>
                        </div>
                    </div>

                    <Card>
                        <CardContent className="p-4 space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{selectedTask.asset?.locationId || "Main Workshop"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>Est. Time: {selectedTask.estimatedHours || 2}h</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="ops">
                        <TabsList className="w-full">
                            <TabsTrigger value="ops" className="flex-1">Steps</TabsTrigger>
                            <TabsTrigger value="inspect" className="flex-1">Inspect</TabsTrigger>
                            <TabsTrigger value="mats" className="flex-1">Parts</TabsTrigger>
                            <TabsTrigger value="log" className="flex-1">Time</TabsTrigger>
                        </TabsList>

                        <TabsContent value="ops" className="space-y-4 mt-4">
                            {/* Operations List */}
                            <div className="space-y-2">
                                {/* Mock Operations if none exist */}
                                {[1, 2, 3].map((step) => (
                                    <div key={step} className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                                        <div className="h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs text-muted-foreground">
                                            {step}
                                        </div>
                                        <div className="flex-1 text-sm font-medium">Step {step}: Inspect safety guards</div>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="inspect" className="mt-4 h-[400px]">
                            <InspectionFormRunner
                                inspectionId="insp-123" // In real app, derived from Task
                                definition={{
                                    id: "def-1",
                                    name: "Standard Safety Inspection",
                                    questions: [
                                        { id: "q1", text: "Are all guards in place?", type: "YES_NO", required: true },
                                        { id: "q2", text: "Current Pressure Reading (PSI)", type: "NUMBER", required: true },
                                        { id: "q3", text: "Visual defects observed?", type: "PASS_FAIL", required: true }
                                    ]
                                }}
                                onComplete={() => toast({ title: "Inspection Saved" })}
                            />
                        </TabsContent>

                        <TabsContent value="mats" className="mt-4">
                            <PartRequirementList workOrderId={selectedTask.id} />
                        </TabsContent>
                        <TabsContent value="log" className="mt-4 space-y-4">
                            <div className="p-4 border rounded-lg text-center bg-blue-50/50">
                                <Timer className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                                <div className="text-2xl font-bold font-mono">00:42:15</div>
                                <div className="flex justify-center gap-2 mt-2">
                                    <Button size="sm" variant="destructive">Stop</Button>
                                    <Button size="sm">Pause</Button>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t bg-background">
                    <Button className="w-full size-lg text-lg" onClick={() => updateStatusMutation.mutate({ id: selectedTask.id, status: "COMPLETED" })}>
                        Complete Work Order
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto h-full flex flex-col bg-muted/10 min-h-screen">
            <div className="p-4 bg-primary text-primary-foreground pt-12 pb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-xl font-bold">Good Morning, Tech</h1>
                    <p className="text-primary-foreground/80 text-sm">You have {myTasks?.length || 0} active tasks today.</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    {isOnline ? (
                        <Badge variant="outline" className="bg-green-500/20 text-white border-green-400"><Wifi className="h-3 w-3 mr-1" /> Online</Badge>
                    ) : (
                        <Badge variant="destructive"><WifiOff className="h-3 w-3 mr-1" /> Offline</Badge>
                    )}
                    {isOnline && (
                        <Button size="sm" variant="secondary" onClick={syncOfflineData} className="h-6 text-xs">Sync Data</Button>
                    )}
                </div>
            </div>

            <div className="p-4 space-y-4">
                {isLoading ? <Skeleton className="h-24 w-full" /> : myTasks?.map((wo: any) => (
                    <Card key={wo.id} onClick={() => setSelectedTask(wo)} className="cursor-pointer active:scale-95 transition-transform">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold">{wo.workOrderNumber}</span>
                                <Badge>{wo.status}</Badge>
                            </div>
                            <p className="text-sm line-clamp-2 mb-3">{wo.description}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Workshop B</span>
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Due Today</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {myTasks?.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <div className="bg-muted rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <p>All cleared! No tasks assigned.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
