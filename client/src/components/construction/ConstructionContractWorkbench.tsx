import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Hammer, FileText, DollarSign, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VariationManager from "@/components/construction/VariationManager";
import { StandardTable, Column } from "../tables/StandardTable";
import { CostCode } from "@shared/schema";

interface Project {
    id: string;
    projectNumber: string;
    name: string;
}

interface Contract {
    id: string;
    contractNumber: string;
    subject: string;
    description: string;
    status: string;
    originalAmount: string;
    revisedAmount: string;
    vendorId: string;
    createdAt: string;
}

interface ContractLine {
    id: string;
    lineNumber: number;
    description: string;
    scheduledValue: string;
    costCodeId?: string;
    status: string;
}

export default function ConstructionContractWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isAddLineOpen, setIsAddLineOpen] = useState(false);

    // --- Data Fetching ---

    const { data: projects = [] } = useQuery<Project[]>({
        queryKey: ["ppm-projects"],
        queryFn: async () => {
            const res = await fetch("/api/ppm/projects");
            if (!res.ok) throw new Error("Failed to fetch projects");
            return res.json();
        }
    });

    // Auto-select first project if none selected
    useEffect(() => {
        if (!selectedProjectId && projects.length > 0) {
            setSelectedProjectId(projects[0].id);
        }
    }, [projects, selectedProjectId]);

    const { data: contracts = [], isLoading: isLoadingContracts } = useQuery<Contract[]>({
        queryKey: ["construction-contracts", selectedProjectId],
        enabled: !!selectedProjectId,
        queryFn: async () => {
            const res = await fetch(`/api/construction/projects/${selectedProjectId}/contracts`);
            if (!res.ok) throw new Error("Failed to fetch contracts");
            return res.json();
        }
    });

    const { data: activeContract } = useQuery<Contract & { lines: ContractLine[] }>({
        queryKey: ["construction-contract-detail", selectedContractId],
        enabled: !!selectedContractId,
        queryFn: async () => {
            const res = await fetch(`/api/construction/contracts/${selectedContractId}`);
            if (!res.ok) throw new Error("Failed to fetch contract details");
            return res.json();
        }
    });

    const { data: costCodes = [] } = useQuery<CostCode[]>({
        queryKey: ["construction-cost-codes"],
        queryFn: async () => {
            const res = await fetch("/api/construction/cost-codes");
            if (!res.ok) throw new Error("Failed to fetch cost codes");
            return res.json();
        }
    });

    // --- Mutations ---

    const createContractMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/construction/contracts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to create contract");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["construction-contracts"] });
            setIsCreateOpen(false);
            toast({ title: "Contract Created", description: "New prime contract has been drafted." });
        }
    });

    const addLineMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch(`/api/construction/contracts/${selectedContractId}/lines`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to add line");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["construction-contract-detail"] }); // Refresh detail to show new line & total
            queryClient.invalidateQueries({ queryKey: ["construction-contracts"] }); // Refresh list to show updated total
            setIsAddLineOpen(false);
            toast({ title: "Line Added", description: "Schedule of values updated." });
        }
    });

    // --- Handlers ---

    const handleCreateContract = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        createContractMutation.mutate({
            projectId: selectedProjectId,
            contractNumber: formData.get("contractNumber"),
            subject: formData.get("subject"),
            description: formData.get("description"),
            vendorId: formData.get("vendorId") || "TBD", // Mock default
        });
    };

    const handleAddLine = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        addLineMutation.mutate({
            lineNumber: parseInt(formData.get("lineNumber") as string),
            description: formData.get("description"),
            scheduledValue: formData.get("scheduledValue"),
            costCodeId: formData.get("costCodeId"),
        });
    };

    const [isBulkOpen, setIsBulkOpen] = useState(false);
    const bulkImportMutation = useMutation({
        mutationFn: async (lines: any[]) => {
            const res = await fetch(`/api/construction/contracts/${selectedContractId}/bulk-import`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lines })
            });
            if (!res.ok) throw new Error("Bulk import failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["construction-contract-detail"] });
            setIsBulkOpen(false);
            toast({ title: "Import Successful", description: "Schedule of values updated with bulk lines." });
        }
    });

    const handleBulkImport = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const csv = formData.get("csvData") as string;
        // Simple Parser: LineNumber, Description, Value
        const lines = csv.split("\n").filter(row => row.trim()).map(row => {
            const [num, desc, val] = row.split(",").map(s => s.trim());
            return { lineNumber: parseInt(num), description: desc, scheduledValue: val };
        });
        bulkImportMutation.mutate(lines);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Contract Workbench</h1>
                    <p className="text-muted-foreground">Manage construction contracts and schedule of values.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Select value={selectedProjectId || ""} onValueChange={setSelectedProjectId}>
                        <SelectTrigger className="w-[300px]">
                            <SelectValue placeholder="Select Project" />
                        </SelectTrigger>
                        <SelectContent>
                            {projects.map(p => (
                                <SelectItem key={p.id} value={p.id}>
                                    {p.projectNumber} - {p.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">

                {/* Contract List */}
                <Card className="col-span-4 h-[calc(100vh-200px)] flex flex-col">
                    <CardHeader className="pb-3 border-b flex flex-row justify-between items-center">
                        <CardTitle className="text-lg">Contracts</CardTitle>
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create Prime Contract</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreateContract} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Contract Number</Label>
                                        <Input name="contractNumber" required placeholder="CN-2026-001" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Subject</Label>
                                        <Input name="subject" required placeholder="Main Construction Works" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Vendor (Contractor)</Label>
                                        <Input name="vendorId" placeholder="Vendor ID / Name" />
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={createContractMutation.isPending}>
                                            {createContractMutation.isPending ? "Creating..." : "Create Draft"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-0">
                        {isLoadingContracts ? (
                            <div className="p-4 space-y-2">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ) : contracts.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                No contracts found for this project.
                            </div>
                        ) : (
                            <div className="divide-y">
                                {contracts.map(contract => (
                                    <div
                                        key={contract.id}
                                        className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${selectedContractId === contract.id ? "bg-muted border-l-4 border-primary" : ""}`}
                                        onClick={() => setSelectedContractId(contract.id)}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-semibold">{contract.contractNumber}</span>
                                            <Badge variant={contract.status === "ACTIVE" ? "default" : "secondary"}>
                                                {contract.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm font-medium truncate mb-2">{contract.subject}</p>
                                        <div className="text-xs text-muted-foreground flex justify-between">
                                            <span>Orig: ${Number(contract.originalAmount).toLocaleString()}</span>
                                            <span className="font-bold text-primary">Rev: ${Number(contract.revisedAmount).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Contract Details / SOV */}
                <Card className="col-span-8 h-[calc(100vh-200px)] flex flex-col">
                    {!selectedContractId ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                            <Hammer className="h-12 w-12 mb-4 opacity-20" />
                            <p>Select a contract to view Schedule of Values</p>
                        </div>
                    ) : !activeContract ? (
                        <div className="p-6"><Skeleton className="h-full w-full" /></div>
                    ) : (
                        <>
                            <CardHeader className="pb-4 border-b">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            {activeContract.subject}
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            ID: {activeContract.id} • Vendor: {activeContract.vendorId}
                                        </CardDescription>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Current Contract Value</p>
                                        <p className="text-2xl font-bold font-mono">
                                            ${Number(activeContract.revisedAmount).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 overflow-auto p-0">
                                <Tabs defaultValue="sov" className="h-full flex flex-col">
                                    <div className="px-4 pt-4 border-b">
                                        <TabsList>
                                            <TabsTrigger value="sov">Schedule of Values</TabsTrigger>
                                            <TabsTrigger value="variations">Variations & Change Orders</TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <TabsContent value="sov" className="flex-1 overflow-auto m-0 p-0">
                                        <div className="p-4 flex justify-between items-center bg-muted/20 border-b">
                                            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Schedule of Values (SOV)</h3>

                                            <div className="flex gap-2">
                                                <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" variant="secondary" className="h-8">
                                                            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Bulk Import
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Bulk Import SOV (CSV)</DialogTitle>
                                                            <CardDescription>Format: LineNumber, Description, Value (One per line)</CardDescription>
                                                        </DialogHeader>
                                                        <form onSubmit={handleBulkImport} className="space-y-4">
                                                            <Textarea
                                                                name="csvData"
                                                                placeholder="1, Excavation, 50000&#10;2, Foundation, 75000"
                                                                className="min-h-[200px] font-mono text-xs"
                                                            />
                                                            <DialogFooter>
                                                                <Button type="submit" disabled={bulkImportMutation.isPending}>
                                                                    {bulkImportMutation.isPending ? "Importing..." : "Process Import"}
                                                                </Button>
                                                            </DialogFooter>
                                                        </form>
                                                    </DialogContent>
                                                </Dialog>

                                                <Dialog open={isAddLineOpen} onOpenChange={setIsAddLineOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" variant="outline" className="h-8">
                                                            <Plus className="h-3.5 w-3.5 mr-1" /> Add Line
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Add SOV Line Item</DialogTitle>
                                                        </DialogHeader>
                                                        <form onSubmit={handleAddLine} className="space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label>Line #</Label>
                                                                    <Input
                                                                        name="lineNumber"
                                                                        type="number"
                                                                        defaultValue={(activeContract.lines?.length || 0) + 1}
                                                                        required
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>Scheduled Value ($)</Label>
                                                                    <Input name="scheduledValue" type="number" step="0.01" required />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Cost Code</Label>
                                                                <Select name="costCodeId">
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Assign Cost Code" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {costCodes.map(cc => (
                                                                            <SelectItem key={cc.id} value={cc.id}>
                                                                                {cc.code} - {cc.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Description of Work</Label>
                                                                <Textarea name="description" placeholder="e.g. Concrete Foundations Phase 1" required />
                                                            </div>
                                                            <DialogFooter>
                                                                <Button type="submit" disabled={addLineMutation.isPending}>Add Item</Button>
                                                            </DialogFooter>
                                                        </form>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </div>

                                        <StandardTable
                                            data={activeContract.lines || []}
                                            columns={[
                                                { header: "Line", accessorKey: "lineNumber", sortable: true },
                                                {
                                                    header: "Cost Code",
                                                    accessorKey: "costCodeId",
                                                    cell: (item: ContractLine) => {
                                                        const cc = costCodes.find(c => c.id === item.costCodeId);
                                                        return cc ? <Badge variant="secondary">{cc.code}</Badge> : "-";
                                                    }
                                                },
                                                { header: "Description", accessorKey: "description" },
                                                {
                                                    header: "Scheduled Value",
                                                    accessorKey: "scheduledValue",
                                                    cell: (item: ContractLine) => `$${Number(item.scheduledValue).toLocaleString()}`,
                                                    sortable: true
                                                },
                                                {
                                                    header: "Status",
                                                    accessorKey: "status",
                                                    cell: (item: ContractLine) => <Badge variant="outline">{item.status}</Badge>
                                                }
                                            ]}
                                        />
                                    </TabsContent>

                                    <TabsContent value="variations" className="flex-1 overflow-auto m-0 p-4">
                                        <VariationManager contractId={activeContract.id} />
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
}
