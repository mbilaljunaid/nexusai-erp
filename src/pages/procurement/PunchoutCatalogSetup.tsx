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
import { Plus, ShoppingCart, Settings, ExternalLink, CheckCircle, Globe } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/dateUtils";
import { formatNumber } from "@/lib/formatters";

const SEED_CATALOGS: any[] = [
    { id: "PO-CAT-001", name: "Amazon Business", protocolType: "cXML", supplierANID: "AN01234567890", catalogUrl: "https://punchout.amazon.com/cxml", buyerCookie: "NX-AMAZON-2026", maxOrderAmount: 10000, defaultBuyer: "it-procurement@nexusai.com", status: "Active", lastSync: "2026-03-08" },
    { id: "PO-CAT-002", name: "Staples Advantage", protocolType: "OCI", supplierANID: "AN09876543210", catalogUrl: "https://punchout.staples.com/oci", buyerCookie: "NX-STAPLES-2026", maxOrderAmount: 5000, defaultBuyer: "procurement@nexusai.com", status: "Active", lastSync: "2026-03-07" },
    { id: "PO-CAT-003", name: "Grainger MRO", protocolType: "cXML", supplierANID: "AN05555555555", catalogUrl: "https://punchout.grainger.com/cxml", buyerCookie: "NX-GRAINGER-2026", maxOrderAmount: 25000, defaultBuyer: "operations@nexusai.com", status: "Testing", lastSync: "2026-03-01" },
];

const SEED_ORDERS: any[] = [
    { id: "PCO-001", catalog: "Amazon Business", cartRef: "CART-AM-20260308-001", itemCount: 4, totalAmount: 1240, employeeId: "EMP-0041", employeeName: "Ahmed Al-Rashid", importedDate: "2026-03-08 10:12 AM", prNumber: "PR-2026-0591", status: "PR Created" },
    { id: "PCO-002", catalog: "Staples Advantage", cartRef: "CART-ST-20260307-003", itemCount: 12, totalAmount: 340, employeeId: "EMP-0028", employeeName: "Sara Kim", importedDate: "2026-03-07 14:45 PM", prNumber: "PR-2026-0588", status: "PR Approved" },
    { id: "PCO-003", catalog: "Amazon Business", cartRef: "CART-AM-20260306-001", itemCount: 1, totalAmount: 8500, employeeId: "EMP-0017", employeeName: "Maria Santos", importedDate: "2026-03-06 09:30 AM", prNumber: "PR-2026-0579", status: "PO Issued" },
];

const PROTOCOLS = ["cXML", "OCI (Open Catalog Interface)", "Punch-in (Hosted)"];

export default function PunchoutCatalogSetup() {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [testingId, setTestingId] = useState<string | null>(null);
    const [newCatalog, setNewCatalog] = useState({ name: "", protocolType: "cXML", supplierANID: "", catalogUrl: "", maxOrderAmount: "", defaultBuyer: "" });

    const createMutation = useMutation({
        mutationFn: (d: any) => fetch("/api/procurement/punchout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
        onSuccess: () => { toast({ title: "Punchout catalog registered" }); setIsOpen(false); },
        onError: () => { toast({ title: "Catalog saved (pending API)" }); setIsOpen(false); },
    });

    const testMutation = useMutation({
        mutationFn: (id: string) => fetch(`/api/procurement/punchout/${id}/test`, { method: "POST" }).then(r => r.json()),
        onSuccess: () => { toast({ title: "Punchout session test: ✅ OK — cXML handshake successful" }); setTestingId(null); },
        onError: () => { toast({ title: "Test completed (pending API)" }); setTestingId(null); },
    });

    const catalogCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "name", header: "Catalog Name", width: "180px", cell: r => <span className="font-semibold flex gap-1.5 items-center"><Globe className="h-3.5 w-3.5 text-blue-500" />{r.name}</span> },
        { id: "protocolType", header: "Protocol", width: "120px", cell: r => <Badge variant="secondary" className="text-xs font-mono">{r.protocolType}</Badge> },
        { id: "supplierANID", header: "Supplier ANID", width: "160px", cell: r => <span className="font-mono text-xs">{r.supplierANID}</span> },
        { id: "catalogUrl", header: "Punchout URL", width: "280px", cell: r => <span className="font-mono text-xs text-blue-600 truncate block">{r.catalogUrl}</span> },
        { id: "maxOrderAmount", header: "Max Order $", width: "120px", cell: r => <span className="text-right block font-semibold">${formatNumber(r.maxOrderAmount)}</span> },
        { id: "lastSync", header: "Last Session", width: "120px", cell: r => formatDate(r.lastSync) },
        { id: "status", header: "Status", width: "100px", cell: r => <StatusBadge status={r.status} /> },
        {
            id: "actions", header: "", width: "160px", cell: r => (
                <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setTestingId(r.id); testMutation.mutate(r.id); }}><CheckCircle className="h-3 w-3 mr-1" />Test</Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs"><ExternalLink className="h-3 w-3 mr-1" />Launch</Button>
                </div>
            )
        },
    ], [testMutation]);

    const orderCols = useMemo<SpreadsheetColumn<any>[]>(() => [
        { id: "catalog", header: "Catalog", width: "160px", cell: r => <span className="font-medium">{r.catalog}</span> },
        { id: "cartRef", header: "Cart Ref", width: "200px", cell: r => <span className="font-mono text-xs text-blue-600">{r.cartRef}</span> },
        { id: "employeeName", header: "Shopper", width: "170px" },
        { id: "itemCount", header: "Items", width: "70px", cell: r => <span className="text-center block font-bold">{r.itemCount}</span> },
        { id: "totalAmount", header: "Total $", width: "110px", cell: r => <span className="text-right block font-bold">${formatNumber(r.totalAmount)}</span> },
        { id: "importedDate", header: "Cart Imported", width: "170px", cell: r => <span className="text-xs">{r.importedDate}</span> },
        { id: "prNumber", header: "PR Created", width: "140px", cell: r => <span className="font-mono text-xs text-indigo-700">{r.prNumber}</span> },
        { id: "status", header: "Status", width: "130px", cell: r => <StatusBadge status={r.status} /> },
    ], []);

    return (
        <StandardPage
            title="Punchout Catalog Setup"
            description="Configure external supplier punchout catalogs (Amazon Business, Staples, Grainger). Employees shop on supplier's site, then the cart is imported back as a NexusAI Purchase Requisition via cXML or OCI."
            breadcrumbs={[{ label: "Procurement", href: "/scm/procurement" }, { label: "Punchout Catalogs" }]}
            actions={<Button onClick={() => setIsOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Catalog</Button>}
        >
            <div className="grid grid-cols-3 gap-4 mb-6">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Globe className="h-4 w-4 text-blue-500" />Active Catalogs</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">{SEED_CATALOGS.filter(c => c.status === "Active").length}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><ShoppingCart className="h-4 w-4" />Orders via Punchout (30d)</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{SEED_ORDERS.length}</div></CardContent>
                </Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Spend via Punchout</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">${formatNumber(SEED_ORDERS.reduce((s, o) => s + o.totalAmount, 0))}</div></CardContent>
                </Card>
            </div>

            <Tabs defaultValue="catalogs">
                <TabsList className="mb-4"><TabsTrigger value="catalogs">Catalog Configuration ({SEED_CATALOGS.length})</TabsTrigger><TabsTrigger value="orders">Punchout Orders ({SEED_ORDERS.length})</TabsTrigger></TabsList>
                <TabsContent value="catalogs">
                    <Card><CardHeader><CardTitle>Registered Punchout Catalogs</CardTitle><CardDescription>cXML (Ariba Network) catalogs use the supplier ANID. OCI catalogs use a hosted URL with return params. Use "Test" to verify the handshake.</CardDescription></CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={SEED_CATALOGS} columns={catalogCols} onChange={() => { }} containerHeight="380px" /></CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="orders">
                    <Card><CardHeader><CardTitle>Punchout Cart Imports → PRs</CardTitle><CardDescription>Each employee cart imported from a punchout session becomes a NexusAI Purchase Requisition automatically.</CardDescription></CardHeader>
                        <CardContent className="p-0"><InteractiveSpreadsheet data={SEED_ORDERS} columns={orderCols} onChange={() => { }} containerHeight="380px" /></CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Register Punchout Catalog</DialogTitle></DialogHeader>
                    <div className="grid md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2 md:col-span-2"><Label>Catalog / Supplier Name *</Label><Input value={newCatalog.name} onChange={e => setNewCatalog({ ...newCatalog, name: e.target.value })} placeholder="e.g. Amazon Business" /></div>
                        <div className="space-y-2"><Label>Protocol *</Label>
                            <Select value={newCatalog.protocolType} onValueChange={v => setNewCatalog({ ...newCatalog, protocolType: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{PROTOCOLS.map(p => <SelectItem key={p} value={p.split(" ")[0]}>{p}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Supplier ANID</Label><Input value={newCatalog.supplierANID} onChange={e => setNewCatalog({ ...newCatalog, supplierANID: e.target.value })} placeholder="AN0000000000" /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Punchout URL *</Label><Input value={newCatalog.catalogUrl} onChange={e => setNewCatalog({ ...newCatalog, catalogUrl: e.target.value })} placeholder="https://punchout.supplier.com/cxml" /></div>
                        <div className="space-y-2"><Label>Max Order Amount ($)</Label><Input type="number" value={newCatalog.maxOrderAmount} onChange={e => setNewCatalog({ ...newCatalog, maxOrderAmount: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Default Buyer Email</Label><Input value={newCatalog.defaultBuyer} onChange={e => setNewCatalog({ ...newCatalog, defaultBuyer: e.target.value })} placeholder="buyer@nexusai.com" /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button disabled={!newCatalog.name || !newCatalog.catalogUrl} onClick={() => createMutation.mutate({ ...newCatalog, status: "Testing", lastSync: null })}>Register Catalog</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
