import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { useToast } from "@/hooks/use-toast";
import { Package, Printer, CheckCircle, ScanLine, Box } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatNumber } from "@/lib/formatters";

const SEED_PACKING_QUEUE: any[] = [
    { id: "PICK-001", soNumber: "SO-2026-4421", customer: "Acme Corp", priority: "High", pickedItems: 8, packedItems: 0, containerType: "Medium Box", weight: "12.4 kg", trackingNum: "", carrier: "FedEx Ground", status: "Ready to Pack" },
    { id: "PICK-002", soNumber: "SO-2026-4418", customer: "TechStart Ltd", priority: "Standard", pickedItems: 3, packedItems: 3, containerType: "Small Box", weight: "2.1 kg", trackingNum: "FX-9284726541", carrier: "FedEx Express", status: "Packed — Label Printed" },
    { id: "PICK-003", soNumber: "SO-2026-4405", customer: "Builders Supply Co", priority: "Standard", pickedItems: 15, packedItems: 12, containerType: "Large Box", weight: "38.7 kg", trackingNum: "", carrier: "UPS Ground", status: "Packing In Progress" },
];

const SEED_ITEMS: any[] = [
    { id: "PI-001", pickId: "PICK-001", itemCode: "ITM-001", description: "Laptop 15\" Pro", qty: 2, uom: "EA", scanned: false },
    { id: "PI-002", pickId: "PICK-001", itemCode: "ITM-042", description: "Laptop Carry Bag", qty: 2, uom: "EA", scanned: false },
    { id: "PI-003", pickId: "PICK-001", itemCode: "ITM-105", description: "USB-C Hub 7-port", qty: 4, uom: "EA", scanned: false },
];

const CONTAINERS = ["Small Box (30x20x20cm)", "Medium Box (50x40x30cm)", "Large Box (80x60x50cm)", "Carton (120x80x60cm)", "Pallet"];

export default function PackStation() {
    const { toast } = useToast();
    const [activePickId, setActivePickId] = useState<string | null>(null);
    const [scannedItems, setScannedItems] = useState<Set<string>>(new Set());
    const [containerType, setContainerType] = useState(CONTAINERS[1]);
    const [scanInput, setScanInput] = useState("");

    const { data: apiQueue } = useQuery<any[]>({ queryKey: ["/api/wms/packing-queue"], queryFn: () => fetch("/api/wms/packing-queue").then(r => r.json()).catch(() => []) });
    const queue = (apiQueue && apiQueue.length > 0) ? apiQueue : SEED_PACKING_QUEUE;

    const activePick = queue.find(q => q.id === activePickId) || null;
    const activeItems = SEED_ITEMS.filter(i => i.pickId === activePickId);

    const handleScan = () => {
        const found = activeItems.find(i => i.itemCode === scanInput.trim() || i.description.toLowerCase().includes(scanInput.toLowerCase()));
        if (found) {
            setScannedItems(prev => new Set([...prev, found.id]));
            toast({ title: `✓ Scanned: ${found.description}` });
        } else {
            toast({ title: "Item not found in pick list", variant: "destructive" });
        }
        setScanInput("");
    };

    const queueColumns = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "id", header: "Pick #", width: "100px", cell: r => <span className="font-mono text-xs text-blue-600">{r.id}</span> },
        { id: "soNumber", header: "Sales Order", width: "140px", cell: r => <span className="font-mono text-sm text-indigo-600">{r.soNumber}</span> },
        { id: "customer", header: "Customer", width: "170px", cell: r => <span className="font-medium">{r.customer}</span> },
        { id: "priority", header: "Priority", width: "100px", cell: r => <Badge variant={r.priority === "High" ? "default" : "outline"} className="text-xs">{r.priority}</Badge> },
        { id: "pickedItems", header: "Items Picked", width: "110px", cell: r => <span className="text-center block font-semibold">{r.pickedItems}</span> },
        { id: "containerType", header: "Container", width: "150px" },
        { id: "carrier", header: "Carrier", width: "130px" },
        { id: "status", header: "Status", width: "180px", cell: r => <StatusBadge status={r.status} /> },
        { id: "action", header: "", width: "120px", cell: r => r.status === "Ready to Pack" ? <Button size="sm" className="h-7 text-xs" onClick={() => setActivePickId(r.id)}>Open Pack</Button> : null },
    ], []);

    return (
        <StandardPage
            title="Pack Station"
            description="Step-by-step scan-to-pack screen for packing operators. Scan each item, select container, print label, and close carton."
            breadcrumbs={[{ label: "SCM", href: "/scm/procurement" }, { label: "WMS", href: "/scm/wms" }, { label: "Pack Station" }]}
        >
            <div className="grid grid-cols-3 gap-4 mb-6">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Package className="h-4 w-4 text-amber-500" />Ready to Pack</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-600">{queue.filter(q => q.status === "Ready to Pack").length}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Box className="h-4 w-4" />In Progress</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-blue-600">{queue.filter(q => q.status === "Packing In Progress").length}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><CheckCircle className="h-4 w-4 text-green-600" />Packed Today</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">{queue.filter(q => q.status.includes("Packed")).length}</div></CardContent>
                </Card>
            </div>

            {!activePickId ? (
                <Card>
                    <CardHeader><CardTitle>Packing Queue</CardTitle><CardDescription>Select a pick to begin the packing process.</CardDescription></CardHeader>
                    <CardContent className="p-0"><InteractiveSpreadsheet data={queue} columns={queueColumns} onChange={() => { }} containerHeight="440px" /></CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>Pack: {activePick?.soNumber}</CardTitle>
                                    <CardDescription>{activePick?.customer}</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => { setActivePickId(null); setScannedItems(new Set()); }}>← Back to Queue</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input className="pl-9 font-mono" value={scanInput} onChange={e => setScanInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleScan()} placeholder="Scan item barcode or type code..." autoFocus />
                                </div>
                                <Button onClick={handleScan}>Scan</Button>
                            </div>
                            <div className="space-y-2">
                                {activeItems.map(item => (
                                    <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg border ${scannedItems.has(item.id) ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-border"}`}>
                                        <div>
                                            <p className="font-medium text-sm">{item.description}</p>
                                            <p className="text-xs font-mono text-muted-foreground">{item.itemCode} · {item.qty} {item.uom}</p>
                                        </div>
                                        {scannedItems.has(item.id) ? <CheckCircle className="h-5 w-5 text-green-600" /> : <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Container &amp; Label</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Container Type</Label>
                                <Select value={containerType} onValueChange={setContainerType}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{CONTAINERS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2"><Label>Carrier</Label>
                                <Select defaultValue={activePick?.carrier}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{["FedEx Ground", "FedEx Express", "UPS Ground", "UPS 2-Day", "DHL Express", "USPS Priority"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2"><Label>Gross Weight (kg)</Label><Input type="number" step="0.1" placeholder="Enter weight..." /></div>
                            <div className="p-4 border rounded-lg bg-muted/30 text-center space-y-2">
                                <p className="text-xs text-muted-foreground">Items scanned: <span className="font-bold text-foreground">{scannedItems.size} / {activeItems.length}</span></p>
                                {scannedItems.size === activeItems.length && <Badge className="bg-green-600">All items verified</Badge>}
                            </div>
                            <Button className="w-full" disabled={scannedItems.size < activeItems.length}>
                                <Printer className="h-4 w-4 mr-2" /> Print Shipping Label &amp; Close Carton
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </StandardPage>
    );
}
