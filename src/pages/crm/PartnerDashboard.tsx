import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { StandardPage } from "@/components/layout/StandardPage";
import { formatNumber } from '@/lib/formatters';

export default function PartnerDashboard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [newItem, setNewItem] = useState({ dealName: "", customerName: "", amount: "", notes: "" });

    const { data: partner } = useQuery({
        queryKey: ["crm-partner-session"],
        queryFn: async () => {
            const res = await fetch("/api/crm/partner/ensure", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "Acme Resellers", email: "sales@acmeresellers.com" })
            });
            if (!res.ok) throw new Error("Failed");
            return res.json();
        }
    });

    const { data: deals = [] } = useQuery<any>({
        queryKey: ["/api/crm/partner/deals", partner?.id],
        queryFn: () => fetch(`/api/crm/partner/deals?partnerId=${partner.id}`).then(r => r.json()),
        enabled: !!partner
    });

    const registerMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/crm/partner/register", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, partnerId: partner.id }),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/crm/partner/deals"] });
            setIsRegisterOpen(false);
            setNewItem({ dealName: "", customerName: "", amount: "", notes: "" })
            toast({ title: "Deal Registered", description: "Your deal is pending approval." });
        }
    });

    if (!partner) return <div className="p-8">Loading Partner Profile...</div>;

    const dealColumns: SpreadsheetColumn<any>[] = [
        { id: "dealName", header: "Deal Name", width: "200px", cell: (row) => <span className="font-semibold">{row.dealName}</span> },
        { id: "customerName", header: "Customer", width: "150px", cell: (row) => <span className="text-muted-foreground">{row.customerName}</span> },
        { id: "stage", header: "Stage", width: "120px", cell: (row) => <span className="text-muted-foreground">{row.stage}</span> },
        { id: "amount", header: "Amount", width: "120px", cell: (row) => <span className="font-medium">${formatNumber(Number(row.amount))}</span> },
        {
            id: "status", header: "Status", width: "120px", cell: (row) => (
                <span className={cn(`text-xs px-2 py-1 rounded-full ${row.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    row.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                    }`)}>
                    {row.status}
                </span>
            )
        }
    ];

    return (
        <StandardPage
            title="Partner Portal"
            description={`Welcome back, ${partner.name}. Manage your deal registrations.`}
            actions={
                <Button onClick={() => setIsRegisterOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Register Deal
                </Button>
            }
        >

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pipeline</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${deals.reduce((acc: number, d: any) => acc + Number(d.amount || 0), 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved Deals</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {deals.filter((d: any) => d.status === 'Approved').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {deals.filter((d: any) => d.status === 'Pending').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Registered Deals</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px]">
                        {deals.length === 0 ? (
                            <div className="text-muted-foreground h-full flex items-center justify-center">No deals registered yet.</div>
                        ) : (
                            <InteractiveSpreadsheet
                                columns={dealColumns}
                                data={deals}
                                onChange={() => { }}
                                containerHeight="100%"
                            />
                        )}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Register New Deal</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Dead Name</Label>
                            <Input value={newItem.dealName} onChange={e => setNewItem({ ...newItem, dealName: e.target.value })} placeholder="e.g. Acme Network Upgrade" />
                        </div>
                        <div className="space-y-2">
                            <Label>Customer Name</Label>
                            <Input value={newItem.customerName} onChange={e => setNewItem({ ...newItem, customerName: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Est. Amount</Label>
                            <Input type="number" value={newItem.amount} onChange={e => setNewItem({ ...newItem, amount: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea value={newItem.notes} onChange={e => setNewItem({ ...newItem, notes: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRegisterOpen(false)}>Cancel</Button>
                        <Button onClick={() => registerMutation.mutate(newItem)}>Submit Registration</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
