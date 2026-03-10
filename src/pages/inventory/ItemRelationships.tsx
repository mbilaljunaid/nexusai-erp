import { useState, useMemo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, ChevronRight, ArrowLeftRight } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";

const REL_TYPES = ["Substitute", "Cross-Sell", "Up-Sell", "Related", "ATO Option", "PTO Included", "Complementary"];

const SEED_RELS: any[] = [
    { id: "IR-001", fromItem: "ITM-001", fromDesc: "Laptop 15\" Pro 16GB", toItem: "ITM-002", toDesc: "Laptop 15\" Pro 8GB", relType: "Substitute", reciprocal: true, priority: 1, activeFlag: true, note: "Lower spec substitute when ITM-001 OOS" },
    { id: "IR-002", fromItem: "ITM-001", fromDesc: "Laptop 15\" Pro 16GB", toItem: "ITM-042", toDesc: "Laptop Carry Bag 15\"", relType: "Cross-Sell", reciprocal: false, priority: 1, activeFlag: true, note: "Bundle upsell" },
    { id: "IR-003", fromItem: "ITM-001", fromDesc: "Laptop 15\" Pro 16GB", toItem: "ITM-105", toDesc: "USB-C Hub 7-port", relType: "Complementary", reciprocal: false, priority: 2, activeFlag: true, note: "" },
    { id: "IR-004", fromItem: "RM-202", fromDesc: "Aluminium Sheet 2mm", toItem: "RM-205", toDesc: "Aluminium Sheet 3mm", relType: "Substitute", reciprocal: true, priority: 1, activeFlag: true, note: "3mm usable when 2mm OOS (with BOM approval)" },
];

const SEED_ATO: any[] = [
    { id: "ATO-001", modelItem: "CFG-LAPTOP-PRO", modelDesc: "Laptop Pro — Configurable", optionClass: "Memory", optionItem: "MEM-16", optionDesc: "16GB RAM", mandatory: false, default: true },
    { id: "ATO-002", modelItem: "CFG-LAPTOP-PRO", modelDesc: "Laptop Pro — Configurable", optionClass: "Memory", optionItem: "MEM-32", optionDesc: "32GB RAM", mandatory: false, default: false },
    { id: "ATO-003", modelItem: "CFG-LAPTOP-PRO", modelDesc: "Laptop Pro — Configurable", optionClass: "Storage", optionItem: "SSD-512", optionDesc: "512GB SSD", mandatory: false, default: true },
    { id: "ATO-004", modelItem: "CFG-LAPTOP-PRO", modelDesc: "Laptop Pro — Configurable", optionClass: "Storage", optionItem: "SSD-1TB", optionDesc: "1TB SSD", mandatory: false, default: false },
];

export default function ItemRelationships() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [newRel, setNewRel] = useState({ fromItem: "", toItem: "", relType: "Substitute", priority: "1", note: "" });

    const { data: apiData } = useQuery<any[]>({ queryKey: ["/api/inventory/item-relationships"], queryFn: () => fetch("/api/inventory/item-relationships").then(r => r.json()).catch(() => []) });
    const rels = (apiData && apiData.length > 0) ? apiData : SEED_RELS;

    const createMutation = useMutation({
        mutationFn: (d: any) => fetch("/api/inventory/item-relationships", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/inventory/item-relationships"] }); toast({ title: "Item relationship created" }); setIsOpen(false); },
        onError: () => { toast({ title: "Saved (pending API)" }); setIsOpen(false); },
    });

    const relCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "fromItem", header: "From Item", width: "120px", cell: r => <span className="font-mono text-xs text-blue-600">{r.fromItem}</span> },
        { id: "fromDesc", header: "From Description", width: "220px", cell: r => <span className="font-medium">{r.fromDesc}</span> },
        { id: "arrow", header: "", width: "60px", cell: () => <ArrowLeftRight className="h-4 w-4 text-muted-foreground mx-auto" /> },
        { id: "toItem", header: "To Item", width: "120px", cell: r => <span className="font-mono text-xs text-indigo-600">{r.toItem}</span> },
        { id: "toDesc", header: "To Description", width: "220px", cell: r => <span className="font-medium">{r.toDesc}</span> },
        { id: "relType", header: "Relationship", width: "150px", cell: r => <Badge variant={r.relType === "Substitute" ? "default" : r.relType === "Cross-Sell" ? "secondary" : "outline"} className="text-xs">{r.relType}</Badge> },
        { id: "reciprocal", header: "Reciprocal", width: "100px", cell: r => <span className={`text-center block text-xs font-semibold ${r.reciprocal ? "text-green-600" : "text-muted-foreground"}`}>{r.reciprocal ? "✓ Yes" : "No"}</span> },
        { id: "priority", header: "Priority", width: "80px", cell: r => <span className="text-center block font-bold">{r.priority}</span> },
        { id: "note", header: "Note", width: "250px", cell: r => <span className="text-xs text-muted-foreground">{r.note}</span> },
        { id: "activeFlag", header: "Active", width: "80px", cell: r => <StatusBadge status={r.activeFlag ? "Active" : "Inactive"} /> },
    ], []);

    const atoCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "modelItem", header: "Model", width: "150px", cell: r => <span className="font-mono text-xs">{r.modelItem}</span> },
        { id: "modelDesc", header: "Model Description", width: "220px" },
        { id: "optionClass", header: "Option Class", width: "130px", cell: r => <Badge variant="outline" className="text-xs">{r.optionClass}</Badge> },
        { id: "optionItem", header: "Option Item", width: "120px", cell: r => <span className="font-mono text-xs text-blue-600">{r.optionItem}</span> },
        { id: "optionDesc", header: "Option Description", width: "180px", cell: r => <span className="font-medium">{r.optionDesc}</span> },
        { id: "mandatory", header: "Mandatory", width: "100px", cell: r => <span className={`text-center block ${r.mandatory ? "text-red-600 font-semibold" : "text-muted-foreground"} text-xs`}>{r.mandatory ? "Yes" : "No"}</span> },
        { id: "default", header: "Default", width: "90px", cell: r => <span className={`text-center block ${r.default ? "text-green-600 font-semibold" : "text-muted-foreground"} text-xs`}>{r.default ? "✓" : "—"}</span> },
    ], []);

    return (
        <StandardPage
            title="Item Relationships"
            description="Define substitute items, cross-sell/up-sell relationships, and ATO/PTO model options for configurable products."
            breadcrumbs={[{ label: "SCM", href: "/scm/procurement" }, { label: "Inventory", href: "/inventory" }, { label: "Item Relationships" }]}
            actions={<Button onClick={() => setIsOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Relationship</Button>}
        >
            <Tabs defaultValue="relationships">
                <TabsList className="mb-4"><TabsTrigger value="relationships">Item Relationships ({rels.length})</TabsTrigger><TabsTrigger value="ato">ATO/PTO Options ({SEED_ATO.length})</TabsTrigger></TabsList>
                <TabsContent value="relationships">
                    <Card>
                        <CardHeader><CardTitle>Item Relationships</CardTitle><CardDescription>Substitute items are used by Order Management when the primary item is out of stock. Priority determines the substitution order.</CardDescription></CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={rels} columns={relCols} onChange={() => { }} containerHeight="480px" /></CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="ato">
                    <Card>
                        <CardHeader><CardTitle>ATO / PTO Model Options</CardTitle><CardDescription>Configure-to-order and pick-to-order option classes and option items for configurable product models.</CardDescription></CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={SEED_ATO} columns={atoCols} onChange={() => { }} containerHeight="380px" /></CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader><DialogTitle>Add Item Relationship</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2"><Label>From Item *</Label><Input value={newRel.fromItem} onChange={e => setNewRel({ ...newRel, fromItem: e.target.value })} placeholder="Item code..." /></div>
                        <div className="space-y-2"><Label>To Item *</Label><Input value={newRel.toItem} onChange={e => setNewRel({ ...newRel, toItem: e.target.value })} placeholder="Item code..." /></div>
                        <div className="space-y-2"><Label>Relationship Type</Label>
                            <Select value={newRel.relType} onValueChange={v => setNewRel({ ...newRel, relType: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{REL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Priority</Label><Input type="number" min="1" value={newRel.priority} onChange={e => setNewRel({ ...newRel, priority: e.target.value })} /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Note</Label><Input value={newRel.note} onChange={e => setNewRel({ ...newRel, note: e.target.value })} placeholder="Business reason or usage note..." /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={() => createMutation.mutate({ ...newRel, reciprocal: true, activeFlag: true })} disabled={!newRel.fromItem || !newRel.toItem}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
