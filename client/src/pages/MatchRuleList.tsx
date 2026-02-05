
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
import { Plus, Settings2, CheckCircle2, XCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function MatchRuleList() {
    const [location, setLocation] = useLocation();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch Rules
    const { data: rules = [], isLoading } = useQuery({
        queryKey: ["/api/mdm/match-rules"],
    });

    // Table Columns
    const columns = [
        { header: "Rule Name", accessorKey: "ruleName", sortable: true },
        {
            header: "Threshold", accessorKey: "matchScoreThreshold", cell: (row: any) => (
                <Badge variant="outline" className="font-mono">{row.matchScoreThreshold}%</Badge>
            )
        },
        {
            header: "Status", accessorKey: "activeFlag", cell: (row: any) => (
                <div className="flex items-center gap-2">
                    {row.activeFlag ?
                        <CheckCircle2 className="w-4 h-4 text-green-600" /> :
                        <XCircle className="w-4 h-4 text-gray-400" />
                    }
                    <span className={row.activeFlag ? "text-green-700" : "text-gray-500"}>
                        {row.activeFlag ? "Active" : "Inactive"}
                    </span>
                </div>
            )
        },
        { header: "Description", accessorKey: "description" },
        {
            header: "Actions", id: "actions", cell: (row: any) => (
                <Button variant="ghost" size="sm" onClick={() => setLocation(`/mdm/match-rules/${row.id}`)}>
                    <Settings2 className="h-4 w-4 mr-2" /> Configure
                </Button>
            )
        }
    ];

    // Create Mutation
    const [newRule, setNewRule] = useState({ ruleName: "", matchScoreThreshold: 80, description: "" });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/mdm/match-rules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/mdm/match-rules"] });
            setIsSheetOpen(false);
            setNewRule({ ruleName: "", matchScoreThreshold: 80, description: "" });
            toast({ title: "Success", description: "Match Rule created." });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const handleCreate = () => {
        if (!newRule.ruleName) {
            toast({ title: "Validation Error", description: "Rule Name is required.", variant: "destructive" });
            return;
        }
        createMutation.mutate(newRule);
    };

    return (
        <StandardPage
            title="Match Rules Configuration"
            description="Define strategies for duplicate detection (Scoring, Thresholds, Columns)"
            breadcrumbs={[{ label: "MDM", href: "/mdm/governance" }, { label: "Match Rules" }]}
            actions={
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Create Rule</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Create Match Rule</SheetTitle>
                        </SheetHeader>
                        <div className="space-y-4 mt-6">
                            <div>
                                <Label>Rule Name</Label>
                                <Input
                                    placeholder="e.g. STRICT_NAME_MATCH"
                                    value={newRule.ruleName}
                                    onChange={(e) => setNewRule({ ...newRule, ruleName: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Match Threshold (0-100)</Label>
                                <Input
                                    type="number"
                                    min={0} max={100}
                                    value={newRule.matchScoreThreshold}
                                    onChange={(e) => setNewRule({ ...newRule, matchScoreThreshold: Number(e.target.value) })}
                                />
                                <p className="text-xs text-muted-foreground mt-1">Minimum score required to consider a match.</p>
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Input
                                    value={newRule.description}
                                    onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                                />
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
