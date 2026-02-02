
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, ShieldAlert, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function CVRManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const ledgerId = "PRIMARY"; // Context

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<any>(null);

    const [formData, setFormData] = useState({
        ruleName: "",
        description: "",
        includeFilter: "",
        excludeFilter: "",
        errorMessage: "",
        errorAction: "Error",
        isEnabled: true
    });

    const { data: rules = [], isLoading } = useQuery({
        queryKey: ["/api/gl/cvr", ledgerId],
        queryFn: async () => {
            const res = await apiRequest("GET", `/api/gl/cvr?ledgerId=${ledgerId}`);
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            return apiRequest("POST", "/api/gl/cvr", { ...data, ledgerId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/gl/cvr"] });
            setIsCreateOpen(false);
            setFormData({
                ruleName: "", description: "", includeFilter: "",
                excludeFilter: "", errorMessage: "", errorAction: "Error", isEnabled: true
            });
            toast({ title: "Rule Created", description: "Cross-Validation Rule active." });
        }
    });

    const handleSave = () => {
        if (!formData.ruleName) return;
        createMutation.mutate(formData);
    };

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        <ShieldAlert className="h-8 w-8 text-rose-600" />
                        Cross-Validation Rules
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Prevent invalid account combinations (e.g., Cost Center 100 cannot use Account 5000).
                    </p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-rose-600 hover:bg-rose-700">
                    <Plus className="mr-2 h-4 w-4" /> Create Rule
                </Button>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Active Rules</CardTitle>
                        <CardDescription>Rules are evaluated in order during journal entry.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Rule Name</TableHead>
                                    <TableHead>Condition (Include)</TableHead>
                                    <TableHead>Validation (Exclude)</TableHead>
                                    <TableHead>Error Message</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow>
                                ) : rules.length === 0 ? (
                                    <TableRow><TableCell colSpan={6}>No CVRs defined.</TableCell></TableRow>
                                ) : (
                                    rules.map((rule: any) => (
                                        <TableRow key={rule.id}>
                                            <TableCell className="font-medium">{rule.ruleName}</TableCell>
                                            <TableCell className="font-mono text-xs">{rule.includeFilter || "*"}</TableCell>
                                            <TableCell className="font-mono text-xs">{rule.excludeFilter || "(None)"}</TableCell>
                                            <TableCell className="text-muted-foreground italic text-sm">{rule.errorMessage}</TableCell>
                                            <TableCell>
                                                <Badge variant={rule.isEnabled ? "default" : "secondary"}>
                                                    {rule.isEnabled ? "Active" : "Disabled"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Define Cross-Validation Rule</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Rule Name</Label>
                                <Input value={formData.ruleName} onChange={e => setFormData({ ...formData, ruleName: e.target.value })} placeholder="Block CC-100 Expenses" />
                            </div>
                            <div className="space-y-2">
                                <Label>Error Message</Label>
                                <Input value={formData.errorMessage} onChange={e => setFormData({ ...formData, errorMessage: e.target.value })} placeholder="Cost Center 100 cannot book expenses." />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    Condition Filter
                                    <Badge variant="outline">If this matches...</Badge>
                                </Label>
                                <Input value={formData.includeFilter} onChange={e => setFormData({ ...formData, includeFilter: e.target.value })} placeholder="Segment2=100" className="font-mono" />
                                <p className="text-xs text-muted-foreground">e.g. Segment2=100 (Cost Center)</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    Validation Filter
                                    <Badge variant="destructive" className="bg-rose-100 text-rose-800 border-none">Then BLOCK this...</Badge>
                                </Label>
                                <Input value={formData.excludeFilter} onChange={e => setFormData({ ...formData, excludeFilter: e.target.value })} placeholder="Segment3=5000-5999" className="font-mono" />
                                <p className="text-xs text-muted-foreground">e.g. Segment3=5000-5999 (Expenses)</p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSave} disabled={createMutation.isPending}>Save Rule</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
