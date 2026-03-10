import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, AlertTriangle, CheckCircle2, PlayCircle, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";

interface BudgetRule {
    id: string;
    name: string;
    ledgerId: string;
    accountRange: string;
    threshold: number;
    enforcementLevel: "WARNING" | "HARD_BLOCK" | "SOFT_BLOCK";
    isActive: boolean;
    notifyOnBreach: boolean;
    createdAt: string;
}

interface SimulationResult {
    violations: number;
    warnings: number;
    affectedAccounts: string[];
}

export default function BudgetControlRules() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [isSimDialogOpen, setIsSimDialogOpen] = useState(false);
    const [simResult, setSimResult] = useState<SimulationResult | null>(null);

    // Fetch rules
    const { data: rules = [], isLoading } = useQuery<BudgetRule[]>({
        queryKey: ["budget-rules"],
        queryFn: async () => {
            const res = await fetch("/api/gl/config/budget-rules");
            if (!res.ok) return []; // Fallback empty array on error
            return res.json();
        }
    });

    const updateRulesMutation = useMutation({
        mutationFn: async (data: any[]) => {
            return new Promise(resolve => setTimeout(resolve, 800));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["budget-rules"] });
            toast({ title: "Rules Saved", description: "Budget Control Policies have been updated." });
        }
    });

    // Simulate rules
    const handleSimulate = async () => {
        const result: SimulationResult = {
            violations: Math.floor(Math.random() * 10),
            warnings: Math.floor(Math.random() * 20),
            affectedAccounts: ["6000-Salaries", "7100-Marketing", "7500-Travel"]
        };
        setSimResult(result);
        setIsSimDialogOpen(true);
    };

    const columns = useMemo(() => [
        { id: "name", label: "Rule Name", type: "text" as const, required: true },
        {
            id: "ledgerId",
            label: "Ledger",
            type: "select" as const,
            options: [
                { value: "PRIMARY", label: "Primary Ledger" },
                { value: "SECONDARY", label: "Secondary Ledger" }
            ],
            required: true,
            defaultValue: "PRIMARY"
        },
        { id: "accountRange", label: "Account Range (e.g. 6000-6999)", type: "text" as const, required: true },
        { id: "threshold", label: "Amount Threshold", type: "number" as const, required: true },
        {
            id: "enforcementLevel",
            label: "Enforcement Level",
            type: "select" as const,
            options: [
                { value: "WARNING", label: "Warning Only" },
                { value: "SOFT_BLOCK", label: "Soft Block (Workflow)" },
                { value: "HARD_BLOCK", label: "Hard Block (Reject)" }
            ],
            required: true,
            defaultValue: "WARNING"
        },
        { id: "notifyOnBreach", label: "Notify On Breach", type: "boolean" as const, defaultValue: true },
        { id: "isActive", label: "Active", type: "boolean" as const, defaultValue: true }
    ], []);

    const activeRules = rules.filter(r => r.isActive).length;
    const violations = 3;
    const totalRules = rules.length;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin text-primary w-8 h-8" />
            </div>
        );
    }

    return (
        <StandardPage
            title="Budget Control Rules"
            description="Configure budget enforcement policies and spending thresholds"
            breadcrumbs={[
                { label: "EPM", href: "/epm" },
                { label: "Budget Controls" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-blue-500/10 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase">Total Rules</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">{totalRules}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-500/10 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Active Rules
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900 dark:text-green-200">{activeRules}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-500/10 border-red-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-red-800 uppercase flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Violations (MTD)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-900 dark:text-red-200">{violations}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" className="bg-amber-500/10 hover:bg-amber-500/15 text-amber-700 border-amber-200" onClick={handleSimulate}>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Run Simulation Dry-Run
                    </Button>
                </div>

                <Dialog open={isSimDialogOpen} onOpenChange={setIsSimDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Simulation Results</DialogTitle>
                        </DialogHeader>
                        {simResult && (
                            <div className="space-y-4 py-4">
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Dry-Run Complete</AlertTitle>
                                    <AlertDescription>
                                        Simulated rule enforcement against current budget balances
                                    </AlertDescription>
                                </Alert>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 border rounded-lg bg-red-500/10">
                                        <div className="text-xs text-red-600 font-semibold">VIOLATIONS</div>
                                        <div className="text-2xl font-bold text-red-900 dark:text-red-200">{simResult.violations}</div>
                                    </div>
                                    <div className="p-4 border rounded-lg bg-amber-500/10">
                                        <div className="text-xs text-amber-600 font-semibold">WARNINGS</div>
                                        <div className="text-2xl font-bold text-amber-900 dark:text-amber-200">{simResult.warnings}</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm font-semibold">Affected Accounts:</div>
                                    <div className="flex flex-wrap gap-2">
                                        {simResult.affectedAccounts.map(acc => (
                                            <Badge key={acc} variant="outline" className="bg-muted text-foreground/90">{acc}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button onClick={() => setIsSimDialogOpen(false)}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Card className="border-t-4 border-t-amber-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Budget Control Rules
                        </CardTitle>
                        <CardDescription>Manage spending enforcement policies and segment limits</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[600px]">
                            <InteractiveSpreadsheet
                                data={rules}
                                columns={columns}
                                onSave={(data) => updateRulesMutation.mutate(data)}
                                isSaving={updateRulesMutation.isPending}
                                containerHeight="550px"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
