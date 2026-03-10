import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Gauge, Plus, RefreshCw, AlertTriangle, Save, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/formatters";

export default function MeterConfiguration() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isResetOpen, setIsResetOpen] = useState(false);
    const [selectedMeter, setSelectedMeter] = useState<any>(null);
    const [resetReading, setResetReading] = useState("0");

    const { data: meters, isLoading } = useQuery({
        queryKey: ["/api/maintenance/meters/manage"],
        queryFn: async () => {
            // Stub backend data
            return [
                { id: "MTR-Odo-001", assetId: "Fleet-Truck-04", name: "Odometer", type: "CONTINUOUS", uom: "Miles", reading: 999950, rolloverLimit: 1000000, active: true },
                { id: "MTR-Hrs-002", assetId: "CNC-MILL-02", name: "Spindle Run Hours", type: "CONTINUOUS", uom: "Hours", reading: 8520, rolloverLimit: 10000, active: true },
                { id: "MTR-Cy-003", assetId: "Press-100T", name: "Stroke Cycles", type: "ABSOLUTE", uom: "Cycles", reading: 4500123, rolloverLimit: 9999999, active: true },
            ];
        }
    });

    const resetMutation = useMutation({
        mutationFn: async () => {
            return new Promise((resolve) => setTimeout(resolve, 800));
        },
        onSuccess: () => {
            setIsResetOpen(false);
            setSelectedMeter(null);
            setResetReading("0");
            toast({ title: "Meter Rollover Executed", description: "The meter has been successfully reset/rolled over to the new base value." });
        }
    });

    const handleOpenReset = (meter: any) => {
        setSelectedMeter(meter);
        setResetReading("0");
        setIsResetOpen(true);
    };

    const calculateRolloverRisk = (reading: number, limit: number) => {
        const percentage = (reading / limit) * 100;
        if (percentage > 99) return "CRITICAL";
        if (percentage > 90) return "WARNING";
        return "SAFE";
    };

    const getRiskBadge = (risk: string) => {
        switch (risk) {
            case "CRITICAL": return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Imminent Rollover</Badge>;
            case "WARNING": return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Approaching Limit</Badge>;
            case "SAFE": return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50"><CheckCircle2 className="w-3 h-3 mr-1" /> Healthy</Badge>;
            default: return null;
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Meter Rollover Management</h1>
                    <p className="text-muted-foreground mt-1">Configure continuous meters and manage rollover limits to prevent PM scheduling failures.</p>
                </div>

                <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2"><RefreshCw className="w-5 h-5 text-indigo-600" /> Execute Meter Rollover</DialogTitle>
                        </DialogHeader>
                        {selectedMeter && (
                            <div className="space-y-4 py-4">
                                <div className="p-4 bg-muted rounded-md space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Meter:</span>
                                        <span className="font-medium">{selectedMeter.name} ({selectedMeter.id})</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Asset:</span>
                                        <span>{selectedMeter.assetId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Current Reading:</span>
                                        <span className="font-bold text-orange-600">{formatNumber(selectedMeter.reading)} {selectedMeter.uom}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Hardware Limit:</span>
                                        <span>{formatNumber(selectedMeter.rolloverLimit)} {selectedMeter.uom}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>New Post-Rollover Base Reading</Label>
                                    <div className="flex gap-2 items-center">
                                        <Input type="number" value={resetReading} onChange={e => setResetReading(e.target.value)} className="w-32" />
                                        <span className="text-sm text-muted-foreground">{selectedMeter.uom}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground py-1">Typically resets to 0. Historical net usage will be preserved for PM scheduling.</p>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsResetOpen(false)}>Cancel</Button>
                            <Button disabled={resetMutation.isPending} onClick={() => resetMutation.mutate()} className="bg-indigo-600 hover:bg-indigo-700">
                                <Save className="w-4 h-4 mr-2" /> Confirm Rollover
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-indigo-950/20 border-indigo-500/20">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-indigo-500">Total Active Meters</div>
                                <div className="text-3xl font-bold">1,204</div>
                            </div>
                            <Gauge className="w-8 h-8 text-indigo-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-red-500/50 bg-red-500/5">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-red-600">Pending Rollovers</div>
                                <div className="text-3xl font-bold text-red-600">1</div>
                                <div className="text-xs text-muted-foreground">{"< 1% from limit"}</div>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-red-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Meter Configuration Fleet</CardTitle>
                    <CardDescription>Review gauges approaching design limits and execute safe digital rollovers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Meter ID</TableHead>
                                <TableHead>Asset</TableHead>
                                <TableHead>Meter Name / Type</TableHead>
                                <TableHead className="text-right">Current Reading</TableHead>
                                <TableHead className="text-right">Rollover Limit</TableHead>
                                <TableHead>Health / Risk</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {meters?.map((meter: any) => {
                                const risk = calculateRolloverRisk(meter.reading, meter.rolloverLimit);
                                return (
                                    <TableRow key={meter.id}>
                                        <TableCell className="font-mono text-sm">{meter.id}</TableCell>
                                        <TableCell>{meter.assetId}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium">{meter.name}</span>
                                                <span className="text-xs text-muted-foreground">{meter.type}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatNumber(meter.reading)} <span className="text-xs text-muted-foreground ml-1">{meter.uom}</span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatNumber(meter.rolloverLimit)}
                                        </TableCell>
                                        <TableCell>
                                            {getRiskBadge(risk)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" variant={risk === "CRITICAL" ? "default" : "outline"} className={risk === "CRITICAL" ? "bg-red-600 hover:bg-red-700" : ""} onClick={() => handleOpenReset(meter)}>
                                                <RefreshCw className="w-4 h-4 mr-2" /> Reset
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
