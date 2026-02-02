import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Plus, Trash2, MapPin, Building2, Search } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { api } from "@/lib/api";
import { SupplierSiteManager } from "./SupplierSiteManager";

export function SupplierManager() {
    const { toast } = useToast();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
    const [newSupplier, setNewSupplier] = useState({ supplierName: "", supplierNumber: "" });

    // Using the new API client method
    const { data: suppliers = [], isLoading: supLoading } = useQuery<any[]>({
        queryKey: ["/api/procurement/suppliers"],
        queryFn: () => api.procurement.suppliers.list().then(res => Array.isArray(res) ? res : res.data || [])
    });

    const createSupplierMutation = useMutation({
        mutationFn: (data: any) => api.procurement.suppliers.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/procurement/suppliers"] });
            setNewSupplier({ supplierName: "", supplierNumber: "" });
            toast({ title: "Supplier created" });
        }
    });

    const deleteSupplierMutation = useMutation({
        mutationFn: (id: string) => api.procurement.suppliers.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/procurement/suppliers"] });
            toast({ title: "Supplier deleted" });
        }
    });

    const columns: Column<any>[] = [
        {
            header: "Supplier Name",
            accessorKey: "supplierName",
            cell: (val) => <span className="font-semibold">{val}</span>
        },
        { header: "Number", accessorKey: "supplierNumber" },
        {
            header: "Sites",
            accessorKey: "sites",
            cell: (sites) => <div className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" /> {sites?.length || 0} Sites</div>
        },
        {
            header: "Actions",
            accessorKey: "id",
            cell: (id, row) => (
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedSupplier(row)}>
                        Manage Sites
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteSupplierMutation.mutate(id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    // Client-side search filtering until backend supports it
    const filteredSuppliers = suppliers.filter((s: any) =>
        s.supplierName?.toLowerCase().includes(search.toLowerCase()) ||
        s.supplierNumber?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Create Card */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-primary" /> New Supplier
                        </CardTitle>
                        <CardDescription>Register a new vendor entity.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                placeholder="Supplier Name"
                                value={newSupplier.supplierName}
                                onChange={(e) => setNewSupplier({ ...newSupplier, supplierName: e.target.value })}
                            />
                            <Input
                                placeholder="Supplier Number (Optional)"
                                value={newSupplier.supplierNumber}
                                onChange={(e) => setNewSupplier({ ...newSupplier, supplierNumber: e.target.value })}
                            />
                        </div>
                        <Button
                            disabled={createSupplierMutation.isPending || !newSupplier.supplierName}
                            className="w-full"
                            onClick={() => createSupplierMutation.mutate(newSupplier)}
                        >
                            <Plus className="w-4 h-4 mr-2" /> Create Supplier
                        </Button>
                    </CardContent>
                </Card>

                {/* List Card */}
                <Card className="md:col-span-2">
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-base">Supplier Directory</CardTitle>
                            <div className="relative w-48">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pl-8 h-9"
                                    placeholder="Search..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="border-t">
                            <StandardTable
                                data={filteredSuppliers}
                                columns={columns}
                                isLoading={supLoading}
                                page={page}
                                pageSize={10}
                                totalItems={filteredSuppliers.length}
                                onPageChange={setPage}
                                isVirtualized={false}
                                className="border-0 rounded-none shadow-none"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sites Management Sheet */}
            <Sheet open={!!selectedSupplier} onOpenChange={(open) => !open && setSelectedSupplier(null)}>
                <SheetContent className="sm:max-w-xl w-full overflow-y-auto">
                    <SheetHeader className="pb-6 border-b mb-6">
                        <SheetTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            {selectedSupplier?.supplierName}
                        </SheetTitle>
                        <SheetDescription>
                            Manage purchasing and payment sites.
                        </SheetDescription>
                    </SheetHeader>

                    {selectedSupplier && (
                        <SupplierSiteManager
                            supplierId={selectedSupplier.id}
                            supplierName={selectedSupplier.supplierName}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
