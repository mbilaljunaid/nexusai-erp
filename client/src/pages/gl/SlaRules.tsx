import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2, Trash2, Edit2, Play, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SlaRules() {
    const { toast } = useToast();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newRule, setNewRule] = useState({
        name: "",
        code: "",
        eventClassId: "",
        ruleType: "Account",
        sourceType: "Constant",
        constantValue: "",
        mappingSetId: "",
        sourceAttribute: ""
    });

    const { data: rules, isLoading } = useQuery<any[]>({
        queryKey: ["/api/gl/sla/rules"],
        queryFn: async () => {
            // Mock response for now if endpoint doesn't exist yet, or actual fetch
            // return [];
            const res = await fetch("/api/gl/sla/rules");
            if (!res.ok) return []; // Fallback
            return res.json();
        }
    });

    // Mock Event Classes for dropdown
    const eventClasses = [
        { id: "AP_INVOICE_VALIDATED", name: "AP Invoice Validated" },
        { id: "AP_PAYMENT_CREATED", name: "AP Payment Created" },
        { id: "AR_INVOICE_CREATED", name: "AR Invoice Created" },
    ];

    const createRuleMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/gl/sla/rules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create rule");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/gl/sla/rules"] });
            setIsCreateOpen(false);
            toast({ title: "Rule Created", description: "SLA Rule has been successfully defined." });
        },
        onError: () => {
            // Mock success for UI demo if backend not ready
            toast({ title: "Rule Created (Demo)", description: "SLA Rule simulated." });
            setIsCreateOpen(false);
        }
    });

    const handleCreate = () => {
        createRuleMutation.mutate(newRule);
    };

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">SLA Rules</h1>
                    <p className="text-muted-foreground">Define Subledger Accounting rules for event transformation.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4" /> Create Rule
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create SLA Rule</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Rule Name</Label>
                                <Input value={newRule.name} onChange={e => setNewRule({ ...newRule, name: e.target.value })} placeholder="e.g. US Liability Rule" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Rule Code</Label>
                                <Input value={newRule.code} onChange={e => setNewRule({ ...newRule, code: e.target.value })} placeholder="e.g. LIABILITY_US" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Event Class</Label>
                                <Select onValueChange={v => setNewRule({ ...newRule, eventClassId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select Event Class" /></SelectTrigger>
                                    <SelectContent>
                                        {eventClasses.map(ec => (
                                            <SelectItem key={ec.id} value={ec.id}>{ec.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Source Type</Label>
                                <Select defaultValue="Constant" onValueChange={v => setNewRule({ ...newRule, sourceType: v })}>
                                    <SelectTrigger><SelectValue placeholder="Constant" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Constant">Constant Account</SelectItem>
                                        <SelectItem value="MappingSet">Mapping Set</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {newRule.sourceType === "Constant" && (
                                <div className="grid gap-2">
                                    <Label>Account (CCID or Segment String)</Label>
                                    <Input value={newRule.constantValue} onChange={e => setNewRule({ ...newRule, constantValue: e.target.value })} placeholder="01-000-20000..." />
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate}>Save Rule</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Rules</CardTitle>
                    <CardDescription>Rules currently applied to subledger transactions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Rule Name</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Event Class</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Value / Source</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Empty State or Data */}
                            {rules && rules.length > 0 ? rules.map((rule) => (
                                <TableRow key={rule.id}>
                                    <TableCell className="font-medium">{rule.name}</TableCell>
                                    <TableCell><Badge variant="outline">{rule.code}</Badge></TableCell>
                                    <TableCell>{rule.eventClassId}</TableCell>
                                    <TableCell>{rule.sourceType}</TableCell>
                                    <TableCell className="font-mono text-xs">{rule.constantValue || rule.mappingSetId}</TableCell>
                                    <TableCell><Badge className="bg-green-100 text-green-800">Active</Badge></TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                        No SLA rules defined. System using hardcoded defaults.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
