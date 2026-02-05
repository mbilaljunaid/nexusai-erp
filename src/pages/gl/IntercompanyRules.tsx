
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, ArrowRightLeft } from "lucide-react";
import { CodeCombinationPicker } from "@/components/gl/CodeCombinationPicker";
import { useToast } from "@/hooks/use-toast";

type IntercompanyRule = {
    id: string;
    fromCompany: string;
    toCompany: string;
    receivableAccountId: string;
    payableAccountId: string;
    enabled: boolean;
};

export default function IntercompanyRules() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Form State
    const [fromCompany, setFromCompany] = useState("");
    const [toCompany, setToCompany] = useState("");
    const [receivableId, setReceivableId] = useState("");
    const [payableId, setPayableId] = useState("");

    const { data: rules, isLoading } = useQuery<IntercompanyRule[]>({
        queryKey: ["/api/gl/intercompany-rules"],
    });

    const createRuleMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/gl/intercompany-rules", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/gl/intercompany-rules"] });
            setIsCreateOpen(false);
            resetForm();
            toast({
                title: "Rule Created",
                description: "Intercompany matching rule added successfully.",
            });
        },
        onError: (err) => {
            toast({
                title: "Error",
                description: "Failed to create rule.",
                variant: "destructive"
            });
        }
    });

    const resetForm = () => {
        setFromCompany("");
        setToCompany("");
        setReceivableId("");
        setPayableId("");
    };

    const handleSubmit = () => {
        // Basic validation
        if (!fromCompany || !toCompany || !receivableId || !payableId) {
            toast({
                title: "Validation Error",
                description: "All fields are required.",
                variant: "destructive"
            });
            return;
        }

        createRuleMutation.mutate({
            fromCompany,
            toCompany,
            receivableAccountId: receivableId,
            payableAccountId: payableId,
            enabled: true
        });
    };

    // Hardcoded Company List (In prod, fetch from Segment Values)
    const companies = [
        { id: "101", name: "101 - US Operations" },
        { id: "102", name: "102 - EMEA Operations" },
        { id: "99", name: "99 - Corporate" }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Intercompany Rules</h2>
                    <p className="text-muted-foreground">Configure manual and automatic balancing rules between legal entities.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Rule
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>From Company</TableHead>
                                <TableHead>To Company</TableHead>
                                <TableHead>Receivable Account (Due From)</TableHead>
                                <TableHead>Payable Account (Due To)</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : rules?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        No rules found. Create one to enable auto-balancing.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rules?.map((rule) => (
                                    <TableRow key={rule.id}>
                                        <TableCell className="font-medium">{rule.fromCompany}</TableCell>
                                        <TableCell>{rule.toCompany}</TableCell>
                                        <TableCell className="font-mono text-xs">{rule.receivableAccountId}</TableCell>
                                        <TableCell className="font-mono text-xs">{rule.payableAccountId}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs ${rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                                                {rule.enabled ? "Active" : "Disabled"}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Create Intercompany Rule</DialogTitle>
                        <CardDescription>
                            Define the relationship when "From Company" transactions impace "To Company".
                        </CardDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-6 py-4">
                        <div className="space-y-2">
                            <Label>From Company (Debtor/Payer)</Label>
                            <Select value={fromCompany} onValueChange={setFromCompany}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Company" />
                                </SelectTrigger>
                                <SelectContent>
                                    {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>To Company (Creditor/Payee)</Label>
                            <Select value={toCompany} onValueChange={setToCompany}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Company" />
                                </SelectTrigger>
                                <SelectContent>
                                    {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 col-span-2 border-t pt-4">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <ArrowRightLeft className="h-4 w-4" /> Balancing Entries
                            </h4>
                            <p className="text-sm text-muted-foreground mb-4">
                                When a journal creates an imbalance where <b>{fromCompany || "Company A"}</b> needs a Credit and <b>{toCompany || "Company B"}</b> needs a Debit:
                            </p>
                        </div>

                        <div className="space-y-2 col-span-1">
                            <Label>Receivable Account (Asset for {toCompany || "Co B"})</Label>
                            <div className="border rounded-md p-2 bg-muted/50">
                                <CodeCombinationPicker
                                    ledgerId="primary-ledger-001"
                                    value={receivableId}
                                    onChange={setReceivableId}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Account used to record "Due From {fromCompany}"</p>
                        </div>

                        <div className="space-y-2 col-span-1">
                            <Label>Payable Account (Liability for {fromCompany || "Co A"})</Label>
                            <div className="border rounded-md p-2 bg-muted/50">
                                <CodeCombinationPicker
                                    ledgerId="primary-ledger-001"
                                    value={payableId}
                                    onChange={setPayableId}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Account used to record "Due To {toCompany}"</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={createRuleMutation.isPending}>
                            {createRuleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Rule
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
