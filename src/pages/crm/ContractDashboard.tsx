
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Plus, Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useEnterpriseStore } from "@/lib/enterpriseStore";
import { EnterpriseContextSwitcher } from "@/components/enterprise/EnterpriseContextSwitcher";
export default function ContractDashboard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newItem, setNewItem] = useState({ title: "", type: "MSA", totalValue: 0, startDate: "", endDate: "" });
    const { businessUnitId } = useEnterpriseStore();

    const { data: contractsData } = useQuery({
        queryKey: ["/api/crm/contracts", businessUnitId],
        queryFn: () => fetch("/api/crm/contracts", { headers: businessUnitId ? { "x-business-unit-id": businessUnitId } : undefined }).then(r => r.json())
    });
    const contracts = contractsData?.data || [];
    const { data: expiring = [] } = useQuery({
        queryKey: ["/api/crm/contracts/expiring", businessUnitId],
        queryFn: () => fetch("/api/crm/contracts/expiring", { headers: businessUnitId ? { "x-business-unit-id": businessUnitId } : undefined }).then(r => r.json())
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/crm/contracts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(businessUnitId ? { "x-business-unit-id": businessUnitId } : {})
                },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/crm/contracts"] });
            setIsCreateOpen(false);
            toast({ title: "Contract Created" });
        }
    });

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Contract Management</h1>
                    <p className="text-muted-foreground mt-2">Manage MSAs, SOWs, and Renewals.</p>
                </div>
                <div className="flex gap-4 items-center">
                    <EnterpriseContextSwitcher
                        type="business-unit"
                        value={businessUnitId || undefined}
                        onChange={(val) => useEnterpriseStore.getState().setBusinessUnit(val || null)}
                    />
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> New Contract
                    </Button>
                </div>
            </div>

            {/* Expiring Alert */}
            {expiring.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800">
                    <AlertTriangle className="h-5 w-5" />
                    <div>
                        <p className="font-semibold">{expiring.length} Contracts Expiring Soon</p>
                        <p className="text-sm">Review these contracts for renewal.</p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-md border">
                <DataTable
                    data={contracts}
                    columns={[
                        { key: "contractNumber", header: "Contract #", sortable: true, filterable: true },
                        { key: "title", header: "Title", sortable: true, filterable: true },
                        { key: "contractType", header: "Type", sortable: true, filterable: true },
                        {
                            key: "status", header: "Status", sortable: true, filterable: true, render: (val) => (
                                <span className={`px-2 py-1 rounded text-xs font-medium ${val === 'Active' ? 'bg-green-100 text-green-700' : val === 'Expired' ? 'bg-red-100 text-red-700' : 'bg-slate-100'}`}>
                                    {val}
                                </span>
                            )
                        },
                        { key: "totalAmount", header: "Value", sortable: true, render: (val) => `$${Number(val).toLocaleString()}` },
                        { key: "startDate", header: "Start Date", sortable: true, render: (val) => val ? format(new Date(val), "MMM dd, yyyy") : "-" },
                        { key: "endDate", header: "End Date", sortable: true, render: (val) => val ? format(new Date(val), "MMM dd, yyyy") : "-" },
                        {
                            key: "id", header: "Actions", render: (_, row) => (
                                <Link href={`/crm/contracts/${row.id}`}>
                                    <Button variant="ghost" size="sm">View</Button>
                                </Link>
                            )
                        }
                    ]}
                />
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Contract</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select onValueChange={v => setNewItem({ ...newItem, type: v })} defaultValue={newItem.type}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MSA">MSA</SelectItem>
                                        <SelectItem value="SOW">SOW</SelectItem>
                                        <SelectItem value="NDA">NDA</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Total Value</Label>
                                <Input type="number" value={newItem.totalValue} onChange={e => setNewItem({ ...newItem, totalValue: Number(e.target.value) })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input type="date" onChange={e => setNewItem({ ...newItem, startDate: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input type="date" onChange={e => setNewItem({ ...newItem, endDate: e.target.value })} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={() => createMutation.mutate(newItem)}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
