import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription
} from "@/components/ui/sheet";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Library } from "lucide-react";
import { StandardTable, Column } from "../tables/StandardTable";
import { CostCode } from "@shared/schema";

export default function ConstructionCostCodeLibrary() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingCode, setEditingCode] = useState<CostCode | null>(null);

    const { data: costCodes = [], isLoading } = useQuery<CostCode[]>({
        queryKey: ["construction-cost-codes"],
        queryFn: async () => {
            const res = await fetch("/api/construction/cost-codes");
            if (!res.ok) throw new Error("Failed to fetch cost codes");
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/construction/cost-codes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["construction-cost-codes"] });
            setIsAddOpen(false);
            toast({ title: "Success", description: "Cost code added to library." });
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => {
            const res = await fetch(`/api/construction/cost-codes/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["construction-cost-codes"] });
            setEditingCode(null);
            toast({ title: "Success", description: "Cost code updated." });
        }
    });

    const columns: Column<CostCode>[] = [
        { header: "Code", accessorKey: "code", sortable: true },
        { header: "Name", accessorKey: "name", sortable: true },
        { header: "Category", accessorKey: "category", sortable: true },
        { header: "Description", accessorKey: "description" },
    ];

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            code: formData.get("code"),
            name: formData.get("name"),
            category: formData.get("category"),
            description: formData.get("description"),
        };

        if (editingCode) {
            updateMutation.mutate({ id: editingCode.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <Breadcrumbs items={[
                { label: "ERP", path: "/erp" },
                { label: "Construction", path: "/construction/insights" },
                { label: "Cost Codes", path: "/construction/cost-codes" }
            ]} />
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cost Code Library</h1>
                    <p className="text-muted-foreground">Manage standard CSI MasterFormat and regional cost codes.</p>
                </div>

                <Sheet open={isAddOpen || !!editingCode} onOpenChange={(open) => {
                    if (!open) {
                        setIsAddOpen(false);
                        setEditingCode(null);
                    }
                }}>
                    <SheetTrigger asChild>
                        <Button onClick={() => setIsAddOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Cost Code
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                        <SheetHeader>
                            <SheetTitle>{editingCode ? "Edit Cost Code" : "Add New Cost Code"}</SheetTitle>
                            <SheetDescription>Configure a standard cost code for use across the enterprise.</SheetDescription>
                        </SheetHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div className="grid gap-2">
                                <Label htmlFor="code">Code</Label>
                                <Input id="code" name="code" defaultValue={editingCode?.code || ""} placeholder="e.g. 03-30-00" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" defaultValue={editingCode?.name || ""} placeholder="e.g. Cast-in-Place Concrete" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="category">Category</Label>
                                <Input id="category" name="category" defaultValue={editingCode?.category || ""} placeholder="e.g. Division 03" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Input id="description" name="description" defaultValue={editingCode?.description || ""} />
                            </div>
                            <SheetFooter className="pt-4">
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full">
                                    {editingCode ? "Update" : "Create"}
                                </Button>
                            </SheetFooter>
                        </form>
                    </SheetContent>
                </Sheet>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Library className="h-5 w-5 text-primary" />
                        <CardTitle>Master Cost Codes</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <StandardTable
                        data={costCodes}
                        columns={columns}
                        isLoading={isLoading}
                        actions={(item: CostCode) => (
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingCode(item)}>
                                    <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        )}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
