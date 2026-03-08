import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ShieldCheck, AlertTriangle, Truck, FileText } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/dateUtils";

const SEED_SHIPMENTS: any[] = [
    { id: "DG-001", soNumber: "SO-2026-4401", customer: "ChemPlant A", carrier: "DHL Express", item: "Industrial Solvent B47", hazmatClass: "Class 3 — Flammable Liquid", unNumber: "UN1993", packingGroup: "PG-II", flashPoint: "23°C", emergencyContact: "+1-800-CHEM-911", netWeight: "250 kg", labelRequired: "Flammable", complianceCheck: "Passed", dgDeclaration: "Attached", status: "Compliant" },
    { id: "DG-002", soNumber: "SO-2026-4388", customer: "Battery Tech Ltd", carrier: "FedEx Express", item: "Lithium-Ion Battery Pack (Bulk)", hazmatClass: "Class 9 — Misc Dangerous Goods", unNumber: "UN3481", packingGroup: "N/A", flashPoint: "N/A", emergencyContact: "+1-888-BATT-911", netWeight: "480 kg", labelRequired: "Lithium Battery", complianceCheck: "Failed", dgDeclaration: "Missing", status: "Non-Compliant — Hold" },
    { id: "DG-003", soNumber: "SO-2026-4395", customer: "MedSupply Co", carrier: "UPS Ground", item: "Medical Grade Oxygen Cylinders", hazmatClass: "Class 2.2 — Non-flammable Gas", unNumber: "UN1072", packingGroup: "N/A", flashPoint: "N/A", emergencyContact: "+1-800-O2-LIFT", netWeight: "180 kg", labelRequired: "Non-Flammable Gas", complianceCheck: "Passed", dgDeclaration: "Attached", status: "Compliant" },
];

const HAZMAT_CLASSES = [
    { class: "1", label: "Explosives", color: "bg-orange-500" },
    { class: "2.1", label: "Flammable Gas", color: "bg-red-500" },
    { class: "2.2", label: "Non-Flammable Gas", color: "bg-green-600" },
    { class: "3", label: "Flammable Liquid", color: "bg-red-600" },
    { class: "4", label: "Flammable Solid", color: "bg-orange-600" },
    { class: "5", label: "Oxidizing", color: "bg-yellow-500" },
    { class: "6", label: "Toxic Substances", color: "bg-gray-600" },
    { class: "7", label: "Radioactive", color: "bg-yellow-400" },
    { class: "8", label: "Corrosives", color: "bg-purple-600" },
    { class: "9", label: "Miscellaneous", color: "bg-gray-400" },
];

export default function DangerousGoodsCompliance() {
    const [search, setSearch] = useState("");
    const [selectedShipment, setSelectedShipment] = useState<any>(null);

    const { data: apiData } = useQuery<any[]>({ queryKey: ["/api/tms/dangerous-goods"], queryFn: () => fetch("/api/tms/dangerous-goods").then(r => r.json()).catch(() => []) });
    const shipments = (apiData && apiData.length > 0) ? apiData : SEED_SHIPMENTS;

    const filtered = shipments.filter(s =>
        search === "" || s.soNumber.includes(search) || s.customer.toLowerCase().includes(search.toLowerCase()) || s.item.toLowerCase().includes(search.toLowerCase())
    );

    const compliant = shipments.filter(s => s.status === "Compliant").length;
    const nonCompliant = shipments.filter(s => s.status.startsWith("Non-Compliant")).length;

    const columns = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "id", header: "DG Ref", width: "100px", cell: r => <span className="font-mono text-xs text-blue-600">{r.id}</span> },
        { id: "soNumber", header: "Sales Order", width: "140px", cell: r => <span className="font-mono text-xs text-indigo-600">{r.soNumber}</span> },
        { id: "customer", header: "Customer", width: "160px", cell: r => <span className="font-medium">{r.customer}</span> },
        { id: "carrier", header: "Carrier", width: "130px" },
        { id: "item", header: "Item", width: "220px", cell: r => <span className="font-medium">{r.item}</span> },
        { id: "hazmatClass", header: "Hazmat Class", width: "220px", cell: r => <Badge variant="destructive" className="text-xs">{r.hazmatClass}</Badge> },
        { id: "unNumber", header: "UN #", width: "100px", cell: r => <span className="font-mono text-xs font-bold">{r.unNumber}</span> },
        { id: "packingGroup", header: "PG", width: "80px", cell: r => <span className="text-center block text-xs">{r.packingGroup}</span> },
        { id: "netWeight", header: "Net Wt", width: "100px" },
        { id: "labelRequired", header: "Label Required", width: "160px", cell: r => <Badge variant="outline" className="text-xs">{r.labelRequired}</Badge> },
        { id: "dgDeclaration", header: "DG Declaration", width: "130px", cell: r => <span className={r.dgDeclaration === "Attached" ? "text-green-600 text-xs font-semibold" : "text-red-600 text-xs font-semibold"}>{r.dgDeclaration}</span> },
        { id: "complianceCheck", header: "IATA Check", width: "120px", cell: r => <Badge variant={r.complianceCheck === "Passed" ? "secondary" : "destructive"} className="text-xs">{r.complianceCheck}</Badge> },
        { id: "status", header: "Status", width: "180px", cell: r => <StatusBadge status={r.status} /> },
        { id: "actions", header: "", width: "110px", cell: r => <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSelectedShipment(r)}><FileText className="h-3 w-3 mr-1" />Details</Button> },
    ], []);

    return (
        <StandardPage
            title="Dangerous Goods Compliance"
            description="IATA/IMDG regulation enforcement for dangerous goods shipments. Validates hazmat class, UN number, packing group, and declaration documents before shipment release."
            breadcrumbs={[{ label: "SCM", href: "/scm/procurement" }, { label: "TMS", href: "/scm/tms" }, { label: "Dangerous Goods" }]}
        >
            <div className="grid grid-cols-3 gap-4 mb-6">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><ShieldCheck className="h-4 w-4 text-green-600" />Compliant Shipments</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">{compliant}</div></CardContent>
                </Card>
                <Card className="border-red-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><AlertTriangle className="h-4 w-4 text-red-500" />Non-Compliant — Hold</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">{nonCompliant}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Truck className="h-4 w-4" />DG Shipments This Week</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{shipments.length}</div></CardContent>
                </Card>
            </div>

            {/* Hazmat Classes Reference */}
            <Card className="mb-6">
                <CardHeader><CardTitle className="text-sm">IATA Hazmat Classification Reference</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-5 gap-2">
                        {HAZMAT_CLASSES.map(h => <div key={h.class} className={`${h.color} p-2 rounded text-white text-xs text-center`}><p className="font-bold">Class {h.class}</p><p>{h.label}</p></div>)}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>DG Shipment Register</CardTitle>
                    <CardDescription>Non-compliant shipments are placed on hold and cannot be released to carrier until all violations are resolved.</CardDescription>
                    <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order, customer, item..." className="max-w-xs mt-3" />
                </CardHeader>
                <CardContent className="p-0"><InteractiveSpreadsheet data={filtered} columns={columns} onChange={() => { }} containerHeight="440px" /></CardContent>
            </Card>

            <Dialog open={!!selectedShipment} onOpenChange={open => !open && setSelectedShipment(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>DG Details — {selectedShipment?.soNumber}</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-2 gap-3 text-sm py-4">
                        {[["Carrier", selectedShipment?.carrier], ["Item", selectedShipment?.item], ["Hazmat Class", selectedShipment?.hazmatClass], ["UN Number", selectedShipment?.unNumber], ["Packing Group", selectedShipment?.packingGroup], ["Flash Point", selectedShipment?.flashPoint], ["Net Weight", selectedShipment?.netWeight], ["Label Required", selectedShipment?.labelRequired], ["Emergency Contact", selectedShipment?.emergencyContact], ["DG Declaration", selectedShipment?.dgDeclaration], ["IATA/IMDG Check", selectedShipment?.complianceCheck], ["Status", selectedShipment?.status]].map(([label, value]) => (
                            <div key={label}><p className="text-muted-foreground text-xs">{label}</p><p className="font-medium">{value}</p></div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedShipment(null)}>Close</Button>
                        {selectedShipment?.status === "Compliant" && <Button>Release to Carrier</Button>}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
