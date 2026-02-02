import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";

interface Variation {
    id: string;
    variationNumber: string;
    title: string;
    description: string;
    type: string;
    status: string;
    amount: string;
    scheduleImpactDays: number;
    createdAt: string;
}

interface VariationManagerProps {
    contractId: string;
}

export default function VariationManager({ contractId }: VariationManagerProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { data: variations = [], isLoading } = useQuery<Variation[]>({
        queryKey: ["construction-variations", contractId],
        queryFn: async () => {
            const res = await fetch(`/api/construction/contracts/${contractId}/variations`);
            if (!res.ok) throw new Error("Failed to fetch variations");
            return res.json();
        }
    });

    const createVariationMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch(`/api/construction/contracts/${contractId}/variations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to create variation");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["construction-variations", contractId] });
            setIsCreateOpen(false);
            toast({ title: "Variation Drafted", description: "New PCO created successfully." });
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const res = await fetch(`/api/construction/variations/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });
            if (!res.ok) throw new Error("Failed to update status");
            return res.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["construction-variations", contractId] });
            queryClient.invalidateQueries({ queryKey: ["construction-contract-detail"] }); // Refresh contract revised amount
            queryClient.invalidateQueries({ queryKey: ["construction-contracts"] }); // Refresh list
            toast({
                title: variables.status === "APPROVED" ? "Variation Approved" : "Status Updated",
                description: variables.status === "APPROVED" ? "Contract amount has been revised." : "Variation status changed."
            });
        }
    });

    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        createVariationMutation.mutate({
            variationNumber: formData.get("variationNumber"),
            title: formData.get("title"),
            description: formData.get("description"),
            amount: formData.get("amount"),
            scheduleImpactDays: parseInt(formData.get("scheduleImpactDays") as string) || 0,
            type: "PCO"
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "APPROVED": return <Badge className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
            case "REJECTED": return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
            case "PENDING": return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
            default: return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" /> Draft</Badge>;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Change Management (PCOs & COs)</h3>
                <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <SheetTrigger asChild>
                        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Create PCO</Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="sm:max-w-md">
                        <SheetHeader>
                            <SheetTitle>Create Potential Change Order (PCO)</SheetTitle>
                            <SheetDescription>Draft a new potential change to the contract scope or amount.</SheetDescription>
                        </SheetHeader>
                        <form onSubmit={handleCreate} className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>PCO Number</Label>
                                    <Input name="variationNumber" placeholder="PCO-001" required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Amount Impact ($)</Label>
                                    <Input name="amount" type="number" step="0.01" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input name="title" placeholder="e.g. Additional Rebar for Foundation" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea name="description" placeholder="Justification for the change..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Schedule Impact (Days)</Label>
                                <Input name="scheduleImpactDays" type="number" defaultValue="0" />
                            </div>
                            <SheetFooter className="pt-4">
                                <Button type="submit" disabled={createVariationMutation.isPending} className="w-full">Create Draft</Button>
                            </SheetFooter>
                        </form>
                    </SheetContent>
                </Sheet>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ref #</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-center">Days</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center p-4">Loading...</TableCell>
                            </TableRow>
                        ) : variations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center p-8 text-muted-foreground">
                                    No variations recorded.
                                </TableCell>
                            </TableRow>
                        ) : (
                            variations.map((v) => (
                                <TableRow key={v.id}>
                                    <TableCell className="font-medium">{v.variationNumber}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{v.title}</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">{v.description}</div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">
                                        ${Number(v.amount).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-center">{v.scheduleImpactDays}d</TableCell>
                                    <TableCell>{getStatusBadge(v.status)}</TableCell>
                                    <TableCell className="text-right">
                                        {v.status === "DRAFT" || v.status === "PENDING" ? (
                                            <Button
                                                size="sm"
                                                variant="default"
                                                className="bg-green-600 hover:bg-green-700 h-7 px-2"
                                                onClick={() => updateStatusMutation.mutate({ id: v.id, status: "APPROVED" })}
                                                disabled={updateStatusMutation.isPending}
                                            >
                                                Approve
                                            </Button>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">Locked</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
