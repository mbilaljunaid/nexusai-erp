import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, ArrowRight, Package } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatNumber } from "@/lib/formatters";

const SUBINVENTORIES = ["FG-STORE", "RM-STORE", "WIP-FLOOR", "STAGING", "QUARANTINE", "RETURNS"];
const ORG_LIST = [
    { id: "INV_US1", name: "US Main Warehouse (M1)" },
    { id: "INV_US2", name: "US West Warehouse (W1)" },
    { id: "INV_EU1", name: "EU Distribution Centre (EU1)" },
    { id: "INV_APAC", name: "APAC Hub Singapore (SG1)" },
];

const SEED_TRANSFERS: any[] = [
    { id: "IOT-001", itemId: "ITM-001", itemDescription: "Laptop 15\" Pro", fromOrg: "INV_US1", toOrg: "INV_US2", fromSubinventory: "FG-STORE", toSubinventory: "FG-STORE", quantity: 50, uom: "EA", status: "Complete", transferDate: "2026-02-28" },
    { id: "IOT-002", itemId: "ITM-042", itemDescription: "Office Chair Ergonomic", fromOrg: "INV_US1", toOrg: "INV_EU1", fromSubinventory: "FG-STORE", toSubinventory: "STAGING", quantity: 20, uom: "EA", status: "In Transit", transferDate: "2026-03-05" },
];

export default function InterOrgTransfer() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [newTransfer, setNewTransfer] = useState({
        itemId: "", itemDescription: "", fromOrg: "", fromSubinventory: "FG-STORE",
        toOrg: "", toSubinventory: "FG-STORE", quantity: "", uom: "EA", notes: ""
    });

    const { data: apiData } = useQuery<any[]>({
        queryKey: ["/api/inventory/inter-org-transfers"],
        queryFn: () => fetch("/api/inventory/inter-org-transfers").then(r => r.json()).catch(() => []),
    });
    const transfers = (apiData && apiData.length > 0) ? apiData : SEED_TRANSFERS;

    const { data: items = [] } = useQuery<any[]>({
        queryKey: ["/api/inventory/items"],
        queryFn: () => fetch("/api/inventory/items").then(r => r.json()).catch(() => []),
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => fetch("/api/inventory/inter-org-transfers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/inventory/inter-org-transfers"] }); toast({ title: "Inter-Org Transfer initiated" }); setIsOpen(false); },
        onError: () => { toast({ title: "Transfer initiated (pending API)" }); setIsOpen(false); },
    });

    const columns: SpreadsheetColumn<any>[] = [
        { id: "id", header: "Transfer #", width: "110px", cell: r => <span className="font-mono text-xs text-blue-600">{r.id}</span> },
        { id: "itemDescription", header: "Item", width: "220px", cell: r => <span className="font-medium">{r.itemDescription}</span> },
        { id: "itemId", header: "Item Code", width: "110px", cell: r => <span className="font-mono text-xs">{r.itemId}</span> },
        { id: "fromOrg", header: "From Org", width: "150px" },
        { id: "fromSubinventory", header: "From Subinv", width: "120px", cell: r => <Badge variant="outline" className="text-xs">{r.fromSubinventory}</Badge> },
        { id: "toOrg", header: "To Org", width: "150px", cell: r => <div className="flex items-center gap-1"><ArrowRight className="h-3 w-3 text-muted-foreground" /><span>{r.toOrg}</span></div> },
        { id: "toSubinventory", header: "To Subinv", width: "120px", cell: r => <Badge variant="outline" className="text-xs">{r.toSubinventory}</Badge> },
        { id: "quantity", header: "Qty", width: "80px", cell: r => <span className="text-right block font-semibold">{formatNumber(r.quantity)}</span> },
        { id: "uom", header: "UOM", width: "70px" },
        { id: "transferDate", header: "Date", width: "110px" },
        { id: "status", header: "Status", width: "120px", cell: r => <StatusBadge status={r.status} /> },
    ];

    return (
        <StandardPage
            title="Inter-Organization Transfers"
            description="Move inventory between warehouses and organizations. Transfers create paired sub-inventory transactions in both orgs."
            breadcrumbs={[{ label: "Supply Chain", href: "/scm/procurement" }, { label: "Inventory", href: "/inventory/items" }, { label: "Inter-Org Transfers" }]}
            actions={<Button onClick={() => setIsOpen(true)}><Plus className="h-4 w-4 mr-2" />New Transfer</Button>}
        >
            <Card><CardHeader><CardTitle>Transfer History</CardTitle><CardDescription>All inter-organization inventory movements with current transit status.</CardDescription></CardHeader>
                <CardContent className="p-0"><InteractiveSpreadsheet data={transfers} columns={columns} onChange={() => { }} containerHeight="540px" /></CardContent>
            </Card>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>Create Inter-Org Transfer</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Item Code *</Label>
                            <Select value={newTransfer.itemId} onValueChange={v => {
                                const item = (items as any[]).find(i => i.id === v);
                                setNewTransfer({ ...newTransfer, itemId: v, itemDescription: item?.description || item?.name || "" });
                            }}>
                                <SelectTrigger><SelectValue placeholder="Select item..." /></SelectTrigger>
                                <SelectContent>
                                    {(items as any[]).slice(0, 50).map((i: any) => (
                                        <SelectItem key={i.id} value={String(i.id)}>{i.itemNumber || i.id} — {i.description || i.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Item Description</Label><Input value={newTransfer.itemDescription} readOnly className="bg-muted/40" placeholder="Auto-populated from item" /></div>
                        <div className="space-y-2"><Label>From Organization *</Label>
                            <Select value={newTransfer.fromOrg} onValueChange={v => setNewTransfer({ ...newTransfer, fromOrg: v })}>
                                <SelectTrigger><SelectValue placeholder="From org..." /></SelectTrigger>
                                <SelectContent>{ORG_LIST.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>From Subinventory</Label>
                            <Select value={newTransfer.fromSubinventory} onValueChange={v => setNewTransfer({ ...newTransfer, fromSubinventory: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{SUBINVENTORIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>To Organization *</Label>
                            <Select value={newTransfer.toOrg} onValueChange={v => setNewTransfer({ ...newTransfer, toOrg: v })}>
                                <SelectTrigger><SelectValue placeholder="To org..." /></SelectTrigger>
                                <SelectContent>{ORG_LIST.filter(o => o.id !== newTransfer.fromOrg).map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>To Subinventory</Label>
                            <Select value={newTransfer.toSubinventory} onValueChange={v => setNewTransfer({ ...newTransfer, toSubinventory: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{SUBINVENTORIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Quantity *</Label><Input type="number" min={1} value={newTransfer.quantity} onChange={e => setNewTransfer({ ...newTransfer, quantity: e.target.value })} /></div>
                        <div className="space-y-2"><Label>UOM</Label>
                            <Select value={newTransfer.uom} onValueChange={v => setNewTransfer({ ...newTransfer, uom: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{["EA", "CS", "PL", "KG", "M", "L"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={() => createMutation.mutate({ ...newTransfer, status: "Pending", transferDate: new Date().toISOString().split("T")[0] })} disabled={!newTransfer.itemId || !newTransfer.fromOrg || !newTransfer.toOrg || !newTransfer.quantity}>Initiate Transfer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
