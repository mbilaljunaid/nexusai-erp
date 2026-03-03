import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from '@/components/layout/StandardPage';

export function APHoldRules() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [form, setForm] = useState({
        name: "",
        description: "",
        holdType: "Variance",
        active: "true"
    });

    const { data: holdRules, isLoading } = useQuery({
        queryKey: ["/api/ap/hold-rules"],
        queryFn: async () => {
            try {
                const r = await fetch("/api/ap/hold-rules");
                if (r.ok) return await r.json();
            } catch (e) {
                // Ignore
            }
            return [
                { id: "1", name: "Max Amount Exceeded", description: "Hold applied when amount variance > Max allowable dollars", holdType: "Variance", active: true },
                { id: "2", name: "Qty Received Exceeded", description: "Invoice quantity > receipt quantity", holdType: "Matching", active: true },
                { id: "3", name: "Tax Variance", description: "Calculated tax differs from PO tax", holdType: "Tax", active: true }
            ];
        }
    });

    const createMutation = useMutation({
        mutationFn: (data: any) =>
            fetch("/api/ap/hold-rules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ap/hold-rules"] });
            setIsDialogOpen(false);
            toast({ title: "Hold rule created" });
        },
        onError: () => {
            setIsDialogOpen(false);
            toast({ title: "Hold rule added (Mock)" });
            queryClient.setQueryData(["/api/ap/hold-rules"], (old: any) => [
                ...(old || []),
                { id: Math.random().toString(), ...form, active: form.active === "true" }
            ]);
        }
    });

    const columns: Column<any>[] = [
        { header: "Name", accessorKey: "name", className: "font-medium" },
        { header: "Description", accessorKey: "description" },
        { header: "Type", accessorKey: "holdType" },
        {
            header: "Status",
            accessorKey: "active",
            cell: (row) => <Badge variant={row.active ? "default" : "secondary"}>{row.active ? "Active" : "Inactive"}</Badge>
        },
        {
            id: "actions",
            header: "Actions",
            cell: () => (
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500">
                    <Trash2 className="h-4 w-4" />
                </Button>
            )
        }
    ];

    return (
        <StandardPage
            title="Invoice Hold Rules"
            description="Configure rules that map anomalies and variances to system holds"
            actions={
                <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Rule
                </Button>
            }
        >
            <Card>
                <CardContent className="pt-6">
                    <StandardTable
                        data={holdRules || []}
                        columns={columns}
                        isLoading={isLoading}
                        filterColumn="name"
                    />
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Hold Rule</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Rule Name</Label>
                            <Input
                                id="name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g., Price Variance Hold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Triggers when unit price variance exceeds 5%"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="holdType">Hold Type</Label>
                            <Select value={form.holdType} onValueChange={(v) => setForm({ ...form, holdType: v })}>
                                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Variance">Variance</SelectItem>
                                    <SelectItem value="Matching">Matching</SelectItem>
                                    <SelectItem value="Tax">Tax</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="active">Status</Label>
                            <Select value={form.active} onValueChange={(v) => setForm({ ...form, active: v })}>
                                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Active</SelectItem>
                                    <SelectItem value="false">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={() => createMutation.mutate(form)}>Save Rule</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
