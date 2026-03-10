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
import { Activity, Thermometer, Gauge, Zap, Save, Plus, AlertCircle, ToggleLeft, ToggleRight, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CBMRulesEngine() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const [newRule, setNewRule] = useState({
        name: "",
        assetGroup: "ALL_PUMPS",
        sensorType: "VIBRATION",
        operator: "GREATER_THAN",
        threshold: "",
        action: "CREATE_WORK_ORDER",
        severity: "HIGH"
    });

    const { data: rules, isLoading } = useQuery({
        queryKey: ["/api/maintenance/cbm-rules"],
        queryFn: async () => {
            // Stub backend data
            return [
                { id: "CBM-001", name: "Excessive Pump Vibration", assetGroup: "Pumps (Centrifugal)", sensorType: "VIBRATION", condition: "> 8.5 mm/s", action: "Trigger Inspection WO", status: "ACTIVE", severity: "HIGH" },
                { id: "CBM-002", name: "Motor Overheating", assetGroup: "Facility Motors", sensorType: "TEMPERATURE", condition: "> 85 °C", action: "Urgent Repair WO", status: "ACTIVE", severity: "CRITICAL" },
                { id: "CBM-003", name: "HVAC Pressure Drop", assetGroup: "HVAC Systems", sensorType: "PRESSURE", condition: "< 2.1 bar", action: "Filter Replacement WO", status: "INACTIVE", severity: "MEDIUM" },
            ];
        }
    });

    const createMutation = useMutation({
        mutationFn: async () => {
            return new Promise((resolve) => setTimeout(resolve, 800));
        },
        onSuccess: () => {
            setIsCreateOpen(false);
            setNewRule({ name: "", assetGroup: "ALL_PUMPS", sensorType: "VIBRATION", operator: "GREATER_THAN", threshold: "", action: "CREATE_WORK_ORDER", severity: "HIGH" });
            toast({ title: "CBM Rule Deployed", description: "The new IoT Condition-Based Maintenance rule is now actively monitoring." });
        }
    });

    const getSensorIcon = (type: string) => {
        switch (type) {
            case "VIBRATION": return <Activity className="w-4 h-4 text-purple-500" />;
            case "TEMPERATURE": return <Thermometer className="w-4 h-4 text-orange-500" />;
            case "PRESSURE": return <Gauge className="w-4 h-4 text-blue-500" />;
            case "ELECTRICAL": return <Zap className="w-4 h-4 text-yellow-500" />;
            default: return <Settings className="w-4 h-4 text-muted-foreground" />;
        }
    };

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case "CRITICAL": return <Badge variant="destructive">Critical</Badge>;
            case "HIGH": return <Badge variant="secondary" className="bg-orange-100 text-orange-800">High</Badge>;
            case "MEDIUM": return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
            default: return <Badge variant="outline">{severity}</Badge>;
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Condition-Based Maintenance (CBM)</h1>
                    <p className="text-muted-foreground mt-1">Configure automated workflows triggered by real-time IoT sensor telemetries.</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" /> New CBM Rule</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-blue-600" /> Define Telemetry Rule</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-2 col-span-2">
                                <Label>Rule Name</Label>
                                <Input value={newRule.name} onChange={e => setNewRule({ ...newRule, name: e.target.value })} placeholder="e.g. Conveyor Belt Temp Anomaly" />
                            </div>
                            <div className="space-y-2">
                                <Label>Target Asset / Group</Label>
                                <Select value={newRule.assetGroup} onValueChange={v => setNewRule({ ...newRule, assetGroup: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL_PUMPS">All Centrifugal Pumps</SelectItem>
                                        <SelectItem value="MOTORS">Facility Motors</SelectItem>
                                        <SelectItem value="HVAC">HVAC Systems</SelectItem>
                                        <SelectItem value="CNC_MACHINES">CNC Machining Centers</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Sensor Type</Label>
                                <Select value={newRule.sensorType} onValueChange={v => setNewRule({ ...newRule, sensorType: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="VIBRATION">Vibration (mm/s)</SelectItem>
                                        <SelectItem value="TEMPERATURE">Temperature (°C)</SelectItem>
                                        <SelectItem value="PRESSURE">Pressure (bar)</SelectItem>
                                        <SelectItem value="ELECTRICAL">Current (Amps)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 col-span-2 border-t pt-4">
                                <Label>Condition Logic</Label>
                                <div className="flex gap-2 items-center">
                                    <span className="text-sm font-medium text-muted-foreground w-16">IF value</span>
                                    <Select value={newRule.operator} onValueChange={v => setNewRule({ ...newRule, operator: v })}>
                                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="GREATER_THAN">{'<'}</SelectItem>
                                            <SelectItem value="LESS_THAN">{'>'}</SelectItem>
                                            <SelectItem value="EQUAL_TO">{'='}</SelectItem>
                                            <SelectItem value="OUTSIDE_RANGE">Out of Range</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input placeholder="Threshold" type="number" className="flex-1" value={newRule.threshold} onChange={e => setNewRule({ ...newRule, threshold: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2 col-span-2 border-t pt-4">
                                <Label>Automated Action</Label>
                                <Select value={newRule.action} onValueChange={v => setNewRule({ ...newRule, action: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CREATE_WORK_ORDER">Auto-Create Work Order</SelectItem>
                                        <SelectItem value="CREATE_REQUEST">Generate Maintenance Request</SelectItem>
                                        <SelectItem value="ALERT_ONLY">Send High-Priority Alert</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label>Action Severity</Label>
                                <Select value={newRule.severity} onValueChange={v => setNewRule({ ...newRule, severity: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CRITICAL">Critical (Immediate Dispatch)</SelectItem>
                                        <SelectItem value="HIGH">High (Next Shift)</SelectItem>
                                        <SelectItem value="MEDIUM">Medium (Within 3 Days)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button
                                disabled={!newRule.name || !newRule.threshold || createMutation.isPending}
                                onClick={() => createMutation.mutate()}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Save className="w-4 h-4 mr-2" /> Deploy Rule
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-blue-950/20 border-blue-500/20">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-blue-500">Active IoT Rules</div>
                                <div className="text-3xl font-bold">48</div>
                            </div>
                            <Activity className="w-8 h-8 text-blue-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-muted-foreground">WO Triggered (30d)</div>
                                <div className="text-3xl font-bold">112</div>
                            </div>
                            <AlertCircle className="w-8 h-8 text-orange-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Configured Telemetry Triggers</CardTitle>
                    <CardDescription>Rules mapping connected machinery signals to ERP maintenance workflows.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Rule Name</TableHead>
                                <TableHead>Asset Class</TableHead>
                                <TableHead>Sensor Trigger</TableHead>
                                <TableHead>Condition</TableHead>
                                <TableHead>Action / Severity</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rules?.map((rule: any) => (
                                <TableRow key={rule.id}>
                                    <TableCell className="font-medium">{rule.name}</TableCell>
                                    <TableCell>{rule.assetGroup}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getSensorIcon(rule.sensorType)}
                                            <span className="text-xs uppercase">{rule.sensorType}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">{rule.condition}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 items-start">
                                            <span className="text-sm">{rule.action}</span>
                                            {getSeverityBadge(rule.severity)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {rule.status === "ACTIVE" ? (
                                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                                                <ToggleRight className="w-3 h-3 mr-1" /> Active
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-muted-foreground">
                                                <ToggleLeft className="w-3 h-3 mr-1" /> Inactive
                                            </Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!isLoading && (!rules || rules.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No CBM rules defined.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
