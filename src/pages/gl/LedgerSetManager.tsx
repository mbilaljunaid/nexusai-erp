import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit, Building2, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

interface LedgerSet {
    id: string;
    name: string;
    description?: string;
    reportingCurrency: string;
    status: "ACTIVE" | "INACTIVE";
    assignedLedgers: number;
}

interface Ledger {
    id: string;
    name: string;
    currencyCode: string;
    legalEntityName?: string;
}

interface LedgerAssignment {
    ledgerId: string;
    ledgerName: string;
    currencyCode: string;
    legalEntityName?: string;
}

export default function LedgerSetManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [newSet, setNewSet] = useState({
        name: "",
        description: "",
        reportingCurrency: "USD",
        status: "ACTIVE" as const
    });

    // Fetch ledger sets
    const { data: ledgerSets = [] } = useQuery<LedgerSet[]>({
        queryKey: ["ledger-sets"],
        queryFn: async () => {
            // Mock data - replace with actual API
            return [
                {
                    id: "GLOBAL_GRP",
                    name: "Global Consolidation Group",
                    description: "Worldwide consolidated financials",
                    reportingCurrency: "USD",
                    status: "ACTIVE",
                    assignedLedgers: 5
                },
                {
                    id: "NA_GRP",
                    name: "North America Group",
                    reportingCurrency: "USD",
                    status: "ACTIVE",
                    assignedLedgers: 2
                }
            ];
        }
    });

    // Fetch available ledgers for assignment
    const { data: availableLedgers = [] } = useQuery<Ledger[]>({
        queryKey: ["available-ledgers"],
        queryFn: async () => {
            const res = await fetch("/api/gl/ledgers");
            return res.json();
        }
    });

    // Fetch assignments for selected set
    const { data: assignments = [] } = useQuery<LedgerAssignment[]>({
        queryKey: ["ledger-assignments", selectedSetId],
        queryFn: async () => {
            // Mock - replace with API call
            return [
                { ledgerId: "US_LEDGER", ledgerName: "US Operations", currencyCode: "USD", legalEntityName: "Acme Corp USA" },
                { ledgerId: "UK_LEDGER", ledgerName: "UK Operations", currencyCode: "GBP", legalEntityName: "Acme Ltd UK" },
                { ledgerId: "EU_LEDGER", ledgerName: "EU Operations", currencyCode: "EUR", legalEntityName: "Acme GmbH Germany" }
            ];
        },
        enabled: !!selectedSetId
    });

    // Create ledger set mutation
    const createSetMutation = useMutation({
        mutationFn: async (setData: typeof newSet) => {
            const res = await fetch("/api/gl/consolidation/ledger-sets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(setData)
            });
            if (!res.ok) throw new Error("Failed to create ledger set");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ledger-sets"] });
            setIsCreateDialogOpen(false);
            setNewSet({ name: "", description: "", reportingCurrency: "USD", status: "ACTIVE" });
            toast({
                title: "Ledger Set Created",
                description: "Consolidation group created successfully."
            });
        }
    });

    // Toggle status mutation
    const toggleStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const res = await fetch(`/api/gl/consolidation/ledger-sets/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: status === "ACTIVE" ? "INACTIVE" : "ACTIVE" })
            });
            if (!res.ok) throw new Error("Failed to update status");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ledger-sets"] });
            toast({
                title: "Status Updated",
                description: "Ledger set status changed successfully."
            });
        }
    });

    const selectedSet = ledgerSets.find(s => s.id === selectedSetId);
    const uniqueCurrencies = new Set(assignments.map(a => a.currencyCode));

    return (
        <StandardPage
            title="Ledger Set Manager"
            description="Configure consolidation groups by assigning child ledgers to parent consolidation sets."
            breadcrumbs={[
                { label: "General Ledger", href: "/gl" },
                { label: "Consolidation", href: "/gl/consolidation" },
                { label: "Ledger Sets" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-blue-500/10 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase">Total Sets</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">{ledgerSets.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-500/10 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase">Active Sets</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900 dark:text-green-200">
                                {ledgerSets.filter(s => s.status === "ACTIVE").length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-500/10 border-purple-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-purple-800 uppercase">Total Ledgers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                                {ledgerSets.reduce((sum, s) => sum + s.assignedLedgers, 0)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-orange-500/10 border-orange-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-orange-800 uppercase">Currencies</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-900 dark:text-orange-200">{uniqueCurrencies.size}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Ledger Sets List */}
                    <Card className="lg:col-span-2 border-t-4 border-t-blue-500">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" /> Consolidation Groups
                                    </CardTitle>
                                    <CardDescription>Ledger sets for multi-entity consolidation</CardDescription>
                                </div>
                                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm">
                                            <Plus className="h-4 w-4 mr-2" /> New Set
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Create Ledger Set</DialogTitle>
                                            <DialogDescription>Define a new consolidation group</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="setName">Set Name *</Label>
                                                <Input
                                                    id="setName"
                                                    value={newSet.name}
                                                    onChange={(e) => setNewSet({ ...newSet, name: e.target.value })}
                                                    placeholder="e.g., EMEA Consolidation"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="description">Description</Label>
                                                <Input
                                                    id="description"
                                                    value={newSet.description}
                                                    onChange={(e) => setNewSet({ ...newSet, description: e.target.value })}
                                                    placeholder="Optional description"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="currency">Reporting Currency</Label>
                                                <Select
                                                    value={newSet.reportingCurrency}
                                                    onValueChange={(v) => setNewSet({ ...newSet, reportingCurrency: v })}
                                                >
                                                    <SelectTrigger id="currency">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                                                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                                                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                                            <Button
                                                onClick={() => createSetMutation.mutate(newSet)}
                                                disabled={createSetMutation.isPending || !newSet.name}
                                            >
                                                {createSetMutation.isPending ? "Creating..." : "Create Set"}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Set Name</TableHead>
                                        <TableHead>Currency</TableHead>
                                        <TableHead>Ledgers</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ledgerSets.map((set) => (
                                        <Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={() => setSelectedSetId(set.id)}>
                                        <TableRow
                                                                                    key={set.id}
                                                                                    className={selectedSetId === set.id ? "bg-blue-500/10" : "cursor-pointer hover:bg-muted/50"}
                                                                                >
                                                                                    <TableCell className="font-medium">
                                                                                        {set.name}
                                                                                        {set.description && (
                                                                                            <div className="text-xs text-muted-foreground">{set.description}</div>
                                                                                        )}
                                                                                    </TableCell>
                                                                                    <TableCell><Badge variant="outline">{set.reportingCurrency}</Badge></TableCell>
                                                                                    <TableCell>{set.assignedLedgers}</TableCell>
                                                                                    <TableCell>
                                                                                        <Switch
                                                                                            checked={set.status === "ACTIVE"}
                                                                                            onCheckedChange={() => toggleStatusMutation.mutate({ id: set.id, status: set.status })}
                                                                                            onClick={(e) => e.stopPropagation()}
                                                                                        />
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        <div className="flex gap-1">
                                                                                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); }} aria-label="Edit">
                                                                                                <Edit className="h-4 w-4" />
                                                                                            </Button>
                                                                                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); }} aria-label="Delete">
                                                                                                <Trash2 className="h-4 w-4" />
                                                                                            </Button>
                                                                                        </div>
                                                                                    </TableCell>
                                                                                </TableRow>
                                        </Button>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Ledger Assignments Panel */}
                    <Card className="lg:col-span-1 border-t-4 border-t-green-500">
                        <CardHeader>
                            <CardTitle className="text-sm">Assigned Ledgers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!selectedSet ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    Select a ledger set to view assignments
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-3 bg-muted rounded-lg">
                                        <h4 className="font-bold text-sm mb-1">{selectedSet.name}</h4>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <DollarSign className="h-3 w-3" />
                                            <span>Reporting: {selectedSet.reportingCurrency}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Child Ledgers</Label>
                                        {assignments.map((assignment) => (
                                            <Card key={assignment.ledgerId}>
                                                <CardContent className="pt-3 pb-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h5 className="font-medium text-sm">{assignment.ledgerName}</h5>
                                                            <p className="text-xs text-muted-foreground">{assignment.legalEntityName}</p>
                                                        </div>
                                                        <Badge variant="outline" className="text-xs">
                                                            {assignment.currencyCode}
                                                        </Badge>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                    <Button className="w-full" variant="outline" size="sm">
                                        <Plus className="h-4 w-4 mr-2" /> Assign Ledger
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
