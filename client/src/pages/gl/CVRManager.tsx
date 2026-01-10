
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Shield, Plus, Ban, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { GlCrossValidationRule, GlLedger } from "@shared/schema";
import { useLedger } from "@/context/LedgerContext";

export default function CVRManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { currentLedgerId, ledgers } = useLedger();
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<GlCrossValidationRule>>({
        ruleName: "",
        description: "",
        includeFilter: "Segment1=*", // Default: Apply to all companies
        excludeFilter: "", // Example: Segment2=999
        errorMessage: "This combination is invalid.",
        enabled: true
    });

    const activeLedger = ledgers.find(l => l.id === currentLedgerId);

    const { data: rules = [], isLoading } = useQuery<GlCrossValidationRule[]>({
        queryKey: ["/api/finance/gl/cvr", currentLedgerId],
        queryFn: async () => {
            if (!currentLedgerId) return [];
            const res = await apiRequest("GET", `/api/finance/gl/cvr?ledgerId=${currentLedgerId}`);
            return res.json();
        },
        enabled: !!currentLedgerId
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            return apiRequest("POST", "/api/finance/gl/cvr", { ...data, ledgerId: currentLedgerId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/finance/gl/cvr", currentLedgerId] });
            setIsAddOpen(false);
            setFormData({
                ruleName: "", description: "", includeFilter: "Segment1=*", excludeFilter: "", errorMessage: "This combination is invalid.", enabled: true
            });
            toast({ title: "Rule Created", description: "Cross-validation rule added successfully." });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const handleCreate = () => {
        if (!formData.ruleName || !formData.excludeFilter) {
            toast({ title: "Validation Error", description: "Rule Name and Exclude Condition are required.", variant: "destructive" });
            return;
        }
        createMutation.mutate(formData);
    };

    if (!currentLedgerId) {
        return <div className="p-8 text-center text-muted-foreground">Please select a ledger to manage rules.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Shield className="h-8 w-8 text-primary" /> Cross-Validation Rules
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Prevent invalid account combinations for <strong>{activeLedger?.name || "Unknown Ledger"}</strong>.
                    </p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-red-600 hover:bg-red-700 text-white">
                            <Plus className="mr-2 h-4 w-4" /> Create Block Rule
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Define Validation Rule</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Rule Name</Label>
                                    <Input
                                        value={formData.ruleName}
                                        onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
                                        placeholder="e.g. Block_CostCentre_999"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <div className="flex items-center space-x-2 pt-2">
                                        <Switch
                                            checked={formData.enabled}
                                            onCheckedChange={(c) => setFormData({ ...formData, enabled: c })}
                                        />
                                        <span className="text-sm text-muted-foreground">{formData.enabled ? "Active" : "Inactive"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <Card className="bg-slate-50 border-slate-200">
                                <CardContent className="pt-4 space-y-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" /> Condition Filter (Where applies)
                                        </Label>
                                        <Input
                                            value={formData.includeFilter}
                                            onChange={(e) => setFormData({ ...formData, includeFilter: e.target.value })}
                                            placeholder="e.g. Segment1=01 (Company 01 Only)"
                                            className="font-mono bg-white"
                                        />
                                        <p className="text-xs text-muted-foreground">Enter segment condition (e.g. Segment1=01). Use '*' for all.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Ban className="h-4 w-4 text-red-600" /> Exclude Filter (What is forbidden)
                                        </Label>
                                        <Input
                                            value={formData.excludeFilter}
                                            onChange={(e) => setFormData({ ...formData, excludeFilter: e.target.value })}
                                            placeholder="e.g. Segment2=999 (No Dummy Cost Centers)"
                                            className="font-mono bg-white border-red-200 focus-visible:ring-red-500"
                                        />
                                        <p className="text-xs text-muted-foreground">Defines the invalid values for the condition above.</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-2">
                                <Label>Error Message</Label>
                                <Input
                                    value={formData.errorMessage}
                                    onChange={(e) => setFormData({ ...formData, errorMessage: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={createMutation.isPending}>Create Rule</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Rules</CardTitle>
                    <CardDescription>
                        Total Rules: {rules.length}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Condition</TableHead>
                                <TableHead>Restriction</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={5} className="text-center h-24">Loading rules...</TableCell></TableRow>
                            ) : rules.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No rules defined.</TableCell></TableRow>
                            ) : (
                                rules.map((rule) => (
                                    <TableRow key={rule.id}>
                                        <TableCell className="font-medium">{rule.ruleName}</TableCell>
                                        <TableCell>{rule.description}</TableCell>
                                        <TableCell className="font-mono text-xs">{rule.includeFilter}</TableCell>
                                        <TableCell className="font-mono text-xs text-red-600">{rule.excludeFilter}</TableCell>
                                        <TableCell>
                                            {rule.enabled ?
                                                <Badge className="bg-green-600">Enabled</Badge> :
                                                <Badge variant="outline">Disabled</Badge>
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
