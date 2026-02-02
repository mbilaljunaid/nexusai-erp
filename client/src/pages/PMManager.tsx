
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Play, Calendar } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

export default function PMManager() {
    const { toast } = useToast();
    const [newPM, setNewPM] = useState({
        name: "",
        assetId: "",
        workDefinitionId: "",
        frequency: "1",
        frequencyUom: "MONTH",
        triggerType: "TIME"
    });

    const { data: pms = [], isLoading } = useQuery({
        queryKey: ["/api/maintenance/pm-definitions"],
        queryFn: () => fetch("/api/maintenance/pm-definitions").then(r => r.json()).catch(() => [])
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => fetch("/api/maintenance/pm-definitions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/maintenance/pm-definitions"] });
            toast({ title: "PM Definition Created" });
            setNewPM({ ...newPM, name: "" });
        }
    });

    const generateMutation = useMutation({
        mutationFn: () => fetch("/api/maintenance/pm-generate", { method: "POST" }).then(r => r.json()),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/maintenance/work-orders"] });
            toast({ title: "Generation Complete", description: `Created ${data.generated} Work Orders` });
        }
    });

    return (
        <div className="space-y-6 p-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2"><Calendar className="h-8 w-8" /> Preventive Maintenance</h1>
                    <p className="text-muted-foreground">Manage recurring schedules and auto-generate work orders</p>
                </div>
                <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
                    <Play className="mr-2 h-4 w-4" /> Run Forecast
                </Button>
            </div>

            {/* Create Form */}
            <Card>
                <CardHeader><CardTitle className="text-base">New Schedule</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-6 gap-2 items-end">
                        <div className="col-span-2">
                            <p className="text-xs mb-1">Name</p>
                            <Input placeholder="e.g. Weekly Inspection" value={newPM.name} onChange={e => setNewPM({ ...newPM, name: e.target.value })} />
                        </div>
                        <div className="col-span-1">
                            <p className="text-xs mb-1">Asset ID (UUID)</p>
                            <Input placeholder="Asset ID" value={newPM.assetId} onChange={e => setNewPM({ ...newPM, assetId: e.target.value })} />
                        </div>
                        <div className="col-span-1">
                            <p className="text-xs mb-1">Work Def ID</p>
                            <Input placeholder="Def ID" value={newPM.workDefinitionId} onChange={e => setNewPM({ ...newPM, workDefinitionId: e.target.value })} />
                        </div>
                        <div className="col-span-1">
                            <p className="text-xs mb-1">Freq</p>
                            <div className="flex gap-1">
                                <Input type="number" value={newPM.frequency} onChange={e => setNewPM({ ...newPM, frequency: e.target.value })} className="w-16" />
                                <Select value={newPM.frequencyUom} onValueChange={v => setNewPM({ ...newPM, frequencyUom: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DAY">Day</SelectItem>
                                        <SelectItem value="WEEK">Week</SelectItem>
                                        <SelectItem value="MONTH">Month</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button size="sm" onClick={() => createMutation.mutate({ ...newPM, frequency: parseInt(newPM.frequency) })} disabled={!newPM.name}>
                            <Plus className="h-4 w-4" /> Add
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                {isLoading ? <p>Loading...</p> : pms.map((pm: any) => (
                    <Card key={pm.id}>
                        <CardContent className="p-4 flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold">{pm.name}</h3>
                                <p className="text-sm text-muted-foreground">Every {pm.frequency} {pm.frequencyUom} • Asset: {pm.assetId}</p>
                            </div>
                            <div className="text-right text-sm">
                                <p>Last Run: {pm.lastGeneratedDate ? new Date(pm.lastGeneratedDate).toLocaleDateString() : "Never"}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
