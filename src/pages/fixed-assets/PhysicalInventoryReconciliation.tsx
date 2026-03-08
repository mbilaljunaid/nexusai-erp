import { useState, useRef, useMemo } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Upload, CheckCircle2, AlertCircle, Search, RefreshCw, Barcode } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatNumber } from "@/lib/formatters";

type ReconciliationStatus = "Matched" | "Missing" | "Surplus" | "Condition Alert";

interface PhysicalInventoryLine {
    id: string;
    tagNumber: string;
    assetNumber: string;
    description: string;
    scannedLocation: string;
    systemLocation: string;
    condition: "Good" | "Fair" | "Poor" | "Unknown";
    status: ReconciliationStatus;
}

const MOCK_LINES: PhysicalInventoryLine[] = [
    { id: "1", tagNumber: "TAG-10042", assetNumber: "A-0042", description: "Dell Laptop XPS 15", scannedLocation: "New York HQ – Floor 3", systemLocation: "New York HQ – Floor 3", condition: "Good", status: "Matched" },
    { id: "2", tagNumber: "TAG-10089", assetNumber: "A-0089", description: "HP LaserJet Printer", scannedLocation: "London Office – L2", systemLocation: "London Office – L1", condition: "Fair", status: "Condition Alert" },
    { id: "3", tagNumber: "TAG-10103", assetNumber: "A-0103", description: "Cisco IP Phone", scannedLocation: "", systemLocation: "Singapore Hub – Floor 2", condition: "Unknown", status: "Missing" },
    { id: "4", tagNumber: "TAG-00987", assetNumber: "", description: "Unrecognized Monitor", scannedLocation: "New York HQ – Floor 1", systemLocation: "", condition: "Good", status: "Surplus" },
    { id: "5", tagNumber: "TAG-10201", assetNumber: "A-0201", description: 'Dell 27" 4K Monitor', scannedLocation: "Remote", systemLocation: "Remote", condition: "Good", status: "Matched" },
];

const statusColors: Record<ReconciliationStatus, string> = {
    "Matched": "default",
    "Missing": "destructive",
    "Surplus": "secondary",
    "Condition Alert": "outline",
};

export default function PhysicalInventoryReconciliation() {
    const { toast } = useToast();
    const fileRef = useRef<HTMLInputElement>(null);
    const [lines, setLines] = useState<PhysicalInventoryLine[]>(MOCK_LINES);
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [confirmAction, setConfirmAction] = useState<{ line: PhysicalInventoryLine, action: string } | null>(null);
    const [csvContent, setCsvContent] = useState("");
    const [isUploaded, setIsUploaded] = useState(true);

    const summary = useMemo(() => ({
        matched: lines.filter(l => l.status === "Matched").length,
        missing: lines.filter(l => l.status === "Missing").length,
        surplus: lines.filter(l => l.status === "Surplus").length,
        conditionAlert: lines.filter(l => l.status === "Condition Alert").length,
    }), [lines]);

    const filtered = filterStatus === "all" ? lines : lines.filter(l => l.status === filterStatus);

    const columns: SpreadsheetColumn<PhysicalInventoryLine>[] = useMemo(() => [
        {
            id: "tagNumber", header: "Tag #", width: "120px",
            cellClassName: "font-mono text-sm font-medium",
            cell: (r) => r.tagNumber,
        },
        {
            id: "assetNumber", header: "Asset #", width: "110px",
            cellClassName: "font-mono text-sm text-muted-foreground",
            cell: (r) => r.assetNumber || "—",
        },
        {
            id: "description", header: "Description", width: "220px",
            cell: (r) => r.description,
        },
        {
            id: "scannedLocation", header: "Scanned Location", width: "210px",
            cellClassName: "text-sm",
            cell: (r) => r.scannedLocation || <span className="text-muted-foreground italic">Not found</span>,
        },
        {
            id: "systemLocation", header: "System Location", width: "210px",
            cellClassName: "text-sm text-muted-foreground",
            cell: (r) => r.systemLocation || <span className="italic">—</span>,
        },
        {
            id: "condition", header: "Condition", width: "110px",
            cell: (r) => (
                <Badge variant={r.condition === "Good" ? "default" : r.condition === "Poor" ? "destructive" : "secondary"}>
                    {r.condition}
                </Badge>
            ),
        },
        {
            id: "status", header: "Status", width: "140px",
            cell: (r) => (
                <Badge variant={statusColors[r.status] as any}>
                    {r.status === "Matched" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                    {r.status !== "Matched" && <AlertCircle className="mr-1 h-3 w-3" />}
                    {r.status}
                </Badge>
            ),
        },
        {
            id: "actions", header: "Action", width: "180px",
            cell: (r) => r.status === "Matched" ? null : (
                <div className="flex gap-1">
                    {r.status === "Missing" && (
                        <Button size="sm" variant="outline" onClick={() => setConfirmAction({ line: r, action: "Write Off" })}>
                            Write Off
                        </Button>
                    )}
                    {r.status === "Surplus" && (
                        <Button size="sm" variant="outline" onClick={() => setConfirmAction({ line: r, action: "Add Asset" })}>
                            Add to FA
                        </Button>
                    )}
                    {r.status === "Condition Alert" && (
                        <Button size="sm" variant="outline" onClick={() => setConfirmAction({ line: r, action: "Update Condition" })}>
                            Confirm
                        </Button>
                    )}
                </div>
            ),
        },
    ], []);

    return (
        <StandardPage
            title="Physical Inventory Reconciliation"
            description="Upload barcode scan results and reconcile physical asset locations and conditions against the FA system of record. Generates write-offs and additions."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Fixed Assets", href: "/finance/fixed-assets" },
                { label: "Physical Inventory" },
            ]}
            actions={
                <Button onClick={() => fileRef.current?.click()} variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Scan CSV
                    <input ref={fileRef} type="file" accept=".csv" className="sr-only" title="Upload barcode scan CSV file" onChange={() => {
                        setIsUploaded(true);
                        toast({ title: "Scan file imported", description: "Reconciliation updated with new scan data." });
                    }} />
                </Button>
            }
        >
            {/* Summary KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Matched", count: summary.matched, color: "border-l-green-500", textColor: "text-green-700" },
                    { label: "Missing", count: summary.missing, color: "border-l-red-500", textColor: "text-red-700" },
                    { label: "Surplus (Unregistered)", count: summary.surplus, color: "border-l-yellow-500", textColor: "text-yellow-700" },
                    { label: "Condition Alert", count: summary.conditionAlert, color: "border-l-orange-400", textColor: "text-orange-700" },
                ].map((m) => (
                    <Card key={m.label} className={`border-l-4 ${m.color}`} onClick={() => setFilterStatus(m.label === filterStatus ? "all" : m.label)} role="button" tabIndex={0}>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">{m.label}</p>
                            <p className={`text-3xl font-bold font-mono ${m.textColor}`}>{m.count}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filter Row */}
            <div className="flex items-center gap-3 mb-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Items ({lines.length})</SelectItem>
                        <SelectItem value="Matched">Matched ({summary.matched})</SelectItem>
                        <SelectItem value="Missing">Missing ({summary.missing})</SelectItem>
                        <SelectItem value="Surplus">Surplus ({summary.surplus})</SelectItem>
                        <SelectItem value="Condition Alert">Condition Alert ({summary.conditionAlert})</SelectItem>
                    </SelectContent>
                </Select>
                <div className="text-sm text-muted-foreground">
                    Showing {filtered.length} of {lines.length} items
                </div>
            </div>

            <InteractiveSpreadsheet<PhysicalInventoryLine>
                data={filtered}
                columns={columns}
                onChange={() => { }}
                containerHeight="500px"
            />

            {/* Action Confirmation Dialog */}
            <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm: {confirmAction?.action}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmAction?.action === "Write Off" && (
                                <>Asset <strong>{confirmAction.line.assetNumber}</strong> ({confirmAction.line.description}) was not found during physical inventory.
                                    Writing it off will fully retire the asset and generate a loss journal entry for its net book value.</>
                            )}
                            {confirmAction?.action === "Add Asset" && (
                                <>Tag <strong>{confirmAction.line.tagNumber}</strong> ({confirmAction.line.description}) was found physically but has no FA record.
                                    This will create a new asset in the Fixed Asset register.</>
                            )}
                            {confirmAction?.action === "Update Condition" && (
                                <>Confirming condition <strong>{confirmAction.line.condition}</strong> for asset <strong>{confirmAction.line.assetNumber}</strong>.
                                    The updated condition will be logged to the asset audit trail.</>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            toast({ title: `${confirmAction?.action} applied`, description: `${confirmAction?.line.tagNumber} processed.` });
                            if (confirmAction?.action === "Write Off" || confirmAction?.action === "Add Asset") {
                                setLines(prev => prev.filter(l => l.id !== confirmAction.line.id));
                            } else if (confirmAction?.action === "Update Condition") {
                                setLines(prev => prev.map(l => l.id === confirmAction.line.id ? { ...l, status: "Matched" as ReconciliationStatus } : l));
                            }
                            setConfirmAction(null);
                        }}>
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </StandardPage>
    );
}
