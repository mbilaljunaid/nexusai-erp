import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SupplierSiteManagerProps {
    supplierId: string;
    supplierName: string;
}

export function SupplierSiteManager({ supplierId, supplierName }: SupplierSiteManagerProps) {
    const { toast } = useToast();
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [newSite, setNewSite] = useState<any>({
        siteName: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        isPurchasing: true,
        isPay: true
    });

    const { data: sites = [], isLoading } = useQuery({
        queryKey: ["/api/procurement/suppliers/sites", supplierId],
        queryFn: () => api.procurement.suppliers.sites.list(supplierId),
        enabled: !!supplierId
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.procurement.suppliers.sites.create(supplierId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/procurement/suppliers/sites", supplierId] });
            setIsCreating(false);
            setNewSite({
                siteName: "",
                address: "",
                city: "",
                state: "",
                postalCode: "",
                country: "",
                isPurchasing: true,
                isPay: true
            });
            toast({ title: "Site created successfully" });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (siteId: string) => api.procurement.suppliers.sites.delete(siteId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/procurement/suppliers/sites", supplierId] });
            toast({ title: "Site deleted" });
        }
    });

    const columns: Column<any>[] = [
        { header: "Site Name", accessorKey: "siteName", cell: (val) => <span className="font-semibold">{val}</span> },
        {
            header: "Purchasing",
            accessorKey: "isPurchasing",
            cell: (val) => val ? <Badge variant="default" className="bg-green-600">YES</Badge> : <Badge variant="outline">NO</Badge>
        },
        {
            header: "Pay Site",
            accessorKey: "isPay",
            cell: (val) => val ? <Badge variant="default" className="bg-blue-600">YES</Badge> : <Badge variant="outline">NO</Badge>
        },
        {
            header: "Location",
            accessorKey: "city",
            cell: (val, row) => <span className="text-sm text-muted-foreground">{[row.city, row.state, row.country].filter(Boolean).join(", ") || "-"}</span>
        },
        {
            header: "",
            accessorKey: "id",
            cell: (id) => (
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">Sites for {supplierName}</h3>
                    <p className="text-sm text-muted-foreground">Manage purchasing and payment locations.</p>
                </div>
                {!isCreating && (
                    <Button size="sm" onClick={() => setIsCreating(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Add Site
                    </Button>
                )}
            </div>

            {isCreating && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm">New Site Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Site Name *</Label>
                                <Input
                                    value={newSite.siteName}
                                    onChange={(e) => setNewSite({ ...newSite, siteName: e.target.value })}
                                    placeholder="e.g. HEADQUARTERS"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Address</Label>
                                <Input
                                    value={newSite.address}
                                    onChange={(e) => setNewSite({ ...newSite, address: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>City</Label>
                                <Input
                                    value={newSite.city}
                                    onChange={(e) => setNewSite({ ...newSite, city: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Country</Label>
                                <Input
                                    value={newSite.country}
                                    onChange={(e) => setNewSite({ ...newSite, country: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-6 pt-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="purchasing"
                                    checked={newSite.isPurchasing}
                                    onCheckedChange={(c) => setNewSite({ ...newSite, isPurchasing: c === true })}
                                />
                                <Label htmlFor="purchasing">Purchasing Site</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="pay"
                                    checked={newSite.isPay}
                                    onCheckedChange={(c) => setNewSite({ ...newSite, isPay: c === true })}
                                />
                                <Label htmlFor="pay">Pay Site</Label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>Cancel</Button>
                            <Button size="sm" onClick={() => createMutation.mutate(newSite)} disabled={!newSite.siteName}>
                                <Check className="h-4 w-4 mr-2" /> Save Site
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="border rounded-md">
                <StandardTable
                    data={sites}
                    columns={columns}
                    isLoading={isLoading}
                    totalItems={sites.length} // Client-side pagination for sub-list usually fine, or implement server-side if needed
                    page={1}
                    onPageChange={() => { }}
                    isVirtualized={false}
                />
            </div>
        </div>
    );
}
