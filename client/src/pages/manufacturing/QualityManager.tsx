import { useState } from "react";
import { StandardTable, type Column } from "@/components/ui/StandardTable";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { FlaskConical, CheckCircle2, XCircle, Search, Filter, Wrench, AlertCircle, CheckCircle, TrendingUp } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Inspection {
    id: string;
    productionOrderId: string;
    inspectorId: string;
    inspectionDate: string;
    status: "pass" | "fail" | "pending";
    findings?: string;
    orderNumber?: string;
}

export default function QualityManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [viewType, setViewType] = useState("inspections");

    const { data, isLoading } = useQuery<{ items: Inspection[], total: number }>({
        queryKey: ["/api/manufacturing/quality-inspections", page, pageSize],
        queryFn: async () => {
            const offset = (page - 1) * pageSize;
            const res = await fetch(`/api/manufacturing/inspections?limit=${pageSize}&offset=${offset}`);
            return res.json();
        }
    });

    const { data: nonConformances = [] } = useQuery<any[]>({ queryKey: ["/api/quality/non-conformances"] });

    // Fetch detailed results when an inspection is selected
    const { data: limsResults = [], refetch: refetchLims } = useQuery<any[]>({
        queryKey: ["/api/manufacturing/quality-results", selectedInspection?.id],
        queryFn: async () => {
            const res = await fetch(`/api/manufacturing/quality-results/${selectedInspection?.id}`);
            return res.json();
        },
        enabled: !!selectedInspection?.id
    });

    const inspections = data?.items || [];
    const totalItems = data?.total || 0;
    const passedChecks = inspections.filter((c: any) => c.status === "pass").length;
    const openNCItems = nonConformances.filter((nc: any) => nc.status === "open").length;

    const updateMutation = useMutation({
        mutationFn: async ({ id, status, findings, results }: { id: string, status: string, findings?: string, results?: any[] }) => {
            const resStatus = await fetch(`/api/manufacturing/inspections/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, findings })
            });
            if (!resStatus.ok) throw new Error("Failed to update inspection status");

            if (results && results.length > 0) {
                const resResults = await fetch(`/api/manufacturing/quality-results/${id}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(results)
                });
                if (!resResults.ok) throw new Error("Failed to save LIMS results");
            }
            return resStatus.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/manufacturing/quality-inspections"] });
            setIsSheetOpen(false);
            toast({ title: "Updated", description: "Inspection result and LIMS data synchronized." });
        }
    });

    const columns: Column<Inspection>[] = [
        { header: "Inspection ID", accessorKey: "id", cell: (row: Inspection) => <span className="font-mono text-xs">{row.id.substring(0, 8)}</span> },
        { header: "Work Order", accessorKey: "productionOrderId", cell: (row: any) => <span className="font-semibold">{row.orderNumber || row.productionOrderId.substring(0, 8) + '...'}</span> },
        { header: "Status", accessorKey: "status", cell: (row: Inspection) => <Badge variant={row.status === "pass" ? "default" : row.status === "fail" ? "destructive" : "secondary"}>{row.status.toUpperCase()}</Badge> },
        { header: "Date", accessorKey: "inspectionDate", cell: (row: Inspection) => row.inspectionDate ? new Date(row.inspectionDate).toLocaleDateString() : '-' },
        {
            header: "Actions", id: "actions", cell: (row: Inspection) => (
                <Button variant="ghost" size="sm" onClick={() => { setSelectedInspection(row); setIsSheetOpen(true); }}>
                    <Search className="h-4 w-4 mr-1" /> View/Edit
                </Button>
            )
        }
    ];

    const handleUpdate = (status: string) => {
        if (!selectedInspection) return;
        const findings = (document.getElementById("findings") as HTMLTextAreaElement).value;
        const results = [
            {
                inspectionId: selectedInspection.id,
                parameterName: "Purity", minValue: 98.0, maxValue: 100.0,
                actualValue: parseFloat((document.getElementById("purity-val") as HTMLInputElement).value),
                result: parseFloat((document.getElementById("purity-val") as HTMLInputElement).value) >= 98.0 ? "PASS" : "FAIL"
            }
        ];
        updateMutation.mutate({ id: selectedInspection.id, status, findings, results });
    };

    return (
        <StandardPage title="Quality Assurance" breadcrumbs={[{ label: "Manufacturing", href: "/manufacturing" }, { label: "Quality Control" }]}>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card><CardContent className="pt-6 flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Total Inspections</p><p className="text-2xl font-bold">{totalItems}</p></div><CheckCircle className="h-8 w-8 text-green-600" /></CardContent></Card>
                <Card><CardContent className="pt-6 flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Pass Rate</p><p className="text-2xl font-bold">{totalItems > 0 ? Math.round((passedChecks / totalItems) * 100) : 0}%</p></div><TrendingUp className="h-8 w-8 text-blue-600" /></CardContent></Card>
                <Card><CardContent className="pt-6 flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Open NCs</p><p className="text-2xl font-bold">{openNCItems}</p></div><AlertCircle className="h-8 w-8 text-red-600" /></CardContent></Card>
            </div>

            <Tabs defaultValue="inspections" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="inspections">Inspections</TabsTrigger>
                    <TabsTrigger value="nonconformances">Non-Conformances</TabsTrigger>
                </TabsList>

                <TabsContent value="inspections">
                    <StandardTable
                        data={inspections}
                        columns={columns}
                        isLoading={isLoading}
                        keyExtractor={(item) => item.id}
                        filterColumn="productionOrderId"
                        filterPlaceholder="Filter by work order..."
                        page={page}
                        pageSize={pageSize}
                        totalItems={totalItems}
                        onPageChange={setPage}
                    />
                </TabsContent>

                <TabsContent value="nonconformances">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {nonConformances.map((nc: any) => (
                            <Card key={nc.id}>
                                <CardHeader><CardTitle className="text-lg flex items-center justify-between"><span className="flex items-center gap-2"><Wrench className="h-5 w-5 text-orange-600" />{nc.ncNumber}</span><Badge variant={nc.severity === "high" ? "destructive" : "default"}>{nc.severity}</Badge></CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    <div><span className="text-xs text-muted-foreground">Description</span><p className="text-sm">{nc.description}</p></div>
                                    <div><span className="text-xs text-muted-foreground">Status</span><Badge variant={nc.status === "open" ? "default" : "secondary"} className="capitalize mt-1">{nc.status}</Badge></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-md">
                    <SheetHeader><SheetTitle>Inspection Details</SheetTitle></SheetHeader>
                    {selectedInspection && (
                        <div className="space-y-6 mt-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label className="text-xs text-muted-foreground">Work Order</Label><div className="font-medium">{selectedInspection.productionOrderId}</div></div>
                                <div><Label className="text-xs text-muted-foreground">Current Status</Label><div><Badge variant={selectedInspection.status === 'pass' ? 'default' : 'secondary'}>{selectedInspection.status}</Badge></div></div>
                            </div>
                            <div className="space-y-4">
                                <Label className="text-sm font-bold flex items-center gap-2"><FlaskConical className="h-4 w-4" /> LIMS Results (Detailed)</Label>
                                <div className="space-y-3 rounded-lg border p-3 bg-muted/30">
                                    <div className="grid grid-cols-3 gap-2 items-center"><span className="text-xs font-medium">Purity (%)</span><div className="text-xs text-muted-foreground">Min: 98.0</div><Input id="purity-val" className="h-8 text-right font-mono" defaultValue={limsResults.find(r => r.parameterName === "Purity")?.actualValue || "99.2"} /></div>
                                </div>
                            </div>
                            <div className="space-y-2"><Label htmlFor="findings">Inspector Findings</Label><Textarea id="findings" placeholder="Describe defects..." defaultValue={selectedInspection.findings} /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleUpdate("pass")}><CheckCircle2 className="mr-2 h-4 w-4" /> Pass</Button>
                                <Button variant="destructive" className="w-full" onClick={() => handleUpdate("fail")}><XCircle className="mr-2 h-4 w-4" /> Fail / Reject</Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </StandardPage>
    );
}
