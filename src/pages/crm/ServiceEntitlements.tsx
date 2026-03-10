import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { ShieldAlert, Plus, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/dateUtils";

export default function ServiceEntitlements() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data: entitlements = [], isLoading } = useQuery({
        queryKey: ["/api/crm/service-entitlements"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/crm/service-entitlements");
            return res.json();
        }
    });

    const { data: accountsData } = useQuery({
        queryKey: ["/api/crm/accounts"],
    });
    const accounts = (accountsData as any)?.data || [];

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/crm/service-entitlements", data);
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Entitlement created successfully" });
            setIsDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ["/api/crm/service-entitlements"] });
        }
    });

    const [newEntitlement, setNewEntitlement] = useState({
        accountId: "",
        contractNumber: "",
        startDate: "",
        endDate: "",
        slaLevel: "Bronze",
        coverageDetails: ""
    });

    const columns = [
        {
            id: "contractNumber",
            header: "Contract #",
            width: "150px",
            cell: (row: any) => <span className="font-mono font-medium">{row.contractNumber}</span>
        },
        {
            id: "accountId",
            header: "Account",
            width: "250px",
            cell: (row: any) => {
                const acc = accounts.find((a: any) => a.id === row.accountId);
                return <span className="font-semibold text-primary">{acc ? acc.name : "Unknown Account"}</span>;
            }
        },
        {
            id: "slaLevel",
            header: "SLA Level",
            width: "120px",
            cell: (row: any) => {
                const color = row.slaLevel === 'Gold' ? 'text-amber-500 bg-amber-500/10' :
                    row.slaLevel === 'Silver' ? 'text-slate-400 bg-slate-400/10' :
                        'text-orange-700 bg-orange-700/10';
                return <Badge className={`${color} border-none`}>{row.slaLevel}</Badge>;
            }
        },
        {
            id: "startDate",
            header: "Start Date",
            width: "120px",
            cell: (row: any) => <span>{formatDate(row.startDate)}</span>
        },
        {
            id: "endDate",
            header: "End Date",
            width: "120px",
            cell: (row: any) => <span>{formatDate(row.endDate)}</span>
        },
        {
            id: "status",
            header: "Status",
            width: "120px",
            cell: (row: any) => (
                <Badge variant={row.status === 'active' ? 'default' : 'secondary'} className={row.status === 'active' ? 'bg-green-500' : ''}>
                    {row.status}
                </Badge>
            )
        }
    ];

    return (
        <StandardPage
            title="Service Entitlements"
            description="Manage customer SLAs, warranties, and service level agreements."
            breadcrumbs={[
                { label: 'CRM Dashboard', href: '/crm' },
                { label: 'Service Cloud', href: '/crm/cases' },
                { label: 'Entitlements' }
            ]}
            actions={
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="font-semibold shadcn-button-premium">
                            <Plus className="mr-2 h-4 w-4" />
                            New Entitlement
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Register Service Entitlement</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Account</Label>
                                <Select value={newEntitlement.accountId} onValueChange={v => setNewEntitlement(p => ({ ...p, accountId: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select Account" /></SelectTrigger>
                                    <SelectContent>
                                        {accounts.map((a: any) => (
                                            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Contract Number</Label>
                                <Input
                                    value={newEntitlement.contractNumber}
                                    onChange={e => setNewEntitlement(p => ({ ...p, contractNumber: e.target.value }))}
                                    placeholder="e.g. CTR-9923"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Input type="date" value={newEntitlement.startDate} onChange={e => setNewEntitlement(p => ({ ...p, startDate: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <Input type="date" value={newEntitlement.endDate} onChange={e => setNewEntitlement(p => ({ ...p, endDate: e.target.value }))} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>SLA Level</Label>
                                <Select value={newEntitlement.slaLevel} onValueChange={v => setNewEntitlement(p => ({ ...p, slaLevel: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Bronze">Bronze (48h response)</SelectItem>
                                        <SelectItem value="Silver">Silver (24h response)</SelectItem>
                                        <SelectItem value="Gold">Gold (4h response)</SelectItem>
                                        <SelectItem value="Platinum">Platinum (1h response)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                className="w-full"
                                onClick={() => createMutation.mutate(newEntitlement)}
                                disabled={!newEntitlement.accountId || !newEntitlement.contractNumber || createMutation.isPending}
                            >
                                Register Entitlement
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            }
        >
            <div className="h-[600px] border rounded-lg bg-background overflow-hidden relative">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : entitlements.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-muted-foreground">
                        <ShieldAlert className="h-16 w-16 mb-4 opacity-20" />
                        <p className="text-lg font-medium">No Entitlements Found</p>
                        <p className="text-sm opacity-70">Register a new SLA or warranty to get started.</p>
                    </div>
                ) : (
                    <InteractiveSpreadsheet
                        data={entitlements}
                        columns={columns}
                        onChange={() => { }}
                        virtualized={true}
                        containerHeight="600px"
                    />
                )}
            </div>
        </StandardPage>
    );
}
