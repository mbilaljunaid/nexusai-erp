import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, QrCode, Barcode } from "lucide-react";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function LotSerialManager() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("lots");
    const [lotPage, setLotPage] = useState(1);
    const [serialPage, setSerialPage] = useState(1);
    const [pageSize] = useState(25);
    const [search, setSearch] = useState("");
    const [createOpen, setCreateOpen] = useState(false);

    // Queries
    const { data: lotsData, isLoading: lotsLoading } = useQuery({
        queryKey: ["/api/inventory/lots", lotPage, pageSize, search],
        queryFn: () => api.inventory.lots.list({ limit: pageSize, offset: (lotPage - 1) * pageSize, search })
    });

    const { data: serialsData, isLoading: serialsLoading } = useQuery({
        queryKey: ["/api/inventory/serials", serialPage, pageSize, search],
        queryFn: () => api.inventory.serials.list({ limit: pageSize, offset: (serialPage - 1) * pageSize, search })
    });

    const { data: items = [] } = useQuery({
        queryKey: ["/api/inventory/items"],
        queryFn: () => api.inventory.products.list().then(res => res.data || [])
    });

    // Mutations
    const createLotMutation = useMutation({
        mutationFn: (data: any) => api.inventory.lots.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/inventory/lots"] });
            setCreateOpen(false);
            toast({ title: "Lot created successfully" });
        }
    });

    const createSerialMutation = useMutation({
        mutationFn: (data: any) => api.inventory.serials.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/inventory/serials"] });
            setCreateOpen(false);
            toast({ title: "Serial created successfully" });
        }
    });

    // Form State
    const [newItemId, setNewItemId] = useState("");
    const [newNumber, setNewNumber] = useState("");
    const [newQty, setNewQty] = useState("0");

    const handleCreate = () => {
        if (!newItemId || !newNumber) return;

        const payload = {
            inventoryId: newItemId,
            quantity: parseFloat(newQty)
        };

        if (activeTab === "lots") {
            createLotMutation.mutate({ ...payload, lotNumber: newNumber });
        } else {
            createSerialMutation.mutate({ ...payload, serialNumber: newNumber });
        }
    };

    // Columns
    const lotColumns: Column<any>[] = [
        { header: "Lot Number", accessorKey: "lotNumber", cell: (val) => <span className="font-mono font-bold">{val}</span> },
        { header: "Item", accessorKey: "item", cell: (item) => item?.itemName || "Unknown" },
        { header: "Status", accessorKey: "status", cell: (status) => <Badge variant={status === "Active" ? "default" : "secondary"}>{status}</Badge> },
        { header: "Expiration", accessorKey: "expirationDate", cell: (date) => date ? new Date(date).toLocaleDateString() : "-" },
        { header: "Quantity", accessorKey: "quantity", className: "text-right", cell: (q) => <span className="font-mono">{q}</span> },
    ];

    const serialColumns: Column<any>[] = [
        { header: "Serial Number", accessorKey: "serialNumber", cell: (val) => <span className="font-mono font-bold text-blue-600">{val}</span> },
        { header: "Item", accessorKey: "item", cell: (item) => item?.itemName || "Unknown" },
        { header: "Status", accessorKey: "status", cell: (status) => <Badge variant="outline">{status}</Badge> },
        { header: "Current Locator", accessorKey: "currentLocatorId", cell: (loc) => loc || "Unassigned" },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-muted/20 p-4 rounded-lg border">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Lot & Serial Operations</h2>
                    <p className="text-sm text-muted-foreground">Manage granular inventory tracking and expiration.</p>
                </div>

                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create {activeTab === "lots" ? "Lot" : "Serial"}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New {activeTab === "lots" ? "Lot" : "Serial"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Select Item</Label>
                                <Select value={newItemId} onValueChange={setNewItemId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose item..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {items.map((i: any) => (
                                            <SelectItem key={i.id} value={i.id}>{i.itemName} ({i.sku})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>{activeTab === "lots" ? "Lot Number" : "Serial Number"}</Label>
                                <Input value={newNumber} onChange={(e) => setNewNumber(e.target.value)} placeholder={activeTab === "lots" ? "L-2024-001" : "SN-99999"} />
                            </div>
                            {activeTab === "lots" && (
                                <div className="space-y-2">
                                    <Label>Quantity</Label>
                                    <Input type="number" value={newQty} onChange={(e) => setNewQty(e.target.value)} />
                                </div>
                            )}
                            <Button className="w-full" onClick={handleCreate} disabled={!newItemId || !newNumber}>
                                Create Record
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="lots" className="flex items-center gap-2">
                        <Barcode className="h-4 w-4" /> Lot Control
                    </TabsTrigger>
                    <TabsTrigger value="serials" className="flex items-center gap-2">
                        <QrCode className="h-4 w-4" /> Serial Tracking
                    </TabsTrigger>
                </TabsList>

                <div className="mt-4 flex items-center gap-2 mb-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={`Search ${activeTab}...`}
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <TabsContent value="lots" className="mt-0">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Active Lots</CardTitle>
                            <CardDescription>Expiration and quantity tracking by lot.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <StandardTable
                                data={lotsData?.data || []}
                                columns={lotColumns}
                                isLoading={lotsLoading}
                                page={lotPage}
                                pageSize={pageSize}
                                totalItems={lotsData?.total || 0}
                                onPageChange={setLotPage}
                                filterColumn="lotNumber"
                                filterPlaceholder="Filter lots..."
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="serials" className="mt-0">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Serial Registry</CardTitle>
                            <CardDescription>Individual unit tracking and lifecycle.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <StandardTable
                                data={serialsData?.data || []}
                                columns={serialColumns}
                                isLoading={serialsLoading}
                                page={serialPage}
                                pageSize={pageSize}
                                totalItems={serialsData?.total || 0}
                                onPageChange={setSerialPage}
                                filterColumn="serialNumber"
                                filterPlaceholder="Filter serials..."
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
