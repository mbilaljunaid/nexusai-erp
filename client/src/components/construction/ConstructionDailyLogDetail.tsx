
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, DollarSign, HardHat, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";

interface ConstructionDailyLogDetailProps {
    logId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ConstructionDailyLogDetail({ logId, open, onOpenChange }: ConstructionDailyLogDetailProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("labor");

    // --- State for New Entries ---
    const [newLabor, setNewLabor] = useState({ trade: "", workerCount: 1, hoursWorked: 8, workPerformed: "" });
    const [newEquipment, setNewEquipment] = useState({ equipmentType: "", hoursUsed: 4, workPerformed: "" });

    // --- Queries ---
    const { data: log } = useQuery({
        queryKey: ["daily-log", logId],
        enabled: !!logId,
        queryFn: async () => {
            // Fetch header (assuming we have an endpoint, or we pass it in. If not, we might rely on specific fetch)
            // Currently backend doesn't have "get log by ID", only "get logs by project".
            // We might need to filter from cache or adding a specific endpoint is better.
            // For MVP, likely acceptable to filter or just display Lines since header allows context.
            // Actually, let's assume we can fetch lines directly or the parent passes the header.
            // But for lines, we definitely need endpoints. 
            // WAIT - ConstructionService.ts has `getLaborLines`? No, it has `addLaborLines`.
            // It lacks `getLaborLines` and `getEquipmentLines` in ROUTER!
            // I only added `getEquipmentLines` to Service, not Router.
            // I must fix Router to expose GET lines.
            return null; // Placeholder
        }
    });

    // TEMPORARY FIX: We need to update the Router to expose GET lines before we can fetch them.
    // For now, I will write this component assuming the endpoints exist or I will add them in next step.
    // I will add `getLaborLines` and `getEquipmentLines` to the backend now.

    const { data: laborLines = [] } = useQuery({
        queryKey: ["daily-log-labor", logId],
        enabled: !!logId,
        queryFn: async () => {
            // Assuming endpoint will be added: GET /api/construction/daily-logs/:id/labor
            const res = await fetch(`/api/construction/daily-logs/${logId}/labor`);
            if (!res.ok) return [];
            return res.json();
        }
    });

    const { data: equipmentLines = [] } = useQuery({
        queryKey: ["daily-log-equipment", logId],
        enabled: !!logId,
        queryFn: async () => {
            const res = await fetch(`/api/construction/daily-logs/${logId}/equipment`);
            if (!res.ok) return [];
            return res.json();
        }
    });

    // --- Mutations ---

    const addLaborMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/construction/daily-logs/${logId}/labor`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lines: [newLabor] })
            });
            if (!res.ok) throw new Error("Failed to add labor");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["daily-log-labor"] });
            setNewLabor({ trade: "", workerCount: 1, hoursWorked: 8, workPerformed: "" });
            toast({ title: "Labor Added", description: "Worker hours recorded." });
        }
    });

    const addEquipmentMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/construction/daily-logs/${logId}/equipment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lines: [newEquipment] })
            });
            if (!res.ok) throw new Error("Failed to add equipment");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["daily-log-equipment"] });
            setNewEquipment({ equipmentType: "", hoursUsed: 4, workPerformed: "" });
            toast({ title: "Equipment Added", description: "Equipment hours recorded." });
        }
    });

    const syncCostsMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/construction/daily-logs/${logId}/sync-costs`, {
                method: "POST"
            });
            if (!res.ok) throw new Error("Failed to sync costs");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["daily-log-labor"] }); // Refresh for status updates (if any)
            queryClient.invalidateQueries({ queryKey: ["daily-log-equipment"] });
            toast({ title: "Costs Synced", description: "Expenditure items created in PPM." });
        }
    });

    if (!logId) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <DialogTitle>Daily Log Detail</DialogTitle>
                            <DialogDescription>Manage resources and sync costs for this field report.</DialogDescription>
                        </div>
                        <Button
                            onClick={() => syncCostsMutation.mutate()}
                            disabled={syncCostsMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {syncCostsMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <DollarSign className="h-4 w-4 mr-1" />}
                            Sync Costs to PPM
                        </Button>
                    </div>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="labor"><HardHat className="h-4 w-4 mr-2" /> Labor</TabsTrigger>
                        <TabsTrigger value="equipment"><Truck className="h-4 w-4 mr-2" /> Equipment</TabsTrigger>
                    </TabsList>

                    <TabsContent value="labor" className="space-y-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div>
                                        <Label>Trade / Role</Label>
                                        <Input
                                            placeholder="e.g. Electrician"
                                            value={newLabor.trade}
                                            onChange={(e) => setNewLabor({ ...newLabor, trade: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Count</Label>
                                        <Input
                                            type="number"
                                            value={newLabor.workerCount}
                                            onChange={(e) => setNewLabor({ ...newLabor, workerCount: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Hours</Label>
                                        <Input
                                            type="number"
                                            value={newLabor.hoursWorked}
                                            onChange={(e) => setNewLabor({ ...newLabor, hoursWorked: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <Button onClick={() => addLaborMutation.mutate()} disabled={addLaborMutation.isPending || !newLabor.trade}>
                                        <Plus className="h-4 w-4 mr-1" /> Add Labor
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Trade</TableHead>
                                    <TableHead>Workers</TableHead>
                                    <TableHead>Hours</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {laborLines.map((line: any) => (
                                    <TableRow key={line.id}>
                                        <TableCell>{line.trade}</TableCell>
                                        <TableCell>{line.workerCount}</TableCell>
                                        <TableCell>{line.hoursWorked}</TableCell>
                                        <TableCell>
                                            {/* Mocking status visualization since Labor table doesn't have status col in schema yet, but logic does */}
                                            <Badge variant="outline">Recorded</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {laborLines.length === 0 && <TableRow><TableCell colSpan={4} className="text-center">No labor recorded</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </TabsContent>

                    <TabsContent value="equipment" className="space-y-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div className="md:col-span-2">
                                        <Label>Equipment Type</Label>
                                        <Input
                                            placeholder="e.g. Excavator 5T"
                                            value={newEquipment.equipmentType}
                                            onChange={(e) => setNewEquipment({ ...newEquipment, equipmentType: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Hours Used</Label>
                                        <Input
                                            type="number"
                                            value={newEquipment.hoursUsed}
                                            onChange={(e) => setNewEquipment({ ...newEquipment, hoursUsed: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <Button onClick={() => addEquipmentMutation.mutate()} disabled={addEquipmentMutation.isPending || !newEquipment.equipmentType}>
                                        <Plus className="h-4 w-4 mr-1" /> Add Equip
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Hours</TableHead>
                                    <TableHead>Cost Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {equipmentLines.map((line: any) => (
                                    <TableRow key={line.id}>
                                        <TableCell>{line.equipmentType}</TableCell>
                                        <TableCell>{line.hoursUsed}</TableCell>
                                        <TableCell>
                                            <Badge variant={line.costStatus === "COSTED" ? "default" : "secondary"}>
                                                {line.costStatus || "UNCOSTED"}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {equipmentLines.length === 0 && <TableRow><TableCell colSpan={3} className="text-center">No equipment recorded</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
