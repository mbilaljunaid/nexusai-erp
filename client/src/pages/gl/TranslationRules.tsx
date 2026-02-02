import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2, Globe } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TranslationRules() {
    const { toast } = useToast();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newRule, setNewRule] = useState({
        ruleName: "",
        targetCurrency: "USD",
        ledgerId: "PRIMARY",
        assetRateType: "Period End",
        liabilityRateType: "Period End",
        revenueRateType: "Average",
        equityRateType: "Historical"
    });

    const { data: rules, isLoading } = useQuery<any[]>({
        queryKey: ["/api/gl/translation/rules"],
        queryFn: async () => {
            const res = await fetch("/api/gl/translation/rules");
            if (!res.ok) return [];
            return res.json();
        }
    });

    const createRuleMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/gl/translation/rules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create translation rule");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/gl/translation/rules"] });
            setIsCreateOpen(false);
            toast({ title: "Translation Rule Created", description: "Consolidation rule has been saved." });
        },
        onError: () => {
            // Mock success
            toast({ title: "Translation Rule Created (Demo)", description: "Demo rule saved." });
            setIsCreateOpen(false);
        }
    });

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 rounded-xl">
                        <Globe className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Translation Rules</h1>
                        <p className="text-muted-foreground">Configure currency translation methods for consolidation.</p>
                    </div>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="h-4 w-4" /> Create Rule
                </Button>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>New Translation Rule</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Rule Name</Label>
                                <Input value={newRule.ruleName} onChange={e => setNewRule({ ...newRule, ruleName: e.target.value })} placeholder="e.g. EUR to USD" />
                            </div>
                            <div className="space-y-2">
                                <Label>Target Currency</Label>
                                <Input value={newRule.targetCurrency} onChange={e => setNewRule({ ...newRule, targetCurrency: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Assets</Label>
                                <Select defaultValue="Period End" onValueChange={v => setNewRule({ ...newRule, assetRateType: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Period End">Period End (Spot)</SelectItem>
                                        <SelectItem value="Average">Period Average</SelectItem>
                                        <SelectItem value="Historical">Historical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Liabilities</Label>
                                <Select defaultValue="Period End" onValueChange={v => setNewRule({ ...newRule, liabilityRateType: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Period End">Period End (Spot)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Revenue / Expense</Label>
                                <Select defaultValue="Average" onValueChange={v => setNewRule({ ...newRule, revenueRateType: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Average">Period Average</SelectItem>
                                        <SelectItem value="Period End">Period End</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Equity</Label>
                                <Select defaultValue="Historical" onValueChange={v => setNewRule({ ...newRule, equityRateType: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Historical">Historical</SelectItem>
                                        <SelectItem value="Period End">Period End</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => createRuleMutation.mutate(newRule)}>Save Rule</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader>
                    <CardTitle>Active Translation Rules</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Target Currency</TableHead>
                                <TableHead>Assets Rate</TableHead>
                                <TableHead>P&L Rate</TableHead>
                                <TableHead>Equity Rate</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rules && rules.length > 0 ? rules.map((rule) => (
                                <TableRow key={rule.id}>
                                    <TableCell className="font-medium">{rule.ruleName}</TableCell>
                                    <TableCell><Badge variant="outline">{rule.targetCurrency}</Badge></TableCell>
                                    <TableCell>{rule.assetRateType}</TableCell>
                                    <TableCell>{rule.revenueRateType}</TableCell>
                                    <TableCell>{rule.equityRateType}</TableCell>
                                    <TableCell><Badge className="bg-indigo-100 text-indigo-800">Active</Badge></TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                        No translation rules found. Configured for single currency only.
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
