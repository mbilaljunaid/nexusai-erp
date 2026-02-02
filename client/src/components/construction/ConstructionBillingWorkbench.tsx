import { useState, useEffect } from "react";
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
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription
} from "@/components/ui/sheet";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, DollarSign, Calculator, Lock, Calendar, ShieldCheck, History } from "lucide-react";
import { format } from "date-fns";
import { StandardTable, Column } from "../tables/StandardTable";
import { CostCode } from "@shared/schema";

interface PayApp {
    id: string;
    applicationNumber: number;
    periodEnd: string;
    totalCompleted: string;
    retentionAmount: string;
    currentPaymentDue: string;
    status: string;
    isLocked: boolean;
    architectApprovedBy?: string;
    engineerApprovedBy?: string;
    certifiedBy?: string;
}

interface PayAppLine {
    id: string;
    description: string;
    scheduledValue: string;
    totalCompletedToDate: string;
    percentageComplete: string;
    workCompletedThisPeriod: string;
    materialsStored: string;
}

export default function ConstructionBillingWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [projects, setProjects] = useState<any[]>([]);
    const [contracts, setContracts] = useState<any[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
    const [selectedPayAppId, setSelectedPayAppId] = useState<string | null>(null);
    const [linePage, setLinePage] = useState(1);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Fetch Projects
    useEffect(() => {
        fetch("/api/ppm/projects")
            .then(res => res.json())
            .then(data => {
                setProjects(data);
                if (data.length > 0) setSelectedProjectId(data[0].id);
            });
    }, []);

    // Fetch Contracts when Project Selected
    useEffect(() => {
        if (!selectedProjectId) return;
        fetch(`/api/construction/projects/${selectedProjectId}/contracts`)
            .then(res => res.json())
            .then(data => {
                setContracts(data);
                if (data.length > 0) setSelectedContractId(data[0].id);
            });
    }, [selectedProjectId]);

    const { data: payApps = [], isLoading: isLoadingApps } = useQuery<PayApp[]>({
        queryKey: ["construction-pay-apps", selectedContractId],
        enabled: !!selectedContractId,
        queryFn: async () => {
            const res = await fetch(`/api/construction/contracts/${selectedContractId}/pay-apps`);
            return res.json();
        }
    });

    const { data: activeApp } = useQuery<PayApp>({
        queryKey: ["construction-pay-app-detail", selectedPayAppId],
        enabled: !!selectedPayAppId,
        queryFn: async () => {
            const res = await fetch(`/api/construction/pay-apps/${selectedPayAppId}`);
            return res.json();
        }
    });

    const { data: linesData = { lines: [], total: 0 }, isLoading: isLoadingLines } = useQuery<{ lines: PayAppLine[], total: number, page: number, limit: number }>({
        queryKey: ["construction-pay-app-lines", selectedPayAppId, linePage],
        enabled: !!selectedPayAppId,
        queryFn: async () => {
            const res = await fetch(`/api/construction/pay-apps/${selectedPayAppId}/lines?page=${linePage}&limit=10`);
            return res.json();
        }
    });

    // Reset line page when pay app changes
    useEffect(() => {
        setLinePage(1);
    }, [selectedPayAppId]);

    const { data: costCodes = [] } = useQuery<CostCode[]>({
        queryKey: ["construction-cost-codes"],
        queryFn: async () => {
            const res = await fetch("/api/construction/cost-codes");
            return res.json();
        }
    });

    const createPayAppMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch(`/api/construction/contracts/${selectedContractId}/pay-apps`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to create pay app");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["construction-pay-apps"] });
            setIsCreateOpen(false);
            toast({ title: "Pay App Created", description: "New application entry created." });
        }
    });

    const updateLineMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => {
            const res = await fetch(`/api/construction/pay-apps/lines/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            return res.json();
        },
        onSuccess: () => {
            // Invalidate detail to show updated calcs
            queryClient.invalidateQueries({ queryKey: ["construction-pay-app-detail", selectedPayAppId] });
        }
    });

    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        createPayAppMutation.mutate({
            applicationNumber: parseInt(formData.get("applicationNumber") as string),
            periodStart: formData.get("periodStart"),
            periodEnd: formData.get("periodEnd"),
        });
    };

    const handleLineUpdate = (lineId: string, field: string, value: string) => {
        if (activeApp?.isLocked) return;
        updateLineMutation.mutate({
            id: lineId,
            data: { [field]: value }
        });
    };

    const certMutation = useMutation({
        mutationFn: async ({ action }: { action: string }) => {
            const res = await fetch(`/api/construction/pay-apps/${selectedPayAppId}/${action}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user: "Manager-User" }) // In a real app, this would be from auth context
            });
            if (!res.ok) throw new Error("Certification action failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["construction-pay-apps"] });
            queryClient.invalidateQueries({ queryKey: ["construction-pay-app-detail", selectedPayAppId] });
            toast({ title: "Status Updated", description: "The application status has been progressed." });
        }
    });

    return (
        <div className="p-6 space-y-6">
            <Breadcrumbs items={[
                { label: "ERP", path: "/erp" },
                { label: "Construction", path: "/construction/insights" },
                { label: "Billing", path: "/construction/billing" }
            ]} />
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Billing Workbench</h1>
                    <p className="text-muted-foreground">Manage Applications for Payment (G702/G703).</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={selectedProjectId || ""} onValueChange={setSelectedProjectId}>
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Select Project" />
                        </SelectTrigger>
                        <SelectContent>
                            {projects.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.projectNumber}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedContractId || ""} onValueChange={setSelectedContractId}>
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Select Contract" />
                        </SelectTrigger>
                        <SelectContent>
                            {contracts.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.contractNumber}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Pay App List */}
                <Card className="col-span-3 h-[calc(100vh-200px)]">
                    <CardHeader className="pb-3 border-b flex flex-row justify-between items-center">
                        <CardTitle className="text-base">Applications</CardTitle>
                        <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <SheetTrigger asChild>
                                <Button size="icon" variant="ghost"><Plus className="h-4 w-4" /></Button>
                            </SheetTrigger>
                            <SheetContent side="right">
                                <SheetHeader>
                                    <SheetTitle>New Pay Application</SheetTitle>
                                    <SheetDescription>Initialize a new progress billing application for this contract.</SheetDescription>
                                </SheetHeader>
                                <form onSubmit={handleCreate} className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label>App #</Label>
                                        <Input name="applicationNumber" type="number" defaultValue={(payApps.length || 0) + 1} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Period Start</Label>
                                        <Input name="periodStart" type="date" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Period End</Label>
                                        <Input name="periodEnd" type="date" required />
                                    </div>
                                    <SheetFooter className="pt-4">
                                        <Button type="submit" className="w-full">Create</Button>
                                    </SheetFooter>
                                </form>
                            </SheetContent>
                        </Sheet>
                    </CardHeader>
                    <CardContent className="p-0">
                        {payApps.map(app => (
                            <div
                                key={app.id}
                                className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${selectedPayAppId === app.id ? "bg-muted" : ""}`}
                                onClick={() => setSelectedPayAppId(app.id)}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold">App #{app.applicationNumber}</span>
                                    <Badge variant="outline">{app.status}</Badge>
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(app.periodEnd), "MMM d, yyyy")}
                                </div>
                                <div className="font-mono text-sm font-bold text-primary">
                                    Due: ${Number(app.currentPaymentDue).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Main Content */}
                <div className="col-span-9 space-y-6">
                    {!activeApp ? (
                        <Card className="h-full flex items-center justify-center text-muted-foreground">
                            Select a Pay App to view details
                        </Card>
                    ) : (
                        <>
                            {/* G702 Summary Header */}
                            <div className="grid grid-cols-4 gap-4">
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-sm font-medium text-muted-foreground">Total Completed</div>
                                        <div className="text-2xl font-bold">${Number(activeApp.totalCompleted).toLocaleString()}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-sm font-medium text-muted-foreground">Retention</div>
                                        <div className="text-2xl font-bold text-red-600">(${Number(activeApp.retentionAmount).toLocaleString()})</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-sm font-medium text-muted-foreground">Payment Due</div>
                                        <div className="text-2xl font-bold text-green-600">${Number(activeApp.currentPaymentDue).toLocaleString()}</div>
                                    </CardContent>
                                </Card>
                                <Card className="flex flex-col items-center justify-center p-4 gap-2">
                                    <div className="flex gap-2 w-full">
                                        {activeApp.status === "DRAFT" && (
                                            <Button
                                                className="flex-1"
                                                onClick={() => certMutation.mutate({ action: "submit" })}
                                            >
                                                Submit for Review
                                            </Button>
                                        )}
                                        {activeApp.status === "SUBMITTED" && (
                                            <Button
                                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                                onClick={() => certMutation.mutate({ action: "approve-architect" })}
                                            >
                                                Architect Approve
                                            </Button>
                                        )}
                                        {activeApp.status === "ARCHITECT_APPROVED" && (
                                            <Button
                                                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                                                onClick={() => certMutation.mutate({ action: "approve-engineer" })}
                                            >
                                                Engineer Approve
                                            </Button>
                                        )}
                                        {activeApp.status === "ENGINEER_APPROVED" && (
                                            <Button
                                                className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                                                onClick={() => certMutation.mutate({ action: "certify" })}
                                            >
                                                <Lock className="h-4 w-4" /> Certify & Lock
                                            </Button>
                                        )}
                                        {activeApp.isLocked && (
                                            <Badge variant="secondary" className="w-full text-center py-2 gap-2 justify-center">
                                                <ShieldCheck className="h-4 w-4" /> Locked for Audit
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1 text-[10px] text-muted-foreground">
                                        {activeApp.architectApprovedBy && <p>Architect: {activeApp.architectApprovedBy}</p>}
                                        {activeApp.engineerApprovedBy && <p>Engineer: {activeApp.engineerApprovedBy}</p>}
                                        {activeApp.certifiedBy && <p>GC: {activeApp.certifiedBy}</p>}
                                    </div>
                                </Card>
                            </div>

                            {/* G703 Detail Grid */}
                            <Card className="flex-1">
                                <CardHeader className="py-3 border-b flex flex-row justify-between items-center">
                                    <CardTitle className="text-base">Detail Sheet (G703)</CardTitle>
                                    {activeApp?.isLocked && <Badge variant="destructive">Read-Only</Badge>}
                                </CardHeader>
                                <CardContent className="p-0">
                                    <StandardTable
                                        data={linesData.lines}
                                        isLoading={isLoadingLines}
                                        pagination={{
                                            currentPage: linePage,
                                            totalPages: Math.ceil(linesData.total / 10),
                                            onPageChange: (p) => setLinePage(p)
                                        }}
                                        columns={[
                                            { header: "Description", accessorKey: "description" },
                                            {
                                                header: "Cost Code",
                                                accessorKey: "costCodeId",
                                                cell: (item: any) => {
                                                    const cc = costCodes.find(c => c.id === item.costCodeId);
                                                    return cc ? <Badge variant="secondary">{cc.code}</Badge> : "-";
                                                }
                                            },
                                            {
                                                header: "Scheduled Value",
                                                accessorKey: "scheduledValue",
                                                cell: (item: any) => `$${Number(item.scheduledValue).toLocaleString()}`,
                                                sortable: true
                                            },
                                            {
                                                header: "Total Completed",
                                                accessorKey: "totalCompletedToDate",
                                                cell: (item: any) => (
                                                    <Input
                                                        className="text-right font-mono h-8 w-32 ml-auto"
                                                        defaultValue={item.totalCompletedToDate}
                                                        disabled={activeApp?.isLocked}
                                                        onBlur={(e) => handleLineUpdate(item.id, "totalCompletedToDate", e.target.value)}
                                                    />
                                                )
                                            },
                                            {
                                                header: "%",
                                                accessorKey: "percentageComplete",
                                                cell: (item: any) => `${Number(item.percentageComplete).toFixed(1)}%`,
                                                sortable: true
                                            },
                                            {
                                                header: "Balance",
                                                accessorKey: "balance",
                                                cell: (item: any) => `$${(Number(item.scheduledValue) - Number(item.totalCompletedToDate)).toLocaleString()}`
                                            }
                                        ]}
                                    />
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
