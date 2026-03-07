import { formatDate } from "@/lib/dateUtils";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Plus, CheckCircle2, BarChart3, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BudgetVersion {
    id: string;
    projectId: string;
    versionName: string;
    versionType: string;
    status: "DRAFT" | "BASELINED" | "HISTORICAL";
    currentFlag: boolean;
    baselineDate?: string;
    totalAmount?: number;
}

interface BudgetLine {
    id: string;
    versionId: string;
    taskId?: string;
    taskName?: string;
    periodName?: string;
    amount: number;
    quantity?: number;
}

export default function BudgetConfiguration() {
    const { projectId } = useParams<{ projectId: string }>();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newVersion, setNewVersion] = useState({
        versionName: "",
        versionType: "COST",
        description: ""
    });

    // Fetch budget versions
    const { data: versions = [] } = useQuery<BudgetVersion[]>({
        queryKey: ["budget-versions", projectId],
        queryFn: async () => {
            const res = await fetch(`/api/ppm/planning/${projectId}/budget`);
            return res.json();
        },
        enabled: !!projectId
    });

    // Fetch budget lines for selected version
    const { data: budgetLines = [] } = useQuery<BudgetLine[]>({
        queryKey: ["budget-lines", selectedVersionId],
        queryFn: async () => {
            // Mock - replace with actual API
            return [];
        },
        enabled: !!selectedVersionId
    });

    // Create budget version mutation
    const createVersionMutation = useMutation({
        mutationFn: async (versionData: typeof newVersion) => {
            const res = await fetch(`/api/ppm/planning/${projectId}/budget`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(versionData)
            });
            if (!res.ok) throw new Error("Failed to create budget version");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["budget-versions"] });
            setIsCreateDialogOpen(false);
            setNewVersion({ versionName: "", versionType: "COST", description: "" });
            toast({
                title: "Budget Version Created",
                description: "New budget version created successfully."
            });
        }
    });

    // Baseline budget mutation
    const baselineMutation = useMutation({
        mutationFn: async (versionId: string) => {
            const res = await fetch(`/api/ppm/planning/budget/${versionId}/baseline`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            if (!res.ok) throw new Error("Failed to baseline budget");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["budget-versions"] });
            toast({
                title: "Budget Baselined",
                description: "Budget version has been baselined.",
            });
        }
    });

    const selectedVersion = versions.find(v => v.id === selectedVersionId);
    const currentVersion = versions.find(v => v.currentFlag);



    return (
        <StandardPage
            title="Budget Configuration"
            description="Manage project budget versions and baseline planning."
            breadcrumbs={[
                { label: "Projects", href: "/projects" },
                { label: "Budget" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-blue-500/10 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase">Budget Versions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">{versions.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-500/10 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase">Current Budget</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900 dark:text-green-200">
                                ${(currentVersion?.totalAmount || 0).toFixed(0)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-500/10 border-purple-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-purple-800 uppercase">Baselined</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                                {versions.filter(v => v.status === "BASELINED").length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-orange-500/10 border-orange-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-orange-800 uppercase">Draft</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-900 dark:text-orange-200">
                                {versions.filter(v => v.status === "DRAFT").length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Budget Versions */}
                    <Card className="lg:col-span-2 border-t-4 border-t-blue-500">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5" /> Budget Versions
                                    </CardTitle>
                                    <CardDescription>Project budget planning versions.</CardDescription>
                                </div>
                                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm">
                                            <Plus className="h-4 w-4 mr-2" /> New Version
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Create Budget Version</DialogTitle>
                                            <DialogDescription>Create a new budget version for planning.</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="versionName">Version Name *</Label>
                                                <Input
                                                    id="versionName"
                                                    value={newVersion.versionName}
                                                    onChange={(e) => setNewVersion({ ...newVersion, versionName: e.target.value })}
                                                    placeholder="e.g., Original V1"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="versionType">Type</Label>
                                                <Select value={newVersion.versionType} onValueChange={(v) => setNewVersion({ ...newVersion, versionType: v })}>
                                                    <SelectTrigger id="versionType">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="COST">Cost Budget</SelectItem>
                                                        <SelectItem value="REVENUE">Revenue Budget</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                                            <Button
                                                onClick={() => createVersionMutation.mutate(newVersion)}
                                                disabled={createVersionMutation.isPending || !newVersion.versionName}
                                            >
                                                {createVersionMutation.isPending ? "Creating..." : "Create Version"}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {versions.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No budget versions created yet. Click "New Version" to start.</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Version Name</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Baseline Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {versions.map((version) => (
                                            <Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={() => setSelectedVersionId(version.id)}>
                                            <TableRow
                                                                                            key={version.id}
                                                                                            className={selectedVersionId === version.id ? "bg-blue-500/10 cursor-pointer" : "cursor-pointer hover:bg-muted/50"}
                                                                                        >
                                                                                            <TableCell className="font-medium">{version.versionName}</TableCell>
                                                                                            <TableCell><Badge variant="outline">{version.versionType}</Badge></TableCell>
                                                                                            <TableCell className="text-right font-mono">
                                                                                                ${(version.totalAmount || 0).toFixed(2)}
                                                                                            </TableCell>
                                                                                            <TableCell><StatusBadge status={version.currentFlag ? "CURRENT" : version.status} /></TableCell>
                                                                                            <TableCell className="text-xs text-muted-foreground">
                                                                                                {version.baselineDate ? formatDate(version.baselineDate) : "—"}
                                                                                            </TableCell>
                                                                                        </TableRow>
                                            </Button>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    {/* Version Actions */}
                    <Card className="lg:col-span-1 border-t-4 border-t-purple-500">
                        <CardHeader>
                            <CardTitle className="text-sm">Version Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!selectedVersion ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    Select a version to view details and actions
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-3 bg-muted rounded-lg space-y-2">
                                        <h4 className="font-bold text-sm">{selectedVersion.versionName}</h4>
                                        <div className="flex justify-between text-xs pt-2 border-t">
                                            <span className="text-muted-foreground">Status:</span>
                                            <StatusBadge status={selectedVersion.currentFlag ? "CURRENT" : selectedVersion.status} />
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Total:</span>
                                            <span className="font-mono font-bold">${(selectedVersion.totalAmount || 0).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Button
                                            className="w-full justify-start"
                                            variant={selectedVersion.status === "DRAFT" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => baselineMutation.mutate(selectedVersion.id)}
                                            disabled={selectedVersion.status !== "DRAFT" || baselineMutation.isPending}
                                        >
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                            {baselineMutation.isPending ? "Processing..." : "Baseline Budget"}
                                        </Button>
                                    </div>

                                    {budgetLines.length > 0 && (
                                        <div className="space-y-2">
                                            <h5 className="text-xs font-bold uppercase text-muted-foreground">Budget Lines</h5>
                                            <div className="max-h-64 overflow-y-auto space-y-1">
                                                {budgetLines.map((line) => (
                                                    <div key={line.id} className="p-2 bg-card rounded border text-xs">
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">{line.taskName || "Project Level"}</span>
                                                            <span className="font-mono">${line.amount.toFixed(2)}</span>
                                                        </div>
                                                        {line.periodName && (
                                                            <div className="text-[10px] text-muted-foreground">{line.periodName}</div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
