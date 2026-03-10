import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/formatters";
import { Plus, Users2, Building2, ChevronRight, Search, Globe } from "lucide-react";

// Oracle AR: Customer Relationship Hierarchy — parent/subsidiary/affiliate mapping

interface CustomerNode {
    id: string; customerId: string; customerName: string; relationshipType: "Parent" | "Subsidiary" | "Affiliate" | "Guarantor"; parentId: string | null; creditLimit: number; outstandingBalance: number; currency: string; country: string; status: "Active" | "Inactive";
}

const MOCK_TREE: CustomerNode[] = [
    { id: "1", customerId: "CUST-001", customerName: "Acme Global Group Ltd", relationshipType: "Parent", parentId: null, creditLimit: 5000000, outstandingBalance: 1842750, currency: "USD", country: "US", status: "Active" },
    { id: "2", customerId: "CUST-001-A", customerName: "Acme Corporation (US)", relationshipType: "Subsidiary", parentId: "1", creditLimit: 2000000, outstandingBalance: 842000, currency: "USD", country: "US", status: "Active" },
    { id: "3", customerId: "CUST-001-B", customerName: "Acme UK Limited", relationshipType: "Subsidiary", parentId: "1", creditLimit: 1500000, outstandingBalance: 650000, currency: "GBP", country: "GB", status: "Active" },
    { id: "4", customerId: "CUST-001-C", customerName: "Acme GCC (UAE Branch)", relationshipType: "Affiliate", parentId: "1", creditLimit: 800000, outstandingBalance: 350750, currency: "AED", country: "AE", status: "Active" },
    { id: "5", customerId: "CUST-002", customerName: "Global Tech Holdings", relationshipType: "Parent", parentId: null, creditLimit: 3000000, outstandingBalance: 987300, currency: "USD", country: "US", status: "Active" },
    { id: "6", customerId: "CUST-002-A", customerName: "Global Tech Ltd (UK)", relationshipType: "Subsidiary", parentId: "5", creditLimit: 1200000, outstandingBalance: 421800, currency: "GBP", country: "GB", status: "Active" },
];

const REL_TYPES = ["Parent", "Subsidiary", "Affiliate", "Guarantor"];

export function ArCustomerHierarchy() {
    const { toast } = useToast();
    const [nodes, setNodes] = useState<CustomerNode[]>(MOCK_TREE);
    const [showAdd, setShowAdd] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [form, setForm] = useState<Partial<CustomerNode>>({ relationshipType: "Subsidiary", currency: "USD", status: "Active" });

    const roots = nodes.filter(n => !n.parentId);
    const getChildren = (id: string) => nodes.filter(n => n.parentId === id);

    const filteredRoots = searchTerm
        ? nodes.filter(n => n.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || n.customerId.toLowerCase().includes(searchTerm.toLowerCase()))
        : roots;

    const handleAdd = () => {
        if (!form.customerId || !form.customerName) { toast({ title: "Customer ID and name required", variant: "destructive" }); return; }
        setNodes(prev => [...prev, { id: Date.now().toString(), ...form, parentId: form.parentId || null } as CustomerNode]);
        setShowAdd(false);
        setForm({ relationshipType: "Subsidiary", currency: "USD", status: "Active" });
        toast({ title: "Customer relationship added", className: "bg-green-900 border-green-700 text-white" });
    };

    const relColor = (type: string) => ({
        Parent: "bg-primary/20 text-primary",
        Subsidiary: "bg-blue-500/20 text-blue-400",
        Affiliate: "bg-purple-500/20 text-purple-400",
        Guarantor: "bg-amber-500/20 text-amber-400",
    }[type] || "bg-muted");

    const NodeRow = ({ node, depth = 0 }: { node: CustomerNode; depth?: number }) => {
        const children = getChildren(node.id);
        return (
            <>
                <tr className="hover:bg-muted/10">
                    <td className={`p-3 ${depth === 0 ? "pl-3" : depth === 1 ? "pl-10" : "pl-20"}`}>
                        <div className="flex items-center gap-2">
                            {depth > 0 && <div className="h-px w-4 bg-border shrink-0" />}
                            {depth > 0 ? <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : <Globe className="h-3.5 w-3.5 text-primary shrink-0" />}
                            <div>
                                <p className="font-medium text-sm">{node.customerName}</p>
                                <p className="text-xs font-mono text-muted-foreground">{node.customerId}</p>
                            </div>
                        </div>
                    </td>
                    <td className="p-3">
                        <Badge className={`text-xs ${relColor(node.relationshipType)}`}>{node.relationshipType}</Badge>
                    </td>
                    <td className="p-3 font-mono text-xs">{node.country}</td>
                    <td className="p-3 text-right text-xs">{formatNumber(node.creditLimit)} {node.currency}</td>
                    <td className="p-3 text-right text-xs font-medium">{formatNumber(node.outstandingBalance)} {node.currency}</td>
                    <td className="p-3 text-right text-xs">
                        {((node.outstandingBalance / node.creditLimit) * 100).toFixed(1)}%
                    </td>
                    <td className="p-3">
                        <Badge className={node.status === "Active" ? "bg-green-500/20 text-green-400 text-xs" : "bg-muted text-muted-foreground text-xs"}>{node.status}</Badge>
                    </td>
                </tr>
                {children.map(child => <NodeRow key={child.id} node={child} depth={depth + 1} />)}
            </>
        );
    };

    const totalGroupCredit = filteredRoots.reduce((s, r) => {
        const children = getChildren(r.id);
        return s + r.creditLimit + children.reduce((cs, c) => cs + c.creditLimit, 0);
    }, 0);

    return (
        <StandardPage
            title="Customer Relationship Hierarchy"
            description="Define parent–subsidiary–affiliate relationships for consolidated credit management"
            actions={<Button size="sm" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-2" />Add Relationship</Button>}
        >
            <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                    { label: "Parent Accounts", value: roots.length.toString(), color: "text-primary" },
                    { label: "Total Hierarchy Members", value: nodes.length.toString(), color: "text-blue-400" },
                    { label: "Total Outstanding Balance", value: formatNumber(nodes.reduce((s, n) => s + n.outstandingBalance, 0)), color: "text-amber-400" },
                ].map(m => (
                    <Card key={m.label}><CardContent className="pt-4 pb-4">
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                        <p className={`text-xl font-bold ${m.color} mt-1`}>{m.value}</p>
                    </CardContent></Card>
                ))}
            </div>

            <div className="mb-3">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-10 h-9 text-sm" placeholder="Search customer by name or ID..."
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <table className="w-full text-sm">
                        <thead className="border-b border-border bg-muted/20 text-xs text-muted-foreground">
                            <tr>
                                <th className="p-3 text-left">Customer</th>
                                <th className="p-3 text-left">Relationship</th>
                                <th className="p-3 text-left">Country</th>
                                <th className="p-3 text-right">Credit Limit</th>
                                <th className="p-3 text-right">Outstanding</th>
                                <th className="p-3 text-right">Utilisation</th>
                                <th className="p-3 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredRoots.map(root => <NodeRow key={root.id} node={root} depth={0} />)}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            <Dialog open={showAdd} onOpenChange={setShowAdd}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Add Customer Relationship</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs">Customer ID *</Label>
                            <Input className="mt-1 h-8 text-xs font-mono" placeholder="CUST-001-D"
                                onChange={e => setForm(p => ({ ...p, customerId: e.target.value }))} />
                        </div>
                        <div>
                            <Label className="text-xs">Customer Name *</Label>
                            <Input className="mt-1 h-8 text-xs" onChange={e => setForm(p => ({ ...p, customerName: e.target.value }))} />
                        </div>
                        <div>
                            <Label className="text-xs">Relationship Type</Label>
                            <Select value={form.relationshipType} onValueChange={v => setForm(p => ({ ...p, relationshipType: v as CustomerNode["relationshipType"] }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>{REL_TYPES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs">Parent Account</Label>
                            <Select value={form.parentId || "none"} onValueChange={v => setForm(p => ({ ...p, parentId: v === "none" ? null : v }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue placeholder="None (Root)" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None (Root / Parent)</SelectItem>
                                    {nodes.filter(n => !n.parentId).map(n => <SelectItem key={n.id} value={n.id}>{n.customerName}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs">Credit Limit</Label>
                            <Input type="number" className="mt-1 h-8 text-xs" onChange={e => setForm(p => ({ ...p, creditLimit: parseFloat(e.target.value) }))} />
                        </div>
                        <div>
                            <Label className="text-xs">Currency</Label>
                            <Select value={form.currency} onValueChange={v => setForm(p => ({ ...p, currency: v }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>{["USD", "GBP", "EUR", "AED", "SAR"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                        <Button onClick={handleAdd}>Add Relationship</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}

export default ArCustomerHierarchy;
