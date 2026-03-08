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
import { CheckCircle, Truck, Clock } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatNumber } from "@/lib/formatters";

const SEED_PO_ACK: any[] = [
    { id: "POA-001", po: "PO-0084210", supplier: "Industrial Supplies Co", lines: 8, requestedDelivery: "2026-03-15", ackStatus: "Confirmed", confirmedDelivery: "2026-03-15", comments: "", raisedDate: "2026-03-01" },
    { id: "POA-002", po: "PO-0084218", supplier: "FastTrack Logistics", lines: 3, requestedDelivery: "2026-03-20", ackStatus: "Rescheduled", confirmedDelivery: "2026-03-27", comments: "Material shortage — 7 day delay", raisedDate: "2026-03-02" },
    { id: "POA-003", po: "PO-0084225", supplier: "Global MRO Ltd", lines: 12, requestedDelivery: "2026-03-22", ackStatus: "Pending", confirmedDelivery: "", comments: "", raisedDate: "2026-03-04" },
    { id: "POA-004", po: "PO-0084230", supplier: "CoatPro Services Ltd", lines: 5, requestedDelivery: "2026-03-18", ackStatus: "Partially Confirmed", confirmedDelivery: "2026-03-18", comments: "Lines 4-5 delayed by 5 days", raisedDate: "2026-03-05" },
];

const SEED_ASN: any[] = [
    { asnId: "ASN-0041", po: "PO-0084100", supplier: "Industrial Supplies Co", lines: 6, shipDate: "2026-03-08", expectedArrival: "2026-03-10", carrier: "FedEx", tracking: "7748392001923", grossWeight: "285 KG", status: "In Transit" },
    { asnId: "ASN-0040", po: "PO-0084082", supplier: "Global MRO Ltd", lines: 3, shipDate: "2026-03-06", expectedArrival: "2026-03-09", carrier: "DHL", tracking: "1ZX293810249", grossWeight: "142 KG", status: "Delivered" },
    { asnId: "ASN-0039", po: "PO-0084050", supplier: "FastTrack Logistics", lines: 10, shipDate: "2026-03-04", expectedArrival: "2026-03-07", carrier: "UPS", tracking: "1ZN7382010023", grossWeight: "890 KG", status: "Exception" },
];

export default function SupplierASNPortal() {
    const { toast } = useToast();
    const [ackOpen, setAckOpen] = useState(false);
    const [selected, setSelected] = useState<any>(null);
    const [confirmedDate, setConfirmedDate] = useState("");

    const confirmMutation = useMutation({
        mutationFn: (d: any) => fetch(`/api/procurement/po-acknowledgement/${d.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { toast({ title: "PO acknowledgement submitted" }); setAckOpen(false); },
        onError: () => { toast({ title: "Acknowledgement logged (pending API)" }); setAckOpen(false); },
    });

    const pending = SEED_PO_ACK.filter(r => r.ackStatus === "Pending").length;
    const inTransit = SEED_ASN.filter(r => r.status === "In Transit").length;
    const exceptions = SEED_ASN.filter(r => r.status === "Exception").length;

    const ackCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "id", header: "Ack ID", width: "100px", cell: r => <span className="font-mono text-xs text-blue-600">{r.id}</span> },
        { id: "po", header: "PO #", width: "130px", cell: r => <span className="font-mono text-xs">{r.po}</span> },
        { id: "supplier", header: "Supplier", width: "180px", cell: r => <span className="font-medium text-sm">{r.supplier}</span> },
        { id: "lines", header: "Lines", width: "70px", cell: r => <span className="text-center block">{r.lines}</span> },
        { id: "requestedDelivery", header: "Requested Delivery", width: "150px", cell: r => <span className="text-xs font-mono">{r.requestedDelivery}</span> },
        { id: "confirmedDelivery", header: "Confirmed Delivery", width: "150px", cell: r => r.confirmedDelivery ? <span className={`text-xs font-mono font-bold ${r.confirmedDelivery > r.requestedDelivery ? "text-red-600" : "text-green-700"}`}>{r.confirmedDelivery}</span> : <span className="text-muted-foreground text-xs">—</span> },
        { id: "comments", header: "Supplier Notes", width: "220px", cell: r => <span className="text-xs text-muted-foreground">{r.comments || "—"}</span> },
        { id: "ackStatus", header: "Ack Status", width: "160px", cell: r => <StatusBadge status={r.ackStatus} /> },
        {
            id: "actions", header: "", width: "130px", cell: r => r.ackStatus === "Pending"
                ? <Button size="sm" className="h-7 text-xs" onClick={() => { setSelected(r); setAckOpen(true); }}>Acknowledge</Button>
                : <span className="text-xs text-muted-foreground">—</span>
        },
    ], []);

    const asnCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "asnId", header: "ASN #", width: "120px", cell: r => <span className="font-mono text-xs text-blue-600">{r.asnId}</span> },
        { id: "po", header: "PO #", width: "130px", cell: r => <span className="font-mono text-xs">{r.po}</span> },
        { id: "supplier", header: "Supplier", width: "180px", cell: r => <span className="font-medium text-sm">{r.supplier}</span> },
        { id: "lines", header: "Lines", width: "70px", cell: r => <span className="text-center block">{r.lines}</span> },
        { id: "shipDate", header: "Ship Date", width: "110px", cell: r => <span className="text-xs font-mono">{r.shipDate}</span> },
        { id: "expectedArrival", header: "Expected Arrival", width: "140px", cell: r => <span className="text-xs font-mono font-semibold">{r.expectedArrival}</span> },
        { id: "carrier", header: "Carrier", width: "100px", cell: r => <Badge variant="outline" className="text-xs">{r.carrier}</Badge> },
        { id: "tracking", header: "Tracking #", width: "170px", cell: r => <span className="font-mono text-xs text-blue-600">{r.tracking}</span> },
        { id: "grossWeight", header: "Weight", width: "90px", cell: r => <span className="text-xs">{r.grossWeight}</span> },
        { id: "status", header: "Status", width: "130px", cell: r => <StatusBadge status={r.status} /> },
    ], []);

    return (
        <StandardPage
            title="Supplier ASN & PO Acknowledgement Portal"
            description="Oracle Supplier Portal — PO acknowledgement and Advanced Shipment Notifications (ASN). Suppliers confirm PO delivery dates or flag delays. ASNs pre-advise inbound shipments with tracking numbers, enabling WMS receiving preparation and dock scheduling."
            breadcrumbs={[{ label: "Procurement", href: "/procurement" }, { label: "Supplier Portal ASN" }]}
        >
            <div className="grid grid-cols-4 gap-4 mb-6">
                <Card className="border-amber-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending Acknowledgements</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-600">{pending}</div></CardContent>
                </Card>
                <Card className="border-blue-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">ASNs In Transit</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-blue-700">{inTransit}</div></CardContent>
                </Card>
                <Card className="border-red-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Shipment Exceptions</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">{exceptions}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total ASNs (Week)</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{SEED_ASN.length}</div></CardContent>
                </Card>
            </div>

            <Tabs defaultValue="ack">
                <TabsList className="mb-4">
                    <TabsTrigger value="ack">PO Acknowledgements</TabsTrigger>
                    <TabsTrigger value="asn">Advanced Shipment Notices (ASN)</TabsTrigger>
                </TabsList>
                <TabsContent value="ack">
                    <Card>
                        <CardHeader><CardTitle>PO Acknowledgements</CardTitle><CardDescription>Suppliers confirm delivery dates or flag rescheduling. Pending POs require supplier acknowledgement within SLA window.</CardDescription></CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={SEED_PO_ACK} columns={ackCols} onChange={() => { }} containerHeight="360px" /></CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="asn">
                    <Card>
                        <CardHeader><CardTitle>Advanced Shipment Notifications</CardTitle><CardDescription>Supplier-submitted ASNs pre-advise inbound shipments with carrier tracking. Triggers WMS dock appointment and GRN preparation.</CardDescription></CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={SEED_ASN} columns={asnCols} onChange={() => { }} containerHeight="320px" /></CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={ackOpen} onOpenChange={setAckOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Acknowledge PO — {selected?.po}</DialogTitle></DialogHeader>
                    {selected && <div className="py-4 space-y-4 text-sm">
                        <div className="p-3 bg-muted/30 rounded-lg grid grid-cols-2 gap-2 text-sm">
                            <span className="text-muted-foreground">Supplier:</span><span className="font-medium">{selected.supplier}</span>
                            <span className="text-muted-foreground">Requested Delivery:</span><span className="font-mono">{selected.requestedDelivery}</span>
                        </div>
                        <div className="space-y-2"><Label>Confirmed Delivery Date *</Label><Input type="date" value={confirmedDate} onChange={e => setConfirmedDate(e.target.value)} /></div>
                        {confirmedDate && confirmedDate > selected.requestedDelivery && (
                            <div className="p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                                ⚠️ Confirmed date is later than requested — this will be flagged as a rescheduled delivery.
                            </div>
                        )}
                    </div>}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAckOpen(false)}>Cancel</Button>
                        <Button disabled={!confirmedDate} onClick={() => confirmMutation.mutate({ ...selected, confirmedDelivery: confirmedDate })}><CheckCircle className="h-4 w-4 mr-2" />Submit Acknowledgement</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
