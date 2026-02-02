
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Percent, DollarSign } from "lucide-react";

export default function TransferPricingRules() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [newRule, setNewRule] = useState({
        providerOrgId: "",
        receiverOrgId: "",
        markupType: "PERCENTAGE",
        markupValue: "",
        description: ""
    });

    // Fetch Rules
    const { data: rules, isLoading } = useQuery({
        queryKey: ["ic-tp-rules"],
        queryFn: async () => {
            const res = await fetch("/api/intercompany/rules/tp");
            if (!res.ok) throw new Error("Failed to fetch rules");
            return res.json();
        }
    });

    // Create Rule Mutation
    const createRule = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/intercompany/rules/tp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newRule)
            });
            if (!res.ok) throw new Error("Failed to create rule");
        },
        onSuccess: () => {
            toast({ title: "Rule Created", description: "Transfer pricing rule added successfully." });
            setIsDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ["ic-tp-rules"] });
            setNewRule({ providerOrgId: "", receiverOrgId: "", markupType: "PERCENTAGE", markupValue: "", description: "" });
        }
    });

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Transfer Pricing Rules</CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm"><Plus className="mr-2 h-4 w-4" /> New Rule</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Add Transfer Pricing Rule</DialogTitle></DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Provider Org ID</label>
                                    {/* Ideally a Select from ic_orgs */}
                                    <Input placeholder="e.g. ICO-101" value={newRule.providerOrgId}
                                        onChange={e => setNewRule({ ...newRule, providerOrgId: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Receiver Org ID</label>
                                    <Input placeholder="e.g. ICO-102" value={newRule.receiverOrgId}
                                        onChange={e => setNewRule({ ...newRule, receiverOrgId: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Markup Type</label>
                                    <Select value={newRule.markupType} onValueChange={v => setNewRule({ ...newRule, markupType: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                                            <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Markup Value</label>
                                    <div className="relative">
                                        <Input placeholder="0.15 for 15%" value={newRule.markupValue}
                                            onChange={e => setNewRule({ ...newRule, markupValue: e.target.value })} />
                                        <div className="absolute right-3 top-2.5 text-muted-foreground">
                                            {newRule.markupType === "PERCENTAGE" ? <Percent className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">For 15%, enter 0.15</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Input placeholder="Optional description" value={newRule.description}
                                    onChange={e => setNewRule({ ...newRule, description: e.target.value })} />
                            </div>

                            <Button className="w-full" onClick={() => createRule.mutate()} disabled={createRule.isPending}>
                                {createRule.isPending ? "Saving..." : "Create Rule"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Provider</TableHead>
                                <TableHead>Receiver</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Description</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rules?.map((rule: any) => (
                                <TableRow key={rule.id}>
                                    <TableCell>{rule.providerOrgId}</TableCell>
                                    <TableCell>{rule.receiverOrgId}</TableCell>
                                    <TableCell>{rule.markupType}</TableCell>
                                    <TableCell>
                                        {rule.markupType === "PERCENTAGE"
                                            ? `${(Number(rule.markupValue) * 100).toFixed(2)}%`
                                            : rule.markupValue}
                                    </TableCell>
                                    <TableCell>{rule.description || "-"}</TableCell>
                                </TableRow>
                            ))}
                            {!rules?.length && (
                                <TableRow><TableCell colSpan={5} className="text-center p-4">No rules defined.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
