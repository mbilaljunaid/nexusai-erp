import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle2, Gavel, Plus, FileText, Ban } from "lucide-react";
import { format } from "date-fns";
import { StandardTable, Column } from "../tables/StandardTable";
import { ConstructionClaim } from "@shared/schema";

interface Props {
    contractId: string;
}

export default function ConstructionClaimsManager({ contractId }: Props) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [settlingClaim, setSettlingClaim] = useState<ConstructionClaim | null>(null);

    const { data: claims = [], isLoading } = useQuery<ConstructionClaim[]>({
        queryKey: ["construction-claims", contractId],
        queryFn: async () => {
            const res = await fetch(`/api/construction/contracts/${contractId}/claims`);
            if (!res.ok) throw new Error("Failed to fetch claims");
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch(`/api/construction/contracts/${contractId}/claims`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["construction-claims", contractId] });
            setIsAddOpen(false);
            toast({ title: "Claim Submitted", description: "Dispute has been logged for review." });
        }
    });

    const settleMutation = useMutation({
        mutationFn: async ({ id, amount }: { id: string, amount: string }) => {
            const res = await fetch(`/api/construction/claims/${id}/settle`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amountApproved: amount })
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["construction-claims", contractId] });
            setSettlingClaim(null);
            toast({ title: "Claim Settled", description: "The claim has been finalized and recorded." });
        }
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        createMutation.mutate({
            claimNumber: formData.get("claimNumber"),
            subject: formData.get("subject"),
            type: formData.get("type"),
            amountClaimed: formData.get("amountClaimed"),
            description: formData.get("description"),
            status: "SUBMITTED"
        });
    };

    const handleSettle = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        if (settlingClaim) {
            settleMutation.mutate({
                id: settlingClaim.id,
                amount: formData.get("amountApproved") as string
            });
        }
    };

    const columns: Column<ConstructionClaim>[] = [
        { header: "Claim #", accessorKey: "claimNumber", sortable: true },
        { header: "Subject", accessorKey: "subject" },
        {
            header: "Type",
            accessorKey: "type",
            cell: (item) => <Badge variant="outline">{item.type}</Badge>
        },
        {
            header: "Claimed",
            accessorKey: "amountClaimed",
            cell: (item) => `$${Number(item.amountClaimed).toLocaleString()}`,
            sortable: true
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (item) => (
                <Badge variant={
                    item.status === "SETTLED" ? "default" :
                        item.status === "REJECTED" ? "destructive" :
                            "secondary"
                }>
                    {item.status}
                </Badge>
            )
        },
        {
            header: "Submitted",
            accessorKey: "createdAt",
            cell: (item) => format(new Date(item.createdAt), "PP")
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold tracking-tight">Claims & Dispute Management</h3>
                    <p className="text-sm text-muted-foreground">Log and settle contractual disputes, variations, and extension-of-time (EOT) claims.</p>
                </div>

                <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <SheetTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Log New Claim
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="sm:max-w-md">
                        <SheetHeader>
                            <SheetTitle>Submit Contractual Claim</SheetTitle>
                            <SheetDescription>Log a new contractual dispute or extension-of-time request.</SheetDescription>
                        </SheetHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="claimNumber">Claim Number</Label>
                                    <Input id="claimNumber" name="claimNumber" placeholder="e.g. CLM-001" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="type">Claim Type</Label>
                                    <Select name="type" defaultValue="CONTRACTUAL">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CONTRACTUAL">Contractual</SelectItem>
                                            <SelectItem value="EOT">Extension of Time</SelectItem>
                                            <SelectItem value="DISRUPTIVE">Disruption</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input id="subject" name="subject" placeholder="e.g. Unforeseen Ground Conditions" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="amountClaimed">Amount Claimed ($)</Label>
                                <Input id="amountClaimed" name="amountClaimed" type="number" step="0.01" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Detailed Description & Impact</Label>
                                <Textarea id="description" name="description" rows={4} />
                            </div>
                            <SheetFooter className="pt-4">
                                <Button type="submit" disabled={createMutation.isPending} className="w-full">
                                    Submit Claim
                                </Button>
                            </SheetFooter>
                        </form>
                    </SheetContent>
                </Sheet>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Gavel className="h-5 w-5 text-primary" />
                        <CardTitle>Claims Register</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <StandardTable
                        data={claims}
                        columns={columns}
                        isLoading={isLoading}
                        actions={(item: ConstructionClaim) => (
                            <div className="flex items-center gap-1">
                                {item.status !== "SETTLED" && (
                                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-green-600" onClick={() => setSettlingClaim(item)}>
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Settle
                                    </Button>
                                )}
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <FileText className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        )}
                    />
                </CardContent>
            </Card>

            <Sheet open={!!settlingClaim} onOpenChange={(open) => !open && setSettlingClaim(null)}>
                <SheetContent side="right" className="sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Settle Claim: {settlingClaim?.claimNumber}</SheetTitle>
                        <SheetDescription>Enter the final approved amount to settle this dispute.</SheetDescription>
                    </SheetHeader>
                    {settlingClaim && (
                        <form onSubmit={handleSettle} className="space-y-4 pt-4">
                            <div className="p-4 bg-muted rounded-md space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Claimed Amount:</span>
                                    <span className="font-mono font-bold">${Number(settlingClaim.amountClaimed).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Claim Type:</span>
                                    <span>{settlingClaim.type}</span>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="amountApproved">Approved Amount ($)</Label>
                                <Input id="amountApproved" name="amountApproved" type="number" step="0.01" defaultValue={settlingClaim.amountClaimed || ""} required />
                            </div>
                            <SheetFooter className="pt-4 flex flex-col gap-2">
                                <Button type="submit" disabled={settleMutation.isPending} className="w-full">Confirm Settlement</Button>
                                <Button type="button" variant="outline" onClick={() => setSettlingClaim(null)} className="w-full">Cancel</Button>
                            </SheetFooter>
                        </form>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
