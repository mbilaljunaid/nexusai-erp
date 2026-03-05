import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Waves, Play, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from '@/components/layout/StandardPage';

export default function WavePlanning() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [strategy, setStrategy] = useState("FIFO");

    const { data: waves } = useQuery<any>({
        queryKey: ["/api/wms/waves"],
        queryFn: () => apiRequest("GET", "/api/wms/waves").then(res => res.json()),
    });

    const createWaveMutation = useMutation({
        mutationFn: (data: any) =>
            apiRequest("POST", "/api/wms/waves", data),
        onSuccess: () => {
            toast({ title: "Success", description: "Wave created" });
            queryClient.invalidateQueries({ queryKey: ["/api/wms/waves"] });
        },
    });

    const releaseWaveMutation = useMutation({
        mutationFn: (waveId: number) =>
            apiRequest("POST", `/api/wms/waves/${waveId}/release`),
        onSuccess: () => {
            toast({ title: "Success", description: "Wave released for picking" });
            queryClient.invalidateQueries({ queryKey: ["/api/wms/waves"] });
        },
    });

    return (
        <StandardPage
            title="Wave Planning Workbench"
            description="Create and release picking waves"
            actions={
                <Button onClick={() => createWaveMutation.mutate({ strategy })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Wave
                </Button>
            }
        >
            <div className="space-y-6">

                <Card>
                    <CardHeader>
                        <CardTitle>Wave Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Picking Strategy</label>
                            <Select value={strategy} onValueChange={setStrategy}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FIFO">FIFO - First In First Out</SelectItem>
                                    <SelectItem value="FEFO">FEFO - First Expired First Out</SelectItem>
                                    <SelectItem value="ZONE">Zone Picking</SelectItem>
                                    <SelectItem value="BATCH">Batch Picking</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium">Max Orders per Wave</label>
                                <input type="number" className="w-full border rounded-md p-2" defaultValue="50" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Max Lines per Wave</label>
                                <input type="number" className="w-full border rounded-md p-2" defaultValue="200" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Priority</label>
                                <Select defaultValue="STANDARD">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="URGENT">Urgent</SelectItem>
                                        <SelectItem value="STANDARD">Standard</SelectItem>
                                        <SelectItem value="LOW">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Active Waves</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {waves?.map((wave: any) => (
                            <div key={wave.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="font-medium">Wave #{wave.waveNumber}</div>
                                        <div className="text-sm text-muted-foreground">{wave.strategy}</div>
                                    </div>
                                    <Badge variant={wave.status === "RELEASED" ? "default" : "secondary"}>
                                        {wave.status}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                                    <div>
                                        <div className="text-muted-foreground">Orders</div>
                                        <div className="font-medium">{wave.orderCount}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Lines</div>
                                        <div className="font-medium">{wave.lineCount}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Units</div>
                                        <div className="font-medium">{wave.unitCount}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Picked</div>
                                        <div className="font-medium">{wave.pickedPercent}%</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => releaseWaveMutation.mutate(wave.id)}
                                        disabled={wave.status === "RELEASED"}
                                    >
                                        <Play className="h-3 w-3 mr-1" />
                                        Release
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        View Details
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
