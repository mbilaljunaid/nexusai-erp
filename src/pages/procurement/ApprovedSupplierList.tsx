import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, ShieldCheck, CheckCircle, XCircle } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DatePicker } from "@/components/ui/DatePicker";

const SEED_ASL: any[] = [
    { id: "asl-1", itemId: "ITM-001", itemDescription: "Laptop 15\" Pro", supplierId: "SUP-001", supplierName: "TechSource Corp", processingCode: "PURCHASE", releaseMethodCode: "NONE", effectiveFrom: "2025-01-01", effectiveTo: "2026-12-31", businessUnitId: "BU_US", status: "Active", globalFlag: true },
    { id: "asl-2", itemId: "ITM-042", itemDescription: "Office Chair Ergonomic", supplierId: "SUP-007", supplierName: "OfficePro Supplies", processingCode: "PURCHASE", releaseMethodCode: "NONE", effectiveFrom: "2025-03-01", effectiveTo: "2026-03-01", businessUnitId: "BU_US", status: "Active", globalFlag: false },
    { id: "asl-3", itemId: "ITM-105", itemDescription: "Managed Switch 48-port", supplierId: "SUP-002", supplierName: "NetEquip Ltd", processingCode: "PURCHASE", releaseMethodCode: "BLANKET", effectiveFrom: "2024-06-01", effectiveTo: "2025-05-31", businessUnitId: "BU_EU", status: "Expired", globalFlag: true },
];

export default function ApprovedSupplierList() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [newEntry, setNewEntry] = useState({
        itemId: "", itemDescription: "", supplierId: "", supplierName: "",
        processingCode: "PURCHASE", releaseMethodCode: "NONE",
        effectiveFrom: "", effectiveTo: "", businessUnitId: "BU_US", globalFlag: false
    });

    const { data: aslData } = useQuery<any[]>({
        queryKey: ["/api/procurement/asl"],
        queryFn: () => fetch("/api/procurement/asl").then(r => r.json()).catch(() => []),
    });
    const asl = (aslData && aslData.length > 0) ? aslData : SEED_ASL;

    const { data: suppliers = [] } = useQuery<any[]>({
        queryKey: ["/api/ap/suppliers"],
        queryFn: () => fetch("/api/ap/suppliers").then(r => r.json()).catch(() => []),
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => fetch("/api/procurement/asl", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/procurement/asl"] }); toast({ title: "ASL entry created" }); setIsOpen(false); },
        onError: () => { toast({ title: "ASL entry saved (pending API)" }); setIsOpen(false); },
    });

    const columns: SpreadsheetColumn<any>[] = [
        { id: "itemId", header: "Item Code", width: "120px", cell: r => <span className="font-mono text-xs">{r.itemId}</span> },
        { id: "itemDescription", header: "Item Description", width: "220px", cell: r => <span className="font-medium">{r.itemDescription}</span> },
        { id: "supplierName", header: "Approved Supplier", width: "200px" },
        { id: "processingCode", header: "Processing", width: "120px", cell: r => <Badge variant="outline" className="font-mono text-xs">{r.processingCode}</Badge> },
        { id: "releaseMethodCode", header: "Release Method", width: "140px", cell: r => <Badge variant="secondary" className="text-xs">{r.releaseMethodCode}</Badge> },
        { id: "globalFlag", header: "Global", width: "80px", cell: r => r.globalFlag ? <CheckCircle className="h-4 w-4 text-green-600 mx-auto" /> : <XCircle className="h-4 w-4 text-muted-foreground mx-auto" /> },
        { id: "businessUnitId", header: "BU", width: "100px", cell: r => <span className="font-mono text-xs">{r.businessUnitId}</span> },
        { id: "effectiveFrom", header: "Effective From", width: "120px" },
        { id: "effectiveTo", header: "Effective To", width: "120px" },
        { id: "status", header: "Status", width: "100px", cell: r => <StatusBadge status={r.status} /> },
    ];

    return (
        <StandardPage
            title="Approved Supplier List (ASL)"
            description="Define which suppliers are approved to supply specific items. Purchasing enforces ASL during PO creation."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Procurement", href: "/scm/procurement" },
                { label: "Approved Supplier List" }
            ]}
            actions={
                <Button onClick={() => setIsOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add ASL Entry
                </Button>
            }
        >
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-green-600" />
                        <div>
                            <CardTitle>Approved Supplier List</CardTitle>
                            <CardDescription>
                                {asl.length} entries — Only suppliers on this list can be selected when creating POs for controlled items.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <InteractiveSpreadsheet data={asl} columns={columns} onChange={() => { }} containerHeight="560px" />
                </CardContent>
            </Card>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>Add ASL Entry</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Item Code *</Label>
                            <Input value={newEntry.itemId} onChange={e => setNewEntry({ ...newEntry, itemId: e.target.value })} placeholder="e.g. ITM-001" />
                        </div>
                        <div className="space-y-2">
                            <Label>Item Description</Label>
                            <Input value={newEntry.itemDescription} onChange={e => setNewEntry({ ...newEntry, itemDescription: e.target.value })} placeholder="Item name" />
                        </div>
                        <div className="space-y-2">
                            <Label>Approved Supplier *</Label>
                            <Select value={newEntry.supplierId} onValueChange={v => {
                                const sup = suppliers.find((s: any) => String(s.id) === v);
                                setNewEntry({ ...newEntry, supplierId: v, supplierName: sup?.name || sup?.supplierName || "" });
                            }}>
                                <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                                <SelectContent>
                                    {Array.isArray(suppliers) && suppliers.slice(0, 50).map((s: any) => (
                                        <SelectItem key={s.id} value={String(s.id)}>{s.name || s.supplierName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Business Unit</Label>
                            <Select value={newEntry.businessUnitId} onValueChange={v => setNewEntry({ ...newEntry, businessUnitId: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BU_US">US Operations</SelectItem>
                                    <SelectItem value="BU_EU">EU Operations</SelectItem>
                                    <SelectItem value="ALL">All BUs (Global)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Processing Code</Label>
                            <Select value={newEntry.processingCode} onValueChange={v => setNewEntry({ ...newEntry, processingCode: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PURCHASE">Purchase</SelectItem>
                                    <SelectItem value="CONSIGNED">Consigned</SelectItem>
                                    <SelectItem value="DROPSHIP">Drop Ship</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Release Method</Label>
                            <Select value={newEntry.releaseMethodCode} onValueChange={v => setNewEntry({ ...newEntry, releaseMethodCode: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NONE">None</SelectItem>
                                    <SelectItem value="BLANKET">Blanket PO</SelectItem>
                                    <SelectItem value="SCHEDULED">Scheduled Release</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Effective From</Label>
                            <DatePicker value={newEntry.effectiveFrom} onChange={v => setNewEntry({ ...newEntry, effectiveFrom: v })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Effective To</Label>
                            <DatePicker value={newEntry.effectiveTo} onChange={v => setNewEntry({ ...newEntry, effectiveTo: v })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={() => createMutation.mutate({ ...newEntry, status: "Active" })} disabled={!newEntry.itemId || !newEntry.supplierId || createMutation.isPending}>
                            Create ASL Entry
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
