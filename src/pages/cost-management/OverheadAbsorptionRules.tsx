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
import { Plus, Percent, Factory, Calculator, Save, ToggleLeft, ToggleRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OverheadAbsorptionRules() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newRule, setNewRule] = useState({ name: "", basis: "MATERIAL_VALUE", rate: "", account: "" });

    const { data: rules, isLoading } = useQuery({
        queryKey: ["/api/cost-management/overhead-rules"],
        queryFn: async () => {
            // Stub backend data
            return [
                { id: "OHR-001", name: "Facility Electricity", basis: "MACHINE_HOURS", rateType: "FLAT_RATE", rateValue: 2.50, account: "5010-Overhead-Utilities", active: true },
                { id: "OHR-002", name: "Material Handling Burden", basis: "MATERIAL_VALUE", rateType: "PERCENTAGE", rateValue: 3.5, account: "5020-Overhead-MaterialHandling", active: true },
                { id: "OHR-003", name: "QA Admin Overhead", basis: "LABOR_HOURS", rateType: "FLAT_RATE", rateValue: 1.20, account: "5030-Overhead-QA", active: false },
            ];
        }
    });

    const createMutation = useMutation({
        mutationFn: async () => {
            return new Promise((resolve) => setTimeout(resolve, 800));
        },
        onSuccess: () => {
            setIsCreateOpen(false);
            setNewRule({ name: "", basis: "MATERIAL_VALUE", rate: "", account: "" });
            toast({ title: "Overhead Rule Created", description: "The new absorption rule has been added to the costing engine." });
        }
    });

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Overhead Absorption Engine</h1>
                    <p className="text-muted-foreground mt-1">Configure logic for absorbing indirect costs (facilities, admin, electricity) into standard product costs.</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4 mr-2" /> New Absorption Rule</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2"><Calculator className="w-5 h-5 text-emerald-600" /> Define Overhead Rule</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Rule Name</Label>
                                <Input value={newRule.name} onChange={e => setNewRule({ ...newRule, name: e.target.value })} placeholder="e.g. Warehouse Storage Burden" />
                            </div>
                            <div className="space-y-2">
                                <Label>Absorption Basis (Driver)</Label>
                                <Select value={newRule.basis} onValueChange={v => setNewRule({ ...newRule, basis: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MATERIAL_VALUE">Total Material Value</SelectItem>
                                        <SelectItem value="MATERIAL_QTY">Total Material Weight/Vol</SelectItem>
                                        <SelectItem value="MACHINE_HOURS">Machine Run Hours</SelectItem>
                                        <SelectItem value="LABOR_HOURS">Direct Labor Hours</SelectItem>
                                        <SelectItem value="UNIT_PRODUCED">Per Unit Produced</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Rate / Percentage</Label>
                                <div className="flex gap-2 relative">
                                    <Input type="number" value={newRule.rate} onChange={e => setNewRule({ ...newRule, rate: e.target.value })} placeholder="Amount..." className="flex-1 pr-8" />
                                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">{newRule.basis.includes("VALUE") ? "%" : "$/hr"}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Absorption Credit Account</Label>
                                <Select value={newRule.account} onValueChange={v => setNewRule({ ...newRule, account: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select GL Account" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5010">5010 - Manufacturing Overhead Pool</SelectItem>
                                        <SelectItem value="5020">5020 - Material Handling Pool</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button
                                disabled={!newRule.name || !newRule.rate || !newRule.account || createMutation.isPending}
                                onClick={() => createMutation.mutate()}
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                <Save className="w-4 h-4 mr-2" /> Save Rule
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <Factory className="w-4 h-4 text-emerald-600" /> Active Rules
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">2</div>
                        <p className="text-xs text-muted-foreground mt-1">Currently contributing to cost rollups</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <Percent className="w-4 h-4 text-emerald-600" /> Ave Overhead Burden
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">14.5%</div>
                        <p className="text-xs text-muted-foreground mt-1">Average burden applied across all SKUs</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Absorption Rule Master Data</CardTitle>
                    <CardDescription>Rules defining how non-direct expenses are apportioned to Standard and Actual item costs.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Rule ID</TableHead>
                                <TableHead>Rule Name</TableHead>
                                <TableHead>Absorption Basis (Driver)</TableHead>
                                <TableHead>Rate / Value</TableHead>
                                <TableHead>Credit Account</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rules?.map((rule: any) => (
                                <TableRow key={rule.id}>
                                    <TableCell className="font-medium">{rule.id}</TableCell>
                                    <TableCell>{rule.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{rule.basis.replace("_", " ")}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {rule.rateType === "PERCENTAGE" ? `${rule.rateValue}%` : `$${rule.rateValue.toFixed(2)}`}
                                    </TableCell>
                                    <TableCell className="text-xs font-mono">{rule.account}</TableCell>
                                    <TableCell>
                                        {rule.active ? (
                                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">
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
                                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No overhead absorption rules defined.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
