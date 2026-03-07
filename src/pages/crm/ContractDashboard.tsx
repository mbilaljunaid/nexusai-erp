import { cn } from "@/lib/utils";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Plus, Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useEnterpriseStore } from "@/lib/enterpriseStore";
import { EnterpriseContextSwitcher } from "@/components/enterprise/EnterpriseContextSwitcher";
import { StandardPage } from "@/components/layout/StandardPage";
import { DatePicker } from '@/components/ui/DatePicker';
import { formatNumber } from '@/lib/formatters';
export default function ContractDashboard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newItem, setNewItem] = useState({ title: "", type: "MSA", totalValue: 0, startDate: "", endDate: "" });
    const { businessUnitId } = useEnterpriseStore();

    const { data: contractsData } = useQuery<any>({
        queryKey: ["/api/crm/contracts", businessUnitId],
        queryFn: () => fetch("/api/crm/contracts", { headers: businessUnitId ? { "x-business-unit-id": businessUnitId } : undefined }).then(r => r.json())
    });
    const contracts = contractsData?.data || [];
    const { data: expiring = [] } = useQuery<any>({
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

    const contractColumns: SpreadsheetColumn<any>[] = [
        { id: "contractNumber", header: "Contract #", width: "150px", cell: (row) => <span>{row.contractNumber}</span> },
        { id: "title", header: "Title", width: "250px", cell: (row) => <span>{row.title}</span> },
        { id: "contractType", header: "Type", width: "120px", cell: (row) => <span>{row.contractType}</span> },
        {
            id: "status", header: "Status", width: "120px", cell: (row) => {
                const val = row.status;
                return (
                    <span className={cn(`px-2 py-1 rounded text-xs font-medium ${val === 'Active' ? 'bg-green-100 text-green-700' : val === 'Expired' ? 'bg-red-100 text-red-700' : 'bg-slate-100'}`)}>
                        {val}
                    </span>
                );
            }
        },
        { id: "totalAmount", header: "Value", width: "120px", cell: (row) => <span>${formatNumber(Number(row.totalAmount))}</span> },
        { id: "startDate", header: "Start Date", width: "120px", cell: (row) => <span>{row.startDate ? format(new Date(row.startDate), "MMM dd, yyyy") : "-"}</span> },
        { id: "endDate", header: "End Date", width: "120px", cell: (row) => <span>{row.endDate ? format(new Date(row.endDate), "MMM dd, yyyy") : "-"}</span> },
        {
            id: "id", header: "Actions", width: "100px", cell: (row) => (
                <Link href={`/crm/contracts/${row.id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                </Link>
            )
        }
    ];

    return (
        <StandardPage
            title="Contract Management"
            description="Manage MSAs, SOWs, and Renewals."
            actions={
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
            }
        >

            {/* Expiring Alert */}
            {expiring.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800">
                    <AlertTriangle className="h-5 w-5" />
                    <div>
                        <p className="font-semibold">{expiring.length} Contracts Expiring Soon</p>
                        <p className="text-sm">Review these contracts for renewal.</p>
                    </div>
                </div>
            )}

            <Card className="h-[500px] overflow-hidden shadow-sm">
                <InteractiveSpreadsheet
                    columns={contractColumns}
                    data={contracts}
                    onChange={() => { }}
                    containerHeight="100%"
                />
            </Card>

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
                                <DatePicker onChange={v => setNewItem({ ...newItem, startDate: v })} />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <DatePicker onChange={v => setNewItem({ ...newItem, endDate: v })} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={() => createMutation.mutate(newItem)}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
