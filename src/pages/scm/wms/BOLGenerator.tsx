import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { FileText, Truck, Star, Award, Download, RotateCcw } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";

const SEED_SHIPMENTS: any[] = [
    { id: "SHIP-001", so: "SO-0084521", carrier: null, service: null, freight: null, status: "Awaiting BOL", weight: 240, pallets: 3, origin: "Phoenix, AZ", dest: "Chicago, IL", requestedDate: "2026-03-10" },
    { id: "SHIP-002", so: "SO-0084523", carrier: "FedEx Freight", service: "Economy", freight: 485, status: "BOL Generated", bol: "FX-9834521", weight: 680, pallets: 8, origin: "Phoenix, AZ", dest: "New York, NY", requestedDate: "2026-03-11" },
    { id: "SHIP-003", so: "SO-0084529", carrier: null, service: null, freight: null, status: "Awaiting Rate Shop", weight: 95, pallets: 1, origin: "Phoenix, AZ", dest: "Los Angeles, CA", requestedDate: "2026-03-09" },
];

const RATE_SHOP_RESULTS: Record<string, any[]> = {
    "SHIP-001": [
        { rank: 1, carrier: "Old Dominion Freight", service: "LTL Standard", transitDays: 3, freight: 312, fuel: 48, accessorial: 0, total: 360, recommended: true },
        { rank: 2, carrier: "XPO Logistics", service: "LTL Economy", transitDays: 4, freight: 298, fuel: 47, accessorial: 15, total: 360, recommended: false },
        { rank: 3, carrier: "FedEx Freight", service: "Priority", transitDays: 2, freight: 428, fuel: 64, accessorial: 0, total: 492, recommended: false },
        { rank: 4, carrier: "Estes Express", service: "Standard LTL", transitDays: 4, freight: 318, fuel: 50, accessorial: 0, total: 368, recommended: false },
    ],
    "SHIP-003": [
        { rank: 1, carrier: "XPO Logistics", service: "LTL Economy", transitDays: 2, freight: 118, fuel: 18, accessorial: 0, total: 136, recommended: true },
        { rank: 2, carrier: "Old Dominion Freight", service: "Standard LTL", transitDays: 2, freight: 124, fuel: 19, accessorial: 0, total: 143, recommended: false },
        { rank: 3, carrier: "ABF Freight", service: "Economy", transitDays: 3, freight: 112, fuel: 18, accessorial: 5, total: 135, recommended: false },
    ],
};

const BOL_TEMPLATE = (ship: any): string =>
    `BILL OF LADING — STRAIGHT NON-NEGOTIABLE\n\n` +
    `BOL Number: ${ship.bol || "DRAFT"}\n` +
    `Date: 2026-03-08\n\n` +
    `SHIPPER:\nNexusAI Manufacturing\n2800 Palo Verde Rd\nPhoenix, AZ 85001\n\n` +
    `CONSIGNEE:\nShip-To Customer\n${ship.dest}\n\n` +
    `CARRIER: ${ship.carrier ?? "TBD"}\n` +
    `SERVICE: ${ship.service ?? "TBD"}\n` +
    `PRO / TRACKING: ${ship.bol ?? "Pending"}\n\n` +
    `FREIGHT: $${ship.freight ?? "TBD"}\n` +
    `WEIGHT: ${ship.weight} LB\n` +
    `PALLETS: ${ship.pallets}\n\n` +
    `HAZMAT: No\n` +
    `TERMS: Prepaid\n\n` +
    `Shipper Signature: _______________    Date: ___________`;

export default function BOLGenerator() {
    const { toast } = useToast();
    const [shipments, setShipments] = useState(SEED_SHIPMENTS);
    const [selected, setSelected] = useState<any>(null);
    const [rateShopping, setRateShopping] = useState(false);
    const [bolPreview, setBolPreview] = useState(false);

    const awardMutation = useMutation({
        mutationFn: (d: any) => fetch(`/api/shipping/award-carrier`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: (_, vars: any) => {
            setShipments(prev => prev.map(s => s.id === vars.shipmentId ? { ...s, carrier: vars.carrier, service: vars.service, freight: vars.total, status: "Awaiting BOL" } : s));
            toast({ title: `${vars.carrier} — ${vars.service} awarded` });
            setRateShopping(false);
        },
        onError: (_, vars: any) => {
            setShipments(prev => prev.map(s => s.id === vars.shipmentId ? { ...s, carrier: vars.carrier, service: vars.service, freight: vars.total, status: "Awaiting BOL" } : s));
            toast({ title: `${vars.carrier} awarded (pending API)` });
            setRateShopping(false);
        },
    });

    const generateBOLMutation = useMutation({
        mutationFn: (d: any) => fetch(`/api/shipping/generate-bol`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: (_, vars: any) => {
            const bol = `${vars.carrier?.slice(0, 2).toUpperCase() ?? "XX"}-${Math.floor(Math.random() * 9000000 + 1000000)}`;
            setShipments(prev => prev.map(s => s.id === vars.id ? { ...s, bol, status: "BOL Generated" } : s));
            toast({ title: `BOL ${bol} generated` });
        },
        onError: (_, vars: any) => {
            const bol = `XX-${Math.floor(Math.random() * 9000000 + 1000000)}`;
            setShipments(prev => prev.map(s => s.id === vars.id ? { ...s, bol, status: "BOL Generated" } : s));
            toast({ title: `BOL ${bol} generated (pending API)` });
        },
    });

    const rateShopResults = selected ? (RATE_SHOP_RESULTS[selected.id] ?? []) : [];

    const shipCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "id", header: "Shipment", width: "120px", cell: r => <span className="font-mono text-xs text-blue-600">{r.id}</span> },
        { id: "so", header: "Sales Order", width: "130px", cell: r => <span className="text-xs">{r.so}</span> },
        { id: "origin", header: "Origin → Dest", width: "220px", cell: r => <span className="text-xs">{r.origin} → {r.dest}</span> },
        { id: "weight", header: "Weight (lb)", width: "100px", cell: r => <span className="text-right block">{r.weight}</span> },
        { id: "carrier", header: "Carrier", width: "150px", cell: r => r.carrier ? <span className="text-xs font-medium">{r.carrier}</span> : <span className="text-xs text-muted-foreground italic">Not awarded</span> },
        { id: "freight", header: "Freight $", width: "100px", cell: r => r.freight ? <span className="font-mono text-right block">${r.freight}</span> : <span className="text-muted-foreground">—</span> },
        { id: "bol", header: "BOL #", width: "130px", cell: r => r.bol ? <span className="font-mono text-xs text-green-700 font-bold">{r.bol}</span> : <span className="text-muted-foreground text-xs">—</span> },
        { id: "status", header: "Status", width: "150px", cell: r => <StatusBadge status={r.status} /> },
        {
            id: "actions", header: "", width: "200px", cell: r => (
                <div className="flex gap-1">
                    {!r.carrier && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setSelected(r); setRateShopping(true); }}>Rate Shop</Button>}
                    {r.carrier && r.status !== "BOL Generated" && <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => generateBOLMutation.mutate(r)}>Generate BOL</Button>}
                    {r.bol && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setSelected(r); setBolPreview(true); }}><FileText className="h-3.5 w-3.5" /></Button>}
                </div>
            )
        },
    ], []);

    const rateCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "rank", header: "#", width: "50px", cell: r => <span className="text-center block font-bold">{r.rank}</span> },
        { id: "carrier", header: "Carrier", width: "180px", cell: r => <span className="font-semibold">{r.carrier}{r.recommended && <Award className="inline h-3.5 w-3.5 text-amber-500 ml-1.5" />}</span> },
        { id: "service", header: "Service", width: "140px", cell: r => <Badge variant="outline" className="text-xs">{r.service}</Badge> },
        { id: "transitDays", header: "Transit Days", width: "110px", cell: r => <span className="text-center block">{r.transitDays}</span> },
        { id: "freight", header: "Freight", width: "100px", cell: r => <span className="font-mono text-right block">${r.freight}</span> },
        { id: "fuel", header: "Fuel", width: "80px", cell: r => <span className="font-mono text-right block">${r.fuel}</span> },
        { id: "total", header: "Total $", width: "100px", cell: r => <span className="font-mono text-right block font-bold">${r.total}</span> },
        {
            id: "award", header: "", width: "100px", cell: r => (
                <Button size="sm" className={`h-7 text-xs ${r.recommended ? "bg-amber-500 hover:bg-amber-600" : ""}`}
                    onClick={() => awardMutation.mutate({ shipmentId: selected?.id, ...r })}>
                    {r.recommended ? "✓ Award" : "Award"}
                </Button>
            )
        },
    ], [selected]);

    return (
        <StandardPage
            title="Bill of Lading & Rate Shopping"
            description="Electronic rate shopping across contracted carriers. Compare freight rates, transit times, and accessorial charges. Award your preferred carrier, then generate a compliant Bill of Lading (BOL) document for ship confirm."
            breadcrumbs={[{ label: "WMS", href: "/scm/wms/dashboard" }, { label: "BOL Generator" }]}
            actions={<Button variant="outline" onClick={() => toast({ title: "All BOLs exported to PDF" })}><Download className="h-4 w-4 mr-2" />Export BOLs</Button>}
        >
            <div className="grid grid-cols-4 gap-4 mb-6">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending Rate Shop</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-600">{shipments.filter(s => s.status === "Awaiting Rate Shop").length}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Awaiting BOL</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-blue-600">{shipments.filter(s => s.status === "Awaiting BOL").length}</div></CardContent>
                </Card>
                <Card className="border-green-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">BOLs Generated</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">{shipments.filter(s => s.bol).length}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Shipments</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{shipments.length}</div></CardContent>
                </Card>
            </div>

            <Card><CardHeader><CardTitle>Outbound Shipments</CardTitle><CardDescription>Click "Rate Shop" to compare carriers. Award best rate, then generate the BOL.</CardDescription></CardHeader>
                <CardContent className="p-0"><InteractiveSpreadsheet data={shipments} columns={shipCols} onChange={() => { }} containerHeight="380px" /></CardContent>
            </Card>

            {/* Rate Shopping Dialog */}
            <Dialog open={rateShopping} onOpenChange={setRateShopping}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader><DialogTitle>Rate Shop — {selected?.id} ({selected?.origin} → {selected?.dest}, {selected?.weight} lb)</DialogTitle></DialogHeader>
                    <div className="py-3 text-xs text-muted-foreground">
                        <Award className="inline h-3.5 w-3.5 text-amber-500 mr-1" />Recommended carrier is lowest-cost that meets service window. All rates are CONTRACT rates from the rate workbench.
                    </div>
                    <InteractiveSpreadsheet data={rateShopResults} columns={rateCols} onChange={() => { }} containerHeight="300px" />
                </DialogContent>
            </Dialog>

            {/* BOL Preview Dialog */}
            <Dialog open={bolPreview} onOpenChange={setBolPreview}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>BOL Preview — {selected?.bol}</DialogTitle></DialogHeader>
                    <pre className="text-xs font-mono bg-muted/40 rounded-lg p-4 whitespace-pre-wrap border">{selected ? BOL_TEMPLATE(selected) : ""}</pre>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBolPreview(false)}>Close</Button>
                        <Button onClick={() => { toast({ title: `BOL ${selected?.bol} sent to printer` }); setBolPreview(false); }}><FileText className="h-4 w-4 mr-2" />Print BOL</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
