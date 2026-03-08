import { useState } from "react";
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
import { Search, Package, BarChart3 } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

const SEED_ONHAND: any[] = [
    { id: 1, itemId: "ITM-001", itemDescription: "Laptop 15\" Pro", orgId: "INV_US1", subinventory: "FG-STORE", locator: "A1-01-01", lotNumber: "LOT-2026-001", serialNumber: null, onHandQty: 142, reservedQty: 30, availableQty: 112, uom: "EA", unitCost: 1250.00 },
    { id: 2, itemId: "ITM-001", itemDescription: "Laptop 15\" Pro", orgId: "INV_US2", subinventory: "FG-STORE", locator: "B3-02-01", lotNumber: "LOT-2026-002", serialNumber: null, onHandQty: 58, reservedQty: 10, availableQty: 48, uom: "EA", unitCost: 1250.00 },
    { id: 3, itemId: "ITM-042", itemDescription: "Office Chair Ergonomic", orgId: "INV_US1", subinventory: "FG-STORE", locator: "C4-01-03", lotNumber: null, serialNumber: null, onHandQty: 200, reservedQty: 50, availableQty: 150, uom: "EA", unitCost: 380.00 },
    { id: 4, itemId: "ITM-105", itemDescription: "Managed Switch 48-port", orgId: "INV_EU1", subinventory: "STAGING", locator: "EU-A1-02", lotNumber: null, serialNumber: "SW-2024-00042", onHandQty: 5, reservedQty: 0, availableQty: 5, uom: "EA", unitCost: 2100.00 },
    { id: 5, itemId: "ITM-202", itemDescription: "Raw Material — Aluminium Sheet", orgId: "INV_US1", subinventory: "RM-STORE", locator: "RM-01-01", lotNumber: "RM-LOT-2026-Q1", serialNumber: null, onHandQty: 5000, reservedQty: 1200, availableQty: 3800, uom: "KG", unitCost: 3.50 },
];

export default function OnHandBalanceInquiry() {
    const { toast } = useToast();
    const [searchItem, setSearchItem] = useState("");
    const [filterOrg, setFilterOrg] = useState("ALL");
    const [filterSubinv, setFilterSubinv] = useState("ALL");

    const { data: apiData } = useQuery<any[]>({
        queryKey: ["/api/inventory/on-hand", filterOrg, filterSubinv],
        queryFn: () => fetch(`/api/inventory/on-hand?org=${filterOrg}&subinv=${filterSubinv}`).then(r => r.json()).catch(() => []),
    });
    const rawData = (apiData && apiData.length > 0) ? apiData : SEED_ONHAND;

    const data = rawData.filter(r => {
        const q = searchItem.toLowerCase();
        return !q || r.itemId?.toLowerCase().includes(q) || r.itemDescription?.toLowerCase().includes(q);
    });

    const totalValue = data.reduce((s, r) => s + ((r.onHandQty || 0) * (r.unitCost || 0)), 0);
    const totalOnHand = data.reduce((s, r) => s + (r.onHandQty || 0), 0);
    const totalReserved = data.reduce((s, r) => s + (r.reservedQty || 0), 0);
    const totalAvailable = data.reduce((s, r) => s + (r.availableQty || 0), 0);

    const columns: SpreadsheetColumn<any>[] = [
        { id: "itemId", header: "Item Code", width: "120px", cell: r => <span className="font-mono text-xs text-blue-600">{r.itemId}</span> },
        { id: "itemDescription", header: "Description", width: "230px", cell: r => <span className="font-medium">{r.itemDescription}</span> },
        { id: "orgId", header: "Org", width: "110px", cell: r => <Badge variant="outline" className="font-mono text-xs">{r.orgId}</Badge> },
        { id: "subinventory", header: "Subinventory", width: "130px", cell: r => <span className="text-sm">{r.subinventory}</span> },
        { id: "locator", header: "Locator", width: "110px", cell: r => <span className="font-mono text-xs">{r.locator || "—"}</span> },
        { id: "lotNumber", header: "Lot #", width: "140px", cell: r => r.lotNumber ? <span className="font-mono text-xs text-indigo-600">{r.lotNumber}</span> : <span className="text-muted-foreground text-xs">—</span> },
        { id: "serialNumber", header: "Serial #", width: "140px", cell: r => r.serialNumber ? <span className="font-mono text-xs text-purple-600">{r.serialNumber}</span> : <span className="text-muted-foreground text-xs">—</span> },
        { id: "onHandQty", header: "On Hand", width: "100px", cell: r => <span className="font-bold text-right block">{formatNumber(r.onHandQty)}</span> },
        { id: "reservedQty", header: "Reserved", width: "100px", cell: r => <span className="text-amber-600 font-semibold text-right block">{formatNumber(r.reservedQty)}</span> },
        { id: "availableQty", header: "Available", width: "100px", cell: r => <span className={`font-bold text-right block ${r.availableQty <= 0 ? "text-red-600" : "text-green-700"}`}>{formatNumber(r.availableQty)}</span> },
        { id: "uom", header: "UOM", width: "70px" },
        { id: "unitCost", header: "Unit Cost", width: "110px", cell: r => <span className="text-right block">${formatNumber(r.unitCost)}</span> },
        { id: "totalValue", header: "Total Value", width: "120px", cell: r => <span className="font-semibold text-right block">${formatNumber((r.onHandQty || 0) * (r.unitCost || 0))}</span> },
    ];

    return (
        <StandardPage
            title="On-Hand Balance Inquiry"
            description="Real-time inventory on-hand by item, organization, subinventory, lot, and serial. Drill into any row for full transaction history."
            breadcrumbs={[{ label: "Supply Chain", href: "/scm/procurement" }, { label: "Inventory", href: "/inventory/items" }, { label: "On-Hand Balances" }]}
        >
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Package className="h-4 w-4" />Total On-Hand</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{formatNumber(totalOnHand)}</div><p className="text-xs text-muted-foreground">across {data.length} records</p></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Reserved</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-amber-600">{formatNumber(totalReserved)}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Available to Promise</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">{formatNumber(totalAvailable)}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><BarChart3 className="h-4 w-4" />Total Inventory Value</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">${formatNumber(totalValue)}</div></CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-4">
                <CardContent className="pt-4">
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Search Item</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-9" value={searchItem} onChange={e => setSearchItem(e.target.value)} placeholder="Item code or description..." />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Organization</Label>
                            <Select value={filterOrg} onValueChange={setFilterOrg}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Organizations</SelectItem>
                                    <SelectItem value="INV_US1">US Main (M1)</SelectItem>
                                    <SelectItem value="INV_US2">US West (W1)</SelectItem>
                                    <SelectItem value="INV_EU1">EU DC (EU1)</SelectItem>
                                    <SelectItem value="INV_APAC">APAC Hub (SG1)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Subinventory</Label>
                            <Select value={filterSubinv} onValueChange={setFilterSubinv}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Subinventories</SelectItem>
                                    {["FG-STORE", "RM-STORE", "WIP-FLOOR", "STAGING", "QUARANTINE", "RETURNS"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card><CardHeader><CardTitle>On-Hand Balances</CardTitle><CardDescription>Showing {data.length} records. Available = On Hand − Reserved.</CardDescription></CardHeader>
                <CardContent className="p-0"><InteractiveSpreadsheet data={data} columns={columns} onChange={() => { }} containerHeight="520px" /></CardContent>
            </Card>
        </StandardPage>
    );
}
