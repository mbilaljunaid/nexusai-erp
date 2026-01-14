import { StandardTable, type Column } from "@/components/ui/StandardTable";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, CheckCircle2, XCircle, Search, Filter } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Inspection {
    id: string;
    productionOrderId: string;
    inspectorId: string;
    inspectionDate: string;
    status: "pass" | "fail" | "pending";
    findings?: string;
    orderNumber?: string; // Added from join
}

export default function QualityManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);

    const { data, isLoading } = useQuery<{ items: Inspection[], total: number }>({
        queryKey: ["/api/manufacturing/quality-inspections", page, pageSize],
        queryFn: async () => {
            const offset = (page - 1) * pageSize;
            const res = await fetch(`/api/manufacturing/quality-inspections?limit=${pageSize}&offset=${offset}`);
            return res.json();
        }
    });

    const inspections = data?.items || [];
    const totalItems = data?.total || 0;

    const updateMutation = useMutation({
        mutationFn: async ({ id, status, findings }: { id: string, status: string, findings?: string }) => {
            const res = await fetch(`/api/manufacturing/quality-inspections/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, findings })
            });
            if (!res.ok) throw new Error("Failed to update inspection");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/manufacturing/quality-inspections"] });
            setIsSheetOpen(false);
            toast({ title: "Updated", description: "Inspection result recorded." });
        }
    });

    const columns: Column<Inspection>[] = [
        {
            header: "Inspection ID",
            accessorKey: "id",
            cell: (row: Inspection) => <span className="font-mono text-xs">{row.id.substring(0, 8)}</span>
        },
        {
            header: "Work Order",
            accessorKey: "productionOrderId",
            // Use joined orderNumber if available (added in service), fallback to ID logic in cell
            cell: (row: any) => <span className="font-semibold">{row.orderNumber || row.productionOrderId.substring(0, 8) + '...'}</span>
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (row: Inspection) => (
                <Badge variant={row.status === "pass" ? "default" : row.status === "fail" ? "destructive" : "secondary"}>
                    {row.status.toUpperCase()}
                </Badge>
            )
        },
        {
            header: "Date",
            accessorKey: "inspectionDate",
            cell: (row: Inspection) => row.inspectionDate ? new Date(row.inspectionDate).toLocaleDateString() : '-'
        },
        {
            header: "Actions",
            id: "actions",
            cell: (row: Inspection) => (
                <Button variant="ghost" size="sm" onClick={() => { setSelectedInspection(row); setIsSheetOpen(true); }}>
                    <Search className="h-4 w-4 mr-1" /> View/Edit
                </Button>
            )
        }
    ];

    const handleUpdate = (status: string) => {
        if (!selectedInspection) return;
        const findings = (document.getElementById("findings") as HTMLTextAreaElement).value;
        updateMutation.mutate({ id: selectedInspection.id, status, findings });
    };

    return (
        <StandardPage
            title="Quality Assurance"
            breadcrumbs={[{ label: "Manufacturing", href: "/manufacturing" }, { label: "Quality Control" }]}
            actions={
                <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" /> Filter Reports
                </Button>
            }
        >
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

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Inspection Details</SheetTitle>
                    </SheetHeader>
                    {selectedInspection && (
                        <div className="space-y-6 mt-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Work Order</Label>
                                    <div className="font-medium">{selectedInspection.productionOrderId}</div>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Current Status</Label>
                                    <div><Badge variant={selectedInspection.status === 'pass' ? 'default' : 'secondary'}>{selectedInspection.status}</Badge></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="findings">Inspector Findings</Label>
                                <Textarea id="findings" placeholder="Describe defects, measurements, or pass criteria..." defaultValue={selectedInspection.findings} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleUpdate("pass")}>
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Pass
                                </Button>
                                <Button variant="destructive" className="w-full" onClick={() => handleUpdate("fail")}>
                                    <XCircle className="mr-2 h-4 w-4" /> Fail / Reject
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </StandardPage>
    );
}
