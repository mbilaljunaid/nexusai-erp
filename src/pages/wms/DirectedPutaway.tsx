import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { MapPin, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function DirectedPutaway() {
    const [strategy, setStrategy] = useState("PROXIMITY");

    const { data: tasks } = useQuery({
        queryKey: ["/api/wms/putaway-tasks"],
        queryFn: () => apiRequest("/api/wms/putaway-tasks?status=PENDING"),
    });

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Directed Putaway Engine</h1>
                    <p className="text-muted-foreground">Optimize putaway location and task generation</p>
                </div>
                <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Strategy
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Putaway Strategy</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Strategy</label>
                            <Select value={strategy} onValueChange={setStrategy}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PROXIMITY">Proximity to Receiving</SelectItem>
                                    <SelectItem value="VELOCITY">Product Velocity</SelectItem>
                                    <SelectItem value="SAME_SKU">Same SKU Consolidation</SelectItem>
                                    <SelectItem value="ZONE">Zone-Based</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Priority</label>
                            <Select defaultValue="BALANCED">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SPEED">Maximize Speed</SelectItem>
                                    <SelectItem value="SPACE">Maximize Space</SelectItem>
                                    <SelectItem value="BALANCED">Balanced</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Putaway Tasks ({tasks?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {tasks?.map((task: any) => (
                        <div key={task.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="font-medium">{task.sku}</div>
                                    <div className="text-sm text-muted-foreground">{task.description}</div>
                                </div>
                                <Badge>{task.quantity} units</Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <div className="text-muted-foreground">From Location</div>
                                    <div className="font-medium flex items-center">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {task.fromLocation}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Suggested Location</div>
                                    <div className="font-medium flex items-center">
                                        <MapPin className="h-3 w-3 mr-1 text-green-600" />
                                        {task.toLocation}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Priority</div>
                                    <Badge variant={task.priority === "HIGH" ? "destructive" : "secondary"}>
                                        {task.priority}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <Button size="sm">Accept</Button>
                                <Button size="sm" variant="outline">
                                    Override Location
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
