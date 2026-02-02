import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { StandardTable, type Column } from "@/components/ui/StandardTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

interface Asset {
    id: string;
    assetName: string;
    category: "Equipment" | "Furniture" | "Technology";
    cost: string;
    status: "active" | "inactive";
    purchaseDate?: string;
}

export default function FixedAssets() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [newAsset, setNewAsset] = useState<Partial<Asset>>({ assetName: "", category: "Equipment", cost: "", status: "active" });

    const { data: assets = [], isLoading } = useQuery<Asset[]>({
        queryKey: ["/api/fa/assets"],
        queryFn: () => fetch("/api/fa/assets").then(r => r.json()).catch(() => []),
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => fetch("/api/fa/assets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/fa/assets"] });
            setIsSheetOpen(false);
            setNewAsset({ assetName: "", category: "Equipment", cost: "", status: "active" });
            toast({ title: "Asset created" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => fetch(`/api/fa/assets/${id}`, { method: "DELETE" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/fa/assets"] });
            toast({ title: "Asset deleted" });
        },
    });

    const columns: Column<Asset>[] = [
        { header: "Asset Name", accessorKey: "assetName", cell: (row) => <span className="font-semibold">{row.assetName}</span> },
        { header: "Category", accessorKey: "category" },
        { header: "Cost", accessorKey: "cost", cell: (row) => <span>${parseFloat(row.cost || "0").toLocaleString()}</span> },
        { header: "Status", accessorKey: "status", cell: (row) => <Badge variant={row.status === "active" ? "default" : "secondary"}>{row.status}</Badge> },
        {
            header: "Actions", id: "actions", cell: (row) => (
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(row.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
            )
        }
    ];

    return (
        <StandardPage
            title="Fixed Asset Management"
            description="Track and manage corporate assets, depreciation, and lifecycle."
            breadcrumbs={[{ label: "Finance", href: "/finance" }, { label: "Fixed Assets" }]}
            actions={
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Add Asset</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader><SheetTitle>Add Fixed Asset</SheetTitle></SheetHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Asset Name</Label>
                                <Input value={newAsset.assetName} onChange={(e) => setNewAsset({ ...newAsset, assetName: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={newAsset.category} onValueChange={(v: any) => setNewAsset({ ...newAsset, category: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Equipment">Equipment</SelectItem>
                                        <SelectItem value="Furniture">Furniture</SelectItem>
                                        <SelectItem value="Technology">Technology</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Cost</Label>
                                <Input type="number" value={newAsset.cost} onChange={(e) => setNewAsset({ ...newAsset, cost: e.target.value })} />
                            </div>
                            <Button onClick={() => createMutation.mutate(newAsset)} className="w-full">Save Asset</Button>
                        </div>
                    </SheetContent>
                </Sheet>
            }
        >
            <StandardTable
                data={assets}
                columns={columns}
                isLoading={isLoading}
                keyExtractor={(item) => item.id || Math.random().toString()}
                filterColumn="assetName"
                filterPlaceholder="Search assets..."
            />
        </StandardPage>
    );
}
