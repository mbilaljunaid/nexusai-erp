import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Calendar, CheckSquare } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { BillingRule } from "@shared/schema/billing_enterprise";

export default function BillingRulesManager() {
    const { toast } = useToast();
    const [page, setPage] = useState(1);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [newRule, setNewRule] = useState<Partial<BillingRule>>({
        name: "",
        ruleType: "RECURRING",
        frequency: "MONTHLY",
        usageUnit: "",
        milestonePercentage: "0",
        isActive: true
    });

    // Fetch Rules
    const { data: rules = [], isLoading } = useQuery<BillingRule[]>({
        queryKey: ["/api/billing/rules"],
        queryFn: () => fetch("/api/billing/rules").then(r => r.json()),
        initialData: []
    });

    // Create Rule Mutation
    const createRuleMutation = useMutation({
        mutationFn: (rule: Partial<BillingRule>) =>
            fetch("/api/billing/rules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(rule)
            }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/billing/rules"] });
            setIsDialogOpen(false);
            toast({ title: "Success", description: "Billing Rule Created" });
        },
        onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });

    const columns: Column<BillingRule>[] = [
        { header: "Name", accessorKey: "name" },
        {
            header: "Type",
            accessorKey: "ruleType",
            cell: (r) => <Badge variant="outline">{r.ruleType}</Badge>
        },
        { header: "Frequency", accessorKey: "frequency" },
        {
            header: "Status",
            accessorKey: "isActive",
            cell: (r) => <Badge variant={r.isActive ? "default" : "secondary"}>{r.isActive ? "Active" : "Inactive"}</Badge>
        },
        {
            header: "Actions",
            id: "actions",
            cell: (r) => (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                    <Trash2 className="w-4 h-4" />
                </Button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Billing Rules</h1>
                    <p className="text-muted-foreground">Configure recurring schedules and milestone defaults.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2"><Plus className="w-4 h-4" /> New Rule</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Billing Rule</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Rule Name</Label>
                                <Input
                                    value={newRule.name}
                                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                                    placeholder="e.g. Monthly Standard Subscription"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select
                                        value={newRule.ruleType}
                                        onValueChange={(v) => setNewRule({ ...newRule, ruleType: v })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="RECURRING">Recurring</SelectItem>
                                            <SelectItem value="MILESTONE">Milestone</SelectItem>
                                            <SelectItem value="USAGE">Usage</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Frequency</Label>
                                    <Select
                                        value={newRule.frequency}
                                        onValueChange={(v) => setNewRule({ ...newRule, frequency: v })}
                                        disabled={newRule.ruleType !== "RECURRING"}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                                            <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                                            <SelectItem value="ANNUALLY">Annually</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button
                                className="w-full"
                                onClick={() => createRuleMutation.mutate(newRule)}
                                disabled={createRuleMutation.isPending}
                            >
                                {createRuleMutation.isPending ? "Saving..." : "Create Rule"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent className="p-0">
                    <StandardTable
                        data={rules}
                        columns={columns}
                        isLoading={isLoading}
                        page={page}
                        pageSize={50}
                        totalItems={rules.length}
                        onPageChange={setPage}
                        keyExtractor={(r) => r.id}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
