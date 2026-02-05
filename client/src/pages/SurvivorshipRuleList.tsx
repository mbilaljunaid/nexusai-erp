
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { StandardTable } from "@/components/ui/StandardTable";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Plus, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function SurvivorshipRuleList() {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch Rules
    const { data: rules = [], isLoading } = useQuery({
        queryKey: ["/api/mdm/survivorship-rules"],
    });

    // Table Columns
    const columns = [
        { header: "Rule Name", accessorKey: "ruleName", sortable: true },
        {
            header: "Source System", accessorKey: "sourceSystem", cell: (row: any) => (
                <Badge variant="secondary">{row.sourceSystem}</Badge>
            )
        },
        {
            header: "Confidence", accessorKey: "confidenceScore", cell: (row: any) => (
                <span className="font-mono">{row.confidenceScore}%</span>
            )
        },
        {
            header: "Status", accessorKey: "activeFlag", cell: (row: any) => (
                <div className="flex items-center gap-2">
                    {row.activeFlag ?
                        <CheckCircle2 className="w-4 h-4 text-green-600" /> :
                        <XCircle className="w-4 h-4 text-gray-400" />
                    }
                </div>
            )
        },
        {
            header: "Actions", id: "actions", cell: (row: any) => (
                <Button variant="ghost" size="sm" onClick={() => handleToggle(row)}>
                    Toggle Status
                </Button>
            )
        }
    ];

    // Toggle Status Mutation
    const updateMutation = useMutation({
        mutationFn: async (row: any) => {
            const res = await fetch(`/api/mdm/survivorship-rules/${row.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ activeFlag: !row.activeFlag }),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/mdm/survivorship-rules"] });
            toast({ title: "Updated", description: "Rule status updated." });
        },
    });

    const handleToggle = (row: any) => {
        updateMutation.mutate(row);
    };

    // Create Mutation
    const [newRule, setNewRule] = useState({ ruleName: "", sourceSystem: "", confidenceScore: 100, activeFlag: true });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/mdm/survivorship-rules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/mdm/survivorship-rules"] });
            setIsSheetOpen(false);
            setNewRule({ ruleName: "", sourceSystem: "", confidenceScore: 100, activeFlag: true });
            toast({ title: "Success", description: "Survivorship Rule created." });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const handleCreate = () => {
        if (!newRule.ruleName || !newRule.sourceSystem) {
            toast({ title: "Validation Error", description: "Name and Source System are required.", variant: "destructive" });
            return;
        }
        createMutation.mutate(newRule);
    };

    return (
        <StandardPage
            title="Survivorship Rules"
            description="Define source system confidence for Golden Record calculation"
            breadcrumbs={[{ label: "MDM", href: "/mdm/governance" }, { label: "Survivorship" }]}
            actions={
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Create Rule</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Create Survivorship Rule</SheetTitle>
                        </SheetHeader>
                        <div className="space-y-4 mt-6">
                            <div>
                                <Label>Rule Name</Label>
                                <Input
                                    placeholder="e.g. CRM Reliability"
                                    value={newRule.ruleName}
                                    onChange={(e) => setNewRule({ ...newRule, ruleName: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Source System</Label>
                                <Input
                                    placeholder="e.g. CRM, SAP, LEGACY"
                                    value={newRule.sourceSystem}
                                    onChange={(e) => setNewRule({ ...newRule, sourceSystem: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Confidence Score (0-100)</Label>
                                <Input
                                    type="number"
                                    min={0} max={100}
                                    value={newRule.confidenceScore}
                                    onChange={(e) => setNewRule({ ...newRule, confidenceScore: Number(e.target.value) })}
                                />
                                <p className="text-xs text-muted-foreground mt-1">Higher score wins in a merge.</p>
                            </div>
                            <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
                                {createMutation.isPending ? "Creating..." : "Create Rule"}
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            }
        >
            <Card>
                <CardContent className="p-0">
                    <StandardTable
                        data={rules}
                        columns={columns}
                        loading={isLoading}
                        filterColumn="ruleName"
                        filterPlaceholder="Search rules..."
                    />
                </CardContent>
            </Card>
        </StandardPage>
    );
}
